"use client";
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { IcoBack, IcoUser } from '@/components/Icons';

const CRS = { total:87, breakdown:{ jobRating:92, reliability:88, helpfulness:79, peerEndorsements:85, communityParticipation:82, accountAge:96 }, weights:{ jobRating:0.35, reliability:0.20, helpfulness:0.15, peerEndorsements:0.15, communityParticipation:0.10, accountAge:0.05 } };
const BADGES = [{name:'Trusted Neighbor',icon:'🏘️',date:'Jan 2026'},{name:'5-Star Streak',icon:'⭐',date:'Feb 2026'},{name:'Top Helper',icon:'🤝',date:'Feb 2026'},{name:'First Responder',icon:'🚀',date:'Dec 2025'}];
const ENDORSE = [{from:'Maria S.',skill:'Great with kids',time:'2d ago'},{from:'John D.',skill:'Very punctual',time:'5d ago'},{from:'Li Wei',skill:'Professional attitude',time:'1w ago'},{from:'Priya K.',skill:'Excellent communication',time:'2w ago'}];
const SOCIAL = { friends:48, engagement:72, responseTime:'12 min', posts:23, weeklyActivity:[65,82,74,91,68,55,87] };
const CLUSTERS = [{name:'Home Services',count:18,color:'#6366f1'},{name:'Education',count:12,color:'#22c55e'},{name:'Pet Care',count:8,color:'#f59e0b'},{name:'Other',count:10,color:'#8b5cf6'}];
const LEADERS = [{rank:1,name:'Sarah Chen',score:96,badge:'🏆'},{rank:2,name:'Mike L.',score:93,badge:'🥈'},{rank:3,name:'You',score:87,badge:'🥉',isYou:true},{rank:4,name:'Anita S.',score:85},{rank:5,name:'David R.',score:82}];

