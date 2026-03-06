"use client";
export const dynamic = "force-dynamic";
import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { CHAT_CONTACTS, AUTO_REPLIES } from '@/lib/demoData';
import { IcoBack, IcoCamera, IcoImage, IcoMic, IcoSend, IcoPlay, IcoStop, IcoVideo } from '@/components/Icons';
import { sendMessage as persistMessage, getChatMessages, subscribeToMessages, getSession } from '@/lib/supabase';

type Msg = { text:string; fromMe:boolean; time:string; type?:'text'|'image'|'video'|'audio'; media?:string; };

export default function ChatPage() {
  const router = useRouter(); const params = useParams();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const id = params.id as string;
  const contact = CHAT_CONTACTS[id] || { name:'User', status:'online', skills:'General' };
  const [messages, setMessages] = useState<Msg[]>([
    { text:`Hi! I saw your profile. I'm interested in your ${contact.skills} services.`, fromMe:true, time:'2:30 PM', type:'text' },
    { text:(AUTO_REPLIES[id]||AUTO_REPLIES['default'])[0], fromMe:false, time:'2:31 PM', type:'text' },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<{url:string;type:'image'|'video'}|null>(null);
  const [recording, setRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [showAttach, setShowAttach] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const replyIdx = useRef(1);
  const photoRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MediaRecorder|null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top:scrollRef.current.scrollHeight, behavior:'smooth' }); }, [messages, typing]);

  // Load persisted messages and subscribe to realtime updates
  useEffect(() => {
    let sub: any;
    (async () => {
      const { data: session } = await getSession();
      const userId = session?.session?.user?.id;
      if (!userId) return;
      const saved = await getChatMessages(id);
      if (saved.length > 0) {
        setMessages(saved.map((m: any) => ({ text: m.content, fromMe: m.sender_id === userId, time: new Date(m.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }), type: 'text' as const })));
      }
      sub = subscribeToMessages(id, (msg: any) => {
        setMessages(p => [...p, { text: msg.content, fromMe: msg.sender_id === userId, time: new Date(msg.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }), type: 'text' as const }]);
      });
    })();
    return () => { sub?.unsubscribe?.(); };
  }, [id]);

  const now = () => new Date().toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});

  const autoReply = () => {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const replies = AUTO_REPLIES[id]||AUTO_REPLIES['default'];
      const reply = replies[replyIdx.current % replies.length];
      replyIdx.current++;
      setMessages(p=>[...p, { text:reply, fromMe:false, time:now(), type:'text' }]);
    }, 1200+Math.random()*1500);
  };

  const send = async () => {
    if (mediaPreview) {
      setMessages(p=>[...p, { text:input.trim()||'', fromMe:true, time:now(), type:mediaPreview.type, media:mediaPreview.url }]);
      setMediaPreview(null); setInput(''); setShowAttach(false);
      autoReply(); return;
    }
    if (!input.trim()) return;
    const text = input.trim();
    setMessages(p=>[...p, { text, fromMe:true, time:now(), type:'text' }]);
    setInput('');
    // Persist to Supabase
    getSession().then(({ data: session }) => {
      const userId = session?.session?.user?.id;
      if (userId) persistMessage({ room_id: id, sender_id: userId, sender_name: 'User', content: text });
    });
    autoReply();
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>, type:'image'|'video') => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setMediaPreview({ url:ev.target?.result as string, type }); setShowAttach(false); };
    reader.readAsDataURL(file);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio:true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size>0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach(t=>t.stop());
        const blob = new Blob(chunksRef.current, { type:'audio/webm' });
        const reader = new FileReader();
        reader.onload = (ev) => {
          setMessages(p=>[...p, { text:`Voice message (${recordTime}s)`, fromMe:true, time:now(), type:'audio', media:ev.target?.result as string }]);
          autoReply();
        };
        reader.readAsDataURL(blob);
        setRecordTime(0);
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
      let sec = 0;
      timerRef.current = setInterval(() => { sec++; setRecordTime(sec); }, 1000);
    } catch { alert('Microphone access denied. Please allow mic access to send voice messages.'); }
  };

  const stopRecording = () => {
    recorderRef.current?.stop(); setRecording(false);
    clearInterval(timerRef.current);
  };

  const initials = contact.name.split(' ').map((n:string)=>n[0]).join('');
  const isWorker = !id.startsWith('p') && !id.startsWith('seller');

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', background:isDark?'#0f0f1a':'#f5f7ff' }}>
      {/* Header */}
      <div style={{ padding:'12px 16px', display:'flex', alignItems:'center', gap:12, borderBottom:`1px solid ${t.cardBorder}`, background:isDark?'rgba(26,26,46,0.95)':'rgba(255,255,255,0.95)', backdropFilter:'blur(20px)' }}>
        <button onClick={()=>router.back()} style={{ background:'none', border:'none', color:t.text, cursor:'pointer' }}><IcoBack size={20} /></button>
        <div onClick={()=>isWorker&&router.push(`/worker/${id}`)} style={{ width:40, height:40, borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, background:`linear-gradient(135deg,${t.accent}33,#8b5cf633)`, color:t.accent, cursor:isWorker?'pointer':'default', position:'relative', flexShrink:0 }}>
          {initials}
          <div style={{ position:'absolute', bottom:-1, right:-1, width:10, height:10, borderRadius:'50%', background:contact.status==='online'?'#22c55e':'#f59e0b', border:`2px solid ${isDark?'#1a1a2e':'#fff'}` }}></div>
        </div>
        <div style={{ flex:1 }}><p style={{ fontWeight:600, fontSize:14, margin:0 }}>{contact.name}</p><p style={{ fontSize:11, color:contact.status==='online'?'#22c55e':'#f59e0b', margin:0 }}>{contact.status==='online'?'● Online':'○ Away'}</p></div>
        {isWorker && <button onClick={()=>router.push(`/worker/${id}`)} style={{ padding:'6px 12px', borderRadius:10, background:t.accentLight, color:t.accent, border:'none', fontSize:11, fontWeight:600, cursor:'pointer' }}>View Profile</button>}
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{ flex:1, overflowY:'auto', padding:16, display:'flex', flexDirection:'column', gap:8 }}>
        {messages.map((msg,i)=>(
          <div key={i} style={{ display:'flex', justifyContent:msg.fromMe?'flex-end':'flex-start' }}>
            <div style={{ maxWidth:'75%', padding:msg.type==='image'||msg.type==='video'?4:'10px 14px', borderRadius:msg.fromMe?'16px 16px 4px 16px':'16px 16px 16px 4px', background:msg.fromMe?`linear-gradient(135deg,${t.accent},#8b5cf6)`:(isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.05)'), color:msg.fromMe?'white':t.text, fontSize:13, lineHeight:1.5, overflow:'hidden' }}>
              {msg.type==='image' && msg.media && <img src={msg.media} alt="Shared" style={{ width:'100%', maxHeight:220, objectFit:'cover', borderRadius:12, display:'block' }} />}
              {msg.type==='video' && msg.media && <video src={msg.media} controls playsInline style={{ width:'100%', maxHeight:220, borderRadius:12, display:'block' }} />}
              {msg.type==='audio' && msg.media && (
                <div style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 8px' }}>
                  <IcoMic size={16} color={msg.fromMe?'white':t.accent} />
                  <audio src={msg.media} controls style={{ height:32, maxWidth:200 }} />
                </div>
              )}
              {msg.text && <p style={{ margin:msg.type!=='text'?'6px 10px 2px':'0', fontSize:13 }}>{msg.text}</p>}
              <p style={{ margin:'4px 10px 2px', fontSize:10, opacity:0.6, textAlign:'right' }}>{msg.time}</p>
            </div>
          </div>
        ))}
        {typing && <div style={{ display:'flex' }}><div style={{ padding:'10px 18px', borderRadius:'16px 16px 16px 4px', background:isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.05)', fontSize:13 }}><span className="animate-pulse">●●●</span></div></div>}
      </div>

      {/* Media Preview */}
      {mediaPreview && (
        <div style={{ padding:'8px 16px', borderTop:`1px solid ${t.cardBorder}`, background:isDark?'rgba(26,26,46,0.95)':'rgba(255,255,255,0.95)' }}>
          <div style={{ position:'relative', display:'inline-block' }}>
            {mediaPreview.type==='image' ? <img src={mediaPreview.url} alt="Preview" style={{ height:80, borderRadius:12, objectFit:'cover' }} /> : <video src={mediaPreview.url} style={{ height:80, borderRadius:12 }} />}
            <button onClick={()=>setMediaPreview(null)} style={{ position:'absolute', top:-6, right:-6, width:22, height:22, borderRadius:'50%', background:'#ef4444', color:'white', border:'none', fontSize:12, cursor:'pointer', fontWeight:700 }}>✕</button>
          </div>
        </div>
      )}

      {/* Attachment menu */}
      {showAttach && (
        <div style={{ padding:'8px 16px', borderTop:`1px solid ${t.cardBorder}`, background:isDark?'rgba(26,26,46,0.98)':'rgba(255,255,255,0.98)', display:'flex', gap:12 }}>
          <button onClick={()=>cameraRef.current?.click()} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'8px 16px', borderRadius:12, background:'rgba(34,197,94,0.1)', border:'none', cursor:'pointer', color:'#22c55e' }}><IcoCamera size={22} color="#22c55e" /><span style={{ fontSize:10, fontWeight:600 }}>Camera</span></button>
          <button onClick={()=>photoRef.current?.click()} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'8px 16px', borderRadius:12, background:'rgba(59,130,246,0.1)', border:'none', cursor:'pointer', color:'#3b82f6' }}><IcoImage size={22} color="#3b82f6" /><span style={{ fontSize:10, fontWeight:600 }}>Photo</span></button>
          <button onClick={()=>videoRef.current?.click()} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'8px 16px', borderRadius:12, background:'rgba(239,68,68,0.1)', border:'none', cursor:'pointer', color:'#ef4444' }}><IcoVideo size={22} color="#ef4444" /><span style={{ fontSize:10, fontWeight:600 }}>Video</span></button>
        </div>
      )}

      {/* Input Bar */}
      <div style={{ padding:'10px 16px 24px', borderTop:showAttach||mediaPreview?'none':`1px solid ${t.cardBorder}`, background:isDark?'rgba(26,26,46,0.95)':'rgba(255,255,255,0.95)' }}>
        <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={e=>handleFile(e,'image')} />
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e=>handleFile(e,'image')} />
        <input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={e=>handleFile(e,'video')} />
        {recording ? (
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div className="animate-pulse" style={{ width:12, height:12, borderRadius:'50%', background:'#ef4444' }} />
            <span style={{ flex:1, fontWeight:600, fontSize:14, color:'#ef4444' }}>Recording... {recordTime}s</span>
            <button onClick={stopRecording} style={{ width:42, height:42, borderRadius:14, background:'#ef4444', color:'white', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><IcoStop size={18} color="white" /></button>
          </div>
        ) : (
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <button onClick={()=>setShowAttach(!showAttach)} style={{ width:38, height:38, borderRadius:12, background:showAttach?t.accentLight:(isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)'), border:`1px solid ${showAttach?t.accent+'55':t.cardBorder}`, color:showAttach?t.accent:t.textMuted, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>+</button>
            <button onClick={startRecording} style={{ width:38, height:38, borderRadius:12, background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><IcoMic size={18} color={t.textMuted} /></button>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Type a message..." style={{ flex:1, padding:'10px 16px', borderRadius:20, border:`1px solid ${t.cardBorder}`, background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', color:t.text, fontSize:13, outline:'none' }} />
            <button onClick={send} style={{ width:42, height:42, borderRadius:14, background:`linear-gradient(135deg,${t.accent},#8b5cf6)`, color:'white', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><IcoSend size={18} color="white" /></button>
          </div>
        )}
      </div>
    </div>
  );
}
