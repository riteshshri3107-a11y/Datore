"use client";
export const dynamic = "force-dynamic";
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { IcoBack, IcoHeart, IcoChat, IcoSend, IcoUser } from '@/components/Icons';

const REELS = [
  { id:'r1', user:'Anita Sharma', caption:'Quick tip: How I organize my cleaning supplies for efficiency! #cleaning #tips #datore', likes:234, comments:18, shares:12, category:'Cleaning', duration:'0:45' },
  { id:'r2', user:'Mike Chen', caption:'Watch me fix a leaky faucet in under 10 minutes 🔧 #plumbing #diy #howto', likes:891, comments:56, shares:43, category:'Plumbing', duration:'0:58' },
  { id:'r3', user:'Priya K.', caption:'Fun math trick I teach my students! Makes multiplication easy 🧮 #tutoring #education', likes:1203, comments:89, shares:67, category:'Education', duration:'0:32' },
  { id:'r4', user:'David L.', caption:'Spring garden prep - what to plant in March in Toronto 🌱 #gardening #spring #toronto', likes:445, comments:34, shares:21, category:'Gardening', duration:'1:15' },
  { id:'r5', user:'Sarah Chen', caption:'Behind the scenes: A day in the life of a Datore top worker ⭐ #datorelife #worker', likes:2100, comments:156, shares:89, category:'Lifestyle', duration:'2:30' },
];

const CATS = ['For You','Following','Cleaning','Plumbing','Education','Gardening','Lifestyle'];

