import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCY6QpD3D0608l5lQf4HcACHnTD9sofCyw",
  authDomain: "study-spark-b16c8.firebaseapp.com",
  projectId: "study-spark-b16c8",
  storageBucket: "study-spark-b16c8.firebasestorage.app",
  messagingSenderId: "82925949817",
  appId: "1:82925949817:web:f21c6e8cd9682301a9d5a8",
  measurementId: "G-MTKT9E9SD1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
