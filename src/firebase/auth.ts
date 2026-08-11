import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  User as FirebaseUser,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';
import { User, UserRole, Parent, Student } from '../types';

// Google provider
const googleProvider = new GoogleAuthProvider();

// Generate random access code for children
export const generateAccessCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Helper function to convert Firebase errors to user-friendly messages
const getFriendlyErrorMessage = (error: any): string => {
  const errorCode = error.code;
  
  switch (errorCode) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password. Please try again.';
    
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please login instead.';
    
    case 'auth/weak-password':
      return 'Password is too weak. Please use a stronger password.';
    
    case 'auth/invalid-email':
      return 'Invalid email address. Please check and try again.';
    
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    
    case 'auth/popup-closed-by-user':
      return 'Sign-in cancelled. Please try again.';
    
    case 'auth/popup-blocked':
      return 'Popup was blocked. Please allow popups for this site.';
    
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email using a different sign-in method.';
    
    default:
      return error.message || 'An error occurred. Please try again.';
  }
};

// Register new user with email and password
export const registerWithEmail = async (
  email: string,
  password: string,
  role: UserRole,
  displayName?: string
): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Create user document in Firestore
    const userData: Partial<User> & { role: UserRole } = {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName: displayName || email.split('@')[0],
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add parent-specific fields
    if (role === 'parent') {
      (userData as any).subscriptionStatus = 'free';
      (userData as any).childrenIds = [];
    }

    await setDoc(doc(db, 'users', firebaseUser.uid), {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return userData as User;
  } catch (error: any) {
    throw new Error(getFriendlyErrorMessage(error));
  }
};

// Login with email and password
export const loginWithEmail = async (
  email: string,
  password: string
): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    if (!userDoc.exists()) {
      throw new Error('User data not found. Please contact support.');
    }

    const userData = userDoc.data() as User;
    
    return {
      ...userData,
      createdAt: userData.createdAt instanceof Date ? userData.createdAt : new Date(userData.createdAt),
      updatedAt: userData.updatedAt instanceof Date ? userData.updatedAt : new Date(userData.updatedAt),
    };
  } catch (error: any) {
    throw new Error(getFriendlyErrorMessage(error));
  }
};

// Login with Google
export const loginWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;

    // Check if user exists in Firestore
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      // Create new user document for Google sign-in
      const userData: Partial<Parent> = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName || firebaseUser.email!.split('@')[0],
        role: 'parent', // Default to parent
        subscriptionStatus: 'free',
        childrenIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(userDocRef, {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return userData as User;
    }

    const userData = userDoc.data() as User;
    return {
      ...userData,
      createdAt: userData.createdAt instanceof Date ? userData.createdAt : new Date(userData.createdAt),
      updatedAt: userData.updatedAt instanceof Date ? userData.updatedAt : new Date(userData.updatedAt),
    };
  } catch (error: any) {
    throw new Error(getFriendlyErrorMessage(error));
  }
};

// Logout
export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message || 'Logout failed');
  }
};

// Reset password
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw new Error(getFriendlyErrorMessage(error));
  }
};

// Update password
export const changePassword = async (newPassword: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user logged in');
    }
    await updatePassword(user, newPassword);
  } catch (error: any) {
    throw new Error(error.message || 'Password update failed');
  }
};

// Get current user
export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

// Auth state observer
export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Get user data from Firestore
export const getUserData = async (uid: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    
    if (!userDoc.exists()) {
      return null;
    }

    const userData = userDoc.data() as User;
    return {
      ...userData,
      createdAt: userData.createdAt instanceof Date ? userData.createdAt : new Date(userData.createdAt),
      updatedAt: userData.updatedAt instanceof Date ? userData.updatedAt : new Date(userData.updatedAt),
    };
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};
