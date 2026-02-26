import { create } from "zustand";
interface AuthState {
  user: any; profile: any; wallet: any;
  isLoggedIn: boolean; isLoading: boolean;
  setUser: (u: any) => void; setProfile: (p: any) => void;
  setWallet: (w: any) => void; setLoading: (l: boolean) => void;
  logout: () => void;
}
export const useAuthStore = create<AuthState>((set) => ({
  user: null, profile: null, wallet: null, isLoggedIn: false, isLoading: true,
  setUser: (user) => set({ user, isLoggedIn: !!user }),
  setProfile: (profile) => set({ profile }),
  setWallet: (wallet) => set({ wallet }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, profile: null, wallet: null, isLoggedIn: false }),
}));
