"use client";
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { IcoBack, IcoSearch, IcoHeart, IcoStar, IcoMic, IcoPlay, IcoBookmark } from '@/components/Icons';

type Section = 'games'|'movies'|'tvshows'|'live'|'vacations';
const SECTIONS:{key:Section;label:string;icon:string;color:string}[] = [
  {key:'games',label:'Games',icon:'🎮',color:'#ec4899'},
  {key:'movies',label:'Movies',icon:'🎬',color:'#ef4444'},
  {key:'tvshows',label:'TV Shows',icon:'📺',color:'#3b82f6'},
  {key:'live',label:'Live Matches',icon:'🏟️',color:'#22c55e'},
  {key:'vacations',label:'Vacations',icon:'✈️',color:'#f59e0b'},
];

type Genre = 'All'|'Action'|'Comedy'|'Drama'|'Horror'|'Sci-Fi'|'Romance'|'Thriller'|'Animation'|'Documentary'|'Fantasy';
const GENRES:Genre[] = ['All','Action','Comedy','Drama','Horror','Sci-Fi','Romance','Thriller','Animation','Documentary','Fantasy'];

const MOVIES:{id:string;title:string;genre:Genre;year:number;rating:number;director:string;img:string;duration:string;desc:string;platform:string;trending?:boolean}[] = [
  {id:'m1',title:'Nexus Protocol',genre:'Sci-Fi',year:2026,rating:8.7,director:'Denis Villeneuve',img:'🚀',duration:'2h 34m',desc:'In a future where AI governs cities, one engineer discovers a hidden backdoor.',platform:'Netflix',trending:true},
  {id:'m2',title:'The Last Comedian',genre:'Comedy',year:2026,rating:7.9,director:'Greta Gerwig',img:'😂',duration:'1h 52m',desc:'A stand-up comedian navigates the world of AI-generated humor.',platform:'Prime Video'},
  {id:'m3',title:'Midnight in Mumbai',genre:'Drama',year:2025,rating:8.4,director:'Zoya Akhtar',img:'🌃',duration:'2h 18m',desc:'Three strangers meet during a citywide blackout and discover interconnected fates.',platform:'Hotstar',trending:true},
  {id:'m4',title:'Shadow Protocol',genre:'Thriller',year:2026,rating:8.1,director:'Christopher Nolan',img:'🕵️',duration:'2h 41m',desc:'A spy thriller set across five timelines converging at a single event.',platform:'IMAX'},
  {id:'m5',title:'Monster Academy',genre:'Animation',year:2026,rating:8.5,director:'Pixar Studios',img:'👾',duration:'1h 48m',desc:'Monsters go to school to learn how to NOT scare children in the modern age.',platform:'Disney+',trending:true},
  {id:'m6',title:'The Haunting of Willow Creek',genre:'Horror',year:2025,rating:7.6,director:'Jordan Peele',img:'👻',duration:'2h 05m',desc:'A family moves into a historic farmhouse with a terrifying secret.',platform:'HBO Max'},
  {id:'m7',title:'Love in the Algorithm',genre:'Romance',year:2026,rating:7.8,director:'Nancy Meyers',img:'💕',duration:'1h 55m',desc:'Two AI researchers fall in love while building a dating algorithm.',platform:'Netflix'},
  {id:'m8',title:'Operation Thunderbolt',genre:'Action',year:2026,rating:8.3,director:'Russo Brothers',img:'💥',duration:'2h 22m',desc:'An elite team infiltrates a floating fortress to prevent a global crisis.',platform:'Prime Video',trending:true},
  {id:'m9',title:'Planet Earth IV',genre:'Documentary',year:2026,rating:9.2,director:'David Attenborough',img:'🌍',duration:'8 episodes',desc:'The latest exploration of Earth\'s most extreme environments.',platform:'BBC'},
  {id:'m10',title:'Dragon\'s Keep',genre:'Fantasy',year:2026,rating:8.6,director:'Peter Jackson',img:'🐉',duration:'2h 50m',desc:'An orphan discovers they can communicate with the last living dragons.',platform:'HBO Max'},
];

