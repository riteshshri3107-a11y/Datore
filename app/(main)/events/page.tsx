"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { useAuthStore } from '@/store/useAuthStore';
import { getTheme } from '@/lib/theme';
import { getEvents, createEvent, joinEvent, leaveEvent } from '@/lib/supabase';
import { DEMO_EVENTS } from '@/lib/demoData';

export default function EventsPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const { user } = useAuthStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const [tab, setTab] = useState<'upcoming'|'my'>('upcoming');
  const [events, setEvents] = useState<any[]>([]);
  const [rsvpd, setRsvpd] = useState<string[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showShare, setShowShare] = useState<string|null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Create event form state
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('Social');
  const [newIsOnline, setNewIsOnline] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await getEvents();
      if (data && data.length > 0) {
        const mapped = data.map((e: any) => ({
          id: e.id,
          title: e.title,
          date: e.date ? new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
          time: e.time || '',
          location: e.location || 'TBD',
          organizer: e.profiles?.name || 'Unknown',
          attendees: e.attendee_count || 0,
          category: e.category || 'Social',
          desc: e.description || '',
          is_online: e.is_online || false,
          organizer_id: e.organizer_id,
        }));
        setEvents(mapped);
      } else {
        // Fallback to demo data
        setEvents(DEMO_EVENTS);
      }
    } catch {
      setEvents(DEMO_EVENTS);
    }
    setLoading(false);
  };

  // Load RSVPs from localStorage as a quick cache; Supabase is source of truth
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try { setRsvpd(JSON.parse(localStorage.getItem('datore-rsvp') || '[]')); } catch {}
    }
  }, []);

  const handleRSVP = async (id: string) => {
    if (!user) { alert('Please sign in to RSVP.'); return; }
    const isRsvpd = rsvpd.includes(id);
    // Optimistic update
    const updated = isRsvpd ? rsvpd.filter(x => x !== id) : [...rsvpd, id];
    setRsvpd(updated);
    if (typeof window !== 'undefined') { try { localStorage.setItem('datore-rsvp', JSON.stringify(updated)); } catch {} }

    try {
      if (isRsvpd) {
        await leaveEvent(id, user.id);
      } else {
        await joinEvent(id, user.id);
      }
    } catch (err) {
      // Revert on error
      setRsvpd(isRsvpd ? [...rsvpd] : rsvpd.filter(x => x !== id));
    }
  };

  const handleCreateEvent = async () => {
    if (!user) { alert('Please sign in to create an event.'); return; }
    if (!newTitle.trim()) { alert('Title is required.'); return; }
    setCreating(true);
    try {
      const { data, error } = await createEvent({
        organizer_id: user.id,
        title: newTitle.trim(),
        description: newDesc.trim(),
        date: newDate || new Date().toISOString().split('T')[0],
        time: newTime || '12:00',
        location: newLocation.trim() || 'TBD',
        category: newCategory,
        is_online: newIsOnline,
        status: 'upcoming',
        attendee_count: 0,
      });
      if (error) throw error;
      setShowCreate(false);
      setNewTitle(''); setNewDate(''); setNewTime(''); setNewLocation(''); setNewDesc(''); setNewCategory('Social'); setNewIsOnline(false);
      await fetchEvents();
    } catch (err: any) {
      alert('Failed to create event: ' + (err?.message || 'Unknown error'));
    }
    setCreating(false);
  };

  const shareEvent = (platform: string, event: any) => {
    const url = encodeURIComponent('https://datore.vercel.app/events');
    const msg = encodeURIComponent(`Join me at ${event.title} on ${event.date}! via Datore`);
    let link = '';
    if (platform === 'whatsapp') link = `https://wa.me/?text=${msg}%20${url}`;
    else if (platform === 'facebook') link = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${msg}`;
    else if (platform === 'copy') { navigator.clipboard?.writeText(`${event.title} - ${event.date} at ${event.location}`); }
    if (link) window.open(link, '_blank');
    setShowShare(null);
  };

  const catColors: Record<string,string> = { Social:'#8b5cf6', Workshop:'#3b82f6', Meetup:'#22c55e', Service:'#f97316' };
  const myEvents = events.filter(e => rsvpd.includes(e.id));

  return (
    <div className="space-y-4 animate-fade-in ">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><button onClick={() => router.back()} className="text-lg">{'<-'}</button><h1 className="text-xl font-bold">Events</h1></div>
        <button onClick={() => setShowCreate(true)} className="px-4 py-2 rounded-xl text-xs font-semibold text-white" style={{ background:`linear-gradient(135deg,${t.accent},#8b5cf6)` }}>+ Create</button>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setTab('upcoming')} className="flex-1 py-2 rounded-xl text-xs font-medium" style={{ background:tab==='upcoming'?t.accentLight:'transparent', color:tab==='upcoming'?t.accent:t.textSecondary }}>Upcoming ({events.length})</button>
        <button onClick={() => setTab('my')} className="flex-1 py-2 rounded-xl text-xs font-medium" style={{ background:tab==='my'?t.accentLight:'transparent', color:tab==='my'?t.accent:t.textSecondary }}>My Events ({myEvents.length})</button>
      </div>

      {loading ? (
        <div className="text-center py-12 glass-card rounded-2xl" style={{ background:t.card, borderColor:t.cardBorder }}>
          <p className="text-sm" style={{ color:t.textSecondary }}>Loading events...</p>
        </div>
      ) : (tab === 'upcoming' ? events : myEvents).map(event => (
        <div key={event.id} className="glass-card rounded-2xl overflow-hidden" style={{ background:t.card, borderColor:t.cardBorder }}>
          <div className="h-24 flex items-center justify-center" style={{ background:`linear-gradient(135deg,${catColors[event.category]||t.accent}22,#8b5cf622)` }}>
            <div className="text-center">
              <p className="text-sm font-bold" style={{ color:catColors[event.category]||t.accent }}>{event.category}</p>
              <p className="text-xs" style={{ color:t.textMuted }}>{event.date} at {event.time}</p>
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-bold">{event.title}</h3>
            <p className="text-xs mt-1" style={{ color:t.textSecondary }}>{event.desc}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', color:t.textMuted }}>Location: {event.location}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', color:t.textMuted }}>By: {event.organizer}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background:t.accentLight, color:t.accent }}>{event.attendees + (rsvpd.includes(event.id)?1:0)} attending</span>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => handleRSVP(event.id)} className="flex-1 py-2 rounded-xl text-xs font-semibold" style={{ background:rsvpd.includes(event.id)?'rgba(34,197,94,0.15)':t.accentLight, color:rsvpd.includes(event.id)?'#22c55e':t.accent, border:`1px solid ${rsvpd.includes(event.id)?'#22c55e33':t.accent+'33'}` }}>
                {rsvpd.includes(event.id) ? 'Going!' : 'RSVP'}
              </button>
              <button onClick={() => setShowShare(showShare===event.id?null:event.id)} className="px-4 py-2 rounded-xl text-xs font-medium" style={{ background:t.surface, color:t.textSecondary, border:`1px solid ${t.cardBorder}` }}>Share</button>
            </div>
            {showShare === event.id && (
              <div className="mt-2 p-3 rounded-xl flex gap-2 flex-wrap" style={{ background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.02)', border:`1px solid ${t.cardBorder}` }}>
                {[{id:'whatsapp',label:'WhatsApp',c:'#25D366'},{id:'facebook',label:'Facebook',c:'#1877F2'},{id:'copy',label:'Copy',c:'#6b7280'}].map(s => (
                  <button key={s.id} onClick={() => shareEvent(s.id, event)} className="px-3 py-1 rounded-lg text-[10px] font-medium text-white" style={{ background:s.c }}>{s.label}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}

      {!loading && tab === 'my' && myEvents.length === 0 && (
        <div className="text-center py-12 glass-card rounded-2xl" style={{ background:t.card, borderColor:t.cardBorder }}>
          <p className="text-sm" style={{ color:t.textSecondary }}>No RSVPs yet. Browse upcoming events!</p>
          <button onClick={() => setTab('upcoming')} className="text-xs mt-3 px-4 py-2 rounded-xl" style={{ background:t.accentLight, color:t.accent }}>Browse Events</button>
        </div>
      )}

      {/* Create Event Modal */}
      {showCreate && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }} onClick={() => setShowCreate(false)}>
          <div onClick={e => e.stopPropagation()} className="w-full max-w-md rounded-2xl p-5 space-y-4 overflow-y-auto" style={{ background:isDark?'#1a1a2e':'#fff', border:`1px solid ${t.cardBorder}`, maxHeight:'90vh' }}>
            <h3 className="font-bold text-lg">Create Event</h3>
            <div>
              <label className="text-xs" style={{ color:t.textMuted }}>Event Title *</label>
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Event Title" className="w-full mt-1 p-3 rounded-xl text-sm outline-none" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, color:t.text }} />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs" style={{ color:t.textMuted }}>Date</label>
                <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="w-full mt-1 p-3 rounded-xl text-sm outline-none" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, color:t.text }} />
              </div>
              <div className="flex-1">
                <label className="text-xs" style={{ color:t.textMuted }}>Time</label>
                <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} className="w-full mt-1 p-3 rounded-xl text-sm outline-none" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, color:t.text }} />
              </div>
            </div>
            <div>
              <label className="text-xs" style={{ color:t.textMuted }}>Location</label>
              <input value={newLocation} onChange={e => setNewLocation(e.target.value)} placeholder="Location" className="w-full mt-1 p-3 rounded-xl text-sm outline-none" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, color:t.text }} />
            </div>
            <div>
              <label className="text-xs" style={{ color:t.textMuted }}>Category</label>
              <select value={newCategory} onChange={e => setNewCategory(e.target.value)} className="w-full mt-1 p-3 rounded-xl text-sm outline-none" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, color:t.text }}>
                {['Social','Workshop','Meetup','Service'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs" style={{ color:t.textMuted }}>Description</label>
              <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description" rows={3} className="w-full mt-1 p-3 rounded-xl text-sm outline-none resize-none" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, color:t.text }} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={newIsOnline} onChange={e => setNewIsOnline(e.target.checked)} className="rounded" />
              <span className="text-xs" style={{ color:t.textSecondary }}>Online Event</span>
            </label>
            <button onClick={handleCreateEvent} disabled={creating} className="w-full py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-50" style={{ background:`linear-gradient(135deg,${t.accent},#8b5cf6)` }}>
              {creating ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
