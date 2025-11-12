import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDSBCIVqMTqU8o4xCsTyVaMbpsnevpzVlg",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "hetchat-bc3ea.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "hetchat-bc3ea",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "hetchat-bc3ea.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "371455166331",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:371455166331:web:5da5e1d62954a679f55fde",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-V6C64K2MJF"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

