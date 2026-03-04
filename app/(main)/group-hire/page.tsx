"use client";
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { useAuthStore } from '@/store/useAuthStore';
import { getTheme } from '@/lib/theme';
import { IcoBack } from '@/components/Icons';

const TEAMS = [
  { id:'t1', title:'Moving Team (3 workers)', job:'Apartment Move - Mar 5', workers:['Mike C.','David L.','James B.'], status:'confirmed', amount:450 },
  { id:'t2', title:'Catering Crew (5 workers)', job:'Birthday Party - Mar 12', workers:['Anita S.','Priya K.','Sarah C.'], status:'forming', amount:800, needed:2 },
];

export default function GroupHirePage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const { user } = useAuthStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={()=>router.back()} style={{ background:'none', border:'none', color:t.text, cursor:'pointer' }}><IcoBack size={20} /></button>
        <h1 className="text-xl font-bold flex-1">Group Hiring</h1>
        <button onClick={()=>setShowCreate(true)} className="px-4 py-2 rounded-xl text-xs font-semibold text-white" style={{ background:`linear-gradient(135deg,${t.accent},#8b5cf6)` }}>+ New Team Job</button>
      </div>
      <div className="glass-card rounded-xl p-4" style={{ background:`linear-gradient(135deg,${t.accent}15,#8b5cf622)`, borderColor:t.cardBorder }}>
        <p className="text-xs" style={{ color:t.textSecondary }}>🤖 AI Auto-Team Assembly: Our AI finds compatible workers based on skills, ratings, availability, and past collaboration history.</p>
      </div>
      {TEAMS.map(team=>(
        <div key={team.id} className="glass-card rounded-xl p-4" style={{ background:t.card, borderColor:t.cardBorder }}>
          <div className="flex justify-between items-start"><div><p className="font-semibold text-sm">{team.title}</p><p className="text-[10px]" style={{ color:t.textMuted }}>{team.job}</p></div><span className="font-bold text-sm" style={{ color:t.accent }}>${team.amount}</span></div>
          <div className="flex gap-1 mt-2 flex-wrap">{team.workers.map(w=>(<span key={w} className="text-[10px] px-2 py-1 rounded-full" style={{ background:t.accentLight, color:t.accent }}>{w}</span>))}{team.needed&&Array.from({length:team.needed}).map((_,i)=>(<span key={i} className="text-[10px] px-2 py-1 rounded-full" style={{ background:'rgba(239,68,68,0.1)', color:'#ef4444' }}>Needed</span>))}</div>
          <div className="flex items-center justify-between mt-3"><span className="text-[10px] px-2 py-1 rounded-full font-semibold" style={{ background:team.status==='confirmed'?'#22c55e22':'#f59e0b22', color:team.status==='confirmed'?'#22c55e':'#f59e0b' }}>{team.status}</span>
            <div className="flex gap-2"><button className="px-3 py-1.5 rounded-lg text-[10px] font-medium" style={{ background:t.accentLight, color:t.accent }}>Team Chat</button>{team.status==='forming'&&<button className="px-3 py-1.5 rounded-lg text-[10px] font-medium text-white" style={{ background:`linear-gradient(135deg,${t.accent},#8b5cf6)` }}>AI Fill Team</button>}</div>
          </div>
        </div>
      ))}

      {showCreate && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }} onClick={()=>setShowCreate(false)}>
          <div onClick={e=>e.stopPropagation()} className="w-full max-w-md rounded-2xl p-5 space-y-3" style={{ background:isDark?'#1a1a2e':'#fff', border:`1px solid ${t.cardBorder}` }}>
            <h3 className="font-bold text-lg">Create Team Job</h3>
            <input placeholder="Job title (e.g., Moving Team)" className="w-full p-3 rounded-xl text-sm outline-none" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, color:t.text }} />
            <div className="grid grid-cols-2 gap-2">
              <input type="number" placeholder="Workers needed" className="p-3 rounded-xl text-sm outline-none" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, color:t.text }} />
              <input type="number" placeholder="Total budget $" className="p-3 rounded-xl text-sm outline-none" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, color:t.text }} />
            </div>
            <textarea rows={3} placeholder="Job description..." className="w-full p-3 rounded-xl text-sm outline-none resize-none" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, color:t.text }} />
            <div className="flex gap-2"><button className="flex-1 py-3 rounded-xl text-sm font-semibold" style={{ background:t.accentLight, color:t.accent }}>🤖 AI Assemble Team</button><button onClick={()=>setShowCreate(false)} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white" style={{ background:`linear-gradient(135deg,${t.accent},#8b5cf6)` }}>Post Job</button></div>
          </div>
        </div>
      )}
    </div>
  );
}