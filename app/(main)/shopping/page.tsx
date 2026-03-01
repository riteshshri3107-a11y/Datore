"use client";
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { IcoBack, IcoSearch, IcoHeart, IcoStar, IcoMic } from '@/components/Icons';

/* BR-99: GLOBAL SHOPPING AGGREGATION — Amazon/Instacart/Walmart Feature Parity
   COMMON: Categories, Search, Product Detail, Reviews, Cart, Wishlist, Comparisons
   AMAZON FEATURES: Prime delivery, Price history, Recommendations, "Customers also bought"
   INSTACART FEATURES: Same-hour delivery, Store selection, Fresh picks, Replacement preferences
   WALMART FEATURES: Rollback pricing, Store pickup, Price match
   DATORE UNIQUE: Cross-portal aggregation, AI price comparison, Voice search, Global sourcing
*/

const CATS = ['All','Electronics','Home','Fashion','Grocery','Health','Sports','Books','Toys','Beauty','Automotive'] as const;
type Cat = typeof CATS[number];
const PORTALS = ['All','Amazon','Walmart','Costco','BestBuy','Instacart','Target','Etsy','eBay','AliExpress'] as const;
const SORT_OPTS = ['Best Match','Price: Low','Price: High','Rating','Most Reviewed','Newest'] as const;

interface Product {
  id:string; name:string; price:number; orig:number; rating:number; reviews:number; cat:Cat;
  portal:string; img:string; delivery:string; prime:boolean; badge:string; desc:string;
  features:string[]; seller:string; stock:string; color?:string; sizes?:string[];
  priceHistory:{portal:string;price:number}[]; saved:boolean; inCart:boolean;
  alsoViewed:string[]; specs:Record<string,string>; warranty:string;
}

