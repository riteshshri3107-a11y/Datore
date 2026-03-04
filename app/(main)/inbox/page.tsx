"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { useAuthStore } from '@/store/useAuthStore';
import { getTheme } from '@/lib/theme';
import { getChatRooms } from '@/lib/supabase';
import { CHAT_CONTACTS } from '@/lib/demoData';

const DEMO_RECENT = [
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
  const { user } = useAuthStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const [chatRooms, setChatRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingDemo, setUsingDemo] = useState(false);

  useEffect(() => {
    fetchChatRooms();
  }, [user]);

  const fetchChatRooms = async () => {
    if (!user) {
      setUsingDemo(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const rooms = await getChatRooms(user.id);
      if (rooms && rooms.length > 0) {
        const mapped = rooms.map((room: any) => {
          const isP1 = room.participant_1 === user.id;
          const otherProfile = isP1 ? room.p2 : room.p1;
          const otherId = isP1 ? room.participant_2 : room.participant_1;
          return {
            id: room.id,
            otherId,
            name: otherProfile?.name || 'Unknown',
            avatar_url: otherProfile?.avatar_url || null,
            lastMsg: room.last_message || 'No messages yet',
            time: room.last_message_at ? formatTime(room.last_message_at) : '',
            unread: 0,
            status: 'online',
          };
        });
        setChatRooms(mapped);
        setUsingDemo(false);
      } else {
        setUsingDemo(true);
      }
    } catch {
      setUsingDemo(true);
    }
    setLoading(false);
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const renderDemoChats = () => (
    <div className="space-y-1">
      {DEMO_RECENT.map(chat => {
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
  );

  const renderRealChats = () => (
    <div className="space-y-1">
      {chatRooms.map(chat => {
        const initials = (chat.name || 'U').split(' ').map((n:string)=>n[0]).join('');
        return (
          <div key={chat.id} onClick={()=>router.push(`/chat/${chat.otherId}`)} className="glass-card rounded-xl p-3.5 flex items-center gap-3 cursor-pointer" style={{ background:chat.unread>0?(isDark?'rgba(99,102,241,0.08)':'rgba(99,102,241,0.05)'):t.card, borderColor:t.cardBorder }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold" style={{ background:`linear-gradient(135deg,${t.accent}33,#8b5cf633)`, color:t.accent, position:'relative', flexShrink:0 }}>
              {chat.avatar_url ? <img src={chat.avatar_url} alt="" className="w-11 h-11 rounded-xl object-cover" /> : initials}
              <div style={{ position:'absolute', bottom:-1, right:-1, width:8, height:8, borderRadius:'50%', background:'#22c55e', border:`2px solid ${isDark?'#1a1a2e':'#fff'}` }}></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm">{chat.name}</p>
                <span className="text-[10px]" style={{ color:t.textMuted }}>{chat.time}</span>
              </div>
              <p className="text-xs truncate" style={{ color:t.textSecondary }}>{chat.lastMsg}</p>
            </div>
            {chat.unread>0 && <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold" style={{ background:t.accent, flexShrink:0 }}>{chat.unread}</div>}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-4 animate-fade-in ">
      <h1 className="text-xl font-bold">💬 Messages</h1>
      {loading ? (
        <div className="text-center py-12 glass-card rounded-2xl" style={{ background:t.card, borderColor:t.cardBorder }}>
          <p className="text-sm" style={{ color:t.textSecondary }}>Loading conversations...</p>
        </div>
      ) : usingDemo ? (
        renderDemoChats()
      ) : chatRooms.length > 0 ? (
        renderRealChats()
      ) : (
        <div className="text-center py-12 glass-card rounded-2xl" style={{ background:t.card, borderColor:t.cardBorder }}>
          <p className="text-3xl mb-3">💬</p>
          <p style={{ color:t.textSecondary }}>No messages yet</p>
          <p className="text-xs mt-2" style={{ color:t.textMuted }}>Start a conversation from a worker profile or job listing</p>
        </div>
      )}
    </div>
  );
}
