"use client";
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
export default function ChatPage() {
  const router = useRouter();
  const { isDark } = useThemeStore();
  const t = getTheme(isDark);
  const [msg, setMsg] = useState('');
  const [msgs, setMsgs] = useState([{ id: '1', sender: 'other', text: 'Hi! I saw your job posting. I\'m interested!' }]);
  const send = () => { if (!msg.trim()) return; setMsgs(m => [...m, { id: Date.now().toString(), sender: 'me', text: msg }]); setMsg(''); };
  return (
    <div style={{ background: t.bg, color: t.text, minHeight: '100vh' }} className="flex flex-col">
      <div className="glass-nav p-3 flex items-center gap-3" style={{ background: t.nav }}>
        <button onClick={() => router.back()}>←</button>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: t.accentLight, color: t.accent }}>M</div>
        <div><p className="text-sm font-semibold">Maria Santos</p><p className="text-xs" style={{ color: '#22c55e' }}>Online</p></div>
      </div>
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {msgs.map(m => (
          <div key={m.id} className={`flex ${m.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[75%] px-4 py-2.5 rounded-2xl text-sm" style={{ background: m.sender === 'me' ? t.accent : t.surface, color: m.sender === 'me' ? 'white' : t.text, backdropFilter: 'blur(8px)' }}>{m.text}</div>
          </div>
        ))}
      </div>
      <div className="p-3 flex gap-2" style={{ background: t.nav, backdropFilter: 'blur(20px)' }}>
        <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Type a message..."
          className="glass-input flex-1 px-4 py-3 rounded-2xl text-sm" style={{ background: t.input, color: t.text }} />
        <button onClick={send} className="btn-accent px-5 py-3 rounded-2xl text-sm">Send</button>
      </div>
    </div>
  );
}
