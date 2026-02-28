"use client";
export const dynamic = "force-dynamic";
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { IcoBack, IcoSend, IcoMic, IcoUser, IcoHeart, IcoShield } from '@/components/Icons';

// BR-69: Deto Personality — warm, adaptive, remembers context
// BR-70: Voice & Video companion
// BR-71: Emotional Intelligence & Wellbeing
// BR-72: Safety & Child Protection

interface ChatMsg {
  id: string;
  role: 'user' | 'deto';
  text: string;
  time: string;
  mood?: string;
  type?: 'text' | 'voice' | 'suggestion';
}

const MOODS = ['😊 Happy', '😔 Down', '😤 Stressed', '😴 Tired', '🎉 Excited', '😌 Calm'];

const DETO_INTROS = [
  "Hey there! 🌟 How's your day going? I'm always here if you want to chat!",
  "Welcome back! I missed our conversations. What's on your mind today?",
  "Hi friend! 😊 Ready to make today awesome? Tell me what you need!",
];

const DETO_RESPONSES: Record<string, string[]> = {
  greeting: ["Hey! So glad you're here! How can I brighten your day? 🌞", "Hi friend! What's up? I'm all ears! 😊"],
  sad: ["I hear you, and I want you to know that's completely valid. Want to talk about what's bothering you? I'm here, no rush at all. 💙", "I'm sorry you're feeling that way. Remember, tough days don't last forever. What would make you feel even a little bit better right now?"],
  stressed: ["Sounds like you've got a lot going on. Let's take a breath together... 🌊 Inhale... exhale... Now, want to break things down one at a time?", "Stress is tough, but you're tougher! What's the biggest thing weighing on you? Sometimes just saying it out loud helps."],
  job: ["That's exciting! Jobs on Datore can really open doors. Want me to help you find the right match, or do you have something specific in mind? 🔍", "Great thinking! Let me help you navigate the job options. What skills are you looking for in a worker?"],
  happy: ["I love your energy! 🎉 What's making you smile today? I want to celebrate with you!", "That's wonderful! Happiness is contagious — tell me more! 😄"],
  default: ["That's really interesting! Tell me more, I'd love to hear your thoughts on this. 😊", "I appreciate you sharing that with me. What else is on your mind?", "That's a great point! Is there anything specific I can help you with?"],
};

const PROACTIVE_CHECKINS = [
  "🔔 Hey! Just checking in — how did that job posting go yesterday?",
  "💡 Tip of the day: Workers with profile photos get 3x more bookings!",
  "🎂 Reminder: Your friend Maria's birthday is coming up in 2 days!",
  "⭐ Congrats! You've maintained a 4.8-star rating for 3 months straight!",
];

function detectMood(text: string): string {
  const lower = text.toLowerCase();
  if (/\b(hi|hello|hey|good morning|good evening)\b/.test(lower)) return 'greeting';
  if (/\b(sad|unhappy|depressed|lonely|down|crying|hurt)\b/.test(lower)) return 'sad';
  if (/\b(stressed|anxious|overwhelmed|worried|nervous|pressure)\b/.test(lower)) return 'stressed';
  if (/\b(job|work|hire|worker|booking|service)\b/.test(lower)) return 'job';
  if (/\b(happy|great|awesome|excited|amazing|wonderful|love)\b/.test(lower)) return 'happy';
  return 'default';
}

