import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Configuration Firebase (clés publiques, safe to commit)
const firebaseConfig = {
  apiKey: "AIzaSyA1AWyQt-mKcZTGJ1MaPrf4IoRxxCpRl8w",
  authDomain: "brewsy-6e24c.firebaseapp.com",
  projectId: "brewsy-6e24c",
  storageBucket: "brewsy-6e24c.firebasestorage.app",
  messagingSenderId: "965602953101",
  appId: "1:965602953101:web:50f84823c3a2db81da5fc4",
  measurementId: "G-9T8DY7JG9C"
};

// Initialisation Firebase
const app = initializeApp(firebaseConfig);

// Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
