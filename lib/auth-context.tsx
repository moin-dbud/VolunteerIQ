'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword as fbUpdatePassword,
  deleteUser as fbDeleteUser,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User } from '@/lib/types';
import { useRouter } from 'next/navigation';

// ─── Types ────────────────────────────────────────────────────────────────────
interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, role: string) => Promise<{ uid: string; redirectPath: string }>;
  signIn: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (current: string, next: string) => Promise<void>;
  deleteAccount: (currentPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// ─── Cookie helpers (read by middleware) ──────────────────────────────────────
function setCookies(uid: string, role: string) {
  if (typeof document === 'undefined') return;
  const maxAge = 7 * 24 * 60 * 60;
  document.cookie = `viq_uid=${uid}; path=/; max-age=${maxAge}; SameSite=Lax`;
  document.cookie = `viq_role=${role}; path=/; max-age=${maxAge}; SameSite=Lax`;
}
function clearCookies() {
  if (typeof document === 'undefined') return;
  document.cookie = 'viq_uid=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = 'viq_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

// ─── Role cache (fallback when Firestore is blocked by ad-blocker) ────────────
const ROLE_KEY = 'viq_role_cache';
function cacheRole(uid: string, role: string) {
  try { localStorage.setItem(`${ROLE_KEY}_${uid}`, role); } catch {}
}
function getCachedRole(uid: string): string | null {
  try { return localStorage.getItem(`${ROLE_KEY}_${uid}`); } catch { return null; }
}

// ─── Retry helper (handles ERR_BLOCKED_BY_CLIENT on first channel open) ───────
async function withRetry<T>(fn: () => Promise<T>, attempts = 3, delayMs = 800): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try { return await fn(); } catch (err: any) {
      lastErr = err;
      const transient =
        err?.code === 'unavailable' ||
        String(err?.message).includes('ERR_BLOCKED_BY_CLIENT') ||
        String(err?.message).includes('Failed to fetch') ||
        String(err?.message).toLowerCase().includes('network');
      if (!transient || i === attempts - 1) throw err;
      await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
    }
  }
  throw lastErr;
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]               = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading]         = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const snap = await withRetry(() => getDoc(doc(db, 'users', firebaseUser.uid)));
          if (snap.exists()) {
            const profile = snap.data() as User;
            setUserProfile(profile);
            cacheRole(firebaseUser.uid, profile.role);
            setCookies(firebaseUser.uid, profile.role);
          } else {
            // Race condition: doc not yet written—retry once after 1.5 s
            await new Promise((r) => setTimeout(r, 1500));
            const retry = await getDoc(doc(db, 'users', firebaseUser.uid)).catch(() => null);
            if (retry?.exists()) {
              const profile = retry.data() as User;
              setUserProfile(profile);
              cacheRole(firebaseUser.uid, profile.role);
              setCookies(firebaseUser.uid, profile.role);
            } else {
              // BUG FIX 3: Doc truly missing (setDoc failed at signup)—fall back to localStorage cache
              const cached = getCachedRole(firebaseUser.uid);
              if (cached) {
                setUserProfile({
                  uid: firebaseUser.uid, email: firebaseUser.email ?? '',
                  name: firebaseUser.displayName ?? '', role: cached as any, createdAt: '',
                });
                setCookies(firebaseUser.uid, cached);
              }
            }
          }
        } catch (err) {
          console.warn('[Auth] Firestore blocked—using cache', err);
          const cached = getCachedRole(firebaseUser.uid);
          if (cached) {
            setUserProfile({
              uid: firebaseUser.uid, email: firebaseUser.email ?? '',
              name: firebaseUser.displayName ?? '', role: cached as any, createdAt: '',
            });
            setCookies(firebaseUser.uid, cached);
          }
        }
      } else {
        setUserProfile(null);
        clearCookies();
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // ── signUp ─────────────────────────────────────────────────────────────────
  const signUp = async (
    email: string, password: string, name: string, role: string
  ): Promise<{ uid: string; redirectPath: string }> => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid  = cred.user.uid;

    // BUG FIX 1: Never write `undefined` to Firestore — it throws an error that
    // silently swallows the entire setDoc, leaving coordinators with no user doc.
    const userData: User = {
      uid, name, email,
      role: role as 'coordinator' | 'volunteer',
      createdAt: new Date().toISOString(),
      skills: [],
      ...(role === 'volunteer' && { availabilityStatus: 'available' as const }),
    };

    // Optimistic — so redirect works even if Firestore write is slow
    cacheRole(uid, role);
    setCookies(uid, role);
    setUserProfile(userData);

    try {
      await withRetry(() =>
        setDoc(doc(db, 'users', uid), { ...userData, createdAt: serverTimestamp() })
      );
    } catch (err) {
      console.error('[SignUp] setDoc failed — user will not persist in Firestore:', err);
    }

    // Return uid + destination so the signup page controls the redirect timing
    return { uid, redirectPath: role === 'volunteer' ? '/volunteer' : '/dashboard' };
  };

  // ── signIn ─────────────────────────────────────────────────────────────────
  const signIn = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const uid  = cred.user.uid;
    let role: string | null = null;

    try {
      const snap = await withRetry(() => getDoc(doc(db, 'users', uid)));
      if (snap.exists()) {
        const profile = snap.data() as User;
        setUserProfile(profile);
        role = profile.role;
        cacheRole(uid, role);
        setCookies(uid, role);
      } else {
        // BUG FIX 2: Doc missing (setDoc failed at signup)—fall back to localStorage cache
        role = getCachedRole(uid);
        if (role) {
          setUserProfile({ uid, email, name: cred.user.displayName ?? '', role: role as any, createdAt: '' });
          setCookies(uid, role);
        }
      }
    } catch (err) {
      console.warn('[SignIn] Firestore blocked—using cache', err);
      role = getCachedRole(uid);
      if (role) {
        setUserProfile({ uid, email, name: cred.user.displayName ?? '', role: role as any, createdAt: '' });
        setCookies(uid, role);
      }
    }

    router.push(role === 'volunteer' ? '/volunteer' : '/dashboard');
  };

  // ── logOut ─────────────────────────────────────────────────────────────────
  const logOut = async () => {
    await signOut(auth);
    setUserProfile(null);
    clearCookies();
    router.push('/login');
  };

  // ── updateProfile ──────────────────────────────────────────────────────────
  const updateProfile = async (data: Partial<User>) => {
    if (!user) throw new Error('Not authenticated');
    await updateDoc(doc(db, 'users', user.uid), { ...data, updatedAt: serverTimestamp() });
    setUserProfile((prev) => prev ? { ...prev, ...data } : prev);
    // Keep cookies in sync if role changes
    if (data.role) setCookies(user.uid, data.role);
  };

  // ── changePassword ─────────────────────────────────────────────────────────
  const changePassword = async (current: string, next: string) => {
    if (!user || !user.email) throw new Error('Not authenticated');
    const cred = EmailAuthProvider.credential(user.email, current);
    await reauthenticateWithCredential(user, cred);
    await fbUpdatePassword(user, next);
  };

  // ── deleteAccount ──────────────────────────────────────────────────────────
  const deleteAccount = async (currentPassword: string) => {
    if (!user || !user.email) throw new Error('Not authenticated');
    const cred = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, cred);
    await deleteDoc(doc(db, 'users', user.uid));
    await fbDeleteUser(user);
    clearCookies();
    setUserProfile(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{ user, userProfile, loading, signUp, signIn, logOut, updateProfile, changePassword, deleteAccount }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
