"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { useAuthStore } from '@/store/useAuthStore';
import { getTheme } from '@/lib/theme';
import { IcoBack, IcoShield } from '@/components/Icons';

export default function SOSPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const { user } = useAuthStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const [activated, setActivated] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [cancelled, setCancelled] = useState(false);
  const [fakeCallActive, setFakeCallActive] = useState(false);

  useEffect(() => {
    if (activated && countdown > 0) { const tm = setTimeout(()=>setCountdown(p=>p-1),1000); return ()=>clearTimeout(tm); }
    if (activated && countdown === 0) { /* SOS triggered */ }
  }, [activated, countdown]);

  const cancel = () => { setActivated(false); setCountdown(5); setCancelled(true); setTimeout(()=>setCancelled(false),2000); };
  const triggerFakeCall = () => { setFakeCallActive(true); setTimeout(()=>setFakeCallActive(false),5000); };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={()=>router.back()} style={{ background:'none', border:'none', color:t.text, cursor:'pointer' }}><IcoBack size={20} /></button>
        <h1 className="text-xl font-bold">Emergency SOS</h1>
      </div>

      {cancelled && <div className="glass-card rounded-xl p-3 text-center" style={{ background:'#22c55e22', borderColor:'#22c55e44' }}><p className="text-sm font-semibold" style={{ color:'#22c55e' }}>✓ SOS Cancelled - You are safe</p></div>}

      {!activated ? (
        <div className="text-center space-y-6 py-8">
          <p className="text-xs" style={{ color:t.textSecondary }}>Press and hold the SOS button during any emergency while on a job</p>
          <button onClick={()=>setActivated(true)} className="w-40 h-40 rounded-full mx-auto flex items-center justify-center text-white text-2xl font-bold" style={{ background:'linear-gradient(135deg,#ef4444,#dc2626)', boxShadow:'0 0 40px rgba(239,68,68,0.4)', animation:'pulse 2s infinite' }}>
            <div><IcoShield size={40} color="white" /><p className="text-sm mt-1">SOS</p></div>
          </button>
          <div className="space-y-3 max-w-sm mx-auto">
            <p className="text-xs font-semibold">What happens when you trigger SOS:</p>
            {['📍 GPS location sent to emergency contacts','🎙️ Audio recording starts automatically','💬 Deto AI initiates calming conversation','📱 Notification sent to platform safety team'].map((s,i)=>(<p key={i} className="text-xs" style={{ color:t.textSecondary }}>{s}</p>))}
          </div>
          <button onClick={triggerFakeCall} className="px-6 py-3 rounded-xl text-sm font-semibold" style={{ background:'rgba(99,102,241,0.1)', color:'#6366f1', border:'1px solid rgba(99,102,241,0.2)' }}>📞 Fake Call (Exit Safely)</button>
        </div>
      ) : (
        <div className="text-center space-y-6 py-8">
          <div className="w-40 h-40 rounded-full mx-auto flex items-center justify-center" style={{ background:'linear-gradient(135deg,#ef4444,#dc2626)', animation:'pulse 0.5s infinite' }}>
            <div className="text-white"><p className="text-5xl font-bold">{countdown}</p><p className="text-sm">{countdown>0?'Sending SOS...':'SOS ACTIVE'}</p></div>
          </div>
          {countdown > 0 ? <button onClick={cancel} className="px-8 py-3 rounded-xl text-sm font-bold" style={{ background:'rgba(34,197,94,0.1)', color:'#22c55e', border:'1px solid rgba(34,197,94,0.3)' }}>Cancel SOS</button> : (
            <div className="space-y-3">
              <p className="text-sm font-bold" style={{ color:'#ef4444' }}>🚨 SOS ACTIVE</p>
              {['✓ Location shared with 2 emergency contacts','✓ Audio recording active','✓ Safety team notified','✓ Deto AI standing by'].map((s,i)=>(<p key={i} className="text-xs" style={{ color:'#22c55e' }}>{s}</p>))}
              <button onClick={cancel} className="px-8 py-3 rounded-xl text-sm font-bold text-white" style={{ background:'#22c55e' }}>I'm Safe - Deactivate</button>
            </div>
          )}
        </div>
      )}

      {/* Emergency Contacts */}
      <div className="glass-card rounded-xl p-4" style={{ background:t.card, borderColor:t.cardBorder }}>
        <h3 className="font-semibold text-sm mb-3">Emergency Contacts</h3>
        {[{name:'Mom',phone:'+1 (416) 555-0123'},{name:'Partner',phone:'+1 (647) 555-0456'}].map((c,i)=>(<div key={i} className="flex items-center gap-3 py-2" style={{ borderTop:i?`1px solid ${t.cardBorder}`:'none' }}><div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background:`${t.accent}22`, color:t.accent }}>{c.name[0]}</div><div className="flex-1"><p className="text-sm font-medium">{c.name}</p><p className="text-[10px]" style={{ color:t.textMuted }}>{c.phone}</p></div></div>))}
        <button className="w-full mt-2 py-2 rounded-xl text-xs font-medium" style={{ background:t.surface, color:t.textSecondary, border:`1px solid ${t.cardBorder}` }}>+ Add Contact</button>
      </div>

      {/* Fake Call overlay */}
      {fakeCallActive && (
        <div style={{ position:'fixed', inset:0, background:'#000', zIndex:9999, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20 }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl" style={{ background:'#22c55e' }}>📱</div>
          <p style={{ color:'white', fontSize:20, fontWeight:700 }}>Incoming Call</p>
          <p style={{ color:'#999', fontSize:14 }}>Mom</p>
          <div className="flex gap-8 mt-8">
            <button onClick={()=>setFakeCallActive(false)} className="w-16 h-16 rounded-full flex items-center justify-center text-2xl" style={{ background:'#ef4444' }}>📵</button>
            <button onClick={()=>setFakeCallActive(false)} className="w-16 h-16 rounded-full flex items-center justify-center text-2xl" style={{ background:'#22c55e' }}>📞</button>
          </div>
        </div>
      )}

      <style>{`@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}`}</style>
    </div>
  );
}