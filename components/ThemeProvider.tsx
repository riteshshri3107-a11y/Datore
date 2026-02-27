"use client";
import { useEffect } from 'react';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const theme = getTheme(isDark, glassLevel, accentColor);

  useEffect(() => {
    const saved = localStorage.getItem('datore-theme');
    if (saved === 'light') useThemeStore.setState({ isDark: false });
  }, []);

  return (
    <div style={{ background: theme.bg, color: theme.text, minHeight: '100vh', transition: 'all 0.4s ease' }}>
      {children}
    </div>
  );
}
