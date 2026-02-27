"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { getJoinedCommunities, toggleCommunity } from '@/lib/demoData';

const COMMUNITIES = [
  { id:'c1', name:'Toronto Handyworkers', desc:'Local handyman services', members:2340, emoji:'🔧', category:'Services' },
  { id:'c2', name:'GTA Babysitters', desc:'Trusted babysitting community', members:1890, emoji:'👶', category:'Childcare' },
  { id:'c3', name:'Home Cleaning Pros', desc:'Professional cleaners network', members:3100, emoji:'🧹', category:'Cleaning' },
  { id:'c4', name:'Tech Support Hub', desc:'IT and tech assistance', members:920, emoji:'💻', category:'Tech' },
  { id:'c5', name:'Pet Lovers GTA', desc:'Pet care and walking', members:4200, emoji:'🐕', category:'Pets' },
  { id:'c6', name:'Tutoring Network', desc:'Academic tutoring', members:1560, emoji:'📚', category:'Education' },
  { id:'c7', name:'Moving Helpers TO', desc:'Reliable movers in Toronto', members:780, emoji:'🚚', category:'Moving' },
  { id:'c8', name:'GTA Cooks & Chefs', desc:'Personal chefs and catering', members:2100, emoji:'🍳', category:'Food' },
];

export default function CommunityPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const [tab, setTab] = useState<'discover'|'joined'|'manage'>('discover');
  const [search, setSearch] = useState('');
  const [joined, setJoined] = useState<string[]>([]);

  useEffect(() => { setJoined(getJoinedCommunities()); }, []);
  const handleToggle = (id: string) => { toggleCommunity(id); setJoined(getJoinedCommunities()); };
  const filtered = COMMUNITIES.filter(c => (!search || c.name.toLowerCase().includes(search.toLowerCase()) || c.category.toLowerCase().includes(search.toLowerCase())) && (tab==='discover' ? !joined.includes(c.id) : joined.includes(c.id)));

  return (
    <div className="space-y-4 animate-fade-in max-w-lg mx-auto">
      <h1 className="text-xl font-bold">👥 Community</h1>
      <div className="flex gap-2">
        {(['discover','joined','manage'] as const).map(tb=>(<button key={tb} onClick={()=>setTab(tb)} className="px-4 py-2 rounded-xl text-xs font-medium capitalize" style={{ background:tab===tb?t.accentLight:'transparent', color:tab===tb?t.accent:t.textSecondary, border:tab===tb?`1px solid ${t.accent}33`:'1px solid transparent' }}>{tb} {tb==='joined'&&joined.length>0?`(${joined.length})`:''} </button>))}
      </div>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search communities..." className="w-full p-3 rounded-xl text-sm outline-none" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, color:t.text }} />
      {filtered.length===0 ? (
        <div className="text-center py-10 glass-card rounded-2xl" style={{ background:t.card, borderColor:t.cardBorder }}>
          <p className="text-3xl mb-2">{tab==='discover'?'🎉':'👥'}</p>
          <p className="text-sm" style={{ color:t.textSecondary }}>{tab==='discover'?'You joined all communities!':'No communities joined yet'}</p>
          {tab!=='discover' && <button onClick={()=>setTab('discover')} className="text-xs mt-2" style={{ color:t.accent }}>Discover communities →</button>}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(c=>(<div key={c.id} className="glass-card rounded-xl p-4 flex items-center gap-3 cursor-pointer" style={{ background:t.card, borderColor:t.cardBorder }} onClick={()=>router.push(`/community/${c.id}`)}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background:`${t.accent}15` }}>{c.emoji}</div>
            <div className="flex-1"><p className="font-semibold text-sm">{c.name}</p><p className="text-xs" style={{ color:t.textSecondary }}>{c.desc}</p><p className="text-[11px]" style={{ color:t.textMuted }}>{c.members.toLocaleString()} members</p></div>
            <button onClick={(e)=>{e.stopPropagation();handleToggle(c.id);}} className="px-4 py-2 rounded-xl text-xs font-semibold" style={{ background:joined.includes(c.id)?'rgba(239,68,68,0.1)':t.accentLight, color:joined.includes(c.id)?'#ef4444':t.accent, border:`1px solid ${joined.includes(c.id)?'rgba(239,68,68,0.2)':t.accent+'33'}` }}>{joined.includes(c.id)?'Leave':'Join'}</button>
          </div>))}
        </div>
      )}
    </div>
  );
}