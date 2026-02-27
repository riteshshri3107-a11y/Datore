"use client";
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { createListing, getSession } from '@/lib/supabase';
import { MARKETPLACE_CATEGORIES } from '@/types';

export default function CreateListingPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const [form, setForm] = useState({ title: '', description: '', price: '', category: '', condition: 'good', location_name: '' });
  const [loading, setLoading] = useState(false);
  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.title || !form.category || !form.price) return;
    setLoading(true);
    const { data: { session } } = await getSession();
    if (!session) { router.push('/login'); return; }
    await createListing({ seller_id: session.user.id, seller_name: session.user.user_metadata?.full_name || 'User', ...form, price: parseFloat(form.price), location_lat: 43.65, location_lng: -79.38, location_name: form.location_name || 'Toronto, ON', images: [], status: 'active' });
    router.push('/marketplace');
    setLoading(false);
  };

  const s = { background: t.input, color: t.text, borderColor: t.inputBorder };
  return (
    <div className="space-y-4 animate-fade-in max-w-lg mx-auto">
      <div className="flex items-center gap-3"><button onClick={() => router.back()}>←</button><h1 className="text-xl font-bold">Sell an Item</h1></div>
      <div className="glass-card rounded-2xl p-5 space-y-4" style={{ background: t.card, borderColor: t.cardBorder }}>
        <input value={form.title} onChange={e => update('title', e.target.value)} placeholder="Item title" className="glass-input w-full px-4 py-3 rounded-xl text-sm" style={s} />
        <select value={form.category} onChange={e => update('category', e.target.value)} className="glass-input w-full px-4 py-3 rounded-xl text-sm" style={s}>
          <option value="">Category</option>{MARKETPLACE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <textarea value={form.description} onChange={e => update('description', e.target.value)} rows={3} placeholder="Description" className="glass-input w-full px-4 py-3 rounded-xl text-sm resize-none" style={s} />
        <div className="grid grid-cols-2 gap-3">
          <input type="number" value={form.price} onChange={e => update('price', e.target.value)} placeholder="Price (CAD)" className="glass-input w-full px-4 py-3 rounded-xl text-sm" style={s} />
          <select value={form.condition} onChange={e => update('condition', e.target.value)} className="glass-input w-full px-4 py-3 rounded-xl text-sm" style={s}>
            {['new','like_new','good','fair','poor'].map(c => <option key={c} value={c}>{c.replace('_',' ')}</option>)}
          </select>
        </div>
        <input value={form.location_name} onChange={e => update('location_name', e.target.value)} placeholder="Location" className="glass-input w-full px-4 py-3 rounded-xl text-sm" style={s} />
        <button onClick={submit} disabled={loading} className="btn-accent w-full py-3 rounded-xl">{loading ? 'Posting...' : '📦 List Item'}</button>
      </div>
    </div>
  );
}
