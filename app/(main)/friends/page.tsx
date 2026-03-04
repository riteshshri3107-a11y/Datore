"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { useAuthStore } from '@/store/useAuthStore';
import { getTheme } from '@/lib/theme';
import { getFollowing, getFollowers, followUser, unfollowUser, blockUser, unblockUser, getBlockedUsers as getBlockedUsersFromDB, searchWorkers } from '@/lib/supabase';
import { DEMO_WORKERS } from '@/lib/demoData';
import { IcoBack, IcoSearch, IcoShield, IcoUser, IcoChat, IcoMic } from '@/components/Icons';

/* FRIENDS PAGE — Privacy-First Discovery
   ════════════════════════════════════════
   FRIENDS TAB: People you follow (getFollowing) — full info
   DISCOVER TAB: Privacy-protected — searchWorkers for finding new people
   REQUESTS TAB: Incoming followers (getFollowers not in following)
   BLOCKED TAB: Managed blocked users via Supabase

   PRIVACY RULES:
   - Never show name of non-friends
   - Never show exact address or geo coordinates
   - Never show exact distance (only approximate zones)
   - Show only public avatar (emoji or uploaded photo)
   - Show approximate proximity zone
   - Show general interest tags
*/

type DistanceZone = 'nearby'|'close'|'area'|'district'|'city';
const ZONES: Record<DistanceZone, {label:string;range:string;color:string;icon:string}> = {
  nearby:  {label:'Very Close',  range:'Within 1 km', color:'#22c55e',icon:'🟢'},
  close:   {label:'Nearby',      range:'1 – 3 km',    color:'#3b82f6',icon:'🔵'},
  area:    {label:'In Your Area', range:'3 – 5 km',    color:'#8b5cf6',icon:'🟣'},
  district:{label:'Same District',range:'5 – 10 km',   color:'#f59e0b',icon:'🟡'},
  city:    {label:'Same City',    range:'10 – 25 km',  color:'#6b7280',icon:'⚪'},
};

// Discovery profiles — privacy-safe fallback
interface DiscoverProfile {
  id:string; avatar:string; avatarName:string; zone:DistanceZone; interests:string[];
  memberSince:string; mutualFriends:number; rating:number; verified:boolean;
  activityHint:string;
}

const DISCOVER_PROFILES: DiscoverProfile[] = [
  {id:'d1',avatar:'👨‍🔧',avatarName:'FixerPro',zone:'nearby',interests:['Home Repair','Plumbing','Electrical'],memberSince:'2024',mutualFriends:3,rating:4.8,verified:true,activityHint:'Active today'},
  {id:'d2',avatar:'👩‍🏫',avatarName:'EduStar',zone:'nearby',interests:['Tutoring','Education','Math'],memberSince:'2023',mutualFriends:5,rating:4.9,verified:true,activityHint:'Active today'},
  {id:'d3',avatar:'🧑‍🍳',avatarName:'ChefVibes',zone:'close',interests:['Cooking','Meal Prep','Vegetarian'],memberSince:'2024',mutualFriends:1,rating:4.5,verified:false,activityHint:'Active this week'},
  {id:'d4',avatar:'👩‍💻',avatarName:'TechWiz',zone:'close',interests:['Tech Help','Web Design','App Dev'],memberSince:'2023',mutualFriends:7,rating:4.7,verified:true,activityHint:'Active today'},
  {id:'d5',avatar:'🧑‍🌾',avatarName:'GreenThumb',zone:'area',interests:['Gardening','Landscaping','Spring Cleanup'],memberSince:'2024',mutualFriends:0,rating:4.3,verified:false,activityHint:'Active this week'},
  {id:'d6',avatar:'👨‍🎨',avatarName:'ArtistX',zone:'area',interests:['Painting','Interior Design','Murals'],memberSince:'2025',mutualFriends:2,rating:4.6,verified:true,activityHint:'Active today'},
  {id:'d7',avatar:'👩‍⚕️',avatarName:'PetPal',zone:'district',interests:['Pet Care','Dog Walking','Cat Sitting'],memberSince:'2023',mutualFriends:4,rating:4.8,verified:true,activityHint:'Active today'},
  {id:'d8',avatar:'🧑‍🔬',avatarName:'SciKid',zone:'district',interests:['STEM Education','Robotics','Science'],memberSince:'2024',mutualFriends:2,rating:4.4,verified:false,activityHint:'Active this week'},
  {id:'d9',avatar:'👷',avatarName:'StrongArm',zone:'city',interests:['Moving Help','Furniture Assembly','Heavy Lifting'],memberSince:'2024',mutualFriends:1,rating:4.2,verified:true,activityHint:'Active recently'},
  {id:'d10',avatar:'👩‍🎤',avatarName:'MelodyMaker',zone:'city',interests:['Music Lessons','Piano','Guitar'],memberSince:'2023',mutualFriends:0,rating:4.7,verified:false,activityHint:'Active this week'},
  {id:'d11',avatar:'🧑‍✈️',avatarName:'RideReady',zone:'nearby',interests:['Driving','Airport Rides','Errands'],memberSince:'2024',mutualFriends:6,rating:4.9,verified:true,activityHint:'Active today'},
  {id:'d12',avatar:'👨‍🍳',avatarName:'BakeKing',zone:'close',interests:['Baking','Catering','Event Food'],memberSince:'2025',mutualFriends:0,rating:4.1,verified:false,activityHint:'Active recently'},
];

