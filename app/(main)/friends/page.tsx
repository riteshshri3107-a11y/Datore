"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { DEMO_WORKERS, getFriends, toggleFriend, getBlockedUsers, toggleBlock } from '@/lib/demoData';
import { IcoBack, IcoSearch, IcoShield, IcoUser, IcoChat, IcoMic } from '@/components/Icons';

/* FRIENDS PAGE — Privacy-First Discovery
   ════════════════════════════════════════
   FRIENDS TAB: Full info (name, avatar, skills, status) — accepted connections
   DISCOVER TAB: Privacy-protected — NO name, only public avatar, approximate zone
   REQUESTS TAB: Incoming/outgoing friend requests
   BLOCKED TAB: Managed blocked users

   PRIVACY RULES:
   ✗ Never show name of non-friends
   ✗ Never show exact address or geo coordinates
   ✗ Never show exact distance (only approximate zones)
   ✓ Show only public avatar (emoji or uploaded photo)
   ✓ Show approximate proximity zone (Within 1km, 1-3km, etc.)
   ✓ Show general interest tags (not skills — too identifying)
*/

type DistanceZone = 'nearby'|'close'|'area'|'district'|'city';
const ZONES: Record<DistanceZone, {label:string;range:string;color:string;icon:string}> = {
  nearby:  {label:'Very Close',  range:'Within 1 km', color:'#22c55e',icon:'🟢'},
  close:   {label:'Nearby',      range:'1 – 3 km',    color:'#3b82f6',icon:'🔵'},
  area:    {label:'In Your Area', range:'3 – 5 km',    color:'#8b5cf6',icon:'🟣'},
  district:{label:'Same District',range:'5 – 10 km',   color:'#f59e0b',icon:'🟡'},
  city:    {label:'Same City',    range:'10 – 25 km',  color:'#6b7280',icon:'⚪'},
};

// Discovery profiles — privacy-safe: only public avatars + interests + zone
interface DiscoverProfile {
  id:string; avatar:string; zone:DistanceZone; interests:string[];
  memberSince:string; mutualFriends:number; rating:number; verified:boolean;
  activityHint:string; // vague — e.g. "Active today", not "Online at 3pm"
}

const DISCOVER_PROFILES: DiscoverProfile[] = [
  {id:'d1',avatar:'👨‍🔧',zone:'nearby',interests:['Home Repair','Plumbing','Electrical'],memberSince:'2024',mutualFriends:3,rating:4.8,verified:true,activityHint:'Active today'},
  {id:'d2',avatar:'👩‍🏫',zone:'nearby',interests:['Tutoring','Education','Math'],memberSince:'2023',mutualFriends:5,rating:4.9,verified:true,activityHint:'Active today'},
  {id:'d3',avatar:'🧑‍🍳',zone:'close',interests:['Cooking','Meal Prep','Vegetarian'],memberSince:'2024',mutualFriends:1,rating:4.5,verified:false,activityHint:'Active this week'},
  {id:'d4',avatar:'👩‍💻',zone:'close',interests:['Tech Help','Web Design','App Dev'],memberSince:'2023',mutualFriends:7,rating:4.7,verified:true,activityHint:'Active today'},
  {id:'d5',avatar:'🧑‍🌾',zone:'area',interests:['Gardening','Landscaping','Spring Cleanup'],memberSince:'2024',mutualFriends:0,rating:4.3,verified:false,activityHint:'Active this week'},
  {id:'d6',avatar:'👨‍🎨',zone:'area',interests:['Painting','Interior Design','Murals'],memberSince:'2025',mutualFriends:2,rating:4.6,verified:true,activityHint:'Active today'},
  {id:'d7',avatar:'👩‍⚕️',zone:'district',interests:['Pet Care','Dog Walking','Cat Sitting'],memberSince:'2023',mutualFriends:4,rating:4.8,verified:true,activityHint:'Active today'},
  {id:'d8',avatar:'🧑‍🔬',zone:'district',interests:['STEM Education','Robotics','Science'],memberSince:'2024',mutualFriends:2,rating:4.4,verified:false,activityHint:'Active this week'},
  {id:'d9',avatar:'👷',zone:'city',interests:['Moving Help','Furniture Assembly','Heavy Lifting'],memberSince:'2024',mutualFriends:1,rating:4.2,verified:true,activityHint:'Active recently'},
  {id:'d10',avatar:'👩‍🎤',zone:'city',interests:['Music Lessons','Piano','Guitar'],memberSince:'2023',mutualFriends:0,rating:4.7,verified:false,activityHint:'Active this week'},
  {id:'d11',avatar:'🧑‍✈️',zone:'nearby',interests:['Driving','Airport Rides','Errands'],memberSince:'2024',mutualFriends:6,rating:4.9,verified:true,activityHint:'Active today'},
  {id:'d12',avatar:'👨‍🍳',zone:'close',interests:['Baking','Catering','Event Food'],memberSince:'2025',mutualFriends:0,rating:4.1,verified:false,activityHint:'Active recently'},
];

