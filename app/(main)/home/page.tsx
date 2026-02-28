"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { DEMO_WORKERS, DEMO_JOBS, SOCIAL_FEED, HASHTAGS, getUserPosts, addUserPost, getProfilePrefs } from '@/lib/demoData';
import { IcoJobs, IcoUser, IcoMap, IcoMarket, IcoWallet, IcoFriends, IcoQR, IcoShield, IcoHeart, IcoSend, IcoHash } from '@/components/Icons';

function getComments(postId:string) { try { return JSON.parse(localStorage.getItem(`datore-comments-${postId}`)||'[]'); } catch { return []; } }
function saveComments(postId:string, c:any[]) { try { localStorage.setItem(`datore-comments-${postId}`, JSON.stringify(c)); } catch {} }

function renderHashText(text:string, accent:string, router:any) {
  const parts = text.split(/(#[a-zA-Z0-9_]+)/g);
  return parts.map((part,i) => part.startsWith('#') ? <span key={i} onClick={(e)=>{e.stopPropagation();router.push(`/search?q=${encodeURIComponent(part)}`);}} style={{ color:accent, fontWeight:600, cursor:'pointer' }}>{part}</span> : <span key={i}>{part}</span>);
}

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
  const [mediaPreview, setMediaPreview] = useState<string|null>(null);
  const [mediaName, setMediaName] = useState('');
  const [openComments, setOpenComments] = useState<string|null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string,string>>({});
  const [commentData, setCommentData] = useState<Record<string,any[]>>({});
  const [hashSuggestions, setHashSuggestions] = useState<string[]>([]);
  const [activeInput, setActiveInput] = useState<string|null>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const prefs = getProfilePrefs();

  useEffect(() => { setUserPosts(getUserPosts()); }, []);

  const allFeed = [...userPosts.map(p => ({...p, user: prefs.name || 'You', avatar: (prefs.name||'DU').split(' ').map((n:string)=>n[0]).join('').slice(0,2)})), ...SOCIAL_FEED];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'photo'|'video') => {
    const file = e.target.files?.[0]; if (!file) return;
    setPostType(type); setMediaName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => { setMediaPreview(ev.target?.result as string); };
    reader.readAsDataURL(file);
    if (!showPost) setShowPost(true);
  };

  const clearMedia = () => { setMediaPreview(null); setMediaName(''); };

  const handlePost = () => {
    if (!postText.trim() && !mediaPreview) return;
    addUserPost({ text: postText.trim(), type: postType, media: mediaPreview || undefined });
    setUserPosts(getUserPosts());
    setPostText(''); setShowPost(false); setPostType('text'); clearMedia();
  };

  const handleLike = (id: string) => setLikedPosts(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);

  // BR-89: Comment system
  const toggleComments = (postId: string) => {
    if (openComments === postId) { setOpenComments(null); return; }
    setOpenComments(postId);
    if (!commentData[postId]) setCommentData(prev => ({...prev, [postId]: getComments(postId) }));
  };

  const submitComment = (postId: string) => {
    const text = (commentInputs[postId]||'').trim();
    if (!text) return;
    const newC = { id: Date.now().toString(), user: prefs.name||'You', text, time: 'Just now', likes: 0 };
    const updated = [...(commentData[postId]||[]), newC];
    setCommentData(prev => ({...prev, [postId]: updated}));
    saveComments(postId, updated);
    setCommentInputs(prev => ({...prev, [postId]: ''}));
    setHashSuggestions([]);
  };

  const deleteComment = (postId: string, commentId: string) => {
    const updated = (commentData[postId]||[]).filter((c:any)=>c.id!==commentId);
    setCommentData(prev => ({...prev, [postId]: updated}));
    saveComments(postId, updated);
  };

  // BR-94: Hashtag suggestions
  const handleTextChange = (text: string, inputId: string) => {
    if (inputId === 'post') setPostText(text);
    else setCommentInputs(prev => ({...prev, [inputId]: text}));
    setActiveInput(inputId);
    const match = text.match(/#(\w*)$/);
    if (match) {
      const q = match[1].toLowerCase();
      const suggestions = HASHTAGS.filter(h => h.toLowerCase().includes(q)).slice(0,6);
      setHashSuggestions(suggestions);
    } else setHashSuggestions([]);
  };

  const insertHash = (tag: string, inputId: string) => {
    const setter = inputId === 'post' ? postText : (commentInputs[inputId]||'');
    const updated = setter.replace(/#\w*$/, tag + ' ');
    if (inputId === 'post') setPostText(updated);
    else setCommentInputs(prev => ({...prev, [inputId]: updated}));
    setHashSuggestions([]);
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
    { Icon:IcoJobs, label:'Post Job', path:'/jobplace/create', bg:'#6366f1' },
    { Icon:IcoUser, label:'Workers', path:'/jobplace/providers', bg:'#22c55e' },
    { Icon:IcoMap, label:'Map', path:'/jobplace/map', bg:'#f59e0b' },
    { Icon:IcoMarket, label:'Market', path:'/marketplace', bg:'#ec4899' },
    { Icon:IcoWallet, label:'Wallet', path:'/wallet', bg:'#8b5cf6' },
    { Icon:IcoFriends, label:'Friends', path:'/friends', bg:'#06b6d4' },
    { Icon:IcoQR, label:'QR Verify', path:'/qr-verify', bg:'#0ea5e9' },
    { Icon:IcoShield, label:'Safety', path:'/safety', bg:'#22c55e' },
  ];

  const HashDropdown = ({inputId}:{inputId:string}) => (hashSuggestions.length > 0 && activeInput === inputId) ? (
    <div style={{ display:'flex', gap:6, flexWrap:'wrap', padding:'6px 0' }}>
      {hashSuggestions.map(h => <button key={h} onClick={()=>insertHash(h,inputId)} style={{ padding:'4px 10px', borderRadius:8, background:t.accentLight, color:t.accent, border:'none', fontSize:11, fontWeight:600, cursor:'pointer' }}>{h}</button>)}
    </div>
  ) : null;

  return (
    <div className="space-y-4 animate-fade-in">
      <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={e => handleFileSelect(e, 'photo')} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => handleFileSelect(e, 'photo')} />
      <input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={e => handleFileSelect(e, 'video')} />

      {/* Welcome */}
      <div className="glass-card rounded-2xl p-4 flex items-center gap-3" style={{ background:`linear-gradient(135deg,${t.accent}22,#8b5cf622)`, borderColor:t.cardBorder }}>
        <img src="/logo-icon.png" alt="Datore" width={44} height={44} style={{ borderRadius:12 }} />
        <div><p className="text-xs" style={{ color:t.textMuted }}>Welcome back</p><h1 className="text-xl font-bold">Hello, {prefs.name || 'there'}!</h1></div>
      </div>

      {/* Create Post Bar */}
      <div className="glass-card rounded-2xl p-3 flex items-center gap-3 cursor-pointer" style={{ background:t.card, borderColor:t.cardBorder }} onClick={() => setShowPost(true)}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ background:`linear-gradient(135deg,${t.accent}44,#8b5cf644)`, color:t.accent }}>{(prefs.name||'DU').split(' ').map((n:string)=>n[0]).join('').slice(0,2)}</div>
        <p className="flex-1 text-sm" style={{ color:t.textMuted }}>Share what's on your mind...</p>
        <div className="flex gap-2">
          <button onClick={e => { e.stopPropagation(); photoRef.current?.click(); }} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background:'rgba(34,197,94,0.1)', color:'#22c55e' }}>📷 Photo</button>
          <button onClick={e => { e.stopPropagation(); videoRef.current?.click(); }} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background:'rgba(239,68,68,0.1)', color:'#ef4444' }}>🎥 Video</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setTab('feed')} className="flex-1 py-2 rounded-xl text-xs font-medium" style={{ background:tab==='feed'?t.accentLight:'transparent', color:tab==='feed'?t.accent:t.textSecondary }}>Social Feed</button>
        <button onClick={() => setTab('discover')} className="flex-1 py-2 rounded-xl text-xs font-medium" style={{ background:tab==='discover'?t.accentLight:'transparent', color:tab==='discover'?t.accent:t.textSecondary }}>Discover</button>
      </div>

      {tab === 'feed' ? (
        <div className="space-y-3">
          {allFeed.map(post => {
            const comments = commentData[post.id] || [];
            const commentCount = post.comments + comments.length;
            return (
            <div key={post.id} className="glass-card rounded-2xl p-4" style={{ background:t.card, borderColor:t.cardBorder }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold" style={{ background:`linear-gradient(135deg,${t.accent}33,#8b5cf633)`, color:t.accent }}>{post.avatar}</div>
                <div className="flex-1"><p className="font-semibold text-sm">{post.user}</p><p className="text-[10px]" style={{ color:t.textMuted }}>{post.time}{post.type !== 'text' ? ` · ${post.type}` : ''}</p></div>
              </div>
              <p className="text-sm leading-relaxed" style={{ color:t.textSecondary }}>{renderHashText(post.text, t.accent, router)}</p>
              {post.media && (
                <div className="mt-3 rounded-xl overflow-hidden" style={{ border:`1px solid ${t.cardBorder}` }}>
                  {post.media.startsWith('data:video') ? <video src={post.media} controls playsInline style={{ width:'100%', maxHeight:300, display:'block', background:'#000' }} />
                  : post.media.startsWith('data:image') ? <img src={post.media} alt="Post" style={{ width:'100%', maxHeight:300, objectFit:'cover', display:'block' }} />
                  : <div className="h-40 flex items-center justify-center" style={{ background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)' }}><p className="text-sm" style={{ color:t.textMuted }}>[{post.type === 'video' ? 'Video' : 'Photo'} content]</p></div>}
                </div>
              )}
              <div className="flex items-center gap-4 mt-3 pt-3" style={{ borderTop:`1px solid ${t.cardBorder}` }}>
                <button onClick={() => handleLike(post.id)} className="flex items-center gap-1 text-xs" style={{ color:likedPosts.includes(post.id)?'#ef4444':t.textMuted }}>
                  <IcoHeart size={14} color={likedPosts.includes(post.id)?'#ef4444':t.textMuted} fill={likedPosts.includes(post.id)?'#ef4444':'none'} />
                  {likedPosts.includes(post.id) ? 'Liked' : 'Like'} ({post.likes + (likedPosts.includes(post.id)?1:0)})
                </button>
                <button onClick={() => toggleComments(post.id)} className="flex items-center gap-1 text-xs" style={{ color:openComments===post.id?t.accent:t.textMuted }}>
                  💬 Comment ({commentCount})
                </button>
                <button onClick={() => setShowShare(showShare===post.id?null:post.id)} className="text-xs" style={{ color:t.textMuted }}>↗ Share</button>
              </div>

              {/* BR-89: Comment Section */}
              {openComments === post.id && (
                <div className="mt-3 space-y-2">
                  {comments.map((c:any) => (
                    <div key={c.id} className="flex gap-2 p-2 rounded-xl" style={{ background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.02)' }}>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ background:`${t.accent}22`, color:t.accent }}>{(c.user||'U')[0]}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold">{c.user}</span>
                          <span className="text-[10px]" style={{ color:t.textMuted }}>{c.time}</span>
                        </div>
                        <p className="text-xs mt-0.5" style={{ color:t.textSecondary }}>{renderHashText(c.text, t.accent, router)}</p>
                      </div>
                      {c.user === (prefs.name||'You') && <button onClick={()=>deleteComment(post.id, c.id)} className="text-[10px] self-start" style={{ color:'#ef4444' }}>✕</button>}
                    </div>
                  ))}
                  <div>
                    <HashDropdown inputId={post.id} />
                    <div className="flex gap-2">
                      <input value={commentInputs[post.id]||''} onChange={e=>handleTextChange(e.target.value, post.id)} onKeyDown={e=>e.key==='Enter'&&submitComment(post.id)} placeholder="Write a comment... (use # for tags)" className="flex-1 p-2.5 rounded-xl text-xs outline-none" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, color:t.text }} />
                      <button onClick={()=>submitComment(post.id)} className="px-3 rounded-xl text-xs font-semibold text-white" style={{ background:`linear-gradient(135deg,${t.accent},#8b5cf6)` }}>Post</button>
                    </div>
                  </div>
                </div>
              )}

              {showShare === post.id && (
                <div className="mt-3 p-3 rounded-xl flex gap-2 flex-wrap" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.03)', border:`1px solid ${t.cardBorder}` }}>
                  {[{id:'whatsapp',l:'WhatsApp',c:'#25D366'},{id:'facebook',l:'Facebook',c:'#1877F2'},{id:'twitter',l:'X/Twitter',c:'#1DA1F2'},{id:'linkedin',l:'LinkedIn',c:'#0A66C2'},{id:'copy',l:'Copy Link',c:'#6b7280'}].map(s => (
                    <button key={s.id} onClick={() => shareToSocial(s.id, post.text)} className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-white" style={{ background:s.c }}>{s.l}</button>
                  ))}
                </div>
              )}
            </div>
          );})}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {actions.map(a => (
              <button key={a.path} onClick={() => router.push(a.path)} className="flex flex-col items-center gap-1.5 p-3 rounded-xl glass-card" style={{ background:t.card, borderColor:t.cardBorder }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:`${a.bg}22` }}><a.Icon size={20} color={a.bg} /></div>
                <span className="text-[10px] font-medium" style={{ color:t.textSecondary }}>{a.label}</span>
              </button>
            ))}
          </div>
          <div>
            <div className="flex items-center justify-between mb-2"><h2 className="font-semibold text-sm">Recent Jobs</h2><button onClick={() => router.push('/jobplace')} className="text-xs" style={{ color:t.accent }}>See all</button></div>
            <div className="space-y-2">{DEMO_JOBS.slice(0,3).map(j => (
              <div key={j.id} onClick={() => router.push(`/jobplace/job/${j.id}`)} className="glass-card rounded-xl p-3 flex items-center gap-3 cursor-pointer" style={{ background:t.card, borderColor:t.cardBorder }}>
                <div className="flex-1"><p className="font-medium text-sm">{j.title}</p><p className="text-xs" style={{ color:t.textSecondary }}>{j.category} - {j.location}</p></div>
                <span className="font-bold text-sm" style={{ color:t.accent }}>${j.amount}{j.payment==='hourly'?'/hr':''}</span>
              </div>
            ))}</div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2"><h2 className="font-semibold text-sm">Top Workers</h2><button onClick={() => router.push('/jobplace/providers')} className="text-xs" style={{ color:t.accent }}>See all</button></div>
            <div className="grid grid-cols-2 gap-2">{DEMO_WORKERS.filter(w => w.availability==='available').slice(0,4).map(w => (
              <div key={w.id} onClick={() => router.push(`/worker/${w.id}`)} className="glass-card rounded-xl p-3 cursor-pointer" style={{ background:t.card, borderColor:t.cardBorder }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background:`linear-gradient(135deg,${t.accent}33,#8b5cf633)`, color:t.accent }}>{w.full_name.split(' ').map(n=>n[0]).join('')}</div>
                  <div><p className="text-xs font-semibold">{w.full_name}</p><p className="text-[10px]" style={{ color:t.textMuted }}>⭐ {w.rating}</p></div>
                </div>
                <div className="flex flex-wrap gap-1">{w.skills.slice(0,2).map(s => <span key={s} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background:t.accentLight, color:t.accent }}>{s}</span>)}</div>
              </div>
            ))}</div>
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      {showPost && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }} onClick={() => { setShowPost(false); clearMedia(); }}>
          <div onClick={e => e.stopPropagation()} className="w-full max-w-md rounded-2xl p-5 space-y-4" style={{ background:isDark?'#1a1a2e':'#fff', border:`1px solid ${t.cardBorder}` }}>
            <h3 className="font-bold text-lg">Create Post</h3>
            <div className="flex gap-2">
              {(['text','photo','video'] as const).map(pt => (
                <button key={pt} onClick={() => { setPostType(pt); if(pt==='text') clearMedia(); }} className="flex-1 py-2 rounded-xl text-xs font-medium capitalize" style={{ background:postType===pt?t.accentLight:t.surface, color:postType===pt?t.accent:t.textSecondary, border:`1px solid ${postType===pt?t.accent+'33':t.cardBorder}` }}>{pt}</button>
              ))}
            </div>
            {postType !== 'text' && (
              <div className="space-y-2">
                {mediaPreview ? (
                  <div className="relative rounded-xl overflow-hidden" style={{ border:`1px solid ${t.cardBorder}` }}>
                    {postType === 'photo' ? <img src={mediaPreview} alt="Preview" style={{ width:'100%', maxHeight:200, objectFit:'cover', display:'block' }} /> : <video src={mediaPreview} controls style={{ width:'100%', maxHeight:200, display:'block' }} />}
                    <div className="absolute top-2 right-2"><button onClick={clearMedia} className="px-3 py-1 rounded-lg text-[11px] font-bold text-white" style={{ background:'rgba(0,0,0,0.7)' }}>✕ Remove</button></div>
                    <div className="px-3 py-1.5" style={{ background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)' }}><p className="text-[10px]" style={{ color:'#22c55e' }}>✓ Attached: {mediaName}</p></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => cameraRef.current?.click()} className="h-28 rounded-xl flex flex-col items-center justify-center" style={{ background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.02)', border:`2px dashed ${t.accent}55` }}>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2" style={{ background:`${t.accent}22` }}><span className="text-lg">📷</span></div>
                      <p className="text-xs font-semibold" style={{ color:t.accent }}>{postType==='photo'?'Take Photo':'Record'}</p>
                    </button>
                    <button onClick={() => (postType==='photo'?photoRef:videoRef).current?.click()} className="h-28 rounded-xl flex flex-col items-center justify-center" style={{ background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.02)', border:`2px dashed ${t.cardBorder}` }}>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2" style={{ background:'rgba(139,92,246,0.15)' }}><span className="text-lg">📁</span></div>
                      <p className="text-xs font-semibold" style={{ color:'#8b5cf6' }}>Upload Gallery</p>
                    </button>
                  </div>
                )}
              </div>
            )}
            <div>
              <HashDropdown inputId="post" />
              <textarea value={postText} onChange={e => handleTextChange(e.target.value, 'post')} rows={4} placeholder="What's happening? Use #hashtags to tag your post..." className="w-full p-3 rounded-xl text-sm outline-none resize-none" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, color:t.text }} />
            </div>
            <div className="flex gap-2">
              <button onClick={handlePost} disabled={!postText.trim() && !mediaPreview} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-40" style={{ background:`linear-gradient(135deg,${t.accent},#8b5cf6)` }}>Post</button>
              <button onClick={() => { setShowPost(false); clearMedia(); }} className="px-6 py-3 rounded-xl text-sm" style={{ color:t.textMuted, background:t.surface, border:`1px solid ${t.cardBorder}` }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
