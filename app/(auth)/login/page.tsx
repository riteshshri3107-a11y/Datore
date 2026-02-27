"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { signInWithGoogle, signInWithEmail, signUpWithEmail, getSession } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const { isDark, toggle } = useThemeStore();
  const t = getTheme(isDark);
  const [mode, setMode] = useState<'login'|'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getSession().then(({ data }) => { if (data.session) router.push('/home'); });
  }, []);

  const handleSubmit = async () => {
    setError(''); setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await signInWithEmail(email, password);
        if (error) throw error;
      } else {
        if (!name) { setError('Name is required'); setLoading(false); return; }
        const { error } = await signUpWithEmail(email, password, name);
        if (error) throw error;
      }
      router.push('/home');
    } catch (e: any) { setError(e.message || 'Something went wrong'); }
    setLoading(false);
  };

  return (
    <div style={{ background: t.bg, color: t.text, minHeight: '100vh' }} className="flex items-center justify-center p-4">
      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 30%, ${t.accentGlow} 0%, transparent 60%)` }}></div>
      <div className="relative w-full max-w-md">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
            <span className="text-2xl">🛡️</span>
            <span className="font-bold text-xl" style={{ background: `linear-gradient(135deg, ${t.accent}, #8b5cf6)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Datore</span>
          </div>
          <button onClick={toggle} className="glass-button p-2 rounded-xl" style={{ background: t.surface }}>{isDark ? '☀️' : '🌙'}</button>
        </div>

        <div className="glass-card rounded-3xl p-6" style={{ background: t.card, borderColor: t.cardBorder, boxShadow: t.shadow }}>
          <h2 className="text-2xl font-bold mb-1">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="text-sm mb-6" style={{ color: t.textSecondary }}>{mode === 'login' ? 'Sign in to your account' : 'Join the verified marketplace'}</p>

          <button onClick={() => signInWithGoogle()} className="w-full glass-button flex items-center justify-center gap-2 py-3 rounded-xl mb-4 font-medium text-sm"
            style={{ background: t.surface, color: t.text, borderColor: t.cardBorder }}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 my-4"><div className="flex-1 h-px" style={{ background: t.cardBorder }}></div><span className="text-xs" style={{ color: t.textMuted }}>or</span><div className="flex-1 h-px" style={{ background: t.cardBorder }}></div></div>

          {mode === 'signup' && <input value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" className="glass-input w-full px-4 py-3 rounded-xl mb-3 text-sm" style={{ background: t.input, color: t.text, borderColor: t.inputBorder }} />}
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email" className="glass-input w-full px-4 py-3 rounded-xl mb-3 text-sm" style={{ background: t.input, color: t.text, borderColor: t.inputBorder }} />
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" className="glass-input w-full px-4 py-3 rounded-xl mb-4 text-sm" style={{ background: t.input, color: t.text, borderColor: t.inputBorder }}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()} />

          {error && <p className="text-xs mb-3" style={{ color: t.danger }}>⚠️ {error}</p>}

          <button onClick={handleSubmit} disabled={loading} className="btn-accent w-full py-3 rounded-xl text-sm">
            {loading ? '...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          <p className="text-center text-sm mt-4" style={{ color: t.textSecondary }}>
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="font-semibold" style={{ color: t.accent }}>{mode === 'login' ? 'Sign Up' : 'Sign In'}</button>
          </p>
        </div>
      </div>
    </div>
  );
}
