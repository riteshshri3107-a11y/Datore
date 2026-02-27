import { create } from "zustand";
export const useAuthStore = create<any>((set: any) => ({
  user: null, profile: null, wallet: null, isLoggedIn: false, isLoading: true,
  setUser: (user: any) => set({ user, isLoggedIn: !!user }),
  setProfile: (profile: any) => set({ profile }),
  setWallet: (wallet: any) => set({ wallet }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
  logout: () => set({ user: null, profile: null, wallet: null, isLoggedIn: false }),
}));
