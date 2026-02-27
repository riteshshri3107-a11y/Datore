"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { formatCurrency } from '@/lib/utils';
import { DEMO_WORKERS, DEMO_REVIEWS, getFavorites, toggleFavorite } from '@/lib/demoData';

export default function WorkerDetailPage() {
  const router = useRouter(); const params = useParams();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const [tab, setTab] = useState<'about'|'reviews'|'gallery'>('about');
  const [isFav, setIsFav] = useState(false);
  const [showHire, setShowHire] = useState(false);
  const w = DEMO_WORKERS.find(x=>x.id===params.id) || DEMO_WORKERS[0];
  const reviews = DEMO_REVIEWS[w.id] || [{ id:'gen', reviewer:'Community', rating:5, comment:'Great service!', date:'Recently' }];
  useEffect(() => { setIsFav(getFavorites().includes(w.id)); }, [w.id]);
  const handleFav = () => { const now = toggleFavorite(w.id); setIsFav(now); };
  const tc = (s:number) => s>=80?'#22c55e':s>=60?'#eab308':'#ef4444';

  return (
    <div className="space-y-4 animate-fade-in max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><button onClick={()=>router.back()} className="text-lg">←</button><h1 className="text-xl font-bold">Worker Profile</h1></div>
        <button onClick={handleFav} className="text-2xl">{isFav?'⭐':'☆'}</button>
      </div>
      <div className="glass-card rounded-2xl p-5 text-center" style={{ background:t.card, borderColor:t.cardBorder, boxShadow:t.glassShadow }}>
        <div className="relative inline-block"><div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mx-auto" style={{ background:`linear-gradient(135deg,${t.accent}44,#8b5cf644)`, color:t.accent }}>{w.full_name.split(' ').map((n:string)=>n[0]).join('')}</div><div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2" style={{ background:w.availability==='available'?'#22c55e':w.availability==='busy'?'#ef4444':'#f59e0b', borderColor:isDark?'#1a1a2e':'#fff' }}></div></div>
        <h2 className="text-xl font-bold mt-3">{w.full_name}</h2>
        <div className="flex items-center justify-center gap-2 mt-1 flex-wrap">
          {w.is_police_verified && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background:'rgba(34,197,94,0.15)', color:'#22c55e' }}>🛡️ Police Verified</span>}
          {w.background_check==='clear' && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background:'rgba(59,130,246,0.15)', color:'#3b82f6' }}>✅ Background Clear</span>}
        </div>
        <div className="flex justify-center gap-8 mt-4">
          <div><p className="font-bold text-lg">{w.rating}</p><p className="text-xs" style={{ color:'#f59e0b' }}>★ Rating</p></div>
          <div><p className="font-bold text-lg">{w.completed_jobs}</p><p className="text-xs" style={{ color:t.textMuted }}>Jobs</p></div>
          <div><p className="font-bold text-lg" style={{ color:tc(w.trust_score) }}>{w.trust_score}</p><p className="text-xs" style={{ color:t.textMuted }}>Trust</p></div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="glass-card rounded-xl p-3" style={{ background:t.card, borderColor:t.cardBorder }}><p className="text-[10px]" style={{ color:t.textMuted }}>💰 Hourly</p><p className="font-bold" style={{ color:t.accent }}>{formatCurrency(w.hourly_rate)}/hr</p></div>
        <div className="glass-card rounded-xl p-3" style={{ background:t.card, borderColor:t.cardBorder }}><p className="text-[10px]" style={{ color:t.textMuted }}>Fixed</p><p className="font-bold" style={{ color:t.accent }}>{formatCurrency(w.fixed_rate||0)}</p></div>
        <div className="glass-card rounded-xl p-3" style={{ background:t.card, borderColor:t.cardBorder }}><p className="text-[10px]" style={{ color:t.textMuted }}>📍</p><p className="font-semibold text-sm">{w.city}</p></div>
      </div>
      <div className="flex gap-2">{(['about','reviews','gallery'] as const).map(tb=>(<button key={tb} onClick={()=>setTab(tb)} className="flex-1 py-2 rounded-xl text-xs font-medium capitalize" style={{ background:tab===tb?t.accentLight:t.surface, color:tab===tb?t.accent:t.textSecondary }}>{tb==='reviews'?`Reviews (${w.review_count})`:tb}</button>))}</div>
      {tab==='about' && (
        <div className="space-y-3">
          <div className="glass-card rounded-2xl p-4" style={{ background:t.card, borderColor:t.cardBorder }}><h3 className="font-semibold text-sm mb-2">About</h3><p className="text-sm" style={{ color:t.textSecondary }}>{w.bio}</p><p className="text-xs mt-2" style={{ color:t.textMuted }}>Member since {w.joined} · {w.experience_years}+ yrs</p></div>
          <div className="glass-card rounded-2xl p-4" style={{ background:t.card, borderColor:t.cardBorder }}><h3 className="font-semibold text-sm mb-2">Skills</h3><div className="flex flex-wrap gap-1.5">{w.skills.map((s:string)=><span key={s} className="text-xs px-3 py-1 rounded-full" style={{ background:t.accentLight, color:t.accent }}>{s}</span>)}</div></div>
          {w.certifications.length>0 && <div className="glass-card rounded-2xl p-4" style={{ background:t.card, borderColor:t.cardBorder }}><h3 className="font-semibold text-sm mb-2">Certifications</h3>{w.certifications.map((c:string)=><div key={c} className="text-xs py-1" style={{ color:t.textSecondary }}>✅ {c}</div>)}</div>}
          <div className="glass-card rounded-2xl p-4" style={{ background:t.card, borderColor:t.cardBorder }}>
            <h3 className="font-semibold text-sm mb-2">Contact <span className="text-[10px] font-normal" style={{ color:t.textMuted }}>(Masked for privacy)</span></h3>
            <div className="space-y-1.5 text-sm" style={{ color:'#9ca3af' }}><p>Email: {w.email}</p><p>Phone: {w.phone}</p><p>Address: {w.address}</p></div>
            <p className="text-[10px] mt-2 px-3 py-1.5 rounded-lg inline-block" style={{ background:'rgba(234,179,8,0.1)', color:'#eab308' }}>Full details shared after hiring</p>
          </div>
        </div>
      )}
      {tab==='reviews' && <div className="space-y-2.5">{reviews.map((r:any)=>(<div key={r.id} className="glass-card rounded-xl p-3" style={{ background:t.card, borderColor:t.cardBorder }}><div className="flex items-center justify-between mb-1"><span className="font-medium text-sm">{r.reviewer}</span><span className="text-xs" style={{ color:t.textMuted }}>{r.date}</span></div><div className="text-xs mb-1" style={{ color:'#f59e0b' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</div><p className="text-xs" style={{ color:t.textSecondary }}>{r.comment}</p></div>))}</div>}
      {tab==='gallery' && <div className="glass-card rounded-2xl p-5 text-center" style={{ background:t.card, borderColor:t.cardBorder }}><p className="text-2xl mb-2">📷</p><p className="text-sm" style={{ color:t.textSecondary }}>No photos yet</p></div>}
      <div className="flex gap-2 sticky bottom-20 md:bottom-4 z-10">
        <button onClick={()=>router.push(`/chat/${w.id}`)} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white" style={{ background:`linear-gradient(135deg,${t.accent},#8b5cf6)` }}>💬 Chat</button>
        <button onClick={()=>setShowHire(true)} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white" style={{ background:'linear-gradient(135deg,#22c55e,#16a34a)' }}>✅ Hire Now</button>
        <button onClick={handleFav} className="py-3 px-4 rounded-xl text-sm" style={{ background:isFav?'rgba(234,179,8,0.15)':t.surface, color:isFav?'#eab308':t.textSecondary, border:`1px solid ${t.cardBorder}` }}>{isFav?'⭐':'☆'}</button>
      </div>
      {showHire && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }} onClick={()=>setShowHire(false)}>
          <div onClick={e=>e.stopPropagation()} className="w-full max-w-sm rounded-2xl p-5 space-y-4" style={{ background:isDark?'#1a1a2e':'#fff', border:`1px solid ${t.cardBorder}` }}>
            <h3 className="font-bold text-lg">Hire {w.full_name}</h3>
            <button onClick={()=>{setShowHire(false);router.push(`/chat/${w.id}`);}} className="w-full py-3 rounded-xl text-sm font-semibold" style={{ background:t.accentLight, color:t.accent }}>Hourly - {formatCurrency(w.hourly_rate)}/hr</button>
            <button onClick={()=>{setShowHire(false);router.push(`/chat/${w.id}`);}} className="w-full py-3 rounded-xl text-sm font-semibold" style={{ background:'rgba(34,197,94,0.1)', color:'#22c55e' }}>Fixed - {formatCurrency(w.fixed_rate||0)}</button>
            <button onClick={()=>setShowHire(false)} className="w-full py-2 rounded-xl text-xs" style={{ color:t.textMuted }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}