export default function FriendsPage() {
  const router = useRouter();
  const {isDark,glassLevel,accentColor} = useThemeStore();
  const { user } = useAuthStore();
  const t = getTheme(isDark,glassLevel,accentColor);
  const [tab,setTab] = useState<'friends'|'discover'|'requests'|'blocked'>('friends');
  const [search,setSearch] = useState('');
  const [voiceSrch,setVoiceSrch] = useState(false);

  // Supabase data
  const [following, setFollowing] = useState<any[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
  const [discoverProfiles, setDiscoverProfiles] = useState<DiscoverProfile[]>(DISCOVER_PROFILES);
  const [loading, setLoading] = useState(true);

  // Discover state
  const [discoverZone,setDiscoverZone] = useState<DistanceZone|'all'>('all');
  const [radiusKm,setRadiusKm] = useState(10);
  const [sentRequests,setSentRequests] = useState<string[]>([]);
  const [showPrivacyInfo,setShowPrivacyInfo] = useState(false);

  // Followers who you haven't followed back = "incoming requests"
  const [acceptedRequests,setAcceptedRequests] = useState<string[]>([]);
  const [declinedRequests,setDeclinedRequests] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) {
      // Fallback to demo data
      const demoFriendIds = DEMO_WORKERS.slice(0, 5).map(w => w.id);
      setFollowing(DEMO_WORKERS.filter(w => demoFriendIds.includes(w.id)));
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [followingData, followersData, blockedData] = await Promise.all([
        getFollowing(user.id),
        getFollowers(user.id),
        getBlockedUsersFromDB(user.id),
      ]);

      // Following: people the user follows
      const followingList = (followingData || []).map((f: any) => ({
        id: f.profiles?.id || f.following_id,
        full_name: f.profiles?.name || 'Unknown',
        avatar_url: f.profiles?.avatar_url || null,
        verified: f.profiles?.verified || false,
        city: f.profiles?.city || '',
        skills: [],
        availability: 'available',
      }));
      setFollowing(followingList);

      // Followers: people who follow the user (for requests tab)
      const followerList = (followersData || []).map((f: any) => ({
        id: f.profiles?.id || f.follower_id,
        full_name: f.profiles?.name || 'Unknown',
        avatar_url: f.profiles?.avatar_url || null,
        verified: f.profiles?.verified || false,
      }));
      setFollowers(followerList);

      // Blocked users
      const blockedList = (blockedData || []).map((b: any) => ({
        id: b.profiles?.id || b.blocked_id,
        full_name: b.profiles?.name || 'Unknown',
        avatar_url: b.profiles?.avatar_url || null,
      }));
      setBlockedUsers(blockedList);

      // Try to get workers for discover tab
      try {
        const workers = await searchWorkers({ available: true });
        if (workers && workers.length > 0) {
          const followingIds = new Set(followingList.map((f: any) => f.id));
          const blockedIds = new Set(blockedList.map((b: any) => b.id));
          const workerProfiles: DiscoverProfile[] = workers
            .filter((w: any) => w.profiles && !followingIds.has(w.id) && !blockedIds.has(w.id) && w.id !== user.id)
            .map((w: any, i: number) => {
              const zones: DistanceZone[] = ['nearby','close','area','district','city'];
              return {
                id: w.id,
                avatar: w.profiles?.avatar_url ? '👤' : ['👨‍🔧','👩‍🏫','🧑‍🍳','👩‍💻','🧑‍🌾','👨‍🎨','👩‍⚕️','🧑‍🔬','👷','👩‍🎤'][i % 10],
                avatarName: w.profiles?.name?.split(' ')[0] || 'Worker',
                zone: zones[Math.min(i % 5, 4)],
                interests: w.skills || [],
                memberSince: '2024',
                mutualFriends: 0,
                rating: w.profiles?.rating || 4.5,
                verified: w.profiles?.verified || false,
                activityHint: w.available ? 'Active today' : 'Active this week',
              };
            });
          if (workerProfiles.length > 0) {
            setDiscoverProfiles(workerProfiles);
          }
        }
      } catch {}
    } catch {
      // Fallback to demo workers
      setFollowing(DEMO_WORKERS.slice(0, 5).map(w => ({
        id: w.id, full_name: w.full_name, city: w.city, skills: w.skills, availability: w.availability,
      })));
    }
    setLoading(false);
  };

  const blockedIds = new Set(blockedUsers.map(b => b.id));
  const friends = following.filter(f => !blockedIds.has(f.id));
  const filteredFriends = friends.filter(f => !search || (f.full_name || '').toLowerCase().includes(search.toLowerCase()));

  // Followers not followed back = incoming requests
  const followingIds = new Set(following.map(f => f.id));
  const incomingRequests = followers.filter(f => !followingIds.has(f.id) && !blockedIds.has(f.id));
  const pendingIn = incomingRequests.filter(r => !acceptedRequests.includes(r.id) && !declinedRequests.includes(r.id));

  const zoneMaxKm:Record<DistanceZone,number> = {nearby:1,close:3,area:5,district:10,city:25};
  const filteredDiscover = discoverProfiles.filter(p => {
    if(sentRequests.includes(p.id)) return true;
    if(zoneMaxKm[p.zone] > radiusKm) return false;
    if(discoverZone!=='all' && p.zone!==discoverZone) return false;
    if(search) {
      const s = search.toLowerCase();
      return p.interests.some(i=>i.toLowerCase().includes(s));
    }
    return true;
  });

  const handleUnfollow = async (id: string) => {
    if (!user) return;
    try {
      await unfollowUser(user.id, id);
      setFollowing(prev => prev.filter(f => f.id !== id));
    } catch {}
  };

  const handleBlock = async (id: string) => {
    if (!user) return;
    try {
      await blockUser(user.id, id);
      setBlockedUsers(prev => [...prev, following.find(f => f.id === id) || { id, full_name: 'User' }]);
    } catch {}
  };

  const handleUnblock = async (id: string) => {
    if (!user) return;
    try {
      await unblockUser(user.id, id);
      setBlockedUsers(prev => prev.filter(b => b.id !== id));
    } catch {}
  };

  const sendRequest = async (id: string) => {
    if (!user) { alert('Please sign in.'); return; }
    setSentRequests(p=>[...p,id]);
    try {
      await followUser(user.id, id);
    } catch {
      setSentRequests(p=>p.filter(x=>x!==id));
    }
  };

  const cancelRequest = async (id: string) => {
    if (!user) return;
    setSentRequests(p=>p.filter(x=>x!==id));
    try {
      await unfollowUser(user.id, id);
    } catch {}
  };

  const acceptRequest = async (id: string) => {
    if (!user) return;
    setAcceptedRequests(p=>[...p,id]);
    try {
      await followUser(user.id, id);
      // Re-fetch following to update
      const data = await getFollowing(user.id);
      const list = (data || []).map((f: any) => ({
        id: f.profiles?.id || f.following_id,
        full_name: f.profiles?.name || 'Unknown',
        avatar_url: f.profiles?.avatar_url || null,
        verified: f.profiles?.verified || false,
        city: '',
        skills: [],
        availability: 'available',
      }));
      setFollowing(list);
    } catch {}
  };

  const declineRequest = (id: string) => setDeclinedRequests(p=>[...p,id]);

  const voiceS = () => { setVoiceSrch(true); setTimeout(()=>{setVoiceSrch(false);setSearch('tutoring');},2000); };

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={()=>router.back()} style={{background:'none',border:'none',color:t.text,cursor:'pointer'}}><IcoBack size={20}/></button>
        <h1 className="text-xl font-bold flex-1">Friends</h1>
        <span className="text-[10px] px-2.5 py-1 rounded-full" style={{background:t.accentLight,color:t.accent}}>{friends.length} following</span>
        <button onClick={voiceS} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:voiceSrch?'rgba(239,68,68,0.15)':'rgba(139,92,246,0.12)'}}><IcoMic size={16} color={voiceSrch?'#ef4444':'#8b5cf6'}/></button>
      </div>
      {voiceSrch&&<p className="text-[10px] text-center animate-pulse" style={{color:'#ef4444'}}>🎙️ Listening...</p>}

      {/* Search with Mic */}
      <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
        <IcoSearch size={14} color={t.textMuted}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={tab==='discover'?'Search by interest (e.g. tutoring, plumbing)...':'Search friends...'} className="flex-1 text-sm outline-none bg-transparent" style={{color:t.text}}/>
        <button onClick={()=>{setVoiceSrch(true);setTimeout(()=>{setVoiceSrch(false);setSearch('tutoring');},2000);}} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:voiceSrch?'rgba(239,68,68,0.12)':'rgba(139,92,246,0.08)'}}>
          <IcoMic size={14} color={voiceSrch?'#ef4444':'#8b5cf6'}/>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-0.5 rounded-xl" style={{background:t.card}}>
        {([
          {k:'friends' as const,l:`Following (${friends.length})`,i:'👥'},
          {k:'discover' as const,l:'Discover',i:'🔍'},
          {k:'requests' as const,l:`Followers${pendingIn.length>0?` (${pendingIn.length})`:''}`,i:'📨'},
          {k:'blocked' as const,l:`Blocked (${blockedUsers.length})`,i:'🚫'},
        ]).map(tb=>(
          <button key={tb.k} onClick={()=>setTab(tb.k)} className="flex-1 py-2 rounded-lg text-[9px] font-semibold" style={{background:tab===tb.k?t.accent:'transparent',color:tab===tb.k?'#fff':t.textMuted}}>
            {tb.i} {tb.l}
          </button>
        ))}
      </div>

      {/* ═══ FRIENDS TAB — Full info for people you follow ═══ */}
      {tab==='friends'&&(
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-8 rounded-2xl" style={{background:t.card}}>
              <p className="text-sm" style={{color:t.textSecondary}}>Loading...</p>
            </div>
          ) : filteredFriends.length===0?(
            <div className="text-center py-8 rounded-2xl" style={{background:t.card}}>
              <p className="text-sm" style={{color:t.textSecondary}}>{search?'No friends match your search':'Not following anyone yet'}</p>
              <button onClick={()=>setTab('discover')} className="text-xs mt-3 px-4 py-2 rounded-xl font-medium" style={{background:t.accentLight,color:t.accent}}>Find People Nearby</button>
            </div>
          ):filteredFriends.map(f=>(
            <div key={f.id} className="rounded-xl p-3 flex items-center gap-3" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
              <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold" style={{background:`linear-gradient(135deg,${t.accent}33,#8b5cf633)`,color:t.accent}}>
                {f.avatar_url ? <img src={f.avatar_url} alt="" className="w-11 h-11 rounded-full object-cover" /> : (f.full_name || '??').split(' ').map((n:string)=>n[0]).join('')}
              </div>
              <div className="flex-1 cursor-pointer" onClick={()=>router.push(`/worker/${f.id}`)}>
                <p className="font-semibold text-sm">{f.full_name}</p>
                <p className="text-[10px]" style={{color:t.textMuted}}>{f.city}{f.skills?.length ? ' · ' + f.skills.join(', ') : ''}</p>
                {f.availability && (
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="w-2 h-2 rounded-full" style={{background:f.availability==='available'?'#22c55e':f.availability==='busy'?'#ef4444':'#f59e0b'}}/>
                    <span className="text-[10px]" style={{color:t.textMuted}}>{f.availability}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-1.5">
                <button onClick={()=>router.push(`/chat/${f.id}`)} className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium" style={{background:t.accentLight,color:t.accent}}>Chat</button>
                <button onClick={()=>handleUnfollow(f.id)} className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium" style={{background:'rgba(239,68,68,0.1)',color:'#ef4444'}}>Unfollow</button>
                <button onClick={()=>handleBlock(f.id)} className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium" style={{background:'rgba(107,114,128,0.1)',color:'#6b7280'}}>Block</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ DISCOVER TAB — Privacy-First: No Name, Only Avatar + Zone ═══ */}
      {tab==='discover'&&(
        <div className="space-y-3">
          {/* Privacy Notice */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl cursor-pointer" style={{background:'rgba(34,197,94,0.08)',border:'1px solid rgba(34,197,94,0.15)'}} onClick={()=>setShowPrivacyInfo(!showPrivacyInfo)}>
            <IcoShield size={14} color="#22c55e"/>
            <p className="text-[9px] flex-1" style={{color:'#22c55e'}}>🔒 Privacy Protected — No names, no addresses, only public avatars shown</p>
            <span className="text-[10px]" style={{color:'#22c55e'}}>{showPrivacyInfo?'▲':'▼'}</span>
          </div>
          {showPrivacyInfo&&(
            <div className="p-3 rounded-xl space-y-1" style={{background:isDark?'rgba(34,197,94,0.04)':'rgba(34,197,94,0.03)'}}>
              {[
                '🔒 Names revealed ONLY after both users accept a friend request',
                '📍 Distance zones are approximate (±2 km) — no exact location shared',
                '🏠 Your address & GPS coordinates are never visible to anyone',
                '🎭 Only your chosen public avatar is shown to non-friends',
                '🚫 Block any user at any time to prevent future contact',
                '🗺️ Map zones show general proximity, NOT real positions',
              ].map((rule,i)=>(<p key={i} className="text-[8px]" style={{color:'#22c55e'}}>{rule}</p>))}
            </div>
          )}

          {/* ═══ RADIUS SLIDER — Distance Search ═══ */}
          <div className="p-3 rounded-xl" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold" style={{color:t.textMuted}}>📍 SEARCH RADIUS</p>
              <span className="text-sm font-bold" style={{color:t.accent}}>{radiusKm} km</span>
            </div>
            <input
              type="range" min={1} max={25} step={1} value={radiusKm}
              onChange={e=>setRadiusKm(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{background:`linear-gradient(to right, #22c55e 0%, #3b82f6 ${(radiusKm/25)*40}%, #8b5cf6 ${(radiusKm/25)*60}%, #f59e0b ${(radiusKm/25)*80}%, #6b7280 100%)`}}
            />
            <div className="flex justify-between mt-1">
              <span className="text-[7px]" style={{color:t.textMuted}}>1 km</span>
              <span className="text-[7px]" style={{color:t.textMuted}}>5 km</span>
              <span className="text-[7px]" style={{color:t.textMuted}}>10 km</span>
              <span className="text-[7px]" style={{color:t.textMuted}}>15 km</span>
              <span className="text-[7px]" style={{color:t.textMuted}}>25 km</span>
            </div>
            <p className="text-[8px] mt-1" style={{color:t.textMuted}}>Showing {filteredDiscover.length} people within {radiusKm} km (approximate zones)</p>
          </div>

          {/* ═══ PROXIMITY MAP VISUAL ═══ */}
          <div className="p-4 rounded-xl" style={{background:isDark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.02)',border:`1px solid ${t.cardBorder}`}}>
            <p className="text-[9px] font-bold mb-2 text-center" style={{color:t.textMuted}}>🗺️ Proximity Map (approximate zones)</p>
            <div className="relative flex items-center justify-center" style={{height:160}}>
              {/* Concentric zone rings */}
              {[
                {r:130,c:'#6b7280',km:25,l:'Same City'},
                {r:104,c:'#f59e0b',km:10,l:'Same District'},
                {r:78,c:'#8b5cf6',km:5,l:'Your Area'},
                {r:52,c:'#3b82f6',km:3,l:'Nearby'},
                {r:26,c:'#22c55e',km:1,l:'Very Close'},
              ].map(ring=>(
                <div key={ring.r} style={{
                  position:'absolute',width:ring.r*2,height:ring.r*2,borderRadius:'50%',
                  border:`1.5px ${radiusKm>=ring.km?'solid':'dashed'} ${radiusKm>=ring.km?ring.c+'55':ring.c+'15'}`,
                  background:radiusKm>=ring.km?`${ring.c}08`:'transparent',
                  transition:'all 0.3s ease',
                }}>
                  <span style={{position:'absolute',top:-8,left:'50%',transform:'translateX(-50%)',fontSize:6,color:ring.c,fontWeight:600,whiteSpace:'nowrap',opacity:radiusKm>=ring.km?1:0.3}}>{ring.l} ({ring.km}km)</span>
                </div>
              ))}

              {/* Center (You) */}
              <div style={{position:'absolute',width:16,height:16,borderRadius:'50%',background:t.accent,zIndex:10,boxShadow:`0 0 16px ${t.accent}88`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <span style={{fontSize:6,color:'white',fontWeight:900}}>YOU</span>
              </div>

              {/* People dots */}
              {filteredDiscover.filter(p=>!sentRequests.includes(p.id)||true).slice(0,10).map((p,i)=>{
                const z = ZONES[p.zone];
                if(zoneMaxKm[p.zone] > radiusKm && !sentRequests.includes(p.id)) return null;
                const angles = [20,65,110,155,200,245,290,335,45,225];
                const radii:Record<DistanceZone,number> = {nearby:22,close:44,area:65,district:86,city:110};
                const angle = (angles[i%10])*Math.PI/180;
                const r = radii[p.zone] + (i%3)*5;
                const x = Math.cos(angle)*r;
                const y = Math.sin(angle)*r;
                return (
                  <div key={p.id} style={{
                    position:'absolute',
                    left:`calc(50% + ${x}px - 12px)`,top:`calc(50% + ${y}px - 12px)`,
                    width:24,height:24,borderRadius:'50%',
                    background:isDark?'#1a1a2e':'#fff',
                    border:`2.5px solid ${sentRequests.includes(p.id)?'#f59e0b':z.color}`,
                    display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:12,zIndex:6+i,cursor:'pointer',
                    transition:'all 0.3s ease',
                    boxShadow:sentRequests.includes(p.id)?`0 0 8px rgba(245,158,11,0.4)`:`0 2px 6px ${z.color}22`,
                  }} title={`${p.avatarName} · ${z.label} · ${z.range}`}>
                    {p.avatar}
                  </div>
                );
              })}

              {/* Radius boundary indicator */}
              <div style={{
                position:'absolute',
                width: Math.min(260, (radiusKm/25)*260),
                height: Math.min(260, (radiusKm/25)*260),
                borderRadius:'50%',
                border:`2px solid ${t.accent}44`,
                background:`${t.accent}04`,
                transition:'all 0.3s ease',
                zIndex:1,
              }}/>
            </div>
            <p className="text-[7px] text-center mt-2" style={{color:t.textMuted}}>⚠️ Dots show approximate zones only — not actual positions</p>
          </div>

          {/* Zone Filter Buttons */}
          <div>
            <p className="text-[9px] font-bold mb-1.5" style={{color:t.textMuted}}>FILTER BY ZONE</p>
            <div className="flex gap-1.5 overflow-x-auto pb-1" style={{scrollbarWidth:'none'}}>
              <button onClick={()=>setDiscoverZone('all')} className="px-3 py-1.5 rounded-full text-[9px] font-semibold whitespace-nowrap" style={{background:discoverZone==='all'?t.accent+'20':t.card,color:discoverZone==='all'?t.accent:t.textMuted,border:`1px solid ${discoverZone==='all'?t.accent+'44':t.cardBorder}`}}>All Zones</button>
              {(Object.entries(ZONES) as [DistanceZone,typeof ZONES[DistanceZone]][]).map(([key,z])=>{
                const count = discoverProfiles.filter(p=>p.zone===key&&zoneMaxKm[p.zone]<=radiusKm).length;
                return (
                  <button key={key} onClick={()=>setDiscoverZone(key)} disabled={zoneMaxKm[key as DistanceZone]>radiusKm} className="px-3 py-1.5 rounded-full text-[9px] font-semibold whitespace-nowrap disabled:opacity-30" style={{background:discoverZone===key?z.color+'20':t.card,color:discoverZone===key?z.color:t.textMuted,border:`1px solid ${discoverZone===key?z.color+'44':t.cardBorder}`}}>
                    {z.icon} {z.range} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* People Count by Zone */}
          <div className="grid grid-cols-5 gap-1">
            {(Object.entries(ZONES) as [DistanceZone,typeof ZONES[DistanceZone]][]).map(([key,z])=>{
              const count = discoverProfiles.filter(p=>p.zone===key&&zoneMaxKm[p.zone]<=radiusKm).length;
              const inRange = zoneMaxKm[key as DistanceZone] <= radiusKm;
              return (
                <button key={key} onClick={()=>inRange&&setDiscoverZone(key)} className="text-center p-1.5 rounded-lg" style={{background:discoverZone===key?z.color+'15':isDark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.02)',border:`1px solid ${discoverZone===key?z.color+'33':t.cardBorder}`,opacity:inRange?1:0.3}}>
                  <p className="text-xs font-bold" style={{color:z.color}}>{inRange?count:'—'}</p>
                  <p className="text-[7px]" style={{color:t.textMuted}}>{z.range}</p>
                </button>
              );
            })}
          </div>

          {/* Discovery Cards — PRIVACY: No names, only avatars */}
          <div className="space-y-2">
            {filteredDiscover.map(p=>{
              const z = ZONES[p.zone];
              const isPending = sentRequests.includes(p.id);
              return (
                <div key={p.id} className="rounded-xl p-3 group" style={{background:t.card,border:`1px solid ${isPending?'rgba(245,158,11,0.25)':t.cardBorder}`,transition:'all 0.2s'}}>
                  <div className="flex items-center gap-3">
                    {/* Avatar Only */}
                    <div className="relative">
                      <div className="w-13 h-13 rounded-full flex items-center justify-center text-2xl flex-shrink-0 cursor-pointer" style={{width:52,height:52,background:`linear-gradient(135deg,${z.color}22,${z.color}11)`,border:`2.5px solid ${z.color}44`,transition:'all 0.3s'}} title={p.avatarName}>
                        {p.avatar}
                      </div>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-10">
                        <span className="text-[10px] font-bold px-2 py-1 rounded-lg" style={{background:isDark?'rgba(30,30,50,0.95)':'white',color:z.color,boxShadow:'0 2px 10px rgba(0,0,0,0.2)',border:`1px solid ${z.color}33`}}>{p.avatarName}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity" style={{color:z.color}}>{p.avatarName}</span>
                        {p.verified&&<span className="text-[7px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600 font-bold">✓ Verified</span>}
                      </div>
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-[8px] px-2 py-0.5 rounded-full font-semibold" style={{background:z.color+'15',color:z.color}}>{z.icon} {z.label} · {z.range}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-1">{p.interests.map(i=>(
                        <span key={i} className="text-[8px] px-1.5 py-0.5 rounded-full" style={{background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)',color:t.textSecondary}}>{i}</span>
                      ))}</div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[8px]" style={{color:t.textMuted}}>⭐ {p.rating}</span>
                        {p.mutualFriends>0&&<span className="text-[8px] font-semibold" style={{color:t.accent}}>{p.mutualFriends} mutual</span>}
                        <span className="text-[8px]" style={{color:t.textMuted}}>Since {p.memberSince}</span>
                        <span className="text-[8px]" style={{color:'#22c55e'}}>{p.activityHint}</span>
                      </div>
                    </div>
                    {/* Send Request / Pending */}
                    <div className="flex-shrink-0">
                      {isPending ? (
                        <div className="text-center">
                          <span className="text-[8px] px-2.5 py-1 rounded-lg block mb-1 font-semibold" style={{background:'rgba(245,158,11,0.12)',color:'#f59e0b'}}>⏳ Pending</span>
                          <button onClick={()=>cancelRequest(p.id)} className="text-[8px]" style={{color:'#ef4444'}}>Cancel</button>
                        </div>
                      ) : (
                        <button onClick={()=>sendRequest(p.id)} className="px-4 py-2.5 rounded-xl text-[10px] font-bold text-white flex items-center gap-1.5" style={{background:`linear-gradient(135deg,${t.accent},#8b5cf6)`,boxShadow:`0 2px 10px ${t.accent}30`}}>
                          👋 Follow
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {filteredDiscover.length===0&&(
            <div className="text-center py-8 rounded-xl" style={{background:t.card}}>
              <p className="text-2xl mb-2">🔍</p>
              <p className="text-xs" style={{color:t.textMuted}}>No people found within {radiusKm} km</p>
              <p className="text-[9px] mt-1" style={{color:t.textMuted}}>Try increasing your search radius</p>
            </div>
          )}

          {/* Privacy Footer */}
          <div className="p-2 rounded-lg text-center" style={{background:isDark?'rgba(255,255,255,0.02)':'rgba(0,0,0,0.01)'}}>
            <p className="text-[7px]" style={{color:t.textMuted}}>🛡️ Your location is never shared. Distance zones are approximate (±2 km).</p>
          </div>
        </div>
      )}

      {/* ═══ REQUESTS TAB (Followers) ═══ */}
      {tab==='requests'&&(
        <div className="space-y-3">
          {/* Incoming - followers not followed back */}
          <div>
            <p className="text-[10px] font-bold mb-2" style={{color:t.textMuted}}>📥 FOLLOWERS (not followed back)</p>
            {loading ? (
              <p className="text-center text-xs py-4 rounded-xl" style={{background:t.card,color:t.textMuted}}>Loading...</p>
            ) : pendingIn.length===0?(
              <p className="text-center text-xs py-4 rounded-xl" style={{background:t.card,color:t.textMuted}}>No pending followers to follow back</p>
            ):pendingIn.map(r=>(
              <div key={r.id} className="rounded-xl p-3 flex items-center gap-3 mb-2" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold" style={{background:`linear-gradient(135deg,${t.accent}33,#8b5cf633)`,color:t.accent}}>
                  {r.avatar_url ? <img src={r.avatar_url} alt="" className="w-11 h-11 rounded-full object-cover" /> : (r.full_name || '??').split(' ').map((n:string)=>n[0]).join('')}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{r.full_name}</p>
                  {r.verified && <span className="text-[7px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600 font-bold">✓ Verified</span>}
                </div>
                <div className="flex gap-1.5">
                  <button onClick={()=>acceptRequest(r.id)} className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-white" style={{background:'#22c55e'}}>Follow Back</button>
                  <button onClick={()=>declineRequest(r.id)} className="px-3 py-1.5 rounded-lg text-[10px] font-medium" style={{background:'rgba(239,68,68,0.1)',color:'#ef4444'}}>Dismiss</button>
                </div>
              </div>
            ))}
          </div>

          {/* Sent */}
          <div>
            <p className="text-[10px] font-bold mb-2" style={{color:t.textMuted}}>📤 SENT FOLLOWS ({sentRequests.length})</p>
            {sentRequests.length===0?(
              <p className="text-center text-xs py-4 rounded-xl" style={{background:t.card,color:t.textMuted}}>No sent follow requests</p>
            ):sentRequests.map(id=>{
              const p = discoverProfiles.find(x=>x.id===id); if(!p) return null;
              const z = ZONES[p.zone];
              return (
                <div key={id} className="rounded-xl p-3 flex items-center gap-3 mb-2" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{background:`${z.color}15`}}>{p.avatar}</div>
                  <div className="flex-1">
                    <span className="text-[9px] px-2 py-0.5 rounded-full" style={{background:'rgba(245,158,11,0.12)',color:'#f59e0b'}}>⏳ Following</span>
                    <div className="flex flex-wrap gap-1 mt-1">{p.interests.slice(0,2).map(i=>(<span key={i} className="text-[8px] px-1.5 py-0.5 rounded-full" style={{background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)'}}>{i}</span>))}</div>
                  </div>
                  <button onClick={()=>cancelRequest(id)} className="px-2.5 py-1.5 rounded-lg text-[10px]" style={{color:'#ef4444'}}>Unfollow</button>
                </div>
              );
            })}
          </div>

          {/* Accepted */}
          {acceptedRequests.length>0&&(
            <div>
              <p className="text-[10px] font-bold mb-2" style={{color:'#22c55e'}}>✅ FOLLOWED BACK</p>
              {acceptedRequests.map(id=>{
                const r = incomingRequests.find(x=>x.id===id); if(!r) return null;
                return (
                  <div key={id} className="rounded-xl p-3 flex items-center gap-3 mb-2" style={{background:'rgba(34,197,94,0.05)',border:'1px solid rgba(34,197,94,0.15)'}}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{background:`linear-gradient(135deg,${t.accent}33,#8b5cf633)`,color:t.accent}}>
                      {(r.full_name || '??').split(' ').map((n:string)=>n[0]).join('')}
                    </div>
                    <div className="flex-1"><p className="text-xs font-bold" style={{color:'#22c55e'}}>Now following each other! 🎉</p><p className="text-[9px]" style={{color:t.textMuted}}>{r.full_name}</p></div>
                    <button onClick={()=>router.push('/inbox')} className="px-3 py-1.5 rounded-lg text-[10px] font-medium" style={{background:t.accentLight,color:t.accent}}>Chat</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══ BLOCKED TAB ═══ */}
      {tab==='blocked'&&(
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-8 rounded-2xl" style={{background:t.card}}>
              <p className="text-sm" style={{color:t.textSecondary}}>Loading...</p>
            </div>
          ) : blockedUsers.length===0?(
            <div className="text-center py-8 rounded-2xl" style={{background:t.card}}>
              <p className="text-sm" style={{color:t.textSecondary}}>No blocked users</p>
            </div>
          ):blockedUsers.map(b=>(
            <div key={b.id} className="rounded-xl p-3 flex items-center gap-3" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
              <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold" style={{background:'rgba(107,114,128,0.2)',color:'#6b7280'}}>
                {b.avatar_url ? <img src={b.avatar_url} alt="" className="w-11 h-11 rounded-full object-cover" /> : (b.full_name || '??').split(' ').map((n:string)=>n[0]).join('')}
              </div>
              <div className="flex-1"><p className="font-semibold text-sm" style={{color:t.textMuted}}>{b.full_name}</p></div>
              <button onClick={()=>handleUnblock(b.id)} className="px-3 py-1.5 rounded-lg text-[10px] font-medium" style={{background:'rgba(34,197,94,0.1)',color:'#22c55e'}}>Unblock</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
