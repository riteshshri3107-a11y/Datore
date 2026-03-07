"use client";
export const dynamic = "force-dynamic";
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { IcoBack, IcoSend, IcoMic, IcoUser, IcoHeart, IcoShield } from '@/components/Icons';

// BR-69/70/71/72: Original Deto AI features
// BR-104: Voice Command Actions (create/edit/delete user items)
// BR-105: Scheduling & Reminders
// BR-106: Auto-Post Generation

interface ChatMsg { id:string; role:'user'|'deto'; text:string; time:string; mood?:string; type?:'text'|'voice'|'suggestion'|'action'|'schedule'|'autopost'; actionData?:ActionResult; scheduleData?:ScheduleItem; postData?:AutoPost; }
interface ActionResult { intent:string; entity:string; status:'pending'|'confirmed'|'executed'|'cancelled'; details:Record<string,string>; }
interface ScheduleItem { type:'alarm'|'reminder'|'meeting'|'appointment'; title:string; datetime:string; repeat?:string; status:'pending'|'confirmed'|'active'|'done'; }
interface AutoPost { audience:'public'|'professional'|'friends'|'buddy_group'; content:string; style:'casual'|'formal'|'celebratory'|'professional'; status:'draft'|'confirmed'|'posted'; }

const MOODS = ['😊 Happy','😔 Down','😤 Stressed','😴 Tired','🎉 Excited','😌 Calm'];

const DETO_INTROS = [
  "Hey there! 🌟 I can now create jobs, schedule alarms, and even write posts for you. What can I help with?",
  "Welcome back! 😊 Try saying: 'Create a babysitter job' or 'Set an alarm for 8 AM'. I'm ready!",
  "Hi friend! I've learned new skills -- voice commands, scheduling, auto-posts! What's on your mind?",
];

const RESPONSES: Record<string,string[]> = {
  greeting:["Hey! So glad you're here! How can I help? 🌞","Hi friend! What's up? I'm all ears! 😊"],
  sad:["I hear you, that's completely valid. Want to talk about it? I'm here. 💙","Tough days don't last forever. What would help right now?"],
  stressed:["Let's take a breath... 🌊 Inhale... exhale... Want to break things down?","Stress is tough, but you're tougher! What's the biggest weight?"],
  job:["Let me help with that! Want me to create a job posting for you? Just tell me the details! 🔍","I can create, edit, or find jobs for you. What do you need?"],
  happy:["Love your energy! 🎉 What's making you smile?","That's wonderful! Tell me more! 😄"],
  schedule:["I can set alarms, reminders, and meetings! Just tell me what and when. ⏰","Sure! What time and what should I remind you about?"],
  post:["I can create posts for your friends, professional network, or buddy groups! What's the occasion? 📝","Let me draft something for you! Who's the audience and what's the topic?"],
  default:["That's interesting! Tell me more. 😊","What else is on your mind?","Great point! How can I help with that?"],
};

const CHECKINS = [
  "🔔 Hey! How did that job posting go yesterday?",
  "💡 Tip: Workers with photos get 3x more bookings!",
  "🎂 Reminder: Your friend Maria's birthday is in 2 days!",
  "⏰ You have a meeting scheduled for tomorrow at 10 AM.",
];

