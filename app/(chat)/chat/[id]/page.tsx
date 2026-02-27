"use client";
export const dynamic = "force-dynamic";
import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { CHAT_CONTACTS, AUTO_REPLIES } from '@/lib/demoData';

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const id = params.id as string;
  const contact = CHAT_CONTACTS[id] || { name:'User', status:'online', skills:'General' };
  const [messages, setMessages] = useState<{text:string;fromMe:boolean;time:string}[]>([
    { text:`Hi! I saw your profile. I'm interested in your ${contact.skills} services.`, fromMe:true, time:'2:30 PM' },
    { text:(AUTO_REPLIES[id]||AUTO_REPLIES['default'])[0], fromMe:false, time:'2:31 PM' },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const replyIdx = useRef(1);

  useEffect(() => { scrollRef.current?.scrollTo({ top:scrollRef.current.scrollHeight, behavior:'smooth' }); }, [messages, typing]);

  const send = () => {
    if (!input.trim()) return;
    const now = new Date().toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});
    setMessages(p=>[...p, { text:input.trim(), fromMe:true, time:now }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const replies = AUTO_REPLIES[id]||AUTO_REPLIES['default'];
      const reply = replies[replyIdx.current % replies.length];
      replyIdx.current++;
      setMessages(p=>[...p, { text:reply, fromMe:false, time:new Date().toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}) }]);
    }, 1200+Math.random()*1500);
  };

  const initials = contact.name.split(' ').map((n:string)=>n[0]).join('');
  const isWorker = !id.startsWith('p');
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', background:isDark?'#0f0f1a':'#f5f7ff' }}>
      <div style={{ padding:'12px 16px', display:'flex', alignItems:'center', gap:12, borderBottom:`1px solid ${t.cardBorder}`, background:isDark?'rgba(26,26,46,0.95)':'rgba(255,255,255,0.95)', backdropFilter:'blur(20px)' }}>
        <button onClick={()=>router.back()} style={{ fontSize:18, background:'none', border:'none', color:t.text, cursor:'pointer' }}>\u2190</button>
        <div onClick={()=>isWorker&&router.push(`/worker/${id}`)} style={{ width:40, height:40, borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, background:`linear-gradient(135deg,${t.accent}33,#8b5cf633)`, color:t.accent, cursor:isWorker?'pointer':'default', position:'relative', flexShrink:0 }}>
          {initials}
          <div style={{ position:'absolute', bottom:-1, right:-1, width:10, height:10, borderRadius:'50%', background:contact.status==='online'?'#22c55e':'#f59e0b', border:`2px solid ${isDark?'#1a1a2e':'#fff'}` }}></div>
        </div>
        <div style={{ flex:1 }}>
          <p style={{ fontWeight:600, fontSize:14, margin:0 }}>{contact.name}</p>
          <p style={{ fontSize:11, color:contact.status==='online'?'#22c55e':'#f59e0b', margin:0 }}>{contact.status==='online'?'\u25cf Online':'\u25cb Away'}</p>
        </div>
        {isWorker && <button onClick={()=>router.push(`/worker/${id}`)} style={{ padding:'6px 12px', borderRadius:10, background:t.accentLight, color:t.accent, border:'none', fontSize:11, fontWeight:600, cursor:'pointer' }}>View Profile</button>}
      </div>
      <div ref={scrollRef} style={{ flex:1, overflowY:'auto', padding:16, display:'flex', flexDirection:'column', gap:8 }}>
        {messages.map((msg,i)=>(
          <div key={i} style={{ display:'flex', justifyContent:msg.fromMe?'flex-end':'flex-start' }}>
            <div style={{ maxWidth:'75%', padding:'10px 14px', borderRadius:msg.fromMe?'16px 16px 4px 16px':'16px 16px 16px 4px', background:msg.fromMe?`linear-gradient(135deg,${t.accent},#8b5cf6)`:(isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.05)'), color:msg.fromMe?'white':t.text, fontSize:13, lineHeight:1.5 }}>
              <p style={{ margin:0 }}>{msg.text}</p>
              <p style={{ margin:'4px 0 0', fontSize:10, opacity:0.6, textAlign:'right' }}>{msg.time}</p>
            </div>
          </div>
        ))}
        {typing && <div style={{ display:'flex' }}><div style={{ padding:'10px 18px', borderRadius:'16px 16px 16px 4px', background:isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.05)', fontSize:13 }}><span className="animate-pulse">\u25cf\u25cf\u25cf</span></div></div>}
      </div>
      <div style={{ padding:'10px 16px 24px', borderTop:`1px solid ${t.cardBorder}`, background:isDark?'rgba(26,26,46,0.95)':'rgba(255,255,255,0.95)' }}>
        <div style={{ display:'flex', gap:8 }}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Type a message..." style={{ flex:1, padding:'10px 16px', borderRadius:20, border:`1px solid ${t.cardBorder}`, background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', color:t.text, fontSize:13, outline:'none' }} />
          <button onClick={send} style={{ width:42, height:42, borderRadius:14, background:`linear-gradient(135deg,${t.accent},#8b5cf6)`, color:'white', border:'none', fontSize:16, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>\u27a4</button>
        </div>
      </div>
    </div>
  );
}