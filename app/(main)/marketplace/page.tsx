"use client";
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { formatCurrency } from '@/lib/utils';
import { MARKETPLACE_LISTINGS, MARKET_CATS } from '@/lib/demoData';

const CON: Record<string,string> = { 'Like New':'#22c55e', 'Excellent':'#3b82f6', 'Good':'#f59e0b', 'Fair':'#6b7280' };
const IMG: Record<string,string> = { phone:'Phone', bike:'Bike', furniture:'Chair', gaming:'Game', baby:'Baby', kitchen:'Pan', auto:'Car', outdoor:'Tent' };

export default function MarketplacePage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');
  const filtered = MARKETPLACE_LISTINGS.filter(l => (cat==='All'||l.category===cat) && (!search||l.title.toLowerCase().includes(search.toLowerCase())));

  return (
    <div className="space-y-4 animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Marketplace</h1>
        <div className="flex gap-2">
          <button onClick={() => router.push('/marketplace/my-listings')} className="px-3 py-2 rounded-xl text-xs font-medium" style={{ background:t.surface, color:t.textSecondary, border:`1px solid ${t.cardBorder}` }}>My Listings</button>
          <button onClick={() => router.push('/marketplace/create')} className="px-4 py-2 rounded-xl text-xs font-semibold text-white" style={{ background:`linear-gradient(135deg,${t.accent},#8b5cf6)` }}>+ Sell Item</button>
        </div>
      </div>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items..." className="w-full p-3 rounded-xl text-sm outline-none" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, color:t.text }} />
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {MARKET_CATS.map(c => (
          <button key={c} onClick={() => setCat(c)} className="px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap" style={{ background:cat===c?t.accentLight:'transparent', color:cat===c?t.accent:t.textSecondary, border:cat===c?`1px solid ${t.accent}33`:'1px solid transparent' }}>{c}</button>
        ))}
      </div>
      <p className="text-xs" style={{ color:t.textMuted }}>{filtered.length} items found</p>
      <div className="grid grid-cols-2 gap-3">
        {filtered.map(l => (
          <div key={l.id} onClick={() => router.push(`/marketplace/listing/${l.id}`)} className="glass-card rounded-xl overflow-hidden cursor-pointer" style={{ background:t.card, borderColor:t.cardBorder }}>
            <div className="h-28 flex items-center justify-center text-lg font-bold" style={{ background:`linear-gradient(135deg,${t.accent}15,#8b5cf615)`, color:t.accent+'88' }}>{IMG[l.img]||'Item'}</div>
            <div className="p-3">
              <p className="font-semibold text-sm truncate">{l.title}</p>
              <p className="font-bold mt-1" style={{ color:t.accent }}>{formatCurrency(l.price)}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background:(CON[l.condition]||'#888')+'22', color:CON[l.condition]||'#888' }}>{l.condition}</span>
                <span className="text-[10px]" style={{ color:t.textMuted }}>{l.posted}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
