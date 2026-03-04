"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { useAuth } from '@/lib/useAuth';
import { getNotifications as dbGetNotifications, markNotificationRead } from '@/lib/supabase';

const NOTIFS = [
  // Today
  { id:'n1', title:'New job match!', msg:'A babysitting job was posted 2km from you in Brampton. $35/hr, needs someone tonight.', type:'job', read:false, time:'5 min ago', group:'Today', link:'/jobplace/job/1', priority:'high', action:'View Job' },
  { id:'n2', title:'Review received', msg:'Sarah Chen gave you 5 stars! "Amazing babysitter, my kids loved her"', type:'review', read:false, time:'1 hour ago', group:'Today', link:'/profile', priority:'normal', action:'See Review' },
  { id:'n3', title:'Birthday: Maria Santos', msg:'Your friend Maria Santos turns 28 today! Send her birthday wishes.', type:'birthday', read:false, time:'Today', group:'Today', link:'/friends', priority:'normal', action:'Send Wishes' },
  { id:'n4', title:'Payment received', msg:'You earned $45.00 CAD for the house cleaning job with Tom Wilson. Tokens added to wallet.', type:'payment', read:false, time:'3 hours ago', group:'Today', link:'/wallet', priority:'normal', action:'View Wallet' },
  { id:'n5', title:'Safety: Background Check Complete', msg:"James O'Brien's police verification has been completed. Status: CLEAR. Safe to hire.", type:'safety', read:false, time:'4 hours ago', group:'Today', link:'/safety', priority:'high', action:'View Report' },
  // Yesterday
  { id:'n6', title:'Community Event Coming', msg:'GTA Community BBQ is happening Mar 15 at High Park. 34 people going. RSVP now!', type:'event', read:true, time:'Yesterday', group:'Yesterday', link:'/events', priority:'normal', action:'RSVP' },
  { id:'n7', title:'Hire Confirmed', msg:'Priya Sharma accepted your cleaning job request. She will arrive at 10:00 AM tomorrow.', type:'hire', read:true, time:'Yesterday', group:'Yesterday', link:'/chat/3', priority:'high', action:'Message Her' },
  { id:'n8', title:'Anniversary', msg:"1 year since Rosa Martinez joined Datore! She's completed 45 jobs with a 4.8 rating.", type:'anniversary', read:true, time:'Yesterday', group:'Yesterday', link:'/worker/7', priority:'low', action:'View Profile' },
  { id:'n9', title:'New friend request', msg:'Aisha Hassan wants to connect with you. She is a pet care specialist in Mississauga.', type:'social', read:true, time:'Yesterday', group:'Yesterday', link:'/friends', priority:'normal', action:'Accept' },
  // Earlier
  { id:'n10', title:'QR Verification', msg:'You verified Mike Johnson via QR code scan before the moving job. All checks passed.', type:'qr', read:true, time:'Feb 23', group:'Earlier', link:'/qr-verify', priority:'normal', action:'View Scan' },
  { id:'n11', title:'Price Drop Alert', msg:'A Samsung TV in the marketplace just dropped from $450 to $350. Seller: David Chen.', type:'marketplace', read:true, time:'Feb 22', group:'Earlier', link:'/marketplace/listing/1', priority:'low', action:'View Item' },
  { id:'n12', title:'Job completed', msg:'Your tutoring job with David Chen was marked as completed. Please leave a review.', type:'job', read:true, time:'Feb 20', group:'Earlier', link:'/jobplace', priority:'normal', action:'Leave Review' },
  { id:'n13', title:'Workshop Reminder', msg:'Babysitter Safety Workshop is in 5 days. Mar 20 at Community Center, Brampton.', type:'event', read:true, time:'Feb 20', group:'Earlier', link:'/events', priority:'normal', action:'View Event' },
  { id:'n14', title:'Trust Score Update', msg:'Your trust score increased from 82 to 87! Great job maintaining positive reviews.', type:'trust', read:true, time:'Feb 18', group:'Earlier', link:'/profile', priority:'normal', action:'View Score' },
];

