"use client";
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { useAuthStore } from '@/store/useAuthStore';
import { getTheme } from '@/lib/theme';
import { IcoBack, IcoSearch, IcoBookmark, IcoStar, IcoMic, IcoUser, IcoSend } from '@/components/Icons';

/* BR-98: PROFESSIONAL PROFILE -- LinkedIn/Monster/Indeed Feature Parity + Gaps Filled
   COMMON FEATURES: Profile, Experience, Skills, Job Search, Network, Messaging, Resume, Endorsements
   LINKEDIN GAPS FILLED: Open-to-work privacy, Skill assessments, Creator mode, Career breaks
   MONSTER GAPS FILLED: Resume scoring, Career advice, Salary negotiation tools
   INDEED GAPS FILLED: Company reviews, Interview prep, Salary comparison, Remote filter
   DATORE UNIQUE: AI job match, Voice search, Deto integration, Worker ratings, Gig economy focus
*/

const TABS = ['profile','jobs','network','resume','companies','interviews','salary','skills','articles','tracker'] as const;
type Tab = typeof TABS[number];
const TAB_ICONS:Record<Tab,string> = {profile:'👤',jobs:'💼',network:'🤝',resume:'📄',companies:'🏢',interviews:'🎤',salary:'💰',skills:'🎯',articles:'📰',tracker:'📊'};

interface Job { id:string; title:string; company:string; location:string; salary:string; type:string; posted:string; match:number; remote:boolean; logo:string; applicants:number; skills:string[]; benefits:string[]; desc:string; urgent:boolean; easyApply:boolean; compRating:number; compReviews:number; source:string; saved:boolean; applied:boolean; }
interface Connection { id:string; name:string; title:string; mutual:number; avatar:string; endorsed:string[]; status:'connected'|'pending'|'suggestion'; }
interface SkillAssess { skill:string; level:'Beginner'|'Intermediate'|'Advanced'|'Expert'; score:number; verified:boolean; endorsements:number; }
interface Interview { company:string; role:string; date:string; type:string; status:'scheduled'|'completed'|'cancelled'; rating?:number; notes:string; }
interface AppTrack { id:string; company:string; role:string; status:'applied'|'screening'|'interview'|'offer'|'rejected'; date:string; salary?:string; notes:string; }

const JOBS:Job[] = [
  {id:'j1',title:'Senior React Developer',company:'TechCorp Inc.',location:'Toronto, ON',salary:'$120K-$150K',type:'Full-time',posted:'2d ago',match:95,remote:true,logo:'TC',applicants:47,skills:['React','TypeScript','Node.js'],benefits:['Health','401k','Remote','Stock'],desc:'Lead frontend for AI platform.',urgent:true,easyApply:true,compRating:4.5,compReviews:234,source:'LinkedIn',saved:false,applied:false},
  {id:'j2',title:'UX Designer',company:'DesignHub',location:'Vancouver, BC',salary:'$85K-$110K',type:'Full-time',posted:'5d ago',match:88,remote:false,logo:'DH',applicants:63,skills:['Figma','UI/UX','Prototyping'],benefits:['Health','Dental','PTO'],desc:'Design for SaaS platform.',urgent:false,easyApply:true,compRating:4.2,compReviews:89,source:'Indeed',saved:true,applied:false},
  {id:'j3',title:'Data Scientist',company:'AI Solutions Ltd',location:'Montreal, QC',salary:'$130K-$160K',type:'Full-time',posted:'1d ago',match:82,remote:true,logo:'AI',applicants:29,skills:['Python','ML','TensorFlow'],benefits:['Health','Stock','Remote','Education'],desc:'Build ML models for analytics.',urgent:true,easyApply:false,compRating:4.7,compReviews:156,source:'LinkedIn',saved:false,applied:false},
  {id:'j4',title:'Project Manager',company:'BuildRight Corp',location:'Toronto, ON',salary:'$95K-$120K',type:'Contract',posted:'3d ago',match:79,remote:false,logo:'BR',applicants:55,skills:['Agile','Scrum','JIRA'],benefits:['Health','Bonus'],desc:'Manage software projects.',urgent:false,easyApply:true,compRating:3.8,compReviews:67,source:'Monster',saved:false,applied:true},
  {id:'j5',title:'DevOps Engineer',company:'CloudScale',location:'Remote',salary:'$110K-$140K',type:'Full-time',posted:'1w ago',match:91,remote:true,logo:'CS',applicants:38,skills:['AWS','Docker','Kubernetes'],benefits:['Health','Remote','Stock','401k'],desc:'Cloud infrastructure at scale.',urgent:false,easyApply:true,compRating:4.6,compReviews:312,source:'Indeed',saved:false,applied:false},
  {id:'j6',title:'Backend Engineer (Go)',company:'FinTech Pro',location:'Toronto, ON',salary:'$140K-$175K',type:'Full-time',posted:'6h ago',match:86,remote:true,logo:'FP',applicants:12,skills:['Go','PostgreSQL','gRPC'],benefits:['Health','Stock','Remote','Unlimited PTO'],desc:'High-performance trading systems.',urgent:true,easyApply:true,compRating:4.8,compReviews:178,source:'LinkedIn',saved:false,applied:false},
  {id:'j7',title:'Product Manager',company:'StartupXYZ',location:'Remote',salary:'$115K-$145K',type:'Full-time',posted:'2d ago',match:84,remote:true,logo:'SX',applicants:89,skills:['Product Strategy','Roadmap','Analytics'],benefits:['Health','Equity','Remote'],desc:'Own B2B SaaS product.',urgent:false,easyApply:true,compRating:4.3,compReviews:56,source:'Indeed',saved:false,applied:false},
];