const TV_SHOWS = [
  {id:'tv1',title:'Code Black',genre:'Drama',seasons:3,rating:8.8,img:'💻',platform:'Netflix',status:'Ongoing',desc:'Silicon Valley developers face ethical dilemmas building AGI.'},
  {id:'tv2',title:'The Neighborhood',genre:'Comedy',seasons:5,rating:8.1,img:'🏘️',platform:'CBC',status:'Ongoing',desc:'Hilarious community dynamics in a diverse Canadian suburb.'},
  {id:'tv3',title:'Dark Matter',genre:'Sci-Fi',seasons:2,rating:8.9,img:'🌀',platform:'Apple TV+',status:'Ongoing',desc:'A physicist discovers parallel universes and must find his way home.'},
  {id:'tv4',title:'Chef\'s Arena',genre:'Reality',seasons:4,rating:8.3,img:'👨‍🍳',platform:'Prime Video',status:'New Season',desc:'Top chefs compete in challenges with ingredients from around the world.'},
  {id:'tv5',title:'Crown & Country',genre:'Drama',seasons:6,rating:9.0,img:'👑',platform:'Netflix',status:'Final Season',desc:'A sweeping drama about Canada\'s founding families.'},
  {id:'tv6',title:'Unsolved: Cold Cases',genre:'Documentary',seasons:3,rating:8.5,img:'🔍',platform:'HBO Max',status:'Ongoing',desc:'Investigative journalists reopen decades-old unsolved cases.'},
];

const LIVE_MATCHES = [
  {id:'lm1',sport:'Hockey',teams:'Maple Leafs vs Canadiens',time:'Tonight 7:00 PM',venue:'Scotiabank Arena',status:'🔴 Live',img:'🏒'},
  {id:'lm2',sport:'Cricket',teams:'India vs Australia',time:'Tomorrow 9:30 AM',venue:'MCG, Melbourne',status:'Upcoming',img:'🏏'},
  {id:'lm3',sport:'Soccer',teams:'TFC vs CF Montreal',time:'Sat 3:00 PM',venue:'BMO Field',status:'Upcoming',img:'⚽'},
  {id:'lm4',sport:'Basketball',teams:'Raptors vs Celtics',time:'Sun 6:00 PM',venue:'Scotiabank Arena',status:'Upcoming',img:'🏀'},
  {id:'lm5',sport:'Tennis',teams:'Djokovic vs Alcaraz',time:'Mon 2:00 PM',venue:'Indian Wells',status:'Upcoming',img:'🎾'},
  {id:'lm6',sport:'F1',teams:'Canadian Grand Prix',time:'June 8',venue:'Circuit Gilles Villeneuve',status:'Tickets Available',img:'🏎️'},
];

const VACATIONS = {
  places:[
    {id:'vp1',name:'Banff National Park',location:'Alberta, Canada',img:'🏔️',rating:4.9,type:'Nature',budget:'$150/day',best:'June-September'},
    {id:'vp2',name:'Goa Beaches',location:'India',img:'🏖️',rating:4.7,type:'Beach',budget:'$50/day',best:'November-March'},
    {id:'vp3',name:'Tokyo',location:'Japan',img:'🏯',rating:4.8,type:'Culture',budget:'$200/day',best:'March-May'},
    {id:'vp4',name:'Niagara Falls',location:'Ontario, Canada',img:'🌊',rating:4.6,type:'Nature',budget:'$120/day',best:'May-October'},
    {id:'vp5',name:'Barcelona',location:'Spain',img:'🏛️',rating:4.8,type:'Culture',budget:'$180/day',best:'April-June'},
    {id:'vp6',name:'Maldives',location:'Indian Ocean',img:'🌴',rating:4.9,type:'Beach',budget:'$350/day',best:'November-April'},
  ],
  bookings:[
    {id:'vb1',name:'Air Canada — YYZ to DEL',type:'✈️ Flight',price:'$890 round trip',rating:4.3,provider:'Air Canada'},
    {id:'vb2',name:'Via Rail — Toronto to Montreal',type:'🚆 Train',price:'$65 one way',rating:4.5,provider:'VIA Rail'},
    {id:'vb3',name:'Marriott Downtown Toronto',type:'🏨 Hotel',price:'$189/night',rating:4.6,provider:'Marriott'},
    {id:'vb4',name:'Enterprise Car Rental — SUV',type:'🚗 Car Rental',price:'$75/day',rating:4.2,provider:'Enterprise'},
    {id:'vb5',name:'Niagara Wine Tour Package',type:'🎫 Experience',price:'$120/person',rating:4.8,provider:'Niagara Tours'},
  ],
  restaurants:[
    {id:'vr1',name:'Pai Northern Thai',cuisine:'Thai',location:'Toronto',rating:4.7,price:'$$',img:'🍜'},
    {id:'vr2',name:'Byblos Toronto',cuisine:'Mediterranean',location:'Toronto',rating:4.8,price:'$$$',img:'🥙'},
    {id:'vr3',name:'Richmond Station',cuisine:'Canadian',location:'Toronto',rating:4.6,price:'$$',img:'🥩'},
    {id:'vr4',name:'Sagar Ratna',cuisine:'Indian Vegetarian',location:'Brampton',rating:4.5,price:'$',img:'🍛'},
    {id:'vr5',name:'Sushi Kaji',cuisine:'Japanese',location:'Etobicoke',rating:4.9,price:'$$$$',img:'🍣'},
    {id:'vr6',name:'Pizzeria Libretto',cuisine:'Italian',location:'Toronto',rating:4.6,price:'$$',img:'🍕'},
  ],
};

