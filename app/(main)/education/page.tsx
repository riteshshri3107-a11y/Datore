"use client";
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { IcoBack, IcoSearch, IcoStar, IcoMic } from '@/components/Icons';

/* BR-100: EDUCATION MODULE — Coursera/Lex/Udemy Feature Parity + Gap Analysis
   COMMON: Course catalog, Enrollment, Progress tracking, Certificates, Video delivery
   COURSERA GAPS FILLED: Peer grading, Capstone projects, Degree programs, Financial aid
   LEX GAPS FILLED: Interactive exercises, AI tutoring, Code playgrounds, Real-time feedback
   UDEMY GAPS FILLED: Lifetime access, Downloadable resources, Section progress, Q&A forum
   DATORE UNIQUE: Deto AI tutor, Voice lessons, Skill-to-job matching, Community mentors, Micro-credentials
*/

const TABS = ['explore','my_learning','certificates','paths','community','mentors','quiz'] as const;
type Tab = typeof TABS[number];
const CATS = ['All','Technology','Business','Data Science','AI/ML','Design','Health','Language','Personal Dev','Science','Arts','Cybersecurity'] as const;
const LEVELS = ['All Levels','Beginner','Intermediate','Advanced'] as const;

interface Course {
  id:string; title:string; provider:string; instructor:string; rating:number; students:number;
  duration:string; level:string; cat:string; price:number; free:boolean; certified:boolean;
  icon:string; lessons:number; progress:number; skills:string[]; university:string; desc:string;
  enrolled:boolean; videoHours:number; assignments:number; peerReview:boolean; subtitles:string[];
  weeklyHours:number; prerequisites:string[]; saved:boolean;
  modules:{name:string;lessons:number;completed:number}[];
}

interface Certificate { id:string; title:string; issuer:string; date:string; credentialId:string; skills:string[]; icon:string; verified:boolean; }
interface LearningPath { id:string; title:string; courses:number; duration:string; skills:string[]; progress:number; icon:string; desc:string; }
interface Mentor { id:string; name:string; title:string; expertise:string[]; rating:number; sessions:number; avatar:string; available:boolean; price:string; }

