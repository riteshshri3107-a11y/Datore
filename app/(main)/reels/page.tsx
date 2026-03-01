"use client";
export const dynamic = "force-dynamic";
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { IcoBack, IcoHeart, IcoChat, IcoSend, IcoUser, IcoBookmark, IcoFlag, IcoBlock, IcoMusic, IcoSearch, IcoMic, IcoClose } from '@/components/Icons';

interface Reel {
  id:string; user:string; verified?:boolean; caption:string; likes:number; comments:number; shares:number; saves:number;
  cat:string; duration:string; music?:string; hashtags:string[]; isFollowing?:boolean;
}

const REELS:Reel[] = [
  { id:'r1', user:'Anita Sharma', verified:true, caption:'Quick tip: How I organize my cleaning supplies for efficiency!', likes:2340, comments:182, shares:120, saves:89, cat:'Cleaning', duration:'0:45', music:'Chill Vibes — LoFi Beats', hashtags:['cleaning','tips','datore','organization'] },
  { id:'r2', user:'Mike Chen', caption:'Watch me fix a leaky faucet in under 10 minutes 🔧', likes:8910, comments:560, shares:430, saves:312, cat:'Plumbing', duration:'0:58', music:'Do It Yourself — Maker Music', hashtags:['plumbing','diy','howto','fixitup'], verified:true },
  { id:'r3', user:'Priya K.', caption:'Fun math trick I teach my students! Makes multiplication easy 🧮', likes:12030, comments:890, shares:670, saves:445, cat:'Education', duration:'0:32', music:'Study Session — BrainWave', hashtags:['tutoring','education','mathisfun','students'] },
  { id:'r4', user:'David L.', caption:'Spring garden prep - what to plant in March in Toronto 🌱', likes:4450, comments:340, shares:210, saves:178, cat:'Gardening', duration:'1:15', music:'Nature Sounds — Ambient', hashtags:['gardening','spring','toronto','plants'] },
  { id:'r5', user:'Sarah Chen', verified:true, caption:'Behind the scenes: A day in the life of a Datore top worker ⭐', likes:21000, comments:1560, shares:890, saves:623, cat:'Lifestyle', duration:'2:30', music:'Hustle Mode — Trap Beats', hashtags:['datorelife','worker','topworker','bts'] },
  { id:'r6', user:'Tom Rodriguez', caption:'Best tacos in the neighborhood! My secret recipe 🌮', likes:6780, comments:445, shares:320, saves:256, cat:'Food', duration:'1:05', music:'Cooking Time — Jazz', hashtags:['cooking','tacos','recipe','foodie'] },
  { id:'r7', user:'Lisa Park', verified:true, caption:'5-minute morning workout you can do anywhere 💪', likes:15400, comments:1120, shares:780, saves:512, cat:'Fitness', duration:'0:48', music:'Pump It Up — Gym Mix', hashtags:['fitness','workout','morning','health'] },
  { id:'r8', user:'James Wilson', caption:'Drone footage of Toronto skyline at sunset 🌅', likes:9200, comments:670, shares:540, saves:389, cat:'Photography', duration:'0:35', music:'Sunset Vibes — Chillstep', hashtags:['drone','toronto','skyline','sunset','photography'] },
];

const CATS = ['For You','Following','Trending','Cleaning','Education','Lifestyle','Food','Fitness','Photography'];
const DURATIONS = ['15s','30s','60s','3min'];
const FILTERS = ['None','Warm','Cool','Vintage','B&W','Bright','Dramatic','Soft Focus'];
const MUSIC_LIB = ['Chill Vibes — LoFi Beats','Do It Yourself — Maker Music','Study Session — BrainWave','Hustle Mode — Trap','Cooking Time — Jazz','Pump It Up — Gym Mix','Sunset Vibes — Chillstep','Happy Days — Pop','Epic Moments — Cinematic'];

function formatNum(n:number):string { return n >= 1000 ? (n/1000).toFixed(1)+'K' : n.toString(); }

