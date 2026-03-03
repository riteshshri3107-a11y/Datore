"use client";
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { moderateContent, quickCheck, type ModerationResult, type ContentType, type Severity } from '@/lib/moderation';
import { IcoBack, IcoShield, IcoSearch, IcoFlag, IcoCheck, IcoClose, IcoTrash } from '@/components/Icons';

/* Demo moderation queue — in production this comes from Supabase moderation_queue table */
const DEMO_QUEUE = [
  { id:'mq1', contentType:'post' as ContentType, authorName:'Anonymous#231', text:'This fucking app is garbage! Kill all the developers!', status:'pending' as const, createdAt:'2 min ago' },
  { id:'mq2', contentType:'comment' as ContentType, authorName:'Anonymous#892', text:'Check out my crypto investment scheme! Guaranteed 500% returns! Send money to...', status:'pending' as const, createdAt:'15 min ago' },
  { id:'mq3', contentType:'listing' as ContentType, authorName:'Anonymous#445', text:'Selling adult explicit content, DM for prices, 18+ only', status:'pending' as const, createdAt:'1h ago' },
  { id:'mq4', contentType:'post' as ContentType, authorName:'Anonymous#102', text:'Anyone know a good plumber in Brampton? My sink has been leaking for days.', status:'pending' as const, createdAt:'2h ago' },
  { id:'mq5', contentType:'comment' as ContentType, authorName:'Anonymous#567', text:'Great service! Highly recommended. My number is 416-555-1234 call me', status:'pending' as const, createdAt:'3h ago' },
  { id:'mq6', contentType:'post' as ContentType, authorName:'Anonymous#333', text:'You retarded bitch, go die in a hole', status:'pending' as const, createdAt:'4h ago' },
  { id:'mq7', contentType:'review' as ContentType, authorName:'Anonymous#711', text:'Terrible worker. Showed up late, did sloppy work. Damn waste of money.', status:'pending' as const, createdAt:'5h ago' },
  { id:'mq8', contentType:'message' as ContentType, authorName:'Anonymous#999', text:'Send me your password and credit card info to verify your account', status:'pending' as const, createdAt:'6h ago' },
];

const SEVERITY_COLORS: Record<Severity, {bg:string;text:string;label:string}> = {
  none: { bg:'rgba(34,197,94,0.1)', text:'#22c55e', label:'Clean' },
  low: { bg:'rgba(234,179,8,0.1)', text:'#eab308', label:'Low' },
  medium: { bg:'rgba(249,115,22,0.1)', text:'#f97316', label:'Medium' },
  high: { bg:'rgba(239,68,68,0.1)', text:'#ef4444', label:'High' },
  critical: { bg:'rgba(220,38,38,0.15)', text:'#dc2626', label:'Critical' },
};