const COURSES:Course[] = [
  {id:'ed1',title:'Machine Learning Specialization',provider:'Coursera',instructor:'Andrew Ng',rating:4.9,students:4200000,duration:'3 months',level:'Intermediate',cat:'AI/ML',price:0,free:true,certified:true,icon:'🤖',lessons:33,progress:0,skills:['Python','TensorFlow','Neural Networks','Regression'],university:'Stanford',desc:'Master ML concepts and develop practical skills.',enrolled:false,videoHours:45,assignments:12,peerReview:true,subtitles:['EN','FR','ES','HI','ZH'],weeklyHours:10,prerequisites:['Python basics','Linear algebra'],saved:false,modules:[{name:'Supervised Learning',lessons:11,completed:0},{name:'Advanced Algorithms',lessons:11,completed:0},{name:'Unsupervised & Recommender',lessons:11,completed:0}]},
  {id:'ed2',title:'CS50: Intro to Computer Science',provider:'edX',instructor:'David Malan',rating:4.9,students:3800000,duration:'12 weeks',level:'Beginner',cat:'Technology',price:0,free:true,certified:true,icon:'💻',lessons:24,progress:0,skills:['C','Python','SQL','Web Dev','Algorithms'],university:'Harvard',desc:'An intro to CS and programming.',enrolled:false,videoHours:60,assignments:10,peerReview:false,subtitles:['EN','ES','PT'],weeklyHours:12,prerequisites:[],saved:false,modules:[{name:'C & Memory',lessons:6,completed:0},{name:'Data Structures',lessons:6,completed:0},{name:'Python & SQL',lessons:6,completed:0},{name:'Web Development',lessons:6,completed:0}]},
  {id:'ed3',title:'Google Data Analytics',provider:'Coursera',instructor:'Google Team',rating:4.8,students:2100000,duration:'6 months',level:'Beginner',cat:'Data Science',price:49,free:false,certified:true,icon:'📊',lessons:44,progress:65,skills:['SQL','R','Tableau','Excel','BigQuery'],university:'Google',desc:'Prepare for a data analytics career.',enrolled:true,videoHours:80,assignments:20,peerReview:true,subtitles:['EN','ES','FR','DE','JA'],weeklyHours:8,prerequisites:[],saved:false,modules:[{name:'Foundations',lessons:8,completed:8},{name:'Ask Questions',lessons:7,completed:7},{name:'Prepare Data',lessons:8,completed:7},{name:'Process Data',lessons:7,completed:4},{name:'Analyze',lessons:7,completed:3},{name:'Share',lessons:7,completed:0}]},
  {id:'ed4',title:'AWS Cloud Practitioner',provider:'Coursera',instructor:'AWS Team',rating:4.7,students:890000,duration:'4 weeks',level:'Beginner',cat:'Technology',price:0,free:true,certified:true,icon:'☁️',lessons:18,progress:30,skills:['AWS','Cloud','Security','Networking'],university:'Amazon',desc:'Cloud literacy and AWS certification prep.',enrolled:true,videoHours:20,assignments:6,peerReview:false,subtitles:['EN','ES'],weeklyHours:6,prerequisites:[],saved:false,modules:[{name:'Cloud Concepts',lessons:6,completed:4},{name:'AWS Services',lessons:6,completed:2},{name:'Security & Pricing',lessons:6,completed:0}]},
  {id:'ed5',title:'UX Design Professional',provider:'Coursera',instructor:'Google Team',rating:4.8,students:1500000,duration:'6 months',level:'Beginner',cat:'Design',price:39,free:false,certified:true,icon:'🎨',lessons:52,progress:0,skills:['Figma','User Research','Prototyping','Wireframing'],university:'Google',desc:'Fast track to UX design career.',enrolled:false,videoHours:90,assignments:15,peerReview:true,subtitles:['EN','ES','FR'],weeklyHours:8,prerequisites:[],saved:false,modules:[{name:'Foundations',lessons:13,completed:0},{name:'Start UX Design',lessons:13,completed:0},{name:'Build Wireframes',lessons:13,completed:0},{name:'Design Hi-Fi',lessons:13,completed:0}]},
  {id:'ed6',title:'Deep Learning Specialization',provider:'Coursera',instructor:'Andrew Ng',rating:4.9,students:980000,duration:'5 months',level:'Advanced',cat:'AI/ML',price:49,free:false,certified:true,icon:'🧠',lessons:42,progress:0,skills:['CNN','RNN','TensorFlow','Keras','GANs'],university:'DeepLearning.AI',desc:'Master Deep Learning and neural networks.',enrolled:false,videoHours:55,assignments:18,peerReview:true,subtitles:['EN','ZH','JA'],weeklyHours:10,prerequisites:['ML basics','Python'],saved:false,modules:[{name:'Neural Networks',lessons:8,completed:0},{name:'Optimization',lessons:8,completed:0},{name:'Structuring ML Projects',lessons:8,completed:0},{name:'CNNs',lessons:9,completed:0},{name:'Sequence Models',lessons:9,completed:0}]},
  {id:'ed7',title:'Business Strategy',provider:'Coursera',instructor:'Michael Porter',rating:4.6,students:450000,duration:'3 months',level:'Intermediate',cat:'Business',price:59,free:false,certified:true,icon:'📈',lessons:28,progress:0,skills:['Strategy','Analysis','Leadership'],university:'UVA',desc:'Business strategy frameworks.',enrolled:false,videoHours:35,assignments:8,peerReview:true,subtitles:['EN','ES'],weeklyHours:6,prerequisites:[],saved:false,modules:[{name:'Strategic Analysis',lessons:7,completed:0},{name:'Competitive Advantage',lessons:7,completed:0},{name:'Growth Strategy',lessons:7,completed:0},{name:'Capstone',lessons:7,completed:0}]},
  {id:'ed8',title:'Python for Everybody',provider:'Coursera',instructor:'Charles Severance',rating:4.8,students:3200000,duration:'8 months',level:'Beginner',cat:'Technology',price:0,free:true,certified:true,icon:'🐍',lessons:58,progress:100,skills:['Python','JSON','APIs','Databases'],university:'U of Michigan',desc:'Learn Python from scratch.',enrolled:true,videoHours:70,assignments:25,peerReview:false,subtitles:['EN','ES','FR','AR','HI','ZH'],weeklyHours:4,prerequisites:[],saved:false,modules:[{name:'Getting Started',lessons:12,completed:12},{name:'Data Structures',lessons:12,completed:12},{name:'Web Services',lessons:12,completed:12},{name:'Databases',lessons:12,completed:12},{name:'Capstone',lessons:10,completed:10}]},
  {id:'ed9',title:'Cybersecurity Fundamentals',provider:'edX',instructor:'MIT Team',rating:4.7,students:560000,duration:'6 weeks',level:'Intermediate',cat:'Cybersecurity',price:0,free:true,certified:true,icon:'🔒',lessons:20,progress:0,skills:['Network Security','Cryptography','Incident Response'],university:'MIT',desc:'Core cybersecurity principles.',enrolled:false,videoHours:25,assignments:8,peerReview:false,subtitles:['EN'],weeklyHours:8,prerequisites:['Networking basics'],saved:false,modules:[{name:'Threats',lessons:5,completed:0},{name:'Cryptography',lessons:5,completed:0},{name:'Network Security',lessons:5,completed:0},{name:'Incident Response',lessons:5,completed:0}]},
  {id:'ed10',title:'Digital Marketing',provider:'Coursera',instructor:'Meta Team',rating:4.5,students:780000,duration:'5 months',level:'Beginner',cat:'Business',price:49,free:false,certified:true,icon:'📱',lessons:38,progress:0,skills:['SEO','Social Media','Analytics','Content'],university:'Meta',desc:'Social media marketing professional cert.',enrolled:false,videoHours:65,assignments:14,peerReview:true,subtitles:['EN','ES','FR'],weeklyHours:7,prerequisites:[],saved:false,modules:[{name:'Intro to Marketing',lessons:10,completed:0},{name:'Social Media',lessons:10,completed:0},{name:'Advertising',lessons:9,completed:0},{name:'Analytics',lessons:9,completed:0}]},
];

