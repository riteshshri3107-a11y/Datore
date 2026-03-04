"use client";
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { useAuthStore } from '@/store/useAuthStore';
import { getTheme } from '@/lib/theme';
import { IcoBack } from '@/components/Icons';

const CATEGORIES = ['Cleaning','Plumbing','Electrical','Tutoring','Pet Care','Moving','Gardening','Painting'];
const PRICING: Record<string,{low:number;avg:number;high:number;demand:string}> = {
  Cleaning:{low:25,avg:35,high:50,demand:'High'},Plumbing:{low:45,avg:65,high:95,demand:'Very High'},Electrical:{low:50,avg:75,high:110,demand:'High'},
  Tutoring:{low:20,avg:35,high:55,demand:'Medium'},PetCare:{low:15,avg:25,high:40,demand:'Medium'},'Pet Care':{low:15,avg:25,high:40,demand:'Medium'},
  Moving:{low:30,avg:45,high:70,demand:'Low'},Gardening:{low:20,avg:30,high:45,demand:'Medium'},Painting:{low:35,avg:50,high:75,demand:'Low'},
};

export default function PricingAIPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const { user } = useAuthStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const [category, setCategory] = useState('Cleaning');
  const [hours, setHours] = useState(2);
  const [urgency, setUrgency] = useState<'normal'|'today'|'immediate'>('normal');
  const [myRate, setMyRate] = useState(35);

  const pricing = PRICING[category]||PRICING.Cleaning;
  const urgencyMultiplier = urgency==='immediate'?1.3:urgency==='today'?1.15:1;
  const suggested = Math.round(pricing.avg * urgencyMultiplier);
  const total = suggested * hours;
  const position = myRate < pricing.avg ? 'below' : myRate > pricing.avg ? 'above' : 'at';
  const posColor = position==='below'?'#22c55e':position==='above'?'#ef4444':'#f59e0b';

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={()=>router.back()} style={{ background:'none', border:'none', color:t.text, cursor:'pointer' }}><IcoBack size={20} /></button>
        <h1 className="text-xl font-bold">Smart Pricing AI</h1>
      </div>
      <div className="glass-card rounded-xl p-4 space-y-3" style={{ background:t.card, borderColor:t.cardBorder }}>
        <div><label className="text-xs font-medium" style={{ color:t.textMuted }}>Service Category</label><div className="flex flex-wrap gap-1.5 mt-1">{CATEGORIES.map(c=>(<button key={c} onClick={()=>setCategory(c)} className="px-3 py-1.5 rounded-xl text-xs font-medium" style={{ background:category===c?t.accentLight:'transparent', color:category===c?t.accent:t.textSecondary, border:`1px solid ${category===c?t.accent+'33':t.cardBorder}` }}>{c}</button>))}</div></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs font-medium" style={{ color:t.textMuted }}>Estimated Hours</label><input type="number" value={hours} onChange={e=>setHours(Number(e.target.value))} min={1} max={12} className="w-full mt-1 p-3 rounded-xl text-sm outline-none" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, color:t.text }} /></div>
          <div><label className="text-xs font-medium" style={{ color:t.textMuted }}>Urgency</label><select value={urgency} onChange={e=>setUrgency(e.target.value as any)} className="w-full mt-1 p-3 rounded-xl text-sm outline-none" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, color:t.text }}><option value="normal">No Rush</option><option value="today">Today</option><option value="immediate">Immediate</option></select></div>
        </div>
      </div>
      <div className="glass-card rounded-xl p-5" style={{ background:`linear-gradient(135deg,${t.accent}15,#8b5cf622)`, borderColor:t.cardBorder }}>
        <h3 className="font-semibold text-sm mb-3">🤖 AI Price Recommendation</h3>
        <div className="text-center mb-4"><p className="text-3xl font-bold" style={{ color:t.accent }}>${suggested}<span className="text-sm font-normal">/hr</span></p><p className="text-xs" style={{ color:t.textMuted }}>Estimated Total: ${total} for {hours} hours</p></div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs"><span style={{ color:'#22c55e' }}>Low: ${pricing.low}/hr</span><span style={{ color:'#f59e0b' }}>Avg: ${pricing.avg}/hr</span><span style={{ color:'#ef4444' }}>High: ${pricing.high}/hr</span></div>
          <div className="h-2 rounded-full flex" style={{ background:t.surface }}><div className="h-full rounded-l-full" style={{ width:'33%', background:'#22c55e' }} /><div className="h-full" style={{ width:'34%', background:'#f59e0b' }} /><div className="h-full rounded-r-full" style={{ width:'33%', background:'#ef4444' }} /></div>
          <p className="text-[10px]" style={{ color:t.textMuted }}>Market demand for {category}: <span style={{ fontWeight:700, color:pricing.demand==='Very High'?'#ef4444':pricing.demand==='High'?'#f59e0b':'#6b7280' }}>{pricing.demand}</span></p>
          {urgency!=='normal' && <p className="text-[10px]" style={{ color:'#f59e0b' }}>⚡ Urgency premium: +{Math.round((urgencyMultiplier-1)*100)}%</p>}
        </div>
      </div>
      <div className="glass-card rounded-xl p-4" style={{ background:t.card, borderColor:t.cardBorder }}>
        <h3 className="font-semibold text-sm mb-2">Your Rate Comparison</h3>
        <div className="flex items-center gap-3"><input type="range" min={pricing.low} max={pricing.high} value={myRate} onChange={e=>setMyRate(Number(e.target.value))} className="flex-1" style={{ accentColor:t.accent }} /><span className="font-bold text-sm" style={{ color:posColor }}>${myRate}/hr</span></div>
        <p className="text-xs mt-2" style={{ color:posColor }}>Your rate is {position} market average {position==='below'?'(competitive, more bookings)':position==='above'?'(premium, fewer bookings)':'(balanced)'}</p>
      </div>
    </div>
  );
}