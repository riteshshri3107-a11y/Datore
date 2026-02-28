"use client";
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { DEMO_WORKERS } from '@/lib/demoData';

export default function ComparePage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 3 ? [...prev, id] : prev);
  };

  const workers = DEMO_WORKERS.filter(w => selected.includes(w.id));

  const metrics = [
    { label:'Rating', key:'rating' as const, format:(v:number) => `${v} / 5.0` },
    { label:'Trust Score', key:'trust_score' as const, format:(v:number) => `${v} / 100` },
    { label:'Hourly Rate', key:'hourly_rate' as const, format:(v:number) => `$${v}/hr` },
    { label:'Fixed Rate', key:'fixed_rate' as const, format:(v:number) => `$${v}` },
    { label:'Jobs Done', key:'completed_jobs' as const, format:(v:number) => `${v}` },
    { label:'Reviews', key:'review_count' as const, format:(v:number) => `${v}` },
    { label:'Experience', key:'experience_years' as const, format:(v:number) => `${v} years` },
  ];

  return (
    <div className="space-y-4 animate-fade-in ">
      <div className="flex items-center gap-3"><button onClick={() => router.back()} className="text-lg">{'<-'}</button><h1 className="text-xl font-bold">Compare Workers</h1></div>

      {selected.length < 2 && (
        <div className="glass-card rounded-2xl p-4" style={{ background:t.card, borderColor:t.cardBorder }}>
          <p className="text-sm font-medium mb-3">Select 2-3 workers to compare ({selected.length}/3)</p>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_WORKERS.map(w => (
              <button key={w.id} onClick={() => toggle(w.id)}
                className="p-3 rounded-xl text-left flex items-center gap-2"
                style={{ background:selected.includes(w.id)?t.accentLight:(isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.02)'), border:`1px solid ${selected.includes(w.id)?t.accent+'55':t.cardBorder}` }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold" style={{ background:`${t.accent}22`, color:t.accent }}>{w.full_name.split(' ').map(n=>n[0]).join('')}</div>
                <div><p className="text-xs font-medium">{w.full_name}</p><p className="text-[10px]" style={{ color:t.textMuted }}>{w.skills[0]}</p></div>
                {selected.includes(w.id) && <span className="ml-auto text-xs font-bold" style={{ color:t.accent }}>OK</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {selected.length >= 2 && (
        <div className="space-y-3">
          {/* Worker headers */}
          <div className="glass-card rounded-2xl p-4" style={{ background:t.card, borderColor:t.cardBorder }}>
            <div className="flex gap-2">
              {workers.map(w => (
                <div key={w.id} className="flex-1 text-center p-3 rounded-xl" style={{ background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.02)' }}>
                  <div className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center text-sm font-bold mb-2" style={{ background:`linear-gradient(135deg,${t.accent}33,#8b5cf633)`, color:t.accent }}>{w.full_name.split(' ').map(n=>n[0]).join('')}</div>
                  <p className="text-xs font-bold">{w.full_name}</p>
                  <p className="text-[10px]" style={{ color:t.textMuted }}>{w.skills.join(', ')}</p>
                  <p className="text-[10px]" style={{ color:t.textMuted }}>{w.city}</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    {w.is_police_verified && <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background:'rgba(34,197,94,0.1)', color:'#22c55e' }}>Verified</span>}
                    <span className="text-[9px] px-1.5 py-0.5 rounded capitalize" style={{ background: w.availability==='available'?'rgba(34,197,94,0.1)':'rgba(249,115,22,0.1)', color:w.availability==='available'?'#22c55e':'#f97316' }}>{w.availability}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comparison table */}
          <div className="glass-card rounded-2xl overflow-hidden" style={{ background:t.card, borderColor:t.cardBorder }}>
            {metrics.map((m, i) => {
              const values = workers.map(w => w[m.key]);
              const best = m.key === 'hourly_rate' ? Math.min(...values) : Math.max(...values);
              return (
                <div key={m.label} className="flex items-center" style={{ borderBottom:i<metrics.length-1?`1px solid ${t.cardBorder}`:'none' }}>
                  <div className="w-28 px-3 py-3 text-xs font-medium shrink-0" style={{ color:t.textMuted, background:isDark?'rgba(255,255,255,0.02)':'rgba(0,0,0,0.02)' }}>{m.label}</div>
                  {workers.map(w => {
                    const val = w[m.key];
                    const isBest = val === best;
                    return (
                      <div key={w.id} className="flex-1 px-3 py-3 text-center text-xs font-medium" style={{ color:isBest?t.accent:t.text, fontWeight:isBest?700:400 }}>
                        {m.format(val)} {isBest ? ' *' : ''}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {workers.map(w => (
              <button key={w.id} onClick={() => router.push(`/worker/${w.id}`)} className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white" style={{ background:`linear-gradient(135deg,${t.accent},#8b5cf6)` }}>Hire {w.full_name.split(' ')[0]}</button>
            ))}
          </div>
          <button onClick={() => setSelected([])} className="w-full py-2 rounded-xl text-xs" style={{ color:t.textMuted }}>Start over</button>
        </div>
      )}
    </div>
  );
}
