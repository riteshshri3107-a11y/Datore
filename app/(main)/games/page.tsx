"use client";
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { IcoBack, IcoSearch, IcoStar, IcoHeart, IcoUser, IcoMic, IcoGamepad } from '@/components/Icons';

type GameCat = 'All'|'Action'|'Puzzle'|'Racing'|'Strategy'|'Sports'|'Arcade'|'Card'|'Educational'|'Multiplayer';

interface Game {
  id:string; title:string; icon:string; dev:string; rating:number; reviews:string;
  cat:GameCat; price:'Free'|string; size:string; players:string; desc:string;
  tags:string[]; installed?:boolean; featured?:boolean; screenshots:string[];
}

const GAMES:Game[] = [
  { id:'g1', title:'Datore Runner', icon:'🏃', dev:'Datore Studios', rating:4.8, reviews:'12.5K', cat:'Action', price:'Free', size:'85 MB', players:'500K+', desc:'Run through neighborhoods completing service tasks! Endless runner with power-ups and daily challenges.', tags:['Offline','Single Player','Casual'], featured:true, screenshots:['🏘️','🏃‍♂️','⭐'] },
  { id:'g2', title:'Word Connect Pro', icon:'🔤', dev:'BrainBox Games', rating:4.7, reviews:'8.3K', cat:'Puzzle', price:'Free', size:'45 MB', players:'1.2M+', desc:'Connect letters to form words. 5000+ levels with increasing difficulty. Daily word challenges!', tags:['Offline','Brain Training','Family'], screenshots:['📝','🧩','🏆'] },
  { id:'g3', title:'Speed Dash Racing', icon:'🏎️', dev:'Velocity Inc', rating:4.5, reviews:'6.1K', cat:'Racing', price:'$2.99', size:'210 MB', players:'250K+', desc:'High-speed racing across famous city streets. 50+ cars, 30 tracks, real-time multiplayer.', tags:['Online','Multiplayer','HD Graphics'], screenshots:['🏎️','🏁','🌃'] },
  { id:'g4', title:'Kingdom Builder', icon:'🏰', dev:'StrategyCraft', rating:4.6, reviews:'15.2K', cat:'Strategy', price:'Free', size:'320 MB', players:'2M+', desc:'Build your empire from scratch. Manage resources, train armies, form alliances with real players.', tags:['Online','Multiplayer','Strategy'], featured:true, screenshots:['🏰','⚔️','👑'] },
  { id:'g5', title:'Soccer Stars 2026', icon:'⚽', dev:'SportZone', rating:4.4, reviews:'9.8K', cat:'Sports', price:'$4.99', size:'450 MB', players:'800K+', desc:'Realistic football simulation with licensed teams. Career mode, online tournaments, and manager mode.', tags:['Online','Multiplayer','Sports'], screenshots:['⚽','🏟️','🏆'] },
  { id:'g6', title:'Bubble Pop Mania', icon:'🫧', dev:'CasualFun', rating:4.3, reviews:'22.1K', cat:'Arcade', price:'Free', size:'32 MB', players:'5M+', desc:'Classic bubble shooter with a twist! 1000+ levels, boss battles, and weekly tournaments.', tags:['Offline','Casual','Family'], screenshots:['🫧','🎯','💥'] },
  { id:'g7', title:'Poker Masters', icon:'🃏', dev:'CardShark Studio', rating:4.6, reviews:'4.5K', cat:'Card', price:'Free', size:'68 MB', players:'350K+', desc:'Play Texas Hold\'em, Blackjack, and more. Compete in daily tournaments with real prizes!', tags:['Online','Multiplayer','Casino'], screenshots:['🃏','💰','🏆'] },
  { id:'g8', title:'Math Quest Academy', icon:'🧮', dev:'EduPlay', rating:4.9, reviews:'3.2K', cat:'Educational', price:'Free', size:'55 MB', players:'200K+', desc:'Learn math through epic adventures! Perfect for ages 5-14. Aligned with school curriculum.', tags:['Offline','Educational','Kids'], featured:true, screenshots:['🧮','🐉','⭐'] },
  { id:'g9', title:'Battle Royale Arena', icon:'🎯', dev:'MultiVerse Games', rating:4.2, reviews:'18.7K', cat:'Multiplayer', price:'Free', size:'680 MB', players:'3M+', desc:'100-player battle royale with building mechanics. Squad mode, ranked play, and season passes.', tags:['Online','Battle Royale','Team'], screenshots:['🎯','🔫','🏆'] },
  { id:'g10', title:'Sudoku Master', icon:'🔢', dev:'BrainBox Games', rating:4.8, reviews:'7.6K', cat:'Puzzle', price:'Free', size:'18 MB', players:'1.5M+', desc:'The ultimate Sudoku experience. 4 difficulty levels, daily challenges, and hint system.', tags:['Offline','Brain Training','Relaxing'], screenshots:['🔢','🧠','✨'] },
  { id:'g11', title:'Neighborhood Chef', icon:'👨‍🍳', dev:'Datore Studios', rating:4.7, reviews:'5.1K', cat:'Arcade', price:'$1.99', size:'95 MB', players:'400K+', desc:'Cook meals for your neighbors! Time management game with 200+ recipes and restaurant upgrades.', tags:['Offline','Casual','Cooking'], screenshots:['👨‍🍳','🍕','⭐'] },
  { id:'g12', title:'Code Wizards', icon:'🧙‍♂️', dev:'EduPlay', rating:4.8, reviews:'2.8K', cat:'Educational', price:'Free', size:'72 MB', players:'150K+', desc:'Learn coding through magical adventures! Scratch-like blocks for beginners, Python for advanced.', tags:['Offline','Educational','STEM'], screenshots:['🧙‍♂️','💻','🌟'] },
];

