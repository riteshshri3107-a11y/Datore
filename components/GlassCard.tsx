"use client";
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';

export default function GlassCard({ children, className = '', onClick, style = {}, hover = true }: any) {
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  return (
    <div className={`glass-card rounded-2xl p-4 ${hover ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      style={{ background: t.card, borderColor: t.cardBorder, boxShadow: t.glassShadow, ...style }}>
      {children}
    </div>
  );
}
