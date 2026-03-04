"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { useAuthStore } from '@/store/useAuthStore';
import { getTheme } from '@/lib/theme';
import { searchWorkers } from '@/lib/supabase';

export default function SafetyPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const { user } = useAuthStore();
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    searchWorkers({ available: true }).then(data => {
      setWorkers(data || []);
      setLoading(false);
    });
  }, [user, router]);

  const verified = workers.filter((w: any) => w.profiles?.verified);
  const avgTrust = workers.length > 0
    ? Math.round(workers.reduce((a: number, w: any) => a + (w.profiles?.rating || 0), 0) / workers.length * 20)
    : 0;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: t.accent, borderTopColor: 'transparent' }} /></div>;

  return (
    <div className="space-y-4 animate-fade-in ">
      <div className="flex items-center gap-3"><button onClick={() => router.back()} className="text-lg">{'<-'}</button><h1 className="text-xl font-bold">Safety Center</h1></div>

      {/* Safety Score Overview */}
      <div className="glass-card rounded-2xl p-5 text-center" style={{ background:`linear-gradient(135deg,rgba(34,197,94,0.08),rgba(59,130,246,0.08))`, borderColor:t.cardBorder }}>
        <p className="text-4xl font-bold" style={{ color:'#22c55e' }}>{avgTrust}</p>
        <p className="text-sm font-medium mt-1">Platform Average Trust Score</p>
        <p className="text-xs mt-1" style={{ color:t.textMuted }}>{verified.length}/{workers.length} workers are verified</p>
      </div>

      {/* Safety Features */}
      <div className="glass-card rounded-2xl p-4 space-y-3" style={{ background:t.card, borderColor:t.cardBorder }}>
        <h3 className="font-semibold text-sm">How Datore Keeps You Safe</h3>
        {[
          { title:'QR Identity Verification', desc:'Scan worker QR to see full verification before allowing entry', action:() => router.push('/qr-verify'), badge:'Active' },
          { title:'Police Verification', desc:'Workers can submit police checks. Verified badge displayed on profile', badge:`${verified.length} Verified` },
          { title:'Background Checks', desc:'Criminal background check integration for all workers', badge:'Enabled' },
          { title:'AI Behavior Scoring', desc:'AI analyzes reviews, communication tone, and reliability metrics', badge:'Active' },
          { title:'Escrow Payments', desc:'Money held securely until job completion and confirmation', badge:'Protected' },
          { title:'Live Photo Verification', desc:'Workers verify identity with a live selfie before arrival', badge:'Coming Soon' },
        ].map((f, i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background:isDark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.02)' }} onClick={f.action}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background:'rgba(34,197,94,0.12)', color:'#22c55e' }}>{i+1}</div>
            <div className="flex-1">
              <p className="text-sm font-medium">{f.title}</p>
              <p className="text-[10px]" style={{ color:t.textMuted }}>{f.desc}</p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background:'rgba(34,197,94,0.1)', color:'#22c55e' }}>{f.badge}</span>
          </div>
        ))}
      </div>

      {/* AI Trust Score Breakdown */}
      <div className="glass-card rounded-2xl p-4" style={{ background:t.card, borderColor:t.cardBorder }}>
        <h3 className="font-semibold text-sm mb-3">AI Trust Score Formula</h3>
        {[
          { label:'Reviews & Ratings', weight:40, color:'#f59e0b' },
          { label:'Job Completion Rate', weight:15, color:'#22c55e' },
          { label:'Low Complaints', weight:15, color:'#3b82f6' },
          { label:'Chat Sentiment', weight:10, color:'#8b5cf6' },
          { label:'On-time Delivery', weight:10, color:'#06b6d4' },
          { label:'Verification Status', weight:10, color:'#ec4899' },
        ].map(item => (
          <div key={item.label} className="mb-2.5">
            <div className="flex justify-between text-xs mb-1"><span style={{ color:t.textSecondary }}>{item.label}</span><span className="font-bold">{item.weight}%</span></div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)' }}>
              <div className="h-full rounded-full" style={{ width:`${item.weight}%`, background:item.color }}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Verified Workers */}
      <div className="glass-card rounded-2xl p-4" style={{ background:t.card, borderColor:t.cardBorder }}>
        <h3 className="font-semibold text-sm mb-3">Verified Workers</h3>
        <div className="space-y-2">
          {verified.length === 0 && <p className="text-xs text-center py-4" style={{ color: t.textMuted }}>No verified workers found</p>}
          {verified.map((w: any) => (
            <div key={w.id} onClick={() => router.push(`/worker/${w.id}`)} className="flex items-center gap-3 p-2 rounded-xl cursor-pointer" style={{ background:isDark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.02)' }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background:`${t.accent}22`, color:t.accent }}>{(w.profiles?.name || 'W').split(' ').map((n: string) => n[0]).join('')}</div>
              <div className="flex-1"><p className="text-sm font-medium">{w.profiles?.name || 'Worker'}</p><p className="text-[10px]" style={{ color:t.textMuted }}>Rating: {w.profiles?.rating || 'N/A'} - {(w.skills || []).join(', ') || 'General'}</p></div>
              <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background:'rgba(34,197,94,0.1)', color:'#22c55e' }}>Verified</span>
            </div>
          ))}
        </div>
      </div>

      <button onClick={() => router.push('/qr-verify')} className="w-full py-3 rounded-xl text-sm font-semibold text-white" style={{ background:`linear-gradient(135deg,${t.accent},#8b5cf6)` }}>Scan QR to Verify a Worker</button>
    </div>
  );
}