const CATS:GameCat[] = ['All','Action','Puzzle','Racing','Strategy','Sports','Arcade','Card','Educational','Multiplayer'];

export default function GamesPage() {
  const router = useRouter();
  const {isDark,glassLevel,accentColor} = useThemeStore();
  const t = getTheme(isDark,glassLevel,accentColor);
  const [tab,setTab] = useState<'browse'|'installed'|'wishlist'>('browse');
  const [cat,setCat] = useState<GameCat>('All');
  const [search,setSearch] = useState('');
  const [installed,setInstalled] = useState<string[]>(['g1','g8']);
  const [wishlist,setWishlist] = useState<string[]>([]);
  const [selected,setSelected] = useState<Game|null>(null);
  const [filter,setFilter] = useState<'all'|'free'|'paid'>('all');
  const [voiceSrch,setVoiceSrch] = useState(false);

  const filtered = GAMES.filter(g => {
    if(cat!=='All' && g.cat!==cat) return false;
    if(filter==='free' && g.price!=='Free') return false;
    if(filter==='paid' && g.price==='Free') return false;
    if(search && !g.title.toLowerCase().includes(search.toLowerCase()) && !g.dev.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const featured = GAMES.filter(g=>g.featured);
  const toggleInstall = (id:string) => setInstalled(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const toggleWish = (id:string) => setWishlist(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const voiceS = () => { setVoiceSrch(true); setTimeout(()=>{setVoiceSrch(false);setSearch('puzzle games');},2000); };

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={()=>router.back()} style={{background:'none',border:'none',color:t.text,cursor:'pointer'}}><IcoBack size={20}/></button>
        <h1 className="text-xl font-bold flex-1">Games</h1>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
        <IcoSearch size={14} color={t.textMuted}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search games..." className="flex-1 text-sm outline-none bg-transparent" style={{color:t.text}}/>
        <button onClick={voiceS} className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:voiceSrch?'rgba(239,68,68,0.1)':'rgba(139,92,246,0.08)'}}><IcoMic size={14} color={voiceSrch?'#ef4444':'#8b5cf6'}/></button>
      </div>
      {voiceSrch&&<p className="text-xs text-center animate-pulse" style={{color:'#ef4444'}}>🎙️ Listening...</p>}

      {/* Tabs */}
      <div className="flex gap-1 p-0.5 rounded-lg" style={{background:t.card}}>
        {(['browse','installed','wishlist'] as const).map(tb=>(<button key={tb} onClick={()=>setTab(tb)} className="flex-1 py-2 rounded-md text-xs font-semibold" style={{background:tab===tb?t.accent:'transparent',color:tab===tb?'#fff':t.textMuted}}>
          {tb==='browse'?`🎮 Browse`:tb==='installed'?`📦 Installed (${installed.length})`:`💝 Wishlist (${wishlist.length})`}
        </button>))}
      </div>

      {tab==='browse'&&(
        <>
          {/* Categories */}
          <div className="flex gap-1.5 overflow-x-auto pb-1" style={{scrollbarWidth:'none'}}>{CATS.map(c=>(<button key={c} onClick={()=>setCat(c)} className="px-3 py-1.5 rounded-full text-[10px] font-semibold whitespace-nowrap" style={{background:cat===c?t.accent+'20':t.card,color:cat===c?t.accent:t.textMuted,border:`1px solid ${cat===c?t.accent+'44':t.cardBorder}`}}>{c}</button>))}</div>

          {/* Free/Paid Filter */}
          <div className="flex gap-1">{(['all','free','paid'] as const).map(f=>(<button key={f} onClick={()=>setFilter(f)} className="px-3 py-1 rounded-lg text-[9px] font-semibold capitalize" style={{background:filter===f?t.accent+'15':'transparent',color:filter===f?t.accent:t.textMuted}}>{f==='all'?'All Games':f==='free'?'🆓 Free':'💰 Paid'}</button>))}</div>

          {/* Featured */}
          {cat==='All'&&!search&&(
            <div>
              <h2 className="text-sm font-bold mb-2">🔥 Featured Games</h2>
              <div className="flex gap-2 overflow-x-auto pb-1" style={{scrollbarWidth:'none'}}>{featured.map(g=>(
                <div key={g.id} onClick={()=>setSelected(g)} className="flex-shrink-0 w-56 rounded-xl p-3 cursor-pointer" style={{background:`linear-gradient(135deg,${t.accent}15,#8b5cf622)`,border:`1px solid ${t.cardBorder}`}}>
                  <div className="flex items-center gap-2 mb-2"><span className="text-2xl">{g.icon}</span><div><p className="text-xs font-bold">{g.title}</p><p className="text-[9px]" style={{color:t.textMuted}}>{g.dev}</p></div></div>
                  <div className="flex items-center gap-2"><span className="text-[10px]">⭐ {g.rating}</span><span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{background:g.price==='Free'?'rgba(34,197,94,0.15)':'rgba(245,158,11,0.15)',color:g.price==='Free'?'#22c55e':'#f59e0b'}}>{g.price}</span><span className="text-[9px]" style={{color:t.textMuted}}>{g.players}</span></div>
                </div>
              ))}</div>
            </div>
          )}

          {/* Game Grid */}
          <div className="space-y-2">
            {filtered.map(g=>(
              <div key={g.id} onClick={()=>setSelected(g)} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{background:`linear-gradient(135deg,${t.accent}15,#ec489915)`}}>{g.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate">{g.title}</p>
                  <p className="text-[9px]" style={{color:t.textMuted}}>{g.dev} · {g.cat}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px]">⭐ {g.rating}</span>
                    <span className="text-[9px]" style={{color:t.textMuted}}>{g.reviews} reviews</span>
                    <span className="text-[9px]" style={{color:t.textMuted}}>{g.size}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{background:g.price==='Free'?'rgba(34,197,94,0.15)':'rgba(245,158,11,0.15)',color:g.price==='Free'?'#22c55e':'#f59e0b'}}>{g.price}</span>
                  <button onClick={e=>{e.stopPropagation();toggleInstall(g.id);}} className="px-3 py-1 rounded-lg text-[9px] font-bold text-white" style={{background:installed.includes(g.id)?'#6b7280':t.accent}}>{installed.includes(g.id)?'Installed':'Install'}</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Installed */}
      {tab==='installed'&&(
        <div className="space-y-2">{GAMES.filter(g=>installed.includes(g.id)).map(g=>(
          <div key={g.id} className="flex items-center gap-3 p-3 rounded-xl" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
            <span className="text-2xl">{g.icon}</span>
            <div className="flex-1"><p className="text-xs font-bold">{g.title}</p><p className="text-[9px]" style={{color:t.textMuted}}>{g.size}</p></div>
            <button onClick={()=>setSelected(g)} className="px-3 py-1.5 rounded-lg text-[9px] font-bold text-white" style={{background:'#22c55e'}}>▶ Play</button>
            <button onClick={()=>toggleInstall(g.id)} className="text-[9px]" style={{color:'#ef4444'}}>Remove</button>
          </div>
        ))}{installed.length===0&&<p className="text-center text-xs py-8" style={{color:t.textMuted}}>No games installed</p>}</div>
      )}

      {/* Wishlist */}
      {tab==='wishlist'&&(
        <div className="space-y-2">{GAMES.filter(g=>wishlist.includes(g.id)).map(g=>(
          <div key={g.id} className="flex items-center gap-3 p-3 rounded-xl" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
            <span className="text-2xl">{g.icon}</span>
            <div className="flex-1"><p className="text-xs font-bold">{g.title}</p><p className="text-[9px]" style={{color:t.textMuted}}>{g.price} · {g.cat}</p></div>
            <button onClick={()=>toggleInstall(g.id)} className="px-3 py-1 rounded-lg text-[9px] font-bold text-white" style={{background:t.accent}}>Install</button>
            <button onClick={()=>toggleWish(g.id)} className="text-[9px]" style={{color:'#ef4444'}}>Remove</button>
          </div>
        ))}{wishlist.length===0&&<p className="text-center text-xs py-8" style={{color:t.textMuted}}>No games in wishlist</p>}</div>
      )}

      {/* Game Detail Modal */}
      {selected&&(
        <div className="fixed inset-0 z-[9999] flex items-end justify-center" style={{background:'rgba(0,0,0,0.6)'}} onClick={()=>setSelected(null)}>
          <div onClick={e=>e.stopPropagation()} className="w-full max-w-lg rounded-t-2xl p-5 space-y-3 max-h-[85vh] overflow-y-auto" style={{background:isDark?'#1a1a2e':'#fff'}}>
            <div className="w-10 h-1 rounded-full mx-auto mb-2" style={{background:t.cardBorder}}/>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl" style={{background:`linear-gradient(135deg,${t.accent}15,#ec489915)`}}>{selected.icon}</div>
              <div className="flex-1"><h2 className="text-base font-bold">{selected.title}</h2><p className="text-[10px]" style={{color:t.textMuted}}>{selected.dev}</p>
                <div className="flex items-center gap-2 mt-1"><span className="text-[10px]">⭐ {selected.rating} ({selected.reviews})</span><span className="text-[10px]" style={{color:t.textMuted}}>{selected.players} players</span></div>
              </div>
            </div>
            {/* Screenshots */}
            <div className="flex gap-2">{selected.screenshots.map((s,i)=>(<div key={i} className="w-20 h-20 rounded-xl flex items-center justify-center text-2xl" style={{background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)',border:`1px solid ${t.cardBorder}`}}>{s}</div>))}</div>
            <p className="text-xs" style={{color:t.textSecondary}}>{selected.desc}</p>
            <div className="flex flex-wrap gap-1.5">{selected.tags.map(tag=>(<span key={tag} className="px-2 py-0.5 rounded-full text-[9px]" style={{background:t.accentLight,color:t.accent}}>{tag}</span>))}</div>
            <div className="grid grid-cols-3 gap-2">{[{l:'Size',v:selected.size},{l:'Price',v:selected.price},{l:'Category',v:selected.cat}].map(s=>(<div key={s.l} className="text-center p-2 rounded-lg" style={{background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.02)'}}><p className="text-xs font-bold">{s.v}</p><p className="text-[8px]" style={{color:t.textMuted}}>{s.l}</p></div>))}</div>
            <div className="flex gap-2">
              <button onClick={()=>{toggleInstall(selected.id);}} className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white" style={{background:installed.includes(selected.id)?'#6b7280':t.accent}}>{installed.includes(selected.id)?'✓ Installed -- Play ▶':'Install Now'}</button>
              <button onClick={()=>toggleWish(selected.id)} className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:wishlist.includes(selected.id)?'rgba(239,68,68,0.15)':'rgba(139,92,246,0.1)'}}><IcoHeart size={16} color={wishlist.includes(selected.id)?'#ef4444':'#8b5cf6'} fill={wishlist.includes(selected.id)?'#ef4444':'none'}/></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
