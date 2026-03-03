"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { getEventBusStats, publish, subscribe, EventTypes } from '@/lib/eventBus';
import { getCacheStats, CacheKeys, cacheSet, cacheGet, cacheInvalidateByTag, cacheClear } from '@/lib/edgeCache';
import { IcoBack } from '@/components/Icons';

export default function InfrastructureDashboard() {
  const router = useRouter();
  const { isDark } = useThemeStore();
  const t = getTheme(isDark);
  const [tab, setTab] = useState<'eventbus'|'cache'>('eventbus');
  const [ebStats, setEbStats] = useState(getEventBusStats());
  const [cStats, setCStats] = useState(getCacheStats());

  // Seed demo events + cache
  useEffect(() => {
    const demoEvents = async () => {
      await publish('jobs', EventTypes.JOB_CREATED, { title:'Plumber needed', amount:80 }, { userId:'u1', source:'web' });
      await publish('jobs', EventTypes.JOB_APPLIED, { jobId:'j1', workerId:'w1' }, { userId:'w1', source:'mobile' });
      await publish('payments', EventTypes.PAYMENT_COMPLETED, { amount:80, jobId:'j1' }, { userId:'u1', priority:'high' });
      await publish('chat', EventTypes.MESSAGE_SENT, { text:'Hi, I can help!' }, { userId:'w1' });
      await publish('moderation', EventTypes.CONTENT_FLAGGED, { postId:'p1', reason:'profanity' }, { priority:'high' });
      await publish('users', EventTypes.USER_REGISTERED, { name:'New User' }, { userId:'u99' });
      await publish('notifications', 'notification.push', { type:'job_update', title:'Job accepted' }, { userId:'u1' });
      await publish('system', EventTypes.SYSTEM_ALERT, { level:'info', msg:'Deployment v7 complete' }, { priority:'critical' });
    };
    demoEvents();
    // Seed cache
    cacheSet(CacheKeys.workerList(), [{id:'w1',name:'Maria Santos'}], { ttl:300, tags:['workers'] });
    cacheSet(CacheKeys.jobList(), [{id:'j1',title:'Plumber needed'}], { ttl:300, tags:['jobs'] });
    cacheSet(CacheKeys.trending(), ['plumber','babysitter','cleaner'], { ttl:600, tags:['trending'] });
    cacheSet(CacheKeys.feed('u1',1), [{id:'p1',text:'Hello world'}], { ttl:120, tags:['feed','user:u1'] });
    // Read to generate hits
    cacheGet(CacheKeys.workerList()); cacheGet(CacheKeys.workerList()); cacheGet(CacheKeys.jobList());
    setTimeout(() => { setEbStats(getEventBusStats()); setCStats(getCacheStats()); }, 200);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => { setEbStats(getEventBusStats()); setCStats(getCacheStats()); }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-4 animate-fade-in pb-10">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:t.card }}><IcoBack size={18} color={t.textMuted} /></button>
        <h1 className="text-xl font-bold flex-1">⚙️ Infrastructure</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[{k:'eventbus' as const,l:'📡 Event Bus'},{k:'cache' as const,l:'🗄️ Edge Cache'}].map(tb => (
          <button key={tb.k} onClick={() => setTab(tb.k)} className="px-4 py-2 rounded-xl text-xs font-bold" style={{ background:tab===tb.k?`${t.accent}15`:t.card, color:tab===tb.k?t.accent:t.textMuted, border:`1px solid ${tab===tb.k?t.accent+'33':t.cardBorder}` }}>{tb.l}</button>
        ))}
      </div>

      {/* Event Bus Tab */}
      {tab === 'eventbus' && (
        <div className="space-y-3">
          <div className="grid grid-cols-4 gap-2">
            {[
              { label:'Events', val:ebStats.totalEvents, color:'#6366f1' },
              { label:'Subscribers', val:ebStats.subscriptions, color:'#22c55e' },
              { label:'Dead Letters', val:ebStats.deadLetterQueue, color:'#ef4444' },
              { label:'Middleware', val:ebStats.middlewares, color:'#f59e0b' },
            ].map(c => (
              <div key={c.label} className="rounded-xl p-3 text-center" style={{ background:t.card, border:`1px solid ${t.cardBorder}` }}>
                <p className="text-xl font-bold" style={{ color:c.color }}>{c.val}</p>
                <p className="text-[9px]" style={{ color:t.textMuted }}>{c.label}</p>
              </div>
            ))}
          </div>
          {/* Channel Breakdown */}
          <div className="rounded-xl p-4" style={{ background:t.card, border:`1px solid ${t.cardBorder}` }}>
            <h3 className="text-sm font-bold mb-3">Channel Activity</h3>
            <div className="space-y-2">
              {Object.entries(ebStats.channelBreakdown).sort((a,b)=>b[1]-a[1]).map(([ch,count]) => (
                <div key={ch} className="flex items-center gap-2">
                  <span className="text-xs font-mono w-24">{ch}</span>
                  <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.04)' }}>
                    <div className="h-full rounded-full" style={{ width:`${(count/Math.max(1,...Object.values(ebStats.channelBreakdown)))*100}%`, background:'linear-gradient(90deg,#6366f1,#8b5cf6)' }} />
                  </div>
                  <span className="text-xs font-bold w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Recent Events */}
          <div className="rounded-xl p-4" style={{ background:t.card, border:`1px solid ${t.cardBorder}` }}>
            <h3 className="text-sm font-bold mb-3">Recent Events</h3>
            <div className="space-y-1 max-h-48 overflow-y-auto" style={{ scrollbarWidth:'thin' }}>
              {ebStats.recentEvents.map(e => (
                <div key={e.id} className="flex items-center gap-2 text-[9px] py-1" style={{ borderBottom:`1px solid ${t.cardBorder}` }}>
                  <span className="px-1.5 py-0.5 rounded font-bold" style={{ background:`${e.metadata.priority==='critical'?'rgba(239,68,68,0.1)':e.metadata.priority==='high'?'rgba(249,115,22,0.1)':'rgba(99,102,241,0.1)'}`, color:e.metadata.priority==='critical'?'#ef4444':e.metadata.priority==='high'?'#f97316':'#6366f1' }}>{e.metadata.priority}</span>
                  <span className="font-mono" style={{ color:t.textMuted }}>{e.channel}</span>
                  <span className="font-semibold flex-1 truncate">{e.type}</span>
                  <span style={{ color:t.textMuted }}>{new Date(e.metadata.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cache Tab */}
      {tab === 'cache' && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label:'Hit Rate', val:cStats.hitRate, color:'#22c55e' },
              { label:'Entries', val:cStats.entries, color:'#6366f1' },
              { label:'Size', val:`${cStats.totalSizeMB}MB`, color:'#f59e0b' },
            ].map(c => (
              <div key={c.label} className="rounded-xl p-3 text-center" style={{ background:t.card, border:`1px solid ${t.cardBorder}` }}>
                <p className="text-xl font-bold" style={{ color:c.color }}>{c.val}</p>
                <p className="text-[9px]" style={{ color:t.textMuted }}>{c.label}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-5 gap-2">
            {[{l:'Hits',v:cStats.hits,c:'#22c55e'},{l:'Misses',v:cStats.misses,c:'#ef4444'},{l:'Stale',v:cStats.staleHits,c:'#f59e0b'},{l:'Evicted',v:cStats.evictions,c:'#8b5cf6'},{l:'Invalidated',v:cStats.invalidations,c:'#06b6d4'}].map(s => (
              <div key={s.l} className="rounded-lg p-2 text-center" style={{ background:t.card, border:`1px solid ${t.cardBorder}` }}>
                <p className="text-sm font-bold" style={{ color:s.c }}>{s.v}</p>
                <p className="text-[8px]" style={{ color:t.textMuted }}>{s.l}</p>
              </div>
            ))}
          </div>
          {/* Region Map */}
          <div className="rounded-xl p-4" style={{ background:t.card, border:`1px solid ${t.cardBorder}` }}>
            <h3 className="text-sm font-bold mb-3">🌍 Multi-Region Topology</h3>
            <div className="grid grid-cols-2 gap-2">
              {cStats.regionConfigs.map(rc => (
                <div key={rc.region} className="flex items-center gap-2 p-2 rounded-lg" style={{ background:rc.primary?`${t.accent}08`:isDark?'rgba(255,255,255,0.02)':'rgba(0,0,0,0.01)', border:`1px solid ${rc.primary?t.accent+'33':t.cardBorder}` }}>
                  <span className="text-xs">{rc.region.startsWith('ca')?'🇨🇦':rc.region.startsWith('in')?'🇮🇳':rc.region.startsWith('us')?'🇺🇸':'🇪🇺'}</span>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold">{rc.region}{rc.primary?' (PRIMARY)':''}</p>
                    <p className="text-[8px]" style={{ color:t.textMuted }}>{rc.replicaOf?`Replica of ${rc.replicaOf}`:'Origin'} · {rc.latencyMs}ms</p>
                  </div>
                  <span className="w-2 h-2 rounded-full" style={{ background:rc.primary?'#22c55e':'#f59e0b' }} />
                </div>
              ))}
            </div>
          </div>
          {/* Cache Actions */}
          <div className="flex gap-2">
            <button onClick={() => { cacheInvalidateByTag('workers'); setCStats(getCacheStats()); }} className="px-3 py-2 rounded-xl text-[10px] font-bold" style={{ background:'rgba(249,115,22,0.1)', color:'#f97316' }}>Invalidate Workers</button>
            <button onClick={() => { cacheInvalidateByTag('jobs'); setCStats(getCacheStats()); }} className="px-3 py-2 rounded-xl text-[10px] font-bold" style={{ background:'rgba(249,115,22,0.1)', color:'#f97316' }}>Invalidate Jobs</button>
            <button onClick={() => { cacheClear(); setCStats(getCacheStats()); }} className="px-3 py-2 rounded-xl text-[10px] font-bold" style={{ background:'rgba(239,68,68,0.1)', color:'#ef4444' }}>Clear All Cache</button>
          </div>
        </div>
      )}
    </div>
  );
}
