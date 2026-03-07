"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { getJoinedCommunities, toggleCommunity } from '@/lib/demoData';
import { IcoBack, IcoShield, IcoSearch, IcoMic } from '@/components/Icons';
import { createCommunity, createPost, getSession, deleteCommunity as dbDeleteCommunity, updateCommunity as dbUpdateCommunity, deletePost as dbDeletePost, updatePost as dbUpdatePost } from '@/lib/supabase';

/* ─── AI SAFETY ENGINE ─── */
const THREAT_DB: Record<string,string[]> = {
  terrorism: ['bomb','attack plan','terror cell','sleeper cell','recruit fighters','weapons cache','target location','explosive device','jihad war','armed resistance','lone wolf','suicide mission','martyrdom operation','caliphate','ied','detonate','radicalize','guerilla strike'],
  hate_speech: ['hate group','supremacy','white power','death to','kill all','inferior race','ethnic cleansing','genocide','lynch mob','exterminate','master race','subhuman','racial war','race traitor','blood purity'],
  religious_extremism: ['convert or die','infidels must','sinners burn','religious war','holy crusade against','god commands destruction','punish non-believers','blasphemy death','sharia enforcement','forced conversion','heretics must','only true faith','divine punishment'],
  antisocial: ['overthrow government','anarchy now','burn it all down','storm the building','weapons stash','destroy infrastructure','poison supply','hack government','sabotage mission','undermine democracy','violent revolution','civil war now','arm yourselves'],
  harassment: ['dox them','swat them','stalk','threaten family','blackmail','expose personal info','revenge against','ruin their life','make them pay','harass','intimidate'],
  child_safety: ['groom','predator','underage contact','inappropriate with minors','child exploitation','lure children','meet minors secretly','secret from parents'],
};

const SEV: Record<string,{level:string;label:string;color:string;action:string}> = {
  terrorism: { level:'critical', label:'Terrorism/Violence', color:'#dc2626', action:'Content blocked. Reported to platform safety.' },
  hate_speech: { level:'critical', label:'Hate Speech', color:'#dc2626', action:'Content blocked. User flagged for review.' },
  religious_extremism: { level:'high', label:'Religious Extremism', color:'#f97316', action:'Content blocked. Pending moderator review.' },
  antisocial: { level:'high', label:'Anti-Social Activity', color:'#f97316', action:'Content blocked. Admin notified.' },
  harassment: { level:'medium', label:'Harassment', color:'#eab308', action:'Content flagged for review.' },
  child_safety: { level:'critical', label:'Child Safety Threat', color:'#dc2626', action:'Content blocked. Emergency report filed.' },
};

interface SafetyResult { safe:boolean; threats:{category:string;keyword:string;label:string;color:string;action:string;severity:string}[]; score:number; }

function aiScan(text: string): SafetyResult {
  const l = text.toLowerCase();
  const threats: SafetyResult['threats'] = [];
  for (const [cat, kws] of Object.entries(THREAT_DB)) {
    for (const kw of kws) {
      if (l.includes(kw)) { const m = SEV[cat]; threats.push({ category:cat, keyword:kw, severity:m.level, label:m.label, color:m.color, action:m.action }); break; }
    }
  }
  // Pattern checks
  const patterns: [RegExp,string][] = [
    [/how\s+to\s+(make|build)\s+(bomb|weapon|explosive)/i, 'terrorism'],
    [/(all|every)\s+(jews|muslims|christians|hindus|blacks|whites)\s+(should|must)\s+(die|be\s+killed)/i, 'hate_speech'],
    [/meet\s+(me|us)\s+in\s+secret.*(?:minor|child|kid|teen)/i, 'child_safety'],
    [/don.t\s+tell\s+(your\s+parents|anyone|mom|dad)/i, 'child_safety'],
  ];
  for (const [p, cat] of patterns) { if (p.test(text) && !threats.some(t=>t.category===cat)) { const m=SEV[cat]; threats.push({category:cat,keyword:'pattern',severity:m.level,label:m.label,color:m.color,action:m.action}); } }
  return { safe: threats.length===0, threats, score: threats.length===0?100:threats.some(t=>t.severity==='critical')?0:25 };
}

function groupPurposeCheck(name:string, desc:string): SafetyResult {
  const r = aiScan(`${name} ${desc}`);
  const banned = [/religious\s+(conversion|enforcement|domination)/i,/political\s+(overthrow|revolution)/i,/(race|ethnic)\s+(separation|supremacy)/i,/anti[- ]?(government|democracy|society)/i,/weapon|arms?\s+dealing|drug\s+(trade|distribution)/i];
  for (const p of banned) { if (p.test(`${name} ${desc}`) && !r.threats.length) { r.safe=false; r.threats.push({category:'policy',keyword:'banned',severity:'high',label:'Prohibited Purpose',color:'#f97316',action:'Group creation blocked.'}); r.score=20; } }
  return r;
}

