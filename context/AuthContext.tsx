"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  User,
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { UserProfile } from "@/types";
import { DemoUser, getDemoSession, demoSignOut } from "@/lib/demo-auth";

// Check demo mode client-side only
const isFirebaseConfigured = () =>
  typeof window !== "undefined" &&
  !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "your_firebase_api_key" &&
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "placeholder";

interface AuthContextType {
  user: User | DemoUser | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isDemo: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  isDemo: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | DemoUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(true);

  useEffect(() => {
    const configured = isFirebaseConfigured();
    setIsDemo(!configured);

    if (!configured) {
      // Demo mode — read from localStorage
      const session = getDemoSession();
      if (session) {
        setUser(session);
        setProfile(session as unknown as UserProfile);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
      return;
    }

    // Real Firebase mode
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const docRef = doc(db, "users", firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          }
        } catch {
          // silently fail
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    if (!isFirebaseConfigured()) {
      demoSignOut();
      setUser(null);
      setProfile(null);
      // Force full page reload to clear all state
      window.location.replace("/auth/login");
      return;
    }
    await firebaseSignOut(auth);
    setUser(null);
    setProfile(null);
    window.location.replace("/auth/login");
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, isDemo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
