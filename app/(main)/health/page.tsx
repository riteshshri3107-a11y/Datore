"use client";
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { useAuthStore } from '@/store/useAuthStore';
import { getTheme } from '@/lib/theme';
import { IcoBack, IcoSearch, IcoHeart, IcoStar, IcoMic, IcoVideo, IcoChat, IcoCalendar, IcoUser } from '@/components/Icons';

type Section = 'doctor'|'fitness'|'diet'|'yoga'|'exercises';
const SECTIONS:{key:Section;label:string;icon:string;color:string}[] = [
  {key:'doctor',label:'Online Dr',icon:'🩺',color:'#ef4444'},
  {key:'fitness',label:'Fitness',icon:'💪',color:'#3b82f6'},
  {key:'diet',label:'Healthy Diet',icon:'🥗',color:'#22c55e'},
  {key:'yoga',label:'Yoga',icon:'🧘',color:'#8b5cf6'},
  {key:'exercises',label:'Exercises',icon:'🏋️',color:'#f59e0b'},
];

interface Doctor {
  id:string; name:string; specialty:string; country:string; license:string; rating:number; reviews:number;
  avatar:string; available:string[]; price:{chat:string;voice:string;video:string}; languages:string[];
  experience:string; hospital:string; verified:boolean; nextSlot:string;
}

const DOCTORS:Doctor[] = [
  {id:'dr1',name:'Dr. Sarah Mitchell',specialty:'General Physician',country:'Canada',license:'CPSO #12345',rating:4.9,reviews:342,avatar:'👩‍⚕️',available:['chat','voice','video'],price:{chat:'$25',voice:'$45',video:'$75'},languages:['English','French'],experience:'15 years',hospital:'Toronto General Hospital',verified:true,nextSlot:'Today 2:30 PM'},
  {id:'dr2',name:'Dr. Rajesh Patel',specialty:'Cardiologist',country:'India',license:'MCI #67890',rating:4.8,reviews:567,avatar:'👨‍⚕️',available:['chat','voice','video'],price:{chat:'₹500',voice:'₹800',video:'₹1200'},languages:['English','Hindi','Gujarati'],experience:'20 years',hospital:'AIIMS Delhi',verified:true,nextSlot:'Today 4:00 PM'},
  {id:'dr3',name:'Dr. Emily Wong',specialty:'Dermatologist',country:'Canada',license:'CPSO #54321',rating:4.7,reviews:218,avatar:'👩‍⚕️',available:['chat','video'],price:{chat:'$30',voice:'$50',video:'$85'},languages:['English','Mandarin'],experience:'12 years',hospital:'Sunnybrook Hospital',verified:true,nextSlot:'Tomorrow 10:00 AM'},
  {id:'dr4',name:'Dr. Arun Sharma',specialty:'Pediatrician',country:'India',license:'MCI #11223',rating:4.9,reviews:890,avatar:'👨‍⚕️',available:['chat','voice','video'],price:{chat:'₹400',voice:'₹700',video:'₹1000'},languages:['English','Hindi'],experience:'18 years',hospital:'Fortis Hospital',verified:true,nextSlot:'Today 5:30 PM'},
  {id:'dr5',name:'Dr. James Thompson',specialty:'Psychiatrist',country:'Canada',license:'CPSO #99887',rating:4.8,reviews:156,avatar:'👨‍⚕️',available:['voice','video'],price:{chat:'$35',voice:'$60',video:'$100'},languages:['English'],experience:'22 years',hospital:'CAMH Toronto',verified:true,nextSlot:'Wed 11:00 AM'},
  {id:'dr6',name:'Dr. Priya Krishnan',specialty:'Nutritionist',country:'India',license:'DNHE #44556',rating:4.6,reviews:423,avatar:'👩‍⚕️',available:['chat','voice','video'],price:{chat:'₹350',voice:'₹600',video:'₹900'},languages:['English','Hindi','Tamil'],experience:'10 years',hospital:'Apollo Hospitals',verified:true,nextSlot:'Today 6:00 PM'},
];

