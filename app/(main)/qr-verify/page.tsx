"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { useAuthStore } from '@/store/useAuthStore';
import { getTheme } from '@/lib/theme';
import { searchWorkers, getWorker, recordQRScan } from '@/lib/supabase';

export default function QRVerifyPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const { user } = useAuthStore();
  const [mode, setMode] = useState<'scan'|'result'|'myqr'>('scan');
  const [scannedId, setScannedId] = useState<string|null>(null);
  const [scanning, setScanning] = useState(false);
  const [workers, setWorkers] = useState<any[]>([]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    searchWorkers({ available: true }).then(data => {
      setWorkers(data || []);
      setLoading(false);
    });
  }, [user, router]);

  const simulateScan = async (id: string) => {
    setScanning(true);
    try {
      const worker = await getWorker(id);
      if (user) {
        await recordQRScan({ worker_id: id, scanner_id: user.id });
      }
      const profile = worker?.profiles || {};
      setResult({
        name: profile.name || 'Unknown Worker',
        photo: (profile.name || 'W').split(' ').map((n: string) => n[0]).join(''),
        rating: profile.rating || 0,
        completedJobs: profile.review_count || 0,
        policeVerified: profile.verified || false,
        backgroundCheck: profile.verified ? 'Clear' : 'Pending',
        trustScore: Math.round((profile.rating || 0) * 20),
        behaviorBadge: (profile.rating || 0) >= 4.5 ? 'Excellent' : (profile.rating || 0) >= 4 ? 'Very Good' : 'Good',
        safetyLevel: (profile.rating || 0) >= 4 ? 'High' : (profile.rating || 0) >= 3 ? 'Medium' : 'Low',
        reviewSummary: `Based on ${profile.review_count || 0} reviews. Skills: ${(worker?.skills || []).join(', ') || 'General'}`,
        joined: 'Member',
      });
      setScannedId(id);
      setMode('result');
    } catch (err) {
      console.error('QR scan error:', err);
    }
    setScanning(false);
  };

  const safetyColors: Record<string,string> = { High:'#22c55e', Medium:'#f59e0b', Low:'#ef4444' };
  const badgeColors: Record<string,string> = { Excellent:'#22c55e', 'Very Good':'#3b82f6', Good:'#f59e0b' };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: t.accent, borderTopColor: 'transparent' }} /></div>;

  return (
    <div className="space-y-4 animate-fade-in ">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-lg">{'<-'}</button>
        <h1 className="text-xl font-bold">QR Verification</h1>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-2">
        <button onClick={() => { setMode('scan'); setScannedId(null); setResult(null); }} className="flex-1 py-2.5 rounded-xl text-xs font-medium" style={{ background:mode==='scan'?t.accentLight:'transparent', color:mode==='scan'?t.accent:t.textSecondary }}>Scan Worker QR</button>
        <button onClick={() => setMode('myqr')} className="flex-1 py-2.5 rounded-xl text-xs font-medium" style={{ background:mode==='myqr'?t.accentLight:'transparent', color:mode==='myqr'?t.accent:t.textSecondary }}>My QR Code</button>
      </div>

      {mode === 'scan' && (
        <div className="space-y-4">
          {/* Camera viewfinder */}
          <div className="glass-card rounded-2xl overflow-hidden" style={{ background:t.card, borderColor:t.cardBorder }}>
            <div className="h-64 flex flex-col items-center justify-center relative" style={{ background:'#000' }}>
              {scanning ? (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full border-4 border-white border-t-transparent animate-spin mx-auto mb-4"></div>
                  <p className="text-white text-sm">Scanning QR code...</p>
                </div>
              ) : (
                <>
                  <div className="w-48 h-48 border-2 border-white rounded-xl relative">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 rounded-tl-lg" style={{ borderColor:t.accent }}></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 rounded-tr-lg" style={{ borderColor:t.accent }}></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 rounded-bl-lg" style={{ borderColor:t.accent }}></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 rounded-br-lg" style={{ borderColor:t.accent }}></div>
                    <div className="absolute inset-0 flex items-center justify-center"><p className="text-white text-xs text-center px-4 opacity-60">Point camera at worker's QR code</p></div>
                  </div>
                  <p className="text-white text-[10px] mt-3 opacity-50">Camera access simulated</p>
                </>
              )}
            </div>
          </div>

          {/* Workers to scan */}
          <div className="glass-card rounded-2xl p-4" style={{ background:t.card, borderColor:t.cardBorder }}>
            <p className="text-xs font-semibold mb-3" style={{ color:t.textMuted }}>Available Workers -- Tap to simulate scan</p>
            <div className="grid grid-cols-2 gap-2">
              {workers.slice(0, 6).map((w: any) => (
                <button key={w.id} onClick={() => simulateScan(w.id)} className="p-3 rounded-xl text-left flex items-center gap-2" style={{ background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.02)', border:`1px solid ${t.cardBorder}` }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold" style={{ background:`${t.accent}22`, color:t.accent }}>{(w.profiles?.name || 'W').split(' ').map((n: string) => n[0]).join('')}</div>
                  <div><p className="text-xs font-medium">{w.profiles?.name || 'Worker'}</p><p className="text-[10px]" style={{ color:t.textMuted }}>{(w.skills || [])[0] || 'General'}</p></div>
                </button>
              ))}
            </div>
            {workers.length === 0 && <p className="text-xs text-center py-4" style={{ color: t.textMuted }}>No workers available</p>}
          </div>
        </div>
      )}

      {mode === 'result' && result && (
        <div className="space-y-3">
          {/* Verification Result Card */}
          <div className="glass-card rounded-2xl overflow-hidden" style={{ background:t.card, borderColor:t.cardBorder }}>
            {/* Safety banner */}
            <div className="p-4 text-center" style={{ background:`${safetyColors[result.safetyLevel]}15` }}>
              <p className="text-3xl mb-1">{result.safetyLevel === 'High' ? 'VERIFIED' : 'REVIEW'}</p>
              <p className="text-sm font-bold" style={{ color:safetyColors[result.safetyLevel] }}>Safety Level: {result.safetyLevel}</p>
            </div>

            {/* Profile info */}
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold" style={{ background:`linear-gradient(135deg,${t.accent}33,#8b5cf633)`, color:t.accent }}>{result.photo}</div>
                <div>
                  <h2 className="text-lg font-bold">{result.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-semibold" style={{ color:'#f59e0b' }}>Rating: {result.rating}</span>
                    <span className="text-[10px]" style={{ color:t.textMuted }}>({result.completedJobs} jobs)</span>
                  </div>
                </div>
              </div>

              {/* Verification badges */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl text-center" style={{ background:result.policeVerified?'rgba(34,197,94,0.1)':'rgba(239,68,68,0.1)', border:`1px solid ${result.policeVerified?'#22c55e33':'#ef444433'}` }}>
                  <p className="text-lg mb-1">{result.policeVerified ? 'Shield' : '?'}</p>
                  <p className="text-[10px] font-semibold" style={{ color:result.policeVerified?'#22c55e':'#ef4444' }}>Police {result.policeVerified?'Verified':'Not Verified'}</p>
                </div>
                <div className="p-3 rounded-xl text-center" style={{ background:result.backgroundCheck==='Clear'?'rgba(34,197,94,0.1)':'rgba(249,115,22,0.1)', border:`1px solid ${result.backgroundCheck==='Clear'?'#22c55e33':'#f9731633'}` }}>
                  <p className="text-lg mb-1">{result.backgroundCheck==='Clear' ? 'Check' : 'Clock'}</p>
                  <p className="text-[10px] font-semibold" style={{ color:result.backgroundCheck==='Clear'?'#22c55e':'#f97316' }}>Background: {result.backgroundCheck}</p>
                </div>
              </div>

              {/* Scores */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1"><span style={{ color:t.textMuted }}>Trust Score</span><span className="font-bold" style={{ color:t.accent }}>{result.trustScore}/100</span></div>
                  <div className="h-2.5 rounded-full overflow-hidden" style={{ background:isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.06)' }}>
                    <div className="h-full rounded-full" style={{ width:`${result.trustScore}%`, background:`linear-gradient(90deg,${t.accent},#8b5cf6)` }}></div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 p-2.5 rounded-xl text-center" style={{ background:`${badgeColors[result.behaviorBadge]}11`, border:`1px solid ${badgeColors[result.behaviorBadge]}33` }}>
                    <p className="text-[10px]" style={{ color:t.textMuted }}>AI Behavior</p>
                    <p className="text-xs font-bold" style={{ color:badgeColors[result.behaviorBadge] }}>{result.behaviorBadge}</p>
                  </div>
                  <div className="flex-1 p-2.5 rounded-xl text-center" style={{ background:`${safetyColors[result.safetyLevel]}11`, border:`1px solid ${safetyColors[result.safetyLevel]}33` }}>
                    <p className="text-[10px]" style={{ color:t.textMuted }}>Safety</p>
                    <p className="text-xs font-bold" style={{ color:safetyColors[result.safetyLevel] }}>{result.safetyLevel}</p>
                  </div>
                </div>
              </div>

              {/* Review Summary */}
              <div className="p-3 rounded-xl" style={{ background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.02)', border:`1px solid ${t.cardBorder}` }}>
                <p className="text-[10px] font-semibold mb-1" style={{ color:t.textMuted }}>REVIEW SUMMARY</p>
                <p className="text-xs" style={{ color:t.textSecondary }}>{result.reviewSummary}</p>
              </div>

              <p className="text-[10px] text-center" style={{ color:t.textMuted }}>{result.joined} - Verified at {new Date().toLocaleTimeString()}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => router.push(`/worker/${scannedId}`)} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white" style={{ background:`linear-gradient(135deg,${t.accent},#8b5cf6)` }}>View Full Profile</button>
            <button onClick={() => { setMode('scan'); setScannedId(null); setResult(null); }} className="flex-1 py-3 rounded-xl text-sm font-semibold" style={{ background:t.surface, color:t.text, border:`1px solid ${t.cardBorder}` }}>Scan Another</button>
          </div>
        </div>
      )}

      {mode === 'myqr' && (
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-6 text-center" style={{ background:t.card, borderColor:t.cardBorder }}>
            <div className="w-48 h-48 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background:'white', border:'4px solid #000' }}>
              {/* Simulated QR code pattern */}
              <div className="w-36 h-36 grid grid-cols-8 grid-rows-8 gap-[2px]">
                {Array.from({length:64}).map((_,i) => (
                  <div key={i} className="rounded-[1px]" style={{ background: [0,1,2,5,6,7,8,15,16,23,24,31,32,39,40,47,48,55,56,57,58,61,62,63].includes(i) || Math.random()>0.5 ? '#000':'white' }}></div>
                ))}
              </div>
            </div>
            <h3 className="font-bold text-lg">Your Datore QR Code</h3>
            <p className="text-xs mt-1" style={{ color:t.textMuted }}>Show this to job posters for identity verification</p>
            <p className="text-[10px] mt-2 px-4 py-1.5 rounded-full inline-block" style={{ background:t.accentLight, color:t.accent }}>Encrypted Token - Refreshes every 5 minutes</p>
          </div>
          <div className="glass-card rounded-xl p-4" style={{ background:t.card, borderColor:t.cardBorder }}>
            <p className="text-xs font-semibold mb-2">When scanned, posters will see:</p>
            <div className="space-y-1.5">
              {['Profile Photo & Name','Rating & Review Summary','Police Verification Status','Background Check Badge','AI Behavior Score','Trust Score (0-100)','Safety Level Indicator','Completed Jobs Count'].map(item => (
                <p key={item} className="text-xs flex items-center gap-2" style={{ color:t.textSecondary }}>
                  <span style={{ color:'#22c55e' }}>OK</span> {item}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