export default function ReelsPage() {
  const router = useRouter();
  const {isDark,glassLevel,accentColor} = useThemeStore();
  const t = getTheme(isDark,glassLevel,accentColor);
  const [current,setCurrent] = useState(0);
  const [liked,setLiked] = useState<string[]>([]);
  const [saved,setSaved] = useState<string[]>([]);
  const [following,setFollowing] = useState<string[]>(['r1','r5']);
  const [blocked,setBlocked] = useState<string[]>([]);
  const [cat,setCat] = useState('For You');
  const [showComments,setShowComments] = useState(false);
  const [showShare,setShowShare] = useState(false);
  const [showMore,setShowMore] = useState(false);
  const [showCreate,setShowCreate] = useState(false);
  const [commentText,setCommentText] = useState('');
  const [comments,setComments] = useState<Record<string,{user:string;text:string;likes:number;time:string}[]>>({});
  const [search,setSearch] = useState('');
  const [voiceSrch,setVoiceSrch] = useState(false);
  // Create reel state
  const [createStep,setCreateStep] = useState<'upload'|'edit'|'details'>('upload');
  const [reelCaption,setReelCaption] = useState('');
  const [reelDuration,setReelDuration] = useState('30s');
  const [reelFilter,setReelFilter] = useState('None');
  const [reelMusic,setReelMusic] = useState('');
  const [reelAudience,setReelAudience] = useState<'public'|'friends'|'followers'>('public');
  const [reelTags,setReelTags] = useState('');
  const [myReels,setMyReels] = useState<{caption:string;time:string}[]>([]);
  const videoRef = useRef<HTMLInputElement>(null);

  const visibleReels = REELS.filter(r => !blocked.includes(r.user));
  const reel = visibleReels[current % visibleReels.length];
  const isLiked = liked.includes(reel?.id);
  const isSaved = saved.includes(reel?.id);
  const isFollowing = following.includes(reel?.id);

  const next = () => setCurrent(p => (p+1) % visibleReels.length);
  const prev = () => setCurrent(p => p > 0 ? p-1 : visibleReels.length-1);
  const toggleLike = () => setLiked(p => p.includes(reel.id) ? p.filter(x=>x!==reel.id) : [...p, reel.id]);
  const toggleSave = () => setSaved(p => p.includes(reel.id) ? p.filter(x=>x!==reel.id) : [...p, reel.id]);
  const toggleFollow = () => setFollowing(p => p.includes(reel.id) ? p.filter(x=>x!==reel.id) : [...p, reel.id]);

  const addComment = () => {
    if(!commentText.trim()) return;
    setComments(p=>({...p,[reel.id]:[...(p[reel.id]||[]),{user:'You',text:commentText.trim(),likes:0,time:'Just now'}]}));
    setCommentText('');
  };

  const shareToSocial = (platform:string) => {
    const msg = encodeURIComponent(`Check out this Datore Reel by ${reel.user}: "${reel.caption}" — via Datore`);
    const url = encodeURIComponent('https://datore.vercel.app/reels');
    let link = '';
    if(platform==='whatsapp') link=`https://wa.me/?text=${msg}%20${url}`;
    else if(platform==='facebook') link=`https://www.facebook.com/sharer/sharer.php?u=${url}`;
    else if(platform==='instagram') link=`https://www.instagram.com/`;
    else if(platform==='twitter') link=`https://twitter.com/intent/tweet?text=${msg}&url=${url}`;
    else if(platform==='tiktok') link=`https://www.tiktok.com/`;
    else if(platform==='copy') { navigator.clipboard?.writeText(`${reel.user}: ${reel.caption} — https://datore.vercel.app/reels`); setShowShare(false); return; }
    if(link) window.open(link,'_blank'); setShowShare(false);
  };

  const publishReel = () => {
    setMyReels(p=>[{caption:reelCaption||'My new reel',time:'Just now'},...p]);
    setShowCreate(false); setCreateStep('upload'); setReelCaption(''); setReelMusic(''); setReelTags(''); setReelFilter('None');
  };

  const voiceS = () => { setVoiceSrch(true); setTimeout(()=>{setVoiceSrch(false);setSearch('fitness');},2000); };

  if(!reel) return <div className="p-8 text-center text-xs" style={{color:t.textMuted}}>No reels available</div>;

  return (
    <div className="animate-fade-in" style={{margin:'-1rem -0.75rem'}}>
      {/* Top Bar */}
      <div style={{position:'sticky',top:0,zIndex:10,padding:'8px 12px',display:'flex',gap:6,alignItems:'center',background:isDark?'rgba(15,15,26,0.9)':'rgba(255,255,255,0.9)',backdropFilter:'blur(16px)'}}>
        <button onClick={()=>router.back()} style={{background:'none',border:'none',color:t.text,cursor:'pointer',flexShrink:0}}><IcoBack size={18}/></button>
        <div className="flex-1 flex gap-1 overflow-x-auto" style={{scrollbarWidth:'none'}}>
          {CATS.map(c=>(<button key={c} onClick={()=>setCat(c)} style={{padding:'4px 10px',borderRadius:20,background:cat===c?t.accent:'transparent',color:cat===c?'white':t.textSecondary,border:'none',fontSize:10,fontWeight:600,cursor:'pointer',whiteSpace:'nowrap'}}>{c}</button>))}
        </div>
        <button onClick={voiceS} style={{background:voiceSrch?'rgba(239,68,68,0.15)':'none',border:'none',cursor:'pointer',padding:4,borderRadius:8}}><IcoMic size={16} color={voiceSrch?'#ef4444':t.textMuted}/></button>
      </div>
      {voiceSrch&&<p className="text-[10px] text-center animate-pulse" style={{color:'#ef4444'}}>🎙️ Listening...</p>}

      {/* Full-Screen Reel */}
      <div onClick={next} style={{height:'calc(100vh - 130px)',position:'relative',display:'flex',alignItems:'center',justifyContent:'center',background:`linear-gradient(135deg,${t.accent}22,#8b5cf622,#22c55e22)`,cursor:'pointer'}}>
        <div style={{textAlign:'center',padding:20}}>
          <div style={{width:80,height:80,borderRadius:'50%',background:`linear-gradient(135deg,${t.accent},#8b5cf6)`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px',fontSize:28,color:'white',fontWeight:700}}>{reel.user.split(' ').map(n=>n[0]).join('')}</div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <p style={{fontSize:14,fontWeight:600}}>{reel.user}</p>
            {reel.verified&&<span className="text-[10px]" style={{color:'#3b82f6'}}>✓</span>}
          </div>
          <p style={{fontSize:11,color:t.textMuted}}>{reel.cat} · {reel.duration}</p>
          {/* Music tag */}
          {reel.music&&(<div className="flex items-center justify-center gap-1 mt-2"><IcoMusic size={10} color={t.textMuted}/><p className="text-[9px] animate-pulse" style={{color:t.textMuted}}>♪ {reel.music}</p></div>)}
          {/* Progress */}
          <div style={{width:120,height:3,borderRadius:2,background:t.cardBorder,margin:'16px auto'}}><div style={{width:'60%',height:'100%',borderRadius:2,background:t.accent}}/></div>
          <p style={{fontSize:11,color:t.textMuted}}>Tap for next · Swipe up for comments</p>
        </div>

        {/* Right Actions */}
        <div style={{position:'absolute',right:10,bottom:'20%',display:'flex',flexDirection:'column',gap:16,alignItems:'center'}}>
          {/* Follow */}
          <button onClick={e=>{e.stopPropagation();toggleFollow();}} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:2,background:'none',border:'none',cursor:'pointer'}}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{background:isFollowing?'rgba(34,197,94,0.15)':'rgba(99,102,241,0.15)'}}><IcoUser size={16} color={isFollowing?'#22c55e':t.accent}/></div>
            <span style={{fontSize:8,color:t.text,fontWeight:600}}>{isFollowing?'Following':'Follow'}</span>
          </button>
          {/* Like */}
          <button onClick={e=>{e.stopPropagation();toggleLike();}} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:2,background:'none',border:'none',cursor:'pointer'}}>
            <IcoHeart size={26} color={isLiked?'#ef4444':t.text} fill={isLiked?'#ef4444':'none'}/>
            <span style={{fontSize:9,color:t.text,fontWeight:600}}>{formatNum(reel.likes+(isLiked?1:0))}</span>
          </button>
          {/* Comment */}
          <button onClick={e=>{e.stopPropagation();setShowComments(true);}} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:2,background:'none',border:'none',cursor:'pointer'}}>
            <IcoChat size={24} color={t.text}/>
            <span style={{fontSize:9,color:t.text}}>{formatNum(reel.comments)}</span>
          </button>
          {/* Share */}
          <button onClick={e=>{e.stopPropagation();setShowShare(true);}} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:2,background:'none',border:'none',cursor:'pointer'}}>
            <IcoSend size={22} color={t.text}/>
            <span style={{fontSize:9,color:t.text}}>{formatNum(reel.shares)}</span>
          </button>
          {/* Bookmark / Save */}
          <button onClick={e=>{e.stopPropagation();toggleSave();}} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:2,background:'none',border:'none',cursor:'pointer'}}>
            <IcoBookmark size={22} color={isSaved?'#f59e0b':t.text} fill={isSaved?'#f59e0b':'none'}/>
            <span style={{fontSize:9,color:t.text}}>{formatNum(reel.saves)}</span>
          </button>
          {/* More */}
          <button onClick={e=>{e.stopPropagation();setShowMore(true);}} style={{background:'none',border:'none',cursor:'pointer',fontSize:16,color:t.text}}>•••</button>
        </div>

        {/* Bottom Caption + Hashtags */}
        <div style={{position:'absolute',bottom:12,left:12,right:60,padding:12,borderRadius:16,background:'rgba(0,0,0,0.4)',backdropFilter:'blur(10px)'}}>
          <div className="flex items-center gap-2 mb-1">
            <p style={{fontSize:13,fontWeight:600,color:'white'}}>{reel.user}</p>
            {reel.verified&&<span style={{fontSize:9,background:'#3b82f6',color:'white',padding:'1px 5px',borderRadius:8,fontWeight:700}}>✓</span>}
            {!isFollowing&&<button onClick={e=>{e.stopPropagation();toggleFollow();}} style={{fontSize:9,background:'rgba(255,255,255,0.2)',color:'white',padding:'2px 8px',borderRadius:8,border:'none',fontWeight:600,cursor:'pointer'}}>Follow</button>}
          </div>
          <p style={{fontSize:11,color:'rgba(255,255,255,0.9)',lineHeight:1.4}}>{reel.caption}</p>
          <div className="flex flex-wrap gap-1 mt-1">{reel.hashtags.map(h=>(<span key={h} style={{fontSize:9,color:'rgba(99,200,255,0.9)',fontWeight:600}}>#{h}</span>))}</div>
          {reel.music&&(<div className="flex items-center gap-1 mt-1"><IcoMusic size={9} color="rgba(255,255,255,0.6)"/><span style={{fontSize:9,color:'rgba(255,255,255,0.6)'}}>♪ {reel.music}</span></div>)}
        </div>

        {/* Reel dots */}
        <div style={{position:'absolute',top:'50%',right:6,display:'flex',flexDirection:'column',gap:4}}>
          {visibleReels.map((_,i)=>(<div key={i} style={{width:3,height:i===current%visibleReels.length?16:8,borderRadius:2,background:i===current%visibleReels.length?t.accent:'rgba(255,255,255,0.3)'}}/>))}
        </div>
      </div>

      {/* Comments Panel */}
      {showComments&&(
        <div style={{position:'fixed',bottom:0,left:0,right:0,maxHeight:'60vh',background:isDark?'#1a1a2e':'#fff',borderTopLeftRadius:20,borderTopRightRadius:20,zIndex:100,padding:16,overflowY:'auto',border:`1px solid ${t.cardBorder}`}}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2"><div className="w-8 h-1 rounded-full" style={{background:t.cardBorder}}/><h3 style={{fontWeight:700,fontSize:14}}>Comments ({reel.comments+(comments[reel.id]?.length||0)})</h3></div>
            <button onClick={()=>setShowComments(false)}><IcoClose size={18} color={t.textMuted}/></button>
          </div>
          {/* Sample comments */}
          {[{user:'Maria G.',text:'So helpful! Saved this for later 💯',likes:23,time:'2h ago'},{user:'Jake R.',text:'Been looking for exactly this!',likes:8,time:'5h ago'},{user:'Lily Chen',text:'Amazing work as always 🔥',likes:45,time:'1d ago'}].map((c,i)=>(
            <div key={i} className="flex gap-2 py-2" style={{borderBottom:`1px solid ${t.cardBorder}`}}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0" style={{background:`${t.accent}22`,color:t.accent}}>{c.user[0]}</div>
              <div className="flex-1"><div className="flex items-center gap-2"><span className="text-xs font-semibold">{c.user}</span><span className="text-[9px]" style={{color:t.textMuted}}>{c.time}</span></div><p className="text-xs mt-0.5">{c.text}</p>
                <div className="flex items-center gap-3 mt-1"><button className="text-[9px]" style={{color:t.textMuted}}>❤️ {c.likes}</button><button className="text-[9px]" style={{color:t.textMuted}}>Reply</button></div>
              </div>
            </div>
          ))}
          {(comments[reel.id]||[]).map((c,i)=>(
            <div key={`my-${i}`} className="flex gap-2 py-2" style={{borderBottom:`1px solid ${t.cardBorder}`}}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0" style={{background:t.accent,color:'white'}}>Y</div>
              <div className="flex-1"><span className="text-xs font-semibold">{c.user}</span><span className="text-[9px] ml-2" style={{color:t.textMuted}}>{c.time}</span><p className="text-xs mt-0.5">{c.text}</p></div>
            </div>
          ))}
          <div className="flex gap-2 mt-3">
            <input value={commentText} onChange={e=>setCommentText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addComment()} placeholder="Add a comment..." className="flex-1 px-4 py-2 rounded-full text-xs outline-none" style={{background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)',border:`1px solid ${t.cardBorder}`,color:t.text}}/>
            <button onClick={addComment} className="w-9 h-9 rounded-full flex items-center justify-center" style={{background:`linear-gradient(135deg,${t.accent},#8b5cf6)`}}><IcoSend size={14} color="white"/></button>
          </div>
        </div>
      )}

      {/* Share Panel */}
      {showShare&&(
        <div className="fixed inset-0 z-[9999] flex items-end" style={{background:'rgba(0,0,0,0.5)'}} onClick={()=>setShowShare(false)}>
          <div onClick={e=>e.stopPropagation()} className="w-full rounded-t-2xl p-5" style={{background:isDark?'#1a1a2e':'#fff'}}>
            <h3 className="text-sm font-bold mb-3">Share Reel</h3>
            <div className="grid grid-cols-3 gap-2">
              {[{id:'whatsapp',l:'WhatsApp',c:'#25D366',i:'💬'},{id:'instagram',l:'Instagram',c:'#E4405F',i:'📸'},{id:'facebook',l:'Facebook',c:'#1877F2',i:'👤'},{id:'twitter',l:'X / Twitter',c:'#1DA1F2',i:'🐦'},{id:'tiktok',l:'TikTok',c:'#000',i:'🎵'},{id:'copy',l:'Copy Link',c:'#6b7280',i:'🔗'}].map(s=>(
                <button key={s.id} onClick={()=>shareToSocial(s.id)} className="flex flex-col items-center gap-1 p-3 rounded-xl" style={{background:`${s.c}15`}}>
                  <span className="text-lg">{s.i}</span>
                  <span className="text-[9px] font-semibold" style={{color:s.c}}>{s.l}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* More Options */}
      {showMore&&(
        <div className="fixed inset-0 z-[9999] flex items-end" style={{background:'rgba(0,0,0,0.5)'}} onClick={()=>setShowMore(false)}>
          <div onClick={e=>e.stopPropagation()} className="w-full rounded-t-2xl p-4" style={{background:isDark?'#1a1a2e':'#fff'}}>
            <div className="w-10 h-1 rounded-full mx-auto mb-3" style={{background:t.cardBorder}}/>
            {[
              {icon:'🔇',label:'Mute Audio',action:()=>setShowMore(false)},
              {icon:'📋',label:'Copy Link',action:()=>{navigator.clipboard?.writeText(`https://datore.vercel.app/reels/${reel.id}`);setShowMore(false);}},
              {icon:'⬇️',label:'Save Video',action:()=>setShowMore(false)},
              {icon:'🔁',label:'Duet with this Reel',action:()=>{setShowMore(false);setShowCreate(true);}},
              {icon:'👁️',label:'Not Interested',action:()=>{next();setShowMore(false);}},
              {icon:'🚫',label:`Block ${reel.user}`,action:()=>{setBlocked(p=>[...p,reel.user]);next();setShowMore(false);},color:'#ef4444'},
              {icon:'🚩',label:'Report Reel',action:()=>setShowMore(false),color:'#ef4444'},
            ].map((opt,i)=>(
              <button key={i} onClick={opt.action} className="w-full flex items-center gap-3 p-3 rounded-xl text-left" style={{color:opt.color||t.text}}>
                <span className="text-base">{opt.icon}</span>
                <span className="text-xs font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Create Reel FAB */}
      <button onClick={()=>setShowCreate(true)} style={{position:'fixed',bottom:80,right:16,width:56,height:56,borderRadius:18,background:`linear-gradient(135deg,${t.accent},#ef4444)`,color:'white',border:'none',cursor:'pointer',fontSize:24,fontWeight:700,boxShadow:'0 4px 20px rgba(239,68,68,0.4)',zIndex:50}}>+</button>

      {/* Create Reel Modal — Full Featured */}
      {showCreate&&(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{background:'rgba(0,0,0,0.7)'}} onClick={()=>setShowCreate(false)}>
          <div onClick={e=>e.stopPropagation()} className="w-full max-w-md rounded-2xl p-5 space-y-3 max-h-[90vh] overflow-y-auto" style={{background:isDark?'#1a1a2e':'#fff'}}>
            <div className="flex items-center justify-between"><h3 className="font-bold text-base">Create Reel</h3><button onClick={()=>setShowCreate(false)}><IcoClose size={18} color={t.textMuted}/></button></div>

            {/* Step indicator */}
            <div className="flex gap-1">{(['upload','edit','details'] as const).map(s=>(<div key={s} className="flex-1 h-1 rounded-full" style={{background:createStep===s?t.accent:((['upload','edit','details'].indexOf(s)<=(['upload','edit','details'].indexOf(createStep)))?t.accent+'66':t.cardBorder}}/>))}</div>

            {createStep==='upload'&&(
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={()=>videoRef.current?.click()} className="h-32 rounded-xl flex flex-col items-center justify-center" style={{border:`2px dashed ${t.accent}55`}}><span className="text-3xl mb-1">📹</span><span className="text-xs font-semibold" style={{color:t.accent}}>Record</span></button>
                  <button className="h-32 rounded-xl flex flex-col items-center justify-center" style={{border:`2px dashed ${t.cardBorder}`}}><span className="text-3xl mb-1">📁</span><span className="text-xs font-semibold" style={{color:'#8b5cf6'}}>Gallery</span></button>
                </div>
                <input ref={videoRef} type="file" accept="video/*" capture="environment" className="hidden"/>
                {/* Duration */}
                <div><p className="text-[10px] font-bold mb-1" style={{color:t.textMuted}}>DURATION</p><div className="flex gap-2">{DURATIONS.map(d=>(<button key={d} onClick={()=>setReelDuration(d)} className="px-3 py-1.5 rounded-lg text-[10px] font-semibold" style={{background:reelDuration===d?t.accent+'20':t.card,color:reelDuration===d?t.accent:t.textMuted,border:`1px solid ${reelDuration===d?t.accent+'44':t.cardBorder}`}}>{d}</button>))}</div></div>
                <button onClick={()=>setCreateStep('edit')} className="w-full py-2.5 rounded-xl text-xs font-bold text-white" style={{background:t.accent}}>Next: Edit →</button>
              </div>
            )}

            {createStep==='edit'&&(
              <div className="space-y-3">
                {/* Filters */}
                <div><p className="text-[10px] font-bold mb-1" style={{color:t.textMuted}}>FILTERS</p>
                  <div className="flex gap-1.5 overflow-x-auto pb-1" style={{scrollbarWidth:'none'}}>{FILTERS.map(f=>(<button key={f} onClick={()=>setReelFilter(f)} className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center text-lg" style={{background:reelFilter===f?`${t.accent}22`:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)',border:`2px solid ${reelFilter===f?t.accent:'transparent'}`}}>🎬</div>
                    <span className="text-[8px]" style={{color:reelFilter===f?t.accent:t.textMuted}}>{f}</span>
                  </button>))}</div>
                </div>
                {/* Music */}
                <div><p className="text-[10px] font-bold mb-1" style={{color:t.textMuted}}>ADD MUSIC</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">{MUSIC_LIB.map(m=>(<button key={m} onClick={()=>setReelMusic(m===reelMusic?'':m)} className="w-full flex items-center gap-2 p-2 rounded-lg text-left" style={{background:reelMusic===m?t.accent+'15':'transparent'}}>
                    <IcoMusic size={12} color={reelMusic===m?t.accent:t.textMuted}/><span className="text-[10px]" style={{color:reelMusic===m?t.accent:t.text}}>{m}</span>
                  </button>))}</div>
                </div>
                <div className="flex gap-2"><button onClick={()=>setCreateStep('upload')} className="flex-1 py-2 rounded-xl text-xs" style={{border:`1px solid ${t.cardBorder}`}}>← Back</button><button onClick={()=>setCreateStep('details')} className="flex-1 py-2 rounded-xl text-xs font-bold text-white" style={{background:t.accent}}>Next: Details →</button></div>
              </div>
            )}

            {createStep==='details'&&(
              <div className="space-y-3">
                <textarea value={reelCaption} onChange={e=>setReelCaption(e.target.value)} rows={3} placeholder="Write a caption... Use #hashtags" className="w-full p-3 rounded-xl text-sm outline-none resize-none" style={{background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)',border:`1px solid ${t.cardBorder}`,color:t.text}}/>
                <input value={reelTags} onChange={e=>setReelTags(e.target.value)} placeholder="Add tags: fitness, cooking, diy..." className="w-full p-2.5 rounded-xl text-xs outline-none" style={{background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)',border:`1px solid ${t.cardBorder}`,color:t.text}}/>
                {/* Audience */}
                <div><p className="text-[10px] font-bold mb-1" style={{color:t.textMuted}}>WHO CAN SEE</p>
                  <div className="flex gap-2">{([{k:'public',l:'🌐 Public'},{k:'friends',l:'💛 Friends'},{k:'followers',l:'👥 Followers'}] as const).map(a=>(<button key={a.k} onClick={()=>setReelAudience(a.k as any)} className="flex-1 py-2 rounded-xl text-[10px] font-semibold" style={{background:reelAudience===a.k?t.accent+'20':t.card,color:reelAudience===a.k?t.accent:t.textMuted,border:`1px solid ${reelAudience===a.k?t.accent+'44':t.cardBorder}`}}>{a.l}</button>))}</div>
                </div>
                {/* Summary */}
                <div className="p-3 rounded-xl" style={{background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.02)'}}>
                  <p className="text-[9px] font-bold mb-1" style={{color:t.textMuted}}>REEL SUMMARY</p>
                  <p className="text-[10px]">Duration: {reelDuration} · Filter: {reelFilter} {reelMusic?`· ♪ ${reelMusic}`:''}</p>
                </div>
                <div className="flex gap-2"><button onClick={()=>setCreateStep('edit')} className="flex-1 py-2 rounded-xl text-xs" style={{border:`1px solid ${t.cardBorder}`}}>← Back</button><button onClick={publishReel} className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white" style={{background:`linear-gradient(135deg,${t.accent},#ef4444)`}}>🚀 Publish Reel</button></div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