const FITNESS_DATA = [
  {id:'f1',title:'5K Running Plan for Beginners',type:'Program',duration:'8 weeks',level:'Beginner',img:'🏃',cal:'300-400/session',equipment:'Running shoes'},
  {id:'f2',title:'HIIT Fat Burn Circuit',type:'Workout',duration:'25 min',level:'Intermediate',img:'🔥',cal:'400-500',equipment:'None'},
  {id:'f3',title:'Strength Training Basics',type:'Program',duration:'12 weeks',level:'Beginner',img:'💪',cal:'250-350/session',equipment:'Dumbbells'},
  {id:'f4',title:'Swimming Cardio Plan',type:'Program',duration:'6 weeks',level:'All Levels',img:'🏊',cal:'500-700/session',equipment:'Pool access'},
  {id:'f5',title:'Desk Worker Stretching Routine',type:'Daily',duration:'10 min',level:'Beginner',img:'🪑',cal:'50-80',equipment:'None'},
  {id:'f6',title:'Core Strength Challenge',type:'30-Day',duration:'15-20 min/day',level:'Intermediate',img:'🎯',cal:'200-300',equipment:'Mat'},
];

const DIET_PLANS = [
  {id:'d1',title:'Mediterranean Diet Plan',type:'Weekly Plan',cal:'1800-2200',img:'🫒',benefit:'Heart health, weight management',meals:'3 meals + 2 snacks'},
  {id:'d2',title:'Indian Vegetarian Balanced Diet',type:'Weekly Plan',cal:'1600-2000',img:'🍛',benefit:'Complete nutrition, low cholesterol',meals:'3 meals + 2 snacks'},
  {id:'d3',title:'Keto Diet Guide',type:'Meal Plan',cal:'1500-1800',img:'🥑',benefit:'Weight loss, energy boost',meals:'3 meals + 1 snack'},
  {id:'d4',title:'Anti-Inflammatory Foods',type:'Guide',cal:'Varies',img:'🫐',benefit:'Reduce inflammation, joint health',meals:'Food recommendations'},
  {id:'d5',title:'High Protein Muscle Building',type:'Weekly Plan',cal:'2500-3000',img:'🥩',benefit:'Muscle growth, recovery',meals:'5-6 small meals'},
  {id:'d6',title:'Plant-Based Nutrition Guide',type:'Guide',cal:'1800-2200',img:'🥬',benefit:'Sustainability, overall health',meals:'3 meals + 2 snacks'},
];

const YOGA_SESSIONS = [
  {id:'y1',title:'Morning Sun Salutation',type:'Flow',duration:'20 min',level:'Beginner',img:'🌅',benefit:'Energy, flexibility',poses:12},
  {id:'y2',title:'Stress Relief Yoga',type:'Restorative',duration:'30 min',level:'All Levels',img:'🧘',benefit:'Calm, relaxation',poses:8},
  {id:'y3',title:'Power Yoga Flow',type:'Vinyasa',duration:'45 min',level:'Advanced',img:'💪',benefit:'Strength, endurance',poses:25},
  {id:'y4',title:'Bedtime Yoga Routine',type:'Yin',duration:'15 min',level:'Beginner',img:'🌙',benefit:'Better sleep, relaxation',poses:6},
  {id:'y5',title:'Yoga for Back Pain',type:'Therapeutic',duration:'25 min',level:'All Levels',img:'🔄',benefit:'Pain relief, posture',poses:10},
  {id:'y6',title:'Pranayama Breathing',type:'Breathwork',duration:'15 min',level:'All Levels',img:'🌬️',benefit:'Focus, lung capacity',poses:5},
  {id:'y7',title:'Kids Yoga Adventure',type:'Fun Flow',duration:'15 min',level:'Kids',img:'🦋',benefit:'Coordination, fun, flexibility',poses:8},
];

const EXERCISES = [
  {id:'e1',title:'Push-Up Variations',muscle:'Chest, Triceps',reps:'3 × 12-15',img:'💪',level:'All',video:true},
  {id:'e2',title:'Squats & Lunges',muscle:'Quads, Glutes',reps:'3 × 15-20',img:'🦵',level:'Beginner',video:true},
  {id:'e3',title:'Plank Challenge',muscle:'Core',reps:'Hold 30-60s × 3',img:'🎯',level:'All',video:true},
  {id:'e4',title:'Burpees',muscle:'Full Body',reps:'3 × 10',img:'🔥',level:'Intermediate',video:true},
  {id:'e5',title:'Deadlifts',muscle:'Back, Legs, Core',reps:'3 × 8-10',img:'🏋️',level:'Advanced',video:true},
  {id:'e6',title:'Jumping Rope',muscle:'Cardio, Calves',reps:'3 × 2 min',img:'🤸',level:'All',video:true},
  {id:'e7',title:'Resistance Band Rows',muscle:'Back, Biceps',reps:'3 × 12',img:'💪',level:'Beginner',video:true},
  {id:'e8',title:'Mountain Climbers',muscle:'Core, Cardio',reps:'3 × 20',img:'⛰️',level:'Intermediate',video:true},
];

