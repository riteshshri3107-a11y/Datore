'use client';
import { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import { supabase, getProfile } from './supabase';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  trustScore: number;
  verified: boolean;
  avatarUrl: string | null;
}

interface AuthCtx {
  user: AuthUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx>({
  user: null, loading: true, signOut: async () => {}, refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (uid: string, email: string) => {
    try {
      const p = await getProfile(uid);
      setUser({
        id: uid, email,
        name: p?.full_name || email.split('@')[0],
        role: p?.role || 'user',
        trustScore: p?.trust_score || 50,
        verified: p?.is_verified || false,
        avatarUrl: p?.avatar_url || null,
      });
    } catch {
      setUser({ id: uid, email, name: email.split('@')[0], role: 'user', trustScore: 50, verified: false, avatarUrl: null });
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) loadProfile(session.user.id, session.user.email || '');
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadProfile(session.user.id, session.user.email || '');
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    // Clear user-scoped localStorage data to prevent leakage between users on shared devices
    if (typeof window !== 'undefined') {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('datore-')) keysToRemove.push(key);
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    }
    await supabase.auth.signOut();
    setUser(null);
  };
  const refreshProfile = async () => { if (user) await loadProfile(user.id, user.email); };

  return (
    <AuthContext.Provider value={{ user, loading, signOut: handleSignOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }
export default useAuth;
