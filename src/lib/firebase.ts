import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

export const firebaseConfig = {
  apiKey: "AIzaSyCanRiUCjD-yliLR1Xxc0JzSzlI-ZNPZSg",
  authDomain: "luz-diaria-a3372.firebaseapp.com",
  projectId: "luz-diaria-a3372",
  storageBucket: "luz-diaria-a3372.firebasestorage.app",
  messagingSenderId: "64913070661",
  appId: "1:64913070661:web:8cc42560d3d8140513612c",
  measurementId: "G-P0BCWZMGCX",
  databaseURL: "https://luz-diaria-a3372-default-rtdb.firebaseio.com"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
    throw error;
  }
};
