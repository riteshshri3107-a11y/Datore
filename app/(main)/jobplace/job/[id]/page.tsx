"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { useAuthStore } from '@/store/useAuthStore';
import { getTheme } from '@/lib/theme';
import { formatCurrency } from '@/lib/utils';
import { getJob, applyToJob, createChatRoom } from '@/lib/supabase';

const STATUS_STYLES: Record<string,{bg:string;c:string}> = {
  open: { bg:'rgba(34,197,94,0.12)', c:'#22c55e' },
  assigned: { bg:'rgba(59,130,246,0.12)', c:'#3b82f6' },
  in_progress: { bg:'rgba(249,115,22,0.12)', c:'#f97316' },
  completed: { bg:'rgba(107,114,128,0.12)', c:'#6b7280' },
  cancelled: { bg:'rgba(239,68,68,0.12)', c:'#ef4444' },
  disputed: { bg:'rgba(234,179,8,0.12)', c:'#eab308' },
};

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const { user, profile } = useAuthStore();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);
  const [message, setMessage] = useState('');
  const [showApply, setShowApply] = useState(false);
  const [applyError, setApplyError] = useState('');

  useEffect(() => {
    if (params.id) {
      getJob(params.id as string).then(data => {
        setJob(data);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [params.id]);

  const handleApply = async () => {
    if (!user || !job) return;
    setApplyError('');
    try {
      const { error } = await applyToJob({
        job_id: job.id,
        provider_id: user.id,
        provider_name: profile?.name || user.email || 'Unknown',
        message: message || 'I am interested in this job.',
      });
      if (error) {
        setApplyError('Failed to apply. Please try again.');
        return;
      }
      setApplied(true);
      setShowApply(false);
    } catch {
      setApplyError('Failed to apply. Please try again.');
    }
  };

  const handleChatWithPoster = async () => {
    if (!user || !job) return;
    try {
      const room = await createChatRoom(user.id, job.customer_id);
      if (room?.id) {
        router.push(`/chat/${room.id}`);
      }
    } catch (err) {
      console.error('Failed to create chat room:', err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center gap-3"><button onClick={() => router.back()} className="text-lg">{'<-'}</button><h1 className="text-xl font-bold">Job Details</h1></div>
        <div className="text-center py-12"><div className="animate-pulse text-lg" style={{ color: t.accent }}>Loading...</div></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center gap-3"><button onClick={() => router.back()} className="text-lg">{'<-'}</button><h1 className="text-xl font-bold">Job Details</h1></div>
        <div className="text-center py-12"><p className="text-lg font-medium" style={{ color: t.textSecondary }}>Job not found</p></div>
      </div>
    );
  }

  const statusStyle = STATUS_STYLES[job.status] || STATUS_STYLES.open;
  const posterName = job.profiles?.name || 'Unknown';

  return (
    <div className="space-y-4 animate-fade-in ">
      <div className="flex items-center gap-3"><button onClick={()=>router.back()} className="text-lg">{'<-'}</button><h1 className="text-xl font-bold">Job Details</h1></div>
      <div className="glass-card rounded-2xl p-5" style={{ background:t.card, borderColor:t.cardBorder, boxShadow:t.glassShadow }}>
        <span className="text-xs px-3 py-1 rounded-full" style={{ background:statusStyle.bg, color:statusStyle.c }}>{job.status}</span>
        <h2 className="text-lg font-bold mt-3">{job.job_description?.slice(0, 80) || 'No description'}</h2>
        <p className="text-xs mt-1" style={{ color:t.textMuted }}>Posted by {posterName}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="glass-card rounded-xl p-3" style={{ background:t.card, borderColor:t.cardBorder }}>
          <p className="text-[10px]" style={{ color:t.textMuted }}>Payment</p>
          <p className="font-bold" style={{ color:t.accent }}>{job.agreed_price ? formatCurrency(job.agreed_price) : 'TBD'}</p>
        </div>
        <div className="glass-card rounded-xl p-3" style={{ background:t.card, borderColor:t.cardBorder }}>
          <p className="text-[10px]" style={{ color:t.textMuted }}>Category</p>
          <p className="font-semibold text-sm">{job.category_id || 'General'}</p>
        </div>
      </div>
      {job.scheduled_time && (
        <div className="glass-card rounded-xl p-3" style={{ background:t.card, borderColor:t.cardBorder }}>
          <p className="text-[10px]" style={{ color:t.textMuted }}>Scheduled</p>
          <p className="font-semibold text-sm">{new Date(job.scheduled_time).toLocaleString()}</p>
        </div>
      )}
      <div className="glass-card rounded-2xl p-4" style={{ background:t.card, borderColor:t.cardBorder }}>
        <h3 className="font-semibold text-sm mb-2">Description</h3>
        <p className="text-sm leading-relaxed" style={{ color:t.textSecondary }}>{job.job_description || 'No description provided.'}</p>
      </div>

      {applyError && <div className="p-3 rounded-xl text-center text-sm" style={{ background:'rgba(239,68,68,0.15)', color:'#ef4444' }}>{applyError}</div>}

      <div className="flex gap-2 sticky bottom-20 md:bottom-4 z-10">
        <button onClick={handleChatWithPoster} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white" style={{ background:`linear-gradient(135deg,${t.accent},#8b5cf6)` }}>Chat with Poster</button>
        {applied ? (
          <button disabled className="flex-1 py-3 rounded-xl text-sm font-semibold" style={{ background:'rgba(34,197,94,0.15)', color:'#22c55e' }}>Applied</button>
        ) : (
          <button onClick={()=>setShowApply(true)} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white" style={{ background:'linear-gradient(135deg,#22c55e,#16a34a)' }}>Apply Now</button>
        )}
      </div>
      {showApply && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }} onClick={()=>setShowApply(false)}>
          <div onClick={e=>e.stopPropagation()} className="w-full max-w-sm rounded-2xl p-5 space-y-4" style={{ background:isDark?'#1a1a2e':'#fff', border:`1px solid ${t.cardBorder}` }}>
            <h3 className="font-bold text-lg">Apply for this job</h3>
            <p className="text-xs" style={{ color:t.textMuted }}>Posted by {posterName}{job.agreed_price ? ` - ${formatCurrency(job.agreed_price)}` : ''}</p>
            <textarea value={message} onChange={e=>setMessage(e.target.value)} rows={3} placeholder="Add a message (optional)..." className="w-full p-3 rounded-xl text-sm outline-none resize-none" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, color:t.text }} />
            <button onClick={handleApply} className="w-full py-3 rounded-xl text-sm font-semibold text-white" style={{ background:'linear-gradient(135deg,#22c55e,#16a34a)' }}>Submit Application</button>
            <button onClick={()=>setShowApply(false)} className="w-full py-2 rounded-xl text-xs" style={{ color:t.textMuted }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