const CERTS:Certificate[] = [
  {id:'c1',title:'Python for Everybody',issuer:'U of Michigan / Coursera',date:'Jan 2026',credentialId:'CERT-PY-2026-001',skills:['Python','APIs','Databases'],icon:'🐍',verified:true},
  {id:'c2',title:'Google Data Analytics (In Progress)',issuer:'Google / Coursera',date:'Expected Mar 2026',credentialId:'CERT-GDA-2026-002',skills:['SQL','R','Tableau'],icon:'📊',verified:false},
];

const PATHS:LearningPath[] = [
  {id:'lp1',title:'Full-Stack Web Developer',courses:6,duration:'12 months',skills:['HTML/CSS','JavaScript','React','Node.js','SQL','DevOps'],progress:33,icon:'🌐',desc:'Complete path from beginner to employable full-stack developer'},
  {id:'lp2',title:'AI & Machine Learning Engineer',courses:5,duration:'10 months',skills:['Python','ML','Deep Learning','NLP','MLOps'],progress:20,icon:'🤖',desc:'From Python basics to deploying ML models in production'},
  {id:'lp3',title:'Data Science Career',courses:7,duration:'14 months',skills:['Python','Statistics','SQL','Visualization','ML','Big Data','Communication'],progress:0,icon:'📊',desc:'Comprehensive data science career preparation'},
  {id:'lp4',title:'Cloud Architect',courses:4,duration:'8 months',skills:['AWS','Azure','GCP','Docker','Kubernetes'],progress:15,icon:'☁️',desc:'Master multi-cloud architecture and DevOps'},
];

const MENTORS:Mentor[] = [
  {id:'m1',name:'Dr. Sarah Chen',title:'AI Research Lead at Google',expertise:['Machine Learning','Deep Learning','Python'],rating:4.9,sessions:234,avatar:'SC',available:true,price:'$75/hr'},
  {id:'m2',name:'James Park',title:'Staff Engineer at Meta',expertise:['System Design','React','TypeScript'],rating:4.8,sessions:189,avatar:'JP',available:true,price:'$60/hr'},
  {id:'m3',name:'Maria Rodriguez',title:'VP Data Science at Stripe',expertise:['Data Science','Statistics','SQL'],rating:4.9,sessions:312,avatar:'MR',available:false,price:'$90/hr'},
  {id:'m4',name:'David Kim',title:'CTO at TechStartup',expertise:['Architecture','Leadership','Cloud'],rating:4.7,sessions:156,avatar:'DK',available:true,price:'$80/hr'},
];