/* BR-104: ACTION INTENT DETECTION ENGINE */
const ACTION_PATTERNS:{pattern:RegExp;intent:string;entity:string;slots:string[]}[] = [
  {pattern:/\b(create|post|make|add)\b.*\b(job|gig|task|work)\b/i, intent:'create_job', entity:'job', slots:['type','time','budget','location']},
  {pattern:/\b(edit|update|change|modify)\b.*\b(job|gig|task|posting)\b/i, intent:'edit_job', entity:'job', slots:['field','value']},
  {pattern:/\b(delete|remove|cancel)\b.*\b(job|gig|task|posting)\b/i, intent:'delete_job', entity:'job', slots:['target']},
  {pattern:/\b(create|post|make|add)\b.*\b(product|item|listing|sell)\b/i, intent:'create_product', entity:'product', slots:['name','price','category']},
  {pattern:/\b(delete|remove)\b.*\b(product|item|listing)\b/i, intent:'delete_product', entity:'product', slots:['target']},
  {pattern:/\b(create|make|start)\b.*\b(group|buddy|community)\b/i, intent:'create_group', entity:'group', slots:['name','category']},
  {pattern:/\b(delete|remove|disband)\b.*\b(group|buddy|community)\b/i, intent:'delete_group', entity:'group', slots:['target']},
  {pattern:/\b(delete|remove)\b.*\b(post|message)\b/i, intent:'delete_post', entity:'post', slots:['target']},
  {pattern:/\b(edit|update)\b.*\b(profile|bio|about)\b/i, intent:'edit_profile', entity:'profile', slots:['field','value']},
];

/* BR-105: SCHEDULE INTENT DETECTION */
const SCHEDULE_PATTERNS:{pattern:RegExp;type:ScheduleItem['type']}[] = [
  {pattern:/\b(set|create|add)\b.*\b(alarm|wake)\b/i, type:'alarm'},
  {pattern:/\b(remind|reminder)\b/i, type:'reminder'},
  {pattern:/\b(schedule|book|set up)\b.*\b(meeting|call|sync)\b/i, type:'meeting'},
  {pattern:/\b(schedule|book|set)\b.*\b(appointment|doctor|dentist|visit)\b/i, type:'appointment'},
  {pattern:/\b(alarm|wake me)\b/i, type:'alarm'},
];

/* BR-106: AUTO-POST INTENT DETECTION */
const POST_PATTERNS:{pattern:RegExp;audience:AutoPost['audience'];style:AutoPost['style']}[] = [
  {pattern:/\b(birthday|bday)\b.*\b(post|wish|message)\b/i, audience:'friends', style:'celebratory'},
  {pattern:/\b(post|share)\b.*\b(professional|linkedin|work|career)\b/i, audience:'professional', style:'professional'},
  {pattern:/\b(post|share)\b.*\b(friend|buddy)\b/i, audience:'friends', style:'casual'},
  {pattern:/\b(post|share)\b.*\b(group|buddy group)\b/i, audience:'buddy_group', style:'casual'},
  {pattern:/\b(post|share)\b.*\b(public|everyone)\b/i, audience:'public', style:'casual'},
  {pattern:/\bcreate\b.*\b(post|message|update)\b/i, audience:'public', style:'casual'},
];

function extractTime(text:string):string {
  const t1 = text.match(/(\d{1,2}):(\d{2})\s*(am|pm)/i);
  if(t1) return `${t1[1]}:${t1[2]} ${t1[3].toUpperCase()}`;
  const t2 = text.match(/(\d{1,2})\s*(am|pm)/i);
  if(t2) return `${t2[1]}:00 ${t2[2].toUpperCase()}`;
  return '9:00 AM';
}