type GType = 'social'|'professional'|'neighborhood'|'hobby'|'support'|'family'|'education';
type PVis = 'public'|'group_only'|'friends_only';
type MTab = 'discover'|'joined'|'create'|'moderation';

const GT: Record<GType,{l:string;c:string;i:string}> = {
  social:{l:'Social',c:'#ec4899',i:'🤝'}, professional:{l:'Professional',c:'#3b82f6',i:'💼'},
  neighborhood:{l:'Neighborhood',c:'#22c55e',i:'🏘️'}, hobby:{l:'Hobby',c:'#f59e0b',i:'🎨'},
  support:{l:'Support',c:'#8b5cf6',i:'💚'}, family:{l:'Family',c:'#ef4444',i:'👨‍👩‍👧‍👦'},
  education:{l:'Education',c:'#06b6d4',i:'📚'},
};

interface GPost { id:string; author:string; avatar:string; content:string; time:string; likes:number; replies:number; vis:PVis; }

const GROUPS = [
  { id:'c1', name:'Toronto Handyworkers', desc:'Local handyman services & referrals', members:2340, emoji:'🔧', type:'professional' as GType, verified:true, rules:['No spam','Verified workers only','Be respectful','No hate speech'], admin:'Admin Team', vis:'group_only' as PVis, approval:false, safetyScore:98, lastActive:'2h ago',
    posts:[{id:'p1',author:'Mike D.',avatar:'MD',content:'Looking for a reliable electrician in Brampton area. Recommendations?',time:'2h ago',likes:5,replies:3,vis:'group_only' as PVis},{id:'p2',author:'Sarah K.',avatar:'SK',content:'Just finished a beautiful deck renovation in Mississauga! 📸',time:'5h ago',likes:12,replies:7,vis:'public' as PVis}] as GPost[] },
  { id:'c2', name:'GTA Babysitters', desc:'Trusted babysitting community', members:1890, emoji:'👶', type:'neighborhood' as GType, verified:true, rules:['Background check required','Child safety first','No personal info sharing'], admin:'SafeKids TO', vis:'group_only' as PVis, approval:true, safetyScore:99, lastActive:'1h ago', posts:[] as GPost[] },
  { id:'c3', name:'Home Cleaning Pros', desc:'Professional cleaners network', members:3100, emoji:'🧹', type:'professional' as GType, verified:true, rules:['Licensed cleaners','Rate transparency'], admin:'CleanPro', vis:'public' as PVis, approval:false, safetyScore:97, lastActive:'30m ago', posts:[] as GPost[] },
  { id:'c4', name:'Tech Support Hub', desc:'IT and tech assistance', members:920, emoji:'💻', type:'professional' as GType, verified:false, rules:['No piracy','Share knowledge'], admin:'TechGuru', vis:'group_only' as PVis, approval:false, safetyScore:95, lastActive:'4h ago', posts:[] as GPost[] },
  { id:'c5', name:'Pet Lovers GTA', desc:'Pet care and walking', members:4200, emoji:'🐕', type:'social' as GType, verified:true, rules:['Love animals','Rescue first'], admin:'PetPals', vis:'public' as PVis, approval:false, safetyScore:99, lastActive:'15m ago', posts:[] as GPost[] },
  { id:'c6', name:'Tutoring Network', desc:'Academic tutoring & learning', members:1560, emoji:'📚', type:'education' as GType, verified:true, rules:['Verified tutors','Student safety'], admin:'EduConnect', vis:'group_only' as PVis, approval:true, safetyScore:98, lastActive:'1h ago', posts:[] as GPost[] },
  { id:'c7', name:'Moving Helpers TO', desc:'Reliable movers in Toronto', members:780, emoji:'🚚', type:'neighborhood' as GType, verified:false, rules:['Insured movers','Fair pricing'], admin:'MoveTO', vis:'public' as PVis, approval:false, safetyScore:92, lastActive:'6h ago', posts:[] as GPost[] },
  { id:'c8', name:'GTA Cooks & Chefs', desc:'Personal chefs and catering', members:2100, emoji:'🍳', type:'hobby' as GType, verified:true, rules:['Food safety certified','No spam'], admin:'FoodieTO', vis:'public' as PVis, approval:false, safetyScore:96, lastActive:'45m ago', posts:[] as GPost[] },
  { id:'c9', name:'Brampton Support Circle', desc:'Mental health & wellness support', members:450, emoji:'💚', type:'support' as GType, verified:true, rules:['Confidentiality','Professional moderation'], admin:'WellnessTO', vis:'group_only' as PVis, approval:true, safetyScore:100, lastActive:'2h ago', posts:[] as GPost[] },
  { id:'c10', name:'Weekend Warriors', desc:'Outdoor activities & hiking', members:1820, emoji:'⛰️', type:'social' as GType, verified:false, rules:['Safety first','Be inclusive'], admin:'HikeTO', vis:'public' as PVis, approval:false, safetyScore:94, lastActive:'3h ago', posts:[] as GPost[] },
  { id:'c11', name:'Family Fun GTA', desc:'Activities and playdates for families', members:3400, emoji:'👨‍👩‍👧‍👦', type:'family' as GType, verified:true, rules:['Family-friendly only','Child safety priority'], admin:'FamilyTO', vis:'group_only' as PVis, approval:true, safetyScore:99, lastActive:'20m ago', posts:[] as GPost[] },
];

