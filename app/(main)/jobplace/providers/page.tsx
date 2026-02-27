"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { DEMO_WORKERS, getFavorites, toggleFavorite } from '@/lib/demoData';

export default function ProvidersPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All Skills');
  const [sort, setSort] = useState('Rating');
  const [favs, setFavs] = useState<string[]>([]);

  useEffect(() => { setFavs(getFavorites()); }, []);

  const handleFav = (id:string) => { toggleFavorite(id); setFavs(getFavorites()); };

  const cats = ['All Skills', ...new Set(DEMO_WORKERS.flatMap(w=>w.skills))];
  let filtered = DEMO_WORKERS.filter(w => (!search || w.full_name.toLowerCase().includes(search.toLowerCase()) || w.skills.some(s=>s.toLowerCase().includes(search.toLowerCase()))) && (cat==='All Skills' || w.skills.includes(cat)));
  if (sort==='Rating') filtered.sort((a,b)=>b.rating-a.rating);
  else if (sort==='Price: Low') filtered.sort((a,b)=>a.hourly_rate-b.hourly_rate);
  else if (sort==='Trust') filtered.sort((a,b)=>b.trust_score-a.trust_score);

  const ac = (a:string)=>a==='available'?'#22c55e':a==='busy'?'#ef4444':'#f59e0b';
  return (
    <div className="space-y-4 animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><button onClick={()=>router.back()} className="text-lg">\u2190</button><h1 className="text-xl font-bold">\ud83d\udc77 Service Providers</h1></div>
        <button onClick={()=>router.push('/jobplace/map')} className="px-4 py-2 rounded-xl text-xs font-semibold" style={{ background:t.accentLight, color:t.accent, border:`1px solid ${t.accent}33` }}>\ud83d\uddfa\ufe0f Map</button>
      </div>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search skills... (e.g., Babysitter, Plumber)" className="w-full p-3 rounded-xl text-sm outline-none" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, color:t.text }} />
      <div className="flex gap-2">
        <select value={cat} onChange={e=>setCat(e.target.value)} className="flex-1 p-2.5 rounded-xl text-xs outline-none" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, color:t.text }}>
          {cats.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
        <select value={sort} onChange={e=>setSort(e.target.value)} className="flex-1 p-2.5 rounded-xl text-xs outline-none" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, color:t.text }}>
          {['Rating','Price: Low','Trust'].map(s=><option key={s} value={s}>\u2b50 {s}</option>)}
        </select>
      </div>
      <p className="text-xs" style={{ color:t.textMuted }}>{filtered.length} workers found</p>
      <div className="space-y-3">
        {filtered.map(w=>(<div key={w.id} className="glass-card rounded-2xl p-4" style={{ background:t.card, borderColor:t.cardBorder }}>
          <div className="flex items-center gap-3">
            <div onClick={()=>router.push(`/worker/${w.id}`)} className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold cursor-pointer" style={{ background:`linear-gradient(135deg,${t.accent}33,#8b5cf633)`, color:t.accent, position:'relative', flexShrink:0 }}>
              {w.full_name.split(' ').map(n=>n[0]).join('')}
              <div style={{ position:'absolute', bottom:-2, right:-2, width:12, height:12, borderRadius:'50%', background:ac(w.availability), border:`2px solid ${isDark?'#1a1a2e':'#fff'}` }}></div>
            </div>
            <div className="flex-1 min-w-0 cursor-pointer" onClick={()=>router.push(`/worker/${w.id}`)}>
              <p className="font-semibold">{w.full_name} {w.is_police_verified?'\ud83d\udee1\ufe0f':''} {w.background_check==='clear'?'\u2705':''}</p>
              <p className="text-xs" style={{ color:t.textSecondary }}>\u2605 {w.rating} ({w.review_count} reviews) \u00b7 {w.completed_jobs} jobs</p>
              <div className="flex gap-1.5 flex-wrap mt-1">{w.skills.map(s=><span key={s} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background:t.accentLight, color:t.accent }}>{s}</span>)}</div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[11px]" style={{ color:t.textMuted }}>\ud83d\udccd {w.city}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background:ac(w.availability)+'22', color:ac(w.availability) }}>\u25cf {w.availability.charAt(0).toUpperCase()+w.availability.slice(1)}</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-bold text-lg" style={{ color:t.accent }}>${w.hourly_rate}.00<span className="text-xs font-normal">/hr</span></p>
              <p className="text-[10px]" style={{ color:t.textMuted }}>Trust <span className="font-bold" style={{ color:w.trust_score>=80?'#22c55e':'#eab308' }}>{w.trust_score}/100</span></p>
              <div className="flex gap-1 mt-1.5 justify-end">
                <button onClick={e=>{e.stopPropagation();router.push(`/chat/${w.id}`);}} className="p-1.5 rounded-lg text-xs" style={{ background:t.accentLight, color:t.accent }}>\ud83d\udcac</button>
                <button onClick={e=>{e.stopPropagation();handleFav(w.id);}} className="p-1.5 rounded-lg text-xs" style={{ background:favs.includes(w.id)?'rgba(234,179,8,0.15)':'transparent', color:favs.includes(w.id)?'#eab308':t.textMuted }}>{favs.includes(w.id)?'\u2b50':'\u2606'}</button>
              </div>
            </div>
          </div>
        </div>))}
      </div>
    </div>
  );
}