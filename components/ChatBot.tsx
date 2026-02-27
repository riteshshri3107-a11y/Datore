"use client";
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';

const REPLIES: Array<{keys:string[]; text:string; go?:string}> = [
  { keys:['hello','hi','hey','howdy','sup','good morning','good evening'], text:"Hey there! I'm Dato, your AI assistant for Datore. I can help you find workers, post jobs, navigate the app, check your wallet, or answer questions. Just ask!" },
  { keys:['help','what can you','what do you','menu','options'], text:"Here's what I can help with:\n\n- Find workers near you\n- Post a new job\n- Browse job listings\n- Open map view\n- Check your wallet\n- Community groups\n- Safety and trust info\n- Marketplace\n\nJust type what you need!" },
  { keys:['find worker','search worker','need someone','hire','looking for'], text:"Let me open the worker directory! You can search by skill, filter by rating, and check availability.", go:'/jobplace/providers' },
  { keys:['post job','create job','new job','post a job','need help with'], text:"Let's create a new job posting! I'll take you to the form where you can set title, budget, urgency, and description.", go:'/jobplace/create' },
  { keys:['map','nearby','around me','close to me','location'], text:"Opening the map view! You'll see all available workers near you with their ratings and rates.", go:'/jobplace/map' },
  { keys:['wallet','balance','money','token','payment','add money'], text:"Taking you to your wallet! You can check your balance, add tokens, or withdraw funds.", go:'/wallet' },
  { keys:['community','group','join','social'], text:"Opening Communities! Join groups like GTA Babysitters, Toronto Handyworkers, Pet Lovers, and more.", go:'/community' },
  { keys:['market','buy','sell','listing','shop'], text:"Opening the Marketplace! Browse and sell electronics, furniture, sports gear, and more.", go:'/marketplace' },
  { keys:['profile','my account','my info'], text:"Here's your profile page where you can update your info, view activity, and manage settings.", go:'/profile' },
  { keys:['setting','theme','dark mode','preference'], text:"Opening Settings! You can change theme, dark mode, accent colors, and notification preferences.", go:'/settings' },
  { keys:['buddy','favorite','saved worker','fav list'], text:"Opening your Buddy List! These are workers you've saved as favorites for quick rehiring.", go:'/buddylist' },
  { keys:['message','chat','inbox','conversation'], text:"Opening your messages! You can chat with workers and job posters here.", go:'/inbox' },
  { keys:['notification','alert','updates'], text:"Opening notifications! Check your latest updates, job applications, and messages.", go:'/notifications' },
  { keys:['trust','trust score','how trust','rating system'], text:"Trust Score (0-100) is calculated from:\n\n- Reviews (40%)\n- Job completion rate (15%)\n- Low complaints (15%)\n- Chat sentiment (10%)\n- On-time delivery (10%)\n- Verification status (10%)\n\nScores above 80 are rated Excellent!" },
  { keys:['safety','safe','secure','verification','police','background'], text:"Datore safety features:\n\n- Police verification badges\n- Background checks\n- Trust score system (0-100)\n- Escrow payments\n- Live photo verification\n- QR code check-in\n- Community reviews\n\nYour safety is our top priority!" },
  { keys:['plumb','pipe','leak','faucet','toilet'], text:"James O'Brien is our top plumber! Rating 4.7, $45/hr, police verified with 10+ years experience. Want to view his profile?", go:'/worker/2' },
  { keys:['babysit','nanny','child','kids','daycare'], text:"Maria Santos is our best babysitter! Rating 4.9, $22/hr, first aid and CPR certified with 52 completed jobs.", go:'/worker/1' },
  { keys:['clean','cleaning','maid','housekeep'], text:"Priya Sharma is a top cleaner! Rating 4.8, $28/hr, trust score 95, 71 completed jobs. She also does amazing cooking!", go:'/worker/3' },
  { keys:['pet','dog','cat','animal','walk'], text:"Aisha Hassan is perfect for pet care! Rating 4.9, $20/hr, pet first aid certified, 60 happy clients!", go:'/worker/5' },
  { keys:['cook','chef','food','catering','meal'], text:"Rosa Martinez is our star chef! Rating 4.8, $35/hr, specializes in Latin and Mediterranean cuisine.", go:'/worker/7' },
  { keys:['tutor','teach','math','science','homework','study'], text:"David Chen tutors math and science for grades 6-12! Rating 4.6, $40/hr, BSc in Computer Science.", go:'/worker/4' },
  { keys:['move','moving','reloc','heavy','lift','furniture'], text:"Mike Johnson is a reliable mover! Rating 4.5, $30/hr or $180 fixed for apartments.", go:'/worker/6' },
  { keys:['paint','garden','landscap','yard','lawn'], text:"Tom Wilson does both gardening and painting! Rating 4.4, $25/hr, 6+ years experience.", go:'/worker/8' },
  { keys:['how much','cost','price','cheap','afford','rate'], text:"Rates vary by service:\n\nBabysitting: $18-25/hr\nPlumbing: $45-80/hr\nCleaning: $25-35/hr\nTutoring: $35-45/hr\nPet Care: $18-25/hr\nMoving: $25-35/hr\nPainting: $25-40/hr\n\nAll workers set their own rates!" },
  { keys:['how to use','tutorial','guide','start','new user','beginner'], text:"Getting started with Datore:\n\n1. Browse workers or post a job\n2. Chat with workers directly\n3. Hire and pay through escrow\n4. Rate and review after the job\n5. Save favorites to your Buddy List\n\nNeed help with a specific step?" },
  { keys:['escrow','how pay','payment work','money safe'], text:"Escrow payment works like this:\n\n1. You fund the job amount\n2. Money is held securely in escrow\n3. Worker completes the job\n4. You confirm completion\n5. Payment is released to the worker\n\nYour money is always safe!" },
  { keys:['cancel','refund','dispute','complaint','problem'], text:"If you have an issue:\n\n1. Try resolving through chat first\n2. Open a dispute within 24 hours\n3. Provide evidence (photos, messages)\n4. Our team reviews within 48 hours\n5. Refund issued if claim is valid\n\nWe're here to help!" },
  { keys:['weather','outside','rain'], text:"I focus on helping with Datore services! But I'd say it's always a good day to get things done." },
  { keys:['thank','thanks','thx','appreciate'], text:"You're welcome! Happy to help anytime. Is there anything else you need?" },
  { keys:['bye','goodbye','see you','later'], text:"See you later! I'm always here if you need help finding workers or posting jobs. Have a great day!" },
  { keys:['joke','funny','laugh'], text:"Why did the plumber go to school? Because he wanted to get to the bottom of things!\n\nNeed anything else?" },
  { keys:['who are you','what are you','your name','dato'], text:"I'm Dato, your AI assistant built into Datore! Think of me like Siri or Google Assistant, but specifically designed to help you find local workers, manage jobs, and navigate the app. I'm available 24/7!" },
  { keys:['best worker','recommend','suggest','top rated'], text:"Here are our highest-rated workers:\n\n1. Maria Santos - Babysitting (4.9)\n2. Aisha Hassan - Pet Care (4.9)\n3. Priya Sharma - Cleaning (4.8)\n4. Rosa Martinez - Cooking (4.8)\n5. James O'Brien - Plumbing (4.7)\n\nWant to see any of their profiles?" },
  { keys:['urgent','emergency','asap','right now','immediately'], text:"For urgent needs, I recommend:\n\n1. Post a job with 'Immediate' urgency\n2. Check the Map for available workers nearby\n3. Contact top-rated workers directly via chat\n\nShall I help you post an urgent job?", go:'/jobplace/create' },
];