const ICONS: Record<string,{bg:string; color:string; label:string}> = {
  job: { bg:'rgba(99,102,241,0.12)', color:'#6366f1', label:'JOB' },
  review: { bg:'rgba(245,158,11,0.12)', color:'#f59e0b', label:'REV' },
  payment: { bg:'rgba(34,197,94,0.12)', color:'#22c55e', label:'PAY' },
  birthday: { bg:'rgba(236,72,153,0.12)', color:'#ec4899', label:'BDay' },
  event: { bg:'rgba(139,92,246,0.12)', color:'#8b5cf6', label:'EVT' },
  safety: { bg:'rgba(6,182,212,0.12)', color:'#06b6d4', label:'SAFE' },
  anniversary: { bg:'rgba(249,115,22,0.12)', color:'#f97316', label:'ANN' },
  qr: { bg:'rgba(59,130,246,0.12)', color:'#3b82f6', label:'QR' },
  hire: { bg:'rgba(34,197,94,0.12)', color:'#22c55e', label:'HIRE' },
  social: { bg:'rgba(99,102,241,0.12)', color:'#6366f1', label:'FRD' },
  marketplace: { bg:'rgba(236,72,153,0.12)', color:'#ec4899', label:'MKT' },
  trust: { bg:'rgba(6,182,212,0.12)', color:'#06b6d4', label:'AI' },
};