const CONNS:Connection[] = [
  {id:'n1',name:'Sarah Chen',title:'Engineering Manager at Google',mutual:12,avatar:'SC',endorsed:['React','Leadership'],status:'connected'},
  {id:'n2',name:'James Park',title:'Senior Designer at Shopify',mutual:8,avatar:'JP',endorsed:['UI/UX','Figma'],status:'connected'},
  {id:'n3',name:'Maria Rodriguez',title:'VP Engineering at Stripe',mutual:5,avatar:'MR',endorsed:['System Design'],status:'pending'},
  {id:'n4',name:'David Kim',title:'CTO at TechStartup',mutual:15,avatar:'DK',endorsed:['Architecture','Python'],status:'connected'},
  {id:'n5',name:'Priya Sharma',title:'Data Lead at Amazon',mutual:9,avatar:'PS',endorsed:['ML','Data'],status:'suggestion'},
  {id:'n6',name:'Ahmed Hassan',title:'DevOps Lead at Microsoft',mutual:6,avatar:'AH',endorsed:['AWS','K8s'],status:'suggestion'},
];

const SKILL_ASSESS:SkillAssess[] = [
  {skill:'React',level:'Expert',score:95,verified:true,endorsements:47},
  {skill:'TypeScript',level:'Advanced',score:88,verified:true,endorsements:32},
  {skill:'Node.js',level:'Advanced',score:85,verified:true,endorsements:28},
  {skill:'System Design',level:'Advanced',score:82,verified:false,endorsements:19},
  {skill:'Python',level:'Intermediate',score:72,verified:false,endorsements:14},
  {skill:'AWS',level:'Intermediate',score:68,verified:true,endorsements:21},
  {skill:'Docker',level:'Intermediate',score:65,verified:false,endorsements:11},
  {skill:'Leadership',level:'Advanced',score:80,verified:false,endorsements:25},
];

const INTERVIEWS_DATA:Interview[] = [
  {company:'Google',role:'Senior Frontend',date:'Mar 5, 2026',type:'Technical',status:'scheduled',notes:'System design + coding rounds'},
  {company:'Meta',role:'Staff Engineer',date:'Feb 20, 2026',type:'Behavioral',status:'completed',rating:4,notes:'Went well, discussed team culture'},
  {company:'Stripe',role:'Frontend Lead',date:'Feb 15, 2026',type:'Technical',status:'completed',rating:5,notes:'Great team, strong cultural fit'},
];

const APP_TRACKER:AppTrack[] = [
  {id:'a1',company:'Google',role:'Senior Frontend',status:'interview',date:'Feb 28',salary:'$180K-$220K',notes:'Round 3 next week'},
  {id:'a2',company:'Meta',role:'Staff Engineer',status:'screening',date:'Feb 25',salary:'$200K-$250K',notes:'Recruiter call scheduled'},
  {id:'a3',company:'Stripe',role:'Frontend Lead',status:'offer',date:'Feb 15',salary:'$175K + equity',notes:'Offer letter received!'},
  {id:'a4',company:'Shopify',role:'Senior Dev',status:'applied',date:'Feb 10',notes:'Applied via Easy Apply'},
  {id:'a5',company:'Uber',role:'Frontend',status:'rejected',date:'Jan 28',notes:'Not a fit for current needs'},
];

