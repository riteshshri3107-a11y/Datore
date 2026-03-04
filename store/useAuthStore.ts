"use client";
import { create } from 'zustand';
import { signOut } from '@/lib/supabase';

interface AuthState {
  user: any | null;
  profile: any | null;
  isLoading: boolean;
  setUser: (user: any) => void;
  setProfile: (profile: any) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  performLogout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, profile: null }),
  performLogout: async () => {
    try {
      await signOut();
    } catch {}
    // Clear all auth-related storage
    try {
      localStorage.removeItem('sb-access-token');
      localStorage.removeItem('sb-refresh-token');
      sessionStorage.removeItem('auth_redirect');
      document.cookie.split(';').forEach(c => {
        const name = c.trim().split('=')[0];
        if (name.includes('supabase') || name.includes('sb-')) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        }
      });
    } catch {}
    set({ user: null, profile: null });
  },
}));