export default function FriendsPage() {
  const router = useRouter();
  const {isDark,glassLevel,accentColor} = useThemeStore();
  const t = getTheme(isDark,glassLevel,accentColor);
  const [tab,setTab] = useState<'friends'|'discover'|'requests'|'blocked'>('friends');
  const [friendIds,setFriendIds] = useState<string[]>([]);
  const [blockedIds,setBlockedIds] = useState<string[]>([]);
  const [search,setSearch] = useState('');
  const [voiceSrch,setVoiceSrch] = useState(false);
  // Discover state
  const [discoverZone,setDiscoverZone] = useState<DistanceZone|'all'>('all');
  const [radiusKm,setRadiusKm] = useState(10); // slider: 1–25 km
  const [sentRequests,setSentRequests] = useState<string[]>([]);
  const [showPrivacyInfo,setShowPrivacyInfo] = useState(false);
  const [incomingRequests] = useState<{id:string;avatar:string;zone:DistanceZone;interests:string[];mutualFriends:number}[]>([
    {id:'ir1',avatar:'🧑‍🏭',zone:'nearby',interests:['Welding','Metal Work'],mutualFriends:2},
    {id:'ir2',avatar:'👩‍🔬',zone:'close',interests:['Chemistry','Tutoring'],mutualFriends:4},
  ]);
  const [acceptedRequests,setAcceptedRequests] = useState<string[]>([]);
  const [declinedRequests,setDeclinedRequests] = useState<string[]>([]);

  useEffect(() => { setFriendIds(getFriends()); setBlockedIds(getBlockedUsers()); }, []);

  const friends = DEMO_WORKERS.filter(w => friendIds.includes(w.id) && !blockedIds.includes(w.id));
  const blocked = DEMO_WORKERS.filter(w => blockedIds.includes(w.id));
  const filteredFriends = friends.filter(f => !search || f.full_name.toLowerCase().includes(search.toLowerCase()));

  const zoneMaxKm:Record<DistanceZone,number> = {nearby:1,close:3,area:5,district:10,city:25};
  const filteredDiscover = DISCOVER_PROFILES.filter(p => {
    if(sentRequests.includes(p.id)) return true;
    // Radius slider filter
    if(zoneMaxKm[p.zone] > radiusKm) return false;
    if(discoverZone!=='all' && p.zone!==discoverZone) return false;
    if(search) {
      const s = search.toLowerCase();
      return p.interests.some(i=>i.toLowerCase().includes(s));
    }
    return true;
  });

  const handleToggleFriend = (id:string) => { toggleFriend(id); setFriendIds(getFriends()); };
  const handleToggleBlock = (id:string) => { toggleBlock(id); setBlockedIds(getBlockedUsers()); };
  const sendRequest = (id:string) => setSentRequests(p=>[...p,id]);
  const cancelRequest = (id:string) => setSentRequests(p=>p.filter(x=>x!==id));
  const acceptRequest = (id:string) => setAcceptedRequests(p=>[...p,id]);
  const declineRequest = (id:string) => setDeclinedRequests(p=>[...p,id]);
  const voiceS = () => { setVoiceSrch(true); setTimeout(()=>{setVoiceSrch(false);setSearch('tutoring');},2000); };

  const pendingIn = incomingRequests.filter(r=>!acceptedRequests.includes(r.id)&&!declinedRequests.includes(r.id));

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={()=>router.back()} style={{background:'none',border:'none',color:t.text,cursor:'pointer'}}><IcoBack size={20}/></button>
        <h1 className="text-xl font-bold flex-1">Friends</h1>
        <span className="text-[10px] px-2.5 py-1 rounded-full" style={{background:t.accentLight,color:t.accent}}>{friends.length} friends</span>
        <button onClick={voiceS} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:voiceSrch?'rgba(239,68,68,0.15)':'rgba(139,92,246,0.12)'}}><IcoMic size={16} color={voiceSrch?'#ef4444':'#8b5cf6'}/></button>
      </div>
      {voiceSrch&&<p className="text-[10px] text-center animate-pulse" style={{color:'#ef4444'}}>🎙️ Listening...</p>}

      {/* Search */}
      <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
        <IcoSearch size={14} color={t.textMuted}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={tab==='discover'?'Search by interest (e.g. tutoring, plumbing)...':'Search friends...'} className="flex-1 text-sm outline-none bg-transparent" style={{color:t.text}}/>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-0.5 rounded-xl" style={{background:t.card}}>
        {([
          {k:'friends' as const,l:`Friends (${friends.length})`,i:'👥'},
          {k:'discover' as const,l:'Discover',i:'🔍'},
          {k:'requests' as const,l:`Requests${pendingIn.length>0?` (${pendingIn.length})`:''}`,i:'📨'},
          {k:'blocked' as const,l:`Blocked (${blocked.length})`,i:'🚫'},
        ]).map(tb=>(
          <button key={tb.k} onClick={()=>setTab(tb.k)} className="flex-1 py-2 rounded-lg text-[9px] font-semibold" style={{background:tab===tb.k?t.accent:'transparent',color:tab===tb.k?'#fff':t.textMuted}}>
            {tb.i} {tb.l}
          </button>
        ))}
      </div>

      {/* ═══ FRIENDS TAB — Full info for accepted connections ═══ */}
      {tab==='friends'&&(
        <div className="space-y-2">
          {filteredFriends.length===0?(
            <div className="text-center py-8 rounded-2xl" style={{background:t.card}}>
              <p className="text-sm" style={{color:t.textSecondary}}>{search?'No friends match your search':'No friends yet'}</p>
              <button onClick={()=>setTab('discover')} className="text-xs mt-3 px-4 py-2 rounded-xl font-medium" style={{background:t.accentLight,color:t.accent}}>Find People Nearby</button>
            </div>
          ):filteredFriends.map(f=>(
            <div key={f.id} className="rounded-xl p-3 flex items-center gap-3" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
              <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold" style={{background:`linear-gradient(135deg,${t.accent}33,#8b5cf633)`,color:t.accent}}>{f.full_name.split(' ').map(n=>n[0]).join('')}</div>
              <div className="flex-1 cursor-pointer" onClick={()=>router.push(`/worker/${f.id}`)}>
                <p className="font-semibold text-sm">{f.full_name}</p>
                <p className="text-[10px]" style={{color:t.textMuted}}>{f.city} · {f.skills.join(', ')}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="w-2 h-2 rounded-full" style={{background:f.availability==='available'?'#22c55e':f.availability==='busy'?'#ef4444':'#f59e0b'}}/>
                  <span className="text-[10px]" style={{color:t.textMuted}}>{f.availability}</span>
                </div>
              </div>
              <div className="flex gap-1.5">
                <button onClick={()=>router.push(`/chat/${f.id}`)} className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium" style={{background:t.accentLight,color:t.accent}}>Chat</button>
                <button onClick={()=>handleToggleFriend(f.id)} className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium" style={{background:'rgba(239,68,68,0.1)',color:'#ef4444'}}>Remove</button>
                <button onClick={()=>handleToggleBlock(f.id)} className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium" style={{background:'rgba(107,114,128,0.1)',color:'#6b7280'}}>Block</button>
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
              {/* Concentric zone rings — only show rings within radius */}
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
                  {/* Zone label */}
                  <span style={{position:'absolute',top:-8,left:'50%',transform:'translateX(-50%)',fontSize:6,color:ring.c,fontWeight:600,whiteSpace:'nowrap',opacity:radiusKm>=ring.km?1:0.3}}>{ring.l} ({ring.km}km)</span>
                </div>
              ))}

              {/* Center (You) — pulsing dot */}
              <div style={{position:'absolute',width:16,height:16,borderRadius:'50%',background:t.accent,zIndex:10,boxShadow:`0 0 16px ${t.accent}88`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <span style={{fontSize:6,color:'white',fontWeight:900}}>YOU</span>
              </div>

              {/* People dots — positioned in their zones, only if within radius */}
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
                  }} title={`${z.label} · ${z.range} — ${p.interests.join(', ')}`}>
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
                const count = DISCOVER_PROFILES.filter(p=>p.zone===key&&zoneMaxKm[p.zone]<=radiusKm).length;
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
              const count = DISCOVER_PROFILES.filter(p=>p.zone===key&&zoneMaxKm[p.zone]<=radiusKm).length;
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
                <div key={p.id} className="rounded-xl p-3" style={{background:t.card,border:`1px solid ${isPending?'rgba(245,158,11,0.25)':t.cardBorder}`}}>
                  <div className="flex items-center gap-3">
                    {/* Avatar Only — No Name Ever */}
                    <div className="w-13 h-13 rounded-full flex items-center justify-center text-2xl flex-shrink-0" style={{width:52,height:52,background:`linear-gradient(135deg,${z.color}22,${z.color}11)`,border:`2.5px solid ${z.color}44`}}>
                      {p.avatar}
                    </div>
                    <div className="flex-1">
                      {/* Anonymous ID + Zone badge */}
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-bold" style={{color:t.text}}>User #{p.id.replace('d','')}</span>
                        {p.verified&&<span className="text-[7px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600 font-bold">✓ Verified</span>}
                      </div>
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-[8px] px-2 py-0.5 rounded-full font-semibold" style={{background:z.color+'15',color:z.color}}>{z.icon} {z.label} · {z.range}</span>
                      </div>
                      {/* Interests (not skills — less identifying) */}
                      <div className="flex flex-wrap gap-1 mb-1">{p.interests.map(i=>(
                        <span key={i} className="text-[8px] px-1.5 py-0.5 rounded-full" style={{background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)',color:t.textSecondary}}>{i}</span>
                      ))}</div>
                      {/* Safe metadata */}
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
                        <button onClick={()=>sendRequest(p.id)} className="px-3 py-2.5 rounded-xl text-[9px] font-bold text-white" style={{background:`linear-gradient(135deg,${t.accent},#8b5cf6)`}}>
                          👋 Add
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

      {/* ═══ REQUESTS TAB ═══ */}
      {tab==='requests'&&(
        <div className="space-y-3">
          {/* Incoming */}
          <div>
            <p className="text-[10px] font-bold mb-2" style={{color:t.textMuted}}>📥 INCOMING REQUESTS</p>
            {pendingIn.length===0?(
              <p className="text-center text-xs py-4 rounded-xl" style={{background:t.card,color:t.textMuted}}>No pending requests</p>
            ):pendingIn.map(r=>{
              const z = ZONES[r.zone];
              return (
                <div key={r.id} className="rounded-xl p-3 flex items-center gap-3 mb-2" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-lg flex-shrink-0" style={{background:`${z.color}15`,border:`2px solid ${z.color}44`}}>{r.avatar}</div>
                  <div className="flex-1">
                    <span className="text-[9px] px-2 py-0.5 rounded-full" style={{background:z.color+'15',color:z.color}}>{z.icon} {z.label}</span>
                    <div className="flex flex-wrap gap-1 mt-1">{r.interests.map(i=>(<span key={i} className="text-[8px] px-1.5 py-0.5 rounded-full" style={{background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)'}}>{i}</span>))}</div>
                    {r.mutualFriends>0&&<p className="text-[8px] mt-0.5" style={{color:t.accent}}>{r.mutualFriends} mutual friends</p>}
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={()=>acceptRequest(r.id)} className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-white" style={{background:'#22c55e'}}>Accept</button>
                    <button onClick={()=>declineRequest(r.id)} className="px-3 py-1.5 rounded-lg text-[10px] font-medium" style={{background:'rgba(239,68,68,0.1)',color:'#ef4444'}}>Decline</button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sent */}
          <div>
            <p className="text-[10px] font-bold mb-2" style={{color:t.textMuted}}>📤 SENT REQUESTS ({sentRequests.length})</p>
            {sentRequests.length===0?(
              <p className="text-center text-xs py-4 rounded-xl" style={{background:t.card,color:t.textMuted}}>No sent requests</p>
            ):sentRequests.map(id=>{
              const p = DISCOVER_PROFILES.find(x=>x.id===id); if(!p) return null;
              const z = ZONES[p.zone];
              return (
                <div key={id} className="rounded-xl p-3 flex items-center gap-3 mb-2" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{background:`${z.color}15`}}>{p.avatar}</div>
                  <div className="flex-1">
                    <span className="text-[9px] px-2 py-0.5 rounded-full" style={{background:'rgba(245,158,11,0.12)',color:'#f59e0b'}}>⏳ Pending</span>
                    <div className="flex flex-wrap gap-1 mt-1">{p.interests.slice(0,2).map(i=>(<span key={i} className="text-[8px] px-1.5 py-0.5 rounded-full" style={{background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)'}}>{i}</span>))}</div>
                  </div>
                  <button onClick={()=>cancelRequest(id)} className="px-2.5 py-1.5 rounded-lg text-[10px]" style={{color:'#ef4444'}}>Cancel</button>
                </div>
              );
            })}
          </div>

          {/* Accepted */}
          {acceptedRequests.length>0&&(
            <div>
              <p className="text-[10px] font-bold mb-2" style={{color:'#22c55e'}}>✅ ACCEPTED</p>
              {acceptedRequests.map(id=>{
                const r = incomingRequests.find(x=>x.id===id); if(!r) return null;
                return (
                  <div key={id} className="rounded-xl p-3 flex items-center gap-3 mb-2" style={{background:'rgba(34,197,94,0.05)',border:'1px solid rgba(34,197,94,0.15)'}}>
                    <span className="text-lg">{r.avatar}</span>
                    <div className="flex-1"><p className="text-xs font-bold" style={{color:'#22c55e'}}>New friend! 🎉</p><p className="text-[9px]" style={{color:t.textMuted}}>Name and profile now visible</p></div>
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
          {blocked.length===0?(
            <div className="text-center py-8 rounded-2xl" style={{background:t.card}}>
              <p className="text-sm" style={{color:t.textSecondary}}>No blocked users</p>
            </div>
          ):blocked.map(b=>(
            <div key={b.id} className="rounded-xl p-3 flex items-center gap-3" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
              <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold" style={{background:'rgba(107,114,128,0.2)',color:'#6b7280'}}>{b.full_name.split(' ').map(n=>n[0]).join('')}</div>
              <div className="flex-1"><p className="font-semibold text-sm" style={{color:t.textMuted}}>{b.full_name}</p></div>
              <button onClick={()=>handleToggleBlock(b.id)} className="px-3 py-1.5 rounded-lg text-[10px] font-medium" style={{background:'rgba(34,197,94,0.1)',color:'#22c55e'}}>Unblock</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
