"use client";
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { IcoBack, IcoShield } from '@/components/Icons';

interface LoginSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
  time: string;
  current: boolean;
}

interface SecurityEvent {
  id: string;
  type: string;
  desc: string;
  time: string;
  icon: string;
  severity: 'info' | 'warning' | 'critical';
}

export default function SecurityPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);

  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'twoFactor' | 'activity'>('overview');

  // Password
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // 2FA
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorMethod, setTwoFactorMethod] = useState<'sms' | 'app' | 'email'>('sms');
  const [showSetup2FA, setShowSetup2FA] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  // Recovery
  const [recoveryEmail, setRecoveryEmail] = useState('rajesh.backup@gmail.com');
  const [trustedContacts, setTrustedContacts] = useState<string[]>(['Priya S.', 'Tom W.']);

  // Login Sessions
  const [sessions, setSessions] = useState<LoginSession[]>([
    { id: 's1', device: 'MacBook Pro', browser: 'Chrome 122', location: 'Toronto, ON', ip: '142.xx.xx.45', time: 'Active now', current: true },
    { id: 's2', device: 'iPhone 15', browser: 'Safari Mobile', location: 'Toronto, ON', ip: '142.xx.xx.89', time: '2 hours ago', current: false },
    { id: 's3', device: 'Windows PC', browser: 'Firefox 123', location: 'Raipur, India', ip: '103.xx.xx.12', time: '3 days ago', current: false },
  ]);

  // Security Events
  const [events] = useState<SecurityEvent[]>([
    { id: 'e1', type: 'login', desc: 'Successful login from Chrome on MacBook Pro', time: 'Just now', icon: '✅', severity: 'info' },
    { id: 'e2', type: 'password', desc: 'Password changed successfully', time: '2 weeks ago', icon: '🔑', severity: 'info' },
    { id: 'e3', type: 'login_attempt', desc: 'Failed login attempt from unknown IP (45.xx.xx.91)', time: '3 weeks ago', icon: '⚠️', severity: 'warning' },
    { id: 'e4', type: 'session', desc: 'New device login detected - iPhone 15 from Toronto', time: '1 month ago', icon: '📱', severity: 'info' },
    { id: 'e5', type: 'recovery', desc: 'Recovery email updated', time: '2 months ago', icon: '📧', severity: 'info' },
  ]);

  const handleChangePassword = () => {
    if (!currentPassword) { setPasswordMsg({ text: 'Please enter your current password.', ok: false }); return; }
    if (newPassword.length < 8) { setPasswordMsg({ text: 'New password must be at least 8 characters.', ok: false }); return; }
    if (newPassword !== confirmPassword) { setPasswordMsg({ text: 'Passwords do not match.', ok: false }); return; }
    if (!/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setPasswordMsg({ text: 'Password must contain at least one uppercase letter and one number.', ok: false }); return;
    }
    setPasswordMsg({ text: 'Password updated successfully! You may need to re-login on other devices.', ok: true });
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    setTimeout(() => { setPasswordMsg(null); setShowChangePassword(false); }, 3000);
  };

  const getPasswordStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { label: 'Weak', color: '#ef4444', pct: 20 };
    if (score <= 2) return { label: 'Fair', color: '#f59e0b', pct: 40 };
    if (score <= 3) return { label: 'Good', color: '#3b82f6', pct: 60 };
    if (score <= 4) return { label: 'Strong', color: '#22c55e', pct: 80 };
    return { label: 'Excellent', color: '#22c55e', pct: 100 };
  };

  const tabs = [
    { key: 'overview' as const, label: 'Overview', icon: '🛡️' },
    { key: 'sessions' as const, label: 'Sessions', icon: '💻' },
    { key: 'twoFactor' as const, label: '2FA', icon: '🔐' },
    { key: 'activity' as const, label: 'Log', icon: '📋' },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/settings')} style={{ background: 'none', border: 'none', color: t.text, cursor: 'pointer' }}>
          <IcoBack size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold">Security Hub</h1>
          <p className="text-[10px]" style={{ color: t.textMuted }}>
            Protect your account with strong security measures
          </p>
        </div>
        <IcoShield size={22} color={t.accent} />
      </div>

      {/* Security Score */}
      <div
        className="rounded-2xl p-4"
        style={{
          background: `linear-gradient(135deg, ${twoFactorEnabled ? '#22c55e' : '#f59e0b'}10, ${t.accent}08)`,
          border: `1px solid ${twoFactorEnabled ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)'}`,
        }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
            style={{ background: `${twoFactorEnabled ? '#22c55e' : '#f59e0b'}15` }}
          >
            {twoFactorEnabled ? '🛡️' : '⚠️'}
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold">
              Account Security: {twoFactorEnabled ? 'Strong' : 'Moderate'}
            </p>
            <p className="text-[10px]" style={{ color: t.textMuted }}>
              {twoFactorEnabled
                ? 'Two-factor authentication is enabled. Your account is well protected.'
                : 'Enable two-factor authentication to significantly improve your account security.'}
            </p>
          </div>
        </div>
        {!twoFactorEnabled && (
          <button
            onClick={() => { setActiveTab('twoFactor'); setShowSetup2FA(true); }}
            className="w-full py-2 rounded-xl text-xs font-bold text-white"
            style={{ background: t.accent }}
          >
            Enable 2FA Now
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-medium whitespace-nowrap transition-all"
            style={{
              background: activeTab === tab.key ? `${t.accent}18` : 'transparent',
              color: activeTab === tab.key ? t.accent : t.textSecondary,
              border: activeTab === tab.key ? `1px solid ${t.accent}40` : '1px solid transparent',
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-3">
          {/* Change Password */}
          <div className="rounded-2xl p-4" style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs font-bold">Password</p>
                <p className="text-[9px]" style={{ color: t.textMuted }}>Last changed 2 weeks ago</p>
              </div>
              <button
                onClick={() => setShowChangePassword(!showChangePassword)}
                className="text-[10px] px-3 py-1.5 rounded-lg font-medium"
                style={{ background: `${t.accent}12`, color: t.accent }}
              >
                {showChangePassword ? 'Cancel' : 'Change'}
              </button>
            </div>

            {showChangePassword && (
              <div className="space-y-3 mt-3 pt-3" style={{ borderTop: `1px solid ${t.cardBorder}` }}>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Current password"
                  className="w-full px-3 py-2 rounded-lg text-xs"
                  style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', color: t.text, border: `1px solid ${t.cardBorder}`, outline: 'none' }}
                />
                <div>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="New password (min 8 chars, 1 uppercase, 1 number)"
                    className="w-full px-3 py-2 rounded-lg text-xs"
                    style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', color: t.text, border: `1px solid ${t.cardBorder}`, outline: 'none' }}
                  />
                  {newPassword && (
                    <div className="mt-1.5">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-[9px]">Strength:</p>
                        <p className="text-[9px] font-bold" style={{ color: getPasswordStrength(newPassword).color }}>
                          {getPasswordStrength(newPassword).label}
                        </p>
                      </div>
                      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: isDark ? '#1a1a2e' : '#e5e7eb' }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${getPasswordStrength(newPassword).pct}%`, background: getPasswordStrength(newPassword).color }} />
                      </div>
                    </div>
                  )}
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-3 py-2 rounded-lg text-xs"
                  style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', color: t.text, border: `1px solid ${t.cardBorder}`, outline: 'none' }}
                />
                <button onClick={handleChangePassword} className="w-full py-2 rounded-xl text-xs font-bold text-white" style={{ background: t.accent }}>
                  Update Password
                </button>
                {passwordMsg && (
                  <p className="text-[10px] p-2 rounded-lg" style={{ background: passwordMsg.ok ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: passwordMsg.ok ? '#22c55e' : '#ef4444' }}>
                    {passwordMsg.text}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Recovery Options */}
          <div className="rounded-2xl p-4 space-y-3" style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}>
            <p className="text-xs font-bold">Recovery Options</p>
            <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
              <div>
                <p className="text-[10px]" style={{ color: t.textMuted }}>Recovery Email</p>
                <p className="text-xs font-medium">{recoveryEmail}</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-lg" style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e' }}>Active</span>
            </div>
            <div className="p-3 rounded-xl" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
              <p className="text-[10px] mb-1" style={{ color: t.textMuted }}>Trusted Recovery Contacts</p>
              <div className="flex flex-wrap gap-1">
                {trustedContacts.map(c => (
                  <span key={c} className="text-[10px] px-2 py-1 rounded-lg flex items-center gap-1" style={{ background: `${t.accent}12`, color: t.accent }}>
                    {c}
                    <button
                      onClick={() => setTrustedContacts(prev => prev.filter(x => x !== c))}
                      className="text-[8px] ml-1 opacity-60 hover:opacity-100"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Security Checklist */}
          <div className="rounded-2xl p-4 space-y-2" style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}>
            <p className="text-xs font-bold mb-1">Security Checklist</p>
            {[
              { label: 'Strong password set', done: true },
              { label: 'Recovery email configured', done: true },
              { label: 'Two-factor authentication', done: twoFactorEnabled },
              { label: 'Trusted recovery contacts', done: trustedContacts.length > 0 },
              { label: 'Review active sessions regularly', done: true },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                  style={{ background: item.done ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)', color: item.done ? '#22c55e' : '#f59e0b' }}
                >
                  {item.done ? '✓' : '!'}
                </div>
                <p className="text-[11px]" style={{ color: item.done ? t.text : t.textSecondary }}>{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SESSIONS TAB */}
      {activeTab === 'sessions' && (
        <div className="space-y-3">
          <div className="rounded-2xl p-4" style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-bold">Active Sessions</p>
                <p className="text-[9px]" style={{ color: t.textMuted }}>
                  {sessions.length} device(s) currently logged in
                </p>
              </div>
              <button
                onClick={() => setSessions(prev => prev.filter(s => s.current))}
                className="text-[10px] px-3 py-1.5 rounded-lg font-medium"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
              >
                End All Others
              </button>
            </div>

            <div className="space-y-2">
              {sessions.map(session => (
                <div
                  key={session.id}
                  className="p-3 rounded-xl flex items-start gap-3"
                  style={{
                    background: session.current
                      ? `${t.accent}08`
                      : isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    border: `1px solid ${session.current ? `${t.accent}25` : t.cardBorder}`,
                  }}
                >
                  <span className="text-xl mt-0.5">
                    {session.device.includes('iPhone') ? '📱' : session.device.includes('Mac') ? '💻' : '🖥️'}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold">{session.device}</p>
                      {session.current && (
                        <span className="text-[8px] px-1.5 py-0.5 rounded font-bold" style={{ background: '#22c55e20', color: '#22c55e' }}>
                          THIS DEVICE
                        </span>
                      )}
                    </div>
                    <p className="text-[9px]" style={{ color: t.textMuted }}>
                      {session.browser} · {session.location}
                    </p>
                    <p className="text-[9px]" style={{ color: t.textMuted }}>
                      IP: {session.ip} · {session.time}
                    </p>
                  </div>
                  {!session.current && (
                    <button
                      onClick={() => setSessions(prev => prev.filter(s => s.id !== session.id))}
                      className="text-[9px] px-2 py-1 rounded-lg shrink-0"
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
                    >
                      End
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TWO FACTOR TAB */}
      {activeTab === 'twoFactor' && (
        <div className="space-y-3">
          <div className="rounded-2xl p-4" style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-bold">Two-Factor Authentication</p>
                <p className="text-[9px]" style={{ color: t.textMuted }}>
                  Add an extra step when logging in to keep your account safe
                </p>
              </div>
              <span
                className="text-[10px] px-2 py-1 rounded-lg font-medium"
                style={{
                  background: twoFactorEnabled ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                  color: twoFactorEnabled ? '#22c55e' : '#ef4444',
                }}
              >
                {twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            {/* 2FA Method Selector */}
            <p className="text-[10px] font-medium mb-2" style={{ color: t.textMuted }}>
              Verification Method
            </p>
            <div className="space-y-2 mb-3">
              {[
                { key: 'sms' as const, label: 'SMS Code', desc: 'Receive a code via text message', icon: '📱' },
                { key: 'app' as const, label: 'Authenticator App', desc: 'Use Google Authenticator or similar', icon: '🔐' },
                { key: 'email' as const, label: 'Email Code', desc: 'Receive a code via your email', icon: '📧' },
              ].map(method => (
                <button
                  key={method.key}
                  onClick={() => setTwoFactorMethod(method.key)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl transition-all"
                  style={{
                    background: twoFactorMethod === method.key ? `${t.accent}10` : 'transparent',
                    border: `1.5px solid ${twoFactorMethod === method.key ? t.accent : t.cardBorder}`,
                  }}
                >
                  <span className="text-lg">{method.icon}</span>
                  <div className="flex-1 text-left">
                    <p className="text-xs font-medium">{method.label}</p>
                    <p className="text-[9px]" style={{ color: t.textMuted }}>{method.desc}</p>
                  </div>
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                    style={{ borderColor: twoFactorMethod === method.key ? t.accent : t.textMuted }}
                  >
                    {twoFactorMethod === method.key && (
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: t.accent }} />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Enable/Disable */}
            {!twoFactorEnabled ? (
              showSetup2FA ? (
                <div className="space-y-3 pt-3" style={{ borderTop: `1px solid ${t.cardBorder}` }}>
                  <p className="text-[10px]" style={{ color: t.textMuted }}>
                    A verification code has been sent to your {twoFactorMethod === 'sms' ? 'phone' : twoFactorMethod === 'email' ? 'email' : 'authenticator app'}. Enter it below to complete setup.
                  </p>
                  <input
                    value={verificationCode}
                    onChange={e => setVerificationCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="w-full px-3 py-3 rounded-xl text-center text-lg font-bold tracking-widest"
                    style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', color: t.text, border: `1px solid ${t.cardBorder}`, outline: 'none' }}
                  />
                  <button
                    onClick={() => {
                      if (verificationCode.length === 6) {
                        setTwoFactorEnabled(true);
                        setShowSetup2FA(false);
                        setVerificationCode('');
                      }
                    }}
                    className="w-full py-2.5 rounded-xl text-xs font-bold text-white"
                    style={{ background: verificationCode.length === 6 ? t.accent : '#9ca3af' }}
                  >
                    Verify & Enable
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowSetup2FA(true)}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-white"
                  style={{ background: t.accent }}
                >
                  Set Up Two-Factor Authentication
                </button>
              )
            ) : (
              <button
                onClick={() => setTwoFactorEnabled(false)}
                className="w-full py-2.5 rounded-xl text-xs font-medium"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
              >
                Disable Two-Factor Authentication
              </button>
            )}
          </div>

          {/* Backup Codes */}
          {twoFactorEnabled && (
            <div className="rounded-2xl p-4" style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}>
              <p className="text-xs font-bold mb-1">Backup Codes</p>
              <p className="text-[9px] mb-3" style={{ color: t.textMuted }}>
                Save these one-time codes in a safe place. Use them to log in if you lose access to your {twoFactorMethod === 'sms' ? 'phone' : 'authenticator'}.
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {['8A3F-2K7L', '9P1N-4T6M', '5X2R-8B3H', '7D4Q-1Y9S', '3C6E-5W2J', '6V8G-0F7A'].map(code => (
                  <div key={code} className="p-2 rounded-lg text-center font-mono text-[11px]" style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }}>
                    {code}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ACTIVITY LOG TAB */}
      {activeTab === 'activity' && (
        <div className="space-y-3">
          <div className="rounded-2xl p-4" style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}>
            <p className="text-xs font-bold mb-3">Security Activity Log</p>
            <div className="space-y-0">
              {events.map((event, idx) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 py-3"
                  style={{ borderTop: idx > 0 ? `1px solid ${t.cardBorder}` : 'none' }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                    style={{
                      background: event.severity === 'warning' ? 'rgba(245,158,11,0.12)' : event.severity === 'critical' ? 'rgba(239,68,68,0.12)' : `${t.accent}10`,
                    }}
                  >
                    {event.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs">{event.desc}</p>
                    <p className="text-[9px] mt-0.5" style={{ color: t.textMuted }}>{event.time}</p>
                  </div>
                  {event.severity === 'warning' && (
                    <span className="text-[8px] px-1.5 py-0.5 rounded font-bold shrink-0" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
                      ALERT
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="h-4" />
    </div>
  );
}
