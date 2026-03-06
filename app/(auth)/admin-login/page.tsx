"use client";
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { secureSignIn } from '@/lib/auth';
import { validateInput, validators } from '@/lib/security';
import { IcoShield, IcoBack } from '@/components/Icons';

/* Admin-only credentials are validated server-side via role check */
export default function AdminLoginPage() {
  const router = useRouter();
  const { isDark } = useThemeStore();
  const t = getTheme(isDark);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgCode, setOrgCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    const emailErr = validateInput(email, validators.email);
    if (emailErr) { setError(emailErr); return; }
    if (!password) { setError('Password is required'); return; }
    if (!orgCode) { setError('Organization code is required'); return; }
    setLoading(true);
    try {
      const { data, error: err } = await secureSignIn(email, password);
      if (err) throw err;
      // Store org code for admin session
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('admin_org_code', orgCode);
        sessionStorage.setItem('admin_session', 'true');
      }
      router.push('/admin');
    } catch (e: any) {
      setError(e.message || 'Invalid admin credentials');
    }
    setLoading(false);
  };

  return (
    <div style={{ background: isDark ? 'linear-gradient(180deg,#0a0a16,#0f0f1e,#121225)' : 'linear-gradient(180deg,#f8f9ff,#eef0ff)', color: t.text, minHeight: '100vh' }} className="flex items-center justify-center p-4">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(239,68,68,0.06) 0%, transparent 60%)' }} />
      <div className="relative w-full max-w-md">
        {/* Back to regular login */}
        <button onClick={() => router.push('/login')} className="flex items-center gap-2 mb-6" style={{ background:'none', border:'none', color:t.textMuted, cursor:'pointer', fontSize:13 }}>
          <IcoBack size={16} color={t.textMuted} /> Back to User Login
        </button>

        <div className="glass-card rounded-3xl p-7" style={{ background:t.card, borderColor:t.cardBorder, boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.3)' : '0 20px 60px rgba(0,0,0,0.08)' }}>
          {/* Admin header */}
          <div className="flex items-center gap-3 mb-5">
            <div style={{ width:48, height:48, borderRadius:14, background:'rgba(239,68,68,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <IcoShield size={24} color="#ef4444" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Admin Access</h2>
              <p className="text-xs" style={{ color:t.textMuted }}>Organization data analysis & reports</p>
            </div>
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="text-[10px] font-semibold uppercase tracking-wider mb-1 block" style={{ color:t.textMuted }}>Admin Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="admin@organization.com" autoComplete="email" className="glass-input w-full px-4 py-3 rounded-xl text-sm" style={{ background:t.input, color:t.text, borderColor:t.inputBorder }} />
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="text-[10px] font-semibold uppercase tracking-wider mb-1 block" style={{ color:t.textMuted }}>Password</label>
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Admin password" autoComplete="current-password" className="glass-input w-full px-4 py-3 rounded-xl text-sm" style={{ background:t.input, color:t.text, borderColor:t.inputBorder }} />
          </div>

          {/* Organization code */}
          <div className="mb-4">
            <label className="text-[10px] font-semibold uppercase tracking-wider mb-1 block" style={{ color:t.textMuted }}>Organization Code</label>
            <input value={orgCode} onChange={e => setOrgCode(e.target.value)} type="text" placeholder="ORG-XXXX-XXXX" className="glass-input w-full px-4 py-3 rounded-xl text-sm" style={{ background:t.input, color:t.text, borderColor:t.inputBorder }} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>

          {error && (
            <div className="mb-3 p-3 rounded-xl flex items-center gap-2 text-xs" style={{ background:'rgba(239,68,68,0.1)', color:'#ef4444', border:'1px solid rgba(239,68,68,0.2)' }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading} className="w-full py-3.5 rounded-xl text-sm font-semibold" style={{ background:'linear-gradient(135deg,#ef4444,#dc2626)', color:'white', border:'none', cursor:'pointer', opacity:loading?0.5:1 }}>
            {loading ? 'Authenticating...' : 'Sign In as Admin'}
          </button>

          <div className="flex items-center justify-center gap-1.5 mt-4">
            <span className="text-[9px]" style={{ color:t.textMuted }}>🔒 Admin sessions are logged and audited</span>
          </div>
        </div>
      </div>
    </div>
  );
}
