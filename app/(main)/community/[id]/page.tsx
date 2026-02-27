"use client";
export const dynamic = "force-dynamic";
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
export default function CommunityDetail() {
  const router = useRouter();
  const { isDark } = useThemeStore();
  const t = getTheme(isDark);
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3"><button onClick={() => router.back()}>←</button><h1 className="text-xl font-bold">Community</h1></div>
      <div className="glass-card rounded-2xl p-5 text-center" style={{ background: t.card, borderColor: t.cardBorder }}>
        <p className="text-3xl mb-2">🔧</p><h2 className="text-lg font-bold">Toronto Handyworkers</h2>
        <p className="text-sm" style={{ color: t.textSecondary }}>2,340 members</p>
      </div>
    </div>
  );
}
