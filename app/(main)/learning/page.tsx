"use client";
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { IcoBack, IcoSearch, IcoBookmark, IcoHeart, IcoStar, IcoMic, IcoGlobe } from '@/components/Icons';

type Section = 'library'|'local_news'|'intl_news'|'tech_science'|'history_geo'|'awards';
const SECTIONS:{key:Section;label:string;icon:string;color:string}[] = [
  {key:'library',label:'Library',icon:'📚',color:'#8b5cf6'},
  {key:'local_news',label:'News Local',icon:'📰',color:'#3b82f6'},
  {key:'intl_news',label:'News Intl',icon:'🌍',color:'#06b6d4'},
  {key:'tech_science',label:'Tech & Science',icon:'🔬',color:'#22c55e'},
  {key:'history_geo',label:'History & Geo',icon:'🏛️',color:'#f59e0b'},
  {key:'awards',label:'Awards',icon:'🏆',color:'#ef4444'},
];

const LIBRARY = [
  {id:'b1',title:'Introduction to Machine Learning',author:'Andrew Ng',type:'Course',duration:'40 hrs',rating:4.9,reviews:12500,img:'🤖',free:true,tags:['AI','ML','Python']},
  {id:'b2',title:'The Art of Electronics',author:'Horowitz & Hill',type:'eBook',duration:'890 pages',rating:4.8,reviews:3200,img:'⚡',free:false,tags:['Electronics','Engineering']},
  {id:'b3',title:'Sapiens: A Brief History',author:'Yuval Harari',type:'Audiobook',duration:'15h 17m',rating:4.7,reviews:45000,img:'🧬',free:false,tags:['History','Anthropology']},
  {id:'b4',title:'Python for Everybody',author:'Charles Severance',type:'Course',duration:'20 hrs',rating:4.8,reviews:8900,img:'🐍',free:true,tags:['Python','Coding','Beginner']},
  {id:'b5',title:'Cosmos: A Personal Voyage',author:'Carl Sagan',type:'Documentary',duration:'13 episodes',rating:4.9,reviews:7800,img:'🌌',free:true,tags:['Space','Science','Physics']},
  {id:'b6',title:'The Lean Startup',author:'Eric Ries',type:'eBook',duration:'320 pages',rating:4.5,reviews:28000,img:'🚀',free:false,tags:['Business','Startup','Innovation']},
  {id:'b7',title:'Robotics Fundamentals for Kids',author:'AARNAIT AI',type:'Interactive',duration:'12 modules',rating:4.9,reviews:450,img:'🤖',free:true,tags:['Robotics','STEM','Kids','Education']},
  {id:'b8',title:'Digital Photography Masterclass',author:'Phil Ebiner',type:'Video Course',duration:'25 hrs',rating:4.6,reviews:5600,img:'📷',free:false,tags:['Photography','Creative','Visual']},
];

const LOCAL_NEWS = [
  {id:'n1',title:'Toronto City Council Approves New Transit Expansion Plan',source:'Toronto Star',time:'2h ago',cat:'City',img:'🚇',breaking:true},
  {id:'n2',title:'GTA Housing Market Shows Signs of Recovery in March',source:'Globe & Mail',time:'4h ago',cat:'Real Estate',img:'🏠',breaking:false},
  {id:'n3',title:'Ontario Announces $500M STEM Education Initiative',source:'CBC Toronto',time:'6h ago',cat:'Education',img:'🎓',breaking:false},
  {id:'n4',title:'Brampton Tech Hub Opens Doors to 200 Startups',source:'Brampton Guardian',time:'8h ago',cat:'Business',img:'💼',breaking:false},
  {id:'n5',title:'Severe Weather Warning: Ice Storm Expected This Weekend',source:'Weather Network',time:'1h ago',cat:'Weather',img:'🌨️',breaking:true},
  {id:'n6',title:'Local Robotics Competition Winners Announced',source:'Mississauga News',time:'12h ago',cat:'Education',img:'🤖',breaking:false},
];

