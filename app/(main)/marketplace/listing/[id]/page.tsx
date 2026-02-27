"use client";
export const dynamic = "force-dynamic";
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { formatCurrency } from '@/lib/utils';

export default function ListingDetailPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  return (
    <div className="space-y-4 animate-fade-in max-w-lg mx-auto">
      <div className="flex items-center gap-3"><button onClick={() => router.back()}>←</button><h1 className="text-xl font-bold">Listing Details</h1></div>
      <div className="h-48 rounded-2xl flex items-center justify-center text-5xl" style={{ background: `linear-gradient(135deg, ${t.accent}22, #8b5cf622)` }}>📱</div>
      <div className="glass-card rounded-2xl p-5" style={{ background: t.card, borderColor: t.cardBorder }}>
        <h2 className="text-xl font-bold">iPhone 15 Pro</h2>
        <p className="text-2xl font-bold mt-2" style={{ color: t.accent }}>{formatCurrency(999)}</p>
        <p className="text-sm mt-3" style={{ color: t.textSecondary }}>Like new condition. 256GB. Natural Titanium. Includes original box and accessories.</p>
        <div className="flex gap-2 mt-4">
          <button className="btn-accent flex-1 py-3 rounded-xl text-sm">💬 Message Seller</button>
          <button className="glass-button flex-1 py-3 rounded-xl text-sm font-medium" style={{ background: t.surface, color: t.text }}>💰 Make Offer</button>
        </div>
      </div>
    </div>
  );
}
