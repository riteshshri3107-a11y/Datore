"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { useAuthStore } from '@/store/useAuthStore';
import { getMyTickets, createTicket } from '@/lib/supabase';
import { IcoBack } from '@/components/Icons';

const DEMO_DISPUTES = [
  { id:'d1', title:'Incomplete cleaning job', against:'Worker: Anita S.', job:'House Cleaning - Feb 20', status:'open', filed:'Feb 22', amount:120 },
  { id:'d2', title:'Worker did not show up', against:'Worker: James B.', job:'Electrical Fix - Feb 15', status:'resolved', filed:'Feb 16', amount:90, resolution:'Full refund issued' },
  { id:'d3', title:'Price disagreement', against:'Client: John D.', job:'Plumbing Repair - Feb 10', status:'in_review', filed:'Feb 11', amount:185 },
];

export default function DisputesPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const { user } = useAuthStore();
  const [showFile, setShowFile] = useState(false);
  const [fileText, setFileText] = useState('');
  const [filed, setFiled] = useState(false);
  const [disputes, setDisputes] = useState(DEMO_DISPUTES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (user?.id) {
        try {
          const data = await getMyTickets(user.id);
          if (data && data.length > 0) {
            const mapped = data.map((t: any) => ({
              id: t.id,
              title: t.subject || t.title || 'Ticket',
              against: t.against || 'N/A',
              job: t.related_job || '',
              status: t.status || 'open',
              filed: new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              amount: t.amount || 0,
              resolution: t.resolution,
            }));
            setDisputes(mapped.length > 0 ? mapped : DEMO_DISPUTES);
          }
        } catch {}
      }
      setLoading(false);
    })();
  }, [user?.id]);

  const statusColor: Record<string,string> = { open:'#f59e0b', resolved:'#22c55e', in_review:'#6366f1', escalated:'#ef4444' };

  const fileDispute = async () => {
    if (fileText.trim().length > 10) {
      if (user?.id) {
        try { await createTicket({ user_id: user.id, subject: fileText.trim().slice(0, 100), description: fileText.trim(), type: 'dispute', status: 'open' }); } catch {}
      }
      setFiled(true); setTimeout(()=>{setFiled(false);setShowFile(false);setFileText('');},2000);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={()=>router.back()} style={{ background:'none', border:'none', color:t.text, cursor:'pointer' }}><IcoBack size={20} /></button>
        <h1 className="text-xl font-bold flex-1">Disputes</h1>
        <button onClick={()=>setShowFile(true)} className="px-4 py-2 rounded-xl text-xs font-semibold text-white" style={{ background:`linear-gradient(135deg,${t.accent},#8b5cf6)` }}>File Dispute</button>
      </div>

      <div className="glass-card rounded-xl p-4" style={{ background:`linear-gradient(135deg,${t.accent}15,#8b5cf622)`, borderColor:t.cardBorder }}>
        <p className="text-xs" style={{ color:t.textSecondary }}>Disputes are reviewed within 24-48 hours. Our AI mediation suggests fair resolutions, with human reviewers for complex cases.</p>
      </div>

      {disputes.map(d=>(
        <div key={d.id} className="glass-card rounded-xl p-4" style={{ background:t.card, borderColor:t.cardBorder }}>
          <div className="flex justify-between items-start">
            <div><p className="font-semibold text-sm">{d.title}</p><p className="text-[10px]" style={{ color:t.textMuted }}>{d.against} · {d.job}</p><p className="text-[10px]" style={{ color:t.textMuted }}>Filed: {d.filed} · Amount: ${d.amount}</p></div>
            <span className="text-[10px] px-2 py-1 rounded-full font-semibold" style={{ background:`${statusColor[d.status]}22`, color:statusColor[d.status] }}>{d.status.replace('_',' ')}</span>
          </div>
          {d.resolution && <div className="mt-2 p-2 rounded-lg" style={{ background:'#22c55e15' }}><p className="text-xs" style={{ color:'#22c55e' }}>✓ {d.resolution}</p></div>}
          {d.status==='open' && <div className="flex gap-2 mt-3"><button className="flex-1 py-2 rounded-xl text-xs font-medium" style={{ background:t.accentLight, color:t.accent }}>Add Evidence</button><button className="flex-1 py-2 rounded-xl text-xs font-medium" style={{ background:'#22c55e22', color:'#22c55e' }}>Accept Mediation</button></div>}
        </div>
      ))}

      {showFile && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }} onClick={()=>setShowFile(false)}>
          <div onClick={e=>e.stopPropagation()} className="w-full max-w-md rounded-2xl p-5 space-y-4" style={{ background:isDark?'#1a1a2e':'#fff', border:`1px solid ${t.cardBorder}` }}>
            <h3 className="font-bold text-lg">File a Dispute</h3>
            <select className="w-full p-3 rounded-xl text-sm outline-none" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, color:t.text }}><option>Select Job...</option><option>House Cleaning - Feb 20</option><option>Plumbing Repair - Feb 18</option></select>
            <textarea value={fileText} onChange={e=>setFileText(e.target.value)} rows={4} placeholder="Describe the issue in detail..." className="w-full p-3 rounded-xl text-sm outline-none resize-none" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, color:t.text }} />
            <button className="w-full py-2 rounded-xl text-xs font-medium" style={{ background:t.surface, color:t.textSecondary, border:`1px solid ${t.cardBorder}` }}>📎 Attach Evidence (Photos, Screenshots)</button>
            {filed ? <p className="text-center font-semibold text-sm" style={{ color:'#22c55e' }}>✓ Dispute filed successfully!</p> : <button onClick={fileDispute} className="w-full py-3 rounded-xl text-sm font-semibold text-white" style={{ background:`linear-gradient(135deg,${t.accent},#8b5cf6)` }}>Submit Dispute</button>}
          </div>
        </div>
      )}
    </div>
  );
}