export default function SocialAnalyticsPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const [tab, setTab] = useState<'crs'|'analytics'|'network'|'leaders'>('crs');
  const crsColor = CRS.total >= 80 ? '#22c55e' : '#f59e0b';
  const mx = Math.max(...SOCIAL.weeklyActivity);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={()=>router.back()} style={{ background:'none', border:'none', color:t.text, cursor:'pointer' }}><IcoBack size={20} /></button>
        <h1 className="text-xl font-bold flex-1">Social Analytics</h1>
      </div>
      <div className="flex gap-1">{(['crs','analytics','network','leaders'] as const).map(tb=>(<button key={tb} onClick={()=>setTab(tb)} className="px-3 py-2 rounded-xl text-xs font-medium capitalize" style={{ background:tab===tb?t.accentLight:'transparent', color:tab===tb?t.accent:t.textSecondary }}>{tb==='crs'?'CRS Score':tb}</button>))}</div>

      {tab==='crs' && <div className="space-y-4">
        <div className="rounded-2xl p-5 text-center" style={{ background:`${crsColor}10`, border:`1px solid ${t.cardBorder}` }}>
          <p className="text-[10px]" style={{ color:t.textMuted }}>Community Rating Score</p>
          <div className="relative inline-flex items-center justify-center w-28 h-28">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90"><circle cx="50" cy="50" r="42" fill="none" stroke={t.surface} strokeWidth="8"/><circle cx="50" cy="50" r="42" fill="none" stroke={crsColor} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${CRS.total*2.64} ${264-CRS.total*2.64}`}/></svg>
            <span className="absolute text-3xl font-bold" style={{ color:crsColor }}>{CRS.total}</span>
          </div>
          <p className="text-xs font-medium mt-1" style={{ color:crsColor }}>Excellent Standing</p>
        </div>
        <div className="rounded-xl p-4 space-y-3" style={{ background:t.card, border:`1px solid ${t.cardBorder}` }}>
          <p className="text-xs font-bold">Score Breakdown</p>
          {Object.entries(CRS.breakdown).map(([key,val])=>{const w=CRS.weights[key as keyof typeof CRS.weights];const lbl=key.replace(/([A-Z])/g,' $1').replace(/^./,s=>s.toUpperCase());return(
            <div key={key} className="space-y-1"><div className="flex justify-between text-[11px]"><span>{lbl}</span><span className="font-bold" style={{color:val>=80?'#22c55e':'#f59e0b'}}>{val}/100 <span className="font-normal" style={{color:t.textMuted}}>({(w*100).toFixed(0)}%)</span></span></div><div className="h-1.5 rounded-full" style={{background:t.surface}}><div className="h-full rounded-full" style={{width:`${val}%`,background:val>=80?'#22c55e':'#f59e0b'}}/></div></div>
          );})}
        </div>
        <div className="rounded-xl p-4" style={{ background:t.card, border:`1px solid ${t.cardBorder}` }}>
          <p className="text-xs font-bold mb-3">Badges</p>
          <div className="grid grid-cols-2 gap-2">{BADGES.map(b=>(<div key={b.name} className="flex items-center gap-2 p-2 rounded-lg" style={{background:t.surface}}><span className="text-xl">{b.icon}</span><div><p className="text-[11px] font-semibold">{b.name}</p><p className="text-[9px]" style={{color:t.textMuted}}>{b.date}</p></div></div>))}</div>
        </div>
        <div className="rounded-xl p-4" style={{ background:t.card, border:`1px solid ${t.cardBorder}` }}>
          <p className="text-xs font-bold mb-3">Endorsements</p>
          {ENDORSE.map((e,i)=>(<div key={i} className="flex items-center gap-3 py-2" style={{borderBottom:i<ENDORSE.length-1?`1px solid ${t.cardBorder}`:'none'}}><div className="w-8 h-8 rounded-full flex items-center justify-center" style={{background:t.surface}}><IcoUser size={14} color={t.textMuted}/></div><div className="flex-1"><p className="text-xs"><span className="font-semibold">{e.from}</span> — <span style={{color:t.accent}}>"{e.skill}"</span></p></div><span className="text-[10px]" style={{color:t.textMuted}}>{e.time}</span></div>))}
        </div>
      </div>}

      {tab==='analytics' && <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">{[{l:'Friends',v:SOCIAL.friends,c:'#6366f1'},{l:'Engagement',v:`${SOCIAL.engagement}%`,c:'#22c55e'},{l:'Avg Response',v:SOCIAL.responseTime,c:'#f59e0b'},{l:'Posts',v:SOCIAL.posts,c:'#8b5cf6'}].map(m=>(<div key={m.l} className="rounded-xl p-4" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}><p className="text-[10px]" style={{color:t.textMuted}}>{m.l}</p><p className="text-xl font-bold" style={{color:m.c}}>{m.v}</p></div>))}</div>
        <div className="rounded-xl p-4" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
          <p className="text-xs font-bold mb-3">Weekly Activity</p>
          <div className="flex items-end gap-2 h-24">{SOCIAL.weeklyActivity.map((v,i)=>(<div key={i} className="flex-1 flex flex-col items-center gap-1"><div className="w-full rounded-t-md" style={{height:`${(v/mx)*100}%`,background:`linear-gradient(180deg,${t.accent},#8b5cf6)`,opacity:i===6?1:0.6}}/><span className="text-[8px]" style={{color:t.textMuted}}>{['M','T','W','T','F','S','S'][i]}</span></div>))}</div>
        </div>
      </div>}

      {tab==='network' && <div className="space-y-4">
        <div className="rounded-xl p-5" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
          <p className="text-xs font-bold mb-4">Network Clusters</p>
          <div className="flex items-center justify-center"><div className="relative w-40 h-40">{CLUSTERS.map((c,i)=>{const sz=30+(c.count/18)*40;const a=(i/CLUSTERS.length)*Math.PI*2-Math.PI/2;const x=50+Math.cos(a)*30;const y=50+Math.sin(a)*30;return(<div key={c.name} className="absolute rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{width:sz,height:sz,background:c.color,left:`${x}%`,top:`${y}%`,transform:'translate(-50%,-50%)'}}>{c.count}</div>);})}<div className="absolute rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{width:36,height:36,background:t.accent,left:'50%',top:'50%',transform:'translate(-50%,-50%)'}}>You</div></div></div>
          <div className="flex flex-wrap gap-2 mt-4 justify-center">{CLUSTERS.map(c=>(<span key={c.name} className="text-[10px] px-2 py-1 rounded-lg" style={{background:`${c.color}22`,color:c.color}}>{c.name} ({c.count})</span>))}</div>
        </div>
      </div>}

      {tab==='leaders' && <div className="space-y-3">
        <p className="text-[10px]" style={{color:t.textMuted}}>Top Contributors · Your Neighborhood</p>
        {LEADERS.map(l=>(<div key={l.rank} className="flex items-center gap-3 rounded-xl p-3" style={{background:l.isYou?`${t.accent}15`:t.card,border:`1px solid ${l.isYou?t.accent:t.cardBorder}`}}><span className="text-lg font-bold w-6 text-center" style={{color:l.rank<=3?['#f59e0b','#94a3b8','#cd7f32'][l.rank-1]:t.textMuted}}>{l.badge||`#${l.rank}`}</span><div className="w-8 h-8 rounded-full flex items-center justify-center" style={{background:l.isYou?`${t.accent}22`:t.surface}}><IcoUser size={14} color={l.isYou?t.accent:t.textMuted}/></div><div className="flex-1"><p className="text-xs font-semibold" style={{color:l.isYou?t.accent:t.text}}>{l.name}</p></div><span className="text-xs font-bold" style={{color:l.score>=90?'#22c55e':t.accent}}>{l.score}</span></div>))}
      </div>}
    </div>
  );
}
