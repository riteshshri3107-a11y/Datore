"use client";
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { IcoBack, IcoSearch, IcoStar, IcoHeart, IcoMic, IcoUser, IcoSend, IcoChat, IcoPlus } from '@/components/Icons';

/* NearBy — Combined Local Jobs + Buy/Sell Marketplace
   Local Jobs: Babysitter, Dog Walker, Tutor, Cleaner, Handyman, etc.
   Marketplace: Buy & Sell items locally — furniture, electronics, clothing, etc. */

type JobCat = 'All'|'Babysitting'|'Dog Walking'|'Tutoring'|'Cleaning'|'Handyman'|'Moving'|'Gardening'|'Pet Care'|'Cooking'|'Errands'|'Tech Help';
type ItemCat = 'All'|'Electronics'|'Furniture'|'Clothing'|'Sports'|'Books'|'Toys'|'Vehicles'|'Home'|'Garden'|'Free';

interface LocalJob {
  id:string; title:string; poster:string; avatar:string; cat:JobCat; rate:string; type:'hourly'|'fixed'|'negotiable';
  location:string; distance:string; posted:string; desc:string; rating:number; reviews:number;
  schedule:string; urgent?:boolean; verified?:boolean;
}

interface MarketItem {
  id:string; title:string; seller:string; avatar:string; cat:ItemCat; price:number; condition:'New'|'Like New'|'Good'|'Fair';
  location:string; distance:string; posted:string; desc:string; img:string; saved?:boolean;
  negotiable?:boolean; delivery?:boolean; featured?:boolean;
}

const LOCAL_JOBS:LocalJob[] = [
  {id:'lj1',title:'Babysitter Needed — Weekday Evenings',poster:'Amanda R.',avatar:'👩',cat:'Babysitting',rate:'$22/hr',type:'hourly',location:'Brampton, ON',distance:'2.3 km',posted:'1h ago',desc:'Looking for experienced babysitter for 2 kids (ages 4 & 7). Mon-Fri 5-9 PM. Must have First Aid.',rating:4.8,reviews:12,schedule:'Mon-Fri 5-9 PM',urgent:true,verified:true},
  {id:'lj2',title:'Dog Walker — Morning Walks',poster:'James K.',avatar:'👨',cat:'Dog Walking',rate:'$18/hr',type:'hourly',location:'Mississauga, ON',distance:'3.1 km',posted:'3h ago',desc:'Need reliable dog walker for my golden retriever. Daily morning walks 7-8 AM.',rating:4.5,reviews:8,schedule:'Daily 7-8 AM',verified:true},
  {id:'lj3',title:'Math Tutor for Grade 8',poster:'Priya S.',avatar:'👩‍🏫',cat:'Tutoring',rate:'$35/hr',type:'hourly',location:'Toronto, ON',distance:'1.5 km',posted:'5h ago',desc:'Looking for patient math tutor for my son preparing for high school entrance. 2x per week.',rating:4.9,reviews:23,schedule:'Tue & Thu 4-6 PM'},
  {id:'lj4',title:'Deep Clean — 3BR House',poster:'Mike D.',avatar:'👨‍🔧',cat:'Cleaning',rate:'$150',type:'fixed',location:'Scarborough, ON',distance:'5.2 km',posted:'1d ago',desc:'One-time deep clean for 3 bedroom house. Kitchen, bathrooms, all rooms. Supplies provided.',rating:4.3,reviews:5,schedule:'This Saturday'},
  {id:'lj5',title:'Handyman — Fence Repair',poster:'Tom W.',avatar:'🧑‍🔧',cat:'Handyman',rate:'$40/hr',type:'hourly',location:'Etobicoke, ON',distance:'4.8 km',posted:'2h ago',desc:'Need someone to repair wooden fence panels (approx 3 panels). Tools required.',rating:4.7,reviews:15,schedule:'Flexible',urgent:true},
  {id:'lj6',title:'Help Moving — 1BR Apartment',poster:'Lisa C.',avatar:'👩‍💼',cat:'Moving',rate:'$200',type:'fixed',location:'North York, ON',distance:'2.9 km',posted:'6h ago',desc:'Need 2 strong helpers to move 1BR apartment. Elevator building. Truck provided.',rating:4.4,reviews:3,schedule:'March 8'},
  {id:'lj7',title:'Garden Spring Cleanup',poster:'Helen M.',avatar:'👵',cat:'Gardening',rate:'$25/hr',type:'hourly',location:'Oakville, ON',distance:'8.1 km',posted:'4h ago',desc:'Spring yard cleanup: rake leaves, trim bushes, prepare garden beds for planting.',rating:4.6,reviews:9,schedule:'Weekends'},
  {id:'lj8',title:'Cat Sitter — 1 Week Vacation',poster:'Sarah L.',avatar:'🧑',cat:'Pet Care',rate:'$30/day',type:'fixed',location:'Toronto, ON',distance:'1.2 km',posted:'2d ago',desc:'Need someone to visit daily and feed 2 cats, clean litter. March 15-22.',rating:4.8,reviews:18,schedule:'Mar 15-22'},
  {id:'lj9',title:'Home Cooked Meals — Vegetarian',poster:'Anita P.',avatar:'👩‍🍳',cat:'Cooking',rate:'Negotiable',type:'negotiable',location:'Brampton, ON',distance:'3.5 km',posted:'1d ago',desc:'Looking for someone to cook vegetarian meals 3x/week for family of 4. Indian cuisine preferred.',rating:4.2,reviews:6,schedule:'Mon/Wed/Fri'},
  {id:'lj10',title:'WiFi & Smart Home Setup',poster:'Dave R.',avatar:'🧑‍💻',cat:'Tech Help',rate:'$50/hr',type:'hourly',location:'Mississauga, ON',distance:'4.0 km',posted:'8h ago',desc:'Need help setting up mesh WiFi, smart locks, and Ring cameras in new house.',rating:4.5,reviews:11,schedule:'Anytime this week'},
];