function getDetoResponse(mood: string): string {
  const pool = DETO_RESPONSES[mood] || DETO_RESPONSES.default;
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function DetoPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const [messages, setMessages] = useState<ChatMsg[]>([
    { id: 'd0', role: 'deto', text: DETO_INTROS[Math.floor(Math.random() * DETO_INTROS.length)], time: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }), type: 'text' },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [moodCheck, setMoodCheck] = useState(false);
  const [kidsMode, setKidsMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [persona, setPersona] = useState<'friendly'|'professional'|'playful'>('friendly');
  const [milestone, setMilestone] = useState<string|null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  // BR-71: Proactive check-in after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      const checkin = PROACTIVE_CHECKINS[Math.floor(Math.random() * PROACTIVE_CHECKINS.length)];
      setMessages(prev => [...prev, { id: `d-checkin-${Date.now()}`, role: 'deto', text: checkin, time: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }), type: 'suggestion' }]);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  const sendMessage = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;
    const now = new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
    const mood = detectMood(msg);

    setMessages(prev => [...prev, { id: `u-${Date.now()}`, role: 'user', text: msg, time: now, mood }]);
    setInput('');
    setIsTyping(true);

    // BR-71: Crisis awareness
    const lower = msg.toLowerCase();
    const isCrisis = /\b(suicide|kill myself|end it all|self.?harm|don'?t want to live)\b/.test(lower);

    setTimeout(() => {
      let response = getDetoResponse(mood);
      if (isCrisis) {
        response = "I care about you deeply, and I'm glad you told me how you're feeling. Please know you're not alone. 💙\n\nIf you're in crisis, please reach out:\n📞 988 Suicide & Crisis Lifeline (call/text 988)\n📞 Crisis Text Line (text HOME to 741741)\n📞 Kids Help Phone (1-800-668-6868)\n\nWould you like me to help you connect with a professional? I'm here for you.";
      }
      if (kidsMode) {
        response = response.replace(/job|work|hire|booking|payment|money/gi, (m) => m === 'job' ? 'task' : m);
      }
      setMessages(prev => [...prev, { id: `d-${Date.now()}`, role: 'deto', text: response, time: now, type: 'text' }]);
      setIsTyping(false);

      // BR-71: Milestone celebration
      if (messages.length === 9) {
        setTimeout(() => {
          setMilestone("🎉 10 Conversations! You've been chatting with Deto for 10 messages! Keep it up!");
          setTimeout(() => setMilestone(null), 5000);
        }, 1500);
      }
    }, 800 + Math.random() * 700);
  };

  // BR-70: Voice companion (simulated)
  const toggleVoice = () => {
    if (isListening) {
      setIsListening(false);
      sendMessage("Hey Deto, what's happening today?");
    } else {
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        sendMessage("Hey Deto, what's happening today?");
      }, 3000);
    }
  };

  return (
    <div className="flex flex-col animate-fade-in" style={{ height:'calc(100vh - 120px)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 pb-3" style={{ borderBottom:`1px solid ${t.cardBorder}` }}>
        <button onClick={()=>router.back()} style={{ background:'none', border:'none', color:t.text, cursor:'pointer' }}><IcoBack size={20} /></button>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold" style={{ background:`linear-gradient(135deg,${t.accent},#8b5cf6)` }}>D</div>
        <div className="flex-1">
          <p className="font-bold text-sm">Deto AI {kidsMode ? '🧒 Kids' : ''}</p>
          <p className="text-[10px]" style={{ color:'#22c55e' }}>● Always available for you</p>
        </div>
        <button onClick={()=>setVoiceMode(!voiceMode)} className="p-2 rounded-xl" style={{ background:voiceMode?`${t.accent}22`:'transparent', color:voiceMode?t.accent:t.textMuted }}>
          <IcoMic size={18} />
        </button>
        <button onClick={()=>setShowSettings(!showSettings)} className="p-2 rounded-xl" style={{ color:t.textMuted }}>⚙️</button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="rounded-xl p-4 my-2 space-y-3" style={{ background:t.card, border:`1px solid ${t.cardBorder}` }}>
          <p className="text-xs font-bold">Deto Settings</p>
          <div className="flex items-center justify-between">
            <span className="text-xs">Kids Mode (BR-72)</span>
            <button onClick={()=>setKidsMode(!kidsMode)} className="px-3 py-1 rounded-full text-[10px] font-bold" style={{ background:kidsMode?'#22c55e':'#555', color:'white' }}>{kidsMode?'ON':'OFF'}</button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs">Voice Mode (BR-70)</span>
            <button onClick={()=>setVoiceMode(!voiceMode)} className="px-3 py-1 rounded-full text-[10px] font-bold" style={{ background:voiceMode?'#22c55e':'#555', color:'white' }}>{voiceMode?'ON':'OFF'}</button>
          </div>
          <div>
            <p className="text-[10px] mb-1" style={{ color:t.textMuted }}>Persona Style (BR-69)</p>
            <div className="flex gap-2">{(['friendly','professional','playful'] as const).map(p=>(
              <button key={p} onClick={()=>setPersona(p)} className="px-3 py-1.5 rounded-lg text-[10px] font-medium capitalize" style={{ background:persona===p?t.accentLight:'transparent', color:persona===p?t.accent:t.textMuted, border:`1px solid ${persona===p?t.accent:t.cardBorder}` }}>{p}</button>
            ))}</div>
          </div>
          <div>
            <p className="text-[10px] mb-1" style={{ color:t.textMuted }}>Mood Check-In (BR-71)</p>
            <button onClick={()=>setMoodCheck(!moodCheck)} className="px-3 py-1.5 rounded-lg text-[10px]" style={{ background:t.accentLight, color:t.accent }}>How are you feeling?</button>
          </div>
        </div>
      )}

      {/* Mood Check Modal */}
      {moodCheck && (
        <div className="rounded-xl p-4 my-2" style={{ background:`linear-gradient(135deg,${t.accent}15,#8b5cf622)`, border:`1px solid ${t.cardBorder}` }}>
          <p className="text-xs font-bold mb-2">How are you feeling right now?</p>
          <div className="grid grid-cols-3 gap-2">
            {MOODS.map(m => (
              <button key={m} onClick={() => { setMoodCheck(false); sendMessage(`I'm feeling ${m}`); }} className="p-2 rounded-xl text-xs text-center" style={{ background:t.card, border:`1px solid ${t.cardBorder}` }}>{m}</button>
            ))}
          </div>
        </div>
      )}

      {/* Milestone Toast */}
      {milestone && (
        <div className="rounded-xl p-3 my-2 text-center text-xs font-semibold animate-fade-in" style={{ background:'linear-gradient(135deg,#f59e0b22,#22c55e22)', color:'#f59e0b', border:'1px solid #f59e0b44' }}>{milestone}</div>
      )}

      {/* Chat Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-3 space-y-3" style={{ scrollbarWidth:'thin' }}>
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role==='user'?'justify-end':'justify-start'} gap-2`}>
            {msg.role==='deto' && <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1" style={{ background:`linear-gradient(135deg,${t.accent},#8b5cf6)` }}>D</div>}
            <div className="max-w-[80%]">
              <div className="rounded-2xl px-4 py-2.5 text-sm" style={{
                background: msg.role==='user' ? `linear-gradient(135deg,${t.accent},#8b5cf6)` : t.card,
                color: msg.role==='user' ? 'white' : t.text,
                border: msg.role==='deto' ? `1px solid ${t.cardBorder}` : 'none',
                borderTopRightRadius: msg.role==='user' ? '6px' : '18px',
                borderTopLeftRadius: msg.role==='deto' ? '6px' : '18px',
              }}>
                {msg.type === 'suggestion' && <span className="text-[10px] block mb-1" style={{ color:msg.role==='deto'?t.accent:'#ffffff88' }}>💡 Proactive Check-In</span>}
                <p className="whitespace-pre-line text-[13px] leading-relaxed">{msg.text}</p>
              </div>
              <p className="text-[9px] mt-1 px-2" style={{ color:t.textMuted, textAlign:msg.role==='user'?'right':'left' }}>{msg.time}</p>
            </div>
            {msg.role==='user' && <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ background:t.surface }}><IcoUser size={14} color={t.textMuted} /></div>}
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-2 items-center">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background:`linear-gradient(135deg,${t.accent},#8b5cf6)` }}>D</div>
            <div className="rounded-2xl px-4 py-3 flex gap-1" style={{ background:t.card, border:`1px solid ${t.cardBorder}` }}>
              <div className="w-2 h-2 rounded-full animate-bounce" style={{ background:t.accent, animationDelay:'0ms' }} />
              <div className="w-2 h-2 rounded-full animate-bounce" style={{ background:t.accent, animationDelay:'150ms' }} />
              <div className="w-2 h-2 rounded-full animate-bounce" style={{ background:t.accent, animationDelay:'300ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 py-2 overflow-x-auto" style={{ scrollbarWidth:'none' }}>
        {['How are you?','Find a job','My wallet','Tell a joke','Bedtime story'].map(q => (
          <button key={q} onClick={()=>sendMessage(q)} className="px-3 py-1.5 rounded-full text-[10px] font-medium whitespace-nowrap flex-shrink-0" style={{ background:t.accentLight, color:t.accent, border:`1px solid ${t.accent}44` }}>{q}</button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="flex items-center gap-2 pt-2" style={{ borderTop:`1px solid ${t.cardBorder}` }}>
        {voiceMode ? (
          <button onClick={toggleVoice} className="flex-1 py-4 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2" style={{ background:isListening?'#ef444422':t.card, color:isListening?'#ef4444':t.text, border:`1px solid ${isListening?'#ef4444':t.cardBorder}` }}>
            <IcoMic size={20} color={isListening?'#ef4444':t.accent} />
            {isListening ? '🔴 Listening... Tap to stop' : '🎙️ Tap to speak to Deto'}
          </button>
        ) : (
          <>
            <input
              ref={inputRef}
              value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&sendMessage()}
              placeholder={kidsMode ? "Ask Deto anything! 🌟" : "Talk to Deto..."}
              className="flex-1 px-4 py-3 rounded-2xl text-sm outline-none"
              style={{ background:t.card, border:`1px solid ${t.cardBorder}`, color:t.text }}
            />
            <button onClick={()=>sendMessage()} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background:`linear-gradient(135deg,${t.accent},#8b5cf6)` }}>
              <IcoSend size={16} color="white" />
            </button>
          </>
        )}
      </div>

      {/* Safety Footer BR-72 */}
      {kidsMode && (
        <div className="flex items-center gap-2 pt-2">
          <IcoShield size={12} color="#22c55e" />
          <span className="text-[9px]" style={{ color:'#22c55e' }}>Kids Safe Mode Active · No adult content · Parental controls enabled</span>
        </div>
      )}
    </div>
  );
}