export default function ModerationDashboard() {
  const router = useRouter();
  const { isDark } = useThemeStore();
  const t = getTheme(isDark);
  const [queue, setQueue] = useState(DEMO_QUEUE.map(item => ({
    ...item,
    modResult: moderateContent(item.text, item.contentType),
    status: item.status as 'pending' | 'approved' | 'rejected',
  })));
  const [filter, setFilter] = useState<'all'|'pending'|'approved'|'rejected'>('all');
  const [testText, setTestText] = useState('');
  const [testResult, setTestResult] = useState<ModerationResult | null>(null);
  const [testType, setTestType] = useState<ContentType>('post');

  const filtered = queue.filter(i => filter === 'all' || i.status === filter);
  const stats = {
    total: queue.length,
    pending: queue.filter(i => i.status === 'pending').length,
    approved: queue.filter(i => i.status === 'approved').length,
    rejected: queue.filter(i => i.status === 'rejected').length,
    critical: queue.filter(i => i.modResult.severity === 'critical').length,
  };

  const updateStatus = (id: string, status: 'approved' | 'rejected') => {
    setQueue(prev => prev.map(i => i.id === id ? { ...i, status } : i));
  };

  const runTest = () => {
    if (!testText.trim()) return;
    setTestResult(moderateContent(testText, testType));
  };

  return (
    <div className="space-y-5 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:t.card }}><IcoBack size={18} color={t.textMuted} /></button>
        <div className="flex-1">
          <h1 className="text-xl font-bold flex items-center gap-2"><IcoShield size={22} color={t.accent} /> Moderation Dashboard</h1>
          <p className="text-xs" style={{ color:t.textMuted }}>Content safety & review queue</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-2">
        {[
          { label:'Total', val:stats.total, color:'#6366f1' },
          { label:'Pending', val:stats.pending, color:'#f59e0b' },
          { label:'Approved', val:stats.approved, color:'#22c55e' },
          { label:'Rejected', val:stats.rejected, color:'#ef4444' },
          { label:'Critical', val:stats.critical, color:'#dc2626' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-3 text-center" style={{ background:t.card, border:`1px solid ${t.cardBorder}` }}>
            <p className="text-xl font-bold" style={{ color:s.color }}>{s.val}</p>
            <p className="text-[9px] font-medium" style={{ color:t.textMuted }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Live Test Tool */}
      <div className="rounded-2xl p-4" style={{ background:t.card, border:`1px solid ${t.cardBorder}` }}>
        <h3 className="text-sm font-bold mb-3">🧪 Live Moderation Test</h3>
        <div className="flex gap-2 mb-3">
          {(['post','comment','message','listing','review'] as ContentType[]).map(ct => (
            <button key={ct} onClick={() => setTestType(ct)} className="px-3 py-1 rounded-lg text-[10px] font-semibold" style={{ background:testType===ct?`${t.accent}15`:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)', color:testType===ct?t.accent:t.textMuted, border:`1px solid ${testType===ct?t.accent+'33':t.cardBorder}` }}>{ct}</button>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={testText} onChange={e => setTestText(e.target.value)} onKeyDown={e => e.key === 'Enter' && runTest()} placeholder="Type content to test moderation..." className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none" style={{ background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)', border:`1px solid ${t.cardBorder}`, color:t.text }} />
          <button onClick={runTest} className="px-4 py-2 rounded-xl text-xs font-bold text-white" style={{ background:`linear-gradient(135deg,${t.accent},#8b5cf6)` }}>Analyze</button>
        </div>
        {testResult && (
          <div className="mt-3 p-3 rounded-xl" style={{ background:isDark?'rgba(255,255,255,0.02)':'rgba(0,0,0,0.01)', border:`1px solid ${t.cardBorder}` }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background:SEVERITY_COLORS[testResult.severity].bg, color:SEVERITY_COLORS[testResult.severity].text }}>{SEVERITY_COLORS[testResult.severity].label}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background:testResult.action==='block'?'rgba(239,68,68,0.1)':testResult.action==='censor'?'rgba(249,115,22,0.1)':'rgba(34,197,94,0.1)', color:testResult.action==='block'?'#ef4444':testResult.action==='censor'?'#f97316':'#22c55e' }}>Action: {testResult.action}</span>
              <span className="text-[9px]" style={{ color:t.textMuted }}>Confidence: {(testResult.confidence*100).toFixed(0)}% · {testResult.metadata.processingTime.toFixed(1)}ms</span>
            </div>
            {testResult.flags.length > 0 && (
              <div className="space-y-1">{testResult.flags.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-[10px]">
                  <span className="px-1.5 py-0.5 rounded" style={{ background:SEVERITY_COLORS[f.severity].bg, color:SEVERITY_COLORS[f.severity].text }}>{f.category}</span>
                  <span style={{ color:t.textSecondary }}>{f.description}</span>
                </div>
              ))}</div>
            )}
            {testResult.cleaned !== testText && (
              <div className="mt-2 p-2 rounded-lg text-xs" style={{ background:isDark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.02)' }}>
                <p className="text-[9px] font-bold mb-1" style={{ color:t.textMuted }}>CLEANED OUTPUT:</p>
                <p style={{ color:t.text }}>{testResult.cleaned}</p>
              </div>
            )}
            {testResult.metadata.piiDetected.length > 0 && (
              <p className="text-[10px] mt-1" style={{ color:'#f59e0b' }}>⚠️ PII detected: {testResult.metadata.piiDetected.join(', ')}</p>
            )}
          </div>
        )}
      </div>

      {/* Queue Filter */}
      <div className="flex items-center gap-2">
        <p className="text-sm font-bold flex-1">Review Queue</p>
        {(['all','pending','approved','rejected'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className="px-3 py-1.5 rounded-lg text-[10px] font-semibold capitalize" style={{ background:filter===f?`${t.accent}15`:t.card, color:filter===f?t.accent:t.textMuted, border:`1px solid ${filter===f?t.accent+'33':t.cardBorder}` }}>{f} {f==='pending'?`(${stats.pending})`:''}</button>
        ))}
      </div>

      {/* Queue Items */}
      <div className="space-y-2">
        {filtered.map(item => {
          const sev = SEVERITY_COLORS[item.modResult.severity];
          return (
            <div key={item.id} className="rounded-xl p-4" style={{ background:t.card, border:`1px solid ${item.modResult.severity==='critical'?'rgba(220,38,38,0.3)':t.cardBorder}` }}>
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  {/* Meta */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ background:sev.bg, color:sev.text }}>{sev.label}</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px]" style={{ background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)', color:t.textMuted }}>{item.contentType}</span>
                    <span className="text-[9px]" style={{ color:t.textMuted }}>{item.authorName}</span>
                    <span className="text-[9px]" style={{ color:t.textMuted }}>· {item.createdAt}</span>
                    {item.status !== 'pending' && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ background:item.status==='approved'?'rgba(34,197,94,0.1)':'rgba(239,68,68,0.1)', color:item.status==='approved'?'#22c55e':'#ef4444' }}>{item.status === 'approved' ? '✓ Approved' : '✗ Rejected'}</span>
                    )}
                  </div>
                  {/* Content */}
                  <p className="text-xs mb-2" style={{ color:t.text }}>{item.modResult.severity === 'critical' || item.modResult.severity === 'high' ? item.modResult.cleaned : item.text}</p>
                  {/* Flags */}
                  <div className="flex flex-wrap gap-1">
                    {item.modResult.flags.map((f, i) => (
                      <span key={i} className="text-[8px] px-1.5 py-0.5 rounded" style={{ background:SEVERITY_COLORS[f.severity].bg, color:SEVERITY_COLORS[f.severity].text }}>{f.category}: {f.description}</span>
                    ))}
                    {item.modResult.flags.length === 0 && <span className="text-[8px] px-1.5 py-0.5 rounded" style={{ background:'rgba(34,197,94,0.1)', color:'#22c55e' }}>✓ No flags</span>}
                  </div>
                  <p className="text-[8px] mt-1" style={{ color:t.textMuted }}>Action: {item.modResult.action} · Confidence: {(item.modResult.confidence*100).toFixed(0)}% · Rules: {item.modResult.metadata.rulesTriggered.length || 0}</p>
                </div>
                {/* Actions */}
                {item.status === 'pending' && (
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button onClick={() => updateStatus(item.id, 'approved')} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:'rgba(34,197,94,0.1)' }} title="Approve">
                      <IcoCheck size={16} color="#22c55e" />
                    </button>
                    <button onClick={() => updateStatus(item.id, 'rejected')} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:'rgba(239,68,68,0.1)' }} title="Reject">
                      <IcoClose size={16} color="#ef4444" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 rounded-2xl" style={{ background:t.card }}>
            <p className="text-3xl mb-2">✅</p>
            <p className="text-sm font-medium">Queue clear!</p>
            <p className="text-xs" style={{ color:t.textMuted }}>No items match this filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