const INTL_NEWS = [
  {id:'in1',title:'AI Safety Summit Reaches Global Agreement on Guidelines',source:'Reuters',time:'1h ago',cat:'Technology',img:'🤖',region:'Global'},
  {id:'in2',title:'India Launches National Digital Education Platform',source:'Times of India',time:'3h ago',cat:'Education',img:'🇮🇳',region:'India'},
  {id:'in3',title:'EU Passes Landmark Climate Bill with 2035 Targets',source:'BBC',time:'5h ago',cat:'Environment',img:'🌍',region:'Europe'},
  {id:'in4',title:'SpaceX Successfully Tests Mars Habitat Module',source:'Space.com',time:'7h ago',cat:'Space',img:'🚀',region:'USA'},
  {id:'in5',title:'World Bank Reports Record Economic Growth in Southeast Asia',source:'Bloomberg',time:'10h ago',cat:'Economy',img:'📈',region:'Asia'},
  {id:'in6',title:'Nobel Committee Announces 2026 Nominations Shortlist',source:'AFP',time:'14h ago',cat:'Awards',img:'🏅',region:'Global'},
];

const TECH_SCIENCE = [
  {id:'ts1',title:'Quantum Computing Breakthrough: 1000-Qubit Processor',cat:'Quantum',source:'Nature',time:'3h ago',img:'⚛️'},
  {id:'ts2',title:'CRISPR Gene Therapy Shows Promise for Rare Diseases',cat:'Biotech',source:'Science Daily',time:'6h ago',img:'🧬'},
  {id:'ts3',title:'New Battery Technology Doubles EV Range',cat:'Energy',source:'MIT Tech Review',time:'8h ago',img:'🔋'},
  {id:'ts4',title:'James Webb Discovers New Earth-Like Exoplanets',cat:'Space',source:'NASA',time:'12h ago',img:'🔭'},
  {id:'ts5',title:'AI Model Achieves Human-Level Reasoning Scores',cat:'AI',source:'Arxiv',time:'1d ago',img:'🧠'},
  {id:'ts6',title:'Fusion Reactor Maintains Plasma for Record 30 Minutes',cat:'Physics',source:'ITER',time:'2d ago',img:'☀️'},
];

const HISTORY_GEO = [
  {id:'hg1',title:'The Rise and Fall of Ancient Rome',type:'Article Series',period:'753 BC – 476 AD',img:'🏛️',region:'Europe'},
  {id:'hg2',title:'Silk Road: Connecting Civilizations',type:'Interactive Map',period:'130 BC – 1453 AD',img:'🐪',region:'Asia'},
  {id:'hg3',title:'The Industrial Revolution',type:'Documentary',period:'1760 – 1840',img:'⚙️',region:'Europe'},
  {id:'hg4',title:'Geological Wonders of the World',type:'Photo Collection',period:'Current',img:'🌋',region:'Global'},
  {id:'hg5',title:'Ancient Indian Mathematics & Science',type:'Course',period:'3000 BC – 1200 AD',img:'🧮',region:'India'},
  {id:'hg6',title:'Great Canadian Geography: From Coast to Coast',type:'Interactive',period:'Current',img:'🍁',region:'Canada'},
];

const AWARDS_DATA = [
  {id:'aw1',title:'Nobel Prize in Physics 2025',winner:'Dr. Akira Tanaka',field:'Quantum Entanglement',img:'🏅',org:'Nobel Committee'},
  {id:'aw2',title:'Turing Award 2025',winner:'Dr. Yann LeCun & Team',field:'Deep Learning Foundations',img:'💻',org:'ACM'},
  {id:'aw3',title:'Fields Medal 2026 Nominees',winner:'Pending Announcement',field:'Mathematics',img:'🔢',org:'IMU'},
  {id:'aw4',title:'Pulitzer Prize for Journalism',winner:'Toronto Star Investigative Team',field:'Local Reporting',img:'📰',org:'Columbia University'},
  {id:'aw5',title:'Global Teacher Prize 2026',winner:'Nominations Open',field:'Education',img:'🎓',org:'Varkey Foundation'},
  {id:'aw6',title:'STEM Innovator of the Year',winner:'AARNAIT AI Programs',field:'EdTech',img:'🤖',org:'Canadian Innovation Awards'},
];