function extractDate(text:string):string {
  if(/tomorrow/i.test(text)) { const d=new Date(); d.setDate(d.getDate()+1); return d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'}); }
  if(/today/i.test(text)) return new Date().toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
  if(/next (monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i.test(text)) return text.match(/next (\w+)/i)?.[1]||'';
  return new Date().toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
}

function extractJobType(text:string):string {
  const types = ['babysitter','plumber','cleaner','electrician','tutor','walker','painter','mover','handyman','driver','cook','nanny'];
  for(const t of types) if(text.toLowerCase().includes(t)) return t.charAt(0).toUpperCase()+t.slice(1);
  return 'General Worker';
}

function extractBudget(text:string):string {
  const m = text.match(/\$(\d+)/); return m ? `$${m[1]}` : 'Market Rate';
}

function detectMood(text:string):string {
  const l = text.toLowerCase();
  if(/\b(hi|hello|hey|good morning|good evening)\b/.test(l)) return 'greeting';
  if(/\b(sad|unhappy|depressed|lonely|down|crying|hurt)\b/.test(l)) return 'sad';
  if(/\b(stressed|anxious|overwhelmed|worried)\b/.test(l)) return 'stressed';
  if(/\b(job|work|hire|worker|booking|service)\b/.test(l)) return 'job';
  if(/\b(happy|great|awesome|excited|amazing)\b/.test(l)) return 'happy';
  if(/\b(alarm|remind|schedule|meeting|appointment)\b/.test(l)) return 'schedule';
  if(/\b(post|share|birthday|create.*post)\b/.test(l)) return 'post';
  return 'default';
}

export default function DetoPage() {
  const router = useRouter();
  const {isDark,glassLevel,accentColor} = useThemeStore();
  const t = getTheme(isDark,glassLevel,accentColor);
  const [messages,setMessages] = useState<ChatMsg[]>([
    {id:'d0',role:'deto',text:DETO_INTROS[Math.floor(Math.random()*DETO_INTROS.length)],time:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}),type:'text'},
  ]);
  const [input,setInput] = useState('');
  const [isTyping,setIsTyping] = useState(false);
  const [voiceMode,setVoiceMode] = useState(false);
  const [isListening,setIsListening] = useState(false);
  const [moodCheck,setMoodCheck] = useState(false);
  const [kidsMode,setKidsMode] = useState(false);
  const [showSettings,setShowSettings] = useState(false);
  const [persona,setPersona] = useState<'friendly'|'professional'|'playful'>('friendly');
  const [milestone,setMilestone] = useState<string|null>(null);
  const [pendingAction,setPendingAction] = useState<ActionResult|null>(null);
  const [pendingSchedule,setPendingSchedule] = useState<ScheduleItem|null>(null);
  const [pendingPost,setPendingPost] = useState<AutoPost|null>(null);
  const [schedules,setSchedules] = useState<ScheduleItem[]>([]);
  const [showSchedules,setShowSchedules] = useState(false);
  const [tab,setTab] = useState<'chat'|'actions'|'schedules'|'posts'>('chat');
  const [actionLog,setActionLog] = useState<ActionResult[]>([]);
  const [autoPostLog,setAutoPostLog] = useState<AutoPost[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{ scrollRef.current?.scrollTo({top:scrollRef.current.scrollHeight,behavior:'smooth'}); },[messages]);
  useEffect(()=>{ const tm=setTimeout(()=>{ const c=CHECKINS[Math.floor(Math.random()*CHECKINS.length)]; addMsg('deto',c,'suggestion'); },10000); return()=>clearTimeout(tm); },[]);

  const now = () => new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
  const addMsg = (role:'user'|'deto', text:string, type?:string, extra?:Partial<ChatMsg>) => {
    setMessages(p=>[...p,{id:`${role}-${Date.now()}`,role,text,time:now(),type:type as any,...extra}]);
  };

  const sendMessage = (text?:string) => {
    const msg = (text||input).trim();
    if(!msg) return;
    addMsg('user',msg);
    setInput('');
    setIsTyping(true);

    setTimeout(()=>{
      setIsTyping(false);

      // BR-104: Check for action intents
      for(const ap of ACTION_PATTERNS) {
        if(ap.pattern.test(msg)) {
          const action:ActionResult = {
            intent:ap.intent, entity:ap.entity, status:'pending',
            details: ap.intent==='create_job' ? {type:extractJobType(msg),time:extractTime(msg)+' '+extractDate(msg),budget:extractBudget(msg),location:'Toronto, ON'} :
              ap.intent.includes('delete') ? {target:ap.entity,confirmation:'Awaiting your confirmation'} :
              {action:ap.intent,status:'Ready to execute'}
          };
          setPendingAction(action);
          const desc = ap.intent==='create_job' ? `Got it! I'll create a ${action.details.type} job for ${action.details.time} at ${action.details.budget}.\n\n📋 Details:\n• Type: ${action.details.type}\n• Time: ${action.details.time}\n• Budget: ${action.details.budget}\n• Location: ${action.details.location}\n\nShall I confirm and post this?` :
            ap.intent.includes('delete') ? `I'll ${ap.intent.replace('_',' ')} for you. ⚠️ This action cannot be undone. Shall I proceed?` :
            `I'll ${ap.intent.replace('_',' ')} for you. Ready to execute?`;
          addMsg('deto',desc,'action',{actionData:action});
          return;
        }
      }

      // BR-105: Check for schedule intents
      for(const sp of SCHEDULE_PATTERNS) {
        if(sp.pattern.test(msg)) {
          const sched:ScheduleItem = {
            type:sp.type, title:msg.replace(/^(hey deto,?\s*|set|create|add|schedule|book)\s*/i,'').trim(),
            datetime:`${extractDate(msg)} at ${extractTime(msg)}`, repeat:undefined, status:'pending'
          };
          setPendingSchedule(sched);
          const emoji = sp.type==='alarm'?'⏰':sp.type==='reminder'?'🔔':sp.type==='meeting'?'📅':'🏥';
          addMsg('deto',`${emoji} I'll set a ${sp.type} for you:\n\n• ${sp.type.charAt(0).toUpperCase()+sp.type.slice(1)}: ${sched.title}\n• When: ${sched.datetime}\n\nShall I confirm this?`,'schedule',{scheduleData:sched});
          return;
        }
      }

      // BR-106: Check for auto-post intents
      for(const pp of POST_PATTERNS) {
        if(pp.pattern.test(msg)) {
          const isBday = /birthday|bday/i.test(msg);
          const content = isBday ? "🎂🎉 Happy Birthday to all my amazing friends celebrating today! Wishing you joy, laughter, and everything wonderful. May this year bring you all your heart desires! 💖✨ #HappyBirthday #Celebration" :
            pp.audience==='professional' ? "Excited to share an update about my professional journey! Always learning, always growing. Looking forward to connecting with like-minded professionals. 💼 #CareerGrowth #Networking" :
            "Hey everyone! Just wanted to share a quick update. Hope you're all having an amazing day! 😊 Let's catch up soon!";
          const post:AutoPost = { audience:pp.audience, content, style:pp.style, status:'draft' };
          setPendingPost(post);
          const audienceLabel = pp.audience==='public'?'Public':pp.audience==='professional'?'Professional Network':pp.audience==='friends'?'Friends':'Buddy Group';
          addMsg('deto',`📝 I've drafted a post for your ${audienceLabel}:\n\n"${content}"\n\n• Audience: ${audienceLabel}\n• Style: ${pp.style}\n\nWould you like me to post this, or should I adjust the content?`,'autopost',{postData:post});
          return;
        }
      }

      // Default mood-based response
      const mood = detectMood(msg);
      const pool = RESPONSES[mood]||RESPONSES.default;
      addMsg('deto',pool[Math.floor(Math.random()*pool.length)]);

      // Crisis detection (BR-71)
      if(/\b(suicide|kill myself|end it all|self.?harm|want to die)\b/i.test(msg)) {
        setTimeout(()=>addMsg('deto','I care about you deeply. Please reach out for support:\n\n📞 988 Suicide & Crisis Lifeline: Call/text 988\n📱 Crisis Text Line: Text HOME to 741741\n🇨🇦 Kids Help Phone: 1-800-668-6868\n\nYou are not alone. 💙'),500);
      }

      // Milestone check
      if(messages.filter(m=>m.role==='user').length===9) {
        setMilestone('🏆 10 conversations with Deto! You earned a badge!');
        setTimeout(()=>setMilestone(null),5000);
      }
    },1200);
  };

  // BR-104: Confirm/Cancel Action
  const confirmAction = () => {
    if(pendingAction) {
      const executed = {...pendingAction,status:'executed' as const};
      setActionLog(p=>[executed,...p]);
      addMsg('deto',`✅ Done! I've ${pendingAction.intent.replace('_',' ')} successfully.\n\n${pendingAction.intent==='create_job'?`Your ${pendingAction.details.type} job is now live and visible to workers in your area!`:'Action completed successfully.'}\n\nAnything else I can help with?`,'action');
      setPendingAction(null);
    }
  };
  const cancelAction = () => { if(pendingAction) { addMsg('deto','No problem! Action cancelled. What else can I help with? 😊'); setPendingAction(null); } };

  // BR-105: Confirm/Cancel Schedule
  const confirmSchedule = () => {
    if(pendingSchedule) {
      const confirmed = {...pendingSchedule,status:'active' as const};
      setSchedules(p=>[confirmed,...p]);
      const emoji = pendingSchedule.type==='alarm'?'⏰':pendingSchedule.type==='reminder'?'🔔':'📅';
      addMsg('deto',`${emoji} ✅ ${pendingSchedule.type.charAt(0).toUpperCase()+pendingSchedule.type.slice(1)} confirmed!\n\n"${pendingSchedule.title}"\nScheduled for: ${pendingSchedule.datetime}\n\nI'll notify you when it's time!`,'schedule');
      setPendingSchedule(null);
    }
  };
  const cancelSchedule = () => { if(pendingSchedule) { addMsg('deto','Okay, no schedule set. Let me know if you need anything! 😊'); setPendingSchedule(null); } };

  // BR-106: Confirm/Cancel Auto-Post
  const confirmPost = () => {
    if(pendingPost) {
      const posted = {...pendingPost,status:'posted' as const};
      setAutoPostLog(p=>[posted,...p]);
      addMsg('deto',`📤 ✅ Post published to ${pendingPost.audience==='public'?'Public':pendingPost.audience==='professional'?'Professional Network':pendingPost.audience==='friends'?'Friends':'Buddy Group'}!\n\nYour ${pendingPost.style} post is now live. Your connections will see it soon! 🎉`,'autopost');
      setPendingPost(null);
    }
  };
  const cancelPost = () => { if(pendingPost) { addMsg('deto','Post discarded. I can draft a new one anytime! 📝'); setPendingPost(null); } };

  const toggleVoice = () => {
    if(isListening) { setIsListening(false); return; }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addMsg('deto',"Sorry, your browser doesn't support speech recognition. Try Chrome or Edge.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setIsListening(true);
    const timeout = setTimeout(() => {
      try { recognition.stop(); } catch {}
      setIsListening(false);
      addMsg('deto',"Didn't hear anything. Tap the mic to try again.");
    }, 10000);
    recognition.onresult = (event: any) => {
      clearTimeout(timeout);
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      if (transcript) sendMessage(transcript);
    };
    recognition.onerror = () => {
      clearTimeout(timeout);
      setIsListening(false);
      addMsg('deto',"Couldn't catch that. Please try again or type your message.");
    };
    recognition.onend = () => { clearTimeout(timeout); setIsListening(false); };
    recognition.start();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <button onClick={()=>router.back()} style={{background:'none',border:'none',color:t.text,cursor:'pointer'}}><IcoBack size={20}/></button>
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{background:`linear-gradient(135deg,${t.accent},#8b5cf6)`}}>D</div>
        <div className="flex-1">
          <h1 className="text-sm font-bold">Deto AI</h1>
          <p className="text-[9px]" style={{color:t.textMuted}}>Voice Actions · Scheduling · Auto-Posts</p>
        </div>
        <button onClick={()=>setVoiceMode(!voiceMode)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:voiceMode?'rgba(239,68,68,0.15)':t.card}}><IcoMic size={14} color={voiceMode?'#ef4444':t.textMuted}/></button>
        <button onClick={()=>setShowSettings(!showSettings)} className="text-xs px-2 py-1 rounded-lg" style={{background:t.card}}>⚙️</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-0.5 rounded-lg mb-2" style={{background:t.card}}>
        {(['chat','actions','schedules','posts'] as const).map(tb=>(
          <button key={tb} onClick={()=>setTab(tb)} className="flex-1 py-1.5 rounded-md text-[9px] font-semibold" style={{background:tab===tb?t.accent:'transparent',color:tab===tb?'#fff':t.textMuted}}>
            {tb==='chat'?'💬 Chat':tb==='actions'?`⚡ Actions (${actionLog.length})`:tb==='schedules'?`⏰ Schedule (${schedules.length})`:`📝 Posts (${autoPostLog.length})`}
          </button>
        ))}
      </div>

      {/* Settings */}
      {showSettings&&(
        <div className="rounded-xl p-3 mb-2 space-y-2" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
          <div><p className="text-[9px] font-bold mb-1">Persona</p><div className="flex gap-1">{(['friendly','professional','playful'] as const).map(p=>(<button key={p} onClick={()=>setPersona(p)} className="px-2 py-1 rounded-lg text-[9px]" style={{background:persona===p?t.accent+'20':'transparent',color:persona===p?t.accent:t.textMuted}}>{p}</button>))}</div></div>
          <div className="flex gap-2"><button onClick={()=>setKidsMode(!kidsMode)} className="px-3 py-1 rounded-lg text-[9px]" style={{background:kidsMode?'rgba(34,197,94,0.15)':'transparent',color:kidsMode?'#22c55e':t.textMuted}}>{kidsMode?'✅':'⚪'} Kids Mode</button>
          <button onClick={()=>setMoodCheck(true)} className="px-3 py-1 rounded-lg text-[9px]" style={{background:t.accent+'15',color:t.accent}}>Mood Check-In</button></div>
        </div>
      )}

      {/* Mood Check */}
      {moodCheck&&(
        <div className="rounded-xl p-3 mb-2" style={{background:`linear-gradient(135deg,${t.accent}15,#8b5cf622)`}}>
          <p className="text-xs font-bold mb-2">How are you feeling?</p>
          <div className="grid grid-cols-3 gap-1">{MOODS.map(m=>(<button key={m} onClick={()=>{setMoodCheck(false);sendMessage(`I'm feeling ${m}`);}} className="p-2 rounded-xl text-[10px]" style={{background:t.card}}>{m}</button>))}</div>
        </div>
      )}

      {milestone&&<div className="rounded-xl p-2 mb-2 text-center text-xs font-semibold animate-fade-in" style={{background:'linear-gradient(135deg,#f59e0b22,#22c55e22)',color:'#f59e0b'}}>{milestone}</div>}

      {/* CHAT TAB */}
      {tab==='chat'&&(
        <>
          <div ref={scrollRef} className="flex-1 overflow-y-auto py-2 space-y-2" style={{scrollbarWidth:'thin'}}>
            {messages.map(msg=>(
              <div key={msg.id} className={`flex ${msg.role==='user'?'justify-end':'justify-start'} gap-2`}>
                {msg.role==='deto'&&<div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0 mt-1" style={{background:`linear-gradient(135deg,${t.accent},#8b5cf6)`}}>D</div>}
                <div className="max-w-[80%]">
                  <div className="rounded-2xl px-3 py-2 text-[12px]" style={{
                    background:msg.role==='user'?`linear-gradient(135deg,${t.accent},#8b5cf6)`:msg.type==='action'?'rgba(59,130,246,0.08)':msg.type==='schedule'?'rgba(245,158,11,0.08)':msg.type==='autopost'?'rgba(139,92,246,0.08)':t.card,
                    color:msg.role==='user'?'white':t.text,
                    border:msg.role==='deto'?`1px solid ${msg.type==='action'?'rgba(59,130,246,0.2)':msg.type==='schedule'?'rgba(245,158,11,0.2)':msg.type==='autopost'?'rgba(139,92,246,0.2)':t.cardBorder}`:'none',
                    borderTopRightRadius:msg.role==='user'?'6px':'18px', borderTopLeftRadius:msg.role==='deto'?'6px':'18px',
                  }}>
                    {msg.type==='action'&&<span className="text-[8px] font-bold block mb-1" style={{color:'#3b82f6'}}>⚡ ACTION COMMAND</span>}
                    {msg.type==='schedule'&&<span className="text-[8px] font-bold block mb-1" style={{color:'#f59e0b'}}>⏰ SCHEDULE</span>}
                    {msg.type==='autopost'&&<span className="text-[8px] font-bold block mb-1" style={{color:'#8b5cf6'}}>📝 AUTO-POST</span>}
                    {msg.type==='suggestion'&&<span className="text-[8px] block mb-1" style={{color:t.accent}}>💡 Proactive</span>}
                    <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                  </div>
                  <p className="text-[8px] mt-0.5 px-2" style={{color:t.textMuted,textAlign:msg.role==='user'?'right':'left'}}>{msg.time}</p>
                </div>
                {msg.role==='user'&&<div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{background:t.card}}><IcoUser size={12} color={t.textMuted}/></div>}
              </div>
            ))}
            {isTyping&&(<div className="flex gap-2 items-center"><div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold" style={{background:`linear-gradient(135deg,${t.accent},#8b5cf6)`}}>D</div><div className="rounded-2xl px-3 py-2 flex gap-1" style={{background:t.card}}><div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{background:t.accent,animationDelay:'0ms'}}/><div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{background:t.accent,animationDelay:'150ms'}}/><div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{background:t.accent,animationDelay:'300ms'}}/></div></div>)}
          </div>

          {/* Confirmation Buttons */}
          {pendingAction&&(
            <div className="flex gap-2 py-2"><button onClick={confirmAction} className="flex-1 py-2 rounded-lg text-xs font-bold text-white" style={{background:'#22c55e'}}>✅ Confirm Action</button><button onClick={cancelAction} className="flex-1 py-2 rounded-lg text-xs" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>Cancel</button></div>
          )}
          {pendingSchedule&&(
            <div className="flex gap-2 py-2"><button onClick={confirmSchedule} className="flex-1 py-2 rounded-lg text-xs font-bold text-white" style={{background:'#f59e0b'}}>⏰ Confirm Schedule</button><button onClick={cancelSchedule} className="flex-1 py-2 rounded-lg text-xs" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>Cancel</button></div>
          )}
          {pendingPost&&(
            <div className="flex gap-2 py-2"><button onClick={confirmPost} className="flex-1 py-2 rounded-lg text-xs font-bold text-white" style={{background:'#8b5cf6'}}>📤 Post Now</button><button onClick={cancelPost} className="flex-1 py-2 rounded-lg text-xs" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>Discard</button></div>
          )}

          {/* Quick Actions */}
          <div className="flex gap-1.5 py-1 overflow-x-auto" style={{scrollbarWidth:'none'}}>
            {['Create a job','Set an alarm','Birthday post','Find a worker','Schedule meeting','My schedule'].map(q=>(
              <button key={q} onClick={()=>sendMessage(q==='My schedule'?'':q)} className="px-2.5 py-1 rounded-full text-[9px] font-medium whitespace-nowrap flex-shrink-0" style={{background:t.accent+'15',color:t.accent,border:`1px solid ${t.accent}33`}}>{q}</button>
            ))}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 pt-1" style={{borderTop:`1px solid ${t.cardBorder}`}}>
            {voiceMode?(
              <button onClick={toggleVoice} className="flex-1 py-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2" style={{background:isListening?'#ef444422':t.card,color:isListening?'#ef4444':t.text,border:`1px solid ${isListening?'#ef4444':t.cardBorder}`}}>
                <IcoMic size={16} color={isListening?'#ef4444':t.accent}/>{isListening?'🔴 Listening...':'🎙️ Tap to speak'}
              </button>
            ):(
              <>
                <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendMessage()} placeholder={kidsMode?"Ask Deto! 🌟":"Talk to Deto..."} className="flex-1 px-3 py-2.5 rounded-2xl text-sm outline-none" style={{background:t.card,border:`1px solid ${t.cardBorder}`,color:t.text}}/>
                <button onClick={()=>sendMessage()} className="w-9 h-9 rounded-full flex items-center justify-center" style={{background:`linear-gradient(135deg,${t.accent},#8b5cf6)`}}><IcoSend size={14} color="white"/></button>
              </>
            )}
          </div>
          {kidsMode&&<div className="flex items-center gap-1 pt-1"><IcoShield size={10} color="#22c55e"/><span className="text-[8px]" style={{color:'#22c55e'}}>Kids Safe Mode · Parental controls enabled</span></div>}
        </>
      )}

      {/* ACTIONS LOG TAB */}
      {tab==='actions'&&(
        <div className="flex-1 overflow-y-auto space-y-2 py-2">
          <p className="text-[10px] font-bold" style={{color:t.textMuted}}>BR-104: Voice Command Action History</p>
          {actionLog.length===0?<p className="text-center text-xs py-8" style={{color:t.textMuted}}>No actions yet. Try: "Create a babysitter job"</p>:
          actionLog.map((a,i)=>(
            <div key={i} className="p-3 rounded-xl" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
              <div className="flex items-center gap-2 mb-1"><span className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white" style={{background:a.status==='executed'?'#22c55e':'#3b82f6'}}>{a.status}</span><span className="text-xs font-semibold">{a.intent.replace(/_/g,' ')}</span></div>
              {Object.entries(a.details).map(([k,v])=>(<p key={k} className="text-[10px]"><span style={{color:t.textMuted}}>{k}:</span> {v}</p>))}
            </div>
          ))}
        </div>
      )}

      {/* SCHEDULES TAB */}
      {tab==='schedules'&&(
        <div className="flex-1 overflow-y-auto space-y-2 py-2">
          <p className="text-[10px] font-bold" style={{color:t.textMuted}}>BR-105: Alarms, Reminders & Meetings</p>
          {schedules.length===0?<p className="text-center text-xs py-8" style={{color:t.textMuted}}>No schedules. Try: "Set an alarm for 8 AM"</p>:
          schedules.map((s,i)=>(
            <div key={i} className="p-3 rounded-xl" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm">{s.type==='alarm'?'⏰':s.type==='reminder'?'🔔':s.type==='meeting'?'📅':'🏥'}</span>
                <span className="text-xs font-semibold flex-1">{s.title}</span>
                <span className="text-[9px] px-2 py-0.5 rounded-full" style={{background:s.status==='active'?'rgba(34,197,94,0.15)':'rgba(245,158,11,0.15)',color:s.status==='active'?'#22c55e':'#f59e0b'}}>{s.status}</span>
              </div>
              <p className="text-[10px]" style={{color:t.textMuted}}>📅 {s.datetime}</p>
              <button onClick={()=>setSchedules(p=>p.filter((_,j)=>j!==i))} className="text-[9px] mt-1" style={{color:'#ef4444'}}>Delete</button>
            </div>
          ))}
        </div>
      )}

      {/* AUTO-POSTS TAB */}
      {tab==='posts'&&(
        <div className="flex-1 overflow-y-auto space-y-2 py-2">
          <p className="text-[10px] font-bold" style={{color:t.textMuted}}>BR-106: Deto Auto-Generated Posts</p>
          {autoPostLog.length===0?<p className="text-center text-xs py-8" style={{color:t.textMuted}}>No posts yet. Try: "Create a birthday post for friends"</p>:
          autoPostLog.map((p,i)=>(
            <div key={i} className="p-3 rounded-xl" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white" style={{background:p.status==='posted'?'#22c55e':'#8b5cf6'}}>{p.status}</span>
                <span className="text-[9px] px-2 py-0.5 rounded-full" style={{background:t.accent+'15',color:t.accent}}>{p.audience}</span>
                <span className="text-[9px]" style={{color:t.textMuted}}>{p.style}</span>
              </div>
              <p className="text-[10px] mt-1">{p.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
