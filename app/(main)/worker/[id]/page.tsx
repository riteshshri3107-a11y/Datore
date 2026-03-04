"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { useAuthStore } from '@/store/useAuthStore';
import { getTheme } from '@/lib/theme';
import { formatCurrency } from '@/lib/utils';
import { getProfile, getWorker, getReviews, getProfileStats, toggleSave, getPosts, createPost, toggleLike, createComment, getComments } from '@/lib/supabase';
import { IcoBack, IcoHeart, IcoSend } from '@/components/Icons';

export default function WorkerDetailPage() {
  const router = useRouter(); const params = useParams();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const { user, profile: myProfile } = useAuthStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const [tab, setTab] = useState<'about'|'reviews'|'wall'|'gallery'>('about');
  const [isFav, setIsFav] = useState(false);
  const [showHire, setShowHire] = useState(false);
  const [loading, setLoading] = useState(true);
  const [w, setW] = useState<any>(null);
  const [workerData, setWorkerData] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  // BR-90: Wall posts
  const [wallPosts, setWallPosts] = useState<any[]>([]);
  const [wallText, setWallText] = useState('');
  const [wallLiked, setWallLiked] = useState<string[]>([]);
  const [wallComments, setWallComments] = useState<Record<string,string>>({});
  const [openWallComment, setOpenWallComment] = useState<string|null>(null);
  const [wallCommentData, setWallCommentData] = useState<Record<string,any[]>>({});
  const wallPhotoRef = useRef<HTMLInputElement>(null);
  const [wallMedia, setWallMedia] = useState<string|null>(null);

  useEffect(() => {
    const workerId = params.id as string;
    if (!workerId) return;
    async function load() {
      setLoading(true);
      try {
        const [profileData, worker, reviewData, statsData, posts] = await Promise.all([
          getProfile(workerId),
          getWorker(workerId),
          getReviews(workerId),
          getProfileStats(workerId),
          getPosts('public', 50),
        ]);
        // Merge profile + worker data
        const merged = {
          id: workerId,
          full_name: profileData?.name || 'Worker',
          name: profileData?.name || 'Worker',
          bio: profileData?.bio || worker?.bio || 'No bio available.',
          city: profileData?.city || 'Unknown',
          rating: profileData?.rating || 0,
          review_count: profileData?.review_count || 0,
          verified: profileData?.verified || false,
          avatar_url: profileData?.avatar_url || null,
          email: profileData?.email ? profileData.email.replace(/(.{2}).*(@.*)/, '$1***$2') : '***@***.com',
          phone: profileData?.phone ? profileData.phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2') : '***-****-***',
          address: 'Available after hiring',
          // Worker-specific fields
          skills: worker?.skills || [],
          categories: worker?.categories || [],
          hourly_rate: worker?.hourly_rate || 0,
          fixed_rate: worker?.fixed_rate || 0,
          available: worker?.available ?? true,
          licensed: worker?.licensed || false,
          portfolio: worker?.portfolio || [],
          certifications: worker?.certifications || [],
          experience_years: worker?.experience_years || 0,
          is_police_verified: worker?.is_police_verified || false,
          background_check: worker?.background_check || 'pending',
          trust_score: worker?.trust_score || statsData?.trust_score || 0,
          completed_jobs: statsData?.completed_jobs || worker?.completed_jobs || 0,
          joined: profileData?.created_at ? new Date(profileData.created_at).getFullYear().toString() : 'Recently',
          availability: worker?.available ? 'available' : 'offline',
        };
        setW(merged);
        setWorkerData(worker);
        setReviews(reviewData || []);
        setStats(statsData);
        // Filter wall posts for this user
        const userPosts = (posts || []).filter((p: any) => p.user_id === workerId);
        setWallPosts(userPosts);
      } catch (err) {
        console.error('Failed to load worker:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  const handleFav = async () => {
    if (!user?.id || !w?.id) return;
    const saved = await toggleSave(user.id, w.id, 'worker');
    setIsFav(saved);
  };

  const tc = (s:number) => s>=80?'#22c55e':s>=60?'#eab308':'#ef4444';

  const postToWall = async () => {
    if (!wallText.trim() && !wallMedia) return;
    if (!user?.id) return;
    const { data } = await createPost({
      user_id: user.id,
      content: wallText.trim(),
      post_type: 'text',
      visibility: 'public',
      media_urls: wallMedia ? [wallMedia] : undefined,
    });
    if (data) {
      const post = {
        ...data,
        user_name: myProfile?.name || 'You',
        user_avatar: myProfile?.avatar_url || null,
      };
      setWallPosts(prev => [post, ...prev]);
    }
    setWallText(''); setWallMedia(null);
  };

  const deleteWallPost = (postId:string) => {
    setWallPosts(prev => prev.filter(p => p.id !== postId));
  };

  const toggleWallLike = async (id:string) => {
    if (!user?.id) return;
    const liked = await toggleLike(user.id, id, 'post');
    setWallLiked(prev => liked ? [...prev, id] : prev.filter(x => x !== id));
  };

  const submitWallComment = async (postId:string) => {
    const text = (wallComments[postId]||'').trim();
    if (!text || !user?.id) return;
    const { data } = await createComment({
      user_id: user.id,
      target_id: postId,
      target_type: 'post',
      content: text,
    });
    if (data) {
      const newC = { id: data.id, user: myProfile?.name || 'You', text, time: 'Just now' };
      setWallCommentData(prev => ({...prev, [postId]: [...(prev[postId]||[]), newC]}));
    }
    setWallComments(prev => ({...prev, [postId]: ''}));
  };

  const handleWallPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setWallMedia(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <button onClick={()=>router.back()} style={{ background:'none', border:'none', color:t.text, cursor:'pointer' }}><IcoBack size={20} /></button>
          <h1 className="text-xl font-bold">Worker Profile</h1>
        </div>
        <div className="glass-card rounded-2xl p-8 text-center" style={{ background:t.card, borderColor:t.cardBorder }}>
          <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-3" style={{ borderColor: t.accent, borderTopColor: 'transparent' }}></div>
          <p className="text-sm" style={{ color:t.textMuted }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!w) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <button onClick={()=>router.back()} style={{ background:'none', border:'none', color:t.text, cursor:'pointer' }}><IcoBack size={20} /></button>
          <h1 className="text-xl font-bold">Worker Profile</h1>
        </div>
        <div className="glass-card rounded-2xl p-8 text-center" style={{ background:t.card, borderColor:t.cardBorder }}>
          <p className="text-2xl mb-2">😕</p>
          <p className="text-sm" style={{ color:t.textMuted }}>Worker not found</p>
        </div>
      </div>
    );
  }

  const reviewList = reviews.length > 0 ? reviews.map((r: any) => ({
    id: r.id,
    reviewer: r.profiles?.name || r.from_user_name || 'Anonymous',
    rating: r.overall_rating || r.rating || 5,
    comment: r.review_text || r.comment || '',
    date: r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Recently',
  })) : [{ id:'gen', reviewer:'Community', rating:5, comment:'Great service!', date:'Recently' }];

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><button onClick={()=>router.back()} style={{ background:'none', border:'none', color:t.text, cursor:'pointer' }}><IcoBack size={20} /></button><h1 className="text-xl font-bold">Worker Profile</h1></div>
        <button onClick={handleFav} className="text-2xl">{isFav?'⭐':'☆'}</button>
      </div>
      <div className="glass-card rounded-2xl p-5 text-center" style={{ background:t.card, borderColor:t.cardBorder, boxShadow:t.glassShadow }}>
        <div className="relative inline-block">
          {w.avatar_url ? (
            <img src={w.avatar_url} alt={w.full_name} className="w-20 h-20 rounded-full object-cover mx-auto" />
          ) : (
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mx-auto" style={{ background:`linear-gradient(135deg,${t.accent}44,#8b5cf644)`, color:t.accent }}>{w.full_name.split(' ').map((n:string)=>n[0]).join('')}</div>
          )}
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2" style={{ background:w.availability==='available'?'#22c55e':w.availability==='busy'?'#ef4444':'#f59e0b', borderColor:isDark?'#1a1a2e':'#fff' }}></div>
        </div>
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
          <div className="glass-card rounded-2xl p-4" style={{ background:t.card, borderColor:t.cardBorder }}><h3 className="font-semibold text-sm mb-2">Skills</h3><div className="flex flex-wrap gap-1.5">{(w.skills || []).map((s:string)=><span key={s} className="text-xs px-3 py-1 rounded-full" style={{ background:t.accentLight, color:t.accent }}>{s}</span>)}</div></div>
          {(w.certifications || []).length>0 && <div className="glass-card rounded-2xl p-4" style={{ background:t.card, borderColor:t.cardBorder }}><h3 className="font-semibold text-sm mb-2">Certifications</h3>{w.certifications.map((c:string)=><div key={c} className="text-xs py-1" style={{ color:t.textSecondary }}>✅ {c}</div>)}</div>}
          <div className="glass-card rounded-2xl p-4" style={{ background:t.card, borderColor:t.cardBorder }}>
            <h3 className="font-semibold text-sm mb-2">Contact <span className="text-[10px] font-normal" style={{ color:t.textMuted }}>(Masked for privacy)</span></h3>
            <div className="space-y-1.5 text-sm" style={{ color:'#9ca3af' }}><p>Email: {w.email}</p><p>Phone: {w.phone}</p><p>Address: {w.address}</p></div>
            <p className="text-[10px] mt-2 px-3 py-1.5 rounded-lg inline-block" style={{ background:'rgba(234,179,8,0.1)', color:'#eab308' }}>Full details shared after hiring</p>
          </div>
        </div>
      )}
      {tab==='reviews' && <div className="space-y-2.5">{reviewList.map((r:any)=>(<div key={r.id} className="glass-card rounded-xl p-3" style={{ background:t.card, borderColor:t.cardBorder }}><div className="flex items-center justify-between mb-1"><span className="font-medium text-sm">{r.reviewer}</span><span className="text-xs" style={{ color:t.textMuted }}>{r.date}</span></div><div className="text-xs mb-1" style={{ color:'#f59e0b' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</div><p className="text-xs" style={{ color:t.textSecondary }}>{r.comment}</p></div>))}</div>}

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
            const postUser = post.user_name || post.author_name || 'User';
            const postTime = post.created_at ? new Date(post.created_at).toLocaleDateString() : 'Recently';
            return (
              <div key={post.id} className="glass-card rounded-2xl p-4" style={{ background:t.card, borderColor:t.cardBorder }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background:`${t.accent}22`, color:t.accent }}>{(postUser||'U')[0]}</div>
                  <div className="flex-1"><p className="text-sm font-semibold">{postUser}</p><p className="text-[10px]" style={{ color:t.textMuted }}>{postTime}</p></div>
                  {post.user_id === user?.id && <button onClick={()=>deleteWallPost(post.id)} className="text-xs" style={{ color:'#ef4444' }}>Delete</button>}
                </div>
                <p className="text-sm" style={{ color:t.textSecondary }}>{post.content || post.text}</p>
                {(post.media_urls?.[0] || post.media) && <img src={post.media_urls?.[0] || post.media} alt="Wall" className="mt-2 rounded-xl" style={{ width:'100%', maxHeight:200, objectFit:'cover' }} />}
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
