import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDeFvirWNFdOWS_0YbOayPvX4DMCaxixBE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "readme-studio.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "readme-studio",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "readme-studio.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "537654097248",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:537654097248:web:0b4013f477c50c169b5a05",
};

// Initialize Firebase lazily to prevent SSR or build issues
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
