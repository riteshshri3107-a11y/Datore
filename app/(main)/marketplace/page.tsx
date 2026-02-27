"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { getListings } from '@/lib/supabase';
import { MARKETPLACE_CATEGORIES } from '@/types';
import { formatCurrency, timeAgo } from '@/lib/utils';

const DEMO_LISTINGS = [
  { id: '1', title: 'iPhone 15 Pro', price: 999, category: 'Electronics', condition: 'like_new', location_name: 'Toronto', seller_name: 'Alex', images: [], created_at: new Date().toISOString() },
  { id: '2', title: '2019 Honda Civic', price: 18500, category: 'Vehicles', condition: 'good', location_name: 'Mississauga', seller_name: 'Sam', images: [], created_at: new Date(Date.now()-86400000).toISOString() },
  { id: '3', title: 'IKEA Desk + Chair', price: 120, category: 'Home Goods', condition: 'good', location_name: 'Brampton', seller_name: 'Lisa', images: [], created_at: new Date(Date.now()-172800000).toISOString() },
  { id: '4', title: 'PS5 + 3 Games', price: 450, category: 'Electronics', condition: 'like_new', location_name: 'Scarborough', seller_name: 'Mike', images: [], created_at: new Date(Date.now()-259200000).toISOString() },
  { id: '5', title: 'Kids Bicycle', price: 0, category: 'Free Stuff', condition: 'fair', location_name: 'North York', seller_name: 'Jane', images: [], created_at: new Date(Date.now()-345600000).toISOString() },
];

export default function MarketplacePage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const [tab, setTab] = useState<'browse'|'selling'>('browse');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');
  const [listings, setListings] = useState<any[]>(DEMO_LISTINGS);

  useEffect(() => {
    getListings({ category: selectedCategory || undefined }).then(data => { if (data?.length > 0) setListings(data); });
  }, [selectedCategory]);

  const filtered = listings.filter(l => {
    if (selectedCategory && l.category !== selectedCategory) return false;
    if (search && !l.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">🏪 Marketplace</h1>
        <button onClick={() => router.push('/marketplace/create')} className="btn-accent text-xs px-4 py-2 rounded-xl">+ Sell Item</button>
      </div>

      <div className="flex gap-2">
        {['browse', 'selling'].map(t2 => (
          <button key={t2} onClick={() => setTab(t2 as any)} className="glass-button px-4 py-2 rounded-xl text-xs font-medium"
            style={{ background: tab === t2 ? t.accentLight : t.surface, color: tab === t2 ? t.accent : t.textSecondary, borderColor: tab === t2 ? `${t.accent}44` : t.cardBorder }}>
            {t2 === 'browse' ? '🔍 Browse' : '📦 My Listings'}
          </button>
        ))}
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search marketplace..."
        className="glass-input w-full px-4 py-3 rounded-xl text-sm" style={{ background: t.input, color: t.text, borderColor: t.inputBorder }} />

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <button onClick={() => setSelectedCategory('')}
          className="glass-button px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap"
          style={{ background: !selectedCategory ? t.accentLight : t.surface, color: !selectedCategory ? t.accent : t.textSecondary }}>All</button>
        {MARKETPLACE_CATEGORIES.slice(0, 8).map(c => (
          <button key={c} onClick={() => setSelectedCategory(c)}
            className="glass-button px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap"
            style={{ background: selectedCategory === c ? t.accentLight : t.surface, color: selectedCategory === c ? t.accent : t.textSecondary }}>{c}</button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {filtered.map((l, i) => (
          <div key={l.id} onClick={() => router.push(`/marketplace/listing/${l.id}`)}
            className={`glass-card rounded-2xl overflow-hidden cursor-pointer animate-slide-up stagger-${(i % 6) + 1}`}
            style={{ background: t.card, borderColor: t.cardBorder, boxShadow: t.glassShadow, animationFillMode: 'both' }}>
            <div className="h-32 flex items-center justify-center text-3xl" style={{ background: `linear-gradient(135deg, ${t.accent}15, #8b5cf615)` }}>
              {l.category === 'Electronics' ? '📱' : l.category === 'Vehicles' ? '🚗' : l.category === 'Home Goods' ? '🪑' : l.category === 'Free Stuff' ? '🎁' : '📦'}
            </div>
            <div className="p-3">
              <p className="font-semibold text-sm truncate">{l.title}</p>
              <p className="font-bold mt-1" style={{ color: l.price === 0 ? t.success : t.accent }}>{l.price === 0 ? 'FREE' : formatCurrency(l.price)}</p>
              <p className="text-xs mt-1" style={{ color: t.textMuted }}>📍 {l.location_name} · {timeAgo(l.created_at)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