const PRODUCTS: Product[] = [
  {id:'p1',name:'Apple AirPods Pro 2',price:329.99,orig:379.99,rating:4.8,reviews:12847,cat:'Electronics',portal:'Amazon',img:'🎧',delivery:'Same Day',prime:true,badge:'Best Seller',desc:'Active Noise Cancellation, Adaptive Audio, USB-C charging, 6hr battery life',features:['ANC','Spatial Audio','USB-C','6hr battery','Find My','Adaptive EQ'],seller:'Apple Store',stock:'In Stock',priceHistory:[{portal:'Amazon',price:329.99},{portal:'BestBuy',price:339.99},{portal:'Walmart',price:344.99},{portal:'Costco',price:324.99}],saved:false,inCart:false,alsoViewed:['p5','p10'],specs:{'Connectivity':'Bluetooth 5.3','Driver':'Apple H2','Battery':'6h (30h case)','Weight':'5.3g each','Water Resistance':'IPX4'},warranty:'1 Year Apple'},
  {id:'p2',name:'Dyson V15 Detect Vacuum',price:749.99,orig:899.99,rating:4.7,reviews:5623,cat:'Home',portal:'BestBuy',img:'🧹',delivery:'2-Day',prime:false,badge:'Top Rated',desc:'Laser reveals microscopic dust, 60min battery, HEPA filtration',features:['Laser detect','60min battery','LCD screen','HEPA filter','Whole machine filtration','Anti-tangle'],seller:'Dyson Official',stock:'In Stock',priceHistory:[{portal:'BestBuy',price:749.99},{portal:'Amazon',price:779.99},{portal:'Target',price:769.99}],saved:false,inCart:false,alsoViewed:['p8'],specs:{'Suction':'230 AW','Battery':'60 min','Bin Volume':'0.76L','Weight':'6.8 lbs'},warranty:'2 Year Dyson'},
  {id:'p3',name:'Organic Avocados (6pk)',price:8.99,orig:12.99,rating:4.5,reviews:2341,cat:'Grocery',portal:'Instacart',img:'🥑',delivery:'1 Hour',prime:false,badge:'Fresh Pick',desc:'Ripe organic Hass avocados from local farms',features:['Organic','Local farm','Ripe ready','6 pack','Non-GMO'],seller:'Whole Foods',stock:'Fresh',priceHistory:[{portal:'Instacart',price:8.99},{portal:'Walmart',price:7.99},{portal:'Costco',price:9.99}],saved:false,inCart:false,alsoViewed:['p6'],specs:{'Origin':'Mexico','Certification':'USDA Organic','Variety':'Hass'},warranty:'Freshness guarantee'},
  {id:'p4',name:'Nike Air Max 270',price:149.99,orig:189.99,rating:4.6,reviews:8920,cat:'Fashion',portal:'Amazon',img:'👟',delivery:'Next Day',prime:true,badge:'',desc:'Lifestyle shoe with Max Air unit, mesh upper',features:['Air Max','Mesh upper','Foam sole','Breathable','Flex grooves'],seller:'Nike',stock:'Limited',color:'#111',sizes:['8','9','10','11','12'],priceHistory:[{portal:'Amazon',price:149.99},{portal:'Target',price:159.99},{portal:'eBay',price:139.99}],saved:false,inCart:false,alsoViewed:['p7'],specs:{'Material':'Mesh/Synthetic','Sole':'Rubber','Closure':'Lace-up'},warranty:'Nike 2yr'},
  {id:'p5',name:'Samsung 65" OLED 4K TV',price:1299.99,orig:1799.99,rating:4.9,reviews:3456,cat:'Electronics',portal:'BestBuy',img:'📺',delivery:'Free Ship',prime:false,badge:'Deal of Day',desc:'Neural Quantum Processor, AI Upscaling, Dolby Vision & Atmos',features:['OLED','4K','120Hz','Dolby Atmos','Smart TV','Gaming Hub','AI Upscaling'],seller:'Samsung',stock:'In Stock',priceHistory:[{portal:'BestBuy',price:1299.99},{portal:'Amazon',price:1349.99},{portal:'Costco',price:1279.99}],saved:false,inCart:false,alsoViewed:['p1'],specs:{'Screen':'65" OLED','Resolution':'3840x2160','Refresh':'120Hz','HDR':'HDR10+','Smart':'Tizen OS'},warranty:'2yr Samsung'},
  {id:'p6',name:'Kirkland Organic Quinoa 4.5lb',price:12.99,orig:16.99,rating:4.4,reviews:1892,cat:'Grocery',portal:'Costco',img:'🌾',delivery:'2-Day',prime:false,badge:'Bulk Save',desc:'USDA Organic, Pre-washed, High protein, Gluten free',features:['Organic','Pre-washed','High protein','Gluten free','Non-GMO'],seller:'Kirkland',stock:'In Stock',priceHistory:[{portal:'Costco',price:12.99},{portal:'Amazon',price:18.99}],saved:false,inCart:false,alsoViewed:['p3'],specs:{'Weight':'4.5 lbs','Certification':'USDA Organic'},warranty:'Satisfaction guarantee'},
  {id:'p7',name:'Lululemon Align Leggings',price:98,orig:128,rating:4.8,reviews:15234,cat:'Fashion',portal:'Target',img:'👗',delivery:'Same Day',prime:false,badge:'Trending',desc:'Buttery soft Nulu fabric, four-way stretch, high-rise',features:['Nulu fabric','4-way stretch','High-rise','Hidden pocket','Lightweight'],seller:'Lululemon',stock:'In Stock',sizes:['XS','S','M','L','XL'],priceHistory:[{portal:'Target',price:98},{portal:'Amazon',price:118}],saved:false,inCart:false,alsoViewed:['p4'],specs:{'Fabric':'Nulu','Rise':'High','Inseam':'25"'},warranty:'Quality Promise'},
  {id:'p8',name:'Vitamix Professional 750',price:499.99,orig:649.99,rating:4.9,reviews:7821,cat:'Home',portal:'Amazon',img:'🥤',delivery:'2-Day',prime:true,badge:'Top Rated',desc:'5 pre-programmed settings, self-cleaning, 64oz container',features:['2.2 HP motor','Self-cleaning','5 programs','64oz','Variable speed','Pulse'],seller:'Vitamix',stock:'In Stock',priceHistory:[{portal:'Amazon',price:499.99},{portal:'Costco',price:489.99},{portal:'BestBuy',price:529.99}],saved:false,inCart:false,alsoViewed:['p2'],specs:{'Motor':'2.2 HP','Container':'64 oz','Programs':'5','Speed':'Variable 1-10'},warranty:'7yr Vitamix'},
  {id:'p9',name:'Omega-3 Fish Oil Triple',price:24.99,orig:34.99,rating:4.3,reviews:3421,cat:'Health',portal:'Walmart',img:'💊',delivery:'Next Day',prime:false,badge:'',desc:'Triple Strength 1000mg EPA/DHA, No fishy taste',features:['Triple strength','Heart health','Brain health','No fishy taste','180 softgels'],seller:'Vitamin Shoppe',stock:'In Stock',priceHistory:[{portal:'Walmart',price:24.99},{portal:'Amazon',price:29.99}],saved:false,inCart:false,alsoViewed:[],specs:{'Serving':'2 softgels','EPA':'600mg','DHA':'400mg','Count':'180'},warranty:'30-day return'},
  {id:'p10',name:'LEGO Technic Ferrari 1:8',price:179.99,orig:199.99,rating:4.7,reviews:4567,cat:'Toys',portal:'Amazon',img:'🏎️',delivery:'Same Day',prime:true,badge:'',desc:'1:8 Scale, V8 engine with moving pistons, 3778 pieces',features:['1:8 Scale','V8 pistons','Paddle gear','3,778 pcs','Display stand'],seller:'LEGO',stock:'Low Stock',priceHistory:[{portal:'Amazon',price:179.99},{portal:'Target',price:189.99}],saved:false,inCart:false,alsoViewed:['p1'],specs:{'Pieces':'3,778','Scale':'1:8','Age':'18+','Dimensions':'23x9x5"'},warranty:'LEGO guarantee'},
  {id:'p11',name:'Portable Bluetooth Speaker',price:39.99,orig:59.99,rating:4.4,reviews:9823,cat:'Electronics',portal:'AliExpress',img:'🔊',delivery:'7-Day',prime:false,badge:'Global Deal',desc:'Waterproof IPX7, 24hr battery, Deep bass, TWS pairing',features:['IPX7','24hr battery','TWS','USB-C','Mic','LED lights'],seller:'SoundMax',stock:'In Stock',priceHistory:[{portal:'AliExpress',price:39.99},{portal:'Amazon',price:49.99}],saved:false,inCart:false,alsoViewed:['p1'],specs:{'Output':'20W','Battery':'24hr','Bluetooth':'5.3','Waterproof':'IPX7'},warranty:'1yr seller'},
  {id:'p12',name:'Standing Desk Converter',price:219.99,orig:299.99,rating:4.6,reviews:2345,cat:'Home',portal:'Amazon',img:'🖥️',delivery:'2-Day',prime:true,badge:'',desc:'Height adjustable 32", dual monitor, gas spring lift',features:['32" wide','Gas spring','Dual monitor','Keyboard tray','Cable mgmt'],seller:'FlexiSpot',stock:'In Stock',priceHistory:[{portal:'Amazon',price:219.99},{portal:'Walmart',price:229.99}],saved:false,inCart:false,alsoViewed:['p2'],specs:{'Width':'32"','Height':'6.5-16.9"','Weight Cap':'35 lbs','Lift':'Gas Spring'},warranty:'3yr'},
];

