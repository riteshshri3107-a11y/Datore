import { create } from "zustand";
type ThemeStore = { isDark: boolean; toggle: () => void; set: (dark: boolean) => void };
export const useThemeStore = create<ThemeStore>((set) => ({
  isDark: true,
  toggle: () => set((s) => {
    const next = !s.isDark;
    if (typeof window !== "undefined") localStorage.setItem("datore-theme", next ? "dark" : "light");
    return { isDark: next };
  }),
  set: (dark: boolean) => set({ isDark: dark }),
}));
