"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { useAuthStore } from '@/store/useAuthStore';
import { getTheme } from '@/lib/theme';
import { getSession, getProfile } from '@/lib/supabase';

const QUICK_ACTIONS = [
  { icon: '💼', label: 'Post Job', path: '/jobplace/create', color: '#6366f1' },
  { icon: '🗺️', label: 'Find Workers', path: '/jobplace/map', color: '#22c55e' },
  { icon: '🏪', label: 'Marketplace', path: '/marketplace', color: '#f59e0b' },
  { icon: '👥', label: 'Community', path: '/community', color: '#ec4899' },
  { icon: '💰', label: 'Wallet', path: '/wallet', color: '#8b5cf6' },
  { icon: '📋', label: 'My Jobs', path: '/jobplace', color: '#3b82f6' },
];

const TRENDING = [
  { icon: '👶', label: 'Babysitting', count: '24 available', color: '#f472b6' },
  { icon: '🧹', label: 'Cleaning', count: '18 available', color: '#22d3ee' },
  { icon: '🔧', label: 'Plumbing', count: '12 available', color: '#fb923c' },
  { icon: '📚', label: 'Tutoring', count: '31 available', color: '#818cf8' },
  { icon: '🐕', label: 'Pet Care', count: '15 available', color: '#a3e635' },
  { icon: '🚚', label: 'Moving', count: '8 available', color: '#f87171' },
];

export default function HomePage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const { setUser, setProfile, setLoading } = useAuthStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    getSession().then(async ({ data }) => {
      if (!data.session) { router.push('/login'); return; }
      setUser(data.session.user);
      const profile = await getProfile(data.session.user.id);
      if (profile) { setProfile(profile); setUserName(profile.full_name || data.session.user.email); }
      else setUserName(data.session.user.email);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Greeting */}
      <div className="glass-card rounded-2xl p-5" style={{ background: `linear-gradient(135deg, ${t.accent}22, #8b5cf622)`, borderColor: t.cardBorder, boxShadow: t.glassShadow }}>
        <p className="text-sm" style={{ color: t.textSecondary }}>Welcome back</p>
        <h1 className="text-2xl font-bold mt-1">{userName ? `👋 Hi, ${userName.split(' ')[0]}!` : '👋 Hello!'}</h1>
        <p className="text-sm mt-2" style={{ color: t.textSecondary }}>What do you need help with today?</p>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold mb-3" style={{ color: t.textSecondary }}>Quick Actions</h2>
        <div className="grid grid-cols-3 gap-2.5">
          {QUICK_ACTIONS.map((a, i) => (
            <button key={i} onClick={() => router.push(a.path)}
              className={`glass-card rounded-2xl p-3 flex flex-col items-center gap-1.5 animate-slide-up stagger-${i + 1}`}
              style={{ background: t.card, borderColor: t.cardBorder, boxShadow: t.glassShadow, animationFillMode: 'both' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: a.color + '22' }}>{a.icon}</div>
              <span className="text-xs font-medium">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Trending Services */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-semibold" style={{ color: t.textSecondary }}>Trending Services</h2>
          <button onClick={() => router.push('/jobplace/providers')} className="text-xs font-medium" style={{ color: t.accent }}>See All →</button>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {TRENDING.map((s, i) => (
            <button key={i} onClick={() => router.push(`/jobplace/providers?skill=${s.label}`)}
              className="glass-card rounded-xl p-3 flex items-center gap-3 text-left"
              style={{ background: t.card, borderColor: t.cardBorder, boxShadow: t.glassShadow }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: s.color + '22' }}>{s.icon}</div>
              <div>
                <p className="text-sm font-medium">{s.label}</p>
                <p className="text-xs" style={{ color: t.textSecondary }}>{s.count}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* CTA Banner */}
      <div className="glass-card rounded-2xl p-5 text-center" style={{ background: `linear-gradient(135deg, ${t.accent}33, #8b5cf633)`, borderColor: `${t.accent}44`, boxShadow: `0 4px 20px ${t.accentGlow}` }}>
        <p className="text-xl mb-2">🗺️</p>
        <h3 className="font-bold text-lg mb-1">Find Workers on the Map</h3>
        <p className="text-sm mb-3" style={{ color: t.textSecondary }}>See available workers near you with live ratings & prices</p>
        <button onClick={() => router.push('/jobplace/map')} className="btn-accent text-sm px-6 py-2.5 rounded-xl">Open Live Map</button>
      </div>
    </div>
  );
}
