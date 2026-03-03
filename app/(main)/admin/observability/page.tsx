"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { getDashboardData, track, trackTiming, evaluateSLOs } from '@/lib/observability';
import { IcoBack, IcoShield } from '@/components/Icons';

export default function ObservabilityDashboard() {
  const router = useRouter();
  const { isDark } = useThemeStore();
  const t = getTheme(isDark);
  const [data, setData] = useState(getDashboardData());
  const [refreshInterval, setRefreshInterval] = useState(5);

  // Seed demo data on mount
  useEffect(() => {
    const endpoints = ['/api/jobs','/api/workers','/api/listings','/api/chat','/api/payments'];
    for (let i = 0; i < 150; i++) {
      const ep = endpoints[Math.floor(Math.random()*endpoints.length)];
      const isError = Math.random() < 0.03;
      track(isError ? 'api_error' : 'api_success', { endpoint:ep, method:Math.random()>0.7?'POST':'GET', duration:String(Math.floor(Math.random()*300+20)), status:isError?'500':'200' });
      trackTiming('api_latency', Math.floor(Math.random()*400+10), { endpoint:ep });
    }
    track('api_auth_failed', { ip:'192.168.1.1' });
    track('api_auth_failed', { ip:'10.0.0.5' });
    track('api_rate_limited', { ip:'10.0.0.99' });
    track('api_content_blocked', { userId:'u1' });
    track('api_content_blocked', { userId:'u2' });
    trackTiming('api_feed_latency', 120); trackTiming('api_feed_latency', 85); trackTiming('api_feed_latency', 340);
    trackTiming('api_auth_latency', 45); trackTiming('api_auth_latency', 62); trackTiming('api_auth_latency', 38);
    trackTiming('api_search_latency', 200); trackTiming('api_search_latency', 180);
    trackTiming('api_payment_latency', 420); trackTiming('api_payment_latency', 380);
    setData(getDashboardData());
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setData(getDashboardData()), refreshInterval * 1000);
    return () => clearInterval(timer);
  }, [refreshInterval]);

  const slos = data.slos;

  return (
    <div className="space-y-4 animate-fade-in pb-10">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:t.card }}><IcoBack size={18} color={t.textMuted} /></button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">📊 Observability Dashboard</h1>
          <p className="text-xs" style={{ color:t.textMuted }}>Real-time metrics, SLOs, and system health</p>
        </div>
        <select value={refreshInterval} onChange={e => setRefreshInterval(+e.target.value)} className="text-[10px] px-2 py-1 rounded-lg bg-transparent" style={{ border:`1px solid ${t.cardBorder}`, color:t.text }}>
          <option value={5}>5s refresh</option><option value={10}>10s</option><option value={30}>30s</option>
        </select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label:'Requests', val:data.overview.totalRequests, color:'#6366f1', sub:`${data.overview.requestsPer5m}/5m` },
          { label:'Errors', val:data.overview.totalErrors, color:'#ef4444', sub:`${data.overview.errorRate}%` },
          { label:'Security', val:(data.security.authFailures + data.security.rateLimited + data.security.contentBlocked), color:'#f59e0b', sub:`${data.security.rateLimited} throttled` },
        ].map(c => (
          <div key={c.label} className="rounded-xl p-3" style={{ background:t.card, border:`1px solid ${t.cardBorder}` }}>
            <p className="text-2xl font-bold" style={{ color:c.color }}>{c.val}</p>
            <p className="text-[10px] font-semibold">{c.label}</p>
            <p className="text-[9px]" style={{ color:t.textMuted }}>{c.sub}</p>
          </div>
        ))}
      </div>

      {/* SLO Status */}
      <div className="rounded-2xl p-4" style={{ background:t.card, border:`1px solid ${t.cardBorder}` }}>
        <h3 className="text-sm font-bold mb-3">🎯 SLO Status</h3>
        <div className="space-y-2">
          {slos.map(s => (
            <div key={s.slo.name} className="flex items-center gap-3">
              <span className="text-xs w-2 h-2 rounded-full flex-shrink-0" style={{ background:s.withinBudget?'#22c55e':'#ef4444' }}/>
              <span className="text-xs flex-1 font-medium">{s.slo.name}</span>
              <span className="text-[10px] font-mono" style={{ color:s.withinBudget?'#22c55e':'#ef4444' }}>
                {typeof s.current === 'number' && s.current < 1 ? (s.current*100).toFixed(2)+'%' : s.current.toFixed(1)+'ms'}
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background:s.withinBudget?'rgba(34,197,94,0.1)':'rgba(239,68,68,0.1)', color:s.withinBudget?'#22c55e':'#ef4444' }}>
                Target: {s.slo.target * 100}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Latency Breakdown */}
      <div className="rounded-2xl p-4" style={{ background:t.card, border:`1px solid ${t.cardBorder}` }}>
        <h3 className="text-sm font-bold mb-3">⚡ Latency (ms)</h3>
        <div className="grid grid-cols-5 gap-1 text-center mb-2">
          <span className="text-[8px] font-bold" style={{ color:t.textMuted }}>Endpoint</span>
          <span className="text-[8px] font-bold" style={{ color:t.textMuted }}>p50</span>
          <span className="text-[8px] font-bold" style={{ color:t.textMuted }}>p95</span>
          <span className="text-[8px] font-bold" style={{ color:t.textMuted }}>p99</span>
          <span className="text-[8px] font-bold" style={{ color:t.textMuted }}>Count</span>
        </div>
        {Object.entries(data.latency).filter(([_,v]) => v.count > 0).map(([name, stats]) => (
          <div key={name} className="grid grid-cols-5 gap-1 text-center py-1.5" style={{ borderTop:`1px solid ${t.cardBorder}` }}>
            <span className="text-[10px] font-semibold text-left">{name}</span>
            <span className="text-[10px] font-mono" style={{ color:'#22c55e' }}>{stats.p50.toFixed(0)}</span>
            <span className="text-[10px] font-mono" style={{ color:stats.p95 > 300 ? '#f59e0b' : '#22c55e' }}>{stats.p95.toFixed(0)}</span>
            <span className="text-[10px] font-mono" style={{ color:stats.p99 > 500 ? '#ef4444' : '#f59e0b' }}>{stats.p99.toFixed(0)}</span>
            <span className="text-[10px] font-mono" style={{ color:t.textMuted }}>{stats.count}</span>
          </div>
        ))}
      </div>

      {/* Security Events */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl p-3" style={{ background:t.card, border:`1px solid ${t.cardBorder}` }}>
          <h4 className="text-xs font-bold mb-2">🔒 Security</h4>
          {Object.entries(data.security).map(([k,v]) => (
            <div key={k} className="flex justify-between text-[10px] py-0.5">
              <span style={{ color:t.textSecondary }}>{k.replace(/([A-Z])/g,' $1')}</span>
              <span className="font-mono font-bold" style={{ color:Number(v)>0?'#f59e0b':'#22c55e' }}>{v}</span>
            </div>
          ))}
        </div>
        <div className="rounded-xl p-3" style={{ background:t.card, border:`1px solid ${t.cardBorder}` }}>
          <h4 className="text-xs font-bold mb-2">🛡️ Moderation</h4>
          {Object.entries(data.moderation).map(([k,v]) => (
            <div key={k} className="flex justify-between text-[10px] py-0.5">
              <span style={{ color:t.textSecondary }}>{k}</span>
              <span className="font-mono font-bold" style={{ color:k==='blocked'&&Number(v)>0?'#ef4444':'#22c55e' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Logs */}
      <div className="rounded-2xl p-4" style={{ background:t.card, border:`1px solid ${t.cardBorder}` }}>
        <h3 className="text-sm font-bold mb-3">📋 Recent Logs ({data.recentLogs.length})</h3>
        <div className="space-y-1 max-h-48 overflow-y-auto" style={{ scrollbarWidth:'thin' }}>
          {data.recentLogs.slice(0,20).map((log, i) => {
            const lc = log.level==='error'||log.level==='critical'?'#ef4444':log.level==='warn'?'#f59e0b':'#22c55e';
            return (
              <div key={i} className="flex items-start gap-2 text-[9px] py-0.5">
                <span className="px-1 rounded font-bold" style={{ background:`${lc}15`, color:lc }}>{log.level}</span>
                <span className="font-mono" style={{ color:t.textMuted }}>{log.source}</span>
                <span className="flex-1 truncate" style={{ color:t.textSecondary }}>{log.message}</span>
              </div>
            );
          })}
          {data.recentLogs.length === 0 && <p className="text-xs text-center py-4" style={{ color:t.textMuted }}>No logs yet</p>}
        </div>
      </div>
    </div>
  );
}