const SALARY_DATA = [
  {role:'Frontend Developer',junior:'$65K-$85K',mid:'$90K-$120K',senior:'$130K-$170K',lead:'$160K-$200K'},
  {role:'Backend Developer',junior:'$70K-$90K',mid:'$95K-$130K',senior:'$140K-$180K',lead:'$170K-$220K'},
  {role:'Full Stack Developer',junior:'$68K-$88K',mid:'$92K-$125K',senior:'$135K-$175K',lead:'$165K-$210K'},
  {role:'UX Designer',junior:'$55K-$75K',mid:'$80K-$110K',senior:'$115K-$150K',lead:'$140K-$180K'},
  {role:'Data Scientist',junior:'$75K-$95K',mid:'$100K-$140K',senior:'$145K-$190K',lead:'$180K-$240K'},
  {role:'DevOps Engineer',junior:'$70K-$90K',mid:'$95K-$130K',senior:'$135K-$175K',lead:'$165K-$210K'},
  {role:'Product Manager',junior:'$70K-$90K',mid:'$100K-$135K',senior:'$140K-$180K',lead:'$170K-$220K'},
];

const ARTICLES = [
  {id:'ar1',title:'10 React Patterns Every Senior Dev Should Know',author:'Dan Abramov',reads:'45K',time:'8 min',tag:'Tech'},
  {id:'ar2',title:'Negotiating Your Tech Salary: A Complete Guide',author:'Julia Evans',reads:'32K',time:'12 min',tag:'Career'},
  {id:'ar3',title:'The Future of Remote Work in 2026',author:'GitLab Team',reads:'28K',time:'6 min',tag:'Trends'},
  {id:'ar4',title:'System Design Interview Prep Roadmap',author:'Alex Xu',reads:'67K',time:'15 min',tag:'Interview'},
  {id:'ar5',title:'How AI is Changing Hiring: What Candidates Need to Know',author:'Harvard BR',reads:'21K',time:'10 min',tag:'AI'},
];

const COMPANIES = [
  {name:'Google',rating:4.5,reviews:12340,size:'100K+',industry:'Tech',openJobs:2340,recommend:85,ceo:'Sundar Pichai',ceoApproval:92},
  {name:'Meta',rating:4.2,reviews:8900,size:'80K+',industry:'Tech',openJobs:1560,recommend:78,ceo:'Mark Zuckerberg',ceoApproval:65},
  {name:'Shopify',rating:4.4,reviews:3200,size:'10K+',industry:'E-Commerce',openJobs:890,recommend:88,ceo:'Tobi Lutke',ceoApproval:91},
  {name:'Stripe',rating:4.7,reviews:2100,size:'8K+',industry:'FinTech',openJobs:560,recommend:92,ceo:'Patrick Collison',ceoApproval:95},
];