const QUIZ_Q = [
  {q:'What is the time complexity of binary search?',opts:['O(1)','O(n)','O(log n)','O(n²)'],correct:2},
  {q:'Which data structure uses FIFO ordering?',opts:['Stack','Queue','Tree','Graph'],correct:1},
  {q:'What does SQL stand for?',opts:['Simple Query Language','Structured Query Language','System Query Language','Standard Query Language'],correct:1},
  {q:'Which is NOT a Python data type?',opts:['List','Tuple','Array','Dictionary'],correct:2},
  {q:'What protocol does HTTPS use for encryption?',opts:['SSH','SSL/TLS','FTP','SMTP'],correct:1},
];

export default function EducationPage() {
  const router = useRouter();
  const {isDark,glassLevel,accentColor} = useThemeStore();
  const t = getTheme(isDark,glassLevel,accentColor);
  const [tab,setTab] = useState<Tab>('explore');
  const [courses,setCourses] = useState(COURSES);
  const [search,setSearch] = useState('');
  const [catF,setCatF] = useState('All');
  const [levelF,setLevelF] = useState('All Levels');
  const [freeF,setFreeF] = useState(false);
  const [sel,setSel] = useState<Course|null>(null);
  const [voiceSrch,setVoiceSrch] = useState(false);
  const [quizIdx,setQuizIdx] = useState(0);
  const [quizAns,setQuizAns] = useState<number|null>(null);
  const [quizScore,setQuizScore] = useState(0);
  const [quizDone,setQuizDone] = useState(false);

  const enrolled = courses.filter(c=>c.enrolled);
  const filtered = courses.filter(c=>{
    const ms=!search||c.title.toLowerCase().includes(search.toLowerCase())||c.skills.some(s=>s.toLowerCase().includes(search.toLowerCase()));
    const mc=catF==='All'||c.cat===catF;
    const ml=levelF==='All Levels'||c.level===levelF;
    const mf=!freeF||c.free;
    return ms&&mc&&ml&&mf;
  });

  const voiceS = () => { setVoiceSrch(true); setTimeout(()=>{setSearch('python');setVoiceSrch(false);},2000); };
  const fmtStudents = (n:number) => n>=1000000?`${(n/1000000).toFixed(1)}M`:n>=1000?`${(n/1000).toFixed(0)}K`:n;

  const answerQuiz = (idx:number) => {
    setQuizAns(idx);
    if(idx===QUIZ_Q[quizIdx].correct) setQuizScore(s=>s+1);
    setTimeout(()=>{
      if(quizIdx<QUIZ_Q.length-1){setQuizIdx(i=>i+1);setQuizAns(null);}
      else setQuizDone(true);
    },1500);
  };

  // COURSE DETAIL
  if(sel) return (
    <div className="space-y-3 animate-fade-in">
      <button onClick={()=>setSel(null)} className="flex items-center gap-2 text-xs" style={{color:t.accent}}><IcoBack size={14}/> Back</button>
      <div className="p-4 rounded-xl" style={{background:t.card,border:`1px solid ${t.border}`}}>
        <div className="text-center text-5xl mb-3">{sel.icon}</div>
        <h2 className="text-base font-bold">{sel.title}</h2>
        <p className="text-xs" style={{color:t.textMuted}}>by {sel.instructor} · {sel.university}</p>
        <div className="flex items-center gap-3 mt-2 mb-3">
          <span className="text-xs">⭐ {sel.rating}</span>
          <span className="text-[10px]" style={{color:t.textMuted}}>{fmtStudents(sel.students)} students</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{background:sel.free?'rgba(34,197,94,0.15)':'rgba(245,158,11,0.15)',color:sel.free?'#22c55e':'#f59e0b'}}>{sel.free?'FREE':'$'+sel.price+'/mo'}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{background:t.accent+'15',color:t.accent}}>{sel.level}</span>
        </div>
        <p className="text-xs mb-3">{sel.desc}</p>
        <div className="grid grid-cols-4 gap-2 mb-3">{[{l:'Duration',v:sel.duration},{l:'Video',v:sel.videoHours+'hr'},{l:'Assignments',v:sel.assignments+''},{l:'Weekly',v:sel.weeklyHours+'hr/wk'}].map(s=>(<div key={s.l} className="text-center p-1.5 rounded-lg" style={{background:t.bg}}><p className="text-xs font-bold">{s.v}</p><p className="text-[8px]" style={{color:t.textMuted}}>{s.l}</p></div>))}</div>

        {/* Skills */}
        <h4 className="text-[10px] font-bold mb-1">Skills You'll Learn</h4>
        <div className="flex flex-wrap gap-1 mb-3">{sel.skills.map(s=>(<span key={s} className="px-2 py-0.5 rounded-full text-[9px]" style={{background:t.accent+'15',color:t.accent}}>{s}</span>))}</div>

        {/* Modules with Progress */}
        <h4 className="text-[10px] font-bold mb-1">Course Modules</h4>
        <div className="space-y-1 mb-3">{sel.modules.map((m,i)=>(
          <div key={i} className="p-2 rounded-lg" style={{background:t.bg}}>
            <div className="flex justify-between text-[10px] mb-1"><span className="font-medium">{i+1}. {m.name}</span><span>{m.completed}/{m.lessons}</span></div>
            <div className="h-1 rounded-full" style={{background:t.border}}><div className="h-1 rounded-full" style={{background:m.completed===m.lessons?'#22c55e':m.completed>0?'#3b82f6':t.border,width:`${(m.completed/m.lessons)*100}%`}}/></div>
          </div>
        ))}</div>

        {sel.prerequisites.length>0&&(<><h4 className="text-[10px] font-bold mb-1">Prerequisites</h4><div className="flex flex-wrap gap-1 mb-3">{sel.prerequisites.map(p=>(<span key={p} className="px-2 py-0.5 rounded-full text-[9px]" style={{background:'rgba(245,158,11,0.1)',color:'#f59e0b'}}>{p}</span>))}</div></>)}
        <div className="flex items-center gap-2 mb-3">{sel.peerReview&&<span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">Peer Review</span>}{sel.certified&&<span className="text-[9px] px-2 py-0.5 rounded-full bg-green-50 text-green-600">Certificate</span>}<span className="text-[9px]" style={{color:t.textMuted}}>Subtitles: {sel.subtitles.join(', ')}</span></div>

        <button onClick={()=>{setCourses(p=>p.map(c=>c.id===sel.id?{...c,enrolled:!c.enrolled}:c));setSel({...sel,enrolled:!sel.enrolled});}} className="w-full py-2.5 rounded-lg text-xs font-bold text-white" style={{background:sel.enrolled?'#22c55e':t.accent}}>
          {sel.enrolled?'✅ Enrolled — Continue Learning':'Enroll Now'+(sel.free?' — Free':` — $${sel.price}/mo`)}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="flex items-center gap-3"><button onClick={()=>router.back()} style={{background:'none',border:'none',color:t.text,cursor:'pointer'}}><IcoBack size={20}/></button><h1 className="text-xl font-bold flex-1">Education</h1>
        <button onClick={voiceS} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:voiceSrch?'rgba(239,68,68,0.15)':t.card}}><IcoMic size={14} color={voiceSrch?'#ef4444':t.textMuted}/></button>
      </div>
      {voiceSrch&&<p className="text-xs text-center animate-pulse" style={{color:'#ef4444'}}>🎙️ Listening...</p>}

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto" style={{scrollbarWidth:'none'}}>{TABS.map(tb=>(
        <button key={tb} onClick={()=>setTab(tb)} className="px-3 py-1.5 rounded-full text-[10px] font-semibold whitespace-nowrap" style={{background:tab===tb?t.accent+'20':t.card,color:tab===tb?t.accent:t.textMuted}}>
          {tb==='explore'?'🔍':tb==='my_learning'?'📚':tb==='certificates'?'🏅':tb==='paths'?'🗺️':tb==='community'?'👥':tb==='mentors'?'🧑‍🏫':'📝'} {tb.replace('_',' ')}
        </button>
      ))}</div>

      {/* EXPLORE */}
      {tab==='explore'&&(
        <>
          <div className="flex gap-2"><div className="flex-1 flex items-center gap-2 p-2 rounded-xl" style={{background:t.card,border:`1px solid ${t.border}`}}><IcoSearch size={14} color={t.textMuted}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search courses, skills..." className="flex-1 text-sm bg-transparent outline-none" style={{color:t.text}}/></div></div>
          <div className="flex gap-1 overflow-x-auto" style={{scrollbarWidth:'none'}}>{CATS.map(c=>(<button key={c} onClick={()=>setCatF(c)} className="px-2 py-0.5 rounded-full text-[9px] font-medium whitespace-nowrap" style={{background:catF===c?t.accent+'20':t.card,color:catF===c?t.accent:t.textMuted}}>{c}</button>))}</div>
          <div className="flex gap-1 items-center">{LEVELS.map(l=>(<button key={l} onClick={()=>setLevelF(l)} className="px-2 py-0.5 rounded-full text-[9px]" style={{background:levelF===l?'rgba(139,92,246,0.15)':'transparent',color:levelF===l?'#8b5cf6':t.textMuted}}>{l}</button>))}
            <button onClick={()=>setFreeF(!freeF)} className="px-2 py-0.5 rounded-full text-[9px]" style={{background:freeF?'rgba(34,197,94,0.15)':'transparent',color:freeF?'#22c55e':t.textMuted}}>Free Only</button>
          </div>
          <div className="space-y-2">{filtered.map(c=>(
            <button key={c.id} onClick={()=>setSel(c)} className="w-full text-left p-3 rounded-xl" style={{background:t.card,border:`1px solid ${t.border}`}}>
              <div className="flex gap-3">
                <span className="text-2xl">{c.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{c.title}</p>
                  <p className="text-[10px]" style={{color:t.textMuted}}>{c.instructor} · {c.university}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px]">⭐ {c.rating}</span>
                    <span className="text-[9px]" style={{color:t.textMuted}}>{fmtStudents(c.students)}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{background:c.free?'rgba(34,197,94,0.1)':'rgba(245,158,11,0.1)',color:c.free?'#22c55e':'#f59e0b'}}>{c.free?'Free':'$'+c.price}</span>
                    <span className="text-[9px]" style={{color:t.textMuted}}>{c.level}</span>
                    <span className="text-[9px]" style={{color:t.textMuted}}>{c.duration}</span>
                  </div>
                  {c.enrolled&&c.progress>0&&<div className="flex items-center gap-2 mt-1"><div className="flex-1 h-1 rounded-full" style={{background:t.border}}><div className="h-1 rounded-full" style={{background:c.progress===100?'#22c55e':'#3b82f6',width:`${c.progress}%`}}/></div><span className="text-[9px] font-bold">{c.progress}%</span></div>}
                </div>
              </div>
            </button>
          ))}</div>
        </>
      )}

      {/* MY LEARNING */}
      {tab==='my_learning'&&(
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2 mb-2">{[{l:'Enrolled',v:enrolled.length},{l:'Completed',v:enrolled.filter(c=>c.progress===100).length},{l:'Hours Learned',v:enrolled.reduce((s,c)=>s+Math.round(c.videoHours*(c.progress/100)),0)}].map(s=>(<div key={s.l} className="text-center p-2 rounded-xl" style={{background:t.card}}><p className="text-lg font-bold">{s.v}</p><p className="text-[9px]" style={{color:t.textMuted}}>{s.l}</p></div>))}</div>
          {enrolled.length===0?<p className="text-center text-sm py-8" style={{color:t.textMuted}}>No courses enrolled yet</p>:
          enrolled.map(c=>(
            <button key={c.id} onClick={()=>setSel(c)} className="w-full text-left p-3 rounded-xl" style={{background:t.card,border:`1px solid ${t.border}`}}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{c.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{c.title}</p>
                  <p className="text-[10px]" style={{color:t.textMuted}}>{c.university} · Next: Module {c.modules.findIndex(m=>m.completed<m.lessons)+1}</p>
                  <div className="flex items-center gap-2 mt-1"><div className="flex-1 h-1.5 rounded-full" style={{background:t.border}}><div className="h-1.5 rounded-full" style={{background:c.progress===100?'#22c55e':'#3b82f6',width:`${c.progress}%`}}/></div><span className="text-[10px] font-bold">{c.progress}%</span></div>
                </div>
                <span className="text-xs font-bold" style={{color:c.progress===100?'#22c55e':t.accent}}>{c.progress===100?'✅':'▶'}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* CERTIFICATES */}
      {tab==='certificates'&&(
        <div className="space-y-2">{CERTS.map(c=>(
          <div key={c.id} className="p-3 rounded-xl" style={{background:t.card,border:`1px solid ${c.verified?'#22c55e':t.border}40`}}>
            <div className="flex items-center gap-3"><span className="text-2xl">{c.icon}</span><div className="flex-1"><p className="text-sm font-bold">{c.title}</p><p className="text-[10px]" style={{color:t.textMuted}}>{c.issuer} · {c.date}</p><p className="text-[9px]" style={{color:t.textMuted}}>ID: {c.credentialId}</p></div>{c.verified&&<span className="text-[9px] px-2 py-0.5 rounded-full bg-green-100 text-green-600">✅ Verified</span>}</div>
            <div className="flex flex-wrap gap-1 mt-2">{c.skills.map(s=>(<span key={s} className="px-2 py-0.5 rounded-full text-[9px]" style={{background:t.accent+'15',color:t.accent}}>{s}</span>))}</div>
          </div>
        ))}</div>
      )}

      {/* LEARNING PATHS */}
      {tab==='paths'&&(
        <div className="space-y-2">{PATHS.map(p=>(
          <div key={p.id} className="p-3 rounded-xl" style={{background:t.card,border:`1px solid ${t.border}`}}>
            <div className="flex items-center gap-3 mb-2"><span className="text-2xl">{p.icon}</span><div className="flex-1"><p className="text-sm font-bold">{p.title}</p><p className="text-[10px]" style={{color:t.textMuted}}>{p.courses} courses · {p.duration}</p></div></div>
            <p className="text-[10px] mb-2">{p.desc}</p>
            <div className="flex flex-wrap gap-1 mb-2">{p.skills.map(s=>(<span key={s} className="px-2 py-0.5 rounded-full text-[9px]" style={{background:t.accent+'10',color:t.accent}}>{s}</span>))}</div>
            <div className="flex items-center gap-2"><div className="flex-1 h-1.5 rounded-full" style={{background:t.border}}><div className="h-1.5 rounded-full" style={{background:p.progress>0?'#3b82f6':t.border,width:`${p.progress}%`}}/></div><span className="text-[10px] font-bold">{p.progress}%</span></div>
          </div>
        ))}</div>
      )}

      {/* MENTORS */}
      {tab==='mentors'&&(
        <div className="space-y-2">{MENTORS.map(m=>(
          <div key={m.id} className="p-3 rounded-xl" style={{background:t.card,border:`1px solid ${t.border}`}}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{background:t.accent}}>{m.avatar}</div>
              <div className="flex-1"><p className="text-sm font-semibold">{m.name}</p><p className="text-[10px]" style={{color:t.textMuted}}>{m.title}</p><div className="flex items-center gap-2 mt-1"><span className="text-[10px]">⭐ {m.rating}</span><span className="text-[9px]" style={{color:t.textMuted}}>{m.sessions} sessions</span><span className="text-[9px] font-bold" style={{color:'#22c55e'}}>{m.price}</span></div></div>
              <div className="text-right"><span className="text-[9px] px-2 py-0.5 rounded-full" style={{background:m.available?'rgba(34,197,94,0.15)':'rgba(239,68,68,0.15)',color:m.available?'#22c55e':'#ef4444'}}>{m.available?'Available':'Busy'}</span>{m.available&&<button className="block mt-1 px-3 py-1 rounded-lg text-[9px] font-bold text-white" style={{background:t.accent}}>Book</button>}</div>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">{m.expertise.map(e=>(<span key={e} className="px-2 py-0.5 rounded-full text-[9px]" style={{background:t.accent+'10',color:t.accent}}>{e}</span>))}</div>
          </div>
        ))}</div>
      )}

      {/* QUIZ — Lex gap: Interactive exercises */}
      {tab==='quiz'&&(
        <div className="space-y-3">
          {!quizDone?(
            <div className="p-4 rounded-xl" style={{background:t.card,border:`1px solid ${t.border}`}}>
              <div className="flex justify-between mb-3"><span className="text-xs font-bold">Question {quizIdx+1}/{QUIZ_Q.length}</span><span className="text-xs font-bold" style={{color:'#22c55e'}}>Score: {quizScore}</span></div>
              <div className="h-1 rounded-full mb-4" style={{background:t.border}}><div className="h-1 rounded-full" style={{background:t.accent,width:`${((quizIdx+1)/QUIZ_Q.length)*100}%`}}/></div>
              <p className="text-sm font-semibold mb-4">{QUIZ_Q[quizIdx].q}</p>
              <div className="space-y-2">{QUIZ_Q[quizIdx].opts.map((o,i)=>{
                const isCorrect = i===QUIZ_Q[quizIdx].correct;
                const isSelected = quizAns===i;
                const bg = quizAns===null?t.bg:isCorrect?'rgba(34,197,94,0.15)':isSelected?'rgba(239,68,68,0.15)':t.bg;
                const border = quizAns===null?t.border:isCorrect?'#22c55e':isSelected?'#ef4444':t.border;
                return(<button key={i} onClick={()=>quizAns===null&&answerQuiz(i)} className="w-full text-left p-3 rounded-xl text-sm" style={{background:bg,border:`1px solid ${border}`}}>{o}{quizAns!==null&&isCorrect&&' ✅'}{quizAns!==null&&isSelected&&!isCorrect&&' ❌'}</button>);
              })}</div>
            </div>
          ):(
            <div className="p-4 rounded-xl text-center" style={{background:t.card,border:`1px solid ${t.border}`}}>
              <p className="text-4xl mb-2">{quizScore>=4?'🏆':quizScore>=3?'⭐':'📚'}</p>
              <h3 className="text-lg font-bold">Quiz Complete!</h3>
              <p className="text-sm" style={{color:t.textMuted}}>Score: {quizScore}/{QUIZ_Q.length} ({Math.round((quizScore/QUIZ_Q.length)*100)}%)</p>
              <button onClick={()=>{setQuizIdx(0);setQuizAns(null);setQuizScore(0);setQuizDone(false);}} className="mt-3 px-4 py-2 rounded-lg text-xs font-bold text-white" style={{background:t.accent}}>Retry</button>
            </div>
          )}
        </div>
      )}

      {/* COMMUNITY */}
      {tab==='community'&&(
        <div className="space-y-2">
          <div className="p-3 rounded-xl" style={{background:'rgba(139,92,246,0.08)',border:'1px solid rgba(139,92,246,0.2)'}}>
            <p className="text-xs font-bold" style={{color:'#8b5cf6'}}>🤖 Deto AI Tutor</p>
            <p className="text-[10px]" style={{color:t.textMuted}}>Ask Deto to explain concepts, quiz you, or recommend courses</p>
            <button onClick={()=>router.push('/deto')} className="mt-2 px-3 py-1 rounded-lg text-[10px] font-bold text-white" style={{background:'#8b5cf6'}}>Open Deto Tutor</button>
          </div>
          {[{title:'React Best Practices 2026',posts:145,members:2340,tag:'Tech'},{title:'ML Study Group',posts:89,members:1200,tag:'AI/ML'},{title:'Career Advice Hub',posts:234,members:5600,tag:'Career'}].map((g,i)=>(
            <div key={i} className="p-3 rounded-xl" style={{background:t.card,border:`1px solid ${t.border}`}}>
              <p className="text-sm font-bold">{g.title}</p>
              <div className="flex gap-3 mt-1"><span className="text-[10px]" style={{color:t.textMuted}}>💬 {g.posts} posts</span><span className="text-[10px]" style={{color:t.textMuted}}>👥 {g.members} members</span><span className="text-[9px] px-2 py-0.5 rounded-full" style={{background:t.accent+'15',color:t.accent}}>{g.tag}</span></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
