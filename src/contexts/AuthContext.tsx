import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, signInWithGoogle, logout } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Fallback timeout in case Firebase Auth is blocked by network/extensions
    const timeout = setTimeout(() => {
      if (isMounted && loading) {
        console.warn("Firebase Auth timeout. Proceeding without user.");
        setLoading(false);
      }
    }, 5000);

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!isMounted) return;
      clearTimeout(timeout);
      setUser(currentUser);
      setLoading(false);
    }, (error) => {
      console.error("Auth error:", error);
      if (isMounted) {
        clearTimeout(timeout);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      unsubscribe();
    };
  }, [loading]);

  const signIn = async () => {
    await signInWithGoogle();
  };

  const signOut = async () => {
    await logout();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
