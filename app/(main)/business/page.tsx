"use client";
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { IcoBack, IcoJobs, IcoUser, IcoDashboard } from '@/components/Icons';

const EMPLOYEES = [
  { id:'e1', name:'Sarah Chen', role:'Field Manager', status:'active', jobs:34, rating:4.9 },
  { id:'e2', name:'Mike Johnson', role:'Technician', status:'active', jobs:28, rating:4.7 },
  { id:'e3', name:'Priya Patel', role:'Cleaner', status:'on-leave', jobs:45, rating:4.8 },
  { id:'e4', name:'James Brown', role:'Electrician', status:'active', jobs:19, rating:4.6 },
];

export default function BusinessPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const [tab, setTab] = useState<'overview'|'employees'|'jobs'|'analytics'>('overview');
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteSent, setInviteSent] = useState(false);

  const sendInvite = () => { if (inviteEmail.includes('@')) { setInviteSent(true); setTimeout(()=>{setInviteSent(false);setShowInvite(false);setInviteEmail('');},2000); } };

  const stats = [
    { label:'Total Employees', value:'4', icon:IcoUser, color:'#6366f1' },
    { label:'Active Jobs', value:'12', icon:IcoJobs, color:'#22c55e' },
    { label:'Revenue (MTD)', value:'$8,450', icon:IcoDashboard, color:'#f59e0b' },
    { label:'Avg Rating', value:'4.75', icon:IcoUser, color:'#ec4899' },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={()=>router.back()} style={{ background:'none', border:'none', color:t.text, cursor:'pointer' }}><IcoBack size={20} /></button>
        <h1 className="text-xl font-bold flex-1">Business Account</h1>
        <button onClick={()=>setShowInvite(true)} className="px-4 py-2 rounded-xl text-xs font-semibold text-white" style={{ background:`linear-gradient(135deg,${t.accent},#8b5cf6)` }}>+ Add Employee</button>
      </div>

      {/* Business Profile Card */}
      <div className="glass-card rounded-2xl p-5" style={{ background:`linear-gradient(135deg,${t.accent}15,#8b5cf622)`, borderColor:t.cardBorder }}>
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold" style={{ background:`${t.accent}22`, color:t.accent }}>D</div>
          <div><h2 className="font-bold text-lg">Datore Services Inc.</h2><p className="text-xs" style={{ color:t.textMuted }}>Business Account · Toronto, ON · Since Jan 2026</p><div className="flex gap-2 mt-1"><span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background:'#22c55e22', color:'#22c55e' }}>✓ Verified</span><span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background:`${t.accent}22`, color:t.accent }}>Pro Plan</span></div></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto">
        {(['overview','employees','jobs','analytics'] as const).map(tb => (
          <button key={tb} onClick={()=>setTab(tb)} className="px-4 py-2 rounded-xl text-xs font-medium capitalize whitespace-nowrap" style={{ background:tab===tb?t.accentLight:'transparent', color:tab===tb?t.accent:t.textSecondary, border:tab===tb?`1px solid ${t.accent}33`:'1px solid transparent' }}>{tb}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {stats.map(s => (
              <div key={s.label} className="glass-card rounded-xl p-4" style={{ background:t.card, borderColor:t.cardBorder }}>
                <div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background:`${s.color}15` }}><s.icon size={16} color={s.color} /></div></div>
                <p className="text-2xl font-bold" style={{ color:s.color }}>{s.value}</p>
                <p className="text-[10px]" style={{ color:t.textMuted }}>{s.label}</p>
              </div>
            ))}
          </div>
          <div className="glass-card rounded-xl p-4" style={{ background:t.card, borderColor:t.cardBorder }}>
            <h3 className="font-semibold text-sm mb-3">Recent Activity</h3>
            {['Sarah completed 3 jobs today','Mike received a 5-star review','New job request: Plumbing in Scarborough','Payment of $450 received from client'].map((a,i) => (
              <div key={i} className="flex items-center gap-3 py-2" style={{ borderTop:i?`1px solid ${t.cardBorder}`:'none' }}>
                <div className="w-2 h-2 rounded-full" style={{ background:['#22c55e','#f59e0b','#6366f1','#22c55e'][i] }} />
                <p className="text-xs flex-1">{a}</p>
                <span className="text-[10px]" style={{ color:t.textMuted }}>{['2h ago','5h ago','Today','Yesterday'][i]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'employees' && (
        <div className="space-y-3">
          {EMPLOYEES.map(e => (
            <div key={e.id} className="glass-card rounded-xl p-4 flex items-center gap-3" style={{ background:t.card, borderColor:t.cardBorder }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold" style={{ background:`${t.accent}22`, color:t.accent }}>{e.name.split(' ').map(n=>n[0]).join('')}</div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{e.name}</p>
                <p className="text-[10px]" style={{ color:t.textMuted }}>{e.role} · {e.jobs} jobs · ⭐ {e.rating}</p>
              </div>
              <span className="text-[10px] px-2 py-1 rounded-full font-medium" style={{ background:e.status==='active'?'#22c55e22':'#f59e0b22', color:e.status==='active'?'#22c55e':'#f59e0b' }}>{e.status}</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'jobs' && (
        <div className="space-y-3">
          {[{title:'Kitchen Renovation',client:'John D.',amount:'$2,400',status:'in_progress',assigned:'Sarah Chen'},{title:'Office Cleaning (Weekly)',client:'TechCorp',amount:'$350/week',status:'active',assigned:'Priya Patel'},{title:'Electrical Rewiring',client:'Maria G.',amount:'$1,800',status:'completed',assigned:'James Brown'}].map((j,i) => (
            <div key={i} className="glass-card rounded-xl p-4" style={{ background:t.card, borderColor:t.cardBorder }}>
              <div className="flex justify-between items-start">
                <div><p className="font-semibold text-sm">{j.title}</p><p className="text-[10px]" style={{ color:t.textMuted }}>Client: {j.client} · Assigned: {j.assigned}</p></div>
                <span className="font-bold text-sm" style={{ color:t.accent }}>{j.amount}</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full mt-2 inline-block" style={{ background:j.status==='completed'?'#22c55e22':j.status==='active'?'#3b82f622':'#f59e0b22', color:j.status==='completed'?'#22c55e':j.status==='active'?'#3b82f6':'#f59e0b' }}>{j.status.replace('_',' ')}</span>
            </div>
          ))}
          <button onClick={()=>router.push('/jobplace/create')} className="w-full py-3 rounded-xl text-sm font-semibold text-white" style={{ background:`linear-gradient(135deg,${t.accent},#8b5cf6)` }}>+ Post Bulk Job</button>
        </div>
      )}

      {tab === 'analytics' && (
        <div className="space-y-4">
          <div className="glass-card rounded-xl p-4" style={{ background:t.card, borderColor:t.cardBorder }}>
            <h3 className="font-semibold text-sm mb-3">Monthly Revenue</h3>
            <div className="flex items-end gap-2 h-32">
              {[4200,5800,3900,7100,6500,8450].map((v,i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t-lg" style={{ height:`${(v/8450)*100}%`, background:`linear-gradient(to top,${t.accent},#8b5cf6)`, minHeight:4 }} />
                  <span className="text-[8px]" style={{ color:t.textMuted }}>{['Sep','Oct','Nov','Dec','Jan','Feb'][i]}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card rounded-xl p-4" style={{ background:t.card, borderColor:t.cardBorder }}>
            <h3 className="font-semibold text-sm mb-2">Performance Summary</h3>
            {[{l:'Job Completion Rate',v:'94%',c:'#22c55e'},{l:'Client Satisfaction',v:'4.75/5',c:'#f59e0b'},{l:'Repeat Client Rate',v:'67%',c:'#6366f1'},{l:'Avg Response Time',v:'12 min',c:'#06b6d4'}].map((m,i) => (
              <div key={i} className="flex justify-between py-2" style={{ borderTop:i?`1px solid ${t.cardBorder}`:'none' }}>
                <span className="text-xs">{m.l}</span><span className="text-xs font-bold" style={{ color:m.c }}>{m.v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInvite && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }} onClick={()=>setShowInvite(false)}>
          <div onClick={e=>e.stopPropagation()} className="w-full max-w-sm rounded-2xl p-5 space-y-4" style={{ background:isDark?'#1a1a2e':'#fff', border:`1px solid ${t.cardBorder}` }}>
            <h3 className="font-bold text-lg">Invite Employee</h3>
            <input value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)} placeholder="employee@email.com" className="w-full p-3 rounded-xl text-sm outline-none" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, color:t.text }} />
            <select className="w-full p-3 rounded-xl text-sm outline-none" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, color:t.text }}>
              <option>Field Worker</option><option>Manager</option><option>Admin</option>
            </select>
            {inviteSent ? <p className="text-sm text-center font-semibold" style={{ color:'#22c55e' }}>✓ Invitation sent!</p> : <button onClick={sendInvite} className="w-full py-3 rounded-xl text-sm font-semibold text-white" style={{ background:`linear-gradient(135deg,${t.accent},#8b5cf6)` }}>Send Invite</button>}
          </div>
        </div>
      )}
    </div>
  );
}