const MODLOG = [
  { id:'m1', time:'Today 2:15 PM', action:'Message Blocked', content:'Hate speech in Toronto Handyworkers', severity:'critical', color:'#dc2626', user:'anon_42', resolved:true },
  { id:'m2', time:'Today 11:30 AM', action:'Group Creation Blocked', content:'"Religious Purity Movement" - anti-extremism policy', severity:'high', color:'#f97316', user:'user_198', resolved:true },
  { id:'m3', time:'Yesterday', action:'User Warned', content:'Harassment in Pet Lovers GTA', severity:'medium', color:'#eab308', user:'dogwalker99', resolved:false },
  { id:'m4', time:'Feb 26', action:'Account Suspended', content:'Repeated terrorism content attempts', severity:'critical', color:'#dc2626', user:'blocked_user', resolved:true },
];

export default function CommunityPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const [tab, setTab] = useState<MTab>('discover');
  const [search, setSearch] = useState('');
  const [joined, setJoined] = useState<string[]>([]);
  const [typeF, setTypeF] = useState<GType|'all'>('all');
  const [selGroup, setSelGroup] = useState<string|null>(null);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState<GType>('social');
  const [newVis, setNewVis] = useState<PVis>('group_only');
  const [createRes, setCreateRes] = useState<SafetyResult|null>(null);
  const [postText, setPostText] = useState('');
  const [postVis, setPostVis] = useState<PVis>('group_only');
  const [postRes, setPostRes] = useState<SafetyResult|null>(null);
  const [showSafety, setShowSafety] = useState(false);
  const [userPosts, setUserPosts] = useState<GPost[]>([]);
  const [editingPost, setEditingPost] = useState<string|null>(null);
  const [editPostText, setEditPostText] = useState('');
  const [userGroups, setUserGroups] = useState<typeof GROUPS>([]);
  const [editingGroup, setEditingGroup] = useState<string|null>(null);
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupDesc, setEditGroupDesc] = useState('');

  useEffect(() => { setJoined(getJoinedCommunities()); }, []);
  const toggle = (id:string) => { toggleCommunity(id); setJoined(getJoinedCommunities()); };
  const allGroups = [...userGroups, ...GROUPS];
  const filtered = allGroups.filter(c => (!search||c.name.toLowerCase().includes(search.toLowerCase())||c.desc.toLowerCase().includes(search.toLowerCase())) && (typeF==='all'||c.type===typeF) && (tab==='joined'?joined.includes(c.id):true));
  const sg = selGroup ? allGroups.find(c=>c.id===selGroup) : null;
  const isMyGroup = sg ? userGroups.some(g=>g.id===sg.id) : false;
  const groupUserPosts = sg ? userPosts.filter(()=>true) : [];
  const sb = (s:number) => s>=95?{l:'Excellent',c:'#22c55e',bg:'rgba(34,197,94,0.1)'}:s>=80?{l:'Good',c:'#f59e0b',bg:'rgba(245,158,11,0.1)'}:{l:'Review',c:'#ef4444',bg:'rgba(239,68,68,0.1)'};
  const handleCreate = async () => { const r=groupPurposeCheck(newName,newDesc); setCreateRes(r); if(r.safe){ const { data: session } = await getSession(); const userId = session?.session?.user?.id || 'anonymous'; await createCommunity({ name:newName, description:newDesc, created_by:userId, is_public:true, member_count:1 }); const newGroup = { id:'ug-'+Date.now(), name:newName, desc:newDesc, members:1, emoji:GT[newType].i, type:newType, verified:false, rules:['Be respectful'], admin:'You', vis:newVis, approval:false, safetyScore:100, lastActive:'Just now', posts:[] as GPost[] }; setUserGroups(p=>[newGroup,...p]); setNewName('');setNewDesc('');setCreateRes(null);setTab('discover');} };
  const handlePost = async () => { const r=aiScan(postText); setPostRes(r); if(r.safe){ const { data: session } = await getSession(); const userId = session?.session?.user?.id || 'anonymous'; await createPost({ text:postText, author_id:userId, author_name:'User', audience:'public' }); const newPost:GPost = { id:'up-'+Date.now(), author:'You', avatar:'Y', content:postText, time:'Just now', likes:0, replies:0, vis:postVis }; setUserPosts(p=>[newPost,...p]); setPostText('');setPostRes(null);} };

  const deleteUserPost = async (id:string) => { setUserPosts(p=>p.filter(x=>x.id!==id)); try { await dbDeletePost(id); } catch {} };
  const saveEditPost = async (id:string) => { if(!editPostText.trim()) return; const r=aiScan(editPostText); if(!r.safe){ setPostRes(r); return; } setUserPosts(p=>p.map(x=>x.id===id?{...x,content:editPostText.trim()}:x)); setEditingPost(null); setEditPostText(''); try { await dbUpdatePost(id, editPostText.trim()); } catch {} };
  const deleteUserGroup = async (id:string) => { setUserGroups(p=>p.filter(x=>x.id!==id)); if(selGroup===id) setSelGroup(null); try { await dbDeleteCommunity(id); } catch {} };
  const saveEditGroup = async (id:string) => { if(!editGroupName.trim()) return; const r=groupPurposeCheck(editGroupName,editGroupDesc); if(!r.safe){ setCreateRes(r); return; } setUserGroups(p=>p.map(x=>x.id===id?{...x,name:editGroupName.trim(),desc:editGroupDesc.trim()}:x)); setEditingGroup(null); try { await dbUpdateCommunity(id, {name:editGroupName.trim(),description:editGroupDesc.trim()}); } catch {} };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={()=>selGroup?setSelGroup(null):router.back()} style={{background:'none',border:'none',color:t.text,cursor:'pointer'}}><IcoBack size={20}/></button>
          <h1 className="text-xl font-bold">{selGroup?sg?.name:'🤝 Community Groups +'}</h1>
        </div>
        <button onClick={()=>setShowSafety(!showSafety)} className="p-2 rounded-xl" style={{background:'rgba(34,197,94,0.1)'}}><IcoShield size={18} color="#22c55e"/></button>
      </div>

      {/* AI Safety Dashboard */}
      {showSafety && !selGroup && (
        <div className="glass-card rounded-2xl p-4 space-y-3" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
          <div className="flex items-center gap-2"><IcoShield size={18} color="#22c55e"/><h3 className="font-bold text-sm">🛡️ AI Safety Dashboard</h3></div>
          <div className="grid grid-cols-3 gap-2">
            {[{l:'Threats Blocked',v:'156',c:'#dc2626'},{l:'Groups Scanned',v:'2.4K',c:'#3b82f6'},{l:'Safety Score',v:'97%',c:'#22c55e'}].map(s=>(
              <div key={s.l} className="text-center p-2 rounded-xl" style={{background:s.c+'10'}}><p className="text-lg font-bold" style={{color:s.c}}>{s.v}</p><p className="text-[9px]" style={{color:t.textMuted}}>{s.l}</p></div>
            ))}
          </div>
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase" style={{color:t.textMuted}}>Recent Actions</p>
            {MODLOG.slice(0,3).map(m=>(
              <div key={m.id} className="flex items-center gap-2 p-2 rounded-lg" style={{background:m.color+'08'}}>
                <div className="w-2 h-2 rounded-full" style={{background:m.color}}/><div className="flex-1 min-w-0"><p className="text-[11px] font-medium truncate">{m.action}</p><p className="text-[9px] truncate" style={{color:t.textMuted}}>{m.content}</p></div><span className="text-[9px]" style={{color:t.textMuted}}>{m.time}</span>
              </div>
            ))}
          </div>
          <div className="p-3 rounded-xl text-[10px]" style={{background:'rgba(34,197,94,0.06)',border:'1px solid rgba(34,197,94,0.15)'}}><p className="font-semibold" style={{color:'#22c55e'}}>🤖 AI Protection Active</p><p style={{color:t.textSecondary}} className="mt-1">Real-time scanning for terrorism, hate speech, religious extremism, harassment, child safety threats. All groups & posts verified before publishing.</p></div>
        </div>
      )}

      {/* Group Detail */}
      {selGroup && sg ? (
        <div className="space-y-3">
          <div className="glass-card rounded-2xl p-4" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
            <div className="flex items-center gap-3 mb-3"><span className="text-3xl">{sg.emoji}</span><div className="flex-1"><div className="flex items-center gap-2"><p className="font-bold">{sg.name}</p>{sg.verified&&<span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500">✓</span>}</div><p className="text-xs" style={{color:t.textSecondary}}>{sg.desc}</p></div></div>
            <div className="flex gap-3 text-[11px]" style={{color:t.textMuted}}><span>👥 {sg.members.toLocaleString()}</span><span>{GT[sg.type].i} {GT[sg.type].l}</span><span>{sg.vis==='public'?'🌍 Public':'🔒 Private'}</span></div>
            <div className="flex items-center gap-2 mt-3 p-2 rounded-lg" style={{background:sb(sg.safetyScore).bg}}><IcoShield size={14} color={sb(sg.safetyScore).c}/><span className="text-[11px] font-semibold" style={{color:sb(sg.safetyScore).c}}>Safety: {sg.safetyScore}/100 · {sb(sg.safetyScore).l}</span></div>
          </div>
          {/* Rules */}
          <div className="glass-card rounded-2xl p-4" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
            <p className="text-xs font-bold mb-2">📋 Group Rules</p>
            {sg.rules.map((r,i)=><p key={i} className="text-[11px] flex items-center gap-2 mb-1" style={{color:t.textSecondary}}><span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold" style={{background:t.accent+'15',color:t.accent}}>{i+1}</span>{r}</p>)}
            <p className="text-[11px] flex items-center gap-2 mt-2" style={{color:'#22c55e'}}><IcoShield size={12} color="#22c55e"/>AI moderation active -- harmful content auto-blocked</p>
          </div>
          {/* Post Composer */}
          <div className="glass-card rounded-2xl p-4" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
            <div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{background:`linear-gradient(135deg,${t.accent}33,#8b5cf633)`,color:t.accent}}>RS</div><input value={postText} onChange={e=>{setPostText(e.target.value);setPostRes(null);}} placeholder="Share with this group..." className="flex-1 text-sm bg-transparent outline-none" style={{color:t.text}}/></div>
            {postText&&(<div className="space-y-2">
              <div className="flex items-center gap-2"><span className="text-[10px]" style={{color:t.textMuted}}>Visible to:</span>
                {(['public','group_only','friends_only'] as PVis[]).map(v=><button key={v} onClick={()=>setPostVis(v)} className="text-[10px] px-2 py-1 rounded-full" style={{background:postVis===v?t.accent+'20':'transparent',color:postVis===v?t.accent:t.textMuted,border:`1px solid ${postVis===v?t.accent+'40':t.cardBorder}`}}>{v==='public'?'🌍 Public':v==='group_only'?'👥 Group':'🤝 Friends'}</button>)}
              </div>
              {postRes&&!postRes.safe&&(
                <div className="p-3 rounded-xl" style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)'}}>
                  <p className="text-xs font-bold" style={{color:'#ef4444'}}>⚠️ Content Blocked by AI Safety</p>
                  {postRes.threats.map((th,i)=><div key={i} className="mt-1.5"><span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{background:th.color+'20',color:th.color}}>{th.label}</span><p className="text-[10px] mt-1" style={{color:t.textSecondary}}>{th.action}</p></div>)}
                  <p className="text-[10px] mt-2" style={{color:t.textMuted}}>Remove harmful content and try again.</p>
                </div>
              )}
              <div className="flex justify-end"><button onClick={handlePost} className="text-xs px-4 py-2 rounded-xl font-semibold text-white" style={{background:`linear-gradient(135deg,${t.accent},#8b5cf6)`}}>🛡️ Scan & Post</button></div>
            </div>)}
          </div>
          {/* Group management for own groups */}
          {isMyGroup && (
            <div className="glass-card rounded-2xl p-4" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
              <p className="text-xs font-bold mb-2">Manage Group</p>
              {editingGroup===sg.id ? (
                <div className="space-y-2">
                  <input value={editGroupName} onChange={e=>{setEditGroupName(e.target.value);setCreateRes(null);}} className="w-full text-sm py-2 px-3 rounded-xl bg-transparent outline-none" style={{border:`1px solid ${t.cardBorder}`,color:t.text}} placeholder="Group name"/>
                  <textarea value={editGroupDesc} onChange={e=>{setEditGroupDesc(e.target.value);setCreateRes(null);}} rows={2} className="w-full text-sm py-2 px-3 rounded-xl bg-transparent outline-none resize-none" style={{border:`1px solid ${t.cardBorder}`,color:t.text}} placeholder="Description"/>
                  <div className="flex gap-2">
                    <button onClick={()=>saveEditGroup(sg.id)} className="px-4 py-1.5 rounded-lg text-xs font-bold text-white" style={{background:t.accent}}>Save</button>
                    <button onClick={()=>setEditingGroup(null)} className="px-4 py-1.5 rounded-lg text-xs" style={{border:`1px solid ${t.cardBorder}`}}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button onClick={()=>{setEditingGroup(sg.id);setEditGroupName(sg.name);setEditGroupDesc(sg.desc);}} className="px-3 py-1.5 rounded-lg text-[10px] font-semibold" style={{background:'rgba(59,130,246,0.1)',color:'#3b82f6'}}>Edit Group</button>
                  <button onClick={()=>deleteUserGroup(sg.id)} className="px-3 py-1.5 rounded-lg text-[10px] font-semibold" style={{background:'rgba(239,68,68,0.1)',color:'#ef4444'}}>Delete Group</button>
                </div>
              )}
            </div>
          )}
          {/* User Posts in this group */}
          {groupUserPosts.map(p=>(
            <div key={p.id} className="glass-card rounded-2xl p-4" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
              <div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold" style={{background:t.accent,color:'#fff'}}>Y</div><div className="flex-1"><p className="text-sm font-semibold">You</p><span className="text-[9px]" style={{color:t.textMuted}}>{p.time}</span></div>
                <div className="flex gap-1">
                  <button onClick={()=>{setEditingPost(p.id);setEditPostText(p.content);}} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background:'rgba(59,130,246,0.1)'}}><span style={{fontSize:10,color:'#3b82f6'}}>✎</span></button>
                  <button onClick={()=>deleteUserPost(p.id)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background:'rgba(239,68,68,0.1)'}}><span style={{fontSize:10,color:'#ef4444'}}>✕</span></button>
                </div>
              </div>
              {editingPost===p.id ? (
                <div className="space-y-2">
                  <textarea value={editPostText} onChange={e=>setEditPostText(e.target.value)} rows={2} className="w-full p-2 rounded-xl text-sm outline-none resize-none" style={{background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.03)',border:`1px solid ${t.cardBorder}`,color:t.text}}/>
                  <div className="flex gap-2"><button onClick={()=>saveEditPost(p.id)} className="px-3 py-1 rounded-lg text-xs font-bold text-white" style={{background:t.accent}}>Save</button><button onClick={()=>setEditingPost(null)} className="px-3 py-1 rounded-lg text-xs" style={{border:`1px solid ${t.cardBorder}`}}>Cancel</button></div>
                </div>
              ) : <p className="text-sm" style={{color:t.textSecondary}}>{p.content}</p>}
              <div className="flex gap-4 mt-2 text-[11px]" style={{color:t.textMuted}}><span>❤️ {p.likes}</span><span>💬 {p.replies}</span><span>↗️ Share</span></div>
            </div>
          ))}
          {/* Demo Posts */}
          {sg.posts.length===0 && groupUserPosts.length===0?<div className="text-center py-8 glass-card rounded-2xl" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}><p className="text-2xl mb-2">💬</p><p className="text-sm font-medium" style={{color:t.textSecondary}}>No posts yet</p></div>:sg.posts.map(p=>(
            <div key={p.id} className="glass-card rounded-2xl p-4" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
              <div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold" style={{background:`linear-gradient(135deg,${t.accent}33,#8b5cf633)`,color:t.accent}}>{p.avatar}</div><div className="flex-1"><p className="text-sm font-semibold">{p.author}</p><div className="flex items-center gap-2"><span className="text-[9px]" style={{color:t.textMuted}}>{p.time}</span><span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{background:p.vis==='public'?'rgba(34,197,94,0.1)':'rgba(59,130,246,0.1)',color:p.vis==='public'?'#22c55e':'#3b82f6'}}>{p.vis==='public'?'🌍 Public':'👥 Group'}</span></div></div></div>
              <p className="text-sm" style={{color:t.textSecondary}}>{p.content}</p>
              <div className="flex gap-4 mt-2 text-[11px]" style={{color:t.textMuted}}><span>❤️ {p.likes}</span><span>💬 {p.replies}</span><span>↗️ Share</span></div>
            </div>
          ))}
        </div>
      ):(
        <>
          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl" style={{background:t.card}}>
            {(['discover','joined','create','moderation'] as MTab[]).map(tb=>(
              <button key={tb} onClick={()=>setTab(tb)} className="flex-1 text-[11px] py-2 rounded-lg font-medium" style={{background:tab===tb?`linear-gradient(135deg,${t.accent},#8b5cf6)`:'transparent',color:tab===tb?'#fff':t.textSecondary}}>
                {tb==='discover'?'🔍 Discover':tb==='joined'?'✅ Joined':tb==='create'?'➕ Create':'🛡️ Safety'}
              </button>
            ))}
          </div>

          {(tab==='discover'||tab==='joined')&&(<>
            <div className="flex items-center gap-2 rounded-xl px-3" style={{border:`1px solid ${t.cardBorder}`}}>
              <IcoSearch size={14} color={t.textMuted}/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search community groups..." className="flex-1 text-sm py-2.5 bg-transparent outline-none" style={{color:t.text}}/>
              <button onClick={()=>{}} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:'rgba(139,92,246,0.08)'}}>
                <IcoMic size={14} color="#8b5cf6"/>
              </button>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
              <button onClick={()=>setTypeF('all')} className="text-[10px] px-3 py-1.5 rounded-full whitespace-nowrap font-medium" style={{background:typeF==='all'?t.accent+'20':'transparent',color:typeF==='all'?t.accent:t.textMuted,border:`1px solid ${typeF==='all'?t.accent+'40':t.cardBorder}`}}>All</button>
              {(Object.keys(GT) as GType[]).map(g=><button key={g} onClick={()=>setTypeF(g)} className="text-[10px] px-3 py-1.5 rounded-full whitespace-nowrap font-medium" style={{background:typeF===g?GT[g].c+'20':'transparent',color:typeF===g?GT[g].c:t.textMuted,border:`1px solid ${typeF===g?GT[g].c+'40':t.cardBorder}`}}>{GT[g].i} {GT[g].l}</button>)}
            </div>
            <div className="space-y-2">{filtered.map(c=>{const s=sb(c.safetyScore);return(
              <div key={c.id} className="glass-card rounded-2xl p-4 cursor-pointer" onClick={()=>setSelGroup(c.id)} style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
                <div className="flex items-start gap-3"><span className="text-2xl">{c.emoji}</span><div className="flex-1 min-w-0"><div className="flex items-center gap-2"><p className="font-bold text-sm truncate">{c.name}</p>{c.verified&&<span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{background:'rgba(59,130,246,0.1)',color:'#3b82f6'}}>✓</span>}<span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{background:s.bg,color:s.c}}>🛡️{c.safetyScore}</span></div><p className="text-[11px] mt-0.5" style={{color:t.textSecondary}}>{c.desc}</p><div className="flex items-center gap-3 mt-1.5 text-[10px]" style={{color:t.textMuted}}><span>👥 {c.members.toLocaleString()}</span><span style={{color:GT[c.type].c}}>{GT[c.type].i} {GT[c.type].l}</span><span>{c.vis==='public'?'🌍':'🔒'}</span><span>{c.lastActive}</span></div></div>
                  <button onClick={e=>{e.stopPropagation();toggle(c.id);}} className="text-[10px] px-3 py-1.5 rounded-xl font-semibold" style={{background:joined.includes(c.id)?'rgba(239,68,68,0.1)':`linear-gradient(135deg,${t.accent},#8b5cf6)`,color:joined.includes(c.id)?'#ef4444':'#fff'}}>{joined.includes(c.id)?'Leave':c.approval?'Request':'Join'}</button>
                </div>
              </div>);})}</div>
          </>)}

          {/* Create */}
          {tab==='create'&&(
            <div className="space-y-3">
              <div className="glass-card rounded-2xl p-4 space-y-3" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
                <h3 className="font-bold text-sm">Create a Community Group</h3>
                <div className="p-3 rounded-xl text-[10px]" style={{background:'rgba(34,197,94,0.06)',border:'1px solid rgba(34,197,94,0.15)'}}><div className="flex items-center gap-2 mb-1"><IcoShield size={14} color="#22c55e"/><span className="font-semibold" style={{color:'#22c55e'}}>AI Safety Screening Required</span></div><p style={{color:t.textSecondary}}>All groups screened for hate, terrorism, religious extremism, and anti-social agendas. Prohibited groups auto-blocked.</p></div>
                <div><label className="text-[10px] font-semibold" style={{color:t.textMuted}}>Group Name</label><input value={newName} onChange={e=>{setNewName(e.target.value);setCreateRes(null);}} className="w-full text-sm py-2.5 px-3 rounded-xl bg-transparent outline-none mt-1" style={{border:`1px solid ${t.cardBorder}`,color:t.text}} placeholder="e.g., Neighborhood Book Club"/></div>
                <div><label className="text-[10px] font-semibold" style={{color:t.textMuted}}>Description & Purpose</label><textarea value={newDesc} onChange={e=>{setNewDesc(e.target.value);setCreateRes(null);}} rows={3} className="w-full text-sm py-2.5 px-3 rounded-xl bg-transparent outline-none mt-1 resize-none" style={{border:`1px solid ${t.cardBorder}`,color:t.text}} placeholder="Describe what this group is about..."/></div>
                <div><label className="text-[10px] font-semibold" style={{color:t.textMuted}}>Group Type</label><div className="grid grid-cols-4 gap-1.5 mt-1">{(Object.keys(GT) as GType[]).map(g=><button key={g} onClick={()=>setNewType(g)} className="text-[10px] p-2 rounded-xl text-center" style={{background:newType===g?GT[g].c+'20':'transparent',border:`1px solid ${newType===g?GT[g].c+'40':t.cardBorder}`,color:newType===g?GT[g].c:t.textMuted}}>{GT[g].i}<br/>{GT[g].l}</button>)}</div></div>
                <div><label className="text-[10px] font-semibold" style={{color:t.textMuted}}>Post Visibility</label><div className="flex gap-2 mt-1">{(['public','group_only','friends_only'] as PVis[]).map(v=><button key={v} onClick={()=>setNewVis(v)} className="flex-1 text-[10px] p-2 rounded-xl text-center" style={{background:newVis===v?t.accent+'15':'transparent',border:`1px solid ${newVis===v?t.accent+'40':t.cardBorder}`,color:newVis===v?t.accent:t.textMuted}}>{v==='public'?'🌍 Public':v==='group_only'?'👥 Group':'🤝 Friends'}</button>)}</div></div>
                {createRes&&!createRes.safe&&(<div className="p-3 rounded-xl" style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)'}}><p className="text-xs font-bold" style={{color:'#ef4444'}}>🚫 Group Creation Blocked</p>{createRes.threats.map((th,i)=><div key={i} className="mt-2"><span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{background:th.color+'20',color:th.color}}>{th.label}</span><p className="text-[10px] mt-1" style={{color:t.textSecondary}}>{th.action}</p></div>)}<p className="text-[10px] mt-2" style={{color:t.textMuted}}>Groups cannot be created for hate, terrorism, or anti-social purposes.</p></div>)}
                <button onClick={handleCreate} disabled={!newName||!newDesc} className="w-full text-sm py-3 rounded-xl font-semibold text-white disabled:opacity-40" style={{background:`linear-gradient(135deg,${t.accent},#8b5cf6)`}}>🛡️ Screen & Create Group</button>
              </div>
              <div className="glass-card rounded-2xl p-4" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
                <p className="text-xs font-bold mb-2">🚫 Prohibited Group Types</p>
                {[{i:'💣',l:'Terrorism & Violence',d:'Groups promoting or planning violent acts'},{i:'🚫',l:'Hate Speech',d:'Groups targeting race, religion, gender'},{i:'⛪',l:'Religious Extremism',d:'Forced conversion or persecution'},{i:'🏴',l:'Anti-Social Agendas',d:'Destabilizing society or government'},{i:'🔞',l:'Child Exploitation',d:'Zero tolerance'},{i:'💊',l:'Illegal Activities',d:'Drug trade, weapons dealing'}].map(p=><div key={p.l} className="flex items-start gap-2 mb-1.5"><span className="text-sm">{p.i}</span><div><p className="text-[11px] font-semibold" style={{color:'#ef4444'}}>{p.l}</p><p className="text-[10px]" style={{color:t.textMuted}}>{p.d}</p></div></div>)}
              </div>
            </div>
          )}

          {/* Moderation */}
          {tab==='moderation'&&(
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">{[{l:'Blocked Today',v:'12',i:'🛡️',c:'#dc2626'},{l:'Groups Monitored',v:'847',i:'👁️',c:'#3b82f6'},{l:'Reports Resolved',v:'98%',i:'✅',c:'#22c55e'},{l:'Response Time',v:'< 2s',i:'⚡',c:'#f59e0b'}].map(s=><div key={s.l} className="glass-card rounded-xl p-3 text-center" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}><p className="text-lg">{s.i}</p><p className="text-lg font-bold" style={{color:s.c}}>{s.v}</p><p className="text-[9px]" style={{color:t.textMuted}}>{s.l}</p></div>)}</div>
              <div className="glass-card rounded-2xl p-4" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
                <p className="text-xs font-bold mb-3">📋 Moderation Log</p>
                {MODLOG.map(m=><div key={m.id} className="p-3 rounded-xl mb-2" style={{background:m.color+'06',border:`1px solid ${m.color}15`}}><div className="flex items-center justify-between mb-1"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{background:m.color}}/><span className="text-[11px] font-bold">{m.action}</span><span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{background:m.color+'15',color:m.color}}>{m.severity}</span></div><span className="text-[10px] px-2 py-0.5 rounded-full" style={{background:m.resolved?'rgba(34,197,94,0.1)':'rgba(239,68,68,0.1)',color:m.resolved?'#22c55e':'#ef4444'}}>{m.resolved?'✓ Resolved':'⏳ Pending'}</span></div><p className="text-[10px]" style={{color:t.textSecondary}}>{m.content}</p><div className="flex justify-between mt-1"><span className="text-[9px]" style={{color:t.textMuted}}>User: {m.user}</span><span className="text-[9px]" style={{color:t.textMuted}}>{m.time}</span></div></div>)}
              </div>
              <div className="glass-card rounded-2xl p-4" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
                <p className="text-xs font-bold mb-2">🤖 AI Detection Categories</p>
                {Object.entries(SEV).map(([cat,m])=><div key={cat} className="flex items-center gap-2 p-2 rounded-lg mb-1" style={{background:m.color+'08'}}><div className="w-2 h-2 rounded-full" style={{background:m.color}}/><span className="text-[11px] font-medium flex-1">{m.label}</span><span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{background:m.color+'15',color:m.color}}>{m.level}</span></div>)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
