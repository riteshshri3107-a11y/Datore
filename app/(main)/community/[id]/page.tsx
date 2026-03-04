"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { useAuthStore } from '@/store/useAuthStore';
import { getCommunity, joinCommunity, leaveCommunity } from '@/lib/supabase';
import { getJoinedCommunities, toggleCommunity } from '@/lib/demoData';

const CDATA: Record<string,{name:string;emoji:string;desc:string;members:number;posts:{user:string;text:string;time:string;likes:number}[]}> = {
  c1: { name:'Toronto Handyworkers', emoji:'🔧', desc:'Connect with local handymen for all your home repair needs.', members:2340, posts:[{ user:'Robert C.', text:'Anyone available for a fence repair in Scarborough this weekend?', time:'2 hours ago', likes:3 },{ user:'Ryan W.', text:'Just completed a deck build!', time:'5 hours ago', likes:12 }] },
  c2: { name:'GTA Babysitters', emoji:'👶', desc:'Trusted babysitting community for the GTA.', members:1890, posts:[{ user:'Maria S.', text:'Available for last-minute evening babysitting!', time:'1 hour ago', likes:5 }] },
  c3: { name:'Home Cleaning Pros', emoji:'🧹', desc:'Professional cleaners sharing tips and reviews.', members:3100, posts:[{ user:'Priya S.', text:'Best eco-friendly cleaning products? Drop your favorites!', time:'30 min ago', likes:15 }] },
};

export default function CommunityDetailPage() {
  const router = useRouter(); const params = useParams();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const { user, profile } = useAuthStore();
  const id = params.id as string;
  const fallback = CDATA[id] || { name:'Community', emoji:'👥', desc:'Group', members:100, posts:[] };
  const [communityData, setCommunityData] = useState(fallback);
  const [isMember, setIsMember] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [posts, setPosts] = useState(fallback.posts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsMember(getJoinedCommunities().includes(id));
    (async () => {
      try {
        const data = await getCommunity(id);
        if (data) {
          setCommunityData({
            name: data.name || fallback.name,
            emoji: fallback.emoji,
            desc: data.description || fallback.desc,
            members: data.member_count || fallback.members,
            posts: fallback.posts,
          });
        }
      } catch {}
      setLoading(false);
    })();
  }, [id]);

  const handleJoin = async () => {
    toggleCommunity(id);
    setIsMember(!isMember);
    if (user?.id) {
      try {
        if (isMember) await leaveCommunity(id, user.id);
        else await joinCommunity(id, user.id);
      } catch {}
    }
  };
  const handlePost = () => { if(!newPost.trim()) return; setPosts([{ user: profile?.name || 'You', text:newPost.trim(), time:'Just now', likes:0 }, ...posts]); setNewPost(''); };

  return (
    <div className="space-y-4 animate-fade-in ">
      <div className="flex items-center gap-3"><button onClick={()=>router.back()} className="text-lg">←</button><h1 className="text-xl font-bold">{communityData.emoji} {communityData.name}</h1></div>
      {loading ? (
        <div className="text-center py-8"><div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: t.accent, borderTopColor: 'transparent' }} /><p className="text-xs mt-2" style={{ color: t.textMuted }}>Loading...</p></div>
      ) : (
        <>
          <div className="glass-card rounded-2xl p-4" style={{ background:t.card, borderColor:t.cardBorder }}>
            <p className="text-sm" style={{ color:t.textSecondary }}>{communityData.desc}</p>
            <p className="text-xs mt-2" style={{ color:t.textMuted }}>{communityData.members.toLocaleString()} members</p>
            <button onClick={handleJoin} className="mt-3 px-5 py-2 rounded-xl text-xs font-semibold" style={{ background:isMember?'rgba(239,68,68,0.1)':t.accentLight, color:isMember?'#ef4444':t.accent }}>{isMember?'Leave Group':'Join Group'}</button>
          </div>
          {isMember && (
            <div className="glass-card rounded-xl p-3 flex gap-2" style={{ background:t.card, borderColor:t.cardBorder }}>
              <input value={newPost} onChange={e=>setNewPost(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handlePost()} placeholder="Share something..." className="flex-1 p-2 rounded-lg text-sm outline-none" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, color:t.text }} />
              <button onClick={handlePost} className="px-4 py-2 rounded-lg text-xs font-semibold text-white" style={{ background:`linear-gradient(135deg,${t.accent},#8b5cf6)` }}>Post</button>
            </div>
          )}
          <div className="space-y-2">
            {posts.map((p,i)=>(<div key={i} className="glass-card rounded-xl p-4" style={{ background:t.card, borderColor:t.cardBorder }}>
              <div className="flex items-center justify-between mb-2"><span className="font-semibold text-sm">{p.user}</span><span className="text-[11px]" style={{ color:t.textMuted }}>{p.time}</span></div>
              <p className="text-sm" style={{ color:t.textSecondary }}>{p.text}</p>
              <div className="flex gap-4 mt-2"><button className="text-xs" style={{ color:t.textMuted }}>❤️ {p.likes}</button><button className="text-xs" style={{ color:t.textMuted }}>💬 Reply</button></div>
            </div>))}
          </div>
        </>
      )}
    </div>
  );
}
