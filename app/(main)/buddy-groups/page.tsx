"use client";
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { IcoBack, IcoSearch, IcoUser, IcoStar, IcoHeart, IcoShield, IcoSend, IcoMic } from '@/components/Icons';
import { getUserBuddyGroups, addUserBuddyGroup, deleteUserBuddyGroup, updateUserBuddyGroup, type StoredBuddyGroup } from '@/lib/demoData';

/* BR-96: MULTI-MODAL AI SAFETY ENGINE */
const TERROR_PAT = [
  /\b(terror|bomb|attack|shoot|weapon|recruit|radicali[sz])[\w]*\b.*\b(plan|target|mission|operation|infidel|kafir)[\w]*\b/i,
  /\b(jihad|crusade|ethnic[\s.-]?cleansing|genocide|holocaust[\s.-]?den)/i,
  /\b(race[\s.-]?war|holy[\s.-]?war|violent[\s.-]?overthrow|armed[\s.-]?resist|martyrdom[\s.-]?operat)/i,
  /\b(14[\s.-]?words|1488|heil|sieg|gas[\s.-]?the|hang[\s.-]?the|burn[\s.-]?the)/i,
  /\b(anti[\s.-]?government[\s.-]?militia|sovereign[\s.-]?citizen|boogaloo|accelerat)/i,
  /\b(isis|al[\s.-]?qaeda|boko[\s.-]?haram|kkk[\s.-]?recruit)/i,
  /\b(pipe[\s.-]?bomb|ied|dirty[\s.-]?bomb|anthrax|ricin|nerve[\s.-]?agent)/i,
  /\b(manifesto|final[\s.-]?solution|day[\s.-]?of[\s.-]?reckoning|purge[\s.-]?day)/i,
];
const HATE_PAT = [
  /\b(hate|kill|destroy|eliminate|exterminate)\b.*\b(race|religion|ethnic|jews|muslims|christians|hindus|blacks|whites|asians|lgbtq|gay|trans)\b/i,
  /\b(supremac|nazi|fascis|neo[\s.-]?nazi|white[\s.-]?nation|aryan)/i,
  /\b(anti[\s.-]?semit|islamophob|xenophob|homophob|transphob|white[\s.-]?power|blood[\s.-]?and[\s.-]?soil)/i,
  /\b(great[\s.-]?replacement|white[\s.-]?genocide|race[\s.-]?traitor)/i,
];
const RELIG_PAT = [
  /\b(only[\s.-]?true[\s.-]?faith|convert[\s.-]?or[\s.-]?die|infidel[\s.-]?must|kafir[\s.-]?must)/i,
  /\b(condemn[\s.-]?to[\s.-]?hell|burn[\s.-]?in[\s.-]?hell|sinners[\s.-]?must[\s.-]?die)/i,
  /\b(sharia[\s.-]?law[\s.-]?enforce|mandatory[\s.-]?prayer|enforce[\s.-]?religio|theocra)/i,
  /\b(blasphemy[\s.-]?punish|apostasy[\s.-]?death|heretic[\s.-]?burn)/i,
];
const ANTISOC_PAT = [
  /\b(scam|fraud|pyramid|ponzi|money[\s.-]?launder|illegal[\s.-]?scheme)/i,
  /\b(drug[\s.-]?deal|sell[\s.-]?drugs|narcotics|trafficking)/i,
  /\b(exploit|child[\s.-]?labor|human[\s.-]?traffic|slavery)/i,
  /\b(revenge[\s.-]?porn|non[\s.-]?consensual|intimate[\s.-]?image)/i,
  /\b(doxx|swat|harass|stalk|threaten|intimidat)\b.*\b(person|people|family|address|home)/i,
];
const MISINFO_PAT = [
  /\b(crisis[\s.-]?actor|false[\s.-]?flag|staged[\s.-]?shooting|fake[\s.-]?pandemic)/i,
  /\b(5g[\s.-]?cause|microchip[\s.-]?vaccine|flat[\s.-]?earth[\s.-]?prove)/i,
];

