"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { formatCurrency } from '@/lib/utils';
import { getUserListings } from '@/lib/demoData';

export default function MyListingsPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const [listings, setListings] = useState<any[]>([]);

  useEffect(() => { setListings(getUserListings()); }, []);

  const CON: Record<string,string> = { 'Like New':'#22c55e', 'Excellent':'#3b82f6', 'Good':'#f59e0b', 'Fair':'#6b7280' };

  return (
    <div className="space-y-4 animate-fade-in ">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><button onClick={() => router.back()} className="text-lg">{'<-'}</button><h1 className="text-xl font-bold">My Listings</h1></div>
        <button onClick={() => router.push('/marketplace/create')} className="px-4 py-2 rounded-xl text-xs font-semibold text-white" style={{ background:`linear-gradient(135deg,${t.accent},#8b5cf6)` }}>+ New</button>
      </div>
      {listings.length === 0 ? (
        <div className="text-center py-12 glass-card rounded-2xl" style={{ background:t.card, borderColor:t.cardBorder }}>
          <p className="text-2xl mb-3">No items yet</p>
          <p className="text-sm" style={{ color:t.textSecondary }}>Start selling by creating your first listing</p>
          <button onClick={() => router.push('/marketplace/create')} className="text-sm px-5 py-2.5 rounded-xl mt-4 font-semibold text-white" style={{ background:`linear-gradient(135deg,${t.accent},#8b5cf6)` }}>+ Create Listing</button>
        </div>
      ) : (
        <div className="space-y-2">
          {listings.map(l => (
            <div key={l.id} className="glass-card rounded-xl p-4 flex items-center gap-3" style={{ background:t.card, borderColor:t.cardBorder }}>
              <div className="w-14 h-14 rounded-xl flex items-center justify-center text-sm font-bold" style={{ background:`linear-gradient(135deg,${t.accent}15,#8b5cf615)`, color:t.accent }}>Item</div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{l.title}</p>
                <p className="text-xs" style={{ color:t.textSecondary }}>{l.category} - {l.condition}</p>
                <p className="text-[10px]" style={{ color:t.textMuted }}>Posted {l.posted}</p>
              </div>
              <div className="text-right">
                <p className="font-bold" style={{ color:t.accent }}>{formatCurrency(l.price)}</p>
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background:'rgba(34,197,94,0.15)', color:'#22c55e' }}>Active</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
