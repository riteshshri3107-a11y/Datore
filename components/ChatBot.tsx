"use client";
import { useState } from 'react';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{role:string;content:string}[]>([{ role: 'bot', content: 'Hi! I\'m Datore AI. How can I help you find services or post a job?' }]);
  const [input, setInput] = useState('');
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);

  const send = () => {
    if (!input.trim()) return;
    setMessages(m => [...m, { role: 'user', content: input }]);
    setTimeout(() => {
      setMessages(m => [...m, { role: 'bot', content: 'I can help you with that! Try browsing the JobPlace or Marketplace for what you need. 😊' }]);
    }, 800);
    setInput('');
  };

  if (!open) return (
    <button onClick={() => setOpen(true)} className="fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg md:bottom-6"
      style={{ background: `linear-gradient(135deg, ${t.accent}, #8b5cf6)`, boxShadow: `0 4px 20px ${t.accentGlow}` }}>🤖</button>
  );

  return (
    <div className="fixed bottom-20 right-4 z-50 w-80 rounded-2xl overflow-hidden md:bottom-6" style={{ background: t.surface, backdropFilter: `blur(${t.blur})`, border: `1px solid ${t.cardBorder}`, boxShadow: t.shadow }}>
      <div className="p-3 flex justify-between items-center" style={{ background: `linear-gradient(135deg, ${t.accent}, #8b5cf6)` }}>
        <span className="font-semibold text-white text-sm">🤖 Datore AI</span>
        <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white">✕</button>
      </div>
      <div className="h-64 overflow-y-auto p-3 space-y-2">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[80%] px-3 py-2 rounded-xl text-sm" style={{ background: m.role === 'user' ? t.accent : t.surface, color: m.role === 'user' ? 'white' : t.text }}>{m.content}</div>
          </div>
        ))}
      </div>
      <div className="p-2 flex gap-2" style={{ borderTop: `1px solid ${t.cardBorder}` }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Type a message..." className="glass-input flex-1 px-3 py-2 rounded-xl text-sm" style={{ background: t.input, color: t.text }} />
        <button onClick={send} className="px-3 py-2 rounded-xl text-sm font-medium text-white" style={{ background: t.accent }}>Send</button>
      </div>
    </div>
  );
}
