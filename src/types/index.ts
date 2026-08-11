// User roles
export type UserRole = 'parent' | 'student';

// User interface
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// Parent interface
export interface Parent extends User {
  role: 'parent';
  subscriptionStatus: 'free' | 'premium' | 'trial';
  subscriptionEndDate?: Date;
  childrenIds: string[];
}

// Child/Student interface
export interface Child {
  id: string;
  parentId: string;
  name: string;
  age: number;
  grade?: string;
  gender?: 'male' | 'female';
  avatar?: string;
  accessCode: string;
  createdAt: Date;
  updatedAt: Date;
}

// Student interface (when child logs in)
export interface Student extends User {
  role: 'student';
  childId: string;
  parentId: string;
}

// Chat Message interface
export interface ChatMessage {
  id: string;
  senderId: string;
  senderRole: UserRole;
  receiverId: string;
  message: string;
  timestamp: Date;
  read: boolean;
  parentId: string; // For filtering parent's chats
  childId: string;   // For filtering which child the chat is about
}

// Subscription interface
export interface Subscription {
  id: string;
  userId: string;
  plan: 'free' | 'premium' | 'trial';
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'expired' | 'cancelled';
  price?: number;
  currency?: string;
}
