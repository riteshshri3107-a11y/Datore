"use client";
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { IcoBack } from '@/components/Icons';

const COURSES = [
  { id:'c1', title:'Customer Service Excellence', duration:'5 min', icon:'💬', lessons:4, completed:3, category:'Soft Skills' },
  { id:'c2', title:'Workplace Safety Basics', duration:'8 min', icon:'🛡️', lessons:6, completed:6, category:'Safety' },
  { id:'c3', title:'Food Handling & Hygiene', duration:'7 min', icon:'🍽️', lessons:5, completed:2, category:'Certification' },
  { id:'c4', title:'First Aid Fundamentals', duration:'10 min', icon:'🏥', lessons:8, completed:0, category:'Certification' },
  { id:'c5', title:'Professional Communication', duration:'6 min', icon:'📧', lessons:4, completed:0, category:'Soft Skills' },
  { id:'c6', title:'Time Management for Gig Workers', duration:'4 min', icon:'⏰', lessons:3, completed:0, category:'Productivity' },
];

export default function LearnPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const [cat, setCat] = useState('All');
  const [started, setStarted] = useState<string|null>(null);
  const [lessonStep, setLessonStep] = useState(0);

  const cats = ['All','Soft Skills','Safety','Certification','Productivity'];
  const filtered = cat==='All'?COURSES:COURSES.filter(c=>c.category===cat);
  const totalCerts = COURSES.filter(c=>c.completed===c.lessons).length;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={()=>router.back()} style={{ background:'none', border:'none', color:t.text, cursor:'pointer' }}><IcoBack size={20} /></button>
        <h1 className="text-xl font-bold">Micro-Learning</h1>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card rounded-xl p-3 text-center" style={{ background:t.card, borderColor:t.cardBorder }}><p className="text-lg font-bold" style={{ color:t.accent }}>{totalCerts}</p><p className="text-[10px]" style={{ color:t.textMuted }}>Certifications</p></div>
        <div className="glass-card rounded-xl p-3 text-center" style={{ background:t.card, borderColor:t.cardBorder }}><p className="text-lg font-bold" style={{ color:'#22c55e' }}>11/30</p><p className="text-[10px]" style={{ color:t.textMuted }}>Lessons Done</p></div>
        <div className="glass-card rounded-xl p-3 text-center" style={{ background:t.card, borderColor:t.cardBorder }}><p className="text-lg font-bold" style={{ color:'#f59e0b' }}>2h 15m</p><p className="text-[10px]" style={{ color:t.textMuted }}>Time Spent</p></div>
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-1">{cats.map(c=>(<button key={c} onClick={()=>setCat(c)} className="px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap" style={{ background:cat===c?t.accentLight:'transparent', color:cat===c?t.accent:t.textSecondary }}>{c}</button>))}</div>
      {filtered.map(c=>{const pct=Math.round((c.completed/c.lessons)*100);return(
        <div key={c.id} className="glass-card rounded-xl p-4" style={{ background:t.card, borderColor:t.cardBorder }}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{c.icon}</span>
            <div className="flex-1"><p className="font-semibold text-sm">{c.title}</p><p className="text-[10px]" style={{ color:t.textMuted }}>{c.duration} · {c.lessons} lessons · {c.category}</p>
              <div className="h-1.5 rounded-full mt-1.5" style={{ background:t.surface }}><div className="h-full rounded-full" style={{ width:`${pct}%`, background:pct===100?'#22c55e':t.accent }} /></div>
            </div>
            <button onClick={()=>{setStarted(c.id);setLessonStep(c.completed);}} className="px-3 py-1.5 rounded-lg text-[10px] font-semibold text-white" style={{ background:pct===100?'#22c55e':`linear-gradient(135deg,${t.accent},#8b5cf6)` }}>{pct===100?'✓ Done':pct>0?'Continue':'Start'}</button>
          </div>
        </div>
      );})}

      {started && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }} onClick={()=>setStarted(null)}>
          <div onClick={e=>e.stopPropagation()} className="w-full max-w-md rounded-2xl p-6 space-y-4" style={{ background:isDark?'#1a1a2e':'#fff', border:`1px solid ${t.cardBorder}` }}>
            <h3 className="font-bold text-lg">{COURSES.find(c=>c.id===started)?.title}</h3>
            <div className="flex gap-1">{Array.from({length:COURSES.find(c=>c.id===started)?.lessons||0}).map((_,i)=>(<div key={i} className="flex-1 h-1.5 rounded-full" style={{ background:i<=lessonStep?t.accent:t.surface }} />))}</div>
            <div className="p-4 rounded-xl" style={{ background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.02)', minHeight:120 }}>
              <p className="text-sm font-semibold">Lesson {lessonStep+1}</p>
              <p className="text-xs mt-2" style={{ color:t.textSecondary }}>Interactive lesson content would appear here with quizzes, videos, and practical exercises.</p>
            </div>
            <div className="flex gap-2">
              {lessonStep > 0 && <button onClick={()=>setLessonStep(p=>p-1)} className="flex-1 py-3 rounded-xl text-sm font-medium" style={{ background:t.surface, border:`1px solid ${t.cardBorder}` }}>Previous</button>}
              <button onClick={()=>{const max=(COURSES.find(c=>c.id===started)?.lessons||1)-1; if(lessonStep<max)setLessonStep(p=>p+1); else setStarted(null);}} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white" style={{ background:`linear-gradient(135deg,${t.accent},#8b5cf6)` }}>{lessonStep>=((COURSES.find(c=>c.id===started)?.lessons||1)-1)?'Complete ✓':'Next Lesson'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}