import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  dailyAttempts: number;
  refreshUserData: (currentUser: User) => Promise<void>;
  lang: 'en' | 'ar';
  setLang: (lang: 'en' | 'ar') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dailyAttempts, setDailyAttempts] = useState(5);
  const [lang, setLang] = useState<'en' | 'ar'>('ar');

  const refreshUserData = async (currentUser: User) => {
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      const today = new Date().toISOString().split('T')[0];

      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.lastAttemptDate === today) {
          setDailyAttempts(data.remainingAttempts ?? 0);
        } else {
          // Reset daily attempts on new day
          await setDoc(userDocRef, {
            remainingAttempts: 5,
            lastAttemptDate: today,
            updatedAt: serverTimestamp()
          }, { merge: true });
          setDailyAttempts(5);
        }
      } else {
        // Create new user record
        await setDoc(userDocRef, {
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          remainingAttempts: 5,
          lastAttemptDate: today,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        setDailyAttempts(5);
      }
    } catch (error) {
      console.error("Error syncing user with Firestore:", error);
    }
  };

  useEffect(() => {
    // Detect system or browser language
    const savedLang = localStorage.getItem('language') as 'en' | 'ar' | null;
    if (savedLang) {
      setLang(savedLang);
    } else {
      const browserLang = navigator.language.startsWith('ar') ? 'ar' : 'en';
      setLang(browserLang);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('language', lang);
  }, [lang]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await refreshUserData(currentUser);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const isIframe = window.self !== window.top;
      if (isIframe) {
        console.log("In iframe: using redirect for sign-in");
        await signInWithRedirect(auth, googleProvider);
      } else {
        await signInWithPopup(auth, googleProvider);
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut, dailyAttempts, refreshUserData, lang, setLang }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
