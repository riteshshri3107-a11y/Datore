"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { useAuthStore } from '@/store/useAuthStore';
import { getMyBookings } from '@/lib/supabase';
import { IcoBack, IcoCalendar } from '@/components/Icons';

const DEMO_BOOKINGS = [
  { id:'b1', title:'House Cleaning', worker:'Anita Sharma', date:'2026-03-01', time:'10:00 AM', duration:'3 hrs', status:'confirmed', amount:120 },
  { id:'b2', title:'Plumbing Repair', worker:'Mike Chen', date:'2026-03-03', time:'2:00 PM', duration:'2 hrs', status:'pending', amount:85 },
  { id:'b3', title:'Tutoring Session', worker:'Priya K.', date:'2026-03-05', time:'4:00 PM', duration:'1.5 hrs', status:'confirmed', amount:60 },
  { id:'b4', title:'Garden Maintenance', worker:'David L.', date:'2026-03-07', time:'9:00 AM', duration:'4 hrs', status:'pending', amount:160 },
  { id:'b5', title:'Electrical Fix', worker:'James B.', date:'2026-02-28', time:'11:00 AM', duration:'2 hrs', status:'completed', amount:90 },
];

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function CalendarPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const { user } = useAuthStore();
  const [view, setView] = useState<'month'|'list'>('month');
  const [currentMonth, setCurrentMonth] = useState(2); // March
  const [currentYear] = useState(2026);
  const [selectedDate, setSelectedDate] = useState<string|null>(null);
  const [BOOKINGS, setBookings] = useState(DEMO_BOOKINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (user?.id) {
        try {
          const data = await getMyBookings(user.id);
          if (data && data.length > 0) {
            const mapped = data.map((b: any) => ({
              id: b.id,
              title: b.title || b.service_type || 'Booking',
              worker: b.worker_name || 'Worker',
              date: b.scheduled_date?.split('T')[0] || b.created_at?.split('T')[0] || '',
              time: b.scheduled_time || b.scheduled_date?.split('T')[1]?.slice(0, 5) || 'TBD',
              duration: b.duration ? `${b.duration} hrs` : 'TBD',
              status: b.status || 'pending',
              amount: b.amount || b.total_amount || 0,
            }));
            setBookings(mapped.length > 0 ? mapped : DEMO_BOOKINGS);
          }
        } catch {}
      }
      setLoading(false);
    })();
  }, [user?.id]);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const today = new Date().getDate();
  const todayMonth = new Date().getMonth();

  const dateStr = (d: number) => `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  const bookingsOn = (d: number) => BOOKINGS.filter(b => b.date === dateStr(d));
  const selectedBookings = selectedDate ? BOOKINGS.filter(b => b.date === selectedDate) : [];

  const statusColor: Record<string,string> = { confirmed:'#22c55e', pending:'#f59e0b', completed:'#6366f1', cancelled:'#ef4444' };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={()=>router.back()} style={{ background:'none', border:'none', color:t.text, cursor:'pointer' }}><IcoBack size={20} /></button>
        <h1 className="text-xl font-bold flex-1">Booking Calendar</h1>
        <div className="flex gap-1">
          {(['month','list'] as const).map(v=>(
            <button key={v} onClick={()=>setView(v)} className="px-3 py-1.5 rounded-lg text-[10px] font-medium capitalize" style={{ background:view===v?t.accentLight:'transparent', color:view===v?t.accent:t.textSecondary }}>{v}</button>
          ))}
        </div>
      </div>

      {view === 'month' ? (
        <>
          <div className="glass-card rounded-xl p-4" style={{ background:t.card, borderColor:t.cardBorder }}>
            <div className="flex justify-between items-center mb-3">
              <button onClick={()=>setCurrentMonth(p=>p>0?p-1:11)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background:t.surface }}>‹</button>
              <h2 className="font-bold text-sm">{MONTHS[currentMonth]} {currentYear}</h2>
              <button onClick={()=>setCurrentMonth(p=>p<11?p+1:0)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background:t.surface }}>›</button>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {DAYS.map(d=><div key={d} className="text-center text-[10px] font-semibold py-1" style={{ color:t.textMuted }}>{d}</div>)}
              {Array.from({length:firstDay}).map((_,i)=><div key={`e${i}`} />)}
              {Array.from({length:daysInMonth}).map((_,i)=>{
                const d=i+1; const ds=dateStr(d); const bk=bookingsOn(d); const isToday=d===today&&currentMonth===todayMonth; const isSel=ds===selectedDate;
                return (
                  <button key={d} onClick={()=>setSelectedDate(ds===selectedDate?null:ds)} className="relative h-10 rounded-lg flex flex-col items-center justify-center" style={{ background:isSel?t.accentLight:isToday?`${t.accent}15`:'transparent', border:isSel?`2px solid ${t.accent}`:isToday?`1px solid ${t.accent}44`:'none' }}>
                    <span className="text-xs font-medium" style={{ color:isToday?t.accent:t.text }}>{d}</span>
                    {bk.length>0&&<div className="flex gap-0.5 mt-0.5">{bk.slice(0,3).map((_,j)=><div key={j} className="w-1 h-1 rounded-full" style={{ background:t.accent }} />)}</div>}
                  </button>
                );
              })}
            </div>
          </div>
          {selectedBookings.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm px-1">Bookings on {selectedDate}</h3>
              {selectedBookings.map(b=>(
                <div key={b.id} className="glass-card rounded-xl p-3 flex items-center gap-3" style={{ background:t.card, borderColor:t.cardBorder }}>
                  <div className="w-1 h-12 rounded-full" style={{ background:statusColor[b.status] }} />
                  <div className="flex-1"><p className="font-semibold text-sm">{b.title}</p><p className="text-[10px]" style={{ color:t.textMuted }}>{b.worker} · {b.time} · {b.duration}</p></div>
                  <div className="text-right"><span className="font-bold text-sm" style={{ color:t.accent }}>${b.amount}</span><br/><span className="text-[10px]" style={{ color:statusColor[b.status] }}>{b.status}</span></div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-3">
          {BOOKINGS.sort((a,b)=>a.date.localeCompare(b.date)).map(b=>(
            <div key={b.id} className="glass-card rounded-xl p-4 flex items-center gap-3" style={{ background:t.card, borderColor:t.cardBorder }}>
              <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center" style={{ background:`${statusColor[b.status]}15` }}>
                <span className="text-[10px] font-bold" style={{ color:statusColor[b.status] }}>{b.date.split('-')[2]}</span>
                <span className="text-[8px]" style={{ color:t.textMuted }}>Mar</span>
              </div>
              <div className="flex-1"><p className="font-semibold text-sm">{b.title}</p><p className="text-[10px]" style={{ color:t.textMuted }}>{b.worker} · {b.time} · {b.duration}</p></div>
              <div className="text-right"><span className="font-bold text-sm" style={{ color:t.accent }}>${b.amount}</span><br/><span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background:`${statusColor[b.status]}22`, color:statusColor[b.status] }}>{b.status}</span></div>
            </div>
          ))}
          <button onClick={()=>router.push('/jobplace/create')} className="w-full py-3 rounded-xl text-sm font-semibold text-white" style={{ background:`linear-gradient(135deg,${t.accent},#8b5cf6)` }}>+ New Booking</button>
        </div>
      )}
    </div>
  );
}