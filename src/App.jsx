// --- FIREBASE & APP CONFIG ---
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';

const getEnv = (key) => {
  // Supports both Vite (import.meta) and standard (process.env)
  return (typeof import.meta !== 'undefined' && import.meta.env?.[key]) || (typeof process !== 'undefined' && process.env?.[key]) || "";
};

const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY'),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('VITE_FIREBASE_APP_ID')
};

const apiKey = getEnv('VITE_GEMINI_API_KEY');
const GEMINI_MODEL = "gemini-2.0-flash"; // Stable 2026 production ID

// Prevent re-initialization errors on Netlify
const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const projectAppId = "kurumbas-kit-hub";