export default function ShoppingPage() {
  const router = useRouter();
  const {isDark,glassLevel,accentColor} = useThemeStore();
  const t = getTheme(isDark,glassLevel,accentColor);
  const [products,setProducts] = useState(PRODUCTS);
  const [search,setSearch] = useState('');
  const [cat,setCat] = useState<string>('All');
  const [portal,setPortal] = useState<string>('All');
  const [sort,setSort] = useState<string>('Best Match');
  const [sel,setSel] = useState<Product|null>(null);
  const [view,setView] = useState<'grid'|'list'>('grid');
  const [tab,setTab] = useState<'shop'|'cart'|'wishlist'|'orders'|'compare'>('shop');
  const [voiceSrch,setVoiceSrch] = useState(false);
  const [primeOnly,setPrimeOnly] = useState(false);
  const [maxPrice,setMaxPrice] = useState(2000);
  const [minRating,setMinRating] = useState(0);
  const [compareList,setCompareList] = useState<string[]>([]);

  let filtered = products.filter(p=>{
    const ms=!search||p.name.toLowerCase().includes(search.toLowerCase())||p.desc.toLowerCase().includes(search.toLowerCase());
    const mc=cat==='All'||p.cat===cat;
    const mp=portal==='All'||p.portal===portal;
    const mpr=!primeOnly||p.prime;
    const mpx=p.price<=maxPrice;
    const mr=p.rating>=minRating;
    return ms&&mc&&mp&&mpr&&mpx&&mr;
  });
  if(sort==='Price: Low') filtered.sort((a,b)=>a.price-b.price);
  if(sort==='Price: High') filtered.sort((a,b)=>b.price-a.price);
  if(sort==='Rating') filtered.sort((a,b)=>b.rating-a.rating);
  if(sort==='Most Reviewed') filtered.sort((a,b)=>b.reviews-a.reviews);

  const cart = products.filter(p=>p.inCart);
  const wishlist = products.filter(p=>p.saved);
  const cartTotal = cart.reduce((s,p)=>s+p.price,0);
  const savings = cart.reduce((s,p)=>s+(p.orig-p.price),0);

  const toggleCart = (id:string) => setProducts(p=>p.map(x=>x.id===id?{...x,inCart:!x.inCart}:x));
  const toggleSave = (id:string) => setProducts(p=>p.map(x=>x.id===id?{...x,saved:!x.saved}:x));
  const toggleCompare = (id:string) => setCompareList(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id].slice(0,3));
  const voiceS = () => { setVoiceSrch(true); setTimeout(()=>{setSearch('headphones');setVoiceSrch(false);},2000); };

  const disc = (p:Product) => Math.round((1-p.price/p.orig)*100);

  // PRODUCT DETAIL
  if(sel) return (
    <div className="space-y-3 animate-fade-in">
      <button onClick={()=>setSel(null)} className="flex items-center gap-2 text-xs" style={{color:t.accent}}><IcoBack size={14}/> Back</button>
      <div className="p-4 rounded-xl" style={{background:t.card,border:`1px solid ${t.border}`}}>
        <div className="text-center text-5xl mb-3">{sel.img}</div>
        <div className="flex items-center gap-2 mb-1">{sel.badge&&<span className="text-[9px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">{sel.badge}</span>}<span className="text-[9px] px-2 py-0.5 rounded-full" style={{background:t.accent+'15',color:t.accent}}>via {sel.portal}</span>{sel.prime&&<span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Prime</span>}</div>
        <h2 className="text-base font-bold mb-1">{sel.name}</h2>
        <div className="flex items-center gap-2 mb-2"><span className="text-lg font-bold" style={{color:'#22c55e'}}>${sel.price}</span><span className="text-xs line-through" style={{color:t.textMuted}}>${sel.orig}</span><span className="text-xs font-bold" style={{color:'#ef4444'}}>-{disc(sel)}%</span></div>
        <div className="flex items-center gap-2 mb-3"><span className="text-xs">⭐ {sel.rating}</span><span className="text-[10px]" style={{color:t.textMuted}}>({sel.reviews.toLocaleString()} reviews)</span><span className="text-[10px]" style={{color:sel.stock==='Low Stock'?'#f59e0b':'#22c55e'}}>{sel.stock}</span></div>
        <p className="text-xs mb-3">{sel.desc}</p>
        {sel.sizes&&<div className="mb-3"><p className="text-[10px] font-bold mb-1">Size</p><div className="flex gap-1">{sel.sizes.map(s=>(<button key={s} className="px-3 py-1 rounded-lg text-xs" style={{background:t.bg,border:`1px solid ${t.border}`}}>{s}</button>))}</div></div>}

        {/* Price Comparison — Datore Unique */}
        <h4 className="text-[10px] font-bold mb-1">💰 Price Comparison Across Portals</h4>
        <div className="space-y-1 mb-3">{sel.priceHistory.map((ph,i)=>(
          <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg" style={{background:i===0?'rgba(34,197,94,0.08)':t.bg}}>
            <span className="text-[10px] font-medium w-20">{ph.portal}</span>
            <div className="flex-1 h-1 rounded-full" style={{background:t.border}}><div className="h-1 rounded-full" style={{background:i===0?'#22c55e':'#3b82f6',width:`${(Math.min(...sel.priceHistory.map(x=>x.price))/ph.price)*100}%`}}/></div>
            <span className="text-[10px] font-bold" style={{color:i===0?'#22c55e':t.text}}>${ph.price}</span>
            {i===0&&<span className="text-[8px] px-1 py-0.5 rounded bg-green-100 text-green-700">Best</span>}
          </div>
        ))}</div>

        {/* Features */}
        <h4 className="text-[10px] font-bold mb-1">Key Features</h4>
        <div className="flex flex-wrap gap-1 mb-3">{sel.features.map(f=>(<span key={f} className="px-2 py-0.5 rounded-full text-[9px]" style={{background:t.accent+'10',color:t.accent}}>✓ {f}</span>))}</div>

        {/* Specs */}
        <h4 className="text-[10px] font-bold mb-1">Specifications</h4>
        <div className="space-y-1 mb-3">{Object.entries(sel.specs).map(([k,v])=>(
          <div key={k} className="flex text-[10px]"><span className="w-24 font-medium" style={{color:t.textMuted}}>{k}</span><span>{v}</span></div>
        ))}</div>

        <p className="text-[10px] mb-3" style={{color:t.textMuted}}>🛡️ {sel.warranty} · 🚚 {sel.delivery} · 🏪 {sel.seller}</p>

        <div className="flex gap-2">
          <button onClick={()=>toggleCart(sel.id)} className="flex-1 py-2.5 rounded-lg text-xs font-bold text-white" style={{background:sel.inCart?'#22c55e':t.accent}}>{sel.inCart?'✅ In Cart':'🛒 Add to Cart'}</button>
          <button onClick={()=>toggleSave(sel.id)} className="px-4 py-2.5 rounded-lg text-xs" style={{background:t.border}}>{sel.saved?'💾':'🤍'}</button>
          <button onClick={()=>toggleCompare(sel.id)} className="px-4 py-2.5 rounded-lg text-xs" style={{background:compareList.includes(sel.id)?'rgba(139,92,246,0.15)':t.border,color:compareList.includes(sel.id)?'#8b5cf6':t.text}}>⚖️</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="flex items-center gap-3"><button onClick={()=>router.back()} style={{background:'none',border:'none',color:t.text,cursor:'pointer'}}><IcoBack size={20}/></button><h1 className="text-xl font-bold flex-1">Shopping</h1>
        <span className="relative"><span className="text-sm">🛒</span>{cart.length>0&&<span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[8px] font-bold text-white flex items-center justify-center" style={{background:'#ef4444'}}>{cart.length}</span>}</span>
      </div>

      {/* Search + Voice */}
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 p-2 rounded-xl" style={{background:t.card,border:`1px solid ${t.border}`}}><IcoSearch size={14} color={t.textMuted}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products globally..." className="flex-1 text-sm bg-transparent outline-none" style={{color:t.text}}/></div>
        <button onClick={voiceS} className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:voiceSrch?'rgba(239,68,68,0.15)':t.card}}><IcoMic size={16} color={voiceSrch?'#ef4444':t.textMuted}/></button>
      </div>
      {voiceSrch&&<p className="text-xs text-center animate-pulse" style={{color:'#ef4444'}}>🎙️ Listening...</p>}

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{background:t.card}}>{(['shop','cart','wishlist','compare'] as const).map(tb=>(
        <button key={tb} onClick={()=>setTab(tb)} className="flex-1 py-1.5 rounded-lg text-[10px] font-semibold" style={{background:tab===tb?t.accent:'transparent',color:tab===tb?'#fff':t.textMuted}}>
          {tb==='shop'?`🛍️ Shop`:tb==='cart'?`🛒 Cart (${cart.length})`:tb==='wishlist'?`💾 Saved (${wishlist.length})`:`⚖️ Compare (${compareList.length})`}
        </button>
      ))}</div>

      {tab==='shop'&&(
        <>
          {/* Categories */}
          <div className="flex gap-1 overflow-x-auto" style={{scrollbarWidth:'none'}}>{CATS.map(c=>(
            <button key={c} onClick={()=>setCat(c)} className="px-3 py-1 rounded-full text-[10px] font-medium whitespace-nowrap" style={{background:cat===c?t.accent+'20':t.card,color:cat===c?t.accent:t.textMuted}}>{c}</button>
          ))}</div>

          {/* Portals */}
          <div className="flex gap-1 overflow-x-auto" style={{scrollbarWidth:'none'}}>{PORTALS.map(p=>(
            <button key={p} onClick={()=>setPortal(p)} className="px-2 py-0.5 rounded-full text-[9px] font-medium whitespace-nowrap" style={{background:portal===p?'rgba(139,92,246,0.15)':'transparent',color:portal===p?'#8b5cf6':t.textMuted,border:`1px solid ${portal===p?'#8b5cf6':t.border}`}}>{p}</button>
          ))}</div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={()=>setPrimeOnly(!primeOnly)} className="px-2 py-0.5 rounded-full text-[9px] font-medium" style={{background:primeOnly?'rgba(59,130,246,0.15)':'transparent',color:primeOnly?'#3b82f6':t.textMuted,border:`1px solid ${primeOnly?'#3b82f6':t.border}`}}>Prime Only</button>
            <select value={sort} onChange={e=>setSort(e.target.value)} className="px-2 py-0.5 rounded-full text-[9px]" style={{background:t.card,color:t.text,border:`1px solid ${t.border}`}}>{SORT_OPTS.map(s=><option key={s}>{s}</option>)}</select>
            <span className="text-[9px]" style={{color:t.textMuted}}>{filtered.length} results</span>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 gap-2">
            {filtered.map(p=>(
              <button key={p.id} onClick={()=>setSel(p)} className="text-left p-2 rounded-xl" style={{background:t.card,border:`1px solid ${t.border}`}}>
                <div className="text-center text-3xl mb-1 relative">
                  {p.img}
                  {p.badge&&<span className="absolute top-0 left-0 text-[7px] px-1 py-0.5 rounded bg-orange-100 text-orange-600">{p.badge}</span>}
                  {p.prime&&<span className="absolute top-0 right-0 text-[7px] px-1 py-0.5 rounded bg-blue-100 text-blue-700">Prime</span>}
                </div>
                <p className="text-xs font-semibold truncate">{p.name}</p>
                <div className="flex items-center gap-1"><span className="text-sm font-bold" style={{color:'#22c55e'}}>${p.price}</span><span className="text-[9px] line-through" style={{color:t.textMuted}}>${p.orig}</span></div>
                <div className="flex items-center gap-1"><span className="text-[9px]">⭐ {p.rating}</span><span className="text-[8px]" style={{color:t.textMuted}}>({p.reviews>1000?(p.reviews/1000).toFixed(1)+'K':p.reviews})</span></div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[8px]" style={{color:t.textMuted}}>{p.portal} · {p.delivery}</span>
                  <div className="flex gap-1">
                    <button onClick={e=>{e.stopPropagation();toggleSave(p.id);}} className="text-xs">{p.saved?'💾':'🤍'}</button>
                    <button onClick={e=>{e.stopPropagation();toggleCart(p.id);}} className="text-xs">{p.inCart?'✅':'🛒'}</button>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* CART */}
      {tab==='cart'&&(
        <div className="space-y-2">
          {cart.length===0?<p className="text-center text-sm py-8" style={{color:t.textMuted}}>Cart is empty</p>:(<>
            {cart.map(p=>(
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl" style={{background:t.card,border:`1px solid ${t.border}`}}>
                <span className="text-2xl">{p.img}</span>
                <div className="flex-1 min-w-0"><p className="text-xs font-semibold truncate">{p.name}</p><p className="text-[10px]" style={{color:t.textMuted}}>{p.portal} · {p.delivery}</p></div>
                <div className="text-right"><p className="text-sm font-bold" style={{color:'#22c55e'}}>${p.price}</p>{p.orig>p.price&&<p className="text-[9px]" style={{color:'#ef4444'}}>Save ${(p.orig-p.price).toFixed(2)}</p>}</div>
                <button onClick={()=>toggleCart(p.id)} className="text-xs" style={{color:'#ef4444'}}>✕</button>
              </div>
            ))}
            <div className="p-3 rounded-xl" style={{background:t.card,border:`1px solid ${t.border}`}}>
              <div className="flex justify-between text-xs mb-1"><span>Subtotal ({cart.length} items)</span><span className="font-bold">${cartTotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-xs mb-1"><span>Savings</span><span className="font-bold" style={{color:'#22c55e'}}>-${savings.toFixed(2)}</span></div>
              <div className="flex justify-between text-xs mb-2"><span>Delivery</span><span className="font-bold" style={{color:'#22c55e'}}>FREE</span></div>
              <button className="w-full py-2.5 rounded-lg text-xs font-bold text-white" style={{background:t.accent}}>Checkout — ${cartTotal.toFixed(2)}</button>
            </div>
          </>)}
        </div>
      )}

      {/* WISHLIST */}
      {tab==='wishlist'&&(
        <div className="space-y-2">
          {wishlist.length===0?<p className="text-center text-sm py-8" style={{color:t.textMuted}}>No saved items</p>:
          wishlist.map(p=>(
            <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl" style={{background:t.card,border:`1px solid ${t.border}`}}>
              <span className="text-2xl">{p.img}</span>
              <div className="flex-1"><p className="text-xs font-semibold">{p.name}</p><p className="text-sm font-bold" style={{color:'#22c55e'}}>${p.price}</p></div>
              <button onClick={()=>toggleCart(p.id)} className="px-2 py-1 rounded text-[9px] font-bold text-white" style={{background:t.accent}}>🛒</button>
              <button onClick={()=>toggleSave(p.id)} className="text-xs" style={{color:'#ef4444'}}>✕</button>
            </div>
          ))}
        </div>
      )}

      {/* COMPARE */}
      {tab==='compare'&&(
        <div className="space-y-2">
          {compareList.length<2?<p className="text-center text-sm py-8" style={{color:t.textMuted}}>Select 2-3 products to compare</p>:(
            <div className="overflow-x-auto">
              <div className="flex gap-2" style={{minWidth:`${compareList.length*180}px`}}>
                {compareList.map(id=>{const p=products.find(x=>x.id===id);if(!p)return null;return(
                  <div key={p.id} className="w-44 p-3 rounded-xl flex-shrink-0" style={{background:t.card,border:`1px solid ${t.border}`}}>
                    <div className="text-center text-3xl mb-2">{p.img}</div>
                    <p className="text-xs font-bold text-center mb-2 truncate">{p.name}</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px]"><span style={{color:t.textMuted}}>Price</span><span className="font-bold" style={{color:'#22c55e'}}>${p.price}</span></div>
                      <div className="flex justify-between text-[10px]"><span style={{color:t.textMuted}}>Rating</span><span>⭐ {p.rating}</span></div>
                      <div className="flex justify-between text-[10px]"><span style={{color:t.textMuted}}>Reviews</span><span>{p.reviews.toLocaleString()}</span></div>
                      <div className="flex justify-between text-[10px]"><span style={{color:t.textMuted}}>Portal</span><span>{p.portal}</span></div>
                      <div className="flex justify-between text-[10px]"><span style={{color:t.textMuted}}>Delivery</span><span>{p.delivery}</span></div>
                      {Object.entries(p.specs).map(([k,v])=>(<div key={k} className="flex justify-between text-[9px]"><span style={{color:t.textMuted}}>{k}</span><span>{v}</span></div>))}
                    </div>
                    <button onClick={()=>toggleCompare(p.id)} className="w-full mt-2 py-1 rounded text-[9px]" style={{color:'#ef4444'}}>Remove</button>
                  </div>
                );})}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
