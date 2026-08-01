import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  dailyAttempts: number;
  refreshUserData: () => Promise<void>;
  lang: 'en' | 'ar';
  setLang: (l: 'en' | 'ar') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DAILY_LIMIT = 5;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dailyAttempts, setDailyAttempts] = useState(DAILY_LIMIT);
  const [lang, setLangState] = useState<'en' | 'ar'>(() => {
    const saved = localStorage.getItem('readme_studio_lang');
    return (saved === 'en' || saved === 'ar') ? saved : 'ar';
  });

  const setLang = (l: 'en' | 'ar') => {
    setLangState(l);
    localStorage.setItem('readme_studio_lang', l);
  };

  const refreshUserData = async (currentUser: User = user!) => {
    if (!currentUser) return;
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);
      
      const now = new Date();
      const today = now.toISOString().split('T')[0];

      if (userSnap.exists()) {
        const data = userSnap.data();
        if (data.lastResetDate !== today) {
          // Reset daily attempts
          await setDoc(userRef, {
            dailyAttempts: DAILY_LIMIT,
            lastResetDate: today
          }, { merge: true });
          setDailyAttempts(DAILY_LIMIT);
        } else {
          setDailyAttempts(data.dailyAttempts);
        }
      } else {
        // New user
        await setDoc(userRef, {
          displayName: currentUser.displayName,
          email: currentUser.email,
          photoURL: currentUser.photoURL,
          dailyAttempts: DAILY_LIMIT,
          lastResetDate: today,
          createdAt: serverTimestamp()
        });
        setDailyAttempts(DAILY_LIMIT);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

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
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
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