const MARKET_ITEMS:MarketItem[] = [
  {id:'mi1',title:'MacBook Pro 2023 M3 — Barely Used',seller:'Alex T.',avatar:'🧑',cat:'Electronics',price:1400,condition:'Like New',location:'Toronto, ON',distance:'2.1 km',posted:'2h ago',desc:'Only 6 months old, 512GB, 16GB RAM. Includes charger and case. Selling because I got a work laptop.',img:'💻',negotiable:true,featured:true},
  {id:'mi2',title:'IKEA Malm Dresser — White',seller:'Nina K.',avatar:'👩',cat:'Furniture',price:80,condition:'Good',location:'Mississauga, ON',distance:'4.3 km',posted:'1d ago',desc:'6-drawer IKEA Malm dresser in white. Some minor scratches. Must pick up.',img:'🗄️',negotiable:true},
  {id:'mi3',title:'Canada Goose Parka — Size M',seller:'Chris B.',avatar:'👨',cat:'Clothing',price:450,condition:'Like New',location:'North York, ON',distance:'3.2 km',posted:'5h ago',desc:'Authentic Canada Goose Expedition Parka, worn only twice. With receipt for authentication.',img:'🧥',featured:true},
  {id:'mi4',title:'Trek Mountain Bike — 29"',seller:'Jeff M.',avatar:'🚴',cat:'Sports',price:650,condition:'Good',location:'Scarborough, ON',distance:'6.1 km',posted:'3d ago',desc:'Trek Marlin 7, 29" wheels, Shimano gears. Recently serviced. Great for trails.',img:'🚲',negotiable:true},
  {id:'mi5',title:'Textbooks — U of T Comp Sci',seller:'Priya R.',avatar:'👩‍🎓',cat:'Books',price:25,condition:'Good',location:'Toronto, ON',distance:'1.0 km',posted:'4h ago',desc:'Bundle of 5 first-year CS textbooks. Some highlighting. Save $200+ buying new.',img:'📚'},
  {id:'mi6',title:'Nintendo Switch + 4 Games',seller:'Tommy L.',avatar:'🎮',cat:'Toys',price:280,condition:'Good',location:'Brampton, ON',distance:'5.5 km',posted:'1d ago',desc:'Nintendo Switch with dock, 2 controllers, and 4 games (Mario Kart, Zelda, Pokemon, Smash).',img:'🎮',negotiable:true,featured:true},
  {id:'mi7',title:'Honda Civic 2019 — 65K km',seller:'Dave P.',avatar:'🚗',cat:'Vehicles',price:18500,condition:'Good',location:'Oakville, ON',distance:'12 km',posted:'2d ago',desc:'Clean title, regularly maintained, winter tires included. Safety certified.',img:'🚗'},
  {id:'mi8',title:'Dyson V11 Vacuum',seller:'Kate W.',avatar:'👩',cat:'Home',price:200,condition:'Like New',location:'Etobicoke, ON',distance:'4.0 km',posted:'6h ago',desc:'Used for 3 months, works perfectly. With all attachments and wall mount.',img:'🧹'},
  {id:'mi9',title:'Raised Garden Bed — Cedar',seller:'Mark H.',avatar:'🌱',cat:'Garden',price:60,condition:'New',location:'Toronto, ON',distance:'2.8 km',posted:'3h ago',desc:'Brand new cedar raised garden bed, 4x8 ft. Never assembled. Bought wrong size.',img:'🌿',delivery:true},
  {id:'mi10',title:'Moving Boxes — FREE',seller:'Lisa C.',avatar:'📦',cat:'Free',price:0,condition:'Good',location:'North York, ON',distance:'2.9 km',posted:'1h ago',desc:'About 30 moving boxes, various sizes. Free to anyone who picks up today.',img:'📦'},
];

