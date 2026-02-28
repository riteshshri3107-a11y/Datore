"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { IcoBack, IcoMic, IcoSearch, IcoSend } from '@/components/Icons';

// BR-83: Voice Commerce & Hands-Free Job Posting

interface VoiceCommand {
  id: string;
  transcript: string;
  intent: string;
  slots: Record<string, string>;
  response: string;
  time: string;
  status: 'processing' | 'confirmed' | 'executed';
}

const EXAMPLE_COMMANDS = [
  { text: "Hey Deto, I need a plumber today at 3pm, budget $80", intent: 'post_job', slots: { skill: 'Plumber', time: 'Today 3:00 PM', budget: '$80' } },
  { text: "Find me a house cleaner near Brampton this weekend", intent: 'search_worker', slots: { skill: 'House Cleaner', location: 'Brampton', time: 'This Weekend' } },
  { text: "Pay Sarah for today's cleaning job", intent: 'make_payment', slots: { recipient: 'Sarah', service: 'Cleaning', amount: 'Pending' } },
  { text: "What's the average rate for dog walking in Toronto?", intent: 'price_check', slots: { skill: 'Dog Walking', location: 'Toronto' } },
  { text: "Book the electrician from last week again", intent: 'rebook', slots: { worker: 'Previous Electrician', service: 'Electrical' } },
];

const INTENT_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  post_job: { label: 'Post a Job', icon: '📋', color: '#6366f1' },
  search_worker: { label: 'Find Worker', icon: '🔍', color: '#22c55e' },
  make_payment: { label: 'Make Payment', icon: '💳', color: '#f59e0b' },
  price_check: { label: 'Price Check', icon: '📊', color: '#8b5cf6' },
  rebook: { label: 'Re-Book', icon: '🔄', color: '#ec4899' },
  unknown: { label: 'General Query', icon: '💬', color: '#6b7280' },
};