function getReply(q: string): { text: string; go?: string } {
  const l = q.toLowerCase().trim();
  for (const r of REPLIES) { if (r.keys.some(k => l.includes(k))) return { text: r.text, go: r.go }; }
  return { text: "I'm not sure about that, but I can help you with:\n\n- \"Find workers\" to browse providers\n- \"Post a job\" to create a listing\n- \"Map\" to see workers nearby\n- \"Wallet\" to check your balance\n- \"Trust\" to learn about trust scores\n\nTry asking about a specific service like babysitting, plumbing, or cleaning!" };
}

export default function ChatBot() {
  const router = useRouter();
  const { isDark, accentColor } = useThemeStore();
  const t = getTheme(isDark, 2, accentColor);
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<{text:string; fromMe:boolean; go?:string}[]>([
    { text:"Hi! I'm Dato, your AI assistant. I can help you find workers, post jobs, check safety scores, manage your wallet, or navigate anywhere in the app. Just ask or tap a quick action below!", fromMe:false },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top:scrollRef.current.scrollHeight, behavior:'smooth' }); }, [msgs, typing]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 300); }, [open]);

  const send = (text?: string) => {
    const q = (text || input).trim();
    if (!q) return;
    setMsgs(p => [...p, { text:q, fromMe:true }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      const reply = getReply(q);
      setTyping(false);
      setMsgs(p => [...p, { text:reply.text, fromMe:false, go:reply.go }]);
    }, 600 + Math.random() * 800);
  };

  const quickBtns = [
    { label:'Find Workers', q:'Find workers' },
    { label:'Post a Job', q:'Post a job' },
    { label:'Map View', q:'Map nearby' },
    { label:'My Wallet', q:'Wallet balance' },
    { label:'Safety Info', q:'Safety features' },
    { label:'Best Workers', q:'Best worker recommend' },
    { label:'How It Works', q:'How to use tutorial' },
  ];

  return (
    <>
      {/* Floating Button */}
      <button onClick={() => setOpen(!open)} style={{
        position:'fixed', bottom:80, right:16, width:56, height:56, borderRadius:'50%',
        background:`linear-gradient(135deg,${t.accent},#8b5cf6)`, color:'white', border:'none',
        boxShadow:`0 6px 24px ${t.accentGlow}`, cursor:'pointer', zIndex:9998,
        display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:700,
        transition:'transform 0.3s'
      }}>
        {open ? 'X' : 'AI'}
      </button>

      {/* Badge */}
      {!open && (
        <div style={{
          position:'fixed', bottom:138, right:14, background:t.accent, color:'white',
          padding:'4px 10px', borderRadius:12, fontSize:10, fontWeight:600, zIndex:9998,
          boxShadow:'0 2px 8px rgba(0,0,0,0.2)', whiteSpace:'nowrap'
        }}>
          Ask Dato
        </div>
      )}

      {/* Chat Window */}
      {open && (
        <div style={{
          position:'fixed', bottom:145, right:16, width:380, maxWidth:'calc(100vw - 32px)',
          height:520, maxHeight:'calc(100vh - 200px)', borderRadius:20,
          background:isDark?'#1a1a2e':'#ffffff', border:`1px solid ${t.cardBorder}`,
          boxShadow:'0 12px 48px rgba(0,0,0,0.25)', zIndex:9999,
          display:'flex', flexDirection:'column', overflow:'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding:'14px 16px', background:`linear-gradient(135deg,${t.accent},#8b5cf6)`,
            color:'white', display:'flex', alignItems:'center', gap:10
          }}>
            <div style={{
              width:38, height:38, borderRadius:'50%', background:'rgba(255,255,255,0.2)',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700
            }}>AI</div>
            <div style={{ flex:1 }}>
              <p style={{ fontWeight:700, fontSize:14, margin:0 }}>Dato - AI Assistant</p>
              <p style={{ fontSize:11, opacity:0.85, margin:0 }}>Always online - Ask me anything</p>
            </div>
            <button onClick={() => setOpen(false)} style={{ background:'none', border:'none', color:'white', fontSize:18, cursor:'pointer', opacity:0.8 }}>X</button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={{ flex:1, overflowY:'auto', padding:12, display:'flex', flexDirection:'column', gap:8 }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ display:'flex', justifyContent:m.fromMe?'flex-end':'flex-start' }}>
                <div style={{ maxWidth:'85%' }}>
                  <div style={{
                    padding:'10px 14px',
                    borderRadius:m.fromMe?'14px 14px 4px 14px':'14px 14px 14px 4px',
                    background:m.fromMe?`linear-gradient(135deg,${t.accent},#8b5cf6)`:(isDark?'rgba(255,255,255,0.08)':'#f3f4f6'),
                    color:m.fromMe?'white':t.text, fontSize:13, lineHeight:1.6, whiteSpace:'pre-line'
                  }}>{m.text}</div>
                  {m.go && !m.fromMe && (
                    <button onClick={() => { router.push(m.go!); setOpen(false); }} style={{
                      marginTop:4, padding:'6px 14px', borderRadius:10, background:t.accentLight,
                      color:t.accent, border:`1px solid ${t.accent}33`, fontSize:11, fontWeight:600, cursor:'pointer'
                    }}>
                      Open this page
                    </button>
                  )}
                </div>
              </div>
            ))}
            {typing && (
              <div style={{ display:'flex' }}>
                <div style={{ padding:'10px 18px', borderRadius:'14px 14px 14px 4px', background:isDark?'rgba(255,255,255,0.08)':'#f3f4f6', fontSize:13 }}>
                  <span className="animate-pulse">...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick action buttons */}
          <div style={{ padding:'4px 12px 8px', display:'flex', flexWrap:'wrap', gap:4 }}>
            {quickBtns.map(q => (
              <button key={q.label} onClick={() => send(q.q)} style={{
                padding:'5px 12px', borderRadius:20,
                background:isDark?'rgba(255,255,255,0.06)':'#f3f4f6',
                color:t.accent, border:`1px solid ${t.accent}22`,
                fontSize:11, fontWeight:500, cursor:'pointer'
              }}>{q.label}</button>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding:'10px 12px 14px', borderTop:`1px solid ${t.cardBorder}` }}>
            <div style={{ display:'flex', gap:8 }}>
              <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="Ask Dato anything..."
                style={{
                  flex:1, padding:'10px 14px', borderRadius:20,
                  border:`1px solid ${t.cardBorder}`,
                  background:isDark?'rgba(255,255,255,0.06)':'#f9fafb',
                  color:t.text, fontSize:13, outline:'none'
                }} />
              <button onClick={() => send()} style={{
                width:40, height:40, borderRadius:'50%',
                background:`linear-gradient(135deg,${t.accent},#8b5cf6)`,
                color:'white', border:'none', fontSize:14, fontWeight:700,
                cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'
              }}>Go</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
