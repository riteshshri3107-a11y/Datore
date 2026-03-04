"use client";
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { IcoBack, IcoSearch, IcoHeart, IcoStar, IcoMic } from '@/components/Icons';

/* BR-99: GLOBAL SHOPPING AGGREGATION -- Amazon/Instacart/Walmart Feature Parity
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
  const [selId,setSelId] = useState<string|null>(null);
  const [view,setView] = useState<'grid'|'list'>('grid');
  const [tab,setTab] = useState<'shop'|'cart'|'wishlist'|'orders'|'compare'>('shop');
  const [voiceSrch,setVoiceSrch] = useState(false);
  const [primeOnly,setPrimeOnly] = useState(false);
  const [maxPrice,setMaxPrice] = useState(2000);
  const [minRating,setMinRating] = useState(0);
  const [qty,setQty] = useState<Record<string,number>>({});
  const [showCheckout,setShowCheckout] = useState(false);
  const [payMethod,setPayMethod] = useState<'card'|'token'|'wallet'>('card');
  const [orderPlaced,setOrderPlaced] = useState(false);
  const [shippingAddr,setShippingAddr] = useState({name:'Rajesh S.',line1:'123 Main St',city:'Toronto',province:'ON',zip:'M5V 1A1',country:'Canada'});
  const [cardInfo,setCardInfo] = useState({number:'',expiry:'',cvv:'',name:''});

  /* ═══ ORDER HISTORY — persisted in localStorage ═══ */
  interface OrderRecord { id:string; items:{name:string;img:string;price:number;qty:number;portal:string}[]; total:number; payMethod:string; status:'confirmed'|'processing'|'shipped'|'delivered'|'cancelled'; date:string; address:string; tracking?:string; }
  const [orders, setOrders] = useState<OrderRecord[]>(() => {
    try { const s = localStorage.getItem('datore-orders'); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const saveOrders = (o: OrderRecord[]) => { setOrders(o); try { localStorage.setItem('datore-orders', JSON.stringify(o)); } catch {} };

  /* TOKEN SYSTEM -- country-based currency, same-country only */
  const TOKEN_RATE:Record<string,{symbol:string;rate:number;name:string}> = {
    'Canada': { symbol:'🍁', rate:1.36, name:'CAD Tokens' },
    'India': { symbol:'🪷', rate:83.12, name:'INR Tokens' },
    'USA': { symbol:'🗽', rate:1.00, name:'USD Tokens' },
    'UK': { symbol:'👑', rate:0.79, name:'GBP Tokens' },
    'Australia': { symbol:'🦘', rate:1.53, name:'AUD Tokens' },
  };
  const userCountry = shippingAddr.country;
  const tokenInfo = TOKEN_RATE[userCountry] || TOKEN_RATE['Canada'];
  const [tokenBalance] = useState(5000); // user's token balance in local currency equivalent
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

  const sel = selId ? products.find(p=>p.id===selId) || null : null;

  const cart = products.filter(p=>p.inCart);
  const wishlist = products.filter(p=>p.saved);
  const getQty = (id:string) => qty[id] || 1;
  const cartTotal = cart.reduce((s,p)=>s+p.price*getQty(p.id),0);
  const savings = cart.reduce((s,p)=>s+(p.orig-p.price)*getQty(p.id),0);
  const cartTokens = Math.round(cartTotal * tokenInfo.rate);

  const toggleCart = (id:string) => { setProducts(p=>p.map(x=>x.id===id?{...x,inCart:!x.inCart}:x)); if(!qty[id]) setQty(q=>({...q,[id]:1})); };
  const toggleSave = (id:string) => setProducts(p=>p.map(x=>x.id===id?{...x,saved:!x.saved}:x));
  const toggleCompare = (id:string) => setCompareList(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id].slice(0,3));
  const updateQty = (id:string, delta:number) => setQty(q=>({...q,[id]:Math.max(1,Math.min(10,(q[id]||1)+delta))}));
  const voiceS = () => { setVoiceSrch(true); setTimeout(()=>{setSearch('headphones');setVoiceSrch(false);},2000); };
  const placeOrder = () => {
    const newOrder: OrderRecord = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
      items: cart.map(p => ({ name:p.name, img:p.img, price:p.price, qty:getQty(p.id), portal:p.portal })),
      total: cartTotal,
      payMethod: payMethod === 'card' ? '💳 Card' : payMethod === 'token' ? `${tokenInfo.symbol} Tokens` : '👛 Wallet',
      status: 'confirmed',
      date: new Date().toLocaleDateString('en-CA', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' }),
      address: `${shippingAddr.line1}, ${shippingAddr.city}, ${shippingAddr.province} ${shippingAddr.zip}`,
      tracking: `TRK${Date.now().toString().slice(-8)}`,
    };
    saveOrders([newOrder, ...orders]);
    setOrderPlaced(true);
    // Auto-progress order status for demo (confirmed → processing → shipped → delivered)
    const orderId = newOrder.id;
    setTimeout(() => { setOrders(prev => { const u = prev.map(o => o.id === orderId ? {...o, status:'processing' as const} : o); try{localStorage.setItem('datore-orders',JSON.stringify(u));}catch{} return u; }); }, 5000);
    setTimeout(() => { setOrders(prev => { const u = prev.map(o => o.id === orderId ? {...o, status:'shipped' as const} : o); try{localStorage.setItem('datore-orders',JSON.stringify(u));}catch{} return u; }); }, 15000);
    setTimeout(() => { setOrders(prev => { const u = prev.map(o => o.id === orderId ? {...o, status:'delivered' as const} : o); try{localStorage.setItem('datore-orders',JSON.stringify(u));}catch{} return u; }); }, 30000);
    setTimeout(() => {
      setProducts(p => p.map(x => ({...x, inCart:false})));
      setQty({});
      setShowCheckout(false);
      setOrderPlaced(false);
      setTab('orders'); // Navigate to orders tab after purchase
    }, 2500);
  };

  const disc = (p:Product) => Math.round((1-p.price/p.orig)*100);

  // PRODUCT DETAIL
  if(sel) return (
    <div className="space-y-3 animate-fade-in">
      <button onClick={()=>setSelId(null)} className="flex items-center gap-2 text-xs" style={{color:t.accent}}><IcoBack size={14}/> Back</button>
      <div className="p-4 rounded-xl" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
        <div className="text-center text-5xl mb-3">{sel.img}</div>
        <div className="flex items-center gap-2 mb-1">{sel.badge&&<span className="text-[9px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">{sel.badge}</span>}<span className="text-[9px] px-2 py-0.5 rounded-full" style={{background:t.accent+'15',color:t.accent}}>via {sel.portal}</span>{sel.prime&&<span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Prime</span>}</div>
        <h2 className="text-base font-bold mb-1">{sel.name}</h2>
        <div className="flex items-center gap-2 mb-2"><span className="text-lg font-bold" style={{color:'#22c55e'}}>${sel.price}</span><span className="text-xs line-through" style={{color:t.textMuted}}>${sel.orig}</span><span className="text-xs font-bold" style={{color:'#ef4444'}}>-{disc(sel)}%</span></div>
        <div className="flex items-center gap-2 mb-3"><span className="text-xs">⭐ {sel.rating}</span><span className="text-[10px]" style={{color:t.textMuted}}>({sel.reviews.toLocaleString()} reviews)</span><span className="text-[10px]" style={{color:sel.stock==='Low Stock'?'#f59e0b':'#22c55e'}}>{sel.stock}</span></div>
        <p className="text-xs mb-3">{sel.desc}</p>
        {sel.sizes&&<div className="mb-3"><p className="text-[10px] font-bold mb-1">Size</p><div className="flex gap-1">{sel.sizes.map(s=>(<button key={s} className="px-3 py-1 rounded-lg text-xs" style={{background:t.bg,border:`1px solid ${t.cardBorder}`}}>{s}</button>))}</div></div>}

        {/* Price Comparison -- Datore Unique */}
        <h4 className="text-[10px] font-bold mb-1">💰 Price Comparison Across Portals</h4>
        <div className="space-y-1 mb-3">{sel.priceHistory.map((ph,i)=>(
          <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg" style={{background:i===0?'rgba(34,197,94,0.08)':t.bg}}>
            <span className="text-[10px] font-medium w-20">{ph.portal}</span>
            <div className="flex-1 h-1 rounded-full" style={{background:t.cardBorder}}><div className="h-1 rounded-full" style={{background:i===0?'#22c55e':'#3b82f6',width:`${(Math.min(...sel.priceHistory.map(x=>x.price))/ph.price)*100}%`}}/></div>
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
          <button onClick={()=>toggleSave(sel.id)} className="px-4 py-2.5 rounded-lg text-xs" style={{background:t.cardBorder}}>{sel.saved?'💾':'🤍'}</button>
          <button onClick={()=>toggleCompare(sel.id)} className="px-4 py-2.5 rounded-lg text-xs" style={{background:compareList.includes(sel.id)?'rgba(139,92,246,0.15)':t.cardBorder,color:compareList.includes(sel.id)?'#8b5cf6':t.text}}>⚖️</button>
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
      <div className="flex items-center gap-2 p-2 rounded-xl" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
        <IcoSearch size={14} color={t.textMuted}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products globally..." className="flex-1 text-sm bg-transparent outline-none" style={{color:t.text}}/>
        <button onClick={voiceS} className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:voiceSrch?'rgba(239,68,68,0.1)':'rgba(139,92,246,0.08)'}}><IcoMic size={14} color={voiceSrch?'#ef4444':t.textMuted}/></button>
      </div>
      {voiceSrch&&<p className="text-xs text-center animate-pulse" style={{color:'#ef4444'}}>🎙️ Listening...</p>}

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{background:t.card}}>{(['shop','cart','wishlist','orders','compare'] as const).map(tb=>(
        <button key={tb} onClick={()=>setTab(tb)} className="flex-1 py-1.5 rounded-lg text-[10px] font-semibold relative" style={{background:tab===tb?t.accent:'transparent',color:tab===tb?'#fff':t.textMuted}}>
          {tb==='shop'?`🛍️ Shop`:tb==='cart'?`🛒 Cart (${cart.length})`:tb==='wishlist'?`💾 Saved (${wishlist.length})`:tb==='orders'?`📦 Orders (${orders.length})`:`⚖️ Compare (${compareList.length})`}
          {tb==='orders'&&orders.length>0&&tab!=='orders'&&<span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold text-white" style={{background:'#ef4444'}}>{orders.length}</span>}
        </button>
      ))}</div>

      {/* Active Order Status Banner — always visible when orders exist */}
      {orders.length > 0 && tab !== 'orders' && (
        <div onClick={() => setTab('orders')} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer" style={{background:'linear-gradient(135deg,rgba(34,197,94,0.08),rgba(99,102,241,0.08))',border:'1px solid rgba(34,197,94,0.2)'}}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:'rgba(34,197,94,0.12)'}}>
            <span className="text-lg">{orders[0].status==='delivered'?'📬':orders[0].status==='shipped'?'🚚':orders[0].status==='processing'?'⏳':'📦'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold">{orders[0].id} — <span className="capitalize" style={{color:orders[0].status==='delivered'?'#22c55e':orders[0].status==='shipped'?'#3b82f6':'#f59e0b'}}>{orders[0].status}</span></p>
            <p className="text-[9px]" style={{color:t.textMuted}}>{orders[0].items.length} item{orders[0].items.length!==1?'s':''} · ${orders[0].total.toFixed(2)} · {orders[0].payMethod}</p>
            {orders[0].tracking && <p className="text-[8px]" style={{color:t.textMuted}}>📍 Tracking: {orders[0].tracking}</p>}
          </div>
          <span className="text-xs font-bold" style={{color:t.accent}}>View →</span>
        </div>
      )}

      {tab==='shop'&&(
        <>
          {/* Categories */}
          <div className="flex gap-1 overflow-x-auto" style={{scrollbarWidth:'none'}}>{CATS.map(c=>(
            <button key={c} onClick={()=>setCat(c)} className="px-3 py-1 rounded-full text-[10px] font-medium whitespace-nowrap" style={{background:cat===c?t.accent+'20':t.card,color:cat===c?t.accent:t.textMuted}}>{c}</button>
          ))}</div>

          {/* Portals */}
          <div className="flex gap-1 overflow-x-auto" style={{scrollbarWidth:'none'}}>{PORTALS.map(p=>(
            <button key={p} onClick={()=>setPortal(p)} className="px-2 py-0.5 rounded-full text-[9px] font-medium whitespace-nowrap" style={{background:portal===p?'rgba(139,92,246,0.15)':'transparent',color:portal===p?'#8b5cf6':t.textMuted,border:`1px solid ${portal===p?'#8b5cf6':t.cardBorder}`}}>{p}</button>
          ))}</div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={()=>setPrimeOnly(!primeOnly)} className="px-2 py-0.5 rounded-full text-[9px] font-medium" style={{background:primeOnly?'rgba(59,130,246,0.15)':'transparent',color:primeOnly?'#3b82f6':t.textMuted,border:`1px solid ${primeOnly?'#3b82f6':t.cardBorder}`}}>Prime Only</button>
            <select value={sort} onChange={e=>setSort(e.target.value)} className="px-2 py-0.5 rounded-full text-[9px]" style={{background:t.card,color:t.text,border:`1px solid ${t.cardBorder}`}}>{SORT_OPTS.map(s=><option key={s}>{s}</option>)}</select>
            <span className="text-[9px]" style={{color:t.textMuted}}>{filtered.length} results</span>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 gap-2">
            {filtered.map(p=>(
              <button key={p.id} onClick={()=>setSelId(p.id)} className="text-left p-2 rounded-xl" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
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

      {/* CART with Quantities + Checkout */}
      {tab==='cart'&&(
        <div className="space-y-2">
          {cart.length===0?<p className="text-center text-sm py-8" style={{color:t.textMuted}}>Cart is empty</p>:(<>
            {cart.map(p=>(
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
                <span className="text-2xl">{p.img}</span>
                <div className="flex-1 min-w-0"><p className="text-xs font-semibold truncate">{p.name}</p><p className="text-[10px]" style={{color:t.textMuted}}>{p.portal} · {p.delivery}</p></div>
                {/* Qty controls */}
                <div className="flex items-center gap-1">
                  <button onClick={()=>updateQty(p.id,-1)} className="w-6 h-6 rounded flex items-center justify-center text-xs" style={{background:t.cardBorder}}>−</button>
                  <span className="text-xs font-bold w-5 text-center">{getQty(p.id)}</span>
                  <button onClick={()=>updateQty(p.id,1)} className="w-6 h-6 rounded flex items-center justify-center text-xs" style={{background:t.cardBorder}}>+</button>
                </div>
                <div className="text-right"><p className="text-sm font-bold" style={{color:'#22c55e'}}>${(p.price*getQty(p.id)).toFixed(2)}</p>{p.orig>p.price&&<p className="text-[9px]" style={{color:'#ef4444'}}>Save ${((p.orig-p.price)*getQty(p.id)).toFixed(2)}</p>}</div>
                <button onClick={()=>toggleCart(p.id)} className="text-xs" style={{color:'#ef4444'}}>✕</button>
              </div>
            ))}
            {/* Cart Summary */}
            <div className="p-3 rounded-xl" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
              <div className="flex justify-between text-xs mb-1"><span>Subtotal ({cart.length} items, {cart.reduce((s,p)=>s+getQty(p.id),0)} units)</span><span className="font-bold">${cartTotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-xs mb-1"><span>Total Savings</span><span className="font-bold" style={{color:'#22c55e'}}>-${savings.toFixed(2)}</span></div>
              <div className="flex justify-between text-xs mb-1"><span>Delivery</span><span className="font-bold" style={{color:'#22c55e'}}>FREE</span></div>
              <div className="flex justify-between text-xs mb-1" style={{borderTop:`1px solid ${t.cardBorder}`,paddingTop:6}}><span>Token equivalent ({tokenInfo.name})</span><span className="font-bold">{tokenInfo.symbol} {cartTokens.toLocaleString()}</span></div>
              <button onClick={()=>setShowCheckout(true)} className="w-full mt-2 py-3 rounded-xl text-sm font-bold text-white" style={{background:`linear-gradient(135deg,${t.accent},#8b5cf6)`}}>Proceed to Checkout -- ${cartTotal.toFixed(2)}</button>
            </div>
          </>)}
        </div>
      )}

      {/* ══════ CHECKOUT MODAL ══════ */}
      {showCheckout&&(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{background:'rgba(0,0,0,0.7)'}} onClick={()=>!orderPlaced&&setShowCheckout(false)}>
          <div onClick={e=>e.stopPropagation()} className="w-full max-w-lg rounded-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto" style={{background:isDark?'#1a1a2e':'#fff'}}>
            {orderPlaced ? (
              <div className="text-center py-8 space-y-3">
                <div className="text-5xl">✅</div>
                <h2 className="text-xl font-bold" style={{color:'#22c55e'}}>Order Placed!</h2>
                <p className="text-xs" style={{color:t.textMuted}}>Order #{Date.now().toString().slice(-6)} confirmed. Redirecting...</p>
                <div className="flex justify-center gap-2">{cart.slice(0,3).map(p=>(<span key={p.id} className="text-2xl">{p.img}</span>))}</div>
              </div>
            ) : (<>
              <h2 className="text-lg font-bold">Checkout</h2>

              {/* Shipping Address */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold" style={{color:t.textMuted}}>📦 SHIPPING ADDRESS</p>
                <div className="grid grid-cols-2 gap-2">
                  <input value={shippingAddr.name} onChange={e=>setShippingAddr(a=>({...a,name:e.target.value}))} placeholder="Full name" className="p-2 rounded-lg text-xs outline-none" style={{background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.03)',border:`1px solid ${t.cardBorder}`,color:t.text}}/>
                  <select value={shippingAddr.country} onChange={e=>setShippingAddr(a=>({...a,country:e.target.value}))} className="p-2 rounded-lg text-xs" style={{background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.03)',border:`1px solid ${t.cardBorder}`,color:t.text}}>
                    {Object.keys(TOKEN_RATE).map(c=>(<option key={c} value={c}>{c}</option>))}
                  </select>
                  <input value={shippingAddr.line1} onChange={e=>setShippingAddr(a=>({...a,line1:e.target.value}))} placeholder="Address" className="col-span-2 p-2 rounded-lg text-xs outline-none" style={{background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.03)',border:`1px solid ${t.cardBorder}`,color:t.text}}/>
                  <input value={shippingAddr.city} onChange={e=>setShippingAddr(a=>({...a,city:e.target.value}))} placeholder="City" className="p-2 rounded-lg text-xs outline-none" style={{background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.03)',border:`1px solid ${t.cardBorder}`,color:t.text}}/>
                  <input value={shippingAddr.zip} onChange={e=>setShippingAddr(a=>({...a,zip:e.target.value}))} placeholder="Postal Code" className="p-2 rounded-lg text-xs outline-none" style={{background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.03)',border:`1px solid ${t.cardBorder}`,color:t.text}}/>
                </div>
              </div>

              {/* Order Summary */}
              <div className="p-3 rounded-xl" style={{background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.02)'}}>
                <p className="text-[10px] font-bold mb-2" style={{color:t.textMuted}}>🛒 ORDER SUMMARY</p>
                {cart.map(p=>(<div key={p.id} className="flex items-center gap-2 py-1"><span>{p.img}</span><span className="text-[10px] flex-1 truncate">{p.name} × {getQty(p.id)}</span><span className="text-[10px] font-bold">${(p.price*getQty(p.id)).toFixed(2)}</span></div>))}
                <div className="border-t pt-1 mt-1" style={{borderColor:t.cardBorder}}>
                  <div className="flex justify-between text-xs"><span>Total</span><span className="font-bold text-sm">${cartTotal.toFixed(2)}</span></div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold" style={{color:t.textMuted}}>💳 PAYMENT METHOD</p>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    {k:'card' as const,l:'💳 Card',d:'Credit/Debit'},
                    {k:'token' as const,l:`${tokenInfo.symbol} Tokens`,d:tokenInfo.name},
                    {k:'wallet' as const,l:'👛 Wallet',d:'Datore Wallet'},
                  ]).map(m=>(
                    <button key={m.k} onClick={()=>setPayMethod(m.k)} className="p-2 rounded-xl text-center" style={{background:payMethod===m.k?t.accent+'15':'transparent',border:`1.5px solid ${payMethod===m.k?t.accent:t.cardBorder}`}}>
                      <p className="text-xs font-bold" style={{color:payMethod===m.k?t.accent:t.text}}>{m.l}</p>
                      <p className="text-[8px]" style={{color:t.textMuted}}>{m.d}</p>
                    </button>
                  ))}
                </div>

                {/* Card Fields */}
                {payMethod==='card'&&(
                  <div className="grid grid-cols-2 gap-2">
                    <input value={cardInfo.number} onChange={e=>setCardInfo(c=>({...c,number:e.target.value}))} placeholder="Card Number" maxLength={19} className="col-span-2 p-2 rounded-lg text-xs outline-none" style={{background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.03)',border:`1px solid ${t.cardBorder}`,color:t.text}}/>
                    <input value={cardInfo.name} onChange={e=>setCardInfo(c=>({...c,name:e.target.value}))} placeholder="Name on Card" className="col-span-2 p-2 rounded-lg text-xs outline-none" style={{background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.03)',border:`1px solid ${t.cardBorder}`,color:t.text}}/>
                    <input value={cardInfo.expiry} onChange={e=>setCardInfo(c=>({...c,expiry:e.target.value}))} placeholder="MM/YY" maxLength={5} className="p-2 rounded-lg text-xs outline-none" style={{background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.03)',border:`1px solid ${t.cardBorder}`,color:t.text}}/>
                    <input value={cardInfo.cvv} onChange={e=>setCardInfo(c=>({...c,cvv:e.target.value}))} placeholder="CVV" maxLength={4} type="password" className="p-2 rounded-lg text-xs outline-none" style={{background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.03)',border:`1px solid ${t.cardBorder}`,color:t.text}}/>
                  </div>
                )}

                {/* Token Payment */}
                {payMethod==='token'&&(
                  <div className="p-3 rounded-xl" style={{background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.02)'}}>
                    <div className="flex justify-between text-xs mb-2"><span>Your {tokenInfo.name} Balance</span><span className="font-bold">{tokenInfo.symbol} {tokenBalance.toLocaleString()}</span></div>
                    <div className="flex justify-between text-xs mb-2"><span>Order Cost</span><span className="font-bold" style={{color:cartTokens<=tokenBalance?'#22c55e':'#ef4444'}}>{tokenInfo.symbol} {cartTokens.toLocaleString()}</span></div>
                    <div className="flex justify-between text-xs"><span>After Purchase</span><span className="font-bold">{tokenInfo.symbol} {(tokenBalance-cartTokens).toLocaleString()}</span></div>
                    {cartTokens>tokenBalance&&<p className="text-[9px] mt-2" style={{color:'#ef4444'}}>⚠️ Insufficient tokens. Top up or use another method.</p>}
                    <div className="mt-2 p-2 rounded-lg" style={{background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.2)'}}>
                      <p className="text-[9px]" style={{color:'#f59e0b'}}>🔒 Tokens work only within <strong>{userCountry}</strong>. International token payments are not available.</p>
                    </div>
                  </div>
                )}

                {/* Wallet */}
                {payMethod==='wallet'&&(
                  <div className="p-3 rounded-xl" style={{background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.02)'}}>
                    <div className="flex justify-between text-xs mb-1"><span>Datore Wallet</span><span className="font-bold" style={{color:'#22c55e'}}>$2,450.00</span></div>
                    <p className="text-[9px]" style={{color:t.textMuted}}>Funds from your Datore earnings and deposits</p>
                  </div>
                )}
              </div>

              {/* Place Order */}
              <div className="flex gap-2">
                <button onClick={placeOrder} disabled={payMethod==='token'&&cartTokens>tokenBalance} className="flex-1 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-40" style={{background:`linear-gradient(135deg,${t.accent},#22c55e)`}}>
                  {payMethod==='token'?`Pay ${tokenInfo.symbol} ${cartTokens.toLocaleString()} Tokens`
                   :payMethod==='wallet'?`Pay $${cartTotal.toFixed(2)} from Wallet`
                   :`Pay $${cartTotal.toFixed(2)}`}
                </button>
                <button onClick={()=>setShowCheckout(false)} className="px-4 py-3 rounded-xl text-xs" style={{border:`1px solid ${t.cardBorder}`}}>Cancel</button>
              </div>
            </>)}
          </div>
        </div>
      )}

      {/* WISHLIST */}
      {tab==='wishlist'&&(
        <div className="space-y-2">
          {wishlist.length===0?<p className="text-center text-sm py-8" style={{color:t.textMuted}}>No saved items</p>:
          wishlist.map(p=>(
            <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
              <span className="text-2xl">{p.img}</span>
              <div className="flex-1"><p className="text-xs font-semibold">{p.name}</p><p className="text-sm font-bold" style={{color:'#22c55e'}}>${p.price}</p></div>
              <button onClick={()=>toggleCart(p.id)} className="px-2 py-1 rounded text-[9px] font-bold text-white" style={{background:t.accent}}>🛒</button>
              <button onClick={()=>toggleSave(p.id)} className="text-xs" style={{color:'#ef4444'}}>✕</button>
            </div>
          ))}
        </div>
      )}

      {/* ORDERS — Purchase History & Status */}
      {tab==='orders'&&(
        <div className="space-y-2">
          {orders.length===0?(<div className="text-center py-12"><p className="text-3xl mb-2">📦</p><p className="text-sm font-medium">No orders yet</p><p className="text-xs" style={{color:t.textMuted}}>Your purchase history will appear here</p><button onClick={()=>setTab('shop')} className="mt-3 px-4 py-2 rounded-xl text-xs font-bold text-white" style={{background:t.accent}}>Start Shopping</button></div>):(<>
            <p className="text-xs font-semibold" style={{color:t.textMuted}}>{orders.length} order{orders.length!==1?'s':''}</p>
            {orders.map(order => {
              const sc = order.status==='delivered'?'#22c55e':order.status==='shipped'?'#3b82f6':order.status==='processing'?'#f59e0b':order.status==='cancelled'?'#ef4444':'#8b5cf6';
              const steps = ['confirmed','processing','shipped','delivered'];
              const stepIdx = steps.indexOf(order.status);
              return (
                <div key={order.id} className="rounded-xl overflow-hidden" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
                  {/* Order Header */}
                  <div className="flex items-center justify-between p-3" style={{borderBottom:`1px solid ${t.cardBorder}`}}>
                    <div><p className="text-xs font-bold">{order.id}</p><p className="text-[9px]" style={{color:t.textMuted}}>{order.date}</p></div>
                    <div className="text-right"><span className="text-[9px] px-2 py-0.5 rounded-full font-bold capitalize" style={{background:`${sc}15`,color:sc}}>{order.status==='confirmed'?'✅ Confirmed':order.status==='processing'?'⏳ Processing':order.status==='shipped'?'🚚 Shipped':order.status==='delivered'?'📬 Delivered':'❌ Cancelled'}</span></div>
                  </div>

                  {/* Progress Bar */}
                  {order.status!=='cancelled'&&(
                    <div className="px-3 py-2" style={{background:isDark?'rgba(255,255,255,0.02)':'rgba(0,0,0,0.01)'}}>
                      <div className="flex items-center gap-1">
                        {steps.map((s,i) => (<div key={s} className="flex items-center flex-1">{i>0&&<div className="flex-1 h-0.5 rounded" style={{background:i<=stepIdx?sc:`${t.cardBorder}`}}/>}<div className="w-4 h-4 rounded-full flex items-center justify-center text-[8px]" style={{background:i<=stepIdx?sc:t.cardBorder,color:'#fff'}}>{i<=stepIdx?'✓':i+1}</div></div>))}
                      </div>
                      <div className="flex justify-between mt-1">{steps.map(s=>(<span key={s} className="text-[7px] capitalize" style={{color:t.textMuted}}>{s}</span>))}</div>
                    </div>
                  )}

                  {/* Items */}
                  <div className="px-3 py-2">{order.items.map((item,i)=>(<div key={i} className="flex items-center gap-2 py-1"><span className="text-lg">{item.img}</span><div className="flex-1 min-w-0"><p className="text-[10px] font-semibold truncate">{item.name}</p><p className="text-[8px]" style={{color:t.textMuted}}>{item.portal} × {item.qty}</p></div><span className="text-[10px] font-bold" style={{color:'#22c55e'}}>${(item.price*item.qty).toFixed(2)}</span></div>))}</div>

                  {/* Footer */}
                  <div className="flex items-center justify-between px-3 py-2" style={{borderTop:`1px solid ${t.cardBorder}`,background:isDark?'rgba(255,255,255,0.02)':'rgba(0,0,0,0.01)'}}>
                    <div><p className="text-[9px]" style={{color:t.textMuted}}>{order.payMethod} · 📍 {order.address.slice(0,30)}...</p>{order.tracking&&<p className="text-[8px]" style={{color:t.textMuted}}>Tracking: {order.tracking}</p>}</div>
                    <p className="text-sm font-bold" style={{color:'#22c55e'}}>${order.total.toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
          </>)}
        </div>
      )}

      {/* COMPARE */}
      {tab==='compare'&&(
        <div className="space-y-2">
          {compareList.length<2?<p className="text-center text-sm py-8" style={{color:t.textMuted}}>Select 2-3 products to compare</p>:(
            <div className="overflow-x-auto">
              <div className="flex gap-2" style={{minWidth:`${compareList.length*180}px`}}>
                {compareList.map(id=>{const p=products.find(x=>x.id===id);if(!p)return null;return(
                  <div key={p.id} className="w-44 p-3 rounded-xl flex-shrink-0" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
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