export default function NotificationsPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [readIds, setReadIds] = useState<string[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [showPush, setShowPush] = useState(true);
  const [dbNotifs, setDbNotifs] = useState<any[]>([]);

  // Load notifications from Supabase for this user
  useEffect(() => {
    if (!user) return;
    dbGetNotifications(user.id).then(data => { if (data.length > 0) setDbNotifs(data); });
  }, [user]);

  // Simulate push notification arrival
  useEffect(() => {
    const timer = setTimeout(() => setShowPush(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const markRead = (id: string) => { if (!readIds.includes(id)) setReadIds(p => [...p, id]); };
  const dismiss = (id: string) => setDismissed(p => [...p, id]);
  const markAllRead = () => setReadIds(NOTIFS.map(n => n.id));

  const filters = [
    { id:'all', label:'All' },
    { id:'job', label:'Jobs' },
    { id:'payment', label:'Money' },
    { id:'social', label:'Social' },
    { id:'safety', label:'Safety' },
    { id:'event', label:'Events' },
  ];

  const socialTypes = ['birthday','anniversary','social'];
  const safetyTypes = ['safety','qr','trust'];
  const visible = NOTIFS.filter(n => !dismissed.includes(n.id));
  const filtered = filter === 'all' ? visible
    : filter === 'social' ? visible.filter(n => socialTypes.includes(n.type))
    : filter === 'safety' ? visible.filter(n => safetyTypes.includes(n.type))
    : visible.filter(n => n.type === filter);

  const unreadCount = visible.filter(n => !n.read && !readIds.includes(n.id)).length;
  const groups = ['Today','Yesterday','Earlier'];

  const getFilterUnread = (f: string) => {
    const list = f === 'all' ? visible : f === 'social' ? visible.filter(n => socialTypes.includes(n.type)) : f === 'safety' ? visible.filter(n => safetyTypes.includes(n.type)) : visible.filter(n => n.type === f);
    return list.filter(n => !n.read && !readIds.includes(n.id)).length;
  };

  return (
    <div className="space-y-4 animate-fade-in ">
      {/* Push notification simulation */}
      {showPush && (
        <div className="glass-card rounded-2xl p-3 flex items-center gap-3 animate-bounce" style={{ background:'rgba(99,102,241,0.12)', borderColor:'#6366f133', position:'relative' }} onClick={() => { setShowPush(false); router.push('/jobplace/job/1'); }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold" style={{ background:'rgba(99,102,241,0.2)', color:'#6366f1' }}>NEW</div>
          <div className="flex-1">
            <p className="text-xs font-bold">New job match nearby!</p>
            <p className="text-[10px]" style={{ color:t.textMuted }}>Babysitting - $35/hr - 2km away - Tap to view</p>
          </div>
          <button onClick={e => { e.stopPropagation(); setShowPush(false); }} className="text-xs" style={{ color:t.textMuted }}>X</button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-lg">{'<-'}</button>
          <h1 className="text-xl font-bold">Notifications</h1>
          {unreadCount > 0 && <span className="text-[10px] px-2 py-0.5 rounded-full text-white font-bold" style={{ background:'#ef4444' }}>{unreadCount} new</span>}
        </div>
        <button onClick={markAllRead} className="text-xs font-medium" style={{ color:t.accent }}>Mark all read</button>
      </div>

      {/* Filter tabs with unread badges */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {filters.map(f => {
          const uc = getFilterUnread(f.id);
          return (
            <button key={f.id} onClick={() => setFilter(f.id)} className="px-3 py-1.5 rounded-xl text-[11px] font-medium whitespace-nowrap flex items-center gap-1" style={{ background:filter===f.id?t.accentLight:'transparent', color:filter===f.id?t.accent:t.textSecondary }}>
              {f.label}
              {uc > 0 && <span className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] text-white font-bold" style={{ background:'#ef4444' }}>{uc}</span>}
            </button>
          );
        })}
      </div>

      {/* Grouped notifications */}
      {groups.map(group => {
        const groupNotifs = filtered.filter(n => n.group === group);
        if (groupNotifs.length === 0) return null;
        return (
          <div key={group}>
            <h3 className="text-[10px] font-semibold uppercase tracking-wider mb-2 px-1" style={{ color:t.textMuted }}>{group}</h3>
            <div className="space-y-2">
              {groupNotifs.map(n => {
                const isRead = n.read || readIds.includes(n.id);
                const ic = ICONS[n.type] || { bg:t.accentLight, color:t.accent, label:'N' };
                return (
                  <div key={n.id} className="glass-card rounded-xl p-3.5 transition-all" style={{ background: isRead ? t.card : `${ic.color}06`, borderColor: isRead ? t.cardBorder : `${ic.color}22` }}>
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-bold shrink-0" style={{ background:ic.bg, color:ic.color }}>{ic.label}</div>
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm" style={{ fontWeight: isRead ? 500 : 700 }}>{n.title}</p>
                          {!isRead && <span className="w-2 h-2 rounded-full shrink-0" style={{ background:ic.color }}></span>}
                          {n.priority === 'high' && <span className="text-[8px] px-1.5 py-0.5 rounded font-bold" style={{ background:'rgba(239,68,68,0.1)', color:'#ef4444' }}>URGENT</span>}
                        </div>
                        <p className="text-xs mt-1 leading-relaxed" style={{ color:t.textSecondary }}>{n.msg}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px]" style={{ color:t.textMuted }}>{n.time}</span>
                          {/* Action button */}
                          <button onClick={() => { markRead(n.id); if(n.link) router.push(n.link); }} className="text-[10px] px-2.5 py-1 rounded-lg font-semibold" style={{ background:ic.bg, color:ic.color }}>
                            {n.action}
                          </button>
                          <button onClick={() => dismiss(n.id)} className="text-[10px] px-2 py-1 rounded-lg" style={{ color:t.textMuted }}>Dismiss</button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {filtered.length === 0 && (
        <div className="text-center py-12 glass-card rounded-2xl" style={{ background:t.card, borderColor:t.cardBorder }}>
          <p className="text-lg font-bold mb-1">All clear!</p>
          <p className="text-sm" style={{ color:t.textSecondary }}>No {filter !== 'all' ? filter : ''} notifications</p>
        </div>
      )}

      {/* Settings shortcut */}
      <div className="p-3 rounded-xl flex items-center justify-between" style={{ background:isDark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.02)', border:`1px solid ${t.cardBorder}` }}>
        <div>
          <p className="text-xs font-medium">Notification Preferences</p>
          <p className="text-[10px]" style={{ color:t.textMuted }}>Push, email, birthdays, events, safety alerts</p>
        </div>
        <button onClick={() => router.push('/settings')} className="text-[10px] px-3 py-1.5 rounded-lg font-medium" style={{ background:t.accentLight, color:t.accent }}>Settings</button>
      </div>
    </div>
  );
}
