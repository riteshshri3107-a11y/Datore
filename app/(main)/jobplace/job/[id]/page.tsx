"use client";
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { formatCurrency } from '@/lib/utils';
import { DEMO_JOBS, URGENCY_STYLES } from '@/lib/demoData';

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const job = DEMO_JOBS.find(j=>j.id===params.id) || DEMO_JOBS[0];
  const urg = URGENCY_STYLES[job.urgency] || URGENCY_STYLES.no_rush;
  const [applied, setApplied] = useState(false);
  const [message, setMessage] = useState('');
  const [showApply, setShowApply] = useState(false);

  const handleApply = () => { setApplied(true); setShowApply(false); };

  return (
    <div className="space-y-4 animate-fade-in max-w-lg mx-auto">
      <div className="flex items-center gap-3"><button onClick={()=>router.back()} className="text-lg">\u2190</button><h1 className="text-xl font-bold">Job Details</h1></div>
      <div className="glass-card rounded-2xl p-5" style={{ background:t.card, borderColor:t.cardBorder, boxShadow:t.glassShadow }}>
        <span className="text-xs px-3 py-1 rounded-full" style={{ background:urg.bg, color:urg.color }}>{urg.emoji} {urg.label}</span>
        <h2 className="text-lg font-bold mt-3">{job.title}</h2>
        <p className="text-xs mt-1" style={{ color:t.textMuted }}>Posted by {job.poster} \u00b7 {job.applicants} applicants</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="glass-card rounded-xl p-3" style={{ background:t.card, borderColor:t.cardBorder }}><p className="text-[10px]" style={{ color:t.textMuted }}>\ud83d\udcb0 Payment</p><p className="font-bold" style={{ color:t.accent }}>{formatCurrency(job.amount)}{job.payment==='hourly'?'/hr':' fixed'}</p></div>
        <div className="glass-card rounded-xl p-3" style={{ background:t.card, borderColor:t.cardBorder }}><p className="text-[10px]" style={{ color:t.textMuted }}>\ud83d\udccd Location</p><p className="font-semibold text-sm">{job.location}</p></div>
      </div>
      <div className="glass-card rounded-2xl p-4" style={{ background:t.card, borderColor:t.cardBorder }}><h3 className="font-semibold text-sm mb-2">Description</h3><p className="text-sm leading-relaxed" style={{ color:t.textSecondary }}>{job.desc}</p></div>
      <div className="flex gap-2 sticky bottom-20 md:bottom-4 z-10">
        <button onClick={()=>router.push(`/chat/${job.posterId}`)} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white border-none cursor-pointer" style={{ background:`linear-gradient(135deg,${t.accent},#8b5cf6)` }}>\ud83d\udcac Chat with Poster</button>
        {applied ? (
          <button disabled className="flex-1 py-3 rounded-xl text-sm font-semibold" style={{ background:'rgba(34,197,94,0.15)', color:'#22c55e' }}>\u2705 Applied</button>
        ) : (
          <button onClick={()=>setShowApply(true)} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white border-none cursor-pointer" style={{ background:'linear-gradient(135deg,#22c55e,#16a34a)' }}>\ud83d\udccb Apply Now</button>
        )}
      </div>
      {showApply && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }} onClick={()=>setShowApply(false)}>
          <div onClick={e=>e.stopPropagation()} className="w-full max-w-sm rounded-2xl p-5 space-y-4" style={{ background:isDark?'#1a1a2e':'#fff', border:`1px solid ${t.cardBorder}` }}>
            <h3 className="font-bold text-lg">Apply for: {job.title}</h3>
            <p className="text-xs" style={{ color:t.textMuted }}>Add a message to the poster (optional)</p>
            <textarea value={message} onChange={e=>setMessage(e.target.value)} rows={3} placeholder="Hi! I am interested and have relevant experience..." className="w-full p-3 rounded-xl text-sm outline-none resize-none" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, color:t.text }} />
            <button onClick={handleApply} className="w-full py-3 rounded-xl text-sm font-semibold text-white" style={{ background:'linear-gradient(135deg,#22c55e,#16a34a)' }}>\u2705 Submit Application</button>
            <button onClick={()=>setShowApply(false)} className="w-full py-2 rounded-xl text-xs" style={{ color:t.textMuted }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}