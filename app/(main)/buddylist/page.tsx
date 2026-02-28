"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { DEMO_WORKERS, getFavorites, setFavorites } from '@/lib/demoData';

export default function BuddyListPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const [favIds, setFavIds] = useState<string[]>([]);
  useEffect(() => { setFavIds(getFavorites()); }, []);
  const favWorkers = DEMO_WORKERS.filter(w => favIds.includes(w.id));
  const removeFav = (id: string) => { const u=favIds.filter(f=>f!==id); setFavIds(u); setFavorites(u); };
  const ac = (a:string)=>a==='available'?'#22c55e':a==='busy'?'#ef4444':'#f59e0b';

  return (
    <div className="space-y-4 animate-fade-in ">
      <div className="flex items-center gap-3"><button onClick={()=>router.back()} className="text-lg">←</button><h1 className="text-xl font-bold">⭐ Buddy List</h1></div>
      <p className="text-xs" style={{ color:t.textMuted }}>{favWorkers.length} favorite worker{favWorkers.length!==1?'s':''}</p>
      {favWorkers.length===0 ? (
        <div className="text-center py-12 glass-card rounded-2xl" style={{ background:t.card, borderColor:t.cardBorder }}>
          <p className="text-3xl mb-3">⭐</p><p className="font-medium" style={{ color:t.textSecondary }}>No favorites yet</p>
          <p className="text-xs mt-1" style={{ color:t.textMuted }}>Tap ⭐ on any worker to save them here</p>
          <button onClick={()=>router.push('/jobplace/providers')} className="text-xs px-5 py-2.5 rounded-xl mt-4 font-semibold text-white" style={{ background:`linear-gradient(135deg,${t.accent},#8b5cf6)` }}>Browse Workers</button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {favWorkers.map(w=>(<div key={w.id} className="glass-card rounded-2xl p-4 flex items-center gap-3" style={{ background:t.card, borderColor:t.cardBorder }}>
            <div onClick={()=>router.push(`/worker/${w.id}`)} className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold cursor-pointer" style={{ background:`linear-gradient(135deg,${t.accent}33,#8b5cf633)`, color:t.accent, position:'relative' }}>
              {w.full_name.split(' ').map(n=>n[0]).join('')}
              <div style={{ position:'absolute', bottom:-2, right:-2, width:10, height:10, borderRadius:'50%', background:ac(w.availability), border:`2px solid ${isDark?'#1a1a2e':'#fff'}` }}></div>
            </div>
            <div className="flex-1 cursor-pointer" onClick={()=>router.push(`/worker/${w.id}`)}>
              <p className="font-semibold text-sm">{w.full_name} {w.is_police_verified?'🛡️':''}</p>
              <p className="text-xs" style={{ color:t.textSecondary }}>{w.skills.join(', ')} ● ★{w.rating} ● ${w.hourly_rate}/hr</p>
            </div>
            <div className="flex gap-1.5">
              <button onClick={()=>router.push(`/chat/${w.id}`)} className="p-2 rounded-xl text-sm" style={{ background:t.accentLight, color:t.accent }}>💬</button>
              <button onClick={()=>removeFav(w.id)} className="p-2 rounded-xl text-sm" style={{ background:'rgba(239,68,68,0.1)', color:'#ef4444' }}>✕</button>
            </div>
          </div>))}
        </div>
      )}
    </div>
  );
}