export default function EntertainmentPage() {
  const router = useRouter();
  const {isDark,glassLevel,accentColor} = useThemeStore();
  const t = getTheme(isDark,glassLevel,accentColor);
  const [section,setSection] = useState<Section>('games');
  const [genre,setGenre] = useState<Genre>('All');
  const [search,setSearch] = useState('');
  const [saved,setSaved] = useState<string[]>([]);
  const [voiceSrch,setVoiceSrch] = useState(false);
  const [vacTab,setVacTab] = useState<'places'|'bookings'|'restaurants'>('places');
  const [bookingItem, setBookingItem] = useState<any>(null);
  const [bookingStep, setBookingStep] = useState<'details'|'payment'|'confirm'>('details');
  const [bookingPayMethod, setBookingPayMethod] = useState<'card'|'wallet'>('card');
  const [bookingHistory, setBookingHistory] = useState<any[]>(() => {
    try { const s = localStorage.getItem('datore-bookings'); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const saveBooking = (b: any) => {
    const updated = [b, ...bookingHistory];
    setBookingHistory(updated);
    try { localStorage.setItem('datore-bookings', JSON.stringify(updated)); } catch {}
  };
  const handleBook = (item: any) => { setBookingItem(item); setBookingStep('details'); };
  const [bookingProcessing, setBookingProcessing] = useState(false);
  const confirmBooking = () => {
    setBookingProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      const record = { id:`BK-${Date.now().toString().slice(-6)}`, name:bookingItem.name, type:bookingItem.type, price:bookingItem.price, provider:bookingItem.provider, payMethod:bookingPayMethod==='card'?'💳 Card':'👛 Wallet', status:'confirmed', date:new Date().toLocaleDateString('en-CA',{year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}), confirmation:`CNF${Date.now().toString().slice(-8)}` };
      saveBooking(record);
      setBookingProcessing(false);
      setBookingStep('confirm');
      setTimeout(() => { setBookingItem(null); setBookingStep('details'); }, 4000);
    }, 2000);
  };
  const voiceS = () => { setVoiceSrch(true); setTimeout(()=>{setVoiceSrch(false);setSearch('action');},2000); };
  const toggleSave = (id:string) => setSaved(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const filteredMovies = MOVIES.filter(m=>(genre==='All'||m.genre===genre)&&(!search||m.title.toLowerCase().includes(search.toLowerCase())));

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="flex items-center gap-3"><button onClick={()=>router.back()} style={{background:'none',border:'none',color:t.text,cursor:'pointer'}}><IcoBack size={20}/></button><h1 className="text-xl font-bold flex-1">Entertainment</h1>
        <button onClick={voiceS} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:voiceSrch?'rgba(239,68,68,0.15)':'rgba(236,72,153,0.12)'}}><IcoMic size={16} color={voiceSrch?'#ef4444':'#ec4899'}/></button>
      </div>
      {voiceSrch&&<p className="text-[10px] text-center animate-pulse" style={{color:'#ef4444'}}>🎙️ Listening...</p>}

      <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}><IcoSearch size={14} color={t.textMuted}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search entertainment..." className="flex-1 text-sm outline-none bg-transparent" style={{color:t.text}}/></div>

      {/* Section Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1" style={{scrollbarWidth:'none'}}>{SECTIONS.map(s=>(<button key={s.key} onClick={()=>{setSection(s.key);setSearch('');}} className="flex items-center gap-1 px-3 py-1.5 rounded-full whitespace-nowrap" style={{background:section===s.key?s.color+'20':t.card,color:section===s.key?s.color:t.textMuted,border:`1px solid ${section===s.key?s.color+'44':t.cardBorder}`,fontSize:10,fontWeight:600}}><span className="text-xs">{s.icon}</span>{s.label}</button>))}</div>

      {/* ═══ GAMES ═══ */}
      {section==='games'&&(<div className="space-y-3">
        <p className="text-[10px]" style={{color:t.textMuted}}>Browse, install, and play games</p>
        <button onClick={()=>router.push('/games')} className="w-full py-3 rounded-xl text-xs font-bold text-white" style={{background:'linear-gradient(135deg,#ec4899,#8b5cf6)'}}>🎮 Open Full Games Center →</button>
        <p className="text-[9px] text-center" style={{color:t.textMuted}}>12 games · 10 categories · Free & Paid</p>
      </div>)}

      {/* ═══ MOVIES — With Genre Sections ═══ */}
      {section==='movies'&&(<div className="space-y-2">
        {/* Genre Filter */}
        <div className="flex gap-1 overflow-x-auto pb-1" style={{scrollbarWidth:'none'}}>{GENRES.map(g=>(<button key={g} onClick={()=>setGenre(g)} className="px-2.5 py-1 rounded-full text-[9px] font-semibold whitespace-nowrap" style={{background:genre===g?'#ef444420':t.card,color:genre===g?'#ef4444':t.textMuted,border:`1px solid ${genre===g?'#ef444444':t.cardBorder}`}}>{g}</button>))}</div>

        {/* Trending */}
        {genre==='All'&&!search&&(
          <div><h2 className="text-xs font-bold mb-1.5">🔥 Trending Now</h2>
            <div className="flex gap-2 overflow-x-auto pb-1" style={{scrollbarWidth:'none'}}>{MOVIES.filter(m=>m.trending).map(m=>(
              <div key={m.id} className="flex-shrink-0 w-36 p-2 rounded-xl" style={{background:`linear-gradient(135deg,#ef444412,${t.card})`,border:`1px solid ${t.cardBorder}`}}>
                <div className="text-center text-2xl mb-1">{m.img}</div>
                <p className="text-[10px] font-bold truncate">{m.title}</p>
                <p className="text-[8px]" style={{color:t.textMuted}}>⭐ {m.rating} · {m.platform}</p>
              </div>
            ))}</div>
          </div>
        )}

        {/* Genre Sections */}
        {genre==='All'&&!search ? (
          GENRES.filter(g=>g!=='All').map(g=>{
            const genreMovies = MOVIES.filter(m=>m.genre===g);
            if(genreMovies.length===0) return null;
            return (<div key={g}><h2 className="text-xs font-bold mb-1 mt-2">{g}</h2>
              {genreMovies.map(m=>(
                <div key={m.id} className="flex items-center gap-3 p-2 rounded-xl mb-1" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
                  <span className="text-xl">{m.img}</span>
                  <div className="flex-1 min-w-0"><p className="text-[10px] font-bold truncate">{m.title} ({m.year})</p><p className="text-[8px]" style={{color:t.textMuted}}>⭐ {m.rating} · {m.duration} · {m.platform}</p></div>
                  <button onClick={()=>toggleSave(m.id)} className="text-xs">{saved.includes(m.id)?'❤️':'🤍'}</button>
                </div>
              ))}
            </div>);
          })
        ) : (
          filteredMovies.map(m=>(
            <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
              <span className="text-2xl">{m.img}</span>
              <div className="flex-1 min-w-0"><p className="text-xs font-bold truncate">{m.title} ({m.year})</p><p className="text-[9px]" style={{color:t.textMuted}}>{m.director} · {m.duration} · {m.platform}</p><p className="text-[8px] mt-0.5" style={{color:t.textSecondary}}>{m.desc}</p></div>
              <div className="text-right"><span className="text-[10px]">⭐ {m.rating}</span><br/><button onClick={()=>toggleSave(m.id)} className="text-xs">{saved.includes(m.id)?'❤️':'🤍'}</button></div>
            </div>
          ))
        )}
      </div>)}

      {/* ═══ TV SHOWS ═══ */}
      {section==='tvshows'&&(<div className="space-y-2">
        {TV_SHOWS.map(s=>(
          <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
            <span className="text-2xl">{s.img}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">{s.title}</p>
              <p className="text-[9px]" style={{color:t.textMuted}}>{s.genre} · {s.seasons} seasons · {s.platform}</p>
              <p className="text-[8px] mt-0.5" style={{color:t.textSecondary}}>{s.desc}</p>
            </div>
            <div className="text-right"><span className="text-[10px]">⭐ {s.rating}</span><br/>
              <span className="text-[8px] px-1.5 py-0.5 rounded-full" style={{background:s.status==='Ongoing'?'rgba(34,197,94,0.15)':s.status.includes('New')?'rgba(59,130,246,0.15)':'rgba(239,68,68,0.15)',color:s.status==='Ongoing'?'#22c55e':s.status.includes('New')?'#3b82f6':'#ef4444',fontWeight:600}}>{s.status}</span>
            </div>
          </div>
        ))}
      </div>)}

      {/* ═══ LIVE MATCHES ═══ */}
      {section==='live'&&(<div className="space-y-2">
        {LIVE_MATCHES.map(m=>(
          <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl" style={{background:t.card,border:`1px solid ${m.status.includes('Live')?'rgba(239,68,68,0.3)':t.cardBorder}`}}>
            <span className="text-2xl">{m.img}</span>
            <div className="flex-1">
              <p className="text-xs font-bold">{m.teams}</p>
              <p className="text-[9px]" style={{color:t.textMuted}}>{m.sport} · {m.venue}</p>
              <p className="text-[9px] font-medium" style={{color:m.status.includes('Live')?'#ef4444':'#3b82f6'}}>{m.time}</p>
            </div>
            <span className="text-[9px] px-2 py-1 rounded-full font-bold" style={{background:m.status.includes('Live')?'rgba(239,68,68,0.15)':m.status.includes('Ticket')?'rgba(34,197,94,0.15)':'rgba(59,130,246,0.15)',color:m.status.includes('Live')?'#ef4444':m.status.includes('Ticket')?'#22c55e':'#3b82f6'}}>{m.status}</span>
          </div>
        ))}
      </div>)}

      {/* ═══ VACATIONS ═══ */}
      {section==='vacations'&&(<div className="space-y-2">
        <div className="flex p-0.5 rounded-lg" style={{background:t.card}}>{(['places','bookings','restaurants'] as const).map(vt=>(<button key={vt} onClick={()=>setVacTab(vt)} className="flex-1 py-1.5 rounded-md text-[10px] font-semibold capitalize" style={{background:vacTab===vt?'#f59e0b':'transparent',color:vacTab===vt?'#fff':t.textMuted}}>
          {vt==='places'?'🗺️ Places':vt==='bookings'?'✈️ Bookings':'🍽️ Food'}
        </button>))}</div>

        {vacTab==='places'&&VACATIONS.places.map(p=>(
          <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
            <span className="text-2xl">{p.img}</span>
            <div className="flex-1"><p className="text-xs font-bold">{p.name}</p><p className="text-[9px]" style={{color:t.textMuted}}>📍 {p.location} · {p.type}</p>
              <div className="flex gap-2 mt-0.5"><span className="text-[8px]">⭐ {p.rating}</span><span className="text-[8px]" style={{color:'#22c55e'}}>{p.budget}</span><span className="text-[8px]" style={{color:t.textMuted}}>Best: {p.best}</span></div>
            </div>
            <button onClick={()=>toggleSave(p.id)} className="text-xs">{saved.includes(p.id)?'❤️':'🤍'}</button>
          </div>
        ))}

        {vacTab==='bookings'&&(<>
          {/* Booking History */}
          {bookingHistory.length>0&&(<div className="mb-3"><p className="text-[10px] font-bold mb-1" style={{color:'#22c55e'}}>✅ Your Bookings ({bookingHistory.length})</p>
            {bookingHistory.map((bk:any)=>(<div key={bk.id} className="flex items-center gap-2 p-2 rounded-xl mb-1" style={{background:'rgba(34,197,94,0.06)',border:'1px solid rgba(34,197,94,0.15)'}}>
              <span className="text-lg">{bk.type?.split(' ')[0]||'📋'}</span>
              <div className="flex-1 min-w-0"><p className="text-[10px] font-bold truncate">{bk.name}</p><p className="text-[8px]" style={{color:t.textMuted}}>{bk.date} · {bk.payMethod} · Conf: {bk.confirmation}</p></div>
              <div className="text-right"><p className="text-[10px] font-bold" style={{color:'#22c55e'}}>{bk.price}</p><span className="text-[7px] px-1.5 py-0.5 rounded-full font-bold" style={{background:'rgba(34,197,94,0.15)',color:'#22c55e'}}>Confirmed</span></div>
            </div>))}
          </div>)}

          <p className="text-[10px] font-bold mb-1">Available Bookings</p>
          {VACATIONS.bookings.map(b=>(
          <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
            <span className="text-lg">{b.type.split(' ')[0]}</span>
            <div className="flex-1"><p className="text-xs font-bold">{b.name}</p><p className="text-[9px]" style={{color:t.textMuted}}>{b.provider} · ⭐ {b.rating}</p></div>
            <div className="text-right"><p className="text-xs font-bold" style={{color:'#22c55e'}}>{b.price}</p><button onClick={()=>handleBook(b)} className="text-[10px] px-4 py-2 rounded-xl text-white mt-1 font-bold" style={{background:`linear-gradient(135deg,${t.accent},#22c55e)`,boxShadow:'0 2px 8px rgba(34,197,94,0.3)'}}>🎟️ Book Now</button></div>
          </div>
        ))}</>)}

        {/* ═══ BOOKING MODAL ═══ */}
        {bookingItem&&(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{background:'rgba(0,0,0,0.7)'}} onClick={()=>bookingStep!=='confirm'&&setBookingItem(null)}>
            <div onClick={e=>e.stopPropagation()} className="w-full max-w-md rounded-2xl p-5 space-y-4" style={{background:isDark?'#1a1a2e':'#fff',color:t.text}}>
              {bookingStep==='confirm'?(
                <div className="text-center py-4 space-y-3">
                  <div className="text-5xl">✅</div>
                  <h2 className="text-xl font-bold" style={{color:'#22c55e'}}>Booking Confirmed!</h2>
                  <div className="p-3 rounded-xl text-left space-y-1.5" style={{background:isDark?'rgba(34,197,94,0.05)':'rgba(34,197,94,0.03)',border:'1px solid rgba(34,197,94,0.15)'}}>
                    <p className="text-xs font-bold">{bookingItem.name}</p>
                    <div className="flex justify-between text-[10px]"><span style={{color:t.textMuted}}>Type</span><span>{bookingItem.type}</span></div>
                    <div className="flex justify-between text-[10px]"><span style={{color:t.textMuted}}>Provider</span><span>{bookingItem.provider}</span></div>
                    <div className="flex justify-between text-[10px]"><span style={{color:t.textMuted}}>Amount</span><span className="font-bold" style={{color:'#22c55e'}}>{bookingItem.price}</span></div>
                    <div className="flex justify-between text-[10px]"><span style={{color:t.textMuted}}>Payment</span><span>{bookingPayMethod==='card'?'💳 Card':'👛 Wallet'}</span></div>
                    <div className="flex justify-between text-[10px]"><span style={{color:t.textMuted}}>Confirmation</span><span className="font-mono text-[9px]">CNF{Date.now().toString().slice(-8)}</span></div>
                    <div className="flex justify-between text-[10px]"><span style={{color:t.textMuted}}>Status</span><span style={{color:'#22c55e'}}>✅ Confirmed</span></div>
                  </div>
                  <p className="text-[9px]" style={{color:t.textMuted}}>Check your bookings history for updates · Receipt sent to email</p>
                </div>
              ):bookingStep==='payment'?(
                <><h2 className="text-lg font-bold">💳 Payment</h2>
                <div className="p-3 rounded-xl" style={{background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.02)'}}>
                  <div className="flex items-center gap-2 mb-2"><span className="text-lg">{bookingItem.type.split(' ')[0]}</span><div><p className="text-xs font-bold">{bookingItem.name}</p><p className="text-[9px]" style={{color:t.textMuted}}>{bookingItem.provider}</p></div></div>
                  <p className="text-lg font-bold" style={{color:'#22c55e'}}>{bookingItem.price}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">{([{k:'card' as const,l:'💳 Card'},{k:'wallet' as const,l:'👛 Wallet'}]).map(m=>(<button key={m.k} onClick={()=>setBookingPayMethod(m.k)} className="p-3 rounded-xl text-center" style={{background:bookingPayMethod===m.k?t.accent+'15':'transparent',border:`1.5px solid ${bookingPayMethod===m.k?t.accent:t.cardBorder}`}}><p className="text-xs font-bold" style={{color:bookingPayMethod===m.k?t.accent:t.text}}>{m.l}</p></button>))}</div>
                {bookingPayMethod==='card'&&(<div className="grid grid-cols-2 gap-2"><input placeholder="Card Number" maxLength={19} className="col-span-2 p-2 rounded-lg text-xs outline-none" style={{background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.03)',border:`1px solid ${t.cardBorder}`,color:t.text}}/><input placeholder="MM/YY" maxLength={5} className="p-2 rounded-lg text-xs outline-none" style={{background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.03)',border:`1px solid ${t.cardBorder}`,color:t.text}}/><input placeholder="CVV" maxLength={4} type="password" className="p-2 rounded-lg text-xs outline-none" style={{background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.03)',border:`1px solid ${t.cardBorder}`,color:t.text}}/></div>)}
                <div className="flex gap-2"><button onClick={confirmBooking} disabled={bookingProcessing} className="flex-1 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-60" style={{background:`linear-gradient(135deg,${t.accent},#22c55e)`}}>{bookingProcessing?'⏳ Processing Payment...':('Confirm & Pay '+bookingItem.price)}</button>{!bookingProcessing&&<button onClick={()=>setBookingItem(null)} className="px-4 py-3 rounded-xl text-xs" style={{border:`1px solid ${t.cardBorder}`}}>Cancel</button>}</div></>
              ):(
                <><h2 className="text-lg font-bold">📋 Booking Details</h2>
                <div className="p-4 rounded-xl" style={{background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.02)'}}>
                  <div className="text-center text-3xl mb-2">{bookingItem.type.split(' ')[0]}</div>
                  <p className="text-sm font-bold text-center">{bookingItem.name}</p>
                  <p className="text-[10px] text-center" style={{color:t.textMuted}}>{bookingItem.provider} · ⭐ {bookingItem.rating}</p>
                  <p className="text-xl font-bold text-center mt-2" style={{color:'#22c55e'}}>{bookingItem.price}</p>
                </div>
                <div className="space-y-2"><div className="flex justify-between text-xs"><span style={{color:t.textMuted}}>Type</span><span>{bookingItem.type}</span></div><div className="flex justify-between text-xs"><span style={{color:t.textMuted}}>Provider</span><span>{bookingItem.provider}</span></div><div className="flex justify-between text-xs"><span style={{color:t.textMuted}}>Cancellation</span><span style={{color:'#22c55e'}}>Free up to 24hr</span></div></div>
                <div className="flex gap-2"><button onClick={()=>setBookingStep('payment')} className="flex-1 py-3 rounded-xl text-sm font-bold text-white" style={{background:`linear-gradient(135deg,${t.accent},#22c55e)`}}>Proceed to Payment →</button><button onClick={()=>setBookingItem(null)} className="px-4 py-3 rounded-xl text-xs" style={{border:`1px solid ${t.cardBorder}`}}>Cancel</button></div></>
              )}
            </div>
          </div>
        )}

        {vacTab==='restaurants'&&VACATIONS.restaurants.map(r=>(
          <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
            <span className="text-2xl">{r.img}</span>
            <div className="flex-1"><p className="text-xs font-bold">{r.name}</p><p className="text-[9px]" style={{color:t.textMuted}}>{r.cuisine} · 📍 {r.location} · {r.price}</p></div>
            <span className="text-[10px]">⭐ {r.rating}</span>
          </div>
        ))}
      </div>)}
    </div>
  );
}
