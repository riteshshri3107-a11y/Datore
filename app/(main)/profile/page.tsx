"use client";
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { getFavorites, getProfilePrefs } from '@/lib/demoData';

export default function ProfilePage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const [tab, setTab] = useState<'about'|'activity'|'settings'>('about');
  const prefs = getProfilePrefs();
  const [profile] = useState({ name:prefs.name||'Demo User', email:'demo@datore.app', phone:'+1 (416) ***-**89', city:'Toronto', country:'Canada', bio:'Datore community member. Exploring local services and connecting with professionals.', jobsPosted:3, jobsCompleted:5, rating:4.7, reviews:12, trust:78, skills:['Home Services','General'], joined:'Feb 2024', displayPref:prefs.displayPref||'card' });
  const favCount = getFavorites().length;

  return (
    <div className="space-y-4 animate-fade-in max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">👤 My Profile</h1>
        <button onClick={()=>router.push('/profile/edit')} className="px-4 py-1.5 rounded-xl text-xs font-medium" style={{ background:t.accentLight, color:t.accent }}>✏️ Edit</button>
      </div>
      <div className="glass-card rounded-2xl p-5 text-center" style={{ background:t.card, borderColor:t.cardBorder, boxShadow:t.glassShadow }}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mx-auto" style={{ background:`linear-gradient(135deg,${t.accent}44,#8b5cf644)`, color:t.accent }}>DU</div>
        <h2 className="text-lg font-bold mt-3">{profile.name}</h2>
        <p className="text-xs" style={{ color:t.textSecondary }}>📍 {profile.city}, {profile.country} ● Member since {profile.joined}</p>
        <div className="flex justify-center gap-6 mt-4">
          <div><p className="font-bold text-lg">{profile.jobsPosted}</p><p className="text-[10px]" style={{ color:t.textMuted }}>Posted</p></div>
          <div><p className="font-bold text-lg">{profile.jobsCompleted}</p><p className="text-[10px]" style={{ color:t.textMuted }}>Done</p></div>
          <div><p className="font-bold text-lg" style={{ color:'#f59e0b' }}>{profile.rating}</p><p className="text-[10px]" style={{ color:t.textMuted }}>Rating</p></div>
          <div><p className="font-bold text-lg" style={{ color:profile.trust>=80?'#22c55e':'#eab308' }}>{profile.trust}</p><p className="text-[10px]" style={{ color:t.textMuted }}>Trust</p></div>
        </div>
      </div>
      <div className="flex gap-2">{(['about','activity','settings'] as const).map(tb=>(<button key={tb} onClick={()=>setTab(tb)} className="flex-1 py-2 rounded-xl text-xs font-medium capitalize" style={{ background:tab===tb?t.accentLight:t.surface, color:tab===tb?t.accent:t.textSecondary }}>{tb}</button>))}</div>
      {tab==='about' && <div className="space-y-3">
        <div className="glass-card rounded-2xl p-4" style={{ background:t.card, borderColor:t.cardBorder }}><h3 className="font-semibold text-sm mb-2">About</h3><p className="text-sm" style={{ color:t.textSecondary }}>{profile.bio}</p></div>
        <div className="glass-card rounded-2xl p-4" style={{ background:t.card, borderColor:t.cardBorder }}><h3 className="font-semibold text-sm mb-2">Contact (Masked)</h3><p className="text-xs" style={{ color:t.textMuted }}>📧 {profile.email}</p><p className="text-xs" style={{ color:t.textMuted }}>📱 {profile.phone}</p></div>
      </div>}
      {tab==='activity' && <div className="space-y-2">
        {[{ icon:'💼', label:'My Jobs', sub:`${profile.jobsPosted} active`, path:'/jobplace' },{ icon:'⭐', label:'Buddy List', sub:`${favCount} favorites`, path:'/buddylist' },{ icon:'💰', label:'Wallet', sub:'View balance', path:'/wallet' },{ icon:'👥', label:'Communities', sub:'Your groups', path:'/community' },{ icon:'💬', label:'Messages', sub:'Conversations', path:'/inbox' }].map(item=>(<div key={item.path} onClick={()=>router.push(item.path)} className="glass-card rounded-xl p-4 flex items-center gap-3 cursor-pointer" style={{ background:t.card, borderColor:t.cardBorder }}><span className="text-xl">{item.icon}</span><div className="flex-1"><p className="font-medium text-sm">{item.label}</p><p className="text-xs" style={{ color:t.textSecondary }}>{item.sub}</p></div><span style={{ color:t.textMuted }}>→</span></div>))}
      </div>}
      {tab==='settings' && <div className="space-y-2">
        {[{ icon:'⚙️', label:'App Settings', path:'/settings' },{ icon:'🔔', label:'Notifications', path:'/notifications' }].map(item=>(<div key={item.path} onClick={()=>router.push(item.path)} className="glass-card rounded-xl p-4 flex items-center gap-3 cursor-pointer" style={{ background:t.card, borderColor:t.cardBorder }}><span>{item.icon}</span><p className="flex-1 text-sm font-medium">{item.label}</p><span style={{ color:t.textMuted }}>→</span></div>))}
      </div>}
    </div>
  );
}