export default function ReelsPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const [current, setCurrent] = useState(0);
  const [liked, setLiked] = useState<string[]>([]);
  const [cat, setCat] = useState('For You');
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Record<string,string[]>>({});
  const [showCreate, setShowCreate] = useState(false);
  const videoRef = useRef<HTMLInputElement>(null);

  const reel = REELS[current];
  const isLiked = liked.includes(reel.id);

  const next = () => setCurrent(p => (p+1) % REELS.length);
  const prev = () => setCurrent(p => p > 0 ? p-1 : REELS.length-1);
  const toggleLike = () => setLiked(p => p.includes(reel.id) ? p.filter(x=>x!==reel.id) : [...p, reel.id]);
  const addComment = () => { if (commentText.trim()) { setComments(p=>({...p,[reel.id]:[...(p[reel.id]||[]),commentText.trim()]})); setCommentText(''); } };

  const renderHashtags = (text: string) => {
    return text.split(/(#\w+)/g).map((part,i) => part.startsWith('#') ? <span key={i} style={{ color:t.accent, fontWeight:600 }}>{part}</span> : <span key={i}>{part}</span>);
  };

  return (
    <div className="animate-fade-in" style={{ margin:'-1rem -0.75rem' }}>
      {/* Category bar */}
      <div style={{ position:'sticky', top:0, zIndex:10, padding:'8px 12px', display:'flex', gap:6, overflowX:'auto', background:isDark?'rgba(15,15,26,0.9)':'rgba(255,255,255,0.9)', backdropFilter:'blur(16px)' }}>
        <button onClick={()=>router.back()} style={{ background:'none', border:'none', color:t.text, cursor:'pointer', flexShrink:0 }}><IcoBack size={18} /></button>
        {CATS.map(c=>(<button key={c} onClick={()=>setCat(c)} style={{ padding:'4px 12px', borderRadius:20, background:cat===c?t.accent:'transparent', color:cat===c?'white':t.textSecondary, border:'none', fontSize:11, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap' }}>{c}</button>))}
      </div>

      {/* Full-screen reel */}
      <div onClick={next} style={{ height:'calc(100vh - 120px)', position:'relative', display:'flex', alignItems:'center', justifyContent:'center', background:`linear-gradient(135deg,${t.accent}22,#8b5cf622,#22c55e22)`, cursor:'pointer' }}>
        <div style={{ textAlign:'center', padding:20 }}>
          <div style={{ width:80, height:80, borderRadius:'50%', background:`linear-gradient(135deg,${t.accent},#8b5cf6)`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', fontSize:28, color:'white', fontWeight:700 }}>{reel.user.split(' ').map(n=>n[0]).join('')}</div>
          <p style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>{reel.user}</p>
          <p style={{ fontSize:11, color:t.textMuted }}>{reel.category} · {reel.duration}</p>
          <div style={{ width:120, height:3, borderRadius:2, background:t.cardBorder, margin:'16px auto' }}>
            <div style={{ width:'60%', height:'100%', borderRadius:2, background:t.accent }} />
          </div>
          <p style={{ fontSize:12, color:t.textMuted }}>Tap to see next · Swipe up for comments</p>
        </div>

        {/* Right side actions */}
        <div style={{ position:'absolute', right:12, bottom:'30%', display:'flex', flexDirection:'column', gap:20, alignItems:'center' }}>
          <button onClick={e=>{e.stopPropagation();toggleLike();}} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, background:'none', border:'none', cursor:'pointer' }}>
            <IcoHeart size={28} color={isLiked?'#ef4444':t.text} fill={isLiked?'#ef4444':'none'} />
            <span style={{ fontSize:10, color:t.text, fontWeight:600 }}>{reel.likes+(isLiked?1:0)}</span>
          </button>
          <button onClick={e=>{e.stopPropagation();setShowComments(!showComments);}} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, background:'none', border:'none', cursor:'pointer' }}>
            <IcoChat size={26} color={t.text} />
            <span style={{ fontSize:10, color:t.text }}>{reel.comments}</span>
          </button>
          <button onClick={e=>e.stopPropagation()} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, background:'none', border:'none', cursor:'pointer' }}>
            <IcoSend size={24} color={t.text} />
            <span style={{ fontSize:10, color:t.text }}>{reel.shares}</span>
          </button>
        </div>

        {/* Bottom caption */}
        <div style={{ position:'absolute', bottom:16, left:16, right:60, padding:12, borderRadius:16, background:'rgba(0,0,0,0.3)', backdropFilter:'blur(10px)' }}>
          <p style={{ fontSize:13, fontWeight:600, color:'white', marginBottom:4 }}>{reel.user}</p>
          <p style={{ fontSize:11, color:'rgba(255,255,255,0.9)', lineHeight:1.4 }}>{renderHashtags(reel.caption)}</p>
        </div>

        {/* Reel indicator */}
        <div style={{ position:'absolute', top:'50%', right:8, display:'flex', flexDirection:'column', gap:4 }}>
          {REELS.map((_,i)=>(<div key={i} style={{ width:3, height:i===current?16:8, borderRadius:2, background:i===current?t.accent:'rgba(255,255,255,0.3)' }} />))}
        </div>
      </div>

      {/* Comments panel */}
      {showComments && (
        <div style={{ position:'fixed', bottom:0, left:0, right:0, maxHeight:'50vh', background:isDark?'#1a1a2e':'#fff', borderTopLeftRadius:20, borderTopRightRadius:20, zIndex:100, padding:16, overflowY:'auto', border:`1px solid ${t.cardBorder}` }}>
          <div style={{ width:40, height:4, borderRadius:2, background:t.cardBorder, margin:'0 auto 12px' }} />
          <h3 style={{ fontWeight:700, fontSize:14, marginBottom:12 }}>Comments ({reel.comments + (comments[reel.id]?.length||0)})</h3>
          {(comments[reel.id]||[]).map((c,i)=>(<div key={i} style={{ padding:'8px 0', borderTop:`1px solid ${t.cardBorder}`, fontSize:12 }}><span style={{ fontWeight:600 }}>You: </span>{c}</div>))}
          <div style={{ display:'flex', gap:8, marginTop:8 }}>
            <input value={commentText} onChange={e=>setCommentText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addComment()} placeholder="Add a comment..." style={{ flex:1, padding:'10px 14px', borderRadius:20, border:`1px solid ${t.cardBorder}`, background:'transparent', color:t.text, fontSize:12, outline:'none' }} />
            <button onClick={addComment} style={{ width:40, height:40, borderRadius:14, background:`linear-gradient(135deg,${t.accent},#8b5cf6)`, color:'white', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><IcoSend size={16} color="white" /></button>
          </div>
        </div>
      )}

      {/* Create reel button */}
      <button onClick={()=>setShowCreate(true)} style={{ position:'fixed', bottom:80, right:16, width:56, height:56, borderRadius:18, background:`linear-gradient(135deg,${t.accent},#8b5cf6)`, color:'white', border:'none', cursor:'pointer', fontSize:24, fontWeight:700, boxShadow:'0 4px 20px rgba(99,102,241,0.4)', zIndex:50 }}>+</button>

      {showCreate && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }} onClick={()=>setShowCreate(false)}>
          <div onClick={e=>e.stopPropagation()} style={{ width:'100%', maxWidth:400, borderRadius:20, padding:20, background:isDark?'#1a1a2e':'#fff', border:`1px solid ${t.cardBorder}` }} className="space-y-4">
            <h3 className="font-bold text-lg">Create Reel</h3>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={()=>videoRef.current?.click()} className="h-28 rounded-xl flex flex-col items-center justify-center" style={{ background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.02)', border:`2px dashed ${t.accent}55` }}><span className="text-2xl mb-1">📹</span><span className="text-xs font-semibold" style={{ color:t.accent }}>Record Video</span></button>
              <button className="h-28 rounded-xl flex flex-col items-center justify-center" style={{ background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.02)', border:`2px dashed ${t.cardBorder}` }}><span className="text-2xl mb-1">📁</span><span className="text-xs font-semibold" style={{ color:'#8b5cf6' }}>Upload</span></button>
            </div>
            <input ref={videoRef} type="file" accept="video/*" capture="environment" className="hidden" />
            <textarea rows={3} placeholder="Write a caption... #hashtags" className="w-full p-3 rounded-xl text-sm outline-none resize-none" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, color:t.text }} />
            <div className="flex gap-2"><span className="text-[10px] px-2 py-1 rounded-full" style={{ background:t.accentLight, color:t.accent }}>15s</span><span className="text-[10px] px-2 py-1 rounded-full" style={{ background:t.surface }}>30s</span><span className="text-[10px] px-2 py-1 rounded-full" style={{ background:t.surface }}>60s</span><span className="text-[10px] px-2 py-1 rounded-full" style={{ background:t.surface }}>3min</span></div>
            <button className="w-full py-3 rounded-xl text-sm font-semibold text-white" style={{ background:`linear-gradient(135deg,${t.accent},#8b5cf6)` }}>Post Reel</button>
          </div>
        </div>
      )}
    </div>
  );
}