export default function ProfessionalPage() {
  const router = useRouter();
  const {isDark,glassLevel,accentColor} = useThemeStore();
  const { user } = useAuthStore();
  const t = getTheme(isDark,glassLevel,accentColor);
  const [tab,setTab] = useState<Tab>('profile');
  const [jobs,setJobs] = useState(JOBS);
  const [conns,setConns] = useState(CONNS);
  const [search,setSearch] = useState('');
  const [jobFilter,setJobFilter] = useState<'all'|'remote'|'urgent'|'saved'|'applied'>('all');
  const [selJob,setSelJob] = useState<Job|null>(null);
  const [voiceSrch,setVoiceSrch] = useState(false);
  const [openToWork,setOpenToWork] = useState(true);
  const [creatorMode,setCreatorMode] = useState(false);
  const [careerBreak,setCareerBreak] = useState(false);
  const [resumeScore] = useState(78);
  const [appTrack,setAppTrack] = useState(APP_TRACKER);
  const [editProfile,setEditProfile] = useState(false);
  const [profileData,setProfileData] = useState({name:'Rajesh S.',headline:'CEO & Founder at AARNAIT AI | AI/Robotics Education',location:'Toronto, ON',about:'Passionate about AI education and making robotics accessible to everyone. Building the future of hands-on STEM learning for ages 3-14.',experience:[{title:'CEO & Founder',company:'AARNAIT AI',period:'2023 - Present',desc:'Leading AI and Robotics Education startup with 35+ programs'},{title:'Senior PM',company:'TechCorp',period:'2020 - 2023',desc:'Led cross-functional teams for AI products'}],education:[{school:'University of Toronto',degree:'M.Sc. Computer Science',year:'2020'},{school:'IIT Delhi',degree:'B.Tech Computer Science',year:'2017'}],certifications:['AWS Solutions Architect','Google Cloud ML','PMP Certified','Scrum Master']});

  const filteredJobs = jobs.filter(j => {
    if(jobFilter==='remote') return j.remote;
    if(jobFilter==='urgent') return j.urgent;
    if(jobFilter==='saved') return j.saved;
    if(jobFilter==='applied') return j.applied;
    return true;
  }).filter(j => !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase()));

  const voiceS = () => { setVoiceSrch(true); setTimeout(()=>{setSearch('react developer');setVoiceSrch(false);},2000); };
  const statusColor = (s:string) => s==='offer'?'#22c55e':s==='interview'?'#3b82f6':s==='screening'?'#f59e0b':s==='applied'?'#8b5cf6':'#ef4444';
  const statusBg = (s:string) => statusColor(s)+'15';

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={()=>router.back()} style={{background:'none',border:'none',color:t.text,cursor:'pointer'}}><IcoBack size={20}/></button>
        <h1 className="text-xl font-bold flex-1">Professional</h1>
        <button onClick={voiceS} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:voiceSrch?'rgba(239,68,68,0.15)':t.card}}><IcoMic size={14} color={voiceSrch?'#ef4444':t.textMuted}/></button>
      </div>
      {voiceSrch&&<p className="text-xs text-center animate-pulse" style={{color:'#ef4444'}}>🎙️ Listening...</p>}

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1" style={{scrollbarWidth:'none'}}>
        {TABS.map(tb=>(
          <button key={tb} onClick={()=>{setTab(tb);setSelJob(null);}} className="px-3 py-1.5 rounded-full text-[10px] font-semibold whitespace-nowrap flex items-center gap-1" style={{background:tab===tb?t.accent+'20':t.card,color:tab===tb?t.accent:t.textMuted,border:`1px solid ${tab===tb?t.accent:t.cardBorder}`}}>
            {TAB_ICONS[tb]} {tb.charAt(0).toUpperCase()+tb.slice(1)}
          </button>
        ))}
      </div>

      {/* PROFILE TAB */}
      {tab==='profile'&&(
        <div className="space-y-3">
          <div className="p-4 rounded-xl relative" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
            {/* BR-101: Edit own profile */}
            <button onClick={()=>setEditProfile(!editProfile)} className="absolute top-3 right-3 text-[9px] px-2 py-0.5 rounded" style={{background:t.accent+'20',color:t.accent}}>{editProfile?'Done':'Edit'}</button>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white" style={{background:`linear-gradient(135deg,${t.accent},#8b5cf6)`}}>RS</div>
              <div>
                <h2 className="text-base font-bold">{profileData.name}</h2>
                <p className="text-xs" style={{color:t.textMuted}}>{profileData.headline}</p>
                <p className="text-[10px]" style={{color:t.textMuted}}>📍 {profileData.location}</p>
              </div>
            </div>
            {/* LinkedIn feature: Open to Work */}
            <div className="flex gap-2 mb-3">
              <button onClick={()=>setOpenToWork(!openToWork)} className="px-3 py-1 rounded-full text-[10px] font-medium" style={{background:openToWork?'rgba(34,197,94,0.15)':'transparent',color:openToWork?'#22c55e':t.textMuted,border:`1px solid ${openToWork?'#22c55e':t.cardBorder}`}}>
                {openToWork?'✅':'⚪'} Open to Work
              </button>
              <button onClick={()=>setCreatorMode(!creatorMode)} className="px-3 py-1 rounded-full text-[10px] font-medium" style={{background:creatorMode?'rgba(139,92,246,0.15)':'transparent',color:creatorMode?'#8b5cf6':t.textMuted,border:`1px solid ${creatorMode?'#8b5cf6':t.cardBorder}`}}>
                {creatorMode?'✅':'⚪'} Creator Mode
              </button>
              <button onClick={()=>setCareerBreak(!careerBreak)} className="px-3 py-1 rounded-full text-[10px] font-medium" style={{background:careerBreak?'rgba(245,158,11,0.15)':'transparent',color:careerBreak?'#f59e0b':t.textMuted,border:`1px solid ${careerBreak?'#f59e0b':t.cardBorder}`}}>
                {careerBreak?'✅':'⚪'} Career Break
              </button>
            </div>
            <p className="text-xs mb-3">{profileData.about}</p>
            {/* Experience */}
            <h3 className="text-xs font-bold mb-2">💼 Experience</h3>
            {profileData.experience.map((exp,i)=>(
              <div key={i} className="mb-2 pl-3" style={{borderLeft:`2px solid ${t.accent}`}}>
                <p className="text-xs font-semibold">{exp.title}</p>
                <p className="text-[10px]" style={{color:t.textMuted}}>{exp.company} · {exp.period}</p>
                <p className="text-[10px]">{exp.desc}</p>
              </div>
            ))}
            {/* Education */}
            <h3 className="text-xs font-bold mb-2 mt-3">🎓 Education</h3>
            {profileData.education.map((ed,i)=>(
              <div key={i} className="mb-1"><p className="text-xs font-semibold">{ed.school}</p><p className="text-[10px]" style={{color:t.textMuted}}>{ed.degree} · {ed.year}</p></div>
            ))}
            {/* Certifications */}
            <h3 className="text-xs font-bold mb-2 mt-3">🏅 Certifications</h3>
            <div className="flex flex-wrap gap-1">{profileData.certifications.map((c,i)=>(<span key={i} className="px-2 py-0.5 rounded-full text-[9px] font-medium" style={{background:t.accent+'15',color:t.accent}}>{c}</span>))}</div>
          </div>
          {/* Profile Stats */}
          <div className="grid grid-cols-4 gap-2">
            {[{label:'Connections',val:'487'},{label:'Profile Views',val:'1.2K'},{label:'Post Impressions',val:'8.5K'},{label:'Search Appears',val:'342'}].map(s=>(
              <div key={s.label} className="p-2 rounded-xl text-center" style={{background:t.card}}><p className="text-sm font-bold">{s.val}</p><p className="text-[8px]" style={{color:t.textMuted}}>{s.label}</p></div>
            ))}
          </div>
        </div>
      )}

      {/* JOBS TAB */}
      {tab==='jobs'&&!selJob&&(
        <div className="space-y-3">
          <div className="flex gap-2"><div className="flex-1 flex items-center gap-2 p-2 rounded-xl" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}><IcoSearch size={14} color={t.textMuted}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search jobs, companies..." className="flex-1 text-sm bg-transparent outline-none" style={{color:t.text}}/></div></div>
          <div className="flex gap-1 overflow-x-auto" style={{scrollbarWidth:'none'}}>{(['all','remote','urgent','saved','applied'] as const).map(f=>(<button key={f} onClick={()=>setJobFilter(f)} className="px-3 py-1 rounded-full text-[10px] font-medium whitespace-nowrap" style={{background:jobFilter===f?t.accent+'20':t.card,color:jobFilter===f?t.accent:t.textMuted}}>{f==='all'?'🔥 All':f==='remote'?'🏠 Remote':f==='urgent'?'⚡ Urgent':f==='saved'?'💾 Saved':'✅ Applied'}</button>))}</div>
          {filteredJobs.map(j=>(
            <button key={j.id} onClick={()=>setSelJob(j)} className="w-full text-left p-3 rounded-xl" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold" style={{background:t.accent+'15',color:t.accent}}>{j.logo}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1"><p className="text-sm font-semibold truncate">{j.title}</p>{j.urgent&&<span className="text-[8px] px-1 py-0.5 rounded bg-red-100 text-red-600">Urgent</span>}{j.easyApply&&<span className="text-[8px] px-1 py-0.5 rounded bg-green-100 text-green-600">Easy Apply</span>}</div>
                  <p className="text-[10px]" style={{color:t.textMuted}}>{j.company} · {j.location}{j.remote?' · 🏠 Remote':''}</p>
                  <div className="flex items-center gap-2 mt-1"><span className="text-[10px] font-semibold" style={{color:'#22c55e'}}>{j.salary}</span><span className="text-[9px]" style={{color:t.textMuted}}>{j.posted}</span><span className="text-[9px]" style={{color:t.textMuted}}>👥 {j.applicants}</span><span className="text-[9px]" style={{color:t.textMuted}}>via {j.source}</span></div>
                  <div className="flex items-center gap-1 mt-1"><div className="flex-1 h-1 rounded-full" style={{background:t.cardBorder}}><div className="h-1 rounded-full" style={{background:j.match>=90?'#22c55e':j.match>=80?'#3b82f6':'#f59e0b',width:`${j.match}%`}}/></div><span className="text-[9px] font-bold" style={{color:j.match>=90?'#22c55e':'#3b82f6'}}>{j.match}% match</span></div>
                </div>
                <div className="flex flex-col gap-1"><button onClick={e=>{e.stopPropagation();setJobs(p=>p.map(x=>x.id===j.id?{...x,saved:!x.saved}:x));}} className="text-sm">{j.saved?'💾':'🤍'}</button><span className="text-[9px]" style={{color:t.textMuted}}>⭐ {j.compRating}</span></div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* JOB DETAIL */}
      {tab==='jobs'&&selJob&&(
        <div className="space-y-3">
          <button onClick={()=>setSelJob(null)} className="text-xs" style={{color:t.accent}}>← Back to Jobs</button>
          <div className="p-4 rounded-xl" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
            <div className="flex gap-3 mb-3"><div className="w-12 h-12 rounded-lg flex items-center justify-center text-sm font-bold" style={{background:t.accent+'15',color:t.accent}}>{selJob.logo}</div><div><h2 className="text-base font-bold">{selJob.title}</h2><p className="text-xs" style={{color:t.textMuted}}>{selJob.company} · {selJob.location}</p></div></div>
            <div className="flex gap-2 mb-3">{selJob.urgent&&<span className="text-[9px] px-2 py-0.5 rounded-full bg-red-100 text-red-600">Urgent</span>}{selJob.remote&&<span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">Remote</span>}<span className="text-[9px] px-2 py-0.5 rounded-full bg-green-100 text-green-700">{selJob.salary}</span><span className="text-[9px] px-2 py-0.5 rounded-full" style={{background:t.card}}>{selJob.type}</span></div>
            <p className="text-xs mb-3">{selJob.desc}</p>
            <h4 className="text-[10px] font-bold mb-1">Required Skills</h4>
            <div className="flex flex-wrap gap-1 mb-3">{selJob.skills.map(s=>(<span key={s} className="px-2 py-0.5 rounded-full text-[9px]" style={{background:t.accent+'15',color:t.accent}}>{s}</span>))}</div>
            <h4 className="text-[10px] font-bold mb-1">Benefits</h4>
            <div className="flex flex-wrap gap-1 mb-3">{selJob.benefits.map(b=>(<span key={b} className="px-2 py-0.5 rounded-full text-[9px]" style={{background:'rgba(34,197,94,0.1)',color:'#22c55e'}}>{b}</span>))}</div>
            <div className="flex items-center gap-3 mb-3"><span className="text-[10px]">⭐ {selJob.compRating} ({selJob.compReviews} reviews)</span><span className="text-[10px]">👥 {selJob.applicants} applicants</span><span className="text-[10px]">📅 {selJob.posted}</span></div>
            <div className="flex gap-2">
              <button onClick={()=>setJobs(p=>p.map(j=>j.id===selJob.id?{...j,applied:true}:j))} className="flex-1 py-2 rounded-lg text-xs font-bold text-white" style={{background:selJob.applied?'#22c55e':t.accent}}>{selJob.applied?'✅ Applied':'Apply Now'}</button>
              <button onClick={()=>setJobs(p=>p.map(j=>j.id===selJob.id?{...j,saved:!j.saved}:j))} className="px-4 py-2 rounded-lg text-xs" style={{background:t.cardBorder}}>{selJob.saved?'💾 Saved':'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* NETWORK TAB */}
      {tab==='network'&&(
        <div className="space-y-2">
          <div className="flex gap-2 mb-2">{(['connected','pending','suggestion'] as const).map(s=>{const cnt=conns.filter(c=>c.status===s).length;return(<span key={s} className="px-3 py-1 rounded-full text-[10px] font-medium" style={{background:t.card}}>{s==='connected'?'🤝':'🕐'} {s} ({cnt})</span>);})}</div>
          {conns.map(c=>(
            <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{background:t.accent}}>{c.avatar}</div>
              <div className="flex-1 min-w-0"><p className="text-sm font-semibold truncate">{c.name}</p><p className="text-[10px] truncate" style={{color:t.textMuted}}>{c.title}</p><p className="text-[9px]" style={{color:t.textMuted}}>{c.mutual} mutual · Endorsed: {c.endorsed.join(', ')}</p></div>
              {c.status==='suggestion'?<button onClick={()=>setConns(p=>p.map(x=>x.id===c.id?{...x,status:'pending'}:x))} className="px-3 py-1 rounded-lg text-[10px] font-bold text-white" style={{background:t.accent}}>Connect</button>:
               c.status==='pending'?<span className="text-[9px] px-2 py-0.5 rounded-full" style={{background:'rgba(245,158,11,0.15)',color:'#f59e0b'}}>Pending</span>:
               <span className="text-[9px] px-2 py-0.5 rounded-full" style={{background:'rgba(34,197,94,0.15)',color:'#22c55e'}}>Connected</span>}
            </div>
          ))}
        </div>
      )}

      {/* RESUME TAB -- Monster gap: Resume scoring */}
      {tab==='resume'&&(
        <div className="space-y-3">
          <div className="p-4 rounded-xl text-center" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
            <div className="relative inline-block mb-2"><svg width="80" height="80"><circle cx="40" cy="40" r="35" fill="none" stroke={t.cardBorder} strokeWidth="6"/><circle cx="40" cy="40" r="35" fill="none" stroke={resumeScore>=80?'#22c55e':resumeScore>=60?'#f59e0b':'#ef4444'} strokeWidth="6" strokeDasharray={`${resumeScore*2.2} 220`} strokeLinecap="round" transform="rotate(-90 40 40)"/></svg><span className="absolute inset-0 flex items-center justify-center text-lg font-bold">{resumeScore}</span></div>
            <h3 className="text-sm font-bold">Resume Score</h3>
            <p className="text-[10px]" style={{color:t.textMuted}}>AI-analyzed against 10K+ job postings</p>
          </div>
          <div className="space-y-2">
            {[{label:'Keywords Match',val:85,tip:'Add: "microservices", "CI/CD"'},{label:'ATS Compatibility',val:92,tip:'Excellent formatting'},{label:'Experience Relevance',val:78,tip:'Add quantifiable achievements'},{label:'Skills Coverage',val:72,tip:'Add certifications for AWS, K8s'},{label:'Education Match',val:88,tip:'Relevant degree detected'}].map(m=>(
              <div key={m.label} className="p-2 rounded-lg" style={{background:t.card}}>
                <div className="flex justify-between text-xs mb-1"><span>{m.label}</span><span className="font-bold" style={{color:m.val>=80?'#22c55e':m.val>=60?'#f59e0b':'#ef4444'}}>{m.val}%</span></div>
                <div className="h-1.5 rounded-full" style={{background:t.cardBorder}}><div className="h-1.5 rounded-full" style={{background:m.val>=80?'#22c55e':m.val>=60?'#f59e0b':'#ef4444',width:`${m.val}%`}}/></div>
                <p className="text-[9px] mt-1" style={{color:t.textMuted}}>💡 {m.tip}</p>
              </div>
            ))}
          </div>
          <button className="w-full py-2 rounded-lg text-xs font-bold text-white" style={{background:t.accent}}>📄 Upload New Resume</button>
          <button className="w-full py-2 rounded-lg text-xs font-bold" style={{background:t.card,color:t.accent}}>🤖 AI Resume Builder</button>
        </div>
      )}

      {/* COMPANIES TAB -- Indeed gap: Company reviews */}
      {tab==='companies'&&(
        <div className="space-y-2">{COMPANIES.map(c=>(
          <div key={c.name} className="p-3 rounded-xl" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
            <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold" style={{background:t.accent+'15',color:t.accent}}>{c.name.charAt(0)}</div><div className="flex-1"><p className="text-sm font-bold">{c.name}</p><p className="text-[10px]" style={{color:t.textMuted}}>{c.industry} · {c.size} employees</p></div><div className="text-right"><p className="text-sm font-bold flex items-center gap-1">⭐ {c.rating}</p><p className="text-[9px]" style={{color:t.textMuted}}>{c.reviews.toLocaleString()} reviews</p></div></div>
            <div className="grid grid-cols-3 gap-2 mt-2">{[{l:'Open Jobs',v:c.openJobs},{l:'Recommend',v:c.recommend+'%'},{l:'CEO Approval',v:c.ceoApproval+'%'}].map(s=>(<div key={s.l} className="text-center p-1 rounded" style={{background:t.bg}}><p className="text-xs font-bold">{s.v}</p><p className="text-[8px]" style={{color:t.textMuted}}>{s.l}</p></div>))}</div>
          </div>
        ))}</div>
      )}

      {/* INTERVIEWS TAB -- Indeed gap: Interview prep */}
      {tab==='interviews'&&(
        <div className="space-y-2">
          <div className="p-3 rounded-xl" style={{background:'rgba(59,130,246,0.08)',border:'1px solid rgba(59,130,246,0.2)'}}>
            <p className="text-xs font-bold" style={{color:'#3b82f6'}}>🎤 AI Interview Coach</p>
            <p className="text-[10px]" style={{color:t.textMuted}}>Practice with Deto AI for behavioral and technical questions</p>
            <button className="mt-2 px-3 py-1 rounded-lg text-[10px] font-bold text-white" style={{background:'#3b82f6'}}>Start Practice</button>
          </div>
          {INTERVIEWS_DATA.map((iv,i)=>(
            <div key={i} className="p-3 rounded-xl" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
              <div className="flex items-center gap-2"><p className="text-sm font-semibold flex-1">{iv.company} -- {iv.role}</p><span className="text-[9px] px-2 py-0.5 rounded-full" style={{background:iv.status==='scheduled'?'rgba(59,130,246,0.15)':iv.status==='completed'?'rgba(34,197,94,0.15)':'rgba(239,68,68,0.15)',color:iv.status==='scheduled'?'#3b82f6':iv.status==='completed'?'#22c55e':'#ef4444'}}>{iv.status}</span></div>
              <p className="text-[10px]" style={{color:t.textMuted}}>📅 {iv.date} · {iv.type}{iv.rating?` · ⭐ ${iv.rating}/5`:''}</p>
              <p className="text-[10px]">{iv.notes}</p>
            </div>
          ))}
        </div>
      )}

      {/* SALARY TAB -- Monster gap: Salary tools */}
      {tab==='salary'&&(
        <div className="space-y-2">
          <p className="text-xs font-bold">💰 Salary Insights (Canada, 2026)</p>
          {SALARY_DATA.map(s=>(
            <div key={s.role} className="p-3 rounded-xl" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
              <p className="text-xs font-bold mb-2">{s.role}</p>
              <div className="grid grid-cols-4 gap-1">{[{l:'Junior',v:s.junior},{l:'Mid',v:s.mid},{l:'Senior',v:s.senior},{l:'Lead',v:s.lead}].map(lv=>(<div key={lv.l} className="text-center p-1 rounded" style={{background:t.bg}}><p className="text-[9px] font-bold" style={{color:'#22c55e'}}>{lv.v}</p><p className="text-[8px]" style={{color:t.textMuted}}>{lv.l}</p></div>))}</div>
            </div>
          ))}
        </div>
      )}

      {/* SKILLS TAB -- LinkedIn gap: Skill assessments */}
      {tab==='skills'&&(
        <div className="space-y-2">
          <p className="text-xs font-bold">🎯 Skill Assessments & Endorsements</p>
          {SKILL_ASSESS.map(s=>(
            <div key={s.skill} className="p-3 rounded-xl" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
              <div className="flex items-center gap-2 mb-1"><p className="text-sm font-semibold flex-1">{s.skill}</p>{s.verified&&<span className="text-[8px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-600">✅ Verified</span>}<span className="text-[9px] px-2 py-0.5 rounded-full" style={{background:s.level==='Expert'?'rgba(139,92,246,0.15)':s.level==='Advanced'?'rgba(59,130,246,0.15)':'rgba(245,158,11,0.15)',color:s.level==='Expert'?'#8b5cf6':s.level==='Advanced'?'#3b82f6':'#f59e0b'}}>{s.level}</span></div>
              <div className="flex items-center gap-2"><div className="flex-1 h-1.5 rounded-full" style={{background:t.cardBorder}}><div className="h-1.5 rounded-full" style={{background:s.score>=85?'#22c55e':s.score>=70?'#3b82f6':'#f59e0b',width:`${s.score}%`}}/></div><span className="text-[9px] font-bold">{s.score}%</span></div>
              <p className="text-[9px] mt-1" style={{color:t.textMuted}}>👍 {s.endorsements} endorsements</p>
            </div>
          ))}
          <button className="w-full py-2 rounded-lg text-xs font-bold text-white" style={{background:t.accent}}>Take Skill Assessment</button>
        </div>
      )}

      {/* ARTICLES TAB */}
      {tab==='articles'&&(
        <div className="space-y-2">{ARTICLES.map(a=>(
          <div key={a.id} className="p-3 rounded-xl" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
            <p className="text-sm font-semibold">{a.title}</p>
            <p className="text-[10px]" style={{color:t.textMuted}}>by {a.author} · {a.reads} reads · {a.time} read</p>
            <span className="text-[9px] px-2 py-0.5 rounded-full mt-1 inline-block" style={{background:t.accent+'15',color:t.accent}}>{a.tag}</span>
          </div>
        ))}</div>
      )}

      {/* APPLICATION TRACKER -- LinkedIn gap: Status tracking */}
      {tab==='tracker'&&(
        <div className="space-y-2">
          <div className="grid grid-cols-5 gap-1 mb-2">{(['applied','screening','interview','offer','rejected'] as const).map(s=>{const cnt=appTrack.filter(a=>a.status===s).length;return(<div key={s} className="text-center p-2 rounded-lg" style={{background:statusBg(s)}}><p className="text-sm font-bold" style={{color:statusColor(s)}}>{cnt}</p><p className="text-[8px]" style={{color:t.textMuted}}>{s}</p></div>);})}</div>
          {appTrack.map(a=>(
            <div key={a.id} className="p-3 rounded-xl flex items-center gap-3" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
              <div className="w-2 h-full rounded-full" style={{background:statusColor(a.status)}}/>
              <div className="flex-1"><p className="text-sm font-semibold">{a.role}</p><p className="text-[10px]" style={{color:t.textMuted}}>{a.company} · {a.date}{a.salary?` · ${a.salary}`:''}</p><p className="text-[9px]">{a.notes}</p></div>
              <span className="text-[9px] px-2 py-0.5 rounded-full font-medium" style={{background:statusBg(a.status),color:statusColor(a.status)}}>{a.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
