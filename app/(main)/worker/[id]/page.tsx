"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { formatCurrency } from '@/lib/utils';
import { DEMO_WORKERS, DEMO_REVIEWS, getFavorites, toggleFavorite, getProfilePrefs } from '@/lib/demoData';
import { IcoBack, IcoHeart, IcoSend } from '@/components/Icons';

function getWallPosts(wId:string) { try { return JSON.parse(localStorage.getItem(`datore-wall-${wId}`)||'[]'); } catch { return []; } }
function saveWallPosts(wId:string, p:any[]) { try { localStorage.setItem(`datore-wall-${wId}`, JSON.stringify(p)); } catch {} }

export default function WorkerDetailPage() {
  const router = useRouter(); const params = useParams();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const [tab, setTab] = useState<'about'|'reviews'|'wall'|'gallery'>('about');
  const [isFav, setIsFav] = useState(false);
  const [showHire, setShowHire] = useState(false);
  const w = DEMO_WORKERS.find(x=>x.id===params.id) || DEMO_WORKERS[0];
  const reviews = DEMO_REVIEWS[w.id] || [{ id:'gen', reviewer:'Community', rating:5, comment:'Great service!', date:'Recently' }];
  const prefs = getProfilePrefs();

  // BR-90: Wall posts
  const [wallPosts, setWallPosts] = useState<any[]>([]);
  const [wallText, setWallText] = useState('');
  const [wallLiked, setWallLiked] = useState<string[]>([]);
  const [wallComments, setWallComments] = useState<Record<string,string>>({});
  const [openWallComment, setOpenWallComment] = useState<string|null>(null);
  const [wallCommentData, setWallCommentData] = useState<Record<string,any[]>>({});
  const wallPhotoRef = useRef<HTMLInputElement>(null);
  const [wallMedia, setWallMedia] = useState<string|null>(null);

  useEffect(() => { setIsFav(getFavorites().includes(w.id)); setWallPosts(getWallPosts(w.id)); }, [w.id]);
  const handleFav = () => { const now = toggleFavorite(w.id); setIsFav(now); };
  const tc = (s:number) => s>=80?'#22c55e':s>=60?'#eab308':'#ef4444';

  const postToWall = () => {
    if (!wallText.trim() && !wallMedia) return;
    const post = { id: Date.now().toString(), user: prefs.name||'You', text: wallText.trim(), time: 'Just now', likes: 0, comments: 0, media: wallMedia||undefined };
    const updated = [post, ...wallPosts];
    setWallPosts(updated); saveWallPosts(w.id, updated);
    setWallText(''); setWallMedia(null);
  };

  const deleteWallPost = (postId:string) => {
    const updated = wallPosts.filter(p=>p.id!==postId);
    setWallPosts(updated); saveWallPosts(w.id, updated);
  };

  const toggleWallLike = (id:string) => setWallLiked(prev => prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);

  const submitWallComment = (postId:string) => {
    const text = (wallComments[postId]||'').trim();
    if (!text) return;
    const newC = { id: Date.now().toString(), user: prefs.name||'You', text, time: 'Just now' };
    setWallCommentData(prev => ({...prev, [postId]: [...(prev[postId]||[]), newC]}));
    setWallComments(prev => ({...prev, [postId]: ''}));
  };

  const handleWallPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setWallMedia(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><button onClick={()=>router.back()} style={{ background:'none', border:'none', color:t.text, cursor:'pointer' }}><IcoBack size={20} /></button><h1 className="text-xl font-bold">Worker Profile</h1></div>
        <button onClick={handleFav} className="text-2xl">{isFav?'⭐':'☆'}</button>
      </div>
      <div className="glass-card rounded-2xl p-5 text-center" style={{ background:t.card, borderColor:t.cardBorder, boxShadow:t.glassShadow }}>
        <div className="relative inline-block"><div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mx-auto" style={{ background:`linear-gradient(135deg,${t.accent}44,#8b5cf644)`, color:t.accent }}>{w.full_name.split(' ').map((n:string)=>n[0]).join('')}</div><div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2" style={{ background:w.availability==='available'?'#22c55e':w.availability==='busy'?'#ef4444':'#f59e0b', borderColor:isDark?'#1a1a2e':'#fff' }}></div></div>
        <h2 className="text-xl font-bold mt-3">{w.full_name}</h2>
        <div className="flex items-center justify-center gap-2 mt-1 flex-wrap">
          {w.is_police_verified && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background:'rgba(34,197,94,0.15)', color:'#22c55e' }}>🛡️ Police Verified</span>}
          {w.background_check==='clear' && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background:'rgba(59,130,246,0.15)', color:'#3b82f6' }}>✅ Background Clear</span>}
        </div>
        <div className="flex justify-center gap-8 mt-4">
          <div><p className="font-bold text-lg">{w.rating}</p><p className="text-xs" style={{ color:'#f59e0b' }}>★ Rating</p></div>
          <div><p className="font-bold text-lg">{w.completed_jobs}</p><p className="text-xs" style={{ color:t.textMuted }}>Jobs</p></div>
          <div><p className="font-bold text-lg" style={{ color:tc(w.trust_score) }}>{w.trust_score}</p><p className="text-xs" style={{ color:t.textMuted }}>Trust</p></div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="glass-card rounded-xl p-3" style={{ background:t.card, borderColor:t.cardBorder }}><p className="text-[10px]" style={{ color:t.textMuted }}>💰 Hourly</p><p className="font-bold" style={{ color:t.accent }}>{formatCurrency(w.hourly_rate)}/hr</p></div>
        <div className="glass-card rounded-xl p-3" style={{ background:t.card, borderColor:t.cardBorder }}><p className="text-[10px]" style={{ color:t.textMuted }}>Fixed</p><p className="font-bold" style={{ color:t.accent }}>{formatCurrency(w.fixed_rate||0)}</p></div>
        <div className="glass-card rounded-xl p-3" style={{ background:t.card, borderColor:t.cardBorder }}><p className="text-[10px]" style={{ color:t.textMuted }}>📍</p><p className="font-semibold text-sm">{w.city}</p></div>
      </div>

      {/* Tabs - BR-90: Added Wall tab */}
      <div className="flex gap-2">{(['about','reviews','wall','gallery'] as const).map(tb=>(<button key={tb} onClick={()=>setTab(tb)} className="flex-1 py-2 rounded-xl text-xs font-medium capitalize" style={{ background:tab===tb?t.accentLight:t.surface, color:tab===tb?t.accent:t.textSecondary }}>{tb==='reviews'?`Reviews (${w.review_count})`:tb==='wall'?`Wall (${wallPosts.length})`:tb}</button>))}</div>

      {tab==='about' && (
        <div className="space-y-3">
          <div className="glass-card rounded-2xl p-4" style={{ background:t.card, borderColor:t.cardBorder }}><h3 className="font-semibold text-sm mb-2">About</h3><p className="text-sm" style={{ color:t.textSecondary }}>{w.bio}</p><p className="text-xs mt-2" style={{ color:t.textMuted }}>Member since {w.joined} · {w.experience_years}+ yrs</p></div>
          <div className="glass-card rounded-2xl p-4" style={{ background:t.card, borderColor:t.cardBorder }}><h3 className="font-semibold text-sm mb-2">Skills</h3><div className="flex flex-wrap gap-1.5">{w.skills.map((s:string)=><span key={s} className="text-xs px-3 py-1 rounded-full" style={{ background:t.accentLight, color:t.accent }}>{s}</span>)}</div></div>
          {w.certifications.length>0 && <div className="glass-card rounded-2xl p-4" style={{ background:t.card, borderColor:t.cardBorder }}><h3 className="font-semibold text-sm mb-2">Certifications</h3>{w.certifications.map((c:string)=><div key={c} className="text-xs py-1" style={{ color:t.textSecondary }}>✅ {c}</div>)}</div>}
          <div className="glass-card rounded-2xl p-4" style={{ background:t.card, borderColor:t.cardBorder }}>
            <h3 className="font-semibold text-sm mb-2">Contact <span className="text-[10px] font-normal" style={{ color:t.textMuted }}>(Masked for privacy)</span></h3>
            <div className="space-y-1.5 text-sm" style={{ color:'#9ca3af' }}><p>Email: {w.email}</p><p>Phone: {w.phone}</p><p>Address: {w.address}</p></div>
            <p className="text-[10px] mt-2 px-3 py-1.5 rounded-lg inline-block" style={{ background:'rgba(234,179,8,0.1)', color:'#eab308' }}>Full details shared after hiring</p>
          </div>
        </div>
      )}
      {tab==='reviews' && <div className="space-y-2.5">{reviews.map((r:any)=>(<div key={r.id} className="glass-card rounded-xl p-3" style={{ background:t.card, borderColor:t.cardBorder }}><div className="flex items-center justify-between mb-1"><span className="font-medium text-sm">{r.reviewer}</span><span className="text-xs" style={{ color:t.textMuted }}>{r.date}</span></div><div className="text-xs mb-1" style={{ color:'#f59e0b' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</div><p className="text-xs" style={{ color:t.textSecondary }}>{r.comment}</p></div>))}</div>}

      {/* BR-90: Wall Posts Tab */}
      {tab==='wall' && (
        <div className="space-y-3">
          {/* Write on Wall */}
          <div className="glass-card rounded-2xl p-4 space-y-3" style={{ background:t.card, borderColor:t.cardBorder }}>
            <h3 className="font-semibold text-sm">✍️ Write on {w.full_name.split(' ')[0]}'s Wall</h3>
            <input ref={wallPhotoRef} type="file" accept="image/*" className="hidden" onChange={handleWallPhoto} />
            {wallMedia && (
              <div className="relative"><img src={wallMedia} alt="Preview" style={{ width:'100%', maxHeight:150, objectFit:'cover', borderRadius:12 }} /><button onClick={()=>setWallMedia(null)} style={{ position:'absolute', top:4, right:4, width:22, height:22, borderRadius:'50%', background:'#ef4444', color:'white', border:'none', fontSize:11, cursor:'pointer', fontWeight:700 }}>✕</button></div>
            )}
            <textarea value={wallText} onChange={e=>setWallText(e.target.value)} rows={2} placeholder={`Say something nice to ${w.full_name.split(' ')[0]}...`} className="w-full p-3 rounded-xl text-sm outline-none resize-none" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, color:t.text }} />
            <div className="flex gap-2">
              <button onClick={()=>wallPhotoRef.current?.click()} className="px-3 py-2 rounded-xl text-xs font-medium" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', color:t.textSecondary, border:`1px solid ${t.cardBorder}` }}>📷 Photo</button>
              <div className="flex-1" />
              <button onClick={postToWall} disabled={!wallText.trim()&&!wallMedia} className="px-5 py-2 rounded-xl text-xs font-semibold text-white disabled:opacity-40" style={{ background:`linear-gradient(135deg,${t.accent},#8b5cf6)` }}>Post</button>
            </div>
          </div>

          {/* Wall Posts List */}
          {wallPosts.length === 0 ? (
            <div className="glass-card rounded-2xl p-6 text-center" style={{ background:t.card, borderColor:t.cardBorder }}>
              <p className="text-2xl mb-2">📝</p>
              <p className="text-sm" style={{ color:t.textSecondary }}>No wall posts yet. Be the first!</p>
            </div>
          ) : wallPosts.map(post => {
            const cmnts = wallCommentData[post.id] || [];
            return (
              <div key={post.id} className="glass-card rounded-2xl p-4" style={{ background:t.card, borderColor:t.cardBorder }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background:`${t.accent}22`, color:t.accent }}>{(post.user||'U')[0]}</div>
                  <div className="flex-1"><p className="text-sm font-semibold">{post.user}</p><p className="text-[10px]" style={{ color:t.textMuted }}>{post.time}</p></div>
                  {post.user === (prefs.name||'You') && <button onClick={()=>deleteWallPost(post.id)} className="text-xs" style={{ color:'#ef4444' }}>Delete</button>}
                </div>
                <p className="text-sm" style={{ color:t.textSecondary }}>{post.text}</p>
                {post.media && <img src={post.media} alt="Wall" className="mt-2 rounded-xl" style={{ width:'100%', maxHeight:200, objectFit:'cover' }} />}
                <div className="flex gap-4 mt-3 pt-2" style={{ borderTop:`1px solid ${t.cardBorder}` }}>
                  <button onClick={()=>toggleWallLike(post.id)} className="flex items-center gap-1 text-xs" style={{ color:wallLiked.includes(post.id)?'#ef4444':t.textMuted }}>
                    <IcoHeart size={13} color={wallLiked.includes(post.id)?'#ef4444':t.textMuted} fill={wallLiked.includes(post.id)?'#ef4444':'none'} /> {wallLiked.includes(post.id)?'Liked':'Like'}
                  </button>
                  <button onClick={()=>setOpenWallComment(openWallComment===post.id?null:post.id)} className="text-xs" style={{ color:openWallComment===post.id?t.accent:t.textMuted }}>💬 Comment ({cmnts.length})</button>
                </div>
                {openWallComment===post.id && (
                  <div className="mt-2 space-y-2">
                    {cmnts.map((c:any)=>(
                      <div key={c.id} className="flex gap-2 p-2 rounded-lg" style={{ background:isDark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.02)' }}>
                        <span className="text-xs font-semibold">{c.user}:</span>
                        <span className="text-xs" style={{ color:t.textSecondary }}>{c.text}</span>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <input value={wallComments[post.id]||''} onChange={e=>setWallComments(prev=>({...prev,[post.id]:e.target.value}))} onKeyDown={e=>e.key==='Enter'&&submitWallComment(post.id)} placeholder="Write a comment..." className="flex-1 p-2 rounded-xl text-xs outline-none" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, color:t.text }} />
                      <button onClick={()=>submitWallComment(post.id)} className="px-3 rounded-xl" style={{ background:`${t.accent}22` }}><IcoSend size={14} color={t.accent} /></button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab==='gallery' && <div className="glass-card rounded-2xl p-5 text-center" style={{ background:t.card, borderColor:t.cardBorder }}><p className="text-2xl mb-2">📷</p><p className="text-sm" style={{ color:t.textSecondary }}>No photos yet</p></div>}

      <div className="flex gap-2 sticky bottom-20 md:bottom-4 z-10">
        <button onClick={()=>router.push(`/chat/${w.id}`)} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white" style={{ background:`linear-gradient(135deg,${t.accent},#8b5cf6)` }}>💬 Chat</button>
        <button onClick={()=>setShowHire(true)} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white" style={{ background:'linear-gradient(135deg,#22c55e,#16a34a)' }}>✅ Hire Now</button>
        <button onClick={handleFav} className="py-3 px-4 rounded-xl text-sm" style={{ background:isFav?'rgba(234,179,8,0.15)':t.surface, color:isFav?'#eab308':t.textSecondary, border:`1px solid ${t.cardBorder}` }}>{isFav?'⭐':'☆'}</button>
      </div>
      {showHire && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }} onClick={()=>setShowHire(false)}>
          <div onClick={e=>e.stopPropagation()} className="w-full max-w-sm rounded-2xl p-5 space-y-4" style={{ background:isDark?'#1a1a2e':'#fff', border:`1px solid ${t.cardBorder}` }}>
            <h3 className="font-bold text-lg">Hire {w.full_name}</h3>
            <button onClick={()=>{setShowHire(false);router.push(`/chat/${w.id}`);}} className="w-full py-3 rounded-xl text-sm font-semibold" style={{ background:t.accentLight, color:t.accent }}>Hourly - {formatCurrency(w.hourly_rate)}/hr</button>
            <button onClick={()=>{setShowHire(false);router.push(`/chat/${w.id}`);}} className="w-full py-3 rounded-xl text-sm font-semibold" style={{ background:'rgba(34,197,94,0.1)', color:'#22c55e' }}>Fixed - {formatCurrency(w.fixed_rate||0)}</button>
            <button onClick={()=>setShowHire(false)} className="w-full py-2 rounded-xl text-xs" style={{ color:t.textMuted }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
