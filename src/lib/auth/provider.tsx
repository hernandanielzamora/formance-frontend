'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { onIdTokenChanged, signOut, type User } from 'firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured } from '@/lib/firebase/client';
import { apiRequest } from '@/lib/api/client';

export type Identity = { uid: string; email: string | null; name: string | null; emailVerified: boolean; role: 'user' | 'admin' };
type AuthState = { user: User | null; identity: Identity | null; loading: boolean; error: string; refresh: () => Promise<void>; logout: () => Promise<void> };
const Context = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const generation = useRef(0);
  async function sync(current: User | null) {
    const id = ++generation.current;
    setLoading(true); setUser(current); setIdentity(null); setError('');
    try {
      if (current) {
        const result = await apiRequest<Identity>('auth/me', {}, getFirebaseAuth());
        if (generation.current === id) setIdentity(result);
      }
    } catch {
      if (generation.current === id) setError('No pudimos validar tu sesión con el servidor.');
    } finally { if (generation.current === id) setLoading(false); }
  }
  useEffect(() => {
    if (!isFirebaseConfigured()) { setError('El acceso todavía no está disponible.'); setLoading(false); return; }
    const unsubscribe = onIdTokenChanged(getFirebaseAuth(), (current) => { void sync(current); });
    return () => { unsubscribe(); generation.current++; };
  }, []);
  async function refresh() {
    const current = getFirebaseAuth().currentUser;
    if (current) { await current.reload(); await current.getIdToken(true); }
    await sync(getFirebaseAuth().currentUser);
  }
  return <Context.Provider value={{ user, identity, loading, error, refresh, logout: () => signOut(getFirebaseAuth()) }}>{children}</Context.Provider>;
}
export function useAuth() {
  const context = useContext(Context);
  if (!context) throw new Error('AuthProvider requerido.');
  return context;
}
