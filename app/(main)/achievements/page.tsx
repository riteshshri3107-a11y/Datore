"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { useAuthStore } from '@/store/useAuthStore';
import { getProfileStats } from '@/lib/supabase';
import { IcoBack } from '@/components/Icons';

const DEFAULT_BADGES = [
  { id:'b1', name:'First Job', desc:'Completed your first job', icon:'🎯', earned:true, date:'Jan 15' },
  { id:'b2', name:'5-Star Streak', desc:'Received 5 consecutive 5-star reviews', icon:'⭐', earned:true, date:'Feb 1' },
  { id:'b3', name:'Community Helper', desc:'Helped 10 people in community', icon:'🤝', earned:true, date:'Feb 10' },
  { id:'b4', name:'Trusted Neighbor', desc:'Trust score above 90', icon:'🛡️', earned:false, progress:82 },
  { id:'b5', name:'Top Worker', desc:'Complete 100 jobs', icon:'🏆', earned:false, progress:34 },
  { id:'b6', name:'Social Butterfly', desc:'Make 50 friends', icon:'🦋', earned:false, progress:48 },
  { id:'b7', name:'Reel Creator', desc:'Post 10 reels', icon:'🎬', earned:false, progress:0 },
  { id:'b8', name:'Diamond Member', desc:'Reach Diamond tier', icon:'💎', earned:false, progress:15 },
];

const TIERS = [{name:'Bronze',min:0,color:'#CD7F32'},{name:'Silver',min:500,color:'#C0C0C0'},{name:'Gold',min:2000,color:'#FFD700'},{name:'Platinum',min:5000,color:'#E5E4E2'},{name:'Diamond',min:10000,color:'#B9F2FF'}];

export default function AchievementsPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const { user, profile } = useAuthStore();
  const [xp, setXp] = useState(2340);
  const [streak, setStreak] = useState(7);
  const [BADGES, setBadges] = useState(DEFAULT_BADGES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (user?.id) {
        try {
          const stats = await getProfileStats(user.id);
          if (stats) {
            const completedJobs = stats.completed_jobs || 0;
            const reviewCount = stats.review_count || 0;
            const trustScore = stats.trust_score || 0;
            const calculatedXp = completedJobs * 50 + reviewCount * 30 + trustScore * 10;
            if (calculatedXp > 0) setXp(calculatedXp);
            setBadges(prev => prev.map(b => {
              if (b.id === 'b1') return { ...b, earned: completedJobs >= 1 };
              if (b.id === 'b5') return { ...b, progress: Math.min(100, completedJobs) };
              if (b.id === 'b4') return { ...b, earned: trustScore >= 90, progress: trustScore };
              return b;
            }));
          }
        } catch {}
      }
      setLoading(false);
    })();
  }, [user?.id]);

  const level = Math.floor(Math.pow(xp/100, 1/1.5));
  const currentTier = TIERS.filter(t=>xp>=t.min).pop()||TIERS[0];
  const nextTier = TIERS[TIERS.indexOf(currentTier)+1];

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={()=>router.back()} style={{ background:'none', border:'none', color:t.text, cursor:'pointer' }}><IcoBack size={20} /></button>
        <h1 className="text-xl font-bold">Achievements</h1>
      </div>
      <div className="glass-card rounded-2xl p-5" style={{ background:`linear-gradient(135deg,${currentTier.color}33,${t.accent}22)`, borderColor:t.cardBorder }}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ background:`${currentTier.color}33` }}>🏅</div>
          <div className="flex-1">
            <p className="font-bold text-lg" style={{ color:currentTier.color }}>{currentTier.name} Tier</p>
            <p className="text-xs" style={{ color:t.textSecondary }}>Level {level} · {xp.toLocaleString()} XP</p>
            {nextTier && <><div className="h-2 rounded-full mt-2" style={{ background:t.surface }}><div className="h-full rounded-full" style={{ width:`${((xp-currentTier.min)/(nextTier.min-currentTier.min))*100}%`, background:`linear-gradient(90deg,${currentTier.color},${nextTier.color})` }} /></div><p className="text-[10px] mt-1" style={{ color:t.textMuted }}>{nextTier.min-xp} XP to {nextTier.name}</p></>}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card rounded-xl p-3 text-center" style={{ background:t.card, borderColor:t.cardBorder }}><p className="text-2xl">🔥</p><p className="text-lg font-bold" style={{ color:'#f59e0b' }}>{streak}</p><p className="text-[10px]" style={{ color:t.textMuted }}>Day Streak</p></div>
        <div className="glass-card rounded-xl p-3 text-center" style={{ background:t.card, borderColor:t.cardBorder }}><p className="text-2xl">🏅</p><p className="text-lg font-bold" style={{ color:t.accent }}>{BADGES.filter(b=>b.earned).length}/{BADGES.length}</p><p className="text-[10px]" style={{ color:t.textMuted }}>Badges</p></div>
        <div className="glass-card rounded-xl p-3 text-center" style={{ background:t.card, borderColor:t.cardBorder }}><p className="text-2xl">📊</p><p className="text-lg font-bold" style={{ color:'#22c55e' }}>#12</p><p className="text-[10px]" style={{ color:t.textMuted }}>City Rank</p></div>
      </div>
      <h3 className="font-semibold text-sm">Badges</h3>
      <div className="grid grid-cols-2 gap-3">
        {BADGES.map(b=>(<div key={b.id} className="glass-card rounded-xl p-3" style={{ background:t.card, borderColor:t.cardBorder, opacity:b.earned?1:0.6 }}>
          <div className="flex items-center gap-2 mb-1"><span className="text-xl">{b.icon}</span><div><p className="text-xs font-semibold">{b.name}</p><p className="text-[10px]" style={{ color:t.textMuted }}>{b.desc}</p></div></div>
          {b.earned ? <p className="text-[10px] font-semibold" style={{ color:'#22c55e' }}>✓ Earned {b.date}</p> : <div className="h-1.5 rounded-full mt-1" style={{ background:t.surface }}><div className="h-full rounded-full" style={{ width:`${b.progress}%`, background:t.accent }} /></div>}
        </div>))}
      </div>
    </div>
  );
}