export default function LearningPage() {
  const router = useRouter();
  const {isDark,glassLevel,accentColor} = useThemeStore();
  const t = getTheme(isDark,glassLevel,accentColor);
  const [section,setSection] = useState<Section>('library');
  const [search,setSearch] = useState('');
  const [saved,setSaved] = useState<string[]>([]);
  const [voiceSrch,setVoiceSrch] = useState(false);
  const voiceS = () => { setVoiceSrch(true); setTimeout(()=>{setVoiceSrch(false);setSearch('robotics');},2000); };
  const toggleSave = (id:string) => setSaved(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="flex items-center gap-3"><button onClick={()=>router.back()} style={{background:'none',border:'none',color:t.text,cursor:'pointer'}}><IcoBack size={20}/></button><h1 className="text-xl font-bold flex-1">Learning</h1>
        <button onClick={voiceS} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:voiceSrch?'rgba(239,68,68,0.15)':'rgba(139,92,246,0.12)'}}><IcoMic size={16} color={voiceSrch?'#ef4444':'#8b5cf6'}/></button>
      </div>
      {voiceSrch&&<p className="text-[10px] text-center animate-pulse" style={{color:'#ef4444'}}>🎙️ Listening...</p>}

      <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}><IcoSearch size={14} color={t.textMuted}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search learning content..." className="flex-1 text-sm outline-none bg-transparent" style={{color:t.text}}/></div>

      {/* Section Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1" style={{scrollbarWidth:'none'}}>{SECTIONS.map(s=>(<button key={s.key} onClick={()=>setSection(s.key)} className="flex items-center gap-1 px-3 py-1.5 rounded-full whitespace-nowrap" style={{background:section===s.key?s.color+'20':t.card,color:section===s.key?s.color:t.textMuted,border:`1px solid ${section===s.key?s.color+'44':t.cardBorder}`,fontSize:10,fontWeight:600}}><span className="text-xs">{s.icon}</span>{s.label}</button>))}</div>

      {/* ═══ LIBRARY ═══ */}
      {section==='library'&&(<div className="space-y-2">
        <div className="flex gap-1">{['All','Course','eBook','Audiobook','Video Course','Interactive','Documentary'].map(f=>(<button key={f} className="px-2 py-0.5 rounded-lg text-[8px] font-medium" style={{background:t.card,color:t.textMuted}}>{f}</button>))}</div>
        {LIBRARY.filter(b=>!search||b.title.toLowerCase().includes(search.toLowerCase())||b.tags.some(tg=>tg.toLowerCase().includes(search.toLowerCase()))).map(b=>(
          <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{background:isDark?'rgba(139,92,246,0.12)':'rgba(139,92,246,0.08)'}}>{b.img}</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">{b.title}</p>
              <p className="text-[9px]" style={{color:t.textMuted}}>{b.author} · {b.type} · {b.duration}</p>
              <div className="flex items-center gap-2 mt-0.5"><span className="text-[9px]">⭐ {b.rating}</span><span className="text-[8px]" style={{color:t.textMuted}}>({(b.reviews/1000).toFixed(1)}K)</span>
                {b.free&&<span className="text-[8px] px-1.5 py-0.5 rounded-full" style={{background:'rgba(34,197,94,0.15)',color:'#22c55e',fontWeight:700}}>FREE</span>}
              </div>
              <div className="flex gap-0.5 mt-0.5">{b.tags.slice(0,3).map(tg=>(<span key={tg} className="text-[7px] px-1.5 py-0.5 rounded-full" style={{background:t.accent+'10',color:t.accent}}>{tg}</span>))}</div>
            </div>
            <button onClick={()=>toggleSave(b.id)} className="text-sm">{saved.includes(b.id)?'💾':'🤍'}</button>
          </div>
        ))}
      </div>)}

      {/* ═══ LOCAL NEWS ═══ */}
      {section==='local_news'&&(<div className="space-y-2">
        <p className="text-[9px]" style={{color:t.textMuted}}>📍 Showing news for Toronto, ON & GTA region</p>
        {LOCAL_NEWS.map(n=>(
          <div key={n.id} className="p-3 rounded-xl" style={{background:t.card,border:`1px solid ${n.breaking?'rgba(239,68,68,0.3)':t.cardBorder}`}}>
            <div className="flex items-start gap-2.5">
              <span className="text-2xl">{n.img}</span>
              <div className="flex-1">
                {n.breaking&&<span className="text-[7px] px-1.5 py-0.5 rounded bg-red-100 text-red-600 font-bold mb-1 inline-block">🔴 BREAKING</span>}
                <p className="text-xs font-bold">{n.title}</p>
                <p className="text-[9px] mt-0.5" style={{color:t.textMuted}}>{n.source} · {n.time} · {n.cat}</p>
              </div>
              <button onClick={()=>toggleSave(n.id)} className="text-sm">{saved.includes(n.id)?'💾':'🤍'}</button>
            </div>
          </div>
        ))}
      </div>)}

      {/* ═══ INTL NEWS ═══ */}
      {section==='intl_news'&&(<div className="space-y-2">
        <div className="flex gap-1">{['All','Global','India','Europe','USA','Asia'].map(r=>(<button key={r} className="px-2 py-0.5 rounded-lg text-[8px] font-medium" style={{background:t.card,color:t.textMuted}}>{r}</button>))}</div>
        {INTL_NEWS.map(n=>(
          <div key={n.id} className="p-3 rounded-xl" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
            <div className="flex items-start gap-2.5">
              <span className="text-2xl">{n.img}</span>
              <div className="flex-1">
                <p className="text-xs font-bold">{n.title}</p>
                <p className="text-[9px] mt-0.5" style={{color:t.textMuted}}>{n.source} · {n.time} · {n.region}</p>
              </div>
              <button onClick={()=>toggleSave(n.id)} className="text-sm">{saved.includes(n.id)?'💾':'🤍'}</button>
            </div>
          </div>
        ))}
      </div>)}

      {/* ═══ TECH & SCIENCE ═══ */}
      {section==='tech_science'&&(<div className="space-y-2">
        <div className="flex gap-1">{['All','AI','Quantum','Biotech','Space','Energy','Physics'].map(c=>(<button key={c} className="px-2 py-0.5 rounded-lg text-[8px] font-medium" style={{background:t.card,color:t.textMuted}}>{c}</button>))}</div>
        {TECH_SCIENCE.map(a=>(
          <div key={a.id} className="p-3 rounded-xl" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
            <div className="flex items-start gap-2.5">
              <span className="text-2xl">{a.img}</span>
              <div className="flex-1"><p className="text-xs font-bold">{a.title}</p><p className="text-[9px] mt-0.5" style={{color:t.textMuted}}>{a.source} · {a.time} · {a.cat}</p></div>
              <button onClick={()=>toggleSave(a.id)} className="text-sm">{saved.includes(a.id)?'💾':'🤍'}</button>
            </div>
          </div>
        ))}
      </div>)}

      {/* ═══ HISTORY & GEO ═══ */}
      {section==='history_geo'&&(<div className="space-y-2">
        {HISTORY_GEO.map(h=>(
          <div key={h.id} className="p-3 rounded-xl" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
            <div className="flex items-start gap-2.5">
              <span className="text-2xl">{h.img}</span>
              <div className="flex-1"><p className="text-xs font-bold">{h.title}</p><p className="text-[9px]" style={{color:t.textMuted}}>{h.type} · {h.period} · {h.region}</p></div>
              <button onClick={()=>toggleSave(h.id)} className="text-sm">{saved.includes(h.id)?'💾':'🤍'}</button>
            </div>
          </div>
        ))}
      </div>)}

      {/* ═══ AWARDS ═══ */}
      {section==='awards'&&(<div className="space-y-2">
        {AWARDS_DATA.map(a=>(
          <div key={a.id} className="p-3 rounded-xl" style={{background:`linear-gradient(135deg,${t.card},rgba(245,158,11,0.05))`,border:`1px solid ${t.cardBorder}`}}>
            <div className="flex items-start gap-2.5">
              <span className="text-2xl">{a.img}</span>
              <div className="flex-1"><p className="text-xs font-bold">{a.title}</p><p className="text-[10px] font-medium" style={{color:'#f59e0b'}}>{a.winner}</p><p className="text-[9px]" style={{color:t.textMuted}}>{a.field} · {a.org}</p></div>
            </div>
          </div>
        ))}
      </div>)}
    </div>
  );
}
