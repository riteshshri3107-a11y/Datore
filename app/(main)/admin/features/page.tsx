"use client";
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { getAllFlags, updateFlag, killFlag, setRollout, type FeatureFlag, type FlagStatus } from '@/lib/featureFlags';
import { IcoBack, IcoCheck, IcoClose } from '@/components/Icons';

const STATUS_STYLES: Record<FlagStatus, {bg:string;color:string;label:string}> = {
  enabled: { bg:'rgba(34,197,94,0.1)', color:'#22c55e', label:'Enabled' },
  disabled: { bg:'rgba(107,114,128,0.1)', color:'#6b7280', label:'Disabled' },
  canary: { bg:'rgba(99,102,241,0.1)', color:'#6366f1', label:'Canary' },
  scheduled: { bg:'rgba(139,92,246,0.1)', color:'#8b5cf6', label:'Scheduled' },
  killed: { bg:'rgba(239,68,68,0.1)', color:'#ef4444', label:'Killed' },
};

export default function FeatureFlagsDashboard() {
  const router = useRouter();
  const { isDark } = useThemeStore();
  const t = getTheme(isDark);
  const [flags, setFlags] = useState(getAllFlags());
  const [filter, setFilter] = useState<'all'|FlagStatus>('all');
  const [expandedId, setExpandedId] = useState<string|null>(null);

  const refresh = () => setFlags(getAllFlags());
  const filtered = filter === 'all' ? flags : flags.filter(f => f.status === filter || (filter === 'killed' && f.killSwitch));

  const stats = {
    total: flags.length,
    enabled: flags.filter(f => f.status === 'enabled').length,
    canary: flags.filter(f => f.status === 'canary').length,
    disabled: flags.filter(f => f.status === 'disabled').length,
    killed: flags.filter(f => f.killSwitch).length,
  };

  return (
    <div className="space-y-4 animate-fade-in pb-10">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:t.card }}><IcoBack size={18} color={t.textMuted} /></button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">🚀 Feature Flags</h1>
          <p className="text-xs" style={{ color:t.textMuted }}>Canary deployments & gradual rollouts</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-2">
        {Object.entries(stats).map(([k,v]) => (
          <div key={k} className="rounded-xl p-2.5 text-center" style={{ background:t.card, border:`1px solid ${t.cardBorder}` }}>
            <p className="text-lg font-bold" style={{ color:k==='killed'?'#ef4444':k==='enabled'?'#22c55e':k==='canary'?'#6366f1':'#888' }}>{v}</p>
            <p className="text-[8px] capitalize" style={{ color:t.textMuted }}>{k}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(['all','enabled','canary','disabled','scheduled','killed'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className="px-3 py-1.5 rounded-lg text-[10px] font-semibold capitalize whitespace-nowrap" style={{ background:filter===f?`${t.accent}15`:t.card, color:filter===f?t.accent:t.textMuted, border:`1px solid ${filter===f?t.accent+'33':t.cardBorder}` }}>{f}</button>
        ))}
      </div>

      {/* Flag Cards */}
      <div className="space-y-2">
        {filtered.map(flag => {
          const ss = STATUS_STYLES[flag.killSwitch ? 'killed' : flag.status];
          const expanded = expandedId === flag.key;
          return (
            <div key={flag.key} className="rounded-xl overflow-hidden" style={{ background:t.card, border:`1px solid ${flag.killSwitch?'rgba(239,68,68,0.3)':t.cardBorder}` }}>
              <div className="p-3.5 cursor-pointer" onClick={() => setExpandedId(expanded?null:flag.key)}>
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ background:ss.bg, color:ss.color }}>{flag.killSwitch?'🔴 KILLED':ss.label}</span>
                      {flag.status === 'canary' && <span className="text-[9px] font-mono" style={{ color:t.accent }}>{flag.rolloutPercentage}%</span>}
                      {flag.tags.slice(0,2).map(tg => <span key={tg} className="text-[8px] px-1 py-0.5 rounded" style={{ background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)', color:t.textMuted }}>{tg}</span>)}
                    </div>
                    <h4 className="text-sm font-semibold">{flag.name}</h4>
                    <p className="text-[10px] truncate" style={{ color:t.textSecondary }}>{flag.description}</p>
                  </div>
                  {/* Rollout bar */}
                  {flag.status === 'canary' && (
                    <div className="w-16 flex flex-col items-end">
                      <div className="w-full h-2 rounded-full overflow-hidden" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.06)' }}>
                        <div className="h-full rounded-full" style={{ width:`${flag.rolloutPercentage}%`, background:`linear-gradient(90deg,#6366f1,#8b5cf6)` }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {expanded && (
                <div className="px-3.5 pb-3.5 pt-1 space-y-3" style={{ borderTop:`1px solid ${t.cardBorder}` }}>
                  {/* Metrics */}
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {[{l:'Evaluations',v:flag.metrics.evaluations},{l:'Enabled',v:flag.metrics.enabled},{l:'Disabled',v:flag.metrics.disabled},{l:'Errors',v:flag.metrics.errors}].map(m => (
                      <div key={m.l} className="p-1.5 rounded-lg" style={{ background:isDark?'rgba(255,255,255,0.02)':'rgba(0,0,0,0.01)' }}>
                        <p className="text-sm font-bold" style={{ color:m.l==='Errors'&&m.v>0?'#ef4444':'inherit' }}>{m.v}</p>
                        <p className="text-[8px]" style={{ color:t.textMuted }}>{m.l}</p>
                      </div>
                    ))}
                  </div>
                  {/* Targeting */}
                  {flag.targeting.length > 0 && (
                    <div><p className="text-[9px] font-bold mb-1" style={{ color:t.textMuted }}>TARGETING RULES</p>
                    {flag.targeting.map((r,i) => (
                      <p key={i} className="text-[10px] font-mono" style={{ color:t.textSecondary }}>{r.attribute} {r.operator} {JSON.stringify(r.value)}</p>
                    ))}</div>
                  )}
                  {/* Environments */}
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold" style={{ color:t.textMuted }}>ENV:</span>
                    {flag.environments.map(env => (
                      <span key={env} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background:env==='production'?'rgba(239,68,68,0.1)':env==='staging'?'rgba(249,115,22,0.1)':'rgba(34,197,94,0.1)', color:env==='production'?'#ef4444':env==='staging'?'#f97316':'#22c55e' }}>{env}</span>
                    ))}
                  </div>
                  {/* Rollout Slider */}
                  {flag.status === 'canary' && !flag.killSwitch && (
                    <div>
                      <p className="text-[9px] font-bold mb-1" style={{ color:t.textMuted }}>ROLLOUT: {flag.rolloutPercentage}%</p>
                      <input type="range" min={0} max={100} step={5} value={flag.rolloutPercentage} onChange={e => { setRollout(flag.key, +e.target.value); refresh(); }} className="w-full" />
                    </div>
                  )}
                  {/* Actions */}
                  <div className="flex gap-2">
                    {!flag.killSwitch && (
                      <button onClick={() => { killFlag(flag.key); refresh(); }} className="px-3 py-1.5 rounded-lg text-[10px] font-bold" style={{ background:'rgba(239,68,68,0.1)', color:'#ef4444' }}>🔴 Kill Switch</button>
                    )}
                    {flag.killSwitch && (
                      <button onClick={() => { updateFlag(flag.key, { killSwitch:false, status:'canary' }); refresh(); }} className="px-3 py-1.5 rounded-lg text-[10px] font-bold" style={{ background:'rgba(34,197,94,0.1)', color:'#22c55e' }}>🟢 Revive</button>
                    )}
                    {flag.status === 'disabled' && (
                      <button onClick={() => { updateFlag(flag.key, { status:'canary', rolloutPercentage:10, killSwitch:false }); refresh(); }} className="px-3 py-1.5 rounded-lg text-[10px] font-bold" style={{ background:'rgba(99,102,241,0.1)', color:'#6366f1' }}>🧪 Start Canary (10%)</button>
                    )}
                    {flag.status === 'canary' && flag.rolloutPercentage >= 90 && !flag.killSwitch && (
                      <button onClick={() => { updateFlag(flag.key, { status:'enabled', rolloutPercentage:100 }); refresh(); }} className="px-3 py-1.5 rounded-lg text-[10px] font-bold" style={{ background:'rgba(34,197,94,0.1)', color:'#22c55e' }}>✅ Promote to GA</button>
                    )}
                  </div>
                  <p className="text-[8px]" style={{ color:t.textMuted }}>Owner: {flag.owner} · Key: {flag.key}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
