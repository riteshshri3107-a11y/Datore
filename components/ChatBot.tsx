"use client";
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { IcoSend, IcoClose, IcoMic } from './Icons';

const REPLIES: Array<{keys:string[]; text:string; go?:string}> = [
  { keys:['hello','hi','hey','howdy','sup','good morning','good evening'], text:"Hey there! I'm Dato, your AI assistant. I can help you find workers, post jobs, navigate, check wallet, or answer questions. Just ask!" },
  { keys:['help','what can you','what do you','menu','options'], text:"I can help with:\n\n• Find workers near you\n• Post a new job\n• Browse marketplace\n• Open map view\n• Check your wallet\n• Community groups\n• Safety & trust info\n\nJust type what you need!" },
  { keys:['find worker','search worker','need someone','hire','looking for'], text:"Let me open the worker directory for you!", go:'/jobplace/providers' },
  { keys:['post job','create job','new job','post a job','need help with'], text:"Let's create a new job posting!", go:'/jobplace/create' },
  { keys:['map','nearby','around me','close to me','location'], text:"Opening the map view!", go:'/jobplace/map' },
  { keys:['wallet','balance','money','token','payment'], text:"Taking you to your wallet!", go:'/wallet' },
  { keys:['community','group','join','social'], text:"Opening Communities!", go:'/community' },
  { keys:['market','buy','sell','listing','shop'], text:"Opening Global Shop!", go:'/shopping' },
  { keys:['profile','my account','my info'], text:"Opening your profile!", go:'/profile' },
  { keys:['setting','theme','dark mode'], text:"Opening Settings!", go:'/settings' },
  { keys:['message','chat','inbox'], text:"Opening your messages!", go:'/inbox' },
  { keys:['notification','alert'], text:"Opening notifications!", go:'/notifications' },
  { keys:['trust','trust score','rating system'], text:"Trust Score (0-100) is calculated from reviews (40%), completion rate (15%), low complaints (15%), chat sentiment (10%), on-time (10%), and verification (10%)." },
  { keys:['safety','safe','secure','verification'], text:"Datore safety features: police verification, background checks, trust scores, escrow payments, live photo verification, QR check-in, and community reviews." },
  { keys:['babysit','nanny','child','kids'], text:"Maria Santos is our top babysitter! Rating 4.9, $22/hr, first aid certified.", go:'/worker/1' },
  { keys:['plumb','pipe','leak','faucet'], text:"James O'Brien is our top plumber! Rating 4.7, $45/hr, 10+ years experience.", go:'/worker/2' },
  { keys:['clean','cleaning','maid'], text:"Priya Sharma is a top cleaner! Rating 4.8, $28/hr, trust score 95.", go:'/worker/3' },
  { keys:['pet','dog','cat','walk'], text:"Aisha Hassan is perfect for pet care! Rating 4.9, $20/hr, pet first aid certified.", go:'/worker/5' },
  { keys:['cook','chef','food'], text:"Rosa Martinez is our star chef! Rating 4.8, $35/hr, Latin & Mediterranean cuisine.", go:'/worker/7' },
  { keys:['tutor','teach','math','homework'], text:"David Chen tutors math & science! Rating 4.6, $40/hr, BSc in CS.", go:'/worker/4' },
  { keys:['how much','cost','price','rate'], text:"Typical rates:\n\nBabysitting: $18-25/hr\nPlumbing: $45-80/hr\nCleaning: $25-35/hr\nTutoring: $35-45/hr\nPet Care: $18-25/hr" },
  { keys:['how to use','tutorial','guide','start'], text:"Getting started:\n\n1. Browse workers or post a job\n2. Chat with workers\n3. Hire and pay via escrow\n4. Rate after completion\n5. Save favorites to Buddy List" },
  { keys:['thank','thanks','thx'], text:"You're welcome! Happy to help anytime. 😊" },
  { keys:['bye','goodbye','see you'], text:"See you later! I'm always here if you need help. Have a great day!" },
  { keys:['who are you','what are you','your name','dato'], text:"I'm Dato, your AI assistant built into Datore! I help you find local workers, manage jobs, and navigate the app. Available 24/7!" },
  { keys:['best worker','recommend','top rated'], text:"Top-rated workers:\n\n⭐ Maria Santos — Babysitting (4.9)\n⭐ Aisha Hassan — Pet Care (4.9)\n⭐ Priya Sharma — Cleaning (4.8)\n⭐ Rosa Martinez — Cooking (4.8)\n⭐ James O'Brien — Plumbing (4.7)" },
  { keys:['urgent','emergency','asap','immediately'], text:"For urgent needs:\n\n1. Post a job with 'Immediate' urgency\n2. Check Map for available workers\n3. Contact top-rated workers directly", go:'/jobplace/create' },
  { keys:['health','doctor','fitness','yoga'], text:"Opening Health section! Find online doctors, fitness plans, diet guides, and yoga sessions.", go:'/health' },
  { keys:['learn','education','news','library'], text:"Opening Learning! Access our library, news, tech & science articles, history, and awards.", go:'/learning' },
  { keys:['entertain','movie','game','tv','vacation'], text:"Opening Entertainment! Browse movies, TV shows, games, live matches, and vacation deals.", go:'/entertainment' },
  { keys:['reel','video','short'], text:"Opening Reels! Watch and create short-form content.", go:'/reels' },
];

