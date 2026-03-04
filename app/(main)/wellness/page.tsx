"use client";
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { useAuthStore } from '@/store/useAuthStore';
import { getTheme } from '@/lib/theme';
import { IcoBack } from '@/components/Icons';

export default function WellnessPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const { user } = useAuthStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const [focusMode, setFocusMode] = useState(false);
  const [dailyLimit, setDailyLimit] = useState(120);

  const usage = { today:87, week:[45,92,78,110,65,87,0], avg:79 };
  const balance = usage.today < 60 ? 'Low' : usage.today < 120 ? 'Balanced' : 'High';
  const balanceColor = balance==='Low'?'#22c55e':balance==='Balanced'?'#f59e0b':'#ef4444';

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={()=>router.back()} style={{ background:'none', border:'none', color:t.text, cursor:'pointer' }}><IcoBack size={20} /></button>
        <h1 className="text-xl font-bold">Digital Wellness</h1>
      </div>
      <div className="glass-card rounded-2xl p-5" style={{ background:`linear-gradient(135deg,${balanceColor}15,${t.accent}15)`, borderColor:t.cardBorder }}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background:`${balanceColor}22` }}><span className="text-2xl font-bold" style={{ color:balanceColor }}>{usage.today}</span></div>
          <div><p className="font-bold text-lg">Today: {usage.today} min</p><p className="text-xs" style={{ color:t.textMuted }}>Social Balance: <span style={{ color:balanceColor, fontWeight:700 }}>{balance}</span></p><p className="text-[10px]" style={{ color:t.textMuted }}>Daily limit: {dailyLimit} min</p>
            <div className="h-2 rounded-full mt-2 w-40" style={{ background:t.surface }}><div className="h-full rounded-full" style={{ width:`${Math.min((usage.today/dailyLimit)*100,100)}%`, background:balanceColor }} /></div>
          </div>
        </div>
      </div>
      <div className="glass-card rounded-xl p-4" style={{ background:t.card, borderColor:t.cardBorder }}>
        <h3 className="font-semibold text-sm mb-3">Weekly Screen Time</h3>
        <div className="flex items-end gap-2 h-24">{usage.week.map((v,i)=>(<div key={i} className="flex-1 flex flex-col items-center gap-1"><div className="w-full rounded-t-lg" style={{ height:`${(v/120)*100}%`, background:v>dailyLimit?'#ef4444':`linear-gradient(to top,${t.accent},#8b5cf6)`, minHeight:2 }} /><span className="text-[8px]" style={{ color:t.textMuted }}>{['M','T','W','T','F','S','S'][i]}</span></div>))}</div>
        <p className="text-[10px] mt-2" style={{ color:t.textMuted }}>Weekly average: {usage.avg} min/day</p>
      </div>
      <div className="glass-card rounded-xl p-4 flex items-center justify-between" style={{ background:t.card, borderColor:t.cardBorder }}>
        <div><p className="font-semibold text-sm">Focus Mode</p><p className="text-[10px]" style={{ color:t.textMuted }}>Suppress non-urgent notifications</p></div>
        <button onClick={()=>setFocusMode(!focusMode)} className="w-12 h-6 rounded-full p-0.5" style={{ background:focusMode?'#22c55e':t.surface }}><div className="w-5 h-5 rounded-full bg-white transition-transform" style={{ transform:focusMode?'translateX(24px)':'translateX(0)' }} /></button>
      </div>
      <div className="glass-card rounded-xl p-4" style={{ background:t.card, borderColor:t.cardBorder }}>
        <h3 className="font-semibold text-sm mb-2">Set Daily Limit</h3>
        <div className="flex items-center gap-3"><input type="range" min={30} max={240} value={dailyLimit} onChange={e=>setDailyLimit(Number(e.target.value))} className="flex-1" style={{ accentColor:t.accent }} /><span className="font-bold text-sm" style={{ color:t.accent }}>{dailyLimit}m</span></div>
      </div>
      <div className="glass-card rounded-xl p-4" style={{ background:t.card, borderColor:t.cardBorder }}>
        <h3 className="font-semibold text-sm mb-2">Healthy Reminders</h3>
        {['Take a break every 30 minutes','Step outside for fresh air','Connect with friends offline','Practice mindful scrolling'].map((r,i)=>(<div key={i} className="flex items-center gap-2 py-1.5"><span className="text-sm">{'🌱💚🌿🧘'[i]}</span><p className="text-xs">{r}</p></div>))}
      </div>
    </div>
  );
}