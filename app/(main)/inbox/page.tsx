"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { CHAT_CONTACTS } from '@/lib/demoData';
import { getChatRooms, getSession } from '@/lib/supabase';

const FALLBACK_RECENT = [
  { id:'1', lastMsg:"I'm available this weekend. $22/hr.", time:'2:31 PM', unread:1 },
  { id:'2', lastMsg:"I can come take a look tomorrow.", time:'1:15 PM', unread:0 },
  { id:'5', lastMsg:"I'll take great care of your fur baby!", time:'11:20 AM', unread:2 },
  { id:'p1', lastMsg:"Thanks for applying to my babysitting job!", time:'10:45 AM', unread:1 },
  { id:'7', lastMsg:"I can do a full 3-course meal.", time:'Yesterday', unread:0 },
  { id:'3', lastMsg:"For a deep clean, I charge $150.", time:'Yesterday', unread:0 },
];

export default function InboxPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const [recent, setRecent] = useState(FALLBACK_RECENT);

  useEffect(() => {
    (async () => {
      const { data: session } = await getSession();
      const userId = session?.session?.user?.id;
      if (!userId) return;
      const rooms = await getChatRooms(userId);
      if (rooms.length > 0) {
        setRecent(rooms.map((r: any) => ({
          id: r.id,
          lastMsg: r.last_message || 'Start a conversation',
          time: r.last_message_at ? new Date(r.last_message_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '',
          unread: r.unread_count || 0,
          otherUserId: r.user1_id === userId ? r.user2_id : r.user1_id,
        })));
      }
    })();
  }, []);

  return (
    <div className="space-y-4 animate-fade-in ">
      <h1 className="text-xl font-bold">💬 Messages</h1>
      <div className="space-y-1">
        {recent.map(chat => {
          const c = CHAT_CONTACTS[chat.id] || { name:'User', status:'offline', skills:'' };
          const initials = c.name.split(' ').map((n:string)=>n[0]).join('');
          return (
            <div key={chat.id} onClick={()=>router.push(`/chat/${chat.id}`)} className="glass-card rounded-xl p-3.5 flex items-center gap-3 cursor-pointer" style={{ background:chat.unread>0?(isDark?'rgba(99,102,241,0.08)':'rgba(99,102,241,0.05)'):t.card, borderColor:t.cardBorder }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold" style={{ background:`linear-gradient(135deg,${t.accent}33,#8b5cf633)`, color:t.accent, position:'relative', flexShrink:0 }}>
                {initials}
                <div style={{ position:'absolute', bottom:-1, right:-1, width:8, height:8, borderRadius:'50%', background:c.status==='online'?'#22c55e':'#f59e0b', border:`2px solid ${isDark?'#1a1a2e':'#fff'}` }}></div>
              </div>
              <div className="flex-1 min-w-0"><div className="flex items-center justify-between"><p className="font-semibold text-sm">{c.name}</p><span className="text-[10px]" style={{ color:t.textMuted }}>{chat.time}</span></div><p className="text-xs truncate" style={{ color:t.textSecondary }}>{chat.lastMsg}</p></div>
              {chat.unread>0 && <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold" style={{ background:t.accent, flexShrink:0 }}>{chat.unread}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}