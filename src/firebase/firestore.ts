import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from './config';
import { Child, ChatMessage, Parent, Subscription } from '../types';
import { generateAccessCode } from './auth';

// ===== CHILDREN MANAGEMENT =====

// Add a new child
export const addChild = async (
  parentId: string,
  childData: Omit<Child, 'id' | 'parentId' | 'accessCode' | 'createdAt' | 'updatedAt'>
): Promise<Child> => {
  try {
    const childRef = doc(collection(db, 'children'));
    const accessCode = generateAccessCode();

    const newChild: Child = {
      id: childRef.id,
      parentId,
      ...childData,
      accessCode,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(childRef, {
      ...newChild,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Update parent's childrenIds array
    const parentRef = doc(db, 'users', parentId);
    const parentDoc = await getDoc(parentRef);
    
    if (parentDoc.exists()) {
      const parentData = parentDoc.data() as Parent;
      await updateDoc(parentRef, {
        childrenIds: [...(parentData.childrenIds || []), childRef.id],
        updatedAt: serverTimestamp(),
      });
    }

    return newChild;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to add child');
  }
};

// Get all children for a parent
export const getChildren = async (parentId: string): Promise<Child[]> => {
  try {
    const q = query(
      collection(db, 'children'),
      where('parentId', '==', parentId)
      // Note: orderBy removed to avoid index requirement
      // Children will be in insertion order or can be sorted client-side
    );

    const querySnapshot = await getDocs(q);
    const children: Child[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      children.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Child);
    });

    // Sort client-side by createdAt descending (newest first)
    children.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return children;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get children');
  }
};

// Get a single child by ID
export const getChild = async (childId: string): Promise<Child | null> => {
  try {
    const childDoc = await getDoc(doc(db, 'children', childId));
    
    if (!childDoc.exists()) {
      return null;
    }

    const data = childDoc.data();
    return {
      id: childDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Child;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get child');
  }
};

// Update a child
export const updateChild = async (
  childId: string,
  updates: Partial<Omit<Child, 'id' | 'parentId' | 'accessCode' | 'createdAt'>>
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'children', childId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update child');
  }
};

// Delete a child
export const deleteChild = async (childId: string, parentId: string): Promise<void> => {
  try {
    // Delete child document
    await deleteDoc(doc(db, 'children', childId));

    // Update parent's childrenIds array
    const parentRef = doc(db, 'users', parentId);
    const parentDoc = await getDoc(parentRef);
    
    if (parentDoc.exists()) {
      const parentData = parentDoc.data() as Parent;
      const updatedChildrenIds = parentData.childrenIds.filter(id => id !== childId);
      
      await updateDoc(parentRef, {
        childrenIds: updatedChildrenIds,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to delete child');
  }
};

// Verify access code
export const verifyAccessCode = async (accessCode: string): Promise<Child | null> => {
  try {
    const q = query(
      collection(db, 'children'),
      where('accessCode', '==', accessCode.toUpperCase()),
      limit(1)
    );

    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Child;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to verify access code');
  }
};

// ===== CHAT MANAGEMENT =====

// Send a chat message
export const sendMessage = async (
  messageData: Omit<ChatMessage, 'id' | 'timestamp' | 'read'>
): Promise<ChatMessage> => {
  try {
    const messageRef = doc(collection(db, 'messages'));

    const newMessage: ChatMessage = {
      id: messageRef.id,
      ...messageData,
      timestamp: new Date(),
      read: false,
    };

    await setDoc(messageRef, {
      ...newMessage,
      timestamp: serverTimestamp(),
    });

    return newMessage;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to send message');
  }
};

// Get messages for a chat (between parent and specific child)
export const getMessages = async (
  parentId: string,
  childId: string,
  limitCount: number = 50
): Promise<ChatMessage[]> => {
  try {
    const q = query(
      collection(db, 'messages'),
      where('parentId', '==', parentId),
      where('childId', '==', childId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const messages: ChatMessage[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate() || new Date(),
      } as ChatMessage);
    });

    return messages.reverse(); // Reverse to show oldest first
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get messages');
  }
};

// Listen to real-time messages
export const listenToMessages = (
  parentId: string,
  childId: string,
  callback: (messages: ChatMessage[]) => void
): (() => void) => {
  const q = query(
    collection(db, 'messages'),
    where('parentId', '==', parentId),
    where('childId', '==', childId),
    orderBy('timestamp', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages: ChatMessage[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate() || new Date(),
      } as ChatMessage);
    });
    callback(messages);
  });
};

// Mark message as read
export const markMessageAsRead = async (messageId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'messages', messageId), {
      read: true,
    });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to mark message as read');
  }
};

// Get unread message count
export const getUnreadCount = async (userId: string): Promise<number> => {
  try {
    const q = query(
      collection(db, 'messages'),
      where('receiverId', '==', userId),
      where('read', '==', false)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error: any) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};

// ===== SUBSCRIPTION MANAGEMENT =====

// Create or update subscription
export const updateSubscription = async (
  userId: string,
  subscriptionData: Partial<Subscription>
): Promise<void> => {
  try {
    const subscriptionRef = doc(db, 'subscriptions', userId);
    
    await setDoc(subscriptionRef, {
      ...subscriptionData,
      userId,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    // Also update user's subscription status
    await updateDoc(doc(db, 'users', userId), {
      subscriptionStatus: subscriptionData.plan || 'free',
      subscriptionEndDate: subscriptionData.endDate || null,
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update subscription');
  }
};

// Get subscription
export const getSubscription = async (userId: string): Promise<Subscription | null> => {
  try {
    const subscriptionDoc = await getDoc(doc(db, 'subscriptions', userId));
    
    if (!subscriptionDoc.exists()) {
      return null;
    }

    const data = subscriptionDoc.data();
    return {
      id: subscriptionDoc.id,
      ...data,
      startDate: data.startDate?.toDate() || new Date(),
      endDate: data.endDate?.toDate() || undefined,
    } as Subscription;
  } catch (error: any) {
    console.error('Error getting subscription:', error);
    return null;
  }
};
