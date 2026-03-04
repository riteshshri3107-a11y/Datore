"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { useAuthStore } from '@/store/useAuthStore';
import { searchWorkers, toggleSave } from '@/lib/supabase';
import { JOB_CATEGORIES } from '@/types';

export default function ProvidersPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All Skills');
  const [sort, setSort] = useState('Rating');
  const [workers, setWorkers] = useState<any[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await searchWorkers({ skill: cat !== 'All Skills' ? cat : undefined });
      if (data) setWorkers(data);
      setLoading(false);
    }
    load();
  }, [cat]);

  const handleSave = async (workerId: string) => {
    if (!user?.id) return;
    const saved = await toggleSave(user.id, workerId, 'worker');
    if (saved) setSavedIds(p => [...p, workerId]);
    else setSavedIds(p => p.filter(id => id !== workerId));
  };

  const cats = ['All Skills', ...JOB_CATEGORIES];

  let filtered = workers.filter(w => {
    if (!search) return true;
    const s = search.toLowerCase();
    const name = (w.profiles?.name || '').toLowerCase();
    const skills = (w.skills || []).join(' ').toLowerCase();
    return name.includes(s) || skills.includes(s);
  });

  if (sort === 'Rating') filtered.sort((a, b) => (b.profiles?.rating || 0) - (a.profiles?.rating || 0));
  else if (sort === 'Price') filtered.sort((a, b) => (a.hourly_rate || 0) - (b.hourly_rate || 0));

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><button onClick={() => router.back()} className="text-lg">←</button><h1 className="text-xl font-bold">Service Providers</h1></div>
        <button onClick={() => router.push('/jobplace/map')} className="px-4 py-2 rounded-xl text-xs font-semibold" style={{ background: t.accentLight, color: t.accent }}>Map</button>
      </div>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search skills... (Babysitter, Plumber)" className="w-full p-3 rounded-xl text-sm outline-none" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', border: `1px solid ${t.cardBorder}`, color: t.text }} />
      <div className="flex gap-2">
        <select value={cat} onChange={e => setCat(e.target.value)} className="flex-1 p-2.5 rounded-xl text-xs outline-none" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', border: `1px solid ${t.cardBorder}`, color: t.text }}>{cats.map(c => <option key={c} value={c}>{c}</option>)}</select>
        <select value={sort} onChange={e => setSort(e.target.value)} className="flex-1 p-2.5 rounded-xl text-xs outline-none" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', border: `1px solid ${t.cardBorder}`, color: t.text }}>{['Rating', 'Price'].map(s => <option key={s} value={s}>{s}</option>)}</select>
      </div>
      {loading ? (
        <div className="text-center py-12 animate-pulse"><p className="text-sm" style={{ color: t.textMuted }}>Loading providers...</p></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12"><p className="text-3xl mb-2">👷</p><p className="font-medium" style={{ color: t.textSecondary }}>No providers found</p></div>
      ) : (
        <div className="space-y-3">
          {filtered.map(w => {
            const name = w.profiles?.name || 'Worker';
            const rating = w.profiles?.rating || 0;
            const jobCount = w.profiles?.job_count || 0;
            const verified = w.profiles?.verified || false;
            const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2);
            return (
              <div key={w.id} className="glass-card rounded-2xl p-4" style={{ background: t.card, borderColor: t.cardBorder }}>
                <div className="flex items-center gap-3">
                  <div onClick={() => router.push(`/worker/${w.id}`)} className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold cursor-pointer" style={{ background: `linear-gradient(135deg,${t.accent}33,#8b5cf633)`, color: t.accent, position: 'relative', flexShrink: 0 }}>
                    {w.profiles?.avatar_url ? <img src={w.profiles.avatar_url} alt="" className="w-full h-full rounded-xl object-cover" /> : initials}
                    <div style={{ position: 'absolute', bottom: -2, right: -2, width: 12, height: 12, borderRadius: '50%', background: w.available ? '#22c55e' : '#f59e0b', border: `2px solid ${isDark ? '#1a1a2e' : '#fff'}` }}></div>
                  </div>
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => router.push(`/worker/${w.id}`)}>
                    <p className="font-semibold">{name} {verified ? '🛡️' : ''}</p>
                    <p className="text-xs" style={{ color: t.textSecondary }}>★ {rating} | {jobCount} jobs</p>
                    <div className="flex gap-1.5 flex-wrap mt-1">{(w.skills || []).slice(0, 4).map((s: string) => <span key={s} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: t.accentLight, color: t.accent }}>{s}</span>)}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-lg" style={{ color: t.accent }}>${w.hourly_rate || 0}<span className="text-xs font-normal">/hr</span></p>
                    <div className="flex gap-1 mt-1.5 justify-end">
                      <button onClick={e => { e.stopPropagation(); router.push(`/chat/${w.id}`); }} className="p-1.5 rounded-lg text-xs" style={{ background: t.accentLight, color: t.accent }}>💬</button>
                      <button onClick={e => { e.stopPropagation(); handleSave(w.id); }} className="p-1.5 rounded-lg text-xs" style={{ background: savedIds.includes(w.id) ? 'rgba(234,179,8,0.15)' : 'transparent', color: savedIds.includes(w.id) ? '#eab308' : t.textMuted }}>{savedIds.includes(w.id) ? '⭐' : '☆'}</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