export default function HealthPage() {
  const router = useRouter();
  const {isDark,glassLevel,accentColor} = useThemeStore();
  const { user } = useAuthStore();
  const t = getTheme(isDark,glassLevel,accentColor);
  const [section,setSection] = useState<Section>('doctor');
  const [search,setSearch] = useState('');
  const [voiceSrch,setVoiceSrch] = useState(false);
  const [selDoc,setSelDoc] = useState<Doctor|null>(null);
  const [bookMode,setBookMode] = useState<'chat'|'voice'|'video'>('chat');
  const [bookDate,setBookDate] = useState('');
  const [bookConfirmed,setBookConfirmed] = useState(false);
  const [drCountry,setDrCountry] = useState<'All'|'Canada'|'India'>('All');
  const [drSpecialty,setDrSpecialty] = useState('All');
  const [saved,setSaved] = useState<string[]>([]);

  const voiceS = () => { setVoiceSrch(true); setTimeout(()=>{setVoiceSrch(false);setSearch('yoga');},2000); };
  const toggleSave = (id:string) => setSaved(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);

  const filteredDocs = DOCTORS.filter(d=>{
    if(drCountry!=='All'&&d.country!==drCountry) return false;
    if(drSpecialty!=='All'&&d.specialty!==drSpecialty) return false;
    if(search&&!d.name.toLowerCase().includes(search.toLowerCase())&&!d.specialty.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const confirmBooking = () => { setBookConfirmed(true); setTimeout(()=>{setBookConfirmed(false);setSelDoc(null);},3000); };

  // ═══ DOCTOR DETAIL ═══
  if(selDoc) return (
    <div className="space-y-3 animate-fade-in">
      <button onClick={()=>setSelDoc(null)} className="flex items-center gap-2 text-xs" style={{color:t.accent}}><IcoBack size={14}/> Back to Doctors</button>
      {bookConfirmed ? (
        <div className="text-center py-8 space-y-3 p-4 rounded-xl" style={{background:t.card}}>
          <div className="text-5xl">✅</div>
          <h2 className="text-lg font-bold" style={{color:'#22c55e'}}>Appointment Booked!</h2>
          <p className="text-xs" style={{color:t.textMuted}}>Your {bookMode} consultation with {selDoc.name} is confirmed.</p>
          <p className="text-xs font-bold">{selDoc.nextSlot}</p>
        </div>
      ) : (
        <div className="p-4 rounded-xl space-y-3" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl" style={{background:'rgba(239,68,68,0.1)'}}>{selDoc.avatar}</div>
            <div className="flex-1">
              <div className="flex items-center gap-1"><h2 className="text-base font-bold">{selDoc.name}</h2>{selDoc.verified&&<span className="text-[8px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-600 font-bold">✓ Verified</span>}</div>
              <p className="text-[10px]" style={{color:t.textMuted}}>{selDoc.specialty} · {selDoc.experience}</p>
              <p className="text-[10px]" style={{color:t.textMuted}}>🏥 {selDoc.hospital} · {selDoc.country}</p>
              <p className="text-[9px]" style={{color:t.textMuted}}>License: {selDoc.license}</p>
            </div>
          </div>
          <div className="flex items-center gap-2"><span className="text-[10px]">⭐ {selDoc.rating}</span><span className="text-[9px]" style={{color:t.textMuted}}>({selDoc.reviews} reviews)</span><span className="text-[9px]" style={{color:t.textMuted}}>🗣️ {selDoc.languages.join(', ')}</span></div>

          {/* Consultation Mode */}
          <div><p className="text-[10px] font-bold mb-1.5" style={{color:t.textMuted}}>CONSULTATION TYPE</p>
            <div className="grid grid-cols-3 gap-2">{(['chat','voice','video'] as const).map(m=>{
              const avail = selDoc.available.includes(m);
              return (<button key={m} onClick={()=>avail&&setBookMode(m)} disabled={!avail} className="p-2.5 rounded-xl text-center disabled:opacity-30" style={{background:bookMode===m?'#ef444415':'transparent',border:`1.5px solid ${bookMode===m?'#ef4444':t.cardBorder}`}}>
                <span className="text-lg">{m==='chat'?'💬':m==='voice'?'📞':'📹'}</span>
                <p className="text-[10px] font-bold capitalize" style={{color:bookMode===m?'#ef4444':t.text}}>{m}</p>
                <p className="text-[9px] font-bold" style={{color:'#22c55e'}}>{selDoc.price[m]}</p>
                {!avail&&<p className="text-[7px]" style={{color:'#ef4444'}}>Unavailable</p>}
              </button>);
            })}</div>
          </div>

          {/* Schedule */}
          <div><p className="text-[10px] font-bold mb-1" style={{color:t.textMuted}}>NEXT AVAILABLE</p>
            <p className="text-xs font-bold" style={{color:'#22c55e'}}>{selDoc.nextSlot}</p>
            <div className="flex gap-1 mt-1">{['Today','Tomorrow','This Week'].map(d=>(<button key={d} onClick={()=>setBookDate(d)} className="px-3 py-1 rounded-lg text-[9px] font-medium" style={{background:bookDate===d?'#ef444415':t.card,color:bookDate===d?'#ef4444':t.textMuted,border:`1px solid ${bookDate===d?'#ef444444':t.cardBorder}`}}>{d}</button>))}</div>
          </div>

          <div className="p-2 rounded-lg" style={{background:'rgba(59,130,246,0.08)',border:'1px solid rgba(59,130,246,0.15)'}}>
            <p className="text-[9px]" style={{color:'#3b82f6'}}>🔒 All doctors are licensed and verified by their country's medical board. Consultations are private and encrypted.</p>
          </div>

          <button onClick={confirmBooking} className="w-full py-3 rounded-xl text-sm font-bold text-white" style={{background:'linear-gradient(135deg,#ef4444,#ec4899)'}}>
            Book {bookMode.charAt(0).toUpperCase()+bookMode.slice(1)} Consultation — {selDoc.price[bookMode]}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="flex items-center gap-3"><button onClick={()=>router.back()} style={{background:'none',border:'none',color:t.text,cursor:'pointer'}}><IcoBack size={20}/></button><h1 className="text-xl font-bold flex-1">Health</h1>
        <button onClick={voiceS} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:voiceSrch?'rgba(239,68,68,0.15)':'rgba(16,185,129,0.12)'}}><IcoMic size={16} color={voiceSrch?'#ef4444':'#10b981'}/></button>
      </div>
      {voiceSrch&&<p className="text-[10px] text-center animate-pulse" style={{color:'#ef4444'}}>🎙️ Listening...</p>}

      <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}><IcoSearch size={14} color={t.textMuted}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search health content..." className="flex-1 text-sm outline-none bg-transparent" style={{color:t.text}}/></div>

      <div className="flex gap-1.5 overflow-x-auto pb-1" style={{scrollbarWidth:'none'}}>{SECTIONS.map(s=>(<button key={s.key} onClick={()=>{setSection(s.key);setSearch('');}} className="flex items-center gap-1 px-3 py-1.5 rounded-full whitespace-nowrap" style={{background:section===s.key?s.color+'20':t.card,color:section===s.key?s.color:t.textMuted,border:`1px solid ${section===s.key?s.color+'44':t.cardBorder}`,fontSize:10,fontWeight:600}}><span className="text-xs">{s.icon}</span>{s.label}</button>))}</div>

      {/* ═══ ONLINE DOCTOR ═══ */}
      {section==='doctor'&&(<div className="space-y-2">
        <div className="p-3 rounded-xl" style={{background:'rgba(239,68,68,0.06)',border:'1px solid rgba(239,68,68,0.15)'}}>
          <p className="text-[9px] font-bold" style={{color:'#ef4444'}}>🏥 Country-Approved Doctors Only</p>
          <p className="text-[8px]" style={{color:t.textMuted}}>All doctors are licensed by their country's medical regulatory body. Consult via chat, voice, or video call.</p>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-1">{(['All','Canada','India'] as const).map(c=>(<button key={c} onClick={()=>setDrCountry(c)} className="px-2 py-0.5 rounded-lg text-[9px] font-medium" style={{background:drCountry===c?'#ef444415':'transparent',color:drCountry===c?'#ef4444':t.textMuted}}>{c==='All'?'🌍':c==='Canada'?'🇨🇦':'🇮🇳'} {c}</button>))}</div>
          <select value={drSpecialty} onChange={e=>setDrSpecialty(e.target.value)} className="px-2 py-0.5 rounded-lg text-[9px]" style={{background:t.card,color:t.text,border:`1px solid ${t.cardBorder}`}}>
            {['All','General Physician','Cardiologist','Dermatologist','Pediatrician','Psychiatrist','Nutritionist'].map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
        {filteredDocs.map(d=>(
          <button key={d.id} onClick={()=>setSelDoc(d)} className="w-full text-left flex items-center gap-3 p-3 rounded-xl" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0" style={{background:'rgba(239,68,68,0.1)'}}>{d.avatar}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1"><p className="text-xs font-bold truncate">{d.name}</p>{d.verified&&<span className="text-[7px] px-1 py-0.5 rounded bg-blue-100 text-blue-600">✓</span>}</div>
              <p className="text-[9px]" style={{color:t.textMuted}}>{d.specialty} · {d.country} · ⭐ {d.rating}</p>
              <div className="flex gap-1 mt-0.5">{d.available.map(a=>(<span key={a} className="text-[7px] px-1.5 py-0.5 rounded-full" style={{background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)'}}>{a==='chat'?'💬':a==='voice'?'📞':'📹'} {a}</span>))}</div>
            </div>
            <div className="text-right flex-shrink-0"><p className="text-[9px] font-bold" style={{color:'#22c55e'}}>{d.nextSlot.split(' ').slice(0,1)}</p><p className="text-[8px]" style={{color:t.textMuted}}>From {d.price.chat}</p></div>
          </button>
        ))}
      </div>)}

      {/* ═══ FITNESS ═══ */}
      {section==='fitness'&&(<div className="space-y-2">
        {FITNESS_DATA.map(f=>(
          <div key={f.id} className="flex items-center gap-3 p-3 rounded-xl" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
            <span className="text-2xl">{f.img}</span>
            <div className="flex-1"><p className="text-xs font-bold">{f.title}</p><p className="text-[9px]" style={{color:t.textMuted}}>{f.type} · {f.duration} · {f.level}</p>
              <div className="flex gap-2 mt-0.5"><span className="text-[8px]" style={{color:'#ef4444'}}>🔥 {f.cal} cal</span><span className="text-[8px]" style={{color:t.textMuted}}>🏋️ {f.equipment}</span></div>
            </div>
            <button onClick={()=>toggleSave(f.id)} className="text-sm">{saved.includes(f.id)?'💾':'🤍'}</button>
          </div>
        ))}
      </div>)}

      {/* ═══ HEALTHY DIET ═══ */}
      {section==='diet'&&(<div className="space-y-2">
        {DIET_PLANS.map(d=>(
          <div key={d.id} className="flex items-center gap-3 p-3 rounded-xl" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
            <span className="text-2xl">{d.img}</span>
            <div className="flex-1"><p className="text-xs font-bold">{d.title}</p><p className="text-[9px]" style={{color:t.textMuted}}>{d.type} · {d.cal} cal/day · {d.meals}</p><p className="text-[8px] mt-0.5" style={{color:'#22c55e'}}>✅ {d.benefit}</p></div>
            <button onClick={()=>toggleSave(d.id)} className="text-sm">{saved.includes(d.id)?'💾':'🤍'}</button>
          </div>
        ))}
      </div>)}

      {/* ═══ YOGA ═══ */}
      {section==='yoga'&&(<div className="space-y-2">
        {YOGA_SESSIONS.map(y=>(
          <div key={y.id} className="flex items-center gap-3 p-3 rounded-xl" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
            <span className="text-2xl">{y.img}</span>
            <div className="flex-1"><p className="text-xs font-bold">{y.title}</p><p className="text-[9px]" style={{color:t.textMuted}}>{y.type} · {y.duration} · {y.level} · {y.poses} poses</p><p className="text-[8px] mt-0.5" style={{color:'#8b5cf6'}}>🧘 {y.benefit}</p></div>
            <button onClick={()=>toggleSave(y.id)} className="text-sm">{saved.includes(y.id)?'💾':'🤍'}</button>
          </div>
        ))}
      </div>)}

      {/* ═══ EXERCISES ═══ */}
      {section==='exercises'&&(<div className="space-y-2">
        <div className="flex gap-1">{['All','Beginner','Intermediate','Advanced'].map(l=>(<button key={l} className="px-2 py-0.5 rounded-lg text-[8px] font-medium" style={{background:t.card,color:t.textMuted}}>{l}</button>))}</div>
        {EXERCISES.map(e=>(
          <div key={e.id} className="flex items-center gap-3 p-3 rounded-xl" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
            <span className="text-2xl">{e.img}</span>
            <div className="flex-1"><p className="text-xs font-bold">{e.title}</p><p className="text-[9px]" style={{color:t.textMuted}}>{e.muscle} · {e.reps} · {e.level}</p></div>
            <div className="flex gap-1">{e.video&&<span className="text-[8px] px-1.5 py-0.5 rounded-full" style={{background:'rgba(239,68,68,0.15)',color:'#ef4444'}}>▶ Video</span>}
              <button onClick={()=>toggleSave(e.id)} className="text-sm">{saved.includes(e.id)?'💾':'🤍'}</button>
            </div>
          </div>
        ))}
      </div>)}
    </div>
  );
}