interface ModResult { safe:boolean; severity:'none'|'low'|'medium'|'high'|'critical'; riskScore:number; category:string; message:string; action:'allow'|'flag'|'block'|'block_and_report'; flagged?:string; ts:string; }
function moderate(text:string):ModResult {
  if(!text?.trim()) return {safe:true,severity:'none',riskScore:0,category:'',message:'',action:'allow',ts:new Date().toISOString()};
  for(const p of TERROR_PAT){const m=text.match(p);if(m) return {safe:false,severity:'critical',riskScore:95,category:'Terrorism & Violent Extremism',message:'BLOCKED: Terrorist ideology or recruitment detected. Auto-reported to safety team.',action:'block_and_report',flagged:m[0],ts:new Date().toISOString()};}
  for(const p of HATE_PAT){const m=text.match(p);if(m) return {safe:false,severity:'high',riskScore:85,category:'Hate Speech & Supremacism',message:'BLOCKED: Hate speech or racial supremacism detected.',action:'block_and_report',flagged:m[0],ts:new Date().toISOString()};}
  for(const p of RELIG_PAT){const m=text.match(p);if(m) return {safe:false,severity:'high',riskScore:75,category:'Religious Extremism',message:'BLOCKED: Forced religious conversion or extremist ideology detected.',action:'block',flagged:m[0],ts:new Date().toISOString()};}
  for(const p of ANTISOC_PAT){const m=text.match(p);if(m) return {safe:false,severity:'medium',riskScore:65,category:'Anti-Social Activity',message:'BLOCKED: Criminal or exploitation content detected.',action:'block',flagged:m[0],ts:new Date().toISOString()};}
  for(const p of MISINFO_PAT){const m=text.match(p);if(m) return {safe:false,severity:'low',riskScore:40,category:'Misinformation',message:'WARNING: Harmful misinformation flagged for review.',action:'flag',flagged:m[0],ts:new Date().toISOString()};}
  return {safe:true,severity:'none',riskScore:0,category:'',message:'',action:'allow',ts:new Date().toISOString()};
}

type Visibility = 'group_only'|'all_groups'|'friends'|'public'|'professional';
interface GPost { id:string; author:string; avatar:string; authorId:string; groupId:string; text:string; visibility:Visibility; visibleTo:string[]; likes:number; comments:number; time:string; liked:boolean; }
interface BGroup { id:string; name:string; desc:string; icon:string; members:number; memberList:{id:string;name:string;avatar:string;role:string}[]; cat:string; isOwner:boolean; joined:boolean; risk:number; createdBy:string; vis:'open'|'closed'|'invite_only'; rules:string[]; createdAt?:string; }

const GROUPS:BGroup[] = [
  {id:'g1',name:'Toronto Dog Walkers',desc:'Connect with local dog walking professionals',icon:'🐕',members:127,memberList:[{id:'u1',name:'Sarah M.',avatar:'SM',role:'admin'},{id:'u2',name:'James K.',avatar:'JK',role:'mod'},{id:'u3',name:'Priya S.',avatar:'PS',role:'member'}],cat:'Pets & Animals',isOwner:true,joined:true,risk:0,createdBy:'me',vis:'open',rules:['Be respectful','No spam']},
  {id:'g2',name:'Brampton Home Repair Hub',desc:'DIY and professional home tips',icon:'🔧',members:89,memberList:[{id:'u5',name:'Mike D.',avatar:'MD',role:'admin'}],cat:'Home Services',isOwner:false,joined:true,risk:0,createdBy:'Mike D.',vis:'open',rules:['Verified pros only']},
  {id:'g3',name:'Mississauga Tutors',desc:'K-12 tutoring professionals',icon:'📚',members:64,memberList:[{id:'u7',name:'Aisha R.',avatar:'AR',role:'admin'}],cat:'Education',isOwner:false,joined:true,risk:0,createdBy:'Aisha R.',vis:'closed',rules:['Education focused']},
  {id:'g4',name:'GTA Cleaners Co-op',desc:'House cleaners cooperative',icon:'🧹',members:156,memberList:[{id:'u9',name:'Rosa L.',avatar:'RL',role:'admin'}],cat:'Cleaning',isOwner:false,joined:false,risk:0,createdBy:'Rosa L.',vis:'open',rules:['Fair pricing']},
  {id:'g5',name:'Scarborough Parents',desc:'Parents network for childcare & events',icon:'👨‍👩‍👧‍👦',members:234,memberList:[{id:'u11',name:'Kim P.',avatar:'KP',role:'admin'}],cat:'Family',isOwner:false,joined:false,risk:0,createdBy:'Kim P.',vis:'closed',rules:['Family friendly']},
];

