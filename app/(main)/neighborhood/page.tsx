"use client";
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { useAuthStore } from '@/store/useAuthStore';
import { getTheme } from '@/lib/theme';
import { IcoBack, IcoShield } from '@/components/Icons';

const ALERTS = [
  { id:'a1', type:'safety', text:'Suspicious activity reported near Bloor & Yonge', time:'30 min ago', severity:'medium' },
  { id:'a2', type:'weather', text:'Winter storm warning for GTA - expect 15cm snowfall tonight', time:'2h ago', severity:'high' },
  { id:'a3', type:'community', text:'Road closure on Dundas St for construction until Mar 15', time:'1 day ago', severity:'low' },
];

export default function NeighborhoodPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const { user } = useAuthStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const [showReport, setShowReport] = useState(false);
  const [reported, setReported] = useState(false);
  const [sharing, setSharing] = useState(false);

  const sevColor: Record<string,string> = { high:'#ef4444', medium:'#f59e0b', low:'#6b7280' };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={()=>router.back()} style={{ background:'none', border:'none', color:t.text, cursor:'pointer' }}><IcoBack size={20} /></button>
        <h1 className="text-xl font-bold flex-1">Neighborhood Watch</h1>
        <button onClick={()=>setSharing(!sharing)} className="px-3 py-2 rounded-xl text-[10px] font-semibold" style={{ background:sharing?'#22c55e22':'rgba(239,68,68,0.1)', color:sharing?'#22c55e':'#ef4444' }}>{sharing?'📍 Sharing Live':'📍 Share Location'}</button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card rounded-xl p-3 text-center" style={{ background:t.card, borderColor:t.cardBorder }}><p className="text-lg">🟢</p><p className="text-xs font-bold" style={{ color:'#22c55e' }}>Safe</p><p className="text-[10px]" style={{ color:t.textMuted }}>Your Area</p></div>
        <div className="glass-card rounded-xl p-3 text-center" style={{ background:t.card, borderColor:t.cardBorder }}><p className="text-lg font-bold" style={{ color:t.accent }}>3</p><p className="text-[10px]" style={{ color:t.textMuted }}>Active Alerts</p></div>
        <div className="glass-card rounded-xl p-3 text-center" style={{ background:t.card, borderColor:t.cardBorder }}><p className="text-lg font-bold" style={{ color:'#22c55e' }}>12</p><p className="text-[10px]" style={{ color:t.textMuted }}>Workers Nearby</p></div>
      </div>
      <h3 className="font-semibold text-sm">Community Alerts</h3>
      {ALERTS.map(a=>(<div key={a.id} className="glass-card rounded-xl p-3 flex items-start gap-3" style={{ background:t.card, borderColor:t.cardBorder }}><div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background:sevColor[a.severity] }} /><div className="flex-1"><p className="text-xs">{a.text}</p><p className="text-[10px]" style={{ color:t.textMuted }}>{a.time}</p></div></div>))}
      <button onClick={()=>setShowReport(true)} className="w-full py-3 rounded-xl text-sm font-semibold" style={{ background:'rgba(239,68,68,0.1)', color:'#ef4444', border:'1px solid rgba(239,68,68,0.2)' }}>🚨 Report Safety Concern</button>
      <div className="glass-card rounded-xl p-4" style={{ background:t.card, borderColor:t.cardBorder }}>
        <h3 className="font-semibold text-sm mb-2">Worker Check-in/Check-out</h3>
        <p className="text-xs" style={{ color:t.textSecondary }}>Active workers in your area automatically check in when arriving at job sites. You can see their verified status in real-time.</p>
        {[{name:'Anita S.',status:'On job at 123 Main St',time:'Since 2:00 PM'},{name:'Mike C.',status:'En route to next job',time:'ETA 15 min'}].map((w,i)=>(<div key={i} className="flex items-center gap-2 py-2 mt-1" style={{ borderTop:`1px solid ${t.cardBorder}` }}><div className="w-2 h-2 rounded-full" style={{ background:'#22c55e' }} /><p className="text-xs flex-1"><span className="font-semibold">{w.name}</span> · {w.status}</p><span className="text-[10px]" style={{ color:t.textMuted }}>{w.time}</span></div>))}
      </div>
      {showReport && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }} onClick={()=>setShowReport(false)}>
          <div onClick={e=>e.stopPropagation()} className="w-full max-w-sm rounded-2xl p-5 space-y-3" style={{ background:isDark?'#1a1a2e':'#fff', border:`1px solid ${t.cardBorder}` }}>
            <h3 className="font-bold text-lg">Report Safety Concern</h3>
            <select className="w-full p-3 rounded-xl text-sm outline-none" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, color:t.text }}><option>Suspicious Activity</option><option>Road Hazard</option><option>Weather Warning</option><option>Other</option></select>
            <textarea rows={3} placeholder="Describe the concern (anonymous)..." className="w-full p-3 rounded-xl text-sm outline-none resize-none" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, color:t.text }} />
            {reported ? <p className="text-center text-sm font-semibold" style={{ color:'#22c55e' }}>✓ Report submitted anonymously</p> : <button onClick={()=>{setReported(true);setTimeout(()=>{setReported(false);setShowReport(false);},2000);}} className="w-full py-3 rounded-xl text-sm font-semibold text-white" style={{ background:'#ef4444' }}>Submit Report</button>}
          </div>
        </div>
      )}
    </div>
  );
}