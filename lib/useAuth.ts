/* ═══════════════════════════════════════════════════════════════
   useAuth — React Hook for Auth State Management
   ═══════════════════════════════════════════════════════════════
   Provides: user, session, loading, login, logout, permissions
   Listens to Supabase auth state changes in real-time
   ═══════════════════════════════════════════════════════════════ */
"use client";
import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { supabase } from './supabase';
import type { AuthUser, UserRole } from './auth';
import { getValidatedSession, hasPermission, secureSignOut } from './auth';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  isModerator: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthState>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  signOut: async () => {},
  refreshSession: async () => {},
  hasRole: () => false,
  isModerator: false,
  isAdmin: false,
});

export function useAuth(): AuthState {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const session = await getValidatedSession();
      setUser(session.user);
      setError(session.error);
    } catch (err: any) {
      setError(err.message);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession();

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await loadSession();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setError(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [loadSession]);

  const handleSignOut = useCallback(async () => {
    await secureSignOut();
    setUser(null);
  }, []);

  const hasRole = useCallback((role: UserRole) => hasPermission(user, role), [user]);

  const value: AuthState = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    signOut: handleSignOut,
    refreshSession: loadSession,
    hasRole,
    isModerator: hasPermission(user, 'moderator'),
    isAdmin: hasPermission(user, 'admin'),
  };

  // Use createElement to avoid JSX in .ts file
  const { createElement } = require('react');
  return createElement(AuthContext.Provider, { value }, children);
}
