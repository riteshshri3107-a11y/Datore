"use client";
import { create } from 'zustand';

interface ThemeState {
  isDark: boolean;
  glassLevel: 'subtle' | 'medium' | 'heavy';
  accentColor: string;
  toggle: () => void;
  setGlass: (level: 'subtle' | 'medium' | 'heavy') => void;
  setAccent: (color: string) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: true,
  glassLevel: 'medium',
  accentColor: '#6366f1',
  toggle: () => set((s) => {
    const next = !s.isDark;
    if (typeof window !== 'undefined') localStorage.setItem('datore-theme', next ? 'dark' : 'light');
    return { isDark: next };
  }),
  setGlass: (level) => set({ glassLevel: level }),
  setAccent: (color) => set({ accentColor: color }),
}));