function parseVoiceCommand(text: string): { intent: string; slots: Record<string, string>; response: string } {
  const lower = text.toLowerCase();
  if (/\b(need|hire|find|looking for|get me)\b.*\b(plumber|cleaner|electrician|tutor|walker|babysitter|painter|mover|handyman)\b/.test(lower)) {
    const skill = lower.match(/\b(plumber|cleaner|electrician|tutor|walker|babysitter|painter|mover|handyman)\b/)?.[0] || 'Worker';
    const time = lower.match(/\b(today|tomorrow|this weekend|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i)?.[0] || 'ASAP';
    const budget = text.match(/\$\d+/)?.[0] || 'Market Rate';
    const timeMatch = text.match(/at (\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
    return {
      intent: 'post_job',
      slots: { skill: skill.charAt(0).toUpperCase() + skill.slice(1), time: `${time}${timeMatch ? ` ${timeMatch[1]}` : ''}`, budget },
      response: `Got it! I'll post a job for a ${skill} ${time}${timeMatch ? ` at ${timeMatch[1]}` : ''}, budget ${budget}. Should I go ahead?`,
    };
  }
  if (/\b(pay|send money|transfer|tip)\b/.test(lower)) {
    const name = text.match(/(?:pay|send to|tip)\s+(\w+)/i)?.[1] || 'Worker';
    return {
      intent: 'make_payment',
      slots: { recipient: name, amount: text.match(/\$\d+/)?.[0] || 'Job Total' },
      response: `Ready to pay ${name} ${text.match(/\$\d+/)?.[0] || 'the job total'}. Please confirm to proceed.`,
    };
  }
  if (/\b(average rate|how much|price|cost)\b/.test(lower)) {
    const skill = lower.match(/\b(plumbing|cleaning|electrician|tutoring|dog walking|babysitting|painting|moving)\b/)?.[0] || 'service';
    return {
      intent: 'price_check',
      slots: { skill: skill.charAt(0).toUpperCase() + skill.slice(1) },
      response: `The average rate for ${skill} in your area is $25-$45/hour. Rates vary by experience and urgency.`,
    };
  }
  if (/\b(book again|rebook|same worker|last time)\b/.test(lower)) {
    return {
      intent: 'rebook',
      slots: { worker: 'Previous Worker' },
      response: `I'll check if your previous worker is available. Shall I send a booking request?`,
    };
  }
  return {
    intent: 'search_worker',
    slots: { query: text },
    response: `I'll search for that. Let me find the best matches for you!`,
  };
}

export default function VoiceCommercePage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [commands, setCommands] = useState<VoiceCommand[]>([]);
  const [showExamples, setShowExamples] = useState(true);
  const [textInput, setTextInput] = useState('');
  const pulseRef = useRef<NodeJS.Timeout | null>(null);

  const processCommand = (text: string) => {
    const { intent, slots, response } = parseVoiceCommand(text);
    const cmd: VoiceCommand = {
      id: `vc-${Date.now()}`,
      transcript: text,
      intent,
      slots,
      response,
      time: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }),
      status: 'processing',
    };
    setCommands(prev => [cmd, ...prev]);
    setShowExamples(false);

    setTimeout(() => {
      setCommands(prev => prev.map(c => c.id === cmd.id ? { ...c, status: 'confirmed' } : c));
    }, 1500);
  };

  const simulateVoice = () => {
    setIsListening(true);
    setTranscript('');
    const example = EXAMPLE_COMMANDS[Math.floor(Math.random() * EXAMPLE_COMMANDS.length)];
    const words = example.text.split(' ');
    let i = 0;
    const interval = setInterval(() => {
      if (i < words.length) {
        setTranscript(words.slice(0, i + 1).join(' '));
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsListening(false);
          processCommand(example.text);
          setTranscript('');
        }, 500);
      }
    }, 200);
    pulseRef.current = interval as unknown as NodeJS.Timeout;
  };

  const executeCommand = (id: string) => {
    setCommands(prev => prev.map(c => c.id === id ? { ...c, status: 'executed' } : c));
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={()=>router.back()} style={{ background:'none', border:'none', color:t.text, cursor:'pointer' }}><IcoBack size={20} /></button>
        <h1 className="text-xl font-bold flex-1">Voice Commerce</h1>
        <span className="text-[10px] px-2 py-1 rounded-full" style={{ background:'#22c55e22', color:'#22c55e' }}>Hands-Free</span>
      </div>

      {/* Voice Button */}
      <div className="flex flex-col items-center py-6">
        <button
          onClick={simulateVoice}
          disabled={isListening}
          className="w-24 h-24 rounded-full flex items-center justify-center transition-all"
          style={{
            background: isListening ? `radial-gradient(circle, #ef4444, ${t.accent})` : `linear-gradient(135deg, ${t.accent}, #8b5cf6)`,
            boxShadow: isListening ? `0 0 40px ${t.accent}66` : `0 4px 20px ${t.accent}44`,
            transform: isListening ? 'scale(1.1)' : 'scale(1)',
          }}
        >
          <IcoMic size={36} color="white" />
        </button>
        <p className="text-sm mt-3 font-medium" style={{ color: isListening ? '#ef4444' : t.textSecondary }}>
          {isListening ? '🔴 Listening...' : 'Tap to speak a command'}
        </p>
        {transcript && (
          <div className="mt-3 px-4 py-2 rounded-xl text-sm max-w-xs text-center" style={{ background:t.card, border:`1px solid ${t.cardBorder}`, color:t.text }}>
            "{transcript}"
          </div>
        )}
      </div>

      {/* Text fallback */}
      <div className="flex gap-2">
        <input
          value={textInput}
          onChange={e=>setTextInput(e.target.value)}
          onKeyDown={e=>{ if(e.key==='Enter' && textInput.trim()){ processCommand(textInput.trim()); setTextInput(''); }}}
          placeholder="Or type a command..."
          className="flex-1 px-4 py-3 rounded-xl text-sm outline-none"
          style={{ background:t.card, border:`1px solid ${t.cardBorder}`, color:t.text }}
        />
        <button onClick={()=>{ if(textInput.trim()){ processCommand(textInput.trim()); setTextInput(''); }}} className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:`linear-gradient(135deg,${t.accent},#8b5cf6)` }}>
          <IcoSend size={16} color="white" />
        </button>
      </div>

      {/* Example Commands */}
      {showExamples && (
        <div className="space-y-2">
          <p className="text-xs font-bold" style={{ color:t.textMuted }}>Try saying:</p>
          {EXAMPLE_COMMANDS.map((ex, i) => (
            <button key={i} onClick={()=>processCommand(ex.text)} className="w-full text-left px-4 py-3 rounded-xl text-xs flex items-center gap-3" style={{ background:t.card, border:`1px solid ${t.cardBorder}` }}>
              <span className="text-lg">{INTENT_LABELS[ex.intent]?.icon}</span>
              <div className="flex-1">
                <p style={{ color:t.text }}>"{ex.text}"</p>
                <p className="text-[10px] mt-0.5" style={{ color:INTENT_LABELS[ex.intent]?.color }}>{INTENT_LABELS[ex.intent]?.label}</p>
              </div>
              <IcoMic size={14} color={t.textMuted} />
            </button>
          ))}
        </div>
      )}

      {/* Command Results */}
      {commands.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-bold" style={{ color:t.textMuted }}>Recent Commands</p>
          {commands.map(cmd => {
            const info = INTENT_LABELS[cmd.intent] || INTENT_LABELS.unknown;
            return (
              <div key={cmd.id} className="rounded-xl p-4 space-y-3" style={{ background:t.card, border:`1px solid ${t.cardBorder}` }}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{info.icon}</span>
                  <span className="text-xs font-bold" style={{ color:info.color }}>{info.label}</span>
                  <span className="ml-auto text-[10px]" style={{ color:t.textMuted }}>{cmd.time}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{
                    background: cmd.status==='executed' ? '#22c55e22' : cmd.status==='confirmed' ? '#f59e0b22' : `${t.accent}22`,
                    color: cmd.status==='executed' ? '#22c55e' : cmd.status==='confirmed' ? '#f59e0b' : t.accent,
                  }}>{cmd.status === 'executed' ? '✓ Done' : cmd.status === 'confirmed' ? 'Confirm?' : '...'}</span>
                </div>
                <p className="text-xs italic" style={{ color:t.textMuted }}>"{cmd.transcript}"</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(cmd.slots).map(([k, v]) => (
                    <span key={k} className="text-[10px] px-2 py-1 rounded-lg" style={{ background:t.surface, color:t.text }}>
                      <span style={{ color:t.textMuted }}>{k}: </span><span className="font-semibold">{v}</span>
                    </span>
                  ))}
                </div>
                <p className="text-xs p-2 rounded-lg" style={{ background:t.surface, color:t.text }}>🤖 {cmd.response}</p>
                {cmd.status === 'confirmed' && (
                  <div className="flex gap-2">
                    <button onClick={()=>executeCommand(cmd.id)} className="flex-1 py-2 rounded-xl text-xs font-bold text-white" style={{ background:`linear-gradient(135deg,${t.accent},#8b5cf6)` }}>✓ Confirm & Execute</button>
                    <button onClick={()=>setCommands(prev=>prev.filter(c=>c.id!==cmd.id))} className="px-4 py-2 rounded-xl text-xs" style={{ background:t.surface, color:t.textMuted }}>Cancel</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Smart Speaker Integration Info */}
      <div className="rounded-xl p-4" style={{ background:`${t.accent}08`, border:`1px solid ${t.accent}22` }}>
        <p className="text-xs font-bold mb-2" style={{ color:t.accent }}>🔊 Smart Speaker Integration</p>
        <div className="flex gap-3">
          {['Amazon Alexa','Google Home','Apple HomePod'].map(s => (
            <span key={s} className="text-[10px] px-2 py-1 rounded-lg" style={{ background:t.card, color:t.textSecondary }}>{s}</span>
          ))}
        </div>
        <p className="text-[10px] mt-2" style={{ color:t.textMuted }}>Say "Hey Deto" on any connected smart speaker to post jobs, search workers, and make payments hands-free.</p>
      </div>
    </div>
  );
}
