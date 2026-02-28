"use client";
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { IcoBack } from '@/components/Icons';

const PLANS = [
  { id:'free', name:'Free', price:0, period:'', features:['Core marketplace','Basic search','5 job posts/month','Standard Dato Bot','Community access'], current:true },
  { id:'plus', name:'Datore Plus', price:4.99, period:'/mo', features:['Priority matching','Enhanced Deto AI','Ad-free reels','Social analytics','10 job posts/month'], popular:true },
  { id:'pro', name:'Datore Pro', price:14.99, period:'/mo', features:['Featured profile','Booking calendar','Invoice generation','Unlimited job posts','Priority support'] },
  { id:'biz', name:'Business', price:29.99, period:'/mo', features:['Multi-employee dashboard','Business analytics','API access','White-label invoices','Dedicated manager'] },
];

export default function SubscriptionPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const [annual, setAnnual] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string|null>(null);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={()=>router.back()} style={{ background:'none', border:'none', color:t.text, cursor:'pointer' }}><IcoBack size={20} /></button>
        <h1 className="text-xl font-bold">Subscription Plans</h1>
      </div>
      <div className="flex items-center justify-center gap-3">
        <span className="text-xs" style={{ color:!annual?t.accent:t.textMuted }}>Monthly</span>
        <button onClick={()=>setAnnual(!annual)} className="w-12 h-6 rounded-full p-0.5" style={{ background:annual?'#22c55e':t.surface }}><div className="w-5 h-5 rounded-full bg-white transition-transform" style={{ transform:annual?'translateX(24px)':'translateX(0)' }} /></button>
        <span className="text-xs" style={{ color:annual?t.accent:t.textMuted }}>Annual <span style={{ color:'#22c55e', fontWeight:700 }}>Save 20%</span></span>
      </div>
      <div className="space-y-4">
        {PLANS.map(plan=>{const price=annual&&plan.price>0?Math.round(plan.price*0.8*100)/100:plan.price; return(
          <div key={plan.id} className="glass-card rounded-2xl overflow-hidden" style={{ background:t.card, borderColor:(plan as any).popular?t.accent:t.cardBorder, borderWidth:(plan as any).popular?2:1 }}>
            {(plan as any).popular && <div className="text-center py-1 text-[10px] font-bold text-white" style={{ background:`linear-gradient(90deg,${t.accent},#8b5cf6)` }}>MOST POPULAR</div>}
            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div><h3 className="font-bold text-lg">{plan.name}</h3>{(plan as any).current && <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background:'#22c55e22', color:'#22c55e' }}>Current Plan</span>}</div>
                <div className="text-right">{price > 0 ? <><span className="text-2xl font-bold" style={{ color:t.accent }}>${price}</span><span className="text-xs" style={{ color:t.textMuted }}>{annual?'/mo (billed annually)':'/mo'}</span></> : <span className="text-2xl font-bold" style={{ color:'#22c55e' }}>Free</span>}</div>
              </div>
              <div className="space-y-2">{plan.features.map((f,i)=>(<div key={i} className="flex items-center gap-2"><span style={{ color:'#22c55e', fontSize:12 }}>✓</span><span className="text-xs">{f}</span></div>))}</div>
              <button onClick={()=>setSelectedPlan(plan.id)} disabled={(plan as any).current} className="w-full mt-4 py-3 rounded-xl text-sm font-semibold disabled:opacity-40" style={{ background:(plan as any).current?t.surface:`linear-gradient(135deg,${t.accent},#8b5cf6)`, color:(plan as any).current?t.textMuted:'white' }}>{(plan as any).current?'Current Plan':selectedPlan===plan.id?'✓ Selected':'Upgrade'}</button>
            </div>
          </div>
        );})}
      </div>
      <p className="text-[10px] text-center" style={{ color:t.textMuted }}>Enterprise plans with custom SLAs available. Contact sales@datore.ca</p>
    </div>
  );
}