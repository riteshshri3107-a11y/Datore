"use client";
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { IcoBack, IcoSearch, IcoBookmark, IcoHeart, IcoStar, IcoMic, IcoGlobe } from '@/components/Icons';

/* CR-08 + CR-09: Added AI & Robotics and Tuition Classes sections */
type Section = 'library'|'ai_robotics'|'tuition'|'local_news'|'intl_news'|'tech_science'|'history_geo'|'awards';
const SECTIONS:{key:Section;label:string;icon:string;color:string}[] = [
  {key:'library',label:'Library',icon:'📚',color:'#8b5cf6'},
  {key:'ai_robotics',label:'AI & Robotics',icon:'🤖',color:'#6366f1'},
  {key:'tuition',label:'Tuition',icon:'🎓',color:'#3b82f6'},
  {key:'local_news',label:'News Local',icon:'📰',color:'#06b6d4'},
  {key:'intl_news',label:'News Intl',icon:'🌍',color:'#22c55e'},
  {key:'tech_science',label:'Tech & Science',icon:'🔬',color:'#f59e0b'},
  {key:'history_geo',label:'History & Geo',icon:'🏛️',color:'#ef4444'},
  {key:'awards',label:'Awards',icon:'🏆',color:'#ec4899'},
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

/* CR-08: AI & Robotics Classes — AARNAIT AI Curriculum */
type AgeGroup = 'all'|'3-6'|'7-10'|'11-14'|'professional'|'enterprise';
const AI_ROBOTICS_COURSES = [
  {id:'ai1',title:'Little Robot Builders',category:'Beginner Robotics',ageGroup:'3-6' as AgeGroup,level:'Beginner',instructor:'Dr. Meena Patel',duration:'8 weeks',price:'Free',img:'🤖',rating:4.9,enrolled:234,tags:['Robotics','STEM','Kids'],desc:'Hands-on intro to simple robots with blocks and sensors.'},
  {id:'ai2',title:'Code & Create: My First Robot',category:'Beginner Robotics',ageGroup:'3-6' as AgeGroup,level:'Beginner',instructor:'Sarah Thompson',duration:'6 weeks',price:'Free',img:'🧩',rating:4.8,enrolled:189,tags:['Coding','Blocks','Creativity'],desc:'Visual coding with drag-and-drop to make robots dance and sing.'},
  {id:'ai3',title:'STEM Robotics Explorer',category:'STEM Robotics',ageGroup:'7-10' as AgeGroup,level:'Intermediate',instructor:'Prof. Rajesh Kumar',duration:'12 weeks',price:'$49',img:'⚙️',rating:4.9,enrolled:456,tags:['STEM','Arduino','Sensors'],desc:'Build and program robots with Arduino, learn basic electronics.'},
  {id:'ai4',title:'Robotics Engineering Lab',category:'STEM Robotics',ageGroup:'7-10' as AgeGroup,level:'Intermediate',instructor:'Dr. Lisa Chen',duration:'10 weeks',price:'$39',img:'🔧',rating:4.7,enrolled:312,tags:['Engineering','Building','Mechanics'],desc:'Design, build, and test mechanical robots from scratch.'},
  {id:'ai5',title:'Advanced AI & Machine Learning',category:'Advanced AI',ageGroup:'11-14' as AgeGroup,level:'Advanced',instructor:'Prof. James Wilson',duration:'16 weeks',price:'$79',img:'🧠',rating:4.8,enrolled:178,tags:['AI','ML','Python','Neural Networks'],desc:'Dive deep into neural networks, computer vision, and NLP.'},
  {id:'ai6',title:'Autonomous Drone Programming',category:'Advanced AI',ageGroup:'11-14' as AgeGroup,level:'Advanced',instructor:'Dr. Alex Rivera',duration:'12 weeks',price:'$89',img:'🚁',rating:4.9,enrolled:134,tags:['Drones','Autonomy','Programming'],desc:'Program drones to navigate, avoid obstacles, and complete missions.'},
  {id:'ai7',title:'Professional AI/ML Engineering',category:'Professional AI/ML',ageGroup:'professional' as AgeGroup,level:'Professional',instructor:'Dr. Andrew Ng (AARNAIT)',duration:'24 weeks',price:'$299',img:'💻',rating:4.9,enrolled:890,tags:['TensorFlow','PyTorch','Production AI'],desc:'Industry-grade ML engineering: model training, deployment, and scaling.'},
  {id:'ai8',title:'Computer Vision & Deep Learning',category:'Professional AI/ML',ageGroup:'professional' as AgeGroup,level:'Professional',instructor:'Dr. Fei-Fei Li',duration:'20 weeks',price:'$249',img:'👁️',rating:4.8,enrolled:567,tags:['CV','Deep Learning','Research'],desc:'State-of-the-art computer vision: detection, segmentation, generation.'},
  {id:'ai9',title:'Enterprise AI Strategy & Implementation',category:'Enterprise AI',ageGroup:'enterprise' as AgeGroup,level:'Expert',instructor:'McKinsey AI Practice',duration:'8 weeks',price:'$499',img:'🏢',rating:4.7,enrolled:89,tags:['Enterprise','Strategy','ROI','Deployment'],desc:'Transform your organization with AI: strategy, use-cases, and deployment.'},
  {id:'ai10',title:'AI Ethics & Responsible Innovation',category:'Enterprise AI',ageGroup:'enterprise' as AgeGroup,level:'Expert',instructor:'Dr. Timnit Gebru',duration:'6 weeks',price:'$149',img:'⚖️',rating:4.9,enrolled:234,tags:['Ethics','Bias','Fairness','Governance'],desc:'Build responsible AI: bias detection, fairness metrics, and governance.'},
];

/* CR-09: Tuition Classes — National / International / Govt Jobs */
type TuitionCategory = 'national'|'international'|'govt';
type TuitionSubCategory = string;
const TUITION_STRUCTURE: {category:TuitionCategory;label:string;icon:string;color:string;subs:{key:string;label:string;courses:{id:string;title:string;instructor:string;duration:string;price:string;rating:number;enrolled:number;level:string;live?:boolean}[]}[]}[] = [
  {category:'national',label:'National Study',icon:'🇮🇳',color:'#FF9933',subs:[
    {key:'kg-5',label:'KG - Class 5 (Foundation)',courses:[
      {id:'tn1',title:'Foundation Math & English (KG-2)',instructor:'Mrs. Anita Gupta',duration:'Full Year',price:'$19/mo',rating:4.8,enrolled:890,level:'Foundation'},
      {id:'tn2',title:'Science Explorers (Class 3-5)',instructor:'Dr. Ravi Sharma',duration:'Full Year',price:'$24/mo',rating:4.7,enrolled:670,level:'Foundation'},
      {id:'tn3',title:'Hindi & Social Studies',instructor:'Mrs. Priya Singh',duration:'Full Year',price:'$19/mo',rating:4.6,enrolled:560,level:'Foundation'},
    ]},
    {key:'6-10',label:'Class 6-10 (Secondary)',courses:[
      {id:'tn4',title:'CBSE Class 10 Complete (Science+Math)',instructor:'Unacademy Faculty',duration:'1 Year',price:'$39/mo',rating:4.8,enrolled:2340,level:'Secondary'},
      {id:'tn5',title:'ICSE Board Preparation',instructor:'TopperNotes Team',duration:'1 Year',price:'$44/mo',rating:4.7,enrolled:1230,level:'Secondary'},
    ]},
    {key:'11-12',label:'Class 11-12 (Senior Secondary)',courses:[
      {id:'tn6',title:'Science Stream (PCM + PCB)',instructor:'Allen Institute',duration:'2 Years',price:'$59/mo',rating:4.9,enrolled:3450,level:'Senior',live:true},
      {id:'tn7',title:'Commerce (Accounts + Economics)',instructor:'CA Mohit Agarwal',duration:'2 Years',price:'$49/mo',rating:4.7,enrolled:1890,level:'Senior'},
      {id:'tn8',title:'Arts & Humanities',instructor:'Prof. Meera Nair',duration:'2 Years',price:'$39/mo',rating:4.6,enrolled:780,level:'Senior'},
    ]},
    {key:'engineering',label:'Engineering Entrance',courses:[
      {id:'tn9',title:'JEE Main + Advanced Complete',instructor:'Physics Wallah',duration:'2 Years',price:'$79/mo',rating:4.9,enrolled:8900,level:'Competitive',live:true},
      {id:'tn10',title:'BITSAT Crash Course',instructor:'FIITJEE Faculty',duration:'6 Months',price:'$49/mo',rating:4.7,enrolled:1200,level:'Competitive'},
      {id:'tn11',title:'State CET Preparation',instructor:'Regional Experts',duration:'1 Year',price:'$34/mo',rating:4.5,enrolled:3400,level:'Competitive'},
    ]},
    {key:'medical',label:'Medical Entrance',courses:[
      {id:'tn12',title:'NEET UG Complete Preparation',instructor:'Aakash Faculty',duration:'2 Years',price:'$69/mo',rating:4.9,enrolled:7800,level:'Competitive',live:true},
      {id:'tn13',title:'NEET PG + AIIMS',instructor:'Dr. Bhatia Medical',duration:'1 Year',price:'$89/mo',rating:4.8,enrolled:2300,level:'Competitive'},
    ]},
    {key:'competitive',label:'Other Competitive',courses:[
      {id:'tn14',title:'CLAT (Law) Preparation',instructor:'LegalEdge Faculty',duration:'1 Year',price:'$39/mo',rating:4.6,enrolled:890,level:'Competitive'},
      {id:'tn15',title:'NDA Written + SSB',instructor:'Defence Guru',duration:'1 Year',price:'$34/mo',rating:4.7,enrolled:1560,level:'Competitive'},
      {id:'tn16',title:'CA Foundation',instructor:'VSmart Academy',duration:'8 Months',price:'$49/mo',rating:4.8,enrolled:2100,level:'Competitive'},
    ]},
  ]},
  {category:'international',label:'International Study',icon:'🌍',color:'#3b82f6',subs:[
    {key:'sat-act',label:'SAT / ACT / AP',courses:[
      {id:'ti1',title:'SAT Complete (Math + Verbal)',instructor:'Khan Academy + Expert',duration:'6 Months',price:'$59/mo',rating:4.8,enrolled:4500,level:'Standardized'},
      {id:'ti2',title:'ACT Prep + AP Courses',instructor:'Princeton Review',duration:'4 Months',price:'$69/mo',rating:4.7,enrolled:2300,level:'Standardized'},
    ]},
    {key:'o-a-level',label:'O-Level / A-Level',courses:[
      {id:'ti3',title:'Cambridge O-Level Complete',instructor:'British Council Faculty',duration:'2 Years',price:'$49/mo',rating:4.8,enrolled:1890,level:'International'},
      {id:'ti4',title:'Edexcel A-Level (Sciences)',instructor:'UK Education Hub',duration:'2 Years',price:'$59/mo',rating:4.7,enrolled:1200,level:'International'},
    ]},
    {key:'ib',label:'IB (International Baccalaureate)',courses:[
      {id:'ti5',title:'IB Diploma Programme',instructor:'IB World Faculty',duration:'2 Years',price:'$79/mo',rating:4.9,enrolled:670,level:'International',live:true},
    ]},
    {key:'language',label:'Language Proficiency',courses:[
      {id:'ti6',title:'IELTS Complete (Band 7+)',instructor:'British Council',duration:'3 Months',price:'$49/mo',rating:4.8,enrolled:5600,level:'Proficiency',live:true},
      {id:'ti7',title:'TOEFL iBT Preparation',instructor:'ETS Official',duration:'3 Months',price:'$44/mo',rating:4.7,enrolled:3400,level:'Proficiency'},
      {id:'ti8',title:'Duolingo English Test Prep',instructor:'DET Expert',duration:'1 Month',price:'$29/mo',rating:4.6,enrolled:2100,level:'Proficiency'},
    ]},
    {key:'counselling',label:'Study Abroad Counselling',courses:[
      {id:'ti9',title:'Canada Study Visa + SOP',instructor:'IDP Education',duration:'Ongoing',price:'$99/session',rating:4.9,enrolled:890,level:'Counselling'},
      {id:'ti10',title:'USA/UK/Australia Applications',instructor:'Global Edu Advisors',duration:'Ongoing',price:'$149/session',rating:4.8,enrolled:560,level:'Counselling'},
    ]},
  ]},
  {category:'govt',label:'Government Jobs',icon:'🏛️',color:'#f59e0b',subs:[
    {key:'upsc',label:'UPSC (IAS / IPS / IFS)',courses:[
      {id:'tg1',title:'UPSC CSE Complete (Pre+Mains+Interview)',instructor:'Drishti IAS',duration:'2 Years',price:'$79/mo',rating:4.9,enrolled:6700,level:'Civil Services',live:true},
    ]},
    {key:'ssc',label:'SSC (CGL, CHSL, MTS)',courses:[
      {id:'tg2',title:'SSC CGL Complete',instructor:'Adda247 Faculty',duration:'1 Year',price:'$29/mo',rating:4.7,enrolled:12000,level:'SSC'},
      {id:'tg3',title:'SSC CHSL + MTS Combo',instructor:'Testbook Faculty',duration:'8 Months',price:'$24/mo',rating:4.6,enrolled:8900,level:'SSC'},
    ]},
    {key:'banking',label:'Banking (IBPS, SBI, RBI)',courses:[
      {id:'tg4',title:'IBPS PO + Clerk Complete',instructor:'Oliveboard Faculty',duration:'1 Year',price:'$34/mo',rating:4.8,enrolled:9800,level:'Banking',live:true},
      {id:'tg5',title:'SBI PO + RBI Grade B',instructor:'BankersAdda',duration:'1 Year',price:'$39/mo',rating:4.7,enrolled:5600,level:'Banking'},
    ]},
    {key:'railways',label:'Railways (RRB NTPC, Group D)',courses:[
      {id:'tg6',title:'RRB NTPC + Group D Complete',instructor:'Railway Experts',duration:'1 Year',price:'$24/mo',rating:4.6,enrolled:15000,level:'Railways'},
    ]},
    {key:'state',label:'State PSC / Police / Teachers',courses:[
      {id:'tg7',title:'State PSC General Preparation',instructor:'Regional Faculty',duration:'1 Year',price:'$29/mo',rating:4.5,enrolled:7800,level:'State Exams'},
      {id:'tg8',title:'Police & Teachers Exam',instructor:'Exam Specialists',duration:'8 Months',price:'$19/mo',rating:4.6,enrolled:6700,level:'State Exams'},
    ]},
    {key:'defence',label:'Defence (Army, Navy, Air Force)',courses:[
      {id:'tg9',title:'CDS + AFCAT + NDA',instructor:'Major Gen. (Retd) Bakshi',duration:'1 Year',price:'$34/mo',rating:4.8,enrolled:3400,level:'Defence',live:true},
    ]},
  ]},
];

export default function LearningPage() {
  const router = useRouter();
  const {isDark,glassLevel,accentColor} = useThemeStore();
  const t = getTheme(isDark,glassLevel,accentColor);
  const [section,setSection] = useState<Section>('library');
  const [search,setSearch] = useState('');
  const [saved,setSaved] = useState<string[]>([]);
  const [voiceSrch,setVoiceSrch] = useState(false);
  /* CR-08: AI & Robotics filters */
  const [aiAgeGroup,setAiAgeGroup] = useState<AgeGroup>('all');
  const [aiPriceFilter,setAiPriceFilter] = useState<'all'|'free'|'paid'>('all');
  /* CR-09: Tuition filters */
  const [tuitionCategory,setTuitionCategory] = useState<TuitionCategory>('national');
  const [tuitionSub,setTuitionSub] = useState<string>('');
  const [enrolledCourses,setEnrolledCourses] = useState<string[]>([]);
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

      {/* ═══ CR-08: AI & ROBOTICS ═══ */}
      {section==='ai_robotics'&&(<div className="space-y-3">
        <div className="p-3 rounded-xl" style={{background:'linear-gradient(135deg,rgba(99,102,241,0.08),rgba(139,92,246,0.05))',border:'1px solid rgba(99,102,241,0.15)'}}>
          <div className="flex items-center gap-2 mb-1"><span className="text-lg">🤖</span><h2 className="text-sm font-bold" style={{color:'#6366f1'}}>AI & Robotics Classes</h2></div>
          <p className="text-[9px]" style={{color:t.textMuted}}>AARNAIT AI certified curriculum for ages 3-14 and professionals</p>
        </div>

        {/* Age Group Filter */}
        <div>
          <p className="text-[9px] font-bold mb-1.5" style={{color:t.textMuted}}>FILTER BY AGE GROUP</p>
          <div className="flex gap-1.5 overflow-x-auto pb-1" style={{scrollbarWidth:'none'}}>
            {([{k:'all' as AgeGroup,l:'All'},{k:'3-6' as AgeGroup,l:'Ages 3-6'},{k:'7-10' as AgeGroup,l:'Ages 7-10'},{k:'11-14' as AgeGroup,l:'Ages 11-14'},{k:'professional' as AgeGroup,l:'Professional'},{k:'enterprise' as AgeGroup,l:'Enterprise'}]).map(f=>(
              <button key={f.k} onClick={()=>setAiAgeGroup(f.k)} className="px-3 py-1.5 rounded-full text-[9px] font-semibold whitespace-nowrap" style={{background:aiAgeGroup===f.k?'#6366f120':t.card,color:aiAgeGroup===f.k?'#6366f1':t.textMuted,border:`1px solid ${aiAgeGroup===f.k?'#6366f144':t.cardBorder}`}}>{f.l}</button>
            ))}
          </div>
        </div>

        {/* Price Filter */}
        <div className="flex gap-1.5">
          {([{k:'all' as const,l:'All'},{k:'free' as const,l:'Free Only'},{k:'paid' as const,l:'Paid'}]).map(f=>(
            <button key={f.k} onClick={()=>setAiPriceFilter(f.k)} className="px-3 py-1 rounded-lg text-[9px] font-medium" style={{background:aiPriceFilter===f.k?'#22c55e15':t.card,color:aiPriceFilter===f.k?'#22c55e':t.textMuted,border:`1px solid ${aiPriceFilter===f.k?'#22c55e44':t.cardBorder}`}}>{f.l}</button>
          ))}
        </div>

        {/* Course Cards */}
        {AI_ROBOTICS_COURSES.filter(c=>{
          if(aiAgeGroup!=='all'&&c.ageGroup!==aiAgeGroup) return false;
          if(aiPriceFilter==='free'&&c.price!=='Free') return false;
          if(aiPriceFilter==='paid'&&c.price==='Free') return false;
          if(search&&!c.title.toLowerCase().includes(search.toLowerCase())&&!c.tags.some(tg=>tg.toLowerCase().includes(search.toLowerCase()))) return false;
          return true;
        }).map(c=>(
          <div key={c.id} className="rounded-xl p-3" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{background:'rgba(99,102,241,0.08)'}}>{c.img}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold">{c.title}</p>
                <p className="text-[9px]" style={{color:t.textMuted}}>{c.instructor} · {c.duration} · {c.level}</p>
                <p className="text-[8px] mt-0.5" style={{color:t.textSecondary}}>{c.desc}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px]">⭐ {c.rating}</span>
                  <span className="text-[8px]" style={{color:t.textMuted}}>{c.enrolled} enrolled</span>
                  <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold" style={{background:c.price==='Free'?'rgba(34,197,94,0.15)':'rgba(99,102,241,0.12)',color:c.price==='Free'?'#22c55e':'#6366f1'}}>{c.price}</span>
                </div>
                <div className="flex gap-0.5 mt-1">{c.tags.map(tg=>(<span key={tg} className="text-[7px] px-1.5 py-0.5 rounded-full" style={{background:'#6366f110',color:'#6366f1'}}>{tg}</span>))}</div>
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <button onClick={()=>setEnrolledCourses(p=>p.includes(c.id)?p:([...p,c.id]))} className="flex-1 py-2 rounded-xl text-[10px] font-bold text-white" style={{background:enrolledCourses.includes(c.id)?'#22c55e':'linear-gradient(135deg,#6366f1,#8b5cf6)'}}>{enrolledCourses.includes(c.id)?'Enrolled ✓':'Enroll Now'}</button>
              <button className="px-4 py-2 rounded-xl text-[10px] font-medium" style={{border:`1px solid ${t.cardBorder}`,color:t.textMuted}}>Preview</button>
            </div>
          </div>
        ))}
      </div>)}

      {/* ═══ CR-09: TUITION CLASSES ═══ */}
      {section==='tuition'&&(<div className="space-y-3">
        <div className="p-3 rounded-xl" style={{background:'linear-gradient(135deg,rgba(59,130,246,0.08),rgba(139,92,246,0.05))',border:'1px solid rgba(59,130,246,0.15)'}}>
          <div className="flex items-center gap-2 mb-1"><span className="text-lg">🎓</span><h2 className="text-sm font-bold" style={{color:'#3b82f6'}}>Tuition Classes</h2></div>
          <p className="text-[9px]" style={{color:t.textMuted}}>National, International, and Government Job preparation courses</p>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-1.5">
          {TUITION_STRUCTURE.map(cat=>(
            <button key={cat.category} onClick={()=>{setTuitionCategory(cat.category);setTuitionSub('');}} className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl text-[10px] font-bold" style={{background:tuitionCategory===cat.category?cat.color+'15':t.card,color:tuitionCategory===cat.category?cat.color:t.textMuted,border:`1px solid ${tuitionCategory===cat.category?cat.color+'44':t.cardBorder}`}}>
              <span>{cat.icon}</span>{cat.label}
            </button>
          ))}
        </div>

        {/* Sub-category navigation */}
        {(()=>{
          const activeCat = TUITION_STRUCTURE.find(c=>c.category===tuitionCategory);
          if(!activeCat) return null;
          return (<>
            <div className="flex gap-1 overflow-x-auto pb-1" style={{scrollbarWidth:'none'}}>
              <button onClick={()=>setTuitionSub('')} className="px-3 py-1.5 rounded-full text-[9px] font-semibold whitespace-nowrap" style={{background:!tuitionSub?activeCat.color+'20':t.card,color:!tuitionSub?activeCat.color:t.textMuted,border:`1px solid ${!tuitionSub?activeCat.color+'44':t.cardBorder}`}}>All</button>
              {activeCat.subs.map(sub=>(
                <button key={sub.key} onClick={()=>setTuitionSub(sub.key)} className="px-3 py-1.5 rounded-full text-[9px] font-semibold whitespace-nowrap" style={{background:tuitionSub===sub.key?activeCat.color+'20':t.card,color:tuitionSub===sub.key?activeCat.color:t.textMuted,border:`1px solid ${tuitionSub===sub.key?activeCat.color+'44':t.cardBorder}`}}>{sub.label}</button>
              ))}
            </div>

            {/* Course listings */}
            {activeCat.subs.filter(sub=>!tuitionSub||sub.key===tuitionSub).map(sub=>(
              <div key={sub.key}>
                <h3 className="text-[10px] font-bold mb-1.5" style={{color:activeCat.color}}>{sub.label}</h3>
                <div className="space-y-2">
                  {sub.courses.filter(c=>!search||c.title.toLowerCase().includes(search.toLowerCase())).map(course=>(
                    <div key={course.id} className="rounded-xl p-3" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold">{course.title}</p>
                            {course.live&&<span className="text-[7px] px-1.5 py-0.5 rounded-full font-bold" style={{background:'rgba(239,68,68,0.15)',color:'#ef4444'}}>LIVE</span>}
                          </div>
                          <p className="text-[9px]" style={{color:t.textMuted}}>{course.instructor} · {course.duration} · {course.level}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px]">⭐ {course.rating}</span>
                            <span className="text-[8px]" style={{color:t.textMuted}}>{course.enrolled.toLocaleString()} enrolled</span>
                            <span className="text-[9px] font-bold" style={{color:'#22c55e'}}>{course.price}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <button onClick={()=>setEnrolledCourses(p=>p.includes(course.id)?p:([...p,course.id]))} className="px-4 py-2 rounded-xl text-[9px] font-bold text-white" style={{background:enrolledCourses.includes(course.id)?'#22c55e':`linear-gradient(135deg,${activeCat.color},#8b5cf6)`}}>{enrolledCourses.includes(course.id)?'Enrolled ✓':'Enroll'}</button>
                          <button className="px-4 py-1.5 rounded-xl text-[8px]" style={{border:`1px solid ${t.cardBorder}`,color:t.textMuted}}>Preview</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>);
        })()}
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
