"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { DEMO_WORKERS, DEMO_JOBS, SOCIAL_FEED, HASHTAGS, getUserPosts, addUserPost, getProfilePrefs, getAllBuddyGroupsForTagging, getBuddyGroupPosts } from '@/lib/demoData';
import { IcoJobs, IcoUser, IcoMap, IcoMarket, IcoWallet, IcoFriends, IcoQR, IcoShield, IcoHeart, IcoSend, IcoHash, IcoEdit, IcoTrash, IcoEmoji, IcoMic, IcoClose, IcoGlobe, IcoBriefcase, IcoGrad, IcoSearch, IcoFlag, IcoCommunity, IcoStore } from '@/components/Icons';
import { createPost as dbCreatePost, deletePost as dbDeletePost, updatePost as dbUpdatePost, getSession, createStatus as dbCreateStatus, deleteStatus as dbDeleteStatus, updateStatus as dbUpdateStatus } from '@/lib/supabase';

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

/* BR-BG-002: Buddy Groups for tagging — dynamically loaded including user-created groups */

/* Emoji quick picker */
const EMOJI_SET = ['👍','❤️','😂','😮','😢','😡','🎉','🔥','💯','🙏','👏','💪','✨','🚀','💎','🌟'];

function getComments(postId:string) { try { return JSON.parse(localStorage.getItem(`datore-comments-${postId}`)||'[]'); } catch { return []; } }
function saveComments(postId:string, c:any[]) { try { localStorage.setItem(`datore-comments-${postId}`, JSON.stringify(c)); } catch {} }

