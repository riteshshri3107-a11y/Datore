"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { DEMO_WORKERS, DEMO_JOBS, SOCIAL_FEED, getUserPosts, addUserPost, getProfilePrefs } from '@/lib/demoData';

export default function HomePage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const [tab, setTab] = useState<'feed'|'discover'>('feed');
  const [showPost, setShowPost] = useState(false);
  const [postText, setPostText] = useState('');
  const [postType, setPostType] = useState<'text'|'photo'|'video'>('text');
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [showShare, setShowShare] = useState<string|null>(null);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const prefs = getProfilePrefs();

  useEffect(() => { setUserPosts(getUserPosts()); }, []);

  const allFeed = [...userPosts.map(p => ({...p, user: prefs.name || 'You', avatar: (prefs.name||'DU').split(' ').map((n:string)=>n[0]).join('').slice(0,2)})), ...SOCIAL_FEED];

  const handlePost = () => {
    if (!postText.trim()) return;
    addUserPost({ text: postText.trim(), type: postType });
    setUserPosts(getUserPosts());
    setPostText(''); setShowPost(false); setPostType('text');
  };

  const handleLike = (id: string) => {
    setLikedPosts(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  };

  const shareToSocial = (platform: string, text: string) => {
    const url = encodeURIComponent('https://datore.vercel.app');
    const msg = encodeURIComponent(text + ' - Shared via Datore');
    let link = '';
    if (platform === 'whatsapp') link = `https://wa.me/?text=${msg}%20${url}`;
    else if (platform === 'facebook') link = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${msg}`;
    else if (platform === 'twitter') link = `https://twitter.com/intent/tweet?text=${msg}&url=${url}`;
    else if (platform === 'linkedin') link = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
    else if (platform === 'copy') { navigator.clipboard?.writeText(text + ' - https://datore.vercel.app'); setShowShare(null); return; }
    if (link) window.open(link, '_blank');
    setShowShare(null);
  };

  const actions = [
    { icon:'B', label:'Post Job', path:'/jobplace/create', bg:'#6366f1' },
    { icon:'W', label:'Find Workers', path:'/jobplace/providers', bg:'#22c55e' },
    { icon:'M', label:'Map View', path:'/jobplace/map', bg:'#f59e0b' },
    { icon:'S', label:'Marketplace', path:'/marketplace', bg:'#ec4899' },
    { icon:'$', label:'Wallet', path:'/wallet', bg:'#8b5cf6' },
    { icon:'*', label:'Buddy List', path:'/buddylist', bg:'#eab308' },
    { icon:'G', label:'Community', path:'/community', bg:'#06b6d4' },
    { icon:'C', label:'Messages', path:'/inbox', bg:'#f97316' },
  ];

  const mediaIcons: Record<string,string> = { wrench:'tools', cooking:'pan', dog:'paw', party:'confetti', garden:'leaf' };

  return (
    <div className="space-y-4 animate-fade-in max-w-2xl mx-auto">
      {/* Welcome */}
      <div className="glass-card rounded-2xl p-4" style={{ background:`linear-gradient(135deg,${t.accent}22,#8b5cf622)`, borderColor:t.cardBorder }}>
        <p className="text-xs" style={{ color:t.textMuted }}>Welcome back</p>
        <h1 className="text-xl font-bold mt-1">Hello, {prefs.name || 'there'}!</h1>
      </div>

      {/* Create Post Bar */}
      <div className="glass-card rounded-2xl p-3 flex items-center gap-3 cursor-pointer" style={{ background:t.card, borderColor:t.cardBorder }} onClick={() => setShowPost(true)}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ background:`linear-gradient(135deg,${t.accent}44,#8b5cf644)`, color:t.accent }}>
          {(prefs.name||'DU').split(' ').map((n:string)=>n[0]).join('').slice(0,2)}
        </div>
        <p className="flex-1 text-sm" style={{ color:t.textMuted }}>Share what's on your mind...</p>
        <div className="flex gap-2">
          <button onClick={e => { e.stopPropagation(); setPostType('photo'); setShowPost(true); }} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background:'rgba(34,197,94,0.1)', color:'#22c55e' }}>Photo</button>
          <button onClick={e => { e.stopPropagation(); setPostType('video'); setShowPost(true); }} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background:'rgba(239,68,68,0.1)', color:'#ef4444' }}>Video</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setTab('feed')} className="flex-1 py-2 rounded-xl text-xs font-medium" style={{ background:tab==='feed'?t.accentLight:'transparent', color:tab==='feed'?t.accent:t.textSecondary }}>Social Feed</button>
        <button onClick={() => setTab('discover')} className="flex-1 py-2 rounded-xl text-xs font-medium" style={{ background:tab==='discover'?t.accentLight:'transparent', color:tab==='discover'?t.accent:t.textSecondary }}>Discover</button>
      </div>

      {tab === 'feed' ? (
        <div className="space-y-3">
          {allFeed.map(post => (
            <div key={post.id} className="glass-card rounded-2xl p-4" style={{ background:t.card, borderColor:t.cardBorder }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold" style={{ background:`linear-gradient(135deg,${t.accent}33,#8b5cf633)`, color:t.accent }}>{post.avatar}</div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{post.user}</p>
                  <p className="text-[10px]" style={{ color:t.textMuted }}>{post.time} {post.type !== 'text' ? (post.type === 'photo' ? '  Photo' : '  Video') : ''}</p>
                </div>
                <button onClick={() => setShowShare(post.id)} className="p-1.5 rounded-lg text-xs" style={{ color:t.textMuted }}>Share</button>
              </div>
              <p className="text-sm leading-relaxed" style={{ color:t.textSecondary }}>{post.text}</p>
              {post.media && (
                <div className="mt-3 rounded-xl h-40 flex items-center justify-center" style={{ background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)', border:`1px solid ${t.cardBorder}` }}>
                  <div className="text-center">
                    <p className="text-3xl mb-1">{post.type === 'video' ? 'Play' : 'IMG'}</p>
                    <p className="text-[10px]" style={{ color:t.textMuted }}>{post.type === 'video' ? 'Tap to play video' : 'Photo attachment'}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-4 mt-3 pt-3" style={{ borderTop:`1px solid ${t.cardBorder}` }}>
                <button onClick={() => handleLike(post.id)} className="text-xs flex items-center gap-1" style={{ color:likedPosts.includes(post.id)?'#ef4444':t.textMuted }}>
                  {likedPosts.includes(post.id) ? 'Liked' : 'Like'} ({post.likes + (likedPosts.includes(post.id)?1:0)})
                </button>
                <button className="text-xs" style={{ color:t.textMuted }}>Comment ({post.comments})</button>
                <button onClick={() => setShowShare(post.id)} className="text-xs" style={{ color:t.textMuted }}>Share</button>
              </div>

              {/* Share Modal */}
              {showShare === post.id && (
                <div className="mt-3 p-3 rounded-xl" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.03)', border:`1px solid ${t.cardBorder}` }}>
                  <p className="text-xs font-semibold mb-2">Share to:</p>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { id:'whatsapp', label:'WhatsApp', color:'#25D366' },
                      { id:'facebook', label:'Facebook', color:'#1877F2' },
                      { id:'twitter', label:'X / Twitter', color:'#1DA1F2' },
                      { id:'linkedin', label:'LinkedIn', color:'#0A66C2' },
                      { id:'copy', label:'Copy Link', color:'#6b7280' },
                    ].map(s => (
                      <button key={s.id} onClick={() => shareToSocial(s.id, post.text)} className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-white" style={{ background:s.color }}>{s.label}</button>
                    ))}
                  </div>
                  <button onClick={() => setShowShare(null)} className="text-[10px] mt-2 block" style={{ color:t.textMuted }}>Cancel</button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {actions.map(a => (
              <button key={a.path} onClick={() => router.push(a.path)} className="flex flex-col items-center gap-1.5 p-3 rounded-xl glass-card" style={{ background:t.card, borderColor:t.cardBorder }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold" style={{ background:`${a.bg}22`, color:a.bg }}>{a.icon}</div>
                <span className="text-[10px] font-medium" style={{ color:t.textSecondary }}>{a.label}</span>
              </button>
            ))}
          </div>
          <div>
            <div className="flex items-center justify-between mb-2"><h2 className="font-semibold text-sm">Recent Jobs</h2><button onClick={() => router.push('/jobplace')} className="text-xs" style={{ color:t.accent }}>See all</button></div>
            <div className="space-y-2">
              {DEMO_JOBS.slice(0,3).map(j => (
                <div key={j.id} onClick={() => router.push(`/jobplace/job/${j.id}`)} className="glass-card rounded-xl p-3 flex items-center gap-3 cursor-pointer" style={{ background:t.card, borderColor:t.cardBorder }}>
                  <div className="flex-1"><p className="font-medium text-sm">{j.title}</p><p className="text-xs" style={{ color:t.textSecondary }}>{j.category} - {j.location}</p></div>
                  <span className="font-bold text-sm" style={{ color:t.accent }}>${j.amount}{j.payment==='hourly'?'/hr':''}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2"><h2 className="font-semibold text-sm">Top Workers</h2><button onClick={() => router.push('/jobplace/providers')} className="text-xs" style={{ color:t.accent }}>See all</button></div>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_WORKERS.filter(w => w.availability === 'available').slice(0,4).map(w => (
                <div key={w.id} onClick={() => router.push(`/worker/${w.id}`)} className="glass-card rounded-xl p-3 cursor-pointer" style={{ background:t.card, borderColor:t.cardBorder }}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background:`linear-gradient(135deg,${t.accent}33,#8b5cf633)`, color:t.accent }}>{w.full_name.split(' ').map(n=>n[0]).join('')}</div>
                    <div><p className="text-xs font-semibold">{w.full_name}</p><p className="text-[10px]" style={{ color:t.textMuted }}>Rating: {w.rating}</p></div>
                  </div>
                  <div className="flex flex-wrap gap-1">{w.skills.slice(0,2).map(s => <span key={s} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background:t.accentLight, color:t.accent }}>{s}</span>)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      {showPost && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }} onClick={() => setShowPost(false)}>
          <div onClick={e => e.stopPropagation()} className="w-full max-w-md rounded-2xl p-5 space-y-4" style={{ background:isDark?'#1a1a2e':'#fff', border:`1px solid ${t.cardBorder}` }}>
            <h3 className="font-bold text-lg">Create Post</h3>
            <div className="flex gap-2">
              {(['text','photo','video'] as const).map(pt => (
                <button key={pt} onClick={() => setPostType(pt)} className="flex-1 py-2 rounded-xl text-xs font-medium capitalize" style={{ background:postType===pt?t.accentLight:t.surface, color:postType===pt?t.accent:t.textSecondary, border:`1px solid ${postType===pt?t.accent+'33':t.cardBorder}` }}>
                  {pt === 'text' ? 'Text' : pt === 'photo' ? 'Photo' : 'Video'}
                </button>
              ))}
            </div>
            {postType !== 'text' && (
              <div className="h-28 rounded-xl flex flex-col items-center justify-center cursor-pointer" style={{ background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)', border:`2px dashed ${t.cardBorder}` }}>
                <p className="text-xl mb-1">{postType === 'photo' ? 'Camera' : 'Video'}</p>
                <p className="text-xs" style={{ color:t.textMuted }}>Tap to {postType === 'photo' ? 'add photo' : 'record video'}</p>
              </div>
            )}
            <textarea value={postText} onChange={e => setPostText(e.target.value)} rows={4} placeholder="What's happening? Share your work, achievements, or updates..." className="w-full p-3 rounded-xl text-sm outline-none resize-none" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, color:t.text }} />
            <div className="flex gap-2">
              <button onClick={handlePost} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white" style={{ background:`linear-gradient(135deg,${t.accent},#8b5cf6)` }}>Post</button>
              <button onClick={() => setShowPost(false)} className="px-6 py-3 rounded-xl text-sm" style={{ color:t.textMuted, background:t.surface, border:`1px solid ${t.cardBorder}` }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