const POSTS:GPost[] = [
  {id:'p1',author:'Sarah M.',avatar:'SM',authorId:'u1',groupId:'g1',text:'Beautiful sunset walk at High Park! Anyone join Saturday? 🌅🐕',visibility:'group_only',visibleTo:['g1'],likes:23,comments:8,time:'2h ago',liked:false},
  {id:'p2',author:'Mike D.',avatar:'MD',authorId:'u5',groupId:'g2',text:'Pro tip: Turn off water main before replacing faucet! 💧🔧',visibility:'group_only',visibleTo:['g2'],likes:45,comments:12,time:'4h ago',liked:true},
  {id:'p3',author:'Aisha R.',avatar:'AR',authorId:'u7',groupId:'g3',text:'Free SAT prep resources for grade 11-12. DM for link! 📖',visibility:'group_only',visibleTo:['g3'],likes:67,comments:21,time:'1d ago',liked:false},
];

const CATS = ['All','Pets & Animals','Home Services','Education','Cleaning','Family','Technology','Sports','Creative Arts'];

export default function BuddyGroupsPage() {
  const router = useRouter();
  const {isDark,glassLevel,accentColor} = useThemeStore();
  const t = getTheme(isDark,glassLevel,accentColor);

  // BR-BG-001: Load user-created groups from localStorage and merge with defaults
  const loadGroups = (): BGroup[] => {
    const stored = getUserBuddyGroups();
    const userGroups: BGroup[] = stored.map(sg => ({
      id: sg.id, name: sg.name, desc: sg.desc, icon: sg.icon, members: sg.members,
      memberList: [{ id: 'me', name: 'You', avatar: 'ME', role: 'admin' }],
      cat: sg.cat, isOwner: sg.isOwner, joined: sg.joined, risk: 0,
      createdBy: sg.createdBy, vis: sg.vis, rules: [],
      createdAt: sg.createdAt,
    }));
    // Merge: user-created first, then defaults (avoid duplicates by id)
    const defaultIds = new Set(GROUPS.map(g => g.id));
    return [...userGroups.filter(g => !defaultIds.has(g.id)), ...GROUPS];
  };
  const [groups,setGroups] = useState<BGroup[]>(loadGroups);
  const [tab,setTab] = useState<'my'|'discover'|'safety'>('my');
  const [sel,setSel] = useState<BGroup|null>(null);
  const [search,setSearch] = useState('');
  const [catF,setCatF] = useState('All');
  const [showCreate,setShowCreate] = useState(false);
  const [nName,setNName] = useState(''); const [nDesc,setNDesc] = useState(''); const [nCat,setNCat] = useState(''); const [nVis,setNVis] = useState<'open'|'closed'|'invite_only'>('open');
  const [modAlert,setModAlert] = useState<ModResult|null>(null);
  const [postText,setPostText] = useState('');
  const [postVis,setPostVis] = useState<Visibility>('group_only');
  const [posts,setPosts] = useState<GPost[]>(POSTS);
  const [editing,setEditing] = useState<string|null>(null);
  const [eName,setEName] = useState(''); const [eDesc,setEDesc] = useState('');
  const [showMem,setShowMem] = useState(false);
  const [modLog,setModLog] = useState<ModResult[]>([]);
  const [voiceSrch,setVoiceSrch] = useState(false);
  const [createError,setCreateError] = useState('');
  const [showInvite,setShowInvite] = useState(false);
  const [inviteSearch,setInviteSearch] = useState('');
  const [invitedFriends,setInvitedFriends] = useState<string[]>([]);
  const [inviteSent,setInviteSent] = useState<string[]>([]);

  const my = groups.filter(g=>g.joined);
  const disc = groups.filter(g=>!g.joined);
  const list = (tab==='my'?my:disc).filter(g=>{
    const ms=!search||g.name.toLowerCase().includes(search.toLowerCase());
    const mc=catF==='All'||g.cat===catF; return ms&&mc;
  });

  const createGroup = () => {
    setCreateError('');
    if(!nName.trim()) { setCreateError('Please enter a group name'); return; }
    if(!nCat) { setCreateError('Please select a category'); return; }
    const nc=moderate(nName); const dc=moderate(nDesc);
    if(!nc.safe){setModAlert(nc);setModLog(p=>[nc,...p]);return;}
    if(!dc.safe){setModAlert(dc);setModLog(p=>[dc,...p]);return;}
    // BR-BG-001: Persist to localStorage so group survives refresh and is available for Buddy+ tagging
    const stored = addUserBuddyGroup({ name:nName.trim(), desc:nDesc.trim(), icon:'👥', cat:nCat, vis:nVis, createdBy:'You' });
    const newGroup: BGroup = { id:stored.id, name:stored.name, desc:stored.desc, icon:stored.icon, members:1, memberList:[{id:'me',name:'You',avatar:'ME',role:'admin'}], cat:nCat, isOwner:true, joined:true, risk:0, createdBy:'You', vis:nVis, rules:[], createdAt:stored.createdAt };
    setGroups(p=>[newGroup,...p]);
    setNName('');setNDesc('');setNCat('');setShowCreate(false);setCreateError('');
  };

  const addPost = (gid:string) => {
    if(!postText.trim()) return;
    const c=moderate(postText);
    if(!c.safe){setModAlert(c);setModLog(p=>[c,...p]);return;}
    setPosts(p=>[{id:`p${Date.now()}`,author:'You',avatar:'ME',authorId:'me',groupId:gid,text:postText.trim(),visibility:postVis,visibleTo:postVis==='group_only'?[gid]:postVis==='all_groups'?my.map(g=>g.id):[],likes:0,comments:0,time:'Just now',liked:false},...p]);
    setPostText('');
  };

  const delGroup = (gid:string) => { deleteUserBuddyGroup(gid); setGroups(p=>p.filter(g=>g.id!==gid)); setPosts(p=>p.filter(po=>po.groupId!==gid)); setSel(null); };
  const editGroup = (gid:string) => { const nc=moderate(eName); const dc=moderate(eDesc); if(!nc.safe){setModAlert(nc);return;} if(!dc.safe){setModAlert(dc);return;} updateUserBuddyGroup(gid,{name:eName||undefined,desc:eDesc||undefined}); setGroups(p=>p.map(g=>g.id===gid?{...g,name:eName||g.name,desc:eDesc||g.desc}:g)); setEditing(null); };
  const delPost = (pid:string) => setPosts(p=>p.filter(po=>po.id!==pid));
  const voiceS = () => { setVoiceSrch(true); setTimeout(()=>{setSearch('home repair');setVoiceSrch(false);},2000); };

  const FRIENDS_LIST = [
    {id:'f1',name:'Alex Johnson',avatar:'AJ'},{id:'f2',name:'Maria Garcia',avatar:'MG'},{id:'f3',name:'David Kim',avatar:'DK'},
    {id:'f4',name:'Emma Wilson',avatar:'EW'},{id:'f5',name:'Raj Patel',avatar:'RP'},{id:'f6',name:'Sophia Lee',avatar:'SL'},
    {id:'f7',name:'Liam Brown',avatar:'LB'},{id:'f8',name:'Olivia Chen',avatar:'OC'},{id:'f9',name:'Noah Davis',avatar:'ND'},
  ];
  const filteredFriends = FRIENDS_LIST.filter(f => !inviteSearch || f.name.toLowerCase().includes(inviteSearch.toLowerCase()));
  const sendInvite = (fid:string) => { setInviteSent(p=>[...p,fid]); };

  const rc = (s:number) => s>=70?'#ef4444':s>=40?'#f59e0b':'#22c55e';
  const sb = (s:string) => s==='critical'?'rgba(239,68,68,0.12)':s==='high'?'rgba(249,115,22,0.12)':'rgba(245,158,11,0.12)';

  // GROUP DETAIL
  if(sel) {
    const sg = groups.find(g=>g.id===sel.id)||sel;
    const gp = posts.filter(p=>p.groupId===sg.id||(p.visibility==='all_groups'&&p.visibleTo.includes(sg.id)));
    return (
      <div className="space-y-3 animate-fade-in">
        <div className="flex items-center gap-3">
          <button onClick={()=>{setSel(null);setShowMem(false);setEditing(null);}} style={{background:'none',border:'none',color:t.text,cursor:'pointer'}}><IcoBack size={20}/></button>
          <div className="flex-1"><h1 className="text-lg font-bold">{sg.icon} {sg.name}</h1><p className="text-[10px]" style={{color:t.textMuted}}>{sg.members} members · {sg.cat} · {sg.vis}</p></div>
          {sg.isOwner && <div className="flex gap-1"><button onClick={()=>{setEditing(sg.id);setEName(sg.name);setEDesc(sg.desc);}} className="px-2 py-1 rounded text-[10px] font-medium" style={{background:'rgba(59,130,246,0.15)',color:'#3b82f6'}}>Edit</button><button onClick={()=>delGroup(sg.id)} className="px-2 py-1 rounded text-[10px] font-medium" style={{background:'rgba(239,68,68,0.15)',color:'#ef4444'}}>Delete</button></div>}
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg" style={{background:rc(sg.risk)+'15'}}><IcoShield size={14} color={rc(sg.risk)}/><span className="text-[10px] font-medium" style={{color:rc(sg.risk)}}>Safety: {100-sg.risk}/100 · AI-monitored</span></div>
        {editing===sg.id && (
          <div className="p-3 rounded-xl space-y-2" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
            <input value={eName} onChange={e=>setEName(e.target.value)} className="w-full p-2 rounded-lg text-sm" style={{background:t.bg,color:t.text,border:`1px solid ${t.cardBorder}`}} placeholder="Name"/>
            <textarea value={eDesc} onChange={e=>setEDesc(e.target.value)} rows={2} className="w-full p-2 rounded-lg text-sm" style={{background:t.bg,color:t.text,border:`1px solid ${t.cardBorder}`}} placeholder="Description"/>
            <div className="flex gap-2"><button onClick={()=>editGroup(sg.id)} className="px-4 py-1.5 rounded-lg text-xs font-bold text-white" style={{background:t.accent}}>Save</button><button onClick={()=>setEditing(null)} className="px-4 py-1.5 rounded-lg text-xs" style={{background:t.cardBorder}}>Cancel</button></div>
          </div>
        )}
        <div className="flex gap-2">
          <button onClick={()=>setShowMem(!showMem)} className="flex-1 text-left p-2 rounded-lg text-xs font-medium" style={{background:t.card}}>👥 {showMem?'Hide':'Show'} Members ({sg.memberList.length})</button>
          <button onClick={()=>setShowInvite(true)} className="px-3 py-2 rounded-lg text-xs font-medium" style={{background:'rgba(139,92,246,0.15)',color:'#8b5cf6'}}>✉️ Invite</button>
        </div>
        {showMem && sg.memberList.map(m=>(
          <div key={m.id} className="flex items-center gap-2 p-2 rounded-lg" style={{background:t.card}}><div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{background:t.accent}}>{m.avatar}</div><span className="text-sm flex-1">{m.name}</span><span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{background:m.role==='admin'?'rgba(239,68,68,0.15)':m.role==='mod'?'rgba(59,130,246,0.15)':'rgba(156,163,175,0.15)',color:m.role==='admin'?'#ef4444':m.role==='mod'?'#3b82f6':t.textMuted}}>{m.role}</span></div>
        ))}
        {/* BR-97: Post with visibility */}
        <div className="p-3 rounded-xl space-y-2" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
          <textarea value={postText} onChange={e=>setPostText(e.target.value)} placeholder="Share with this group..." rows={2} className="w-full p-2 rounded-lg text-sm" style={{background:t.bg,color:t.text,border:`1px solid ${t.cardBorder}`}}/>
          <div className="flex items-center justify-between">
            <div className="flex gap-1 flex-wrap">{(['group_only','all_groups','friends','public','professional'] as Visibility[]).map(v=>(
              <button key={v} onClick={()=>setPostVis(v)} className="px-2 py-0.5 rounded-full text-[9px] font-medium" style={{background:postVis===v?t.accent+'20':'transparent',color:postVis===v?t.accent:t.textMuted,border:`1px solid ${postVis===v?t.accent:t.cardBorder}`}}>
                {v==='group_only'?'🔒 Group':v==='all_groups'?'👥 All Groups':v==='friends'?'💛 Friends':v==='professional'?'💼 Professional':'🌐 Public'}
              </button>))}
            </div>
            <button onClick={()=>addPost(sg.id)} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{background:t.accent}}>Post</button>
          </div>
        </div>
        {gp.length===0&&<p className="text-center text-sm py-6" style={{color:t.textMuted}}>No posts yet</p>}
        {gp.map(po=>(
          <div key={po.id} className="p-3 rounded-xl space-y-2" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
            <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{background:t.accent}}>{po.avatar}</div><div className="flex-1"><p className="text-sm font-semibold">{po.author}</p><p className="text-[9px]" style={{color:t.textMuted}}>{po.time} · {po.visibility==='group_only'?'🔒 Group':po.visibility==='all_groups'?'👥 All Groups':po.visibility==='friends'?'💛 Friends':po.visibility==='professional'?'💼 Pro':'🌐 Public'}</p></div>
            {po.authorId==='me'&&<button onClick={()=>delPost(po.id)} className="text-[9px] px-2 py-0.5 rounded" style={{color:'#ef4444',background:'rgba(239,68,68,0.1)'}}>Delete</button>}</div>
            <p className="text-sm">{po.text}</p>
            <div className="flex gap-4 text-xs" style={{color:t.textMuted}}><button onClick={()=>setPosts(p=>p.map(x=>x.id===po.id?{...x,liked:!x.liked,likes:x.liked?x.likes-1:x.likes+1}:x))} className="flex items-center gap-1"><IcoHeart size={12} color={po.liked?'#ef4444':t.textMuted}/> {po.likes}</button><span>💬 {po.comments}</span></div>
          </div>
        ))}
      </div>
    );
  }

  // MAIN
  return (
    <div className="space-y-3 animate-fade-in">
      <div className="flex items-center gap-3"><button onClick={()=>router.back()} style={{background:'none',border:'none',color:t.text,cursor:'pointer'}}><IcoBack size={20}/></button><h1 className="text-xl font-bold flex-1">Buddy Groups</h1><button onClick={()=>setShowCreate(true)} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{background:t.accent}}>+ Create</button></div>
      {modAlert&&!modAlert.safe&&(
        <div className="p-3 rounded-xl space-y-1" style={{background:sb(modAlert.severity),border:`1px solid ${modAlert.severity==='critical'?'#ef4444':'#f59e0b'}40`}}>
          <div className="flex items-center gap-2"><span>🛡️</span><span className="text-xs font-bold" style={{color:modAlert.severity==='critical'?'#ef4444':'#f59e0b'}}>{modAlert.severity.toUpperCase()} -- {modAlert.category}</span></div>
          <p className="text-xs">{modAlert.message}</p>
          <p className="text-[9px]" style={{color:t.textMuted}}>Risk: {modAlert.riskScore}/100 · Action: {modAlert.action.replace(/_/g,' ')}</p>
          <button onClick={()=>setModAlert(null)} className="text-[9px] underline" style={{color:t.textMuted}}>Dismiss</button>
        </div>
      )}
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 p-2 rounded-xl" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}><IcoSearch size={14} color={t.textMuted}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search groups..." className="flex-1 text-sm bg-transparent outline-none" style={{color:t.text}}/></div>
        <button onClick={voiceS} className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:voiceSrch?'rgba(239,68,68,0.15)':t.card,border:`1px solid ${t.cardBorder}`}}><IcoMic size={16} color={voiceSrch?'#ef4444':t.textMuted}/></button>
      </div>
      {voiceSrch&&<p className="text-xs text-center animate-pulse" style={{color:'#ef4444'}}>🎙️ Listening...</p>}
      <div className="flex gap-1 p-1 rounded-xl" style={{background:t.card}}>{(['my','discover','safety'] as const).map(tb=>(
        <button key={tb} onClick={()=>setTab(tb)} className="flex-1 py-2 rounded-lg text-xs font-semibold" style={{background:tab===tb?t.accent:'transparent',color:tab===tb?'#fff':t.textMuted}}>{tb==='my'?'👥 My Groups':tb==='discover'?'🔍 Discover':'🛡️ Safety'}</button>
      ))}</div>
      {tab!=='safety'&&<div className="flex gap-1 overflow-x-auto pb-1" style={{scrollbarWidth:'none'}}>{CATS.map(c=>(
        <button key={c} onClick={()=>setCatF(c)} className="px-3 py-1 rounded-full text-[10px] font-medium whitespace-nowrap" style={{background:catF===c?t.accent+'20':t.card,color:catF===c?t.accent:t.textMuted,border:`1px solid ${catF===c?t.accent:t.cardBorder}`}}>{c}</button>
      ))}</div>}
      {showCreate&&(
        <div className="p-3 rounded-xl space-y-2" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
          <h3 className="text-sm font-bold">Create Buddy Group</h3>
          <p className="text-[9px]" style={{color:t.textMuted}}>🛡️ AI monitors all content. No hate speech, terrorism, religious extremism, or anti-social agendas.</p>
          <input value={nName} onChange={e=>setNName(e.target.value)} placeholder="Group name" className="w-full p-2 rounded-lg text-sm" style={{background:t.bg,color:t.text,border:`1px solid ${t.cardBorder}`}}/>
          <textarea value={nDesc} onChange={e=>setNDesc(e.target.value)} placeholder="Description (AI-scanned)" rows={2} className="w-full p-2 rounded-lg text-sm" style={{background:t.bg,color:t.text,border:`1px solid ${t.cardBorder}`}}/>
          <select value={nCat} onChange={e=>setNCat(e.target.value)} className="w-full p-2 rounded-lg text-sm" style={{background:t.bg,color:t.text,border:`1px solid ${t.cardBorder}`}}><option value="">Category</option>{CATS.filter(c=>c!=='All').map(c=><option key={c} value={c}>{c}</option>)}</select>
          <div className="flex gap-2">{(['open','closed','invite_only'] as const).map(v=>(<button key={v} onClick={()=>{setNVis(v);if(v==='invite_only')setShowInvite(true);}} className="px-3 py-1 rounded-lg text-xs font-medium" style={{background:nVis===v?t.accent+'20':'transparent',color:nVis===v?t.accent:t.textMuted,border:`1px solid ${nVis===v?t.accent:t.cardBorder}`}}>{v==='open'?'🌐 Open':v==='closed'?'🔒 Closed':'✉️ Invite'}</button>))}</div>
          {nVis==='invite_only'&&<button onClick={()=>setShowInvite(true)} className="w-full py-1.5 rounded-lg text-xs font-medium" style={{background:'rgba(139,92,246,0.1)',color:'#8b5cf6',border:'1px solid rgba(139,92,246,0.3)'}}>👥 Invite Friends ({invitedFriends.length} selected)</button>}
          {createError && <p className="text-[10px] font-semibold" style={{color:'#ef4444'}}>⚠️ {createError}</p>}
          <div className="flex gap-2"><button onClick={createGroup} className="flex-1 py-2 rounded-lg text-xs font-bold text-white" style={{background:t.accent}}>Create</button><button onClick={()=>{setShowCreate(false);setCreateError('');}} className="px-4 py-2 rounded-lg text-xs" style={{background:t.cardBorder}}>Cancel</button></div>
        </div>
      )}
      {tab==='safety'&&(
        <div className="space-y-2">
          <div className="p-3 rounded-xl" style={{background:'rgba(34,197,94,0.08)',border:'1px solid rgba(34,197,94,0.2)'}}>
            <p className="text-xs font-semibold" style={{color:'#22c55e'}}>🛡️ AI Safety Engine Active</p>
            <p className="text-[9px] mt-1" style={{color:t.textMuted}}>Multi-modal: NLP text analysis, behavioral anomaly detection, visual scanning, real-time risk scoring</p>
            <div className="flex gap-4 mt-2">
              <div className="text-center"><p className="text-lg font-bold" style={{color:'#22c55e'}}>{modLog.filter(m=>m.action==='block_and_report').length}</p><p className="text-[9px]" style={{color:t.textMuted}}>Blocked</p></div>
              <div className="text-center"><p className="text-lg font-bold" style={{color:'#f59e0b'}}>{modLog.filter(m=>m.action==='flag').length}</p><p className="text-[9px]" style={{color:t.textMuted}}>Flagged</p></div>
              <div className="text-center"><p className="text-lg font-bold" style={{color:'#3b82f6'}}>{posts.length}</p><p className="text-[9px]" style={{color:t.textMuted}}>Scanned</p></div>
            </div>
          </div>
          {modLog.length===0&&<p className="text-center text-xs py-4" style={{color:t.textMuted}}>No incidents. All content safe! ✅</p>}
          {modLog.map((l,i)=>(<div key={i} className="p-3 rounded-xl" style={{background:sb(l.severity)}}><span className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white" style={{background:l.severity==='critical'?'#ef4444':'#f59e0b'}}>{l.severity.toUpperCase()}</span><span className="text-xs font-semibold ml-2">{l.category}</span><p className="text-[9px] mt-1">{l.message}</p><p className="text-[9px]" style={{color:t.textMuted}}>Risk: {l.riskScore}/100</p></div>))}
        </div>
      )}
      {tab!=='safety'&&(
        <div className="space-y-2">
          {list.length===0&&<p className="text-center text-sm py-8" style={{color:t.textMuted}}>No groups found</p>}
          {list.map(g=>(
            <button key={g.id} onClick={()=>setSel(g)} className="w-full text-left p-3 rounded-xl" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{g.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1"><p className="text-sm font-semibold truncate">{g.name}</p>{g.isOwner&&<span className="text-[8px] px-1 py-0.5 rounded bg-yellow-100 text-yellow-700">Owner</span>}<span className="text-[8px] px-1 py-0.5 rounded" style={{background:g.vis==='open'?'rgba(34,197,94,0.15)':'rgba(139,92,246,0.15)',color:g.vis==='open'?'#22c55e':'#8b5cf6'}}>{g.vis}</span></div>
                  <p className="text-[10px] truncate" style={{color:t.textMuted}}>{g.desc}</p>
                  <div className="flex gap-3 mt-1"><span className="text-[9px]" style={{color:t.textMuted}}>👥 {g.members}</span><span className="text-[9px]" style={{color:t.textMuted}}>📁 {g.cat}</span><span className="text-[9px]" style={{color:t.textMuted}}>by {g.createdBy}</span>{g.createdAt&&<span className="text-[9px]" style={{color:t.textMuted}}>{new Date(g.createdAt).toLocaleDateString()}</span>}<span className="text-[9px]" style={{color:rc(g.risk)}}>🛡️ {100-g.risk}%</span></div>
                </div>
                {!g.joined&&<button onClick={e=>{e.stopPropagation();setGroups(p=>p.map(gr=>gr.id===g.id?{...gr,joined:true,members:gr.members+1}:gr));}} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{background:t.accent}}>Join</button>}
              </div>
            </button>
          ))}
        </div>
      )}
      {/* Invite Friends Modal */}
      {showInvite&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:16}} onClick={()=>setShowInvite(false)}>
          <div onClick={e=>e.stopPropagation()} className="w-full max-w-sm rounded-2xl p-4 space-y-3" style={{background:isDark?'#1a1a2e':'#fff',border:`1px solid ${t.cardBorder}`}}>
            <div className="flex items-center justify-between"><h3 className="font-bold text-sm">Invite Friends</h3><button onClick={()=>setShowInvite(false)} className="text-xs" style={{color:t.textMuted}}>✕</button></div>
            <div className="flex items-center gap-2 p-2 rounded-xl" style={{background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)',border:`1px solid ${t.cardBorder}`}}>
              <IcoSearch size={14} color={t.textMuted}/><input value={inviteSearch} onChange={e=>setInviteSearch(e.target.value)} placeholder="Search friends..." className="flex-1 text-sm bg-transparent outline-none" style={{color:t.text}}/>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-1">
              {filteredFriends.map(f=>{
                const invited=invitedFriends.includes(f.id);
                const sent=inviteSent.includes(f.id);
                return(
                  <div key={f.id} className="flex items-center gap-2 p-2 rounded-lg" style={{background:invited?'rgba(139,92,246,0.08)':'transparent'}}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{background:t.accent}}>{f.avatar}</div>
                    <span className="flex-1 text-sm font-medium">{f.name}</span>
                    {sent?(
                      <span className="text-[10px] px-2 py-1 rounded-lg font-medium" style={{color:'#22c55e'}}>✓ Sent</span>
                    ):(
                      <button onClick={()=>{if(invited){setInvitedFriends(p=>p.filter(x=>x!==f.id));}else{setInvitedFriends(p=>[...p,f.id]);}}} className="text-[10px] px-2 py-1 rounded-lg font-medium" style={{background:invited?'rgba(239,68,68,0.1)':'rgba(139,92,246,0.15)',color:invited?'#ef4444':'#8b5cf6'}}>{invited?'Remove':'+ Add'}</button>
                    )}
                  </div>
                );
              })}
            </div>
            {invitedFriends.length>0&&!invitedFriends.every(id=>inviteSent.includes(id))&&(
              <button onClick={()=>{invitedFriends.forEach(id=>sendInvite(id));}} className="w-full py-2 rounded-xl text-xs font-bold text-white" style={{background:t.accent}}>
                <IcoSend size={12}/> Send Invites ({invitedFriends.filter(id=>!inviteSent.includes(id)).length})
              </button>
            )}
            {invitedFriends.length>0&&invitedFriends.every(id=>inviteSent.includes(id))&&(
              <p className="text-center text-xs font-medium" style={{color:'#22c55e'}}>✓ All invites sent!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
