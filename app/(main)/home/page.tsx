"use client";
export const dynamic = "force-dynamic";
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { DEMO_WORKERS, DEMO_JOBS } from '@/lib/demoData';

export default function HomePage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const actions = [
    { icon:'\ud83d\udcbc', label:'Post Job', path:'/jobplace/create', bg:'#6366f1' },
    { icon:'\ud83d\udc77', label:'Find Workers', path:'/jobplace/providers', bg:'#22c55e' },
    { icon:'\ud83d\uddfa\ufe0f', label:'Map View', path:'/jobplace/map', bg:'#f59e0b' },
    { icon:'\ud83c\udfea', label:'Marketplace', path:'/marketplace', bg:'#ec4899' },
    { icon:'\ud83d\udcb0', label:'Wallet', path:'/wallet', bg:'#8b5cf6' },
    { icon:'\u2b50', label:'Buddy List', path:'/buddylist', bg:'#eab308' },
    { icon:'\ud83d\udc65', label:'Community', path:'/community', bg:'#06b6d4' },
    { icon:'\ud83d\udcac', label:'Messages', path:'/inbox', bg:'#f97316' },
  ];

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl mx-auto">
      <div className="glass-card rounded-2xl p-5" style={{ background:`linear-gradient(135deg,${t.accent}22,#8b5cf622)`, borderColor:t.cardBorder, boxShadow:t.glassShadow }}>
        <p className="text-xs" style={{ color:t.textMuted }}>Welcome back</p>
        <h1 className="text-xl font-bold mt-1">Hello! \ud83d\udc4b</h1>
        <p className="text-xs mt-1" style={{ color:t.textSecondary }}>What do you need help with today?</p>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {actions.map(a=>(<button key={a.path} onClick={()=>router.push(a.path)} className="flex flex-col items-center gap-1.5 p-3 rounded-xl glass-card" style={{ background:t.card, borderColor:t.cardBorder }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background:`${a.bg}22` }}>{a.icon}</div>
          <span className="text-[10px] font-medium" style={{ color:t.textSecondary }}>{a.label}</span>
        </button>))}
      </div>
      <div>
        <div className="flex items-center justify-between mb-2"><h2 className="font-semibold text-sm">\ud83d\udd25 Recent Jobs</h2><button onClick={()=>router.push('/jobplace')} className="text-xs" style={{ color:t.accent }}>See all</button></div>
        <div className="space-y-2">
          {DEMO_JOBS.slice(0,3).map(j=>(<div key={j.id} onClick={()=>router.push(`/jobplace/job/${j.id}`)} className="glass-card rounded-xl p-3 flex items-center gap-3 cursor-pointer" style={{ background:t.card, borderColor:t.cardBorder }}>
            <div className="flex-1"><p className="font-medium text-sm">{j.title}</p><p className="text-xs" style={{ color:t.textSecondary }}>{j.category} \u00b7 {j.location}</p></div>
            <span className="font-bold text-sm" style={{ color:t.accent }}>${j.amount}{j.payment==='hourly'?'/hr':''}</span>
          </div>))}
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-2"><h2 className="font-semibold text-sm">\ud83c\udf1f Top Workers</h2><button onClick={()=>router.push('/jobplace/providers')} className="text-xs" style={{ color:t.accent }}>See all</button></div>
        <div className="grid grid-cols-2 gap-2">
          {DEMO_WORKERS.filter(w=>w.availability==='available').slice(0,4).map(w=>(<div key={w.id} onClick={()=>router.push(`/worker/${w.id}`)} className="glass-card rounded-xl p-3 cursor-pointer" style={{ background:t.card, borderColor:t.cardBorder }}>
            <div className="flex items-center gap-2 mb-1.5"><div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background:`linear-gradient(135deg,${t.accent}33,#8b5cf633)`, color:t.accent }}>{w.full_name.split(' ').map(n=>n[0]).join('')}</div><div><p className="text-xs font-semibold">{w.full_name}</p><p className="text-[10px]" style={{ color:t.textMuted }}>\u2605{w.rating}</p></div></div>
            <div className="flex flex-wrap gap-1">{w.skills.slice(0,2).map(s=><span key={s} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background:t.accentLight, color:t.accent }}>{s}</span>)}</div>
          </div>))}
        </div>
      </div>
    </div>
  );
}