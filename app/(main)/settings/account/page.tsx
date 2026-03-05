"use client";
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { IcoBack, IcoUser, IcoEdit, IcoShield, IcoCheck } from '@/components/Icons';

interface PersonalInfo {
  fullName: string;
  displayName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  city: string;
  country: string;
  language: string;
}

interface LinkedAccount {
  id: string;
  provider: string;
  icon: string;
  email: string;
  connected: boolean;
  connectedDate?: string;
}

export default function AccountCenterPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);

  const [activeSection, setActiveSection] = useState<'personal' | 'linked' | 'identity' | 'deactivate'>('personal');
  const [editingField, setEditingField] = useState<string | null>(null);

  const [info, setInfo] = useState<PersonalInfo>({
    fullName: 'Rajesh Srivastava',
    displayName: 'Rajesh S.',
    email: 'rajesh@aarnait.com',
    phone: '+1 (647) 555-0187',
    dateOfBirth: '1988-06-15',
    gender: 'Male',
    city: 'Toronto, ON',
    country: 'Canada',
    language: 'English',
  });

  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([
    { id: 'g1', provider: 'Google', icon: '🔵', email: 'rajesh@gmail.com', connected: true, connectedDate: 'Jan 2025' },
    { id: 'a1', provider: 'Apple', icon: '🍎', email: '', connected: false },
    { id: 'p1', provider: 'Phone Number', icon: '📱', email: '+1 (647) 555-0187', connected: true, connectedDate: 'Feb 2025' },
  ]);

  const [identityVerification, setIdentityVerification] = useState({
    emailVerified: true,
    phoneVerified: true,
    govIdVerified: false,
    policeCheck: false,
    addressVerified: true,
  });

  const [tempValue, setTempValue] = useState('');

  const updateField = (field: keyof PersonalInfo, value: string) => {
    setInfo(prev => ({ ...prev, [field]: value }));
    setEditingField(null);
  };

  const sections = [
    { key: 'personal' as const, label: 'Personal Info', icon: '👤' },
    { key: 'linked' as const, label: 'Linked Accounts', icon: '🔗' },
    { key: 'identity' as const, label: 'Identity', icon: '🛡️' },
    { key: 'deactivate' as const, label: 'Account Actions', icon: '⚠️' },
  ];

  const personalFields: { key: keyof PersonalInfo; label: string; icon: string; editable: boolean }[] = [
    { key: 'fullName', label: 'Full Name', icon: '👤', editable: true },
    { key: 'displayName', label: 'Display Name', icon: '✏️', editable: true },
    { key: 'email', label: 'Email Address', icon: '📧', editable: true },
    { key: 'phone', label: 'Phone Number', icon: '📱', editable: true },
    { key: 'dateOfBirth', label: 'Date of Birth', icon: '🎂', editable: false },
    { key: 'gender', label: 'Gender', icon: '⚧', editable: true },
    { key: 'city', label: 'City', icon: '📍', editable: true },
    { key: 'country', label: 'Country', icon: '🌍', editable: false },
    { key: 'language', label: 'Language', icon: '🌐', editable: true },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/settings')} style={{ background: 'none', border: 'none', color: t.text, cursor: 'pointer' }}>
          <IcoBack size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold">Account Center</h1>
          <p className="text-[10px]" style={{ color: t.textMuted }}>
            Manage your personal information and connected services
          </p>
        </div>
      </div>

      {/* Profile Summary */}
      <div
        className="rounded-2xl p-4 flex items-center gap-4"
        style={{
          background: `linear-gradient(135deg, ${t.accent}12, ${t.accent}06)`,
          border: `1px solid ${t.accent}20`,
        }}
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white shrink-0"
          style={{ background: `linear-gradient(135deg, ${t.accent}, #8b5cf6)` }}
        >
          RS
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold">{info.fullName}</p>
          <p className="text-[10px]" style={{ color: t.textMuted }}>{info.email}</p>
          <p className="text-[9px]" style={{ color: t.textMuted }}>Member since January 2025</p>
        </div>
        <button
          onClick={() => router.push('/profile/edit')}
          className="px-3 py-1.5 rounded-lg text-[10px] font-semibold shrink-0"
          style={{ background: `${t.accent}15`, color: t.accent }}
        >
          Edit
        </button>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {sections.map(sec => (
          <button
            key={sec.key}
            onClick={() => setActiveSection(sec.key)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-medium whitespace-nowrap transition-all"
            style={{
              background: activeSection === sec.key ? `${t.accent}18` : 'transparent',
              color: activeSection === sec.key ? t.accent : t.textSecondary,
              border: activeSection === sec.key ? `1px solid ${t.accent}40` : '1px solid transparent',
            }}
          >
            <span>{sec.icon}</span>
            {sec.label}
          </button>
        ))}
      </div>

      {/* PERSONAL INFO */}
      {activeSection === 'personal' && (
        <div className="rounded-2xl overflow-hidden" style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}>
          {personalFields.map((field, idx) => (
            <div
              key={field.key}
              className="p-4 flex items-center gap-3"
              style={{ borderBottom: idx < personalFields.length - 1 ? `1px solid ${t.cardBorder}` : 'none' }}
            >
              <span className="text-sm shrink-0">{field.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px]" style={{ color: t.textMuted }}>{field.label}</p>
                {editingField === field.key ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      value={tempValue}
                      onChange={e => setTempValue(e.target.value)}
                      className="flex-1 px-2 py-1 rounded-lg text-xs"
                      style={{
                        background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                        color: t.text,
                        border: `1px solid ${t.accent}50`,
                        outline: 'none',
                      }}
                      autoFocus
                    />
                    <button
                      onClick={() => updateField(field.key, tempValue)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: `${t.accent}20` }}
                    >
                      <IcoCheck size={14} color={t.accent} />
                    </button>
                  </div>
                ) : (
                  <p className="text-xs font-medium">{info[field.key]}</p>
                )}
              </div>
              {field.editable && editingField !== field.key && (
                <button
                  onClick={() => {
                    setEditingField(field.key);
                    setTempValue(info[field.key]);
                  }}
                  className="shrink-0"
                >
                  <IcoEdit size={14} color={t.textMuted} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* LINKED ACCOUNTS */}
      {activeSection === 'linked' && (
        <div className="space-y-3">
          <div className="rounded-2xl p-4" style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}>
            <p className="text-xs font-bold mb-1">Connected Services</p>
            <p className="text-[10px] mb-3" style={{ color: t.textMuted }}>
              Link external accounts for faster login and cross-platform access.
            </p>
            <div className="space-y-2">
              {linkedAccounts.map(acc => (
                <div
                  key={acc.id}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{
                    background: acc.connected
                      ? isDark ? 'rgba(34,197,94,0.05)' : 'rgba(34,197,94,0.04)'
                      : isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    border: `1px solid ${acc.connected ? 'rgba(34,197,94,0.15)' : t.cardBorder}`,
                  }}
                >
                  <span className="text-xl">{acc.icon}</span>
                  <div className="flex-1">
                    <p className="text-xs font-medium">{acc.provider}</p>
                    {acc.connected && (
                      <p className="text-[9px]" style={{ color: t.textMuted }}>
                        {acc.email} · Connected {acc.connectedDate}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() =>
                      setLinkedAccounts(prev =>
                        prev.map(a => a.id === acc.id ? { ...a, connected: !a.connected, connectedDate: a.connected ? undefined : 'Just now' } : a)
                      )
                    }
                    className="text-[10px] px-3 py-1.5 rounded-lg font-medium"
                    style={{
                      background: acc.connected ? 'rgba(239,68,68,0.1)' : `${t.accent}12`,
                      color: acc.connected ? '#ef4444' : t.accent,
                    }}
                  >
                    {acc.connected ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* IDENTITY VERIFICATION */}
      {activeSection === 'identity' && (
        <div className="space-y-3">
          <div className="rounded-2xl p-4" style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}>
            <p className="text-xs font-bold mb-1">Verification Status</p>
            <p className="text-[10px] mb-3" style={{ color: t.textMuted }}>
              Complete more verifications to boost your trust score and unlock premium features.
            </p>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] font-medium">Verification Progress</p>
                <p className="text-[10px] font-bold" style={{ color: t.accent }}>
                  {Object.values(identityVerification).filter(Boolean).length}/{Object.keys(identityVerification).length} complete
                </p>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: isDark ? '#1a1a2e' : '#e5e7eb' }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(Object.values(identityVerification).filter(Boolean).length / Object.keys(identityVerification).length) * 100}%`,
                    background: `linear-gradient(90deg, ${t.accent}, #22c55e)`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              {[
                { key: 'emailVerified' as const, label: 'Email Address', desc: 'Verify your email to recover account access', icon: '📧' },
                { key: 'phoneVerified' as const, label: 'Phone Number', desc: 'Add an extra layer of security with SMS verification', icon: '📱' },
                { key: 'govIdVerified' as const, label: 'Government ID', desc: 'Upload a valid government-issued photo ID', icon: '🪪' },
                { key: 'policeCheck' as const, label: 'Background Check', desc: 'Complete a police clearance for worker roles', icon: '🛡️' },
                { key: 'addressVerified' as const, label: 'Address Verification', desc: 'Confirm your residential address via mail or utility bill', icon: '🏠' },
              ].map(item => (
                <div
                  key={item.key}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{
                    background: identityVerification[item.key]
                      ? 'rgba(34,197,94,0.06)'
                      : isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    border: `1px solid ${identityVerification[item.key] ? 'rgba(34,197,94,0.15)' : t.cardBorder}`,
                  }}
                >
                  <span className="text-lg">{item.icon}</span>
                  <div className="flex-1">
                    <p className="text-xs font-medium">{item.label}</p>
                    <p className="text-[9px]" style={{ color: t.textMuted }}>{item.desc}</p>
                  </div>
                  {identityVerification[item.key] ? (
                    <span className="text-[10px] px-2 py-1 rounded-lg font-medium" style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e' }}>
                      Verified
                    </span>
                  ) : (
                    <button
                      onClick={() =>
                        setIdentityVerification(prev => ({ ...prev, [item.key]: true }))
                      }
                      className="text-[10px] px-3 py-1.5 rounded-lg font-medium"
                      style={{ background: `${t.accent}12`, color: t.accent }}
                    >
                      Verify
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Trust Score */}
          <div
            className="rounded-2xl p-4"
            style={{ background: `linear-gradient(135deg, #22c55e10, ${t.accent}08)`, border: '1px solid rgba(34,197,94,0.15)' }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold">Your Trust Score</p>
              <p className="text-lg font-bold" style={{ color: '#22c55e' }}>87</p>
            </div>
            <p className="text-[9px]" style={{ color: t.textMuted }}>
              Trust score is calculated from your verification level, reviews, and platform activity. Complete government ID and background check to reach 95+.
            </p>
          </div>
        </div>
      )}

      {/* DEACTIVATE / ACCOUNT ACTIONS */}
      {activeSection === 'deactivate' && (
        <div className="space-y-3">
          <div className="rounded-2xl p-4 space-y-3" style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}>
            <p className="text-xs font-bold">Account Management</p>

            <button
              className="w-full p-3 rounded-xl text-left flex items-center gap-3"
              style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}
            >
              <span className="text-lg">⏸️</span>
              <div className="flex-1">
                <p className="text-xs font-semibold" style={{ color: '#f59e0b' }}>Pause Account</p>
                <p className="text-[9px]" style={{ color: t.textMuted }}>
                  Temporarily hide your profile and listings. You can reactivate anytime.
                </p>
              </div>
              <span style={{ color: t.textMuted }}>→</span>
            </button>

            <button
              className="w-full p-3 rounded-xl text-left flex items-center gap-3"
              style={{ background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.15)' }}
            >
              <span className="text-lg">📦</span>
              <div className="flex-1">
                <p className="text-xs font-semibold" style={{ color: '#f97316' }}>Switch to Worker Mode</p>
                <p className="text-[9px]" style={{ color: t.textMuted }}>
                  Change your account type to offer services on the platform.
                </p>
              </div>
              <span style={{ color: t.textMuted }}>→</span>
            </button>

            <button
              className="w-full p-3 rounded-xl text-left flex items-center gap-3"
              style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}
            >
              <span className="text-lg">🗑️</span>
              <div className="flex-1">
                <p className="text-xs font-semibold" style={{ color: '#ef4444' }}>Delete Account</p>
                <p className="text-[9px]" style={{ color: t.textMuted }}>
                  Permanently remove your account and all associated data. This cannot be undone.
                </p>
              </div>
              <span style={{ color: t.textMuted }}>→</span>
            </button>
          </div>

          {/* Info Box */}
          <div className="rounded-2xl p-4" style={{ background: `${t.accent}08`, border: `1px solid ${t.accent}15` }}>
            <p className="text-xs font-bold mb-1" style={{ color: t.accent }}>Before You Go</p>
            <p className="text-[10px]" style={{ color: t.textSecondary }}>
              If you delete your account, all your posts, reviews, job history, and wallet balance will be permanently removed after a 30-day grace period. Any active jobs or transactions must be completed or cancelled first.
            </p>
          </div>
        </div>
      )}

      <div className="h-4" />
    </div>
  );
}
