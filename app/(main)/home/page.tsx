"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { useAuthStore } from '@/store/useAuthStore';
import { getAllFeedPosts, createPost as createSupabasePost, toggleLike, getComments as getSupabaseComments, createComment, deleteComment as deleteSupabaseComment, deletePost as deleteSupabasePost, updatePost, uploadPostMedia, getLikes } from '@/lib/supabase';
import { DEMO_WORKERS, DEMO_JOBS, SOCIAL_FEED, HASHTAGS } from '@/lib/demoData';
import { IcoJobs, IcoUser, IcoMap, IcoMarket, IcoWallet, IcoFriends, IcoQR, IcoShield, IcoHeart, IcoSend, IcoHash, IcoEdit, IcoTrash, IcoEmoji, IcoMic, IcoClose, IcoGlobe, IcoBriefcase, IcoGrad, IcoSearch, IcoFlag } from '@/components/Icons';

/* ═══ Content Moderation — Uses centralized engine ═══ */
import { moderateContent as _moderate, isImageSafe, type ModerationResult as _ModResult } from '@/lib/moderation';

/* Backward-compatible wrapper for page-level moderation calls */
interface ModerationAlert { safe:boolean; severity:string; flags:string[]; cleaned:string; blocked:boolean; }
function moderatePost(text:string): ModerationAlert {
  const r = _moderate(text, 'post');
  return {
    safe: r.safe,
    severity: r.severity === 'critical' || r.severity === 'high' ? 'severe' : r.severity === 'medium' ? 'moderate' : r.severity === 'low' ? 'mild' : 'none',
    flags: r.flags.map(f => f.description),
    cleaned: r.cleaned,
    blocked: r.action === 'block',
  };
}

/* ═══════════════════════════════════════
   PROFILE VISIBILITY TYPES
   4 audience scopes for every post
   ═══════════════════════════════════════ */
type Audience = 'public' | 'friends' | 'buddy' | 'professional';
const AUDIENCES: { key:Audience; label:string; icon:string; color:string; desc:string }[] = [
  { key:'public', label:'Public', icon:'🌐', color:'#22c55e', desc:'Visible to everyone' },
  { key:'friends', label:'Friends', icon:'💛', color:'#f59e0b', desc:'Only your friends' },
  { key:'buddy', label:'Buddy+', icon:'👥', color:'#8b5cf6', desc:'Buddy groups only' },
  { key:'professional', label:'Professional', icon:'💼', color:'#3b82f6', desc:'Professional network' },
];

/* Emoji quick picker */
const EMOJI_SET = ['👍','❤️','😂','😮','😢','😡','🎉','🔥','💯','🙏','👏','💪','✨','🚀','💎','🌟'];

