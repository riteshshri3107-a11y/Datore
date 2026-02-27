"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';

const FEATURES = [
  { icon: '💼', title: 'JobPlace', desc: 'Post jobs or find skilled workers nearby in real-time' },
  { icon: '🗺️', title: 'Live Map', desc: 'See available workers on the map with ratings & prices' },
  { icon: '🛡️', title: 'QR Verify', desc: 'Scan QR codes to verify worker identity on arrival' },
  { icon: '🤖', title: 'AI Trust', desc: 'AI-powered trust scores for every service provider' },
  { icon: '🏪', title: 'Marketplace', desc: 'Buy & sell across 18 categories locally' },
  { icon: '💰', title: 'Escrow Pay', desc: 'Secure token payments with tip controls' },
  { icon: '👥', title: 'Community', desc: 'Join skill groups and local service networks' },
  { icon: '⭐', title: 'Reviews', desc: 'Dual rating system for trust & transparency' },
];

export default function Landing() {
  const router = useRouter();
  const { isDark, toggle } = useThemeStore();
  const t = getTheme(isDark);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <div style={{ background: t.bg, color: t.text, minHeight: '100vh' }}>
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 30% 20%, ${t.accentGlow} 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(139,92,246,0.15) 0%, transparent 50%)` }}></div>
        <div className="relative max-w-4xl mx-auto px-4 pt-8 pb-16">
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🛡️</span>
              <span className="font-bold text-2xl" style={{ background: `linear-gradient(135deg, ${t.accent}, #8b5cf6)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Datore</span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={toggle} className="glass-button px-3 py-2 rounded-xl text-sm" style={{ background: t.surface, color: t.text }}>
                {isDark ? '☀️' : '🌙'}
              </button>
              <button onClick={() => router.push('/login')} className="btn-accent text-sm rounded-xl px-5 py-2.5">Get Started</button>
            </div>
          </div>

          <div className="text-center mt-16 mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-6" style={{ background: t.accentLight, color: t.accent, border: `1px solid ${t.accentGlow}` }}>
              ✨ The Verified Safe Entry Workforce Platform
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
              Hire Trusted Workers<br />
              <span style={{ background: `linear-gradient(135deg, ${t.accent}, #a855f7, #ec4899)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>With Confidence</span>
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8" style={{ color: t.textSecondary }}>
              Post jobs, find nearby workers on the map, verify identities with QR, and pay securely with escrow tokens.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => router.push('/login')} className="btn-accent text-base rounded-2xl px-8 py-3.5">🚀 Start Hiring</button>
              <button onClick={() => router.push('/login')} className="glass-button text-base rounded-2xl px-8 py-3.5 font-medium" style={{ background: t.surface, color: t.text }}>
                💼 Find Work
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-4xl mx-auto px-4 pb-20">
        <h2 className="text-2xl font-bold text-center mb-10">Everything You Need</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {FEATURES.map((f, i) => (
            <div key={i} className={`glass-card rounded-2xl p-4 animate-slide-up stagger-${i % 6 + 1}`}
              style={{ background: t.card, borderColor: t.cardBorder, boxShadow: t.glassShadow, animationFillMode: 'both' }}>
              <span className="text-2xl mb-2 block">{f.icon}</span>
              <h3 className="font-semibold text-sm mb-1">{f.title}</h3>
              <p className="text-xs" style={{ color: t.textSecondary }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
