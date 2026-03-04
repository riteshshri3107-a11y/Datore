"use client";
export const dynamic = "force-dynamic";
import { useThemeStore } from '@/store/useThemeStore';
import { useAuthStore } from '@/store/useAuthStore';
import { getTheme } from '@/lib/theme';
export default function MemoriesPage() {
  const { isDark } = useThemeStore();
  const { user } = useAuthStore();
  const t = getTheme(isDark);
  return (<div className="space-y-4 animate-fade-in"><h1 className="text-xl font-bold">📸 Memories</h1>
    <div className="text-center py-12 glass-card rounded-2xl" style={{ background: t.card, borderColor: t.cardBorder }}>
      <p className="text-3xl mb-3">📸</p><p style={{ color: t.textSecondary }}>No memories yet</p>
    </div></div>);
}