function getReply(q: string): { text: string; go?: string } {
  const l = q.toLowerCase().trim();
  for (const r of REPLIES) { if (r.keys.some(k => l.includes(k))) return { text: r.text, go: r.go }; }
  return { text: "I'm not sure about that. Try asking about:\n\n• \"Find workers\" to browse providers\n• \"Post a job\" to create a listing\n• \"Health\" for doctor consultations\n• \"Learning\" for courses & news\n• \"Entertainment\" for movies & games" };
}

export default function ChatBot() {
  const router = useRouter();
  const { isDark, accentColor } = useThemeStore();
  const t = getTheme(isDark, 2, accentColor);
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<{text:string; fromMe:boolean; go?:string; time:string}[]>([
    { text:"Hi! I'm Dato, your AI assistant. Ask me anything about Datore — find workers, post jobs, explore entertainment, health, learning, and more!", fromMe:false, time:'Now' },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [listening, setListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top:scrollRef.current.scrollHeight, behavior:'smooth' }); }, [msgs, typing]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 300); }, [open]);

  const getTime = () => new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});

  const send = (text?: string) => {
    const q = (text || input).trim();
    if (!q) return;
    setMsgs(p => [...p, { text:q, fromMe:true, time:getTime() }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      const reply = getReply(q);
      setTyping(false);
      setMsgs(p => [...p, { text:reply.text, fromMe:false, go:reply.go, time:getTime() }]);
    }, 500 + Math.random() * 700);
  };

  const voiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMsgs(p => [...p, { text:"Sorry, your browser doesn't support speech recognition. Try Chrome or Edge.", fromMe:false, time:getTime() }]);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setListening(false);
      if (transcript) send(transcript);
    };
    recognition.onerror = () => {
      setListening(false);
      setMsgs(p => [...p, { text:"Couldn't catch that. Please try again or type your question.", fromMe:false, time:getTime() }]);
    };
    recognition.onend = () => setListening(false);
    recognition.start();
  };

  const quickBtns = [
    {l:'🔍 Find Workers',q:'Find workers'},
    {l:'📋 Post Job',q:'Post a job'},
    {l:'🗺️ Map',q:'Map nearby'},
    {l:'🩺 Health',q:'Health'},
    {l:'📚 Learn',q:'Learning'},
    {l:'🎬 Fun',q:'Entertainment'},
    {l:'💰 Wallet',q:'Wallet'},
  ];

  return (
    <>
      {/* Floating AI Button — smooth with pulse */}
      <button onClick={()=>setOpen(!open)} style={{
        position:'fixed', bottom:76, right:16, width:54, height:54, borderRadius:16,
        background:`linear-gradient(135deg,${t.accent},#a78bfa)`,
        color:'white', border:'none', cursor:'pointer', zIndex:9998,
        boxShadow:`0 4px 20px ${t.accent}50`, display:'flex', alignItems:'center', justifyContent:'center',
        transition:'all 0.3s cubic-bezier(0.16,1,0.3,1)',
        transform: open?'scale(0.9) rotate(90deg)':'scale(1)',
      }}>
        {open ? (
          <IcoClose size={20} color="white" />
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/><path d="M8 9h.01M12 9h.01M16 9h.01" strokeWidth="3"/></svg>
        )}
      </button>

      {/* Tooltip */}
      {!open && (
        <div style={{
          position:'fixed', bottom:134, right:16, padding:'6px 14px', borderRadius:12,
          background:isDark?'rgba(30,30,50,0.95)':'white',
          color:t.accent, fontSize:11, fontWeight:600, zIndex:9998,
          boxShadow:'0 4px 20px rgba(0,0,0,0.15)',
          border:`1px solid ${isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.06)'}`,
          animation:'float 3s ease-in-out infinite'
        }}>
          ✨ Ask Dato
        </div>
      )}

      {/* Chat Window */}
      {open && (
        <div style={{
          position:'fixed', bottom:140, right:16, width:400, maxWidth:'calc(100vw - 32px)',
          height:540, maxHeight:'calc(100vh - 200px)', borderRadius:24,
          background:isDark?'rgba(16,16,28,0.98)':'rgba(255,255,255,0.98)',
          border:`1px solid ${isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.08)'}`,
          boxShadow:isDark?'0 20px 60px rgba(0,0,0,0.5)':'0 20px 60px rgba(0,0,0,0.15)',
          backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)',
          zIndex:9999, display:'flex', flexDirection:'column', overflow:'hidden',
          animation:'scaleIn 0.25s cubic-bezier(0.16,1,0.3,1) forwards',
          transformOrigin:'bottom right'
        }}>
          {/* Header */}
          <div style={{
            padding:'16px 20px', display:'flex', alignItems:'center', gap:12,
            background:`linear-gradient(135deg,${t.accent}08,#8b5cf608)`,
            borderBottom:`1px solid ${isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.06)'}`
          }}>
            <div style={{
              width:40, height:40, borderRadius:14,
              background:`linear-gradient(135deg,${t.accent},#a78bfa)`,
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:`0 2px 10px ${t.accent}30`
            }}>
              <span style={{fontSize:18}}>🤖</span>
            </div>
            <div style={{flex:1}}>
              <p style={{fontWeight:700,fontSize:15,margin:0,color:t.text,letterSpacing:-0.3}}>Dato AI</p>
              <div style={{display:'flex',alignItems:'center',gap:4}}>
                <span style={{width:6,height:6,borderRadius:'50%',background:'#22c55e'}} />
                <span style={{fontSize:11,color:t.textMuted,fontWeight:500}}>Always online</span>
              </div>
            </div>
            <button onClick={()=>setOpen(false)} style={{background:'none',border:'none',cursor:'pointer',padding:4}}>
              <IcoClose size={18} color={t.textMuted} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={{flex:1,overflowY:'auto',padding:'16px 16px 8px',display:'flex',flexDirection:'column',gap:12}}>
            {msgs.map((m, i) => (
              <div key={i} style={{display:'flex',gap:8,justifyContent:m.fromMe?'flex-end':'flex-start',alignItems:'flex-end'}}>
                {!m.fromMe && (
                  <div style={{width:28,height:28,borderRadius:10,background:`linear-gradient(135deg,${t.accent},#a78bfa)`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <span style={{fontSize:14}}>🤖</span>
                  </div>
                )}
                <div style={{maxWidth:'78%'}}>
                  <div style={{
                    padding:'10px 14px',
                    borderRadius: m.fromMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: m.fromMe
                      ? `linear-gradient(135deg,${t.accent},#8b5cf6)`
                      : (isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)'),
                    color: m.fromMe ? 'white' : t.text,
                    fontSize: 13, lineHeight: 1.65, whiteSpace: 'pre-line',
                    boxShadow: m.fromMe ? `0 2px 12px ${t.accent}25` : 'none'
                  }}>{m.text}</div>
                  {m.go && !m.fromMe && (
                    <button onClick={()=>{router.push(m.go!);setOpen(false);}} style={{
                      marginTop:6, padding:'7px 16px', borderRadius:12,
                      background:`${t.accent}10`, color:t.accent,
                      border:`1px solid ${t.accent}20`, fontSize:11, fontWeight:600,
                      cursor:'pointer', display:'flex', alignItems:'center', gap:4
                    }}>
                      Open → 
                    </button>
                  )}
                  <p style={{fontSize:9,color:t.textMuted,marginTop:3,textAlign:m.fromMe?'right':'left',paddingLeft:m.fromMe?0:2,paddingRight:m.fromMe?2:0}}>{m.time}</p>
                </div>
                {m.fromMe && (
                  <div style={{width:28,height:28,borderRadius:10,background:'linear-gradient(135deg,#6366f1,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <span style={{fontSize:12,color:'white',fontWeight:700}}>RS</span>
                  </div>
                )}
              </div>
            ))}
            {typing && (
              <div style={{display:'flex',gap:8,alignItems:'flex-end'}}>
                <div style={{width:28,height:28,borderRadius:10,background:`linear-gradient(135deg,${t.accent},#a78bfa)`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <span style={{fontSize:14}}>🤖</span>
                </div>
                <div style={{padding:'12px 20px',borderRadius:'18px 18px 18px 4px',background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)'}}>
                  <div style={{display:'flex',gap:4}}>{[0,1,2].map(d=>(<div key={d} style={{width:6,height:6,borderRadius:'50%',background:t.textMuted,animation:`pulse-glow 1.4s ease-in-out ${d*0.2}s infinite`}} />))}</div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div style={{padding:'6px 16px 4px',display:'flex',gap:5,overflowX:'auto',scrollbarWidth:'none' as any}}>
            {quickBtns.map(q=>(
              <button key={q.l} onClick={()=>send(q.q)} style={{
                padding:'6px 12px', borderRadius:20, whiteSpace:'nowrap',
                background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)',
                color:t.textMuted, border:`1px solid ${isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.06)'}`,
                fontSize:11, fontWeight:500, cursor:'pointer'
              }}>{q.l}</button>
            ))}
          </div>

          {/* Input Bar */}
          <div style={{padding:'10px 16px 14px',borderTop:`1px solid ${isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.06)'}`}}>
            <div style={{
              display:'flex', gap:8, alignItems:'center', padding:'4px 4px 4px 16px',
              borderRadius:24,
              background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)',
              border:`1.5px solid ${isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.08)'}`,
              transition:'border-color 0.2s'
            }}>
              <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&send()}
                placeholder="Ask Dato anything..."
                style={{flex:1,background:'none',border:'none',outline:'none',color:t.text,fontSize:13,fontFamily:'inherit',padding:'8px 0'}}
              />
              <button onClick={voiceSearch} style={{
                width:34,height:34,borderRadius:'50%',border:'none',cursor:'pointer',
                background:listening?'rgba(239,68,68,0.15)':'transparent',
                display:'flex',alignItems:'center',justifyContent:'center'
              }}>
                <IcoMic size={16} color={listening?'#ef4444':t.textMuted} />
              </button>
              <button onClick={()=>send()} style={{
                width:36,height:36,borderRadius:'50%',border:'none',cursor:'pointer',
                background:input.trim()?`linear-gradient(135deg,${t.accent},#8b5cf6)`:'transparent',
                display:'flex',alignItems:'center',justifyContent:'center',
                transition:'all 0.2s', opacity:input.trim()?1:0.3
              }}>
                <IcoSend size={16} color={input.trim()?'white':t.textMuted} />
              </button>
            </div>
            {listening && <p style={{textAlign:'center',fontSize:10,color:'#ef4444',marginTop:6,fontWeight:600}}>🎙️ Listening... Speak now</p>}
          </div>
        </div>
      )}

      {/* CSS keyframes for typing dots */}
      <style>{`@keyframes scaleIn{from{opacity:0;transform:scale(.85) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}`}</style>
    </>
  );
}