const JOB_CATS:JobCat[] = ['All','Babysitting','Dog Walking','Tutoring','Cleaning','Handyman','Moving','Gardening','Pet Care','Cooking','Errands','Tech Help'];
const ITEM_CATS:ItemCat[] = ['All','Electronics','Furniture','Clothing','Sports','Books','Toys','Vehicles','Home','Garden','Free'];

export default function NearByPage() {
  const router = useRouter();
  const {isDark,glassLevel,accentColor} = useThemeStore();
  const t = getTheme(isDark,glassLevel,accentColor);
  const [section,setSection] = useState<'jobs'|'market'>('jobs');
  const [search,setSearch] = useState('');
  const [voiceSrch,setVoiceSrch] = useState(false);
  // Jobs state
  const [jobCat,setJobCat] = useState<JobCat>('All');
  const [selJob,setSelJob] = useState<LocalJob|null>(null);
  const [jobSort,setJobSort] = useState<'recent'|'distance'|'rate'>('recent');
  const [applied,setApplied] = useState<string[]>([]);
  // Market state
  const [itemCat,setItemCat] = useState<ItemCat>('All');
  const [selItem,setSelItem] = useState<MarketItem|null>(null);
  const [savedItems,setSavedItems] = useState<string[]>([]);
  const [itemSort,setItemSort] = useState<'recent'|'price_low'|'price_high'|'distance'>('recent');
  const [msgText,setMsgText] = useState('');
  const [msgSent,setMsgSent] = useState<string[]>([]);

  const voiceS = () => { setVoiceSrch(true); setTimeout(()=>{setVoiceSrch(false);setSearch(section==='jobs'?'babysitter':'macbook');},2000); };

  const filteredJobs = LOCAL_JOBS.filter(j=>{
    if(jobCat!=='All'&&j.cat!==jobCat) return false;
    if(search&&!j.title.toLowerCase().includes(search.toLowerCase())&&!j.cat.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a,b)=>{
    if(jobSort==='distance') return parseFloat(a.distance)-parseFloat(b.distance);
    return 0;
  });

  const filteredItems = MARKET_ITEMS.filter(i=>{
    if(itemCat!=='All'&&i.cat!==itemCat) return false;
    if(search&&!i.title.toLowerCase().includes(search.toLowerCase())&&!i.cat.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a,b)=>{
    if(itemSort==='price_low') return a.price-b.price;
    if(itemSort==='price_high') return b.price-a.price;
    if(itemSort==='distance') return parseFloat(a.distance)-parseFloat(b.distance);
    return 0;
  });

  const sendMessage = (id:string) => { if(msgText.trim()){setMsgSent(p=>[...p,id]);setMsgText('');} };

  // ═══ JOB DETAIL ═══
  if(selJob) return (
    <div className="space-y-3 animate-fade-in">
      <button onClick={()=>setSelJob(null)} className="flex items-center gap-2 text-xs" style={{color:t.accent}}><IcoBack size={14}/> Back to Jobs</button>
      <div className="p-4 rounded-xl" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
        <div className="flex items-center gap-2 mb-2">
          {selJob.urgent&&<span className="text-[8px] px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-bold">🔥 URGENT</span>}
          {selJob.verified&&<span className="text-[8px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 font-bold">✓ Verified</span>}
          <span className="text-[8px] px-2 py-0.5 rounded-full" style={{background:t.accent+'15',color:t.accent}}>{selJob.cat}</span>
        </div>
        <h2 className="text-base font-bold mb-1">{selJob.title}</h2>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">{selJob.avatar}</span>
          <div><p className="text-xs font-semibold">{selJob.poster}</p><p className="text-[9px]" style={{color:t.textMuted}}>⭐ {selJob.rating} ({selJob.reviews} reviews) · 📍 {selJob.location}</p></div>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-3">{[{l:'Rate',v:selJob.rate,c:'#22c55e'},{l:'Distance',v:selJob.distance,c:'#3b82f6'},{l:'Schedule',v:selJob.schedule,c:'#8b5cf6'}].map(s=>(<div key={s.l} className="text-center p-2 rounded-lg" style={{background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.02)'}}><p className="text-xs font-bold" style={{color:s.c}}>{s.v}</p><p className="text-[8px]" style={{color:t.textMuted}}>{s.l}</p></div>))}</div>
        <p className="text-xs mb-3" style={{color:t.textSecondary}}>{selJob.desc}</p>
        <p className="text-[9px] mb-3" style={{color:t.textMuted}}>Posted {selJob.posted} · {selJob.type==='hourly'?'Hourly rate':selJob.type==='fixed'?'Fixed price':'Rate negotiable'}</p>
        {/* Message */}
        {!msgSent.includes(selJob.id)?(
          <div className="space-y-2">
            <textarea value={msgText} onChange={e=>setMsgText(e.target.value)} rows={2} placeholder={`Hi ${selJob.poster.split(' ')[0]}, I'm interested in this job...`} className="w-full p-3 rounded-xl text-xs outline-none resize-none" style={{background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.03)',border:`1px solid ${t.cardBorder}`,color:t.text}}/>
            <div className="flex gap-2">
              <button onClick={()=>sendMessage(selJob.id)} className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white" style={{background:t.accent}}>💬 Send Message</button>
              <button onClick={()=>{setApplied(p=>[...p,selJob.id]);}} disabled={applied.includes(selJob.id)} className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white disabled:opacity-50" style={{background:'#22c55e'}}>{applied.includes(selJob.id)?'✅ Applied':'📋 Quick Apply'}</button>
            </div>
          </div>
        ):(
          <div className="p-3 rounded-xl text-center" style={{background:'rgba(34,197,94,0.1)'}}><p className="text-xs font-bold" style={{color:'#22c55e'}}>✅ Message Sent! {selJob.poster} will respond soon.</p></div>
        )}
      </div>
    </div>
  );

  // ═══ ITEM DETAIL ═══
  if(selItem) return (
    <div className="space-y-3 animate-fade-in">
      <button onClick={()=>setSelItem(null)} className="flex items-center gap-2 text-xs" style={{color:t.accent}}><IcoBack size={14}/> Back to Marketplace</button>
      <div className="p-4 rounded-xl" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
        <div className="text-center text-5xl mb-3">{selItem.img}</div>
        <div className="flex items-center gap-2 mb-1">
          {selItem.featured&&<span className="text-[8px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-bold">⭐ Featured</span>}
          <span className="text-[8px] px-2 py-0.5 rounded-full" style={{background:t.accent+'15',color:t.accent}}>{selItem.cat}</span>
          <span className="text-[8px] px-2 py-0.5 rounded-full" style={{background:selItem.condition==='New'?'rgba(34,197,94,0.15)':'rgba(59,130,246,0.15)',color:selItem.condition==='New'?'#22c55e':'#3b82f6'}}>{selItem.condition}</span>
        </div>
        <h2 className="text-base font-bold mb-1">{selItem.title}</h2>
        <p className="text-xl font-bold mb-2" style={{color:selItem.price===0?'#22c55e':'#f97316'}}>{selItem.price===0?'FREE':'$'+selItem.price.toLocaleString()}{selItem.negotiable&&<span className="text-xs ml-2" style={{color:t.textMuted}}>· Negotiable</span>}</p>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">{selItem.avatar}</span>
          <div><p className="text-xs font-semibold">{selItem.seller}</p><p className="text-[9px]" style={{color:t.textMuted}}>📍 {selItem.location} · {selItem.distance}</p></div>
        </div>
        <p className="text-xs mb-3" style={{color:t.textSecondary}}>{selItem.desc}</p>
        <div className="flex flex-wrap gap-1 mb-3">
          {selItem.delivery&&<span className="text-[9px] px-2 py-0.5 rounded-full" style={{background:'rgba(34,197,94,0.1)',color:'#22c55e'}}>🚚 Delivery Available</span>}
          <span className="text-[9px] px-2 py-0.5 rounded-full" style={{background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.03)'}}>📍 {selItem.distance} away</span>
          <span className="text-[9px] px-2 py-0.5 rounded-full" style={{background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.03)'}}>🕐 {selItem.posted}</span>
        </div>
        {!msgSent.includes(selItem.id)?(
          <div className="space-y-2">
            <textarea value={msgText} onChange={e=>setMsgText(e.target.value)} rows={2} placeholder={`Hi, is this still available?`} className="w-full p-3 rounded-xl text-xs outline-none resize-none" style={{background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.03)',border:`1px solid ${t.cardBorder}`,color:t.text}}/>
            <div className="flex gap-2">
              <button onClick={()=>sendMessage(selItem.id)} className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white" style={{background:t.accent}}>💬 Message Seller</button>
              <button onClick={()=>setSavedItems(p=>p.includes(selItem.id)?p.filter(x=>x!==selItem.id):[...p,selItem.id])} className="px-4 py-2.5 rounded-xl text-xs" style={{background:savedItems.includes(selItem.id)?'rgba(239,68,68,0.15)':t.cardBorder}}>{savedItems.includes(selItem.id)?'❤️':'🤍'}</button>
            </div>
          </div>
        ):(
          <div className="p-3 rounded-xl text-center" style={{background:'rgba(34,197,94,0.1)'}}><p className="text-xs font-bold" style={{color:'#22c55e'}}>✅ Message Sent to {selItem.seller}!</p></div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={()=>router.back()} style={{background:'none',border:'none',color:t.text,cursor:'pointer'}}><IcoBack size={20}/></button>
        <h1 className="text-xl font-bold flex-1">NearBy</h1>
        <button onClick={voiceS} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:voiceSrch?'rgba(239,68,68,0.15)':'rgba(247,151,22,0.12)'}}><IcoMic size={16} color={voiceSrch?'#ef4444':'#f97316'}/></button>
      </div>
      {voiceSrch&&<p className="text-[10px] text-center animate-pulse" style={{color:'#ef4444'}}>🎙️ Listening...</p>}
      <p className="text-[10px]" style={{color:t.textMuted}}>Local jobs & marketplace — find help or buy/sell in your neighborhood</p>

      {/* Search */}
      <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
        <IcoSearch size={14} color={t.textMuted}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={section==='jobs'?'Search local jobs...':'Search items for sale...'} className="flex-1 text-sm outline-none bg-transparent" style={{color:t.text}}/>
      </div>

      {/* Section Toggle — Jobs vs Market */}
      <div className="flex p-0.5 rounded-xl" style={{background:t.card}}>
        <button onClick={()=>{setSection('jobs');setSearch('');}} className="flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5" style={{background:section==='jobs'?'#f97316':'transparent',color:section==='jobs'?'#fff':t.textMuted}}>🔧 Local Jobs</button>
        <button onClick={()=>{setSection('market');setSearch('');}} className="flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5" style={{background:section==='market'?'#f97316':'transparent',color:section==='market'?'#fff':t.textMuted}}>🏪 Buy & Sell</button>
      </div>

      {/* ═══ LOCAL JOBS SECTION ═══ */}
      {section==='jobs'&&(<>
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[{l:'Jobs Near You',v:filteredJobs.length+'',c:'#f97316'},{l:'Urgent',v:filteredJobs.filter(j=>j.urgent).length+'',c:'#ef4444'},{l:'Applied',v:applied.length+'',c:'#22c55e'}].map(s=>(<div key={s.l} className="text-center p-2 rounded-xl" style={{background:isDark?`${s.c}11`:'rgba(0,0,0,0.02)',border:`1px solid ${s.c}22`}}><p className="text-sm font-bold" style={{color:s.c}}>{s.v}</p><p className="text-[8px]" style={{color:t.textMuted}}>{s.l}</p></div>))}
        </div>

        {/* Job Categories */}
        <div className="flex gap-1.5 overflow-x-auto pb-1" style={{scrollbarWidth:'none'}}>{JOB_CATS.map(c=>(<button key={c} onClick={()=>setJobCat(c)} className="px-3 py-1.5 rounded-full text-[9px] font-semibold whitespace-nowrap" style={{background:jobCat===c?'#f9731620':t.card,color:jobCat===c?'#f97316':t.textMuted,border:`1px solid ${jobCat===c?'#f9731644':t.cardBorder}`}}>{c}</button>))}</div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          {(['recent','distance','rate'] as const).map(s=>(<button key={s} onClick={()=>setJobSort(s)} className="px-2 py-0.5 rounded-lg text-[8px] font-semibold capitalize" style={{background:jobSort===s?'#f9731615':'transparent',color:jobSort===s?'#f97316':t.textMuted}}>{s==='recent'?'🕐 Recent':s==='distance'?'📍 Nearest':'💰 Rate'}</button>))}
        </div>

        {/* Job Cards */}
        <div className="space-y-2">{filteredJobs.map(j=>(
          <button key={j.id} onClick={()=>setSelJob(j)} className="w-full text-left p-3 rounded-xl" style={{background:t.card,border:`1px solid ${j.urgent?'rgba(239,68,68,0.3)':t.cardBorder}`}}>
            <div className="flex items-start gap-2.5">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0" style={{background:isDark?'rgba(247,151,22,0.12)':'rgba(247,151,22,0.08)'}}>{j.avatar}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-0.5">{j.urgent&&<span className="text-[7px] px-1 py-0.5 rounded bg-red-100 text-red-600 font-bold">URGENT</span>}{j.verified&&<span className="text-[7px] px-1 py-0.5 rounded bg-blue-100 text-blue-600">✓</span>}</div>
                <p className="text-xs font-bold truncate">{j.title}</p>
                <p className="text-[9px]" style={{color:t.textMuted}}>{j.poster} · ⭐ {j.rating} · {j.location}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold" style={{color:'#22c55e'}}>{j.rate}</span>
                  <span className="text-[8px]" style={{color:t.textMuted}}>📍 {j.distance}</span>
                  <span className="text-[8px]" style={{color:t.textMuted}}>🕐 {j.posted}</span>
                  <span className="text-[8px] px-1.5 py-0.5 rounded-full" style={{background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.03)'}}>{j.cat}</span>
                </div>
              </div>
              {applied.includes(j.id)&&<span className="text-[8px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-bold">Applied</span>}
            </div>
          </button>
        ))}</div>
        {filteredJobs.length===0&&<p className="text-center text-xs py-8" style={{color:t.textMuted}}>No jobs found in this category</p>}

        {/* Post a Job */}
        <button onClick={()=>router.push('/create')} className="w-full py-3 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2" style={{background:'linear-gradient(135deg,#f97316,#ef4444)'}}>
          <IcoPlus size={14} color="white"/> Post a Local Job
        </button>
      </>)}

      {/* ═══ BUY & SELL SECTION ═══ */}
      {section==='market'&&(<>
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[{l:'Items Listed',v:filteredItems.length+'',c:'#f97316'},{l:'Free Items',v:filteredItems.filter(i=>i.price===0).length+'',c:'#22c55e'},{l:'Saved',v:savedItems.length+'',c:'#ef4444'}].map(s=>(<div key={s.l} className="text-center p-2 rounded-xl" style={{background:isDark?`${s.c}11`:'rgba(0,0,0,0.02)',border:`1px solid ${s.c}22`}}><p className="text-sm font-bold" style={{color:s.c}}>{s.v}</p><p className="text-[8px]" style={{color:t.textMuted}}>{s.l}</p></div>))}
        </div>

        {/* Item Categories */}
        <div className="flex gap-1.5 overflow-x-auto pb-1" style={{scrollbarWidth:'none'}}>{ITEM_CATS.map(c=>(<button key={c} onClick={()=>setItemCat(c)} className="px-3 py-1.5 rounded-full text-[9px] font-semibold whitespace-nowrap" style={{background:itemCat===c?'#f9731620':t.card,color:itemCat===c?'#f97316':t.textMuted,border:`1px solid ${itemCat===c?'#f9731644':t.cardBorder}`}}>{c}</button>))}</div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          {(['recent','price_low','price_high','distance'] as const).map(s=>(<button key={s} onClick={()=>setItemSort(s)} className="px-2 py-0.5 rounded-lg text-[8px] font-semibold" style={{background:itemSort===s?'#f9731615':'transparent',color:itemSort===s?'#f97316':t.textMuted}}>{s==='recent'?'🕐 Recent':s==='price_low'?'💰 Low→High':s==='price_high'?'💰 High→Low':'📍 Nearest'}</button>))}
        </div>

        {/* Featured Items */}
        {itemCat==='All'&&!search&&(
          <div>
            <h2 className="text-xs font-bold mb-2">⭐ Featured Deals</h2>
            <div className="flex gap-2 overflow-x-auto pb-1" style={{scrollbarWidth:'none'}}>{MARKET_ITEMS.filter(i=>i.featured).map(i=>(
              <button key={i.id} onClick={()=>setSelItem(i)} className="flex-shrink-0 w-40 p-2.5 rounded-xl text-left" style={{background:`linear-gradient(135deg,#f9731612,#ef444412)`,border:`1px solid ${t.cardBorder}`}}>
                <div className="text-center text-2xl mb-1">{i.img}</div>
                <p className="text-[10px] font-bold truncate">{i.title}</p>
                <p className="text-xs font-bold" style={{color:'#f97316'}}>${i.price.toLocaleString()}</p>
                <p className="text-[8px]" style={{color:t.textMuted}}>{i.condition} · {i.distance}</p>
              </button>
            ))}</div>
          </div>
        )}

        {/* Item Grid */}
        <div className="grid grid-cols-2 gap-2">{filteredItems.map(i=>(
          <button key={i.id} onClick={()=>setSelItem(i)} className="text-left p-2 rounded-xl relative" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
            <div className="text-center text-3xl mb-1">{i.img}</div>
            <p className="text-[10px] font-bold truncate">{i.title}</p>
            <p className="text-xs font-bold" style={{color:i.price===0?'#22c55e':'#f97316'}}>{i.price===0?'FREE':'$'+i.price.toLocaleString()}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[8px]" style={{color:t.textMuted}}>{i.condition}</span>
              <span className="text-[8px]" style={{color:t.textMuted}}>· {i.distance}</span>
            </div>
            <button onClick={e=>{e.stopPropagation();setSavedItems(p=>p.includes(i.id)?p.filter(x=>x!==i.id):[...p,i.id]);}} className="absolute top-2 right-2 text-xs">{savedItems.includes(i.id)?'❤️':'🤍'}</button>
          </button>
        ))}</div>
        {filteredItems.length===0&&<p className="text-center text-xs py-8" style={{color:t.textMuted}}>No items found in this category</p>}

        {/* Sell an Item */}
        <button onClick={()=>router.push('/create')} className="w-full py-3 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2" style={{background:'linear-gradient(135deg,#f97316,#8b5cf6)'}}>
          <IcoPlus size={14} color="white"/> Sell an Item
        </button>
      </>)}
    </div>
  );
}