function renderHashText(text:string, accent:string, router:any) {
  const parts = text.split(/(#Buddy:\w+|#[a-zA-Z0-9_]+)/g);
  return parts.map((part,i) => part.startsWith('#Buddy:') ? <span key={i} onClick={(e)=>{e.stopPropagation();router.push('/buddy-groups');}} style={{ color:'#8b5cf6', fontWeight:700, cursor:'pointer', background:'rgba(139,92,246,0.1)', padding:'1px 6px', borderRadius:6, fontSize:'inherit' }}>{part}</span> : part.startsWith('#') ? <span key={i} onClick={(e)=>{e.stopPropagation();router.push(`/search?q=${encodeURIComponent(part)}`);}} style={{ color:accent, fontWeight:600, cursor:'pointer' }}>{part}</span> : <span key={i}>{part}</span>);
}

export default function HomePage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const [tab, setTab] = useState<'feed'|'community'|'discover'>('feed');
  const [showPost, setShowPost] = useState(false);
  const [postText, setPostText] = useState('');
  const [postType, setPostType] = useState<'text'|'photo'|'video'>('text');
  const [postAudience, setPostAudience] = useState<Audience>('public');
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
  const [editingPost, setEditingPost] = useState<string|null>(null);
  const [editText, setEditText] = useState('');
  const [showEmoji, setShowEmoji] = useState<string|null>(null);
  const [postReactions, setPostReactions] = useState<Record<string,string[]>>({});
  const [moderationAlert, setModerationAlert] = useState<ModerationAlert|null>(null);
  const [voiceSearch, setVoiceSearch] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedBuddyGroups, setSelectedBuddyGroups] = useState<string[]>([]);
  const [buddyTagSearch, setBuddyTagSearch] = useState('');
  const [showBuddyTagPicker, setShowBuddyTagPicker] = useState(false);
  const [buddyGroupsList, setBuddyGroupsList] = useState<{id:string;name:string;icon:string}[]>([]);
  const photoRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const prefs = getProfilePrefs();
  
  // Fix: Load user avatar PER AUDIENCE — different photo for Public/Friends/Professional
  const getUserAvatarForAudience = (audience:string):{type:'image'|'emoji'|'initials';src:string} => {
    try {
      const saved = localStorage.getItem('datore-avatars');
      if (saved) {
        const avatars = JSON.parse(saved);
        // ONLY use the avatar specifically set for THIS audience — no cross-audience fallback
        const src = avatars[audience];
        if (src && src.startsWith('data:image')) return {type:'image',src};
        if (src && src.length <= 4) return {type:'emoji',src};
      }
    } catch {}
    // Distinct visual per audience so they look different when no custom photo is uploaded
    const audienceIcons: Record<string,string> = { public:'🌐', friends:'💛', buddy:'👥', professional:'💼' };
    if (audienceIcons[audience]) return {type:'emoji',src:audienceIcons[audience]};
    return {type:'initials',src:(prefs.name||'DU').split(' ').map((n:string)=>n[0]).join('').slice(0,2)};
  };
  const userAvatar = getUserAvatarForAudience('public'); // default for composer

  useEffect(() => { setUserPosts(getUserPosts()); setBuddyGroupsList(getAllBuddyGroupsForTagging()); }, []);

  /* Display-time re-censor: Always re-run moderation on render to catch posts saved before moderation existed */
  const censorForDisplay = (text: string): string => {
    const r = _moderate(text, 'post');
    return (r.severity === 'low' || r.severity === 'medium' || r.severity === 'high' || r.severity === 'critical') ? r.cleaned : text;
  };
  // BG-FR-005: Merge buddy group posts into the homepage feed for group members
  const buddyGroupFeedPosts = getBuddyGroupPosts().map(bgp => ({
    id: bgp.id,
    text: censorForDisplay(bgp.text),
    user: bgp.authorName,
    avatar: bgp.authorAvatar,
    avatarType: 'initials' as const,
    time: bgp.createdAt ? new Date(bgp.createdAt).toLocaleString(undefined, { month:'short', day:'numeric', hour:'numeric', minute:'2-digit' }) : 'Recently',
    likes: bgp.likes,
    comments: bgp.comments,
    type: 'text' as const,
    isOwn: bgp.authorId === 'me',
    audience: 'buddy' as Audience,
    groupSource: `${bgp.groupIcon} ${bgp.groupName}`,
  }));
  const allFeed = [
    ...userPosts.map(p => {const av = getUserAvatarForAudience(p.audience||'public'); return {...p, text: censorForDisplay(p.text), isOwn:true, user: prefs.name || 'You', avatar: av.src, avatarType: av.type};}),
    ...buddyGroupFeedPosts,
    ...SOCIAL_FEED.map(p => ({...p, isOwn:false, audience:'public' as Audience, avatarType:'initials' as const})),
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'photo'|'video') => {
    const file = e.target.files?.[0]; if (!file) return;
    if (!isImageSafe(file.name)) {
      setModerationAlert({ safe:false, severity:'severe', flags:['Adult/explicit content detected in filename'], cleaned:'', blocked:true });
      return;
    }
    setPostType(type); setMediaName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => { setMediaPreview(ev.target?.result as string); };
    reader.readAsDataURL(file);
    if (!showPost) setShowPost(true);
  };
  const clearMedia = () => { setMediaPreview(null); setMediaName(''); };

  /* AI-moderated post submission — saves to both localStorage AND Supabase DB */
  const handlePost = async () => {
    if (!postText.trim() && !mediaPreview) return;
    const modResult = moderatePost(postText);
    if (modResult.severity === 'severe') {
      setModerationAlert(modResult);
      return;
    }
    let finalText = (modResult.severity === 'mild' || modResult.severity === 'moderate') ? modResult.cleaned : postText.trim();
    if (postAudience === 'buddy' && selectedBuddyGroups.length > 0) {
      const tags = selectedBuddyGroups.map(id => { const g = buddyGroupsList.find(bg => bg.id === id); return g ? `#Buddy:${g.name.replace(/\s+/g,'')}` : ''; }).filter(Boolean).join(' ');
      finalText = `${tags} ${finalText}`;
    }
    addUserPost({ text: finalText, type: postType, media: mediaPreview || undefined, audience: postAudience });
    setUserPosts(getUserPosts());
    // Persist to Supabase DB
    try {
      const { data: session } = await getSession();
      const userId = session?.session?.user?.id;
      if (userId) await dbCreatePost({ author_id: userId, author_name: prefs.name || 'User', text: finalText, audience: postAudience, type: postType });
    } catch {}
    setPostText(''); setShowPost(false); setPostType('text'); setPostAudience('public'); clearMedia(); setSelectedBuddyGroups([]); setBuddyTagSearch(''); setShowBuddyTagPicker(false);
    if (modResult.severity === 'mild' || modResult.severity === 'moderate') setModerationAlert(modResult);
  };

  const handleLike = (id: string) => setLikedPosts(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);

  /* BR-101: Edit own post — saves to localStorage + Supabase DB */
  const saveEdit = async (postId: string) => {
    const modResult = moderatePost(editText);
    if (modResult.severity === 'severe') { setModerationAlert(modResult); return; }
    const finalText = (modResult.severity==='mild'||modResult.severity==='moderate')?modResult.cleaned:editText;
    setUserPosts(prev => prev.map(p => p.id === postId ? {...p, text: finalText} : p));
    setEditingPost(null); setEditText('');
    // Persist to DB
    try { await dbUpdatePost(postId, finalText); } catch {}
  };

  /* BR-101: Delete own post — removes from localStorage + Supabase DB */
  const deletePost = async (postId: string) => {
    setUserPosts(prev => prev.filter(p => p.id !== postId));
    try { const all = getUserPosts().filter((p:any) => p.id !== postId); localStorage.setItem('datore-user-posts', JSON.stringify(all)); } catch {}
    // Persist to DB
    try { await dbDeletePost(postId); } catch {}
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

  /* Comments */
  const toggleComments = (postId: string) => {
    if (openComments === postId) { setOpenComments(null); return; }
    setOpenComments(postId);
    if (!commentData[postId]) setCommentData(prev => ({...prev, [postId]: getComments(postId) }));
  };
  const submitComment = (postId: string) => {
    const text = (commentInputs[postId]||'').trim(); if (!text) return;
    const newC = { id: Date.now().toString(), user: prefs.name||'You', text, time: 'Just now', likes: 0 };
    const updated = [...(commentData[postId]||[]), newC];
    setCommentData(prev => ({...prev, [postId]: updated})); saveComments(postId, updated);
    setCommentInputs(prev => ({...prev, [postId]: ''})); setHashSuggestions([]);
  };
  const deleteComment = (postId: string, commentId: string) => {
    const updated = (commentData[postId]||[]).filter((c:any)=>c.id!==commentId);
    setCommentData(prev => ({...prev, [postId]: updated})); saveComments(postId, updated);
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

  /* ═══ Status / Stories Data ═══ */
  const [viewingStatus, setViewingStatus] = useState<{user:string;avatar:string;text:string;time:string;bg:string}|null>(null);
  const [myStatusText, setMyStatusText] = useState('');
  const [showAddStatus, setShowAddStatus] = useState(false);
  const [myStatuses, setMyStatuses] = useState<{text:string;time:string;bg:string}[]>(() => {
    try { return JSON.parse(localStorage.getItem('datore-my-statuses')||'[]'); } catch { return []; }
  });

  const STATUS_BG = ['linear-gradient(135deg,#6366f1,#8b5cf6)','linear-gradient(135deg,#ec4899,#f43f5e)','linear-gradient(135deg,#22c55e,#06b6d4)','linear-gradient(135deg,#f59e0b,#ef4444)','linear-gradient(135deg,#3b82f6,#8b5cf6)'];

  const othersStatuses = [
    { user:'Sarah Chen', avatar:'SC', text:'Just finished a 5K run! Feeling great today! 🏃‍♀️', time:'2h ago', bg:'linear-gradient(135deg,#ec4899,#f43f5e)' },
    { user:'Mike Johnson', avatar:'MJ', text:'New plumbing project completed. Another happy client! 🔧', time:'4h ago', bg:'linear-gradient(135deg,#3b82f6,#8b5cf6)' },
    { user:'Priya K.', avatar:'PK', text:'Teaching math online today. Join my session! 📐', time:'1h ago', bg:'linear-gradient(135deg,#22c55e,#06b6d4)' },
    { user:'David L.', avatar:'DL', text:'Beautiful sunset from my garden 🌅🌻', time:'30m ago', bg:'linear-gradient(135deg,#f59e0b,#ef4444)' },
    { user:'Lisa Park', avatar:'LP', text:'Morning yoga complete. Namaste! 🧘‍♀️', time:'3h ago', bg:'linear-gradient(135deg,#6366f1,#a78bfa)' },
    { user:'Tom R.', avatar:'TR', text:'Cooking tacos tonight! Who wants the recipe? 🌮', time:'5h ago', bg:'linear-gradient(135deg,#ef4444,#f97316)' },
  ];

  const addMyStatus = async () => {
    if (!myStatusText.trim()) return;
    const s = { text: myStatusText.trim(), time: 'Just now', bg: STATUS_BG[myStatuses.length % STATUS_BG.length] };
    const updated = [s, ...myStatuses];
    setMyStatuses(updated);
    try { localStorage.setItem('datore-my-statuses', JSON.stringify(updated)); } catch {}
    setMyStatusText('');
    setShowAddStatus(false);
    // Persist to DB
    try { const { data: session } = await getSession(); const userId = session?.session?.user?.id; if (userId) await dbCreateStatus({ author_id: userId, text: s.text, background: s.bg }); } catch {}
  };

  const deleteMyStatus = async (idx: number) => {
    const status = myStatuses[idx];
    const updated = myStatuses.filter((_,i) => i !== idx);
    setMyStatuses(updated);
    try { localStorage.setItem('datore-my-statuses', JSON.stringify(updated)); } catch {}
    setViewingStatus(null);
    // Persist to DB
    try { if ((status as any).dbId) await dbDeleteStatus((status as any).dbId); } catch {}
  };

  const [editingStatusIdx, setEditingStatusIdx] = useState<number|null>(null);
  const [editStatusText, setEditStatusText] = useState('');

  const startEditStatus = (idx: number) => {
    setEditingStatusIdx(idx);
    setEditStatusText(myStatuses[idx].text);
    setViewingStatus(null);
  };

  const saveEditStatus = async () => {
    if (editingStatusIdx === null || !editStatusText.trim()) return;
    const status = myStatuses[editingStatusIdx];
    const updated = myStatuses.map((s,i) => i === editingStatusIdx ? {...s, text: editStatusText.trim()} : s);
    setMyStatuses(updated);
    try { localStorage.setItem('datore-my-statuses', JSON.stringify(updated)); } catch {}
    setEditingStatusIdx(null);
    setEditStatusText('');
    // Persist to DB
    try { if ((status as any).dbId) await dbUpdateStatus((status as any).dbId, editStatusText.trim()); } catch {}
  };

  /* ═══ Reels preview for home page ═══ */
  const REEL_PREVIEWS = [
    { id:'r1', user:'Anita S.', scene:'🧹✨', label:'Cleaning Tips', gradient:'linear-gradient(160deg,#0a2e1a,#134e2e)', likes:'2.3K' },
    { id:'r2', user:'Mike C.', scene:'🔧💧', label:'DIY Plumbing', gradient:'linear-gradient(160deg,#1a1a3e,#2a2a5e)', likes:'8.9K' },
    { id:'r3', user:'Priya K.', scene:'📐✏️', label:'Math Tricks', gradient:'linear-gradient(160deg,#2e1a3e,#4a2a6e)', likes:'12K' },
    { id:'r5', user:'Sarah C.', scene:'💼🌟', label:'Day In Life', gradient:'linear-gradient(160deg,#1a1a2e,#3a2a4a)', likes:'21K' },
    { id:'r7', user:'Lisa P.', scene:'💪⚡', label:'Workout', gradient:'linear-gradient(160deg,#0a1a2e,#1a3e5e)', likes:'15K' },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={e => handleFileSelect(e, 'photo')} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => handleFileSelect(e, 'photo')} />
      <input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={e => handleFileSelect(e, 'video')} />

      {/* ═══ Status / Stories Bar ═══ */}
      <div className="rounded-2xl p-3" style={{ background:t.card, border:`1px solid ${t.cardBorder}` }}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-sm">Status</h2>
          <button onClick={()=>router.push('/reels')} className="text-[10px] font-semibold" style={{ color:t.accent }}>See all</button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth:'none' }}>
          {/* My Status */}
          <button onClick={()=>myStatuses.length > 0 ? setViewingStatus({ user:'You', avatar: (prefs.name||'You').split(' ').map((n:string)=>n[0]).join('').slice(0,2), text:myStatuses[0].text, time:myStatuses[0].time, bg:myStatuses[0].bg }) : setShowAddStatus(true)} className="flex flex-col items-center gap-1 flex-shrink-0" style={{ background:'none', border:'none', cursor:'pointer', width:62 }}>
            <div className="relative">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold" style={{
                background: myStatuses.length > 0 ? 'none' : `linear-gradient(135deg,${t.accent}33,#8b5cf633)`,
                border: myStatuses.length > 0 ? `2.5px solid ${t.accent}` : `2.5px dashed ${t.textMuted}`,
                color: t.accent,
              }}>
                {userAvatar.type==='image' ? <img src={userAvatar.src} alt="" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}}/> : userAvatar.type==='emoji' ? <span className="text-xl">{userAvatar.src}</span> : userAvatar.src}
              </div>
              <div onClick={(e)=>{e.stopPropagation();setShowAddStatus(true);}} className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background:t.accent, border:`2px solid ${isDark?'#1a1a2e':'#fff'}` }}>+</div>
            </div>
            <span className="text-[9px] font-medium truncate w-full text-center" style={{ color:myStatuses.length > 0 ? t.text : t.textMuted }}>{myStatuses.length > 0 ? 'Your Status' : 'Add Status'}</span>
          </button>

          {/* Others' Statuses */}
          {othersStatuses.map((s, i) => (
            <button key={i} onClick={()=>setViewingStatus(s)} className="flex flex-col items-center gap-1 flex-shrink-0" style={{ background:'none', border:'none', cursor:'pointer', width:62 }}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-xs font-bold" style={{
                background:`linear-gradient(135deg,${t.accent}22,#8b5cf622)`,
                border:`2.5px solid ${['#ec4899','#3b82f6','#22c55e','#f59e0b','#6366f1','#ef4444'][i % 6]}`,
                color: t.accent,
              }}>
                {s.avatar}
              </div>
              <span className="text-[9px] font-medium truncate w-full text-center" style={{ color:t.text }}>{s.user.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ═══ Reels Preview Strip ═══ */}
      <div className="rounded-2xl p-3" style={{ background:t.card, border:`1px solid ${t.cardBorder}` }}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-sm">Reels</h2>
          <button onClick={()=>router.push('/reels')} className="text-[10px] font-semibold" style={{ color:'#ec4899' }}>Watch all</button>
        </div>
        <div className="flex gap-2.5 overflow-x-auto pb-1" style={{ scrollbarWidth:'none' }}>
          {/* Create Reel */}
          <button onClick={()=>router.push('/reels')} className="flex-shrink-0" style={{ width:90, height:130, borderRadius:14, background:`linear-gradient(135deg,${t.accent}22,#ec489922)`, border:`2px dashed ${t.accent}44`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:6, cursor:'pointer' }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background:'linear-gradient(135deg,#ec4899,#6366f1)' }}>+</div>
            <span className="text-[9px] font-semibold" style={{ color:t.accent }}>Create Reel</span>
          </button>
          {REEL_PREVIEWS.map(reel => (
            <button key={reel.id} onClick={()=>router.push('/reels')} className="flex-shrink-0 relative overflow-hidden" style={{ width:90, height:130, borderRadius:14, background:reel.gradient, cursor:'pointer', border:'none' }}>
              <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:8 }}>
                <span style={{ fontSize:28, marginBottom:4 }}>{reel.scene}</span>
                <span style={{ fontSize:8, color:'rgba(255,255,255,0.9)', fontWeight:700, textAlign:'center' }}>{reel.label}</span>
              </div>
              <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'6px 8px', background:'rgba(0,0,0,0.5)', backdropFilter:'blur(4px)' }}>
                <p style={{ fontSize:8, color:'#fff', fontWeight:600 }}>{reel.user}</p>
                <p style={{ fontSize:7, color:'rgba(255,255,255,0.7)' }}>{reel.likes} likes</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ═══ View Status Modal ═══ */}
      {viewingStatus && (
        <div style={{ position:'fixed', inset:0, zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center' }} onClick={()=>setViewingStatus(null)}>
          <div style={{ position:'absolute', inset:0, background:viewingStatus.bg }} />
          <div onClick={e=>e.stopPropagation()} style={{ position:'relative', zIndex:1, width:'100%', maxWidth:400, padding:24, textAlign:'center' }}>
            <div style={{ position:'absolute', top:16, left:16, right:16, display:'flex', alignItems:'center', gap:10 }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ background:'rgba(255,255,255,0.2)', color:'#fff' }}>{viewingStatus.avatar}</div>
              <div style={{ textAlign:'left' }}>
                <p style={{ fontSize:13, fontWeight:700, color:'#fff' }}>{viewingStatus.user}</p>
                <p style={{ fontSize:10, color:'rgba(255,255,255,0.7)' }}>{viewingStatus.time}</p>
              </div>
              <button onClick={()=>setViewingStatus(null)} style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', color:'#fff', fontSize:20 }}>x</button>
            </div>
            <div style={{ marginTop:80 }}>
              <p style={{ fontSize:22, fontWeight:700, color:'#fff', lineHeight:1.4, textShadow:'0 2px 8px rgba(0,0,0,0.3)' }}>{viewingStatus.text}</p>
            </div>
            {/* Edit/Delete for own statuses */}
            {viewingStatus.user === 'You' && (
              <div style={{ marginTop:32, display:'flex', gap:12, justifyContent:'center' }}>
                <button onClick={()=>{ const idx = myStatuses.findIndex(s=>s.text===viewingStatus.text); if(idx>=0) startEditStatus(idx); }} style={{ padding:'8px 20px', borderRadius:12, background:'rgba(255,255,255,0.2)', backdropFilter:'blur(8px)', color:'#fff', border:'1px solid rgba(255,255,255,0.3)', fontSize:12, fontWeight:600, cursor:'pointer' }}>Edit</button>
                <button onClick={()=>{ const idx = myStatuses.findIndex(s=>s.text===viewingStatus.text); if(idx>=0) deleteMyStatus(idx); }} style={{ padding:'8px 20px', borderRadius:12, background:'rgba(239,68,68,0.3)', backdropFilter:'blur(8px)', color:'#fff', border:'1px solid rgba(239,68,68,0.4)', fontSize:12, fontWeight:600, cursor:'pointer' }}>Delete</button>
              </div>
            )}
            {/* Progress bar */}
            <div style={{ position:'absolute', top:8, left:16, right:16, height:3, borderRadius:2, background:'rgba(255,255,255,0.3)', overflow:'hidden' }}>
              <div style={{ width:'100%', height:'100%', borderRadius:2, background:'#fff', animation:'statusProgress 5s linear forwards' }} />
            </div>
          </div>
        </div>
      )}

      {/* ═══ Edit Status Modal ═══ */}
      {editingStatusIdx !== null && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }} onClick={()=>setEditingStatusIdx(null)}>
          <div onClick={e=>e.stopPropagation()} className="w-full max-w-sm rounded-2xl p-5 space-y-4" style={{ background:isDark?'#1a1a2e':'#fff' }}>
            <h3 className="font-bold text-base">Edit Status</h3>
            <textarea value={editStatusText} onChange={e=>setEditStatusText(e.target.value)} rows={3} placeholder="Update your status..." className="w-full p-3 rounded-xl text-sm outline-none resize-none" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, color:t.text }} />
            <div className="flex gap-2">
              <button onClick={saveEditStatus} disabled={!editStatusText.trim()} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40" style={{ background:`linear-gradient(135deg,${t.accent},#8b5cf6)` }}>Save</button>
              <button onClick={()=>setEditingStatusIdx(null)} className="px-4 py-2.5 rounded-xl text-sm" style={{ color:t.textMuted, border:`1px solid ${t.cardBorder}` }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Add Status Modal ═══ */}
      {showAddStatus && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }} onClick={()=>setShowAddStatus(false)}>
          <div onClick={e=>e.stopPropagation()} className="w-full max-w-sm rounded-2xl p-5 space-y-4" style={{ background:isDark?'#1a1a2e':'#fff' }}>
            <h3 className="font-bold text-base">Add Status</h3>
            <textarea value={myStatusText} onChange={e=>setMyStatusText(e.target.value)} rows={3} placeholder="What's on your mind? Share a quick update..." className="w-full p-3 rounded-xl text-sm outline-none resize-none" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, color:t.text }} />
            <div className="flex gap-2">
              <button onClick={addMyStatus} disabled={!myStatusText.trim()} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40" style={{ background:`linear-gradient(135deg,${t.accent},#8b5cf6)` }}>Share Status</button>
              <button onClick={()=>setShowAddStatus(false)} className="px-4 py-2.5 rounded-xl text-sm" style={{ color:t.textMuted, border:`1px solid ${t.cardBorder}` }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

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
                  {moderationAlert.severity==='severe'?'⛔ Content Blocked':'⚠️ Content Modified'}
                </h3>
                <p className="text-[10px]" style={{ color:t.textMuted }}>AI Safety System</p>
              </div>
            </div>
            {moderationAlert.flags.map((f,i)=>(<p key={i} className="text-xs mb-1" style={{ color:t.text }}>• {f}</p>))}
            {(moderationAlert.severity==='mild'||moderationAlert.severity==='moderate')&&<p className="text-[10px] mt-2" style={{ color:t.textMuted }}>Profanity has been censored. Your post was published.</p>}
            {moderationAlert.severity==='severe'&&<p className="text-[10px] mt-2" style={{ color:'#ef4444' }}>This content violates community guidelines and cannot be posted.</p>}
            <button onClick={()=>setModerationAlert(null)} className="w-full mt-3 py-2 rounded-xl text-xs font-bold text-white" style={{ background:moderationAlert.severity==='severe'?'#ef4444':'#f59e0b' }}>Understood</button>
          </div>
        </div>
      )}

      {/* Create Post Bar */}
      <div className="rounded-2xl p-3" style={{ background:t.card, border:`1px solid ${t.cardBorder}` }}>
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setShowPost(true); setBuddyGroupsList(getAllBuddyGroupsForTagging()); }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 overflow-hidden" style={{ background:`linear-gradient(135deg,${t.accent}44,#8b5cf644)`, color:t.accent }}>
            {userAvatar.type==='image' ? <img src={userAvatar.src} alt="" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}}/> : userAvatar.type==='emoji' ? <span className="text-xl">{userAvatar.src}</span> : userAvatar.src}
          </div>
          <p className="flex-1 text-sm" style={{ color:t.textMuted }}>Share what's on your mind...</p>
          <button onClick={e => { e.stopPropagation(); photoRef.current?.click(); }} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background:'rgba(34,197,94,0.1)', color:'#22c55e' }}>📷 Photo</button>
          <button onClick={e => { e.stopPropagation(); videoRef.current?.click(); }} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background:'rgba(239,68,68,0.1)', color:'#ef4444' }}>🎥 Video</button>
        </div>
      </div>

      {/* Feed / Community / Discover Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setTab('feed')} className="flex-1 py-2.5 rounded-xl text-xs font-semibold" style={{ background:tab==='feed'?t.accentLight:'transparent', color:tab==='feed'?t.accent:t.textSecondary, border:tab==='feed'?`1px solid ${t.accent}33`:'1px solid transparent' }}>Social Feed</button>
        <button onClick={() => setTab('community')} className="flex-1 py-2.5 rounded-xl text-xs font-semibold" style={{ background:tab==='community'?'rgba(6,182,212,0.12)':'transparent', color:tab==='community'?'#06b6d4':t.textSecondary, border:tab==='community'?'1px solid rgba(6,182,212,0.3)':'1px solid transparent' }}>Community</button>
        <button onClick={() => setTab('discover')} className="flex-1 py-2.5 rounded-xl text-xs font-semibold" style={{ background:tab==='discover'?t.accentLight:'transparent', color:tab==='discover'?t.accent:t.textSecondary, border:tab==='discover'?`1px solid ${t.accent}33`:'1px solid transparent' }}>Discover</button>
      </div>

      {tab === 'community' ? (
        <div className="space-y-3">
          <div className="rounded-2xl p-4" style={{ background:t.card, border:`1px solid ${t.cardBorder}` }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-sm">Community Groups</h2>
              <button onClick={() => router.push('/community')} className="text-xs font-semibold" style={{ color:'#06b6d4' }}>View All</button>
            </div>
            <div className="space-y-2">
              {[
                { name:'Local Neighborhood', members:'2.4K', desc:'Connect with people in your area', icon:'🏘️', color:'#22c55e' },
                { name:'Tech Professionals', members:'5.1K', desc:'IT & software community discussions', icon:'💻', color:'#3b82f6' },
                { name:'Job Seekers Network', members:'3.8K', desc:'Share opportunities and career advice', icon:'💼', color:'#8b5cf6' },
                { name:'Creative Arts Hub', members:'1.9K', desc:'Artists, designers, and creators unite', icon:'🎨', color:'#ec4899' },
                { name:'Parents & Families', members:'4.2K', desc:'Family life tips and support', icon:'👨‍👩‍👧‍👦', color:'#f59e0b' },
                { name:'Sports & Fitness', members:'2.7K', desc:'Stay active and competitive', icon:'⚽', color:'#ef4444' },
              ].map(g => (
                <div key={g.name} onClick={() => router.push('/community')} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all" style={{ background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.02)', border:`1px solid ${t.cardBorder}` }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background:`${g.color}15` }}>{g.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{g.name}</p>
                    <p className="text-[10px]" style={{ color:t.textMuted }}>{g.members} members &middot; {g.desc}</p>
                  </div>
                  <button className="px-3 py-1.5 rounded-lg text-[10px] font-bold" style={{ background:'rgba(6,182,212,0.12)', color:'#06b6d4' }}>Join</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : tab === 'feed' ? (
        <div className="space-y-3">
          {allFeed.map(post => {
            const comments = commentData[post.id] || [];
            const commentCount = (post.comments||0) + comments.length;
            const reactions = postReactions[post.id] || [];
            const aud = AUDIENCES.find(a => a.key === (post as any).audience) || AUDIENCES[0];
            return (
            <div key={post.id} className="rounded-2xl p-4" style={{ background:t.card, border:`1px solid ${t.cardBorder}` }}>
              {/* Post Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold overflow-hidden flex-shrink-0" style={{ background:`linear-gradient(135deg,${t.accent}33,#8b5cf633)`, color:t.accent }}>
                  {(post as any).avatarType==='image'?<img src={post.avatar} alt="" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}}/>:(post as any).avatarType==='emoji'?<span className="text-xl">{post.avatar}</span>:post.avatar}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{post.user}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px]" style={{ color:t.textMuted }}>{post.time}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background:`${aud.color}15`, color:aud.color }}>{aud.icon} {aud.label}</span>
                    {(post as any).groupSource && <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ background:'rgba(139,92,246,0.12)', color:'#8b5cf6' }}>{(post as any).groupSource}</span>}
                  </div>
                </div>
                {/* BR-101: Edit & Delete for own posts */}
                {(post as any).isOwn && (
                  <div className="flex items-center gap-1">
                    <button onClick={()=>{setEditingPost(post.id);setEditText(post.text);}} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background:'rgba(59,130,246,0.1)' }} title="Edit"><IcoEdit size={14} color="#3b82f6" /></button>
                    <button onClick={()=>deletePost(post.id)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background:'rgba(239,68,68,0.1)' }} title="Delete"><IcoClose size={14} color="#ef4444" /></button>
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
                  {post.media.startsWith('data:video') ? <video src={post.media} controls playsInline style={{ width:'100%', maxHeight:300, display:'block', background:'#000' }} />
                  : post.media.startsWith('data:image') ? <img src={post.media} alt="Post" style={{ width:'100%', maxHeight:300, objectFit:'cover', display:'block' }} />
                  : <div className="h-32 flex items-center justify-center" style={{ background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)' }}><p className="text-sm" style={{ color:t.textMuted }}>[{post.type === 'video' ? 'Video' : 'Photo'} content]</p></div>}
                </div>
              )}

              {/* Emoji Reactions */}
              {reactions.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {reactions.map((em,i) => (<span key={i} className="px-2 py-0.5 rounded-full text-xs" style={{ background:t.accentLight }}>{em}</span>))}
                </div>
              )}

              {/* Action Bar: Right-aligned — Like, Comment, Share, Report, Emoji */}
              <div className="flex items-center gap-3 pt-3 justify-end" style={{ borderTop:`1px solid ${t.cardBorder}` }}>
                <button onClick={() => handleLike(post.id)} className="flex items-center gap-1 text-xs" style={{ color:likedPosts.includes(post.id)?'#ef4444':t.textMuted }}>
                  <IcoHeart size={14} color={likedPosts.includes(post.id)?'#ef4444':t.textMuted} fill={likedPosts.includes(post.id)?'#ef4444':'none'} />
                  Like ({post.likes + (likedPosts.includes(post.id)?1:0)})
                </button>
                <button onClick={() => toggleComments(post.id)} className="flex items-center gap-1 text-xs" style={{ color:openComments===post.id?t.accent:t.textMuted }}>💬 Comment ({commentCount})</button>
                <button onClick={() => setShowShare(showShare===post.id?null:post.id)} className="text-xs" style={{ color:t.textMuted }}>↗ Share</button>
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
                  <div><p className="text-xs font-semibold">{w.full_name}</p><p className="text-[10px]" style={{ color:t.textMuted }}>⭐ {w.rating}</p></div>
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

            {/* Buddy Group Tag Picker -- shown when Buddy+ is selected */}
            {postAudience === 'buddy' && (
              <div>
                <p className="text-[10px] font-semibold mb-1.5" style={{ color:t.textMuted }}>TAG BUDDY GROUPS <span style={{ color:'#8b5cf6', fontWeight:400 }}>( use #Buddy:GroupName )</span></p>
                {selectedBuddyGroups.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {selectedBuddyGroups.map(id => { const g = buddyGroupsList.find(bg=>bg.id===id); if(!g) return null; return (
                      <span key={id} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold" style={{ background:'rgba(139,92,246,0.15)', color:'#8b5cf6', border:'1px solid rgba(139,92,246,0.3)' }}>
                        {g.icon} #Buddy:{g.name.replace(/\s+/g,'')}
                        <button onClick={() => setSelectedBuddyGroups(prev => prev.filter(x=>x!==id))} className="ml-0.5 text-[9px] opacity-70 hover:opacity-100" style={{ color:'#8b5cf6' }}>✕</button>
                      </span>
                    );})}
                  </div>
                )}
                <div className="flex items-center gap-2 p-2 rounded-xl" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}` }}>
                  <span className="text-xs" style={{ color:'#8b5cf6' }}>#Buddy:</span>
                  <input value={buddyTagSearch} onChange={e => { setBuddyTagSearch(e.target.value); setShowBuddyTagPicker(true); }} onFocus={() => setShowBuddyTagPicker(true)} placeholder="Search buddy groups..." className="flex-1 text-xs bg-transparent outline-none" style={{ color:t.text }} />
                </div>
                {showBuddyTagPicker && (
                  <div className="mt-1.5 max-h-32 overflow-y-auto rounded-xl p-1.5 space-y-0.5" style={{ background:t.card, border:`1px solid ${t.cardBorder}` }}>
                    {buddyGroupsList.filter(g => !selectedBuddyGroups.includes(g.id) && (!buddyTagSearch || g.name.toLowerCase().includes(buddyTagSearch.toLowerCase()))).map(g => (
                      <button key={g.id} onClick={() => { setSelectedBuddyGroups(prev => [...prev, g.id]); setBuddyTagSearch(''); setShowBuddyTagPicker(false); }} className="w-full flex items-center gap-2 p-2 rounded-lg text-left text-xs" style={{ color:t.text }} onMouseOver={e => (e.currentTarget.style.background = 'rgba(139,92,246,0.1)')} onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
                        <span>{g.icon}</span>
                        <span className="font-medium">{g.name}</span>
                        <span className="text-[9px] ml-auto" style={{ color:'#8b5cf6' }}>#Buddy:{g.name.replace(/\s+/g,'')}</span>
                      </button>
                    ))}
                    {buddyGroupsList.filter(g => !selectedBuddyGroups.includes(g.id) && (!buddyTagSearch || g.name.toLowerCase().includes(buddyTagSearch.toLowerCase()))).length === 0 && (
                      <p className="text-[10px] text-center py-2" style={{ color:t.textMuted }}>No matching buddy groups</p>
                    )}
                  </div>
                )}
              </div>
            )}

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
                    <div className="absolute top-2 right-2"><button onClick={clearMedia} className="px-3 py-1 rounded-lg text-[11px] font-bold text-white" style={{ background:'rgba(0,0,0,0.7)' }}>✕ Remove</button></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => cameraRef.current?.click()} className="h-24 rounded-xl flex flex-col items-center justify-center" style={{ border:`2px dashed ${t.accent}55` }}>
                      <span className="text-lg mb-1">📷</span><p className="text-xs font-semibold" style={{ color:t.accent }}>Camera</p>
                    </button>
                    <button onClick={() => (postType==='photo'?photoRef:videoRef).current?.click()} className="h-24 rounded-xl flex flex-col items-center justify-center" style={{ border:`2px dashed ${t.cardBorder}` }}>
                      <span className="text-lg mb-1">📁</span><p className="text-xs font-semibold" style={{ color:'#8b5cf6' }}>Gallery</p>
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
              <button onClick={handlePost} disabled={!postText.trim() && !mediaPreview} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-40" style={{ background:`linear-gradient(135deg,${t.accent},#8b5cf6)` }}>
                Post to {audienceInfo.label} {audienceInfo.icon}
              </button>
              <button onClick={() => { setShowPost(false); clearMedia(); }} className="px-6 py-3 rounded-xl text-sm" style={{ color:t.textMuted, border:`1px solid ${t.cardBorder}` }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