function renderHashText(text:string, accent:string, router:any) {
  const parts = text.split(/(#[a-zA-Z0-9_]+)/g);
  return parts.map((part,i) => part.startsWith('#') ? <span key={i} onClick={(e)=>{e.stopPropagation();router.push(`/search?q=${encodeURIComponent(part)}`);}} style={{ color:accent, fontWeight:600, cursor:'pointer' }}>{part}</span> : <span key={i}>{part}</span>);
}

export default function HomePage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const { user, profile } = useAuthStore();
  const [tab, setTab] = useState<'feed'|'discover'>('feed');
  const [showPost, setShowPost] = useState(false);
  const [postText, setPostText] = useState('');
  const [postType, setPostType] = useState<'text'|'photo'|'video'>('text');
  const [postAudience, setPostAudience] = useState<Audience>('public');
  const [feedPosts, setFeedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showShare, setShowShare] = useState<string|null>(null);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [mediaPreview, setMediaPreview] = useState<string|null>(null);
  const [mediaFile, setMediaFile] = useState<File|null>(null);
  const [mediaName, setMediaName] = useState('');
  const [openComments, setOpenComments] = useState<string|null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string,string>>({});
  const [commentData, setCommentData] = useState<Record<string,any[]>>({});
  const [hashSuggestions, setHashSuggestions] = useState<string[]>([]);
  const [activeInput, setActiveInput] = useState<string|null>(null);
  const [editingPost, setEditingPost] = useState<string|null>(null);
  const [editText, setEditText] = useState('');
  const [showEmoji, setShowEmoji] = useState<string|null>(null);
  const [postReactions, setPostReactions] = useState<Record<string,string[]>>({});
  const [moderationAlert, setModerationAlert] = useState<ModerationAlert|null>(null);
  const [voiceSearch, setVoiceSearch] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [posting, setPosting] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const userName = profile?.name || 'You';
  const userAvatar = profile?.avatar_url ? { type: 'image' as const, src: profile.avatar_url } : { type: 'initials' as const, src: (userName).split(' ').map((n:string)=>n[0]).join('').slice(0,2) };

  // Fetch feed posts from Supabase
  useEffect(() => {
    async function loadFeed() {
      setLoading(true);
      try {
        const posts = await getAllFeedPosts(50);
        if (posts && posts.length > 0) {
          setFeedPosts(posts);
        } else {
          // Fallback to demo data when DB is empty
          setFeedPosts(SOCIAL_FEED.map(p => ({
            id: p.id,
            content: p.text,
            user_id: null,
            author_name: p.user,
            author_avatar: p.avatar,
            visibility: 'public',
            post_type: p.type,
            media_urls: p.media ? [p.media] : [],
            like_count: p.likes,
            comment_count: p.comments,
            created_at: p.time,
            _demo: true,
          })));
        }
      } catch {
        // On error, fallback to demo
        setFeedPosts(SOCIAL_FEED.map(p => ({
          id: p.id,
          content: p.text,
          user_id: null,
          author_name: p.user,
          author_avatar: p.avatar,
          visibility: 'public',
          post_type: p.type,
          media_urls: p.media ? [p.media] : [],
          like_count: p.likes,
          comment_count: p.comments,
          created_at: p.time,
          _demo: true,
        })));
      }
      setLoading(false);
    }
    loadFeed();
  }, []);

  // Load liked state for current user
  useEffect(() => {
    if (!user?.id) return;
    // We track likes locally since polymorphic likes require per-post queries
  }, [user?.id]);

  /* Display-time re-censor: Always re-run moderation on render to catch posts saved before moderation existed */
  const censorForDisplay = (text: string): string => {
    const r = _moderate(text, 'post');
    return (r.severity === 'low' || r.severity === 'medium' || r.severity === 'high' || r.severity === 'critical') ? r.cleaned : text;
  };

  // Normalize feed posts for display
  const allFeed = feedPosts.map(p => {
    const isOwn = user?.id && p.user_id === user.id;
    const authorName = p.author_name || p.profiles?.name || (isOwn ? userName : 'User');
    const authorAvatar = p.author_avatar || p.profiles?.avatar_url || authorName.split(' ').map((n:string)=>n[0]).join('').slice(0,2);
    const aud = p.visibility || 'public';
    return {
      id: p.id,
      user: authorName,
      avatar: authorAvatar,
      avatarType: (p.profiles?.avatar_url || p.author_avatar?.startsWith?.('http')) ? 'image' : 'initials',
      text: censorForDisplay(p.content || ''),
      time: p._demo ? p.created_at : timeAgo(p.created_at),
      likes: p.like_count || 0,
      comments: p.comment_count || 0,
      type: p.post_type || 'text',
      media: p.media_urls?.[0] || null,
      isOwn,
      audience: aud as Audience,
      _demo: p._demo,
    };
  });

  function timeAgo(dateStr: string) {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'photo'|'video') => {
    const file = e.target.files?.[0]; if (!file) return;
    if (!isImageSafe(file.name)) {
      setModerationAlert({ safe:false, severity:'severe', flags:['Adult/explicit content detected in filename'], cleaned:'', blocked:true });
      return;
    }
    setPostType(type); setMediaName(file.name); setMediaFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => { setMediaPreview(ev.target?.result as string); };
    reader.readAsDataURL(file);
    if (!showPost) setShowPost(true);
  };
  const clearMedia = () => { setMediaPreview(null); setMediaName(''); setMediaFile(null); };

  /* AI-moderated post submission — now creates in Supabase */
  const handlePost = async () => {
    if (!postText.trim() && !mediaPreview) return;
    if (!user?.id) { alert('Please sign in to post'); return; }
    const modResult = moderatePost(postText);
    if (modResult.severity === 'severe') {
      setModerationAlert(modResult);
      return;
    }
    const finalText = (modResult.severity === 'mild' || modResult.severity === 'moderate') ? modResult.cleaned : postText.trim();

    setPosting(true);
    try {
      let mediaUrls: string[] = [];
      if (mediaFile && user?.id) {
        const { url } = await uploadPostMedia(user.id, mediaFile);
        if (url) mediaUrls = [url];
      }

      // Extract hashtags
      const hashtags = finalText.match(/#[a-zA-Z0-9_]+/g)?.map(h => h.slice(1)) || [];

      await createSupabasePost({
        user_id: user.id,
        content: finalText,
        media_urls: mediaUrls.length > 0 ? mediaUrls : undefined,
        media_type: postType !== 'text' ? postType : undefined,
        post_type: postType,
        visibility: postAudience,
        hashtags: hashtags.length > 0 ? hashtags : undefined,
      });

      // Refresh feed
      const posts = await getAllFeedPosts(50);
      if (posts && posts.length > 0) setFeedPosts(posts);
    } catch (err) {
      console.error('Failed to create post:', err);
    }
    setPosting(false);
    setPostText(''); setShowPost(false); setPostType('text'); setPostAudience('public'); clearMedia();
    if (modResult.severity === 'mild' || modResult.severity === 'moderate') setModerationAlert(modResult);
  };

  const handleLike = async (id: string, isDemo?: boolean) => {
    // Optimistic UI update
    setLikedPosts(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
    if (!isDemo && user?.id) {
      try { await toggleLike(user.id, id, 'post'); } catch {}
    }
  };

  /* Edit own post */
  const saveEdit = async (postId: string) => {
    const modResult = moderatePost(editText);
    if (modResult.severity === 'severe') { setModerationAlert(modResult); return; }
    const finalText = (modResult.severity==='mild'||modResult.severity==='moderate')?modResult.cleaned:editText;
    try {
      await updatePost(postId, finalText);
      setFeedPosts(prev => prev.map(p => p.id === postId ? {...p, content: finalText} : p));
    } catch {}
    setEditingPost(null); setEditText('');
  };

  /* Delete own post */
  const handleDeletePost = async (postId: string) => {
    try {
      await deleteSupabasePost(postId);
      setFeedPosts(prev => prev.filter(p => p.id !== postId));
    } catch {}
  };

  /* Emoji reaction */
  const addReaction = (postId: string, emoji: string) => {
    setPostReactions(prev => {
      const existing = prev[postId] || [];
      if (existing.includes(emoji)) return {...prev, [postId]: existing.filter(e=>e!==emoji)};
      return {...prev, [postId]: [...existing, emoji]};
    });
    setShowEmoji(null);
  };

  /* Voice search simulation */
  const startVoiceSearch = () => {
    setVoiceSearch(true);
    setTimeout(() => { setVoiceSearch(false); setSearchText('nearby jobs'); router.push('/search?q=nearby+jobs'); }, 2000);
  };

  /* Comments — now fetches from Supabase */
  const toggleCommentsPanel = async (postId: string) => {
    if (openComments === postId) { setOpenComments(null); return; }
    setOpenComments(postId);
    if (!commentData[postId]) {
      try {
        const comments = await getSupabaseComments(postId, 'post');
        if (comments && comments.length > 0) {
          setCommentData(prev => ({...prev, [postId]: comments.map(c => ({
            id: c.id,
            user: c.profiles?.name || 'User',
            text: c.content,
            time: timeAgo(c.created_at),
            likes: 0,
          }))}));
        } else {
          setCommentData(prev => ({...prev, [postId]: []}));
        }
      } catch {
        setCommentData(prev => ({...prev, [postId]: []}));
      }
    }
  };

  const submitComment = async (postId: string) => {
    const text = (commentInputs[postId]||'').trim(); if (!text) return;
    if (!user?.id) return;
    try {
      const { data } = await createComment({
        user_id: user.id,
        target_id: postId,
        target_type: 'post',
        content: text,
      });
      const newC = { id: data?.id || Date.now().toString(), user: userName, text, time: 'Just now', likes: 0 };
      const updated = [...(commentData[postId]||[]), newC];
      setCommentData(prev => ({...prev, [postId]: updated}));
    } catch {
      // Fallback: add locally
      const newC = { id: Date.now().toString(), user: userName, text, time: 'Just now', likes: 0 };
      const updated = [...(commentData[postId]||[]), newC];
      setCommentData(prev => ({...prev, [postId]: updated}));
    }
    setCommentInputs(prev => ({...prev, [postId]: ''})); setHashSuggestions([]);
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    try { await deleteSupabaseComment(commentId); } catch {}
    const updated = (commentData[postId]||[]).filter((c:any)=>c.id!==commentId);
    setCommentData(prev => ({...prev, [postId]: updated}));
  };

  /* Hashtag suggestions */
  const handleTextChange = (text: string, inputId: string) => {
    if (inputId === 'post') setPostText(text);
    else setCommentInputs(prev => ({...prev, [inputId]: text}));
    setActiveInput(inputId);
    const match = text.match(/#(\w*)$/);
    if (match) { setHashSuggestions(HASHTAGS.filter(h => h.toLowerCase().includes(match[1].toLowerCase())).slice(0,6)); }
    else setHashSuggestions([]);
  };
  const insertHash = (tag: string, inputId: string) => {
    const curr = inputId === 'post' ? postText : (commentInputs[inputId]||'');
    const updated = curr.replace(/#\w*$/, tag + ' ');
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
    if (link) window.open(link, '_blank'); setShowShare(null);
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

  const audienceInfo = AUDIENCES.find(a => a.key === postAudience) || AUDIENCES[0];

  return (
    <div className="space-y-4 animate-fade-in">
      <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={e => handleFileSelect(e, 'photo')} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => handleFileSelect(e, 'photo')} />
      <input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={e => handleFileSelect(e, 'video')} />

      {/* Moderation Alert */}
      {moderationAlert && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background:'rgba(0,0,0,0.6)' }} onClick={()=>setModerationAlert(null)}>
          <div onClick={e=>e.stopPropagation()} className="w-full max-w-sm rounded-2xl p-5" style={{ background:isDark?'#1a1a2e':'#fff' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background:moderationAlert.severity==='severe'?'rgba(239,68,68,0.15)':'rgba(245,158,11,0.15)' }}>
                <IcoShield size={20} color={moderationAlert.severity==='severe'?'#ef4444':'#f59e0b'} />
              </div>
              <div>
                <h3 className="font-bold text-sm" style={{ color:moderationAlert.severity==='severe'?'#ef4444':'#f59e0b' }}>
                  {moderationAlert.severity==='severe'?'Content Blocked':'Content Modified'}
                </h3>
                <p className="text-[10px]" style={{ color:t.textMuted }}>AI Safety System</p>
              </div>
            </div>
            {moderationAlert.flags.map((f,i)=>(<p key={i} className="text-xs mb-1" style={{ color:t.text }}>- {f}</p>))}
            {(moderationAlert.severity==='mild'||moderationAlert.severity==='moderate')&&<p className="text-[10px] mt-2" style={{ color:t.textMuted }}>Profanity has been censored. Your post was published.</p>}
            {moderationAlert.severity==='severe'&&<p className="text-[10px] mt-2" style={{ color:'#ef4444' }}>This content violates community guidelines and cannot be posted.</p>}
            <button onClick={()=>setModerationAlert(null)} className="w-full mt-3 py-2 rounded-xl text-xs font-bold text-white" style={{ background:moderationAlert.severity==='severe'?'#ef4444':'#f59e0b' }}>Understood</button>
          </div>
        </div>
      )}

      {/* Search Bar with Voice Mic */}
      <div className="flex items-center gap-2 rounded-2xl px-3 py-2" style={{ background:t.card, border:`1px solid ${t.cardBorder}` }}>
        <IcoSearch size={16} color={t.textMuted} />
        <input value={searchText} onChange={e=>setSearchText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&searchText.trim()) router.push(`/search?q=${encodeURIComponent(searchText)}`);}} placeholder="Search workers, jobs, items, #hashtags..." className="flex-1 text-sm outline-none bg-transparent" style={{ color:t.text }} />
        <button onClick={startVoiceSearch} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:voiceSearch?'rgba(239,68,68,0.15)':'rgba(139,92,246,0.12)' }}>
          <IcoMic size={16} color={voiceSearch?'#ef4444':'#8b5cf6'} />
        </button>
      </div>
      {voiceSearch && <p className="text-xs text-center animate-pulse" style={{ color:'#ef4444' }}>Listening...</p>}

      {/* Create Post Bar */}
      <div className="rounded-2xl p-3" style={{ background:t.card, border:`1px solid ${t.cardBorder}` }}>
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setShowPost(true)}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 overflow-hidden" style={{ background:`linear-gradient(135deg,${t.accent}44,#8b5cf644)`, color:t.accent }}>
            {userAvatar.type==='image' ? <img src={userAvatar.src} alt="" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}}/> : userAvatar.src}
          </div>
          <p className="flex-1 text-sm" style={{ color:t.textMuted }}>Share what's on your mind...</p>
          <button onClick={e => { e.stopPropagation(); photoRef.current?.click(); }} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background:'rgba(34,197,94,0.1)', color:'#22c55e' }}>Photo</button>
          <button onClick={e => { e.stopPropagation(); videoRef.current?.click(); }} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background:'rgba(239,68,68,0.1)', color:'#ef4444' }}>Video</button>
        </div>
      </div>

      {/* Feed / Discover Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setTab('feed')} className="flex-1 py-2.5 rounded-xl text-xs font-semibold" style={{ background:tab==='feed'?t.accentLight:'transparent', color:tab==='feed'?t.accent:t.textSecondary, border:tab==='feed'?`1px solid ${t.accent}33`:'1px solid transparent' }}>Social Feed</button>
        <button onClick={() => setTab('discover')} className="flex-1 py-2.5 rounded-xl text-xs font-semibold" style={{ background:tab==='discover'?t.accentLight:'transparent', color:tab==='discover'?t.accent:t.textSecondary, border:tab==='discover'?`1px solid ${t.accent}33`:'1px solid transparent' }}>Discover</button>
      </div>

      {tab === 'feed' ? (
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-3" style={{ borderColor: `${t.accent} transparent ${t.accent} ${t.accent}` }} />
              <p className="text-xs" style={{ color: t.textMuted }}>Loading feed...</p>
            </div>
          ) : allFeed.map(post => {
            const comments = commentData[post.id] || [];
            const commentCount = (post.comments||0) + comments.length;
            const reactions = postReactions[post.id] || [];
            const aud = AUDIENCES.find(a => a.key === (post as any).audience) || AUDIENCES[0];
            return (
            <div key={post.id} className="rounded-2xl p-4" style={{ background:t.card, border:`1px solid ${t.cardBorder}` }}>
              {/* Post Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold overflow-hidden flex-shrink-0" style={{ background:`linear-gradient(135deg,${t.accent}33,#8b5cf633)`, color:t.accent }}>
                  {(post as any).avatarType==='image'?<img src={post.avatar} alt="" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}}/>:post.avatar}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{post.user}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px]" style={{ color:t.textMuted }}>{post.time}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background:`${aud.color}15`, color:aud.color }}>{aud.icon} {aud.label}</span>
                  </div>
                </div>
                {/* Edit & Delete for own posts */}
                {(post as any).isOwn && (
                  <div className="flex items-center gap-1">
                    <button onClick={()=>{setEditingPost(post.id);setEditText(post.text);}} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background:'rgba(59,130,246,0.1)' }} title="Edit"><IcoEdit size={14} color="#3b82f6" /></button>
                    <button onClick={()=>handleDeletePost(post.id)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background:'rgba(239,68,68,0.1)' }} title="Delete"><IcoClose size={14} color="#ef4444" /></button>
                  </div>
                )}
              </div>

              {/* Post Content -- Edit or Display */}
              {editingPost === post.id ? (
                <div className="space-y-2 mb-3">
                  <textarea value={editText} onChange={e=>setEditText(e.target.value)} rows={3} className="w-full p-3 rounded-xl text-sm outline-none resize-none" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.03)', border:`1px solid ${t.cardBorder}`, color:t.text }} />
                  <div className="flex gap-2">
                    <button onClick={()=>saveEdit(post.id)} className="px-4 py-1.5 rounded-lg text-xs font-bold text-white" style={{ background:t.accent }}>Save</button>
                    <button onClick={()=>setEditingPost(null)} className="px-4 py-1.5 rounded-lg text-xs" style={{ background:t.card, border:`1px solid ${t.cardBorder}` }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <p className="text-sm leading-relaxed mb-2" style={{ color:t.textSecondary }}>{renderHashText(post.text, t.accent, router)}</p>
              )}

              {/* Media */}
              {post.media && (
                <div className="mb-3 rounded-xl overflow-hidden" style={{ border:`1px solid ${t.cardBorder}` }}>
                  {post.media.startsWith('data:video') || post.media.includes('.mp4') ? <video src={post.media} controls playsInline style={{ width:'100%', maxHeight:300, display:'block', background:'#000' }} />
                  : (post.media.startsWith('data:image') || post.media.startsWith('http')) ? <img src={post.media} alt="Post" style={{ width:'100%', maxHeight:300, objectFit:'cover', display:'block' }} />
                  : <div className="h-32 flex items-center justify-center" style={{ background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)' }}><p className="text-sm" style={{ color:t.textMuted }}>[{post.type === 'video' ? 'Video' : 'Photo'} content]</p></div>}
                </div>
              )}

              {/* Emoji Reactions */}
              {reactions.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {reactions.map((em,i) => (<span key={i} className="px-2 py-0.5 rounded-full text-xs" style={{ background:t.accentLight }}>{em}</span>))}
                </div>
              )}

              {/* Action Bar */}
              <div className="flex items-center gap-3 pt-3 justify-end" style={{ borderTop:`1px solid ${t.cardBorder}` }}>
                <button onClick={() => handleLike(post.id, post._demo)} className="flex items-center gap-1 text-xs" style={{ color:likedPosts.includes(post.id)?'#ef4444':t.textMuted }}>
                  <IcoHeart size={14} color={likedPosts.includes(post.id)?'#ef4444':t.textMuted} fill={likedPosts.includes(post.id)?'#ef4444':'none'} />
                  Like ({post.likes + (likedPosts.includes(post.id)?1:0)})
                </button>
                <button onClick={() => toggleCommentsPanel(post.id)} className="flex items-center gap-1 text-xs" style={{ color:openComments===post.id?t.accent:t.textMuted }}>Comment ({commentCount})</button>
                <button onClick={() => setShowShare(showShare===post.id?null:post.id)} className="text-xs" style={{ color:t.textMuted }}>Share</button>
                <button onClick={() => { if(confirm('Report this post for inappropriate content?')) alert('Post reported. Our team will review it within 24 hours.'); }} className="flex items-center gap-1 text-xs" style={{ color:t.textMuted }}>
                  <IcoFlag size={12} color={t.textMuted} /> Report
                </button>
                <button onClick={() => setShowEmoji(showEmoji===post.id?null:post.id)} style={{ color:t.textMuted }}>
                  <IcoEmoji size={16} color={showEmoji===post.id?t.accent:t.textMuted} />
                </button>
              </div>

              {/* Emoji Picker */}
              {showEmoji === post.id && (
                <div className="flex flex-wrap gap-1.5 mt-2 p-2 rounded-xl" style={{ background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.02)', border:`1px solid ${t.cardBorder}` }}>
                  {EMOJI_SET.map(em => (<button key={em} onClick={()=>addReaction(post.id,em)} className="w-8 h-8 rounded-lg flex items-center justify-center text-sm hover:scale-110 transition-transform" style={{ background:reactions.includes(em)?`${t.accent}20`:'transparent' }}>{em}</button>))}
                </div>
              )}

              {/* Comment Section */}
              {openComments === post.id && (
                <div className="mt-3 space-y-2">
                  {comments.map((c:any) => (
                    <div key={c.id} className="flex gap-2 p-2 rounded-xl" style={{ background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.02)' }}>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ background:`${t.accent}22`, color:t.accent }}>{(c.user||'U')[0]}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2"><span className="text-xs font-semibold">{c.user}</span><span className="text-[10px]" style={{ color:t.textMuted }}>{c.time}</span></div>
                        <p className="text-xs mt-0.5" style={{ color:t.textSecondary }}>{renderHashText(c.text, t.accent, router)}</p>
                      </div>
                      {c.user === userName && <button onClick={()=>handleDeleteComment(post.id, c.id)} className="text-[10px] self-start" style={{ color:'#ef4444' }}>x</button>}
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

              {/* Share panel */}
              {showShare === post.id && (
                <div className="mt-3 p-3 rounded-xl flex gap-2 flex-wrap" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.03)', border:`1px solid ${t.cardBorder}` }}>
                  {[{id:'whatsapp',l:'WhatsApp',c:'#25D366'},{id:'facebook',l:'Facebook',c:'#1877F2'},{id:'twitter',l:'X/Twitter',c:'#1DA1F2'},{id:'linkedin',l:'LinkedIn',c:'#0A66C2'},{id:'copy',l:'Copy Link',c:'#6b7280'}].map(s => (
                    <button key={s.id} onClick={() => shareToSocial(s.id, post.text)} className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-white" style={{ background:s.c }}>{s.l}</button>
                  ))}
                </div>
              )}
            </div>
          );})}</div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {actions.map(a => (
              <button key={a.path} onClick={() => router.push(a.path)} className="flex flex-col items-center gap-1.5 p-3 rounded-xl" style={{ background:t.card, border:`1px solid ${t.cardBorder}` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:`${a.bg}22` }}><a.Icon size={20} color={a.bg} /></div>
                <span className="text-[10px] font-medium" style={{ color:t.textSecondary }}>{a.label}</span>
              </button>
            ))}
          </div>
          <div>
            <div className="flex items-center justify-between mb-2"><h2 className="font-semibold text-sm">Recent Jobs</h2><button onClick={() => router.push('/jobplace')} className="text-xs" style={{ color:t.accent }}>See all</button></div>
            <div className="space-y-2">{DEMO_JOBS.slice(0,3).map(j => (
              <div key={j.id} onClick={() => router.push(`/jobplace/job/${j.id}`)} className="rounded-xl p-3 flex items-center gap-3 cursor-pointer" style={{ background:t.card, border:`1px solid ${t.cardBorder}` }}>
                <div className="flex-1"><p className="font-medium text-sm">{j.title}</p><p className="text-xs" style={{ color:t.textSecondary }}>{j.category} - {j.location}</p></div>
                <span className="font-bold text-sm" style={{ color:t.accent }}>${j.amount}{j.payment==='hourly'?'/hr':''}</span>
              </div>
            ))}</div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2"><h2 className="font-semibold text-sm">Top Workers</h2><button onClick={() => router.push('/jobplace/providers')} className="text-xs" style={{ color:t.accent }}>See all</button></div>
            <div className="grid grid-cols-2 gap-2">{DEMO_WORKERS.filter(w => w.availability==='available').slice(0,4).map(w => (
              <div key={w.id} onClick={() => router.push(`/worker/${w.id}`)} className="rounded-xl p-3 cursor-pointer" style={{ background:t.card, border:`1px solid ${t.cardBorder}` }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background:`linear-gradient(135deg,${t.accent}33,#8b5cf633)`, color:t.accent }}>{w.full_name.split(' ').map(n=>n[0]).join('')}</div>
                  <div><p className="text-xs font-semibold">{w.full_name}</p><p className="text-[10px]" style={{ color:t.textMuted }}>* {w.rating}</p></div>
                </div>
                <div className="flex flex-wrap gap-1">{w.skills.slice(0,2).map(s => <span key={s} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background:t.accentLight, color:t.accent }}>{s}</span>)}</div>
              </div>
            ))}</div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          CREATE POST MODAL -- with Audience Picker
         ═══════════════════════════════════════ */}
      {showPost && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }} onClick={() => { setShowPost(false); clearMedia(); }}>
          <div onClick={e => e.stopPropagation()} className="w-full max-w-md rounded-2xl p-5 space-y-4" style={{ background:isDark?'#1a1a2e':'#fff', border:`1px solid ${t.cardBorder}` }}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Create Post</h3>
              <button onClick={() => { setShowPost(false); clearMedia(); }}><IcoClose size={20} color={t.textMuted} /></button>
            </div>

            {/* Audience Selector -- 4 Profile Types */}
            <div>
              <p className="text-[10px] font-semibold mb-2" style={{ color:t.textMuted }}>POST VISIBILITY</p>
              <div className="grid grid-cols-4 gap-1.5">
                {AUDIENCES.map(a => (
                  <button key={a.key} onClick={() => setPostAudience(a.key)} className="flex flex-col items-center gap-1 p-2 rounded-xl" style={{
                    background: postAudience===a.key ? `${a.color}15` : 'transparent',
                    border: `1.5px solid ${postAudience===a.key ? a.color : t.cardBorder}`,
                  }}>
                    <span className="text-lg">{a.icon}</span>
                    <span className="text-[9px] font-semibold" style={{ color: postAudience===a.key ? a.color : t.textMuted }}>{a.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-[9px] mt-1 text-center" style={{ color:audienceInfo.color }}>{audienceInfo.desc}</p>
            </div>

            {/* Post Type Toggle */}
            <div className="flex gap-2">
              {(['text','photo','video'] as const).map(pt => (
                <button key={pt} onClick={() => { setPostType(pt); if(pt==='text') clearMedia(); }} className="flex-1 py-2 rounded-xl text-xs font-medium capitalize" style={{ background:postType===pt?t.accentLight:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)', color:postType===pt?t.accent:t.textSecondary, border:`1px solid ${postType===pt?t.accent+'33':t.cardBorder}` }}>{pt}</button>
              ))}
            </div>

            {/* Media Upload */}
            {postType !== 'text' && (
              <div className="space-y-2">
                {mediaPreview ? (
                  <div className="relative rounded-xl overflow-hidden" style={{ border:`1px solid ${t.cardBorder}` }}>
                    {postType === 'photo' ? <img src={mediaPreview} alt="Preview" style={{ width:'100%', maxHeight:200, objectFit:'cover', display:'block' }} /> : <video src={mediaPreview} controls style={{ width:'100%', maxHeight:200, display:'block' }} />}
                    <div className="absolute top-2 right-2"><button onClick={clearMedia} className="px-3 py-1 rounded-lg text-[11px] font-bold text-white" style={{ background:'rgba(0,0,0,0.7)' }}>x Remove</button></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => cameraRef.current?.click()} className="h-24 rounded-xl flex flex-col items-center justify-center" style={{ border:`2px dashed ${t.accent}55` }}>
                      <span className="text-lg mb-1">Camera</span><p className="text-xs font-semibold" style={{ color:t.accent }}>Camera</p>
                    </button>
                    <button onClick={() => (postType==='photo'?photoRef:videoRef).current?.click()} className="h-24 rounded-xl flex flex-col items-center justify-center" style={{ border:`2px dashed ${t.cardBorder}` }}>
                      <span className="text-lg mb-1">Gallery</span><p className="text-xs font-semibold" style={{ color:'#8b5cf6' }}>Gallery</p>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Text Area */}
            <div>
              <HashDropdown inputId="post" />
              <textarea value={postText} onChange={e => handleTextChange(e.target.value, 'post')} rows={4} placeholder="What's happening? Use #hashtags..." className="w-full p-3 rounded-xl text-sm outline-none resize-none" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, color:t.text }} />
            </div>

            {/* Post / Cancel */}
            <div className="flex gap-2">
              <button onClick={handlePost} disabled={(!postText.trim() && !mediaPreview) || posting} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-40" style={{ background:`linear-gradient(135deg,${t.accent},#8b5cf6)` }}>
                {posting ? 'Posting...' : `Post to ${audienceInfo.label} ${audienceInfo.icon}`}
              </button>
              <button onClick={() => { setShowPost(false); clearMedia(); }} className="px-6 py-3 rounded-xl text-sm" style={{ color:t.textMuted, border:`1px solid ${t.cardBorder}` }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
