"use client";
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { IcoBack } from '@/components/Icons';

const PROMOS = [
  { id:'p1', title:'Featured Profile Boost', desc:'Appear at the top of search results for 7 days', price:9.99, duration:'7 days', impressions:'~2,500', active:true },
  { id:'p2', title:'Priority Job Post', desc:'Your job posting gets highlighted and shown first', price:4.99, duration:'3 days', impressions:'~1,200', active:false },
  { id:'p3', title:'Marketplace Spotlight', desc:'Feature your listing on the marketplace homepage', price:2.99, duration:'5 days', impressions:'~800', active:false },
];

export default function PromotionsPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const [tab, setTab] = useState<'available'|'active'|'history'>('available');
  const [purchased, setPurchased] = useState<string[]>(['p1']);

  const buy = (id:string) => { setPurchased(prev=>[...prev,id]); };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={()=>router.back()} style={{ background:'none', border:'none', color:t.text, cursor:'pointer' }}><IcoBack size={20} /></button>
        <h1 className="text-xl font-bold">Promotions & Boosts</h1>
      </div>
      <div className="flex gap-2">
        {(['available','active','history'] as const).map(tb=>(
          <button key={tb} onClick={()=>setTab(tb)} className="px-4 py-2 rounded-xl text-xs font-medium capitalize" style={{ background:tab===tb?t.accentLight:'transparent', color:tab===tb?t.accent:t.textSecondary }}>{tb}</button>
        ))}
      </div>
      {PROMOS.map(p => (
        <div key={p.id} className="glass-card rounded-xl p-4" style={{ background:t.card, borderColor:t.cardBorder }}>
          <div className="flex justify-between items-start">
            <div><h3 className="font-semibold text-sm">{p.title}</h3><p className="text-xs mt-1" style={{ color:t.textSecondary }}>{p.desc}</p></div>
            <span className="text-lg font-bold" style={{ color:t.accent }}>${p.price}</span>
          </div>
          <div className="flex gap-4 mt-2">
            <span className="text-[10px]" style={{ color:t.textMuted }}>⏱ {p.duration}</span>
            <span className="text-[10px]" style={{ color:t.textMuted }}>👁 {p.impressions}</span>
          </div>
          <button onClick={()=>buy(p.id)} disabled={purchased.includes(p.id)} className="w-full mt-3 py-2.5 rounded-xl text-xs font-semibold text-white disabled:opacity-50" style={{ background:purchased.includes(p.id)?'#22c55e':`linear-gradient(135deg,${t.accent},#8b5cf6)` }}>{purchased.includes(p.id)?'✓ Active':'Purchase Boost'}</button>
        </div>
      ))}
      <div className="glass-card rounded-xl p-4" style={{ background:`linear-gradient(135deg,${t.accent}15,#8b5cf622)`, borderColor:t.cardBorder }}>
        <h3 className="font-semibold text-sm">📊 Promotion Analytics</h3>
        <div className="grid grid-cols-3 gap-3 mt-3">
          {[{l:'Impressions',v:'2,847'},{l:'Clicks',v:'234'},{l:'Hires',v:'12'}].map(s=>(
            <div key={s.l} className="text-center"><p className="text-lg font-bold" style={{ color:t.accent }}>{s.v}</p><p className="text-[10px]" style={{ color:t.textMuted }}>{s.l}</p></div>
          ))}
        </div>
      </div>
    </div>
  );
}
