"use client";
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { IcoBack, IcoUser, IcoJobs, IcoShield } from '@/components/Icons';

const FLAGGED = [
  { id:'f1', type:'review', user:'Anonymous', content:'Fake 5-star reviews detected for worker #w3', severity:'high', time:'1h ago' },
  { id:'f2', type:'profile', user:'user_892', content:'Suspicious profile - possible duplicate account', severity:'medium', time:'3h ago' },
  { id:'f3', type:'message', user:'user_147', content:'Reported for inappropriate language in chat', severity:'low', time:'5h ago' },
];

export default function AdminPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const [tab, setTab] = useState<'overview'|'users'|'moderation'|'reports'>('overview');
  const [resolved, setResolved] = useState<string[]>([]);

  const stats = [{l:'Total Users',v:'12,847',d:'+340 this week',c:'#6366f1'},{l:'Active Jobs',v:'1,234',d:'+89 today',c:'#22c55e'},{l:'Revenue (MTD)',v:'$124K',d:'+23% vs last month',c:'#f59e0b'},{l:'Safety Score',v:'94.2%',d:'↑ 1.3% improvement',c:'#06b6d4'}];

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={()=>router.back()} style={{ background:'none', border:'none', color:t.text, cursor:'pointer' }}><IcoBack size={20} /></button>
        <h1 className="text-xl font-bold flex-1">Admin Dashboard</h1>
        <span className="text-[10px] px-2 py-1 rounded-full font-semibold" style={{ background:'#ef444422', color:'#ef4444' }}>3 Flagged</span>
      </div>
      <div className="flex gap-1 overflow-x-auto">
        {(['overview','users','moderation','reports'] as const).map(tb=>(
          <button key={tb} onClick={()=>setTab(tb)} className="px-4 py-2 rounded-xl text-xs font-medium capitalize" style={{ background:tab===tb?t.accentLight:'transparent', color:tab===tb?t.accent:t.textSecondary }}>{tb}</button>
        ))}
      </div>
      {tab==='overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">{stats.map(s=>(<div key={s.l} className="glass-card rounded-xl p-4" style={{ background:t.card, borderColor:t.cardBorder }}><p className="text-2xl font-bold" style={{ color:s.c }}>{s.v}</p><p className="text-xs">{s.l}</p><p className="text-[10px]" style={{ color:'#22c55e' }}>{s.d}</p></div>))}</div>
          <div className="glass-card rounded-xl p-4" style={{ background:t.card, borderColor:t.cardBorder }}>
            <h3 className="font-semibold text-sm mb-3">Platform Health</h3>
            {[{l:'Uptime',v:'99.97%'},{l:'Avg Response',v:'142ms'},{l:'Error Rate',v:'0.03%'},{l:'Active Sessions',v:'2,341'}].map((m,i)=>(<div key={i} className="flex justify-between py-2" style={{ borderTop:i?`1px solid ${t.cardBorder}`:'none' }}><span className="text-xs">{m.l}</span><span className="text-xs font-bold" style={{ color:t.accent }}>{m.v}</span></div>))}
          </div>
        </div>
      )}
      {tab==='moderation' && (
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Flagged Content</h3>
          {FLAGGED.map(f=>(
            <div key={f.id} className="glass-card rounded-xl p-4" style={{ background:t.card, borderColor:t.cardBorder, opacity:resolved.includes(f.id)?0.5:1 }}>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background:f.severity==='high'?'#ef4444':f.severity==='medium'?'#f59e0b':'#6b7280' }} />
                <div className="flex-1"><p className="text-xs font-semibold">{f.type.toUpperCase()} · {f.user}</p><p className="text-xs mt-1" style={{ color:t.textSecondary }}>{f.content}</p><p className="text-[10px] mt-1" style={{ color:t.textMuted }}>{f.time}</p></div>
              </div>
              {!resolved.includes(f.id) && <div className="flex gap-2 mt-3"><button onClick={()=>setResolved(p=>[...p,f.id])} className="flex-1 py-2 rounded-xl text-xs font-medium" style={{ background:'#22c55e22', color:'#22c55e' }}>Dismiss</button><button onClick={()=>setResolved(p=>[...p,f.id])} className="flex-1 py-2 rounded-xl text-xs font-medium" style={{ background:'#ef444422', color:'#ef4444' }}>Take Action</button></div>}
              {resolved.includes(f.id) && <p className="text-[10px] mt-2 font-semibold" style={{ color:'#22c55e' }}>✓ Resolved</p>}
            </div>
          ))}
        </div>
      )}
      {(tab==='users'||tab==='reports') && (
        <div className="glass-card rounded-xl p-8 text-center" style={{ background:t.card, borderColor:t.cardBorder }}>
          <p className="text-3xl mb-2">{tab==='users'?'👥':'📊'}</p>
          <p className="font-semibold text-sm">{tab==='users'?'User Management':'Reports & Analytics'}</p>
          <p className="text-xs mt-1" style={{ color:t.textSecondary }}>{tab==='users'?'12,847 registered users · 892 workers · 4 admins':'Revenue reports, safety analytics, and growth metrics'}</p>
          <button className="mt-4 px-6 py-2 rounded-xl text-xs font-semibold text-white" style={{ background:`linear-gradient(135deg,${t.accent},#8b5cf6)` }}>View Full {tab==='users'?'User List':'Report'}</button>
        </div>
      )}
    </div>
  );
}