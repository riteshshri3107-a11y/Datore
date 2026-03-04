"use client";
export const dynamic = "force-dynamic";
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { useAuthStore } from '@/store/useAuthStore';
import { getTheme } from '@/lib/theme';
import { IcoBack, IcoStar, IcoUser, IcoHeart, IcoShield, IcoEdit, IcoCamera } from '@/components/Icons';
import { getProfile, getProfileStats, getMyPosts, getMyJobs, getMyListings, getFollowers, updatePost, deletePost as dbDeletePost, uploadAvatar, createReview } from '@/lib/supabase';

type AvatarMode = 'public'|'friends'|'buddy'|'professional';
const AVATAR_MODES:{key:AvatarMode;label:string;icon:string;color:string}[] = [
  {key:'public',label:'Public',icon:'🌐',color:'#22c55e'},
  {key:'friends',label:'Friends',icon:'💛',color:'#f59e0b'},
  {key:'buddy',label:'Buddy+',icon:'👥',color:'#8b5cf6'},
  {key:'professional',label:'Professional',icon:'💼',color:'#3b82f6'},
];

const DEFAULT_AVATARS = ['👨‍💼','👩‍💻','🧑‍🔬','👨‍🎨','👩‍🏫','🧑‍🚀','👨‍🍳','👩‍⚕️','🦸','🧑‍💼','👷','🧑‍🎤'];

export default function ProfilePage() {
  const router = useRouter();
  const {isDark,glassLevel,accentColor} = useThemeStore();
  const t = getTheme(isDark,glassLevel,accentColor);
  const { user, profile: authProfile } = useAuthStore();
  const [tab,setTab] = useState<'overview'|'posts'|'jobs'|'products'|'communities'|'ratings'>('overview');
  const [profileData, setProfileData] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [posts,setPosts] = useState<any[]>([]);
  const [jobs,setJobs] = useState<any[]>([]);
  const [products,setProducts] = useState<any[]>([]);
  const [communities,setCommunities] = useState<any[]>([]);
  const [editingPost,setEditingPost] = useState<string|null>(null);
  const [editText,setEditText] = useState('');
  const [ratingTarget,setRatingTarget] = useState('');
  const [ratingValue,setRatingValue] = useState(5);
  const [ratingMsg,setRatingMsg] = useState<{text:string;ok:boolean}|null>(null);
  const [loading, setLoading] = useState(true);
  // Avatar system
  const [avatars,setAvatars] = useState<Record<AvatarMode,string|null>>({public:null,friends:null,buddy:null,professional:null});
  const [activeAvatarMode,setActiveAvatarMode] = useState<AvatarMode>('public');
  const [showAvatarPicker,setShowAvatarPicker] = useState(false);
  const avatarRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    const load = async () => {
      try {
        const [p, s, myPosts, myJobs, myListings, followers] = await Promise.all([
          getProfile(user.id),
          getProfileStats(user.id),
          getMyPosts(user.id),
          getMyJobs(user.id),
          getMyListings(user.id),
          getFollowers(user.id),
        ]);
        setProfileData(p);
        setStats(s);
        if (myPosts.length > 0) setPosts(myPosts.map((p:any) => ({ id:p.id, text:p.content, time: new Date(p.created_at).toLocaleDateString(), likes:p.likes_count, audience:p.visibility })));
        else setPosts([{id:'mp1',text:'Welcome to Datore! Create your first post.',time:'Just now',likes:0,audience:'public'}]);
        if (myJobs.length > 0) setJobs(myJobs.map((j:any) => ({ id:j.id, title:j.job_description||'Job', status:j.status, applicants:0, posted: new Date(j.created_at).toLocaleDateString(), budget:j.agreed_price?`$${j.agreed_price}`:'TBD' })));
        if (myListings.length > 0) setProducts(myListings.map((l:any) => ({ id:l.id, name:l.title, price:l.price||0, status:l.status, views:l.views_count||0 })));
      } catch(e) { console.error('Profile load error:', e); }
      setLoading(false);
    };
    load();
    try{const s=localStorage.getItem('datore-avatars');if(s)setAvatars(JSON.parse(s));}catch{}
  }, [user?.id]);

  const myRating = stats?.rating || profileData?.rating || 0;
  const myFollowers = stats?.followers_count || 0;
  const userName = profileData?.name || authProfile?.name || 'User';

  const updateAvatarState = (mode:AvatarMode, val:string|null) => {
    const newA = {...avatars,[mode]:val};
    setAvatars(newA);
    try{localStorage.setItem('datore-avatars',JSON.stringify(newA));}catch{}
  };

  const handleAvatarUpload = async (e:React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if(!file || !user?.id) return;
    const reader = new FileReader();
    reader.onload = (ev) => { updateAvatarState(activeAvatarMode, ev.target?.result as string); setShowAvatarPicker(false); };
    reader.readAsDataURL(file);
    await uploadAvatar(user.id, file, activeAvatarMode);
  };
  const setEmojiAvatar = (emoji:string) => { updateAvatarState(activeAvatarMode, emoji); setShowAvatarPicker(false); };
  const currentAvatar = avatars[activeAvatarMode] || profileData?.avatar_url;

  const canRate = myRating >= 4.0 && myFollowers >= 10;

  // BR-103: Rating eligibility check
  const submitRating = async () => {
    if(!canRate) { setRatingMsg({text:`Cannot rate: You need 4.0+ rating (yours: ${myRating}) AND 10+ followers (yours: ${myFollowers}).`,ok:false}); return; }
    if(!ratingTarget.trim()) { setRatingMsg({text:'Please enter a name to rate.',ok:false}); return; }
    setRatingMsg({text:`✅ ${ratingValue}-star rating submitted for ${ratingTarget}!`,ok:true});
    setRatingTarget(''); setRatingValue(5);
    setTimeout(()=>setRatingMsg(null),3000);
  };

  const handleDeletePost = async (postId: string) => {
    await dbDeletePost(postId);
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const handleSaveEdit = async (postId: string) => {
    await updatePost(postId, editText);
    setPosts(prev => prev.map(p => p.id === postId ? {...p, text: editText} : p));
    setEditingPost(null); setEditText('');
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 rounded-full" style={{borderColor:`${t.accent} transparent`}}/></div>;

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="flex items-center gap-3"><button onClick={()=>router.back()} style={{background:'none',border:'none',color:t.text,cursor:'pointer'}}><IcoBack size={20}/></button><h1 className="text-xl font-bold flex-1">My Profile</h1></div>

      {/* Profile Card with Avatar */}
      <div className="p-4 rounded-xl" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
        <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload}/>
        <div className="flex items-center gap-3 mb-3">
          {/* Avatar with edit overlay */}
          <div className="relative">
            {currentAvatar && currentAvatar.startsWith('data:image') ? (
              <img src={currentAvatar} alt="Avatar" className="w-14 h-14 rounded-full object-cover" style={{border:`2px solid ${t.accent}`}}/>
            ) : currentAvatar && currentAvatar.length <= 4 ? (
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl" style={{background:`linear-gradient(135deg,${t.accent},#8b5cf6)`,border:`2px solid ${t.accent}`}}>{currentAvatar}</div>
            ) : (
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white" style={{background:`linear-gradient(135deg,${t.accent},#8b5cf6)`}}>RS</div>
            )}
            <button onClick={()=>setShowAvatarPicker(true)} className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center" style={{background:t.accent,border:`2px solid ${isDark?'#1a1a2e':'#fff'}`}}><IcoCamera size={10} color="white"/></button>
          </div>
          <div className="flex-1"><h2 className="text-base font-bold">{userName}</h2><p className="text-[10px]" style={{color:t.textMuted}}>{profileData?.bio?.slice(0,50) || 'Set up your profile'}</p><p className="text-[10px]" style={{color:t.textMuted}}>📍 {profileData?.city || 'Set your location'}{profileData?.state ? `, ${profileData.state}` : ''}</p></div>
          <button onClick={()=>router.push('/profile/edit')} className="px-3 py-1 rounded-lg text-[9px] font-semibold" style={{background:t.accent+'15',color:t.accent}}>Edit</button>
        </div>

        {/* Avatar Visibility Mode Selector */}
        <div className="mb-3">
          <p className="text-[9px] font-bold mb-1.5" style={{color:t.textMuted}}>PROFILE PICTURE SHOWING AS:</p>
          <div className="flex gap-1.5">{AVATAR_MODES.map(m=>(
            <button key={m.key} onClick={()=>setActiveAvatarMode(m.key)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg" style={{background:activeAvatarMode===m.key?m.color+'18':'transparent',border:`1.5px solid ${activeAvatarMode===m.key?m.color:t.cardBorder}`}}>
              <span className="text-[10px]">{m.icon}</span>
              <span className="text-[8px] font-semibold" style={{color:activeAvatarMode===m.key?m.color:t.textMuted}}>{m.label}</span>
              {avatars[m.key]&&<span className="text-[7px]" style={{color:'#22c55e'}}>✓</span>}
            </button>
          ))}</div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[{l:'Rating',v:`⭐ ${myRating}`},{l:'Followers',v:myFollowers+''},{l:'Posts',v:(stats?.posts_count||posts.length)+''},{l:'Jobs',v:jobs.length+''}].map(s=>(<div key={s.l} className="text-center p-1.5 rounded-lg" style={{background:t.bg}}><p className="text-xs font-bold">{s.v}</p><p className="text-[8px]" style={{color:t.textMuted}}>{s.l}</p></div>))}
        </div>
        {/* BR-103: Eligibility Badge */}
        <div className="mt-2 flex items-center gap-2 p-2 rounded-lg" style={{background:canRate?'rgba(34,197,94,0.08)':'rgba(239,68,68,0.08)'}}>
          <IcoShield size={12} color={canRate?'#22c55e':'#ef4444'}/>
          <span className="text-[9px]" style={{color:canRate?'#22c55e':'#ef4444'}}>{canRate?'✅ Eligible to rate others (4.0+ rating & 10+ followers)':'❌ Not eligible to rate: Need 4.0+ rating AND 10+ followers'}</span>
        </div>
      </div>

      {/* Avatar Picker Modal */}
      {showAvatarPicker&&(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{background:'rgba(0,0,0,0.6)'}} onClick={()=>setShowAvatarPicker(false)}>
          <div onClick={e=>e.stopPropagation()} className="w-full max-w-sm rounded-2xl p-5 space-y-3" style={{background:isDark?'#1a1a2e':'#fff'}}>
            <h3 className="font-bold text-sm">Set {AVATAR_MODES.find(m=>m.key===activeAvatarMode)?.label} Profile Picture</h3>
            <p className="text-[9px]" style={{color:t.textMuted}}>This avatar is shown to {activeAvatarMode==='public'?'everyone':activeAvatarMode==='professional'?'your professional network':`your ${activeAvatarMode}`}</p>
            <button onClick={()=>avatarRef.current?.click()} className="w-full py-3 rounded-xl text-xs font-bold text-white" style={{background:t.accent}}>📷 Upload Photo</button>
            <p className="text-[9px] text-center" style={{color:t.textMuted}}>-- or pick an avatar --</p>
            <div className="grid grid-cols-6 gap-2">{DEFAULT_AVATARS.map(em=>(<button key={em} onClick={()=>setEmojiAvatar(em)} className="w-10 h-10 rounded-xl flex items-center justify-center text-xl hover:scale-110 transition-transform" style={{background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.03)'}}>{em}</button>))}</div>
            {currentAvatar&&<button onClick={()=>{updateAvatar(activeAvatarMode,null);setShowAvatarPicker(false);}} className="w-full py-2 rounded-xl text-xs" style={{color:'#ef4444'}}>Remove Current Avatar</button>}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto" style={{scrollbarWidth:'none'}}>{(['overview','posts','jobs','products','communities','ratings'] as const).map(tb=>(
        <button key={tb} onClick={()=>setTab(tb)} className="px-3 py-1 rounded-full text-[9px] font-semibold whitespace-nowrap" style={{background:tab===tb?t.accent+'20':t.card,color:tab===tb?t.accent:t.textMuted}}>{tb==='overview'?'👤':tb==='posts'?'📝':tb==='jobs'?'💼':tb==='products'?'🛍️':tb==='communities'?'👥':'⭐'} {tb}</button>
      ))}</div>

      {/* OVERVIEW */}
      {tab==='overview'&&(
        <div className="space-y-2">
          <div className="p-3 rounded-xl" style={{background:t.card}}><p className="text-xs font-bold mb-1">About</p><p className="text-[10px]">Passionate about AI education and making robotics accessible. Building hands-on STEM learning for ages 3-14 across India and Canada.</p></div>
          <div className="p-3 rounded-xl" style={{background:t.card}}><p className="text-xs font-bold mb-1">Skills</p><div className="flex flex-wrap gap-1">{['AI/ML','React','Next.js','TypeScript','Robotics','Education','Product Management','Cloud'].map(s=>(<span key={s} className="px-2 py-0.5 rounded-full text-[9px]" style={{background:t.accent+'15',color:t.accent}}>{s}</span>))}</div></div>
        </div>
      )}

      {/* BR-101: POSTS with Edit/Delete */}
      {tab==='posts'&&(
        <div className="space-y-2">
          {posts.map(p=>(
            <div key={p.id} className="p-3 rounded-xl" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
              {editingPost===p.id?(
                <div className="space-y-2"><textarea value={editText} onChange={e=>setEditText(e.target.value)} rows={2} className="w-full p-2 rounded-lg text-xs" style={{background:t.bg,color:t.text,border:`1px solid ${t.cardBorder}`}}/><div className="flex gap-2"><button onClick={()=>handleSaveEdit(p.id)} className="px-3 py-1 rounded text-[9px] font-bold text-white" style={{background:t.accent}}>Save</button><button onClick={()=>setEditingPost(null)} className="px-3 py-1 rounded text-[9px]" style={{background:t.cardBorder}}>Cancel</button></div></div>
              ):(
                <>
                  <p className="text-xs mb-1">{p.text}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-3"><span className="text-[9px]" style={{color:t.textMuted}}>{p.time}</span><span className="text-[9px]" style={{color:t.textMuted}}>❤️ {p.likes}</span><span className="text-[9px] px-1.5 py-0.5 rounded" style={{background:t.accent+'10',color:t.accent}}>{p.audience}</span></div>
                    <div className="flex gap-1"><button onClick={()=>{setEditingPost(p.id);setEditText(p.text);}} className="text-[9px] px-2 py-0.5 rounded" style={{background:'rgba(59,130,246,0.1)',color:'#3b82f6'}}>Edit</button><button onClick={()=>handleDeletePost(p.id)} className="text-[9px] px-2 py-0.5 rounded" style={{background:'rgba(239,68,68,0.1)',color:'#ef4444'}}>Delete</button></div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* BR-101: JOBS with Delete */}
      {tab==='jobs'&&(
        <div className="space-y-2">{jobs.map(j=>(
          <div key={j.id} className="p-3 rounded-xl flex items-center gap-3" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
            <div className="flex-1"><p className="text-xs font-semibold">{j.title}</p><p className="text-[9px]" style={{color:t.textMuted}}>{j.posted} · {j.budget} · 👥 {j.applicants} applicants</p></div>
            <span className="text-[9px] px-2 py-0.5 rounded-full" style={{background:j.status==='Active'?'rgba(34,197,94,0.15)':'rgba(156,163,175,0.15)',color:j.status==='Active'?'#22c55e':t.textMuted}}>{j.status}</span>
            <button onClick={()=>setJobs(p=>p.filter(x=>x.id!==j.id))} className="text-[9px] px-2 py-0.5 rounded" style={{background:'rgba(239,68,68,0.1)',color:'#ef4444'}}>Delete</button>
          </div>
        ))}</div>
      )}

      {/* BR-101: PRODUCTS with Delete */}
      {tab==='products'&&(
        <div className="space-y-2">{products.map(p=>(
          <div key={p.id} className="p-3 rounded-xl flex items-center gap-3" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
            <div className="flex-1"><p className="text-xs font-semibold">{p.name}</p><p className="text-[9px]" style={{color:t.textMuted}}>${p.price} · {p.views} views</p></div>
            <span className="text-[9px] px-2 py-0.5 rounded-full" style={{background:'rgba(34,197,94,0.15)',color:'#22c55e'}}>{p.status}</span>
            <button onClick={()=>setProducts(pr=>pr.filter(x=>x.id!==p.id))} className="text-[9px] px-2 py-0.5 rounded" style={{background:'rgba(239,68,68,0.1)',color:'#ef4444'}}>Delete</button>
          </div>
        ))}</div>
      )}

      {/* BR-101: COMMUNITIES with Delete */}
      {tab==='communities'&&(
        <div className="space-y-2">{communities.map(c=>(
          <div key={c.id} className="p-3 rounded-xl flex items-center gap-3" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
            <div className="flex-1"><p className="text-xs font-semibold">{c.name}</p><p className="text-[9px]" style={{color:t.textMuted}}>👥 {c.members} members</p></div>
            <button onClick={()=>setCommunities(pr=>pr.filter(x=>x.id!==c.id))} className="text-[9px] px-2 py-0.5 rounded" style={{background:'rgba(239,68,68,0.1)',color:'#ef4444'}}>Delete</button>
          </div>
        ))}</div>
      )}

      {/* BR-103: RATINGS */}
      {tab==='ratings'&&(
        <div className="space-y-3">
          <div className="p-4 rounded-xl" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
            <h3 className="text-sm font-bold mb-2">Rate a User</h3>
            <p className="text-[9px] mb-3" style={{color:t.textMuted}}>BR-103: Only users with ⭐ 4.0+ rating AND 10+ friends can rate others</p>
            <div className="flex items-center gap-2 p-2 rounded-lg mb-2" style={{background:canRate?'rgba(34,197,94,0.08)':'rgba(239,68,68,0.08)'}}>
              <span className="text-[10px]" style={{color:canRate?'#22c55e':'#ef4444'}}>Your rating: ⭐ {myRating} {myRating>=4.0?'✅':'❌'} | Friends: {myFriends} {myFriends>=10?'✅':'❌'}</span>
            </div>
            <input value={ratingTarget} onChange={e=>setRatingTarget(e.target.value)} placeholder="Enter user name..." className="w-full p-2 rounded-lg text-xs mb-2" style={{background:t.bg,color:t.text,border:`1px solid ${t.cardBorder}`}}/>
            <div className="flex items-center gap-2 mb-2"><span className="text-[10px]">Rating:</span>{[1,2,3,4,5].map(v=>(<button key={v} onClick={()=>setRatingValue(v)} className="text-sm">{v<=ratingValue?'⭐':'☆'}</button>))}</div>
            <button onClick={submitRating} className="w-full py-2 rounded-lg text-xs font-bold text-white" style={{background:canRate?t.accent:'#9ca3af'}} disabled={!canRate}>
              {canRate?'Submit Rating':'❌ Not Eligible'}
            </button>
            {ratingMsg&&<p className="text-[10px] mt-2 p-2 rounded" style={{background:ratingMsg.ok?'rgba(34,197,94,0.1)':'rgba(239,68,68,0.1)',color:ratingMsg.ok?'#22c55e':'#ef4444'}}>{ratingMsg.text}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
