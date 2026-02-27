"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { DEMO_WORKERS, getFriends, toggleFriend, getBlockedUsers, toggleBlock } from '@/lib/demoData';

export default function FriendsPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const [tab, setTab] = useState<'friends'|'discover'|'blocked'>('friends');
  const [friendIds, setFriendIds] = useState<string[]>([]);
  const [blockedIds, setBlockedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => { setFriendIds(getFriends()); setBlockedIds(getBlockedUsers()); }, []);

  const friends = DEMO_WORKERS.filter(w => friendIds.includes(w.id) && !blockedIds.includes(w.id));
  const suggestions = DEMO_WORKERS.filter(w => !friendIds.includes(w.id) && !blockedIds.includes(w.id));
  const blocked = DEMO_WORKERS.filter(w => blockedIds.includes(w.id));

  const handleToggleFriend = (id: string) => {
    toggleFriend(id);
    setFriendIds(getFriends());
  };

  const handleToggleBlock = (id: string) => {
    toggleBlock(id);
    setBlockedIds(getBlockedUsers());
  };

  const filteredFriends = friends.filter(f => !search || f.full_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4 animate-fade-in max-w-lg mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-lg">{'<-'}</button>
        <h1 className="text-xl font-bold">Friends</h1>
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background:t.accentLight, color:t.accent }}>{friends.length} friends</span>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search friends..." className="w-full p-3 rounded-xl text-sm outline-none" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, color:t.text }} />

      <div className="flex gap-2">
        {(['friends','discover','blocked'] as const).map(tb => (
          <button key={tb} onClick={() => setTab(tb)} className="flex-1 py-2 rounded-xl text-xs font-medium capitalize" style={{ background:tab===tb?t.accentLight:'transparent', color:tab===tb?t.accent:t.textSecondary }}>
            {tb} {tb==='friends'?`(${friends.length})`:tb==='blocked'?`(${blocked.length})`:''}
          </button>
        ))}
      </div>

      {tab === 'friends' && (
        <div className="space-y-2">
          {filteredFriends.length === 0 ? (
            <div className="text-center py-8 glass-card rounded-2xl" style={{ background:t.card, borderColor:t.cardBorder }}>
              <p className="text-sm" style={{ color:t.textSecondary }}>{search ? 'No friends match your search' : 'No friends yet'}</p>
              <button onClick={() => setTab('discover')} className="text-xs mt-3 px-4 py-2 rounded-xl font-medium" style={{ background:t.accentLight, color:t.accent }}>Find People</button>
            </div>
          ) : filteredFriends.map(f => (
            <div key={f.id} className="glass-card rounded-xl p-3 flex items-center gap-3" style={{ background:t.card, borderColor:t.cardBorder }}>
              <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold" style={{ background:`linear-gradient(135deg,${t.accent}33,#8b5cf633)`, color:t.accent }}>
                {f.full_name.split(' ').map(n=>n[0]).join('')}
              </div>
              <div className="flex-1" onClick={() => router.push(`/worker/${f.id}`)} style={{ cursor:'pointer' }}>
                <p className="font-semibold text-sm">{f.full_name}</p>
                <p className="text-[10px]" style={{ color:t.textMuted }}>{f.city} - {f.skills.join(', ')}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="w-2 h-2 rounded-full" style={{ background:f.availability==='available'?'#22c55e':f.availability==='busy'?'#ef4444':'#f59e0b' }}></span>
                  <span className="text-[10px]" style={{ color:t.textMuted }}>{f.availability}</span>
                </div>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => router.push(`/chat/${f.id}`)} className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium" style={{ background:t.accentLight, color:t.accent }}>Chat</button>
                <button onClick={() => handleToggleFriend(f.id)} className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium" style={{ background:'rgba(239,68,68,0.1)', color:'#ef4444' }}>Remove</button>
                <button onClick={() => handleToggleBlock(f.id)} className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium" style={{ background:'rgba(107,114,128,0.1)', color:'#6b7280' }}>Block</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'discover' && (
        <div className="space-y-2">
          <p className="text-xs" style={{ color:t.textMuted }}>People you may want to connect with</p>
          {suggestions.length === 0 ? (
            <p className="text-center py-8 text-sm" style={{ color:t.textSecondary }}>You're connected with everyone!</p>
          ) : suggestions.map(s => (
            <div key={s.id} className="glass-card rounded-xl p-3 flex items-center gap-3" style={{ background:t.card, borderColor:t.cardBorder }}>
              <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold" style={{ background:`linear-gradient(135deg,${t.accent}33,#8b5cf633)`, color:t.accent }}>{s.full_name.split(' ').map(n=>n[0]).join('')}</div>
              <div className="flex-1"><p className="font-semibold text-sm">{s.full_name}</p><p className="text-[10px]" style={{ color:t.textMuted }}>{s.skills.join(', ')} - Rating: {s.rating}</p></div>
              <button onClick={() => handleToggleFriend(s.id)} className="px-3 py-1.5 rounded-lg text-[10px] font-semibold text-white" style={{ background:`linear-gradient(135deg,${t.accent},#8b5cf6)` }}>Add Friend</button>
            </div>
          ))}
        </div>
      )}

      {tab === 'blocked' && (
        <div className="space-y-2">
          {blocked.length === 0 ? (
            <div className="text-center py-8 glass-card rounded-2xl" style={{ background:t.card, borderColor:t.cardBorder }}>
              <p className="text-sm" style={{ color:t.textSecondary }}>No blocked users</p>
            </div>
          ) : blocked.map(b => (
            <div key={b.id} className="glass-card rounded-xl p-3 flex items-center gap-3" style={{ background:t.card, borderColor:t.cardBorder }}>
              <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold" style={{ background:'rgba(107,114,128,0.2)', color:'#6b7280' }}>{b.full_name.split(' ').map(n=>n[0]).join('')}</div>
              <div className="flex-1"><p className="font-semibold text-sm" style={{ color:t.textMuted }}>{b.full_name}</p></div>
              <button onClick={() => handleToggleBlock(b.id)} className="px-3 py-1.5 rounded-lg text-[10px] font-medium" style={{ background:'rgba(34,197,94,0.1)', color:'#22c55e' }}>Unblock</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
