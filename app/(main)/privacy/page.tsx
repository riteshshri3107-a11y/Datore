"use client";
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { useAuthStore } from '@/store/useAuthStore';
import { getTheme } from '@/lib/theme';
import { CONSENT_PURPOSES, RETENTION_POLICIES, PRIVACY_VERSIONS, recordBatchConsent, getUserConsents, createDSR, generateDataExport, processErasure, getDefaultBannerState, type ConsentPurpose, type RequestType, type DataCategory } from '@/lib/compliance';
import { IcoBack, IcoCheck, IcoShield } from '@/components/Icons';

export default function PrivacyCenter() {
  const router = useRouter();
  const { isDark } = useThemeStore();
  const { user } = useAuthStore();
  const t = getTheme(isDark);
  const userId = user?.id || 'anonymous';
  const [tab, setTab] = useState<'consent'|'data'|'policy'>('consent');
  const [consents, setConsents] = useState(getDefaultBannerState().preferences);
  const [saved, setSaved] = useState(false);
  const [dsrType, setDsrType] = useState<RequestType>('access');
  const [dsrSubmitted, setDsrSubmitted] = useState(false);
  const [exportReady, setExportReady] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteStep, setDeleteStep] = useState(0);

  const handleSaveConsent = () => {
    recordBatchConsent(userId, consents, 'privacy_center');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDSR = () => {
    createDSR(userId, dsrType, 'pipeda');
    setDsrSubmitted(true);
    setTimeout(() => setDsrSubmitted(false), 3000);
  };

  const handleExport = () => {
    generateDataExport(userId);
    setExportReady(true);
  };

  const handleDelete = () => {
    if (deleteStep < 2) { setDeleteStep(deleteStep + 1); return; }
    processErasure(userId);
    setDeleteConfirm(true);
  };

  return (
    <div className="space-y-4 animate-fade-in pb-10 max-w-lg mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:t.card }}><IcoBack size={18} color={t.textMuted} /></button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">🔐 Privacy Center</h1>
          <p className="text-xs" style={{ color:t.textMuted }}>PIPEDA & GDPR compliant · Your data, your control</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[{k:'consent' as const,l:'🍪 Consent'},{k:'data' as const,l:'📦 My Data'},{k:'policy' as const,l:'📋 Policy'}].map(tb => (
          <button key={tb.k} onClick={() => setTab(tb.k)} className="flex-1 py-2.5 rounded-xl text-xs font-bold" style={{ background:tab===tb.k?`${t.accent}15`:t.card, color:tab===tb.k?t.accent:t.textMuted, border:`1px solid ${tab===tb.k?t.accent+'33':t.cardBorder}` }}>{tb.l}</button>
        ))}
      </div>

      {/* Consent Tab */}
      {tab === 'consent' && (
        <div className="space-y-3">
          <p className="text-xs" style={{ color:t.textSecondary }}>Manage how Datore uses your data. Required items cannot be disabled.</p>
          {(Object.entries(CONSENT_PURPOSES) as [ConsentPurpose, typeof CONSENT_PURPOSES[ConsentPurpose]][]).map(([key, def]) => (
            <div key={key} className="rounded-xl p-4 flex items-start gap-3" style={{ background:t.card, border:`1px solid ${t.cardBorder}` }}>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-bold">{def.name}</p>
                  {def.required && <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold" style={{ background:'rgba(99,102,241,0.1)', color:'#6366f1' }}>Required</span>}
                </div>
                <p className="text-[10px]" style={{ color:t.textSecondary }}>{def.description}</p>
                <p className="text-[8px] mt-1" style={{ color:t.textMuted }}>Legal basis: {def.legalBasis}</p>
              </div>
              <button
                onClick={() => !def.required && setConsents({...consents, [key]:!consents[key]})}
                className="w-12 h-6 rounded-full relative flex-shrink-0"
                style={{ background:consents[key]?t.accent:'rgba(107,114,128,0.3)', opacity:def.required?0.6:1, cursor:def.required?'not-allowed':'pointer', transition:'all 0.2s' }}
              >
                <div className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all" style={{ left:consents[key]?'calc(100% - 22px)':'2px' }} />
              </button>
            </div>
          ))}
          <button onClick={handleSaveConsent} className="btn-accent w-full py-3 rounded-xl text-sm">
            {saved ? '✅ Preferences Saved!' : '💾 Save Preferences'}
          </button>
        </div>
      )}

      {/* My Data Tab */}
      {tab === 'data' && (
        <div className="space-y-4">
          {/* Data Export */}
          <div className="rounded-xl p-4" style={{ background:t.card, border:`1px solid ${t.cardBorder}` }}>
            <h3 className="text-sm font-bold mb-2">📦 Export My Data</h3>
            <p className="text-[10px] mb-3" style={{ color:t.textSecondary }}>Download all your data in JSON format (PIPEDA Article 4.9 / GDPR Art. 20).</p>
            <button onClick={handleExport} className="w-full py-2.5 rounded-xl text-xs font-bold" style={{ background:`${t.accent}15`, color:t.accent }}>
              {exportReady ? '✅ Export Ready — Download' : '📥 Request Data Export'}
            </button>
          </div>

          {/* Data Subject Request */}
          <div className="rounded-xl p-4" style={{ background:t.card, border:`1px solid ${t.cardBorder}` }}>
            <h3 className="text-sm font-bold mb-2">📝 Submit a Request</h3>
            <p className="text-[10px] mb-3" style={{ color:t.textSecondary }}>Exercise your privacy rights. We'll respond within 30 days.</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {([
                {k:'access' as RequestType,l:'View my data',i:'👁️'},
                {k:'rectification' as RequestType,l:'Correct my data',i:'✏️'},
                {k:'erasure' as RequestType,l:'Delete my data',i:'🗑️'},
                {k:'restriction' as RequestType,l:'Restrict processing',i:'⛔'},
                {k:'portability' as RequestType,l:'Transfer data',i:'📤'},
                {k:'objection' as RequestType,l:'Object to processing',i:'✋'},
              ]).map(r => (
                <button key={r.k} onClick={() => setDsrType(r.k)} className="px-3 py-2 rounded-lg text-[10px] font-medium" style={{ background:dsrType===r.k?`${t.accent}15`:isDark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.02)', color:dsrType===r.k?t.accent:t.textSecondary, border:`1.5px solid ${dsrType===r.k?t.accent+'44':t.cardBorder}` }}>{r.i} {r.l}</button>
              ))}
            </div>
            <button onClick={handleDSR} className="w-full py-2.5 rounded-xl text-xs font-bold" style={{ background:`${t.accent}15`, color:t.accent }}>
              {dsrSubmitted ? '✅ Request Submitted! We\'ll respond within 30 days.' : `Submit ${dsrType.charAt(0).toUpperCase()+dsrType.slice(1)} Request`}
            </button>
          </div>

          {/* Delete Account */}
          <div className="rounded-xl p-4" style={{ background:isDark?'rgba(239,68,68,0.03)':'rgba(239,68,68,0.02)', border:'1px solid rgba(239,68,68,0.15)' }}>
            <h3 className="text-sm font-bold mb-2" style={{ color:'#ef4444' }}>⚠️ Delete Account</h3>
            <p className="text-[10px] mb-2" style={{ color:t.textSecondary }}>This will permanently delete your account and most data. Some data may be retained for legal obligations (tax records: 7 years).</p>
            {deleteStep === 0 && <button onClick={handleDelete} className="w-full py-2 rounded-xl text-xs font-bold" style={{ background:'rgba(239,68,68,0.1)', color:'#ef4444' }}>I want to delete my account</button>}
            {deleteStep === 1 && (
              <div className="space-y-2">
                <p className="text-[10px] font-bold" style={{ color:'#ef4444' }}>Are you sure? This action cannot be undone.</p>
                <div className="flex gap-2">
                  <button onClick={() => setDeleteStep(0)} className="flex-1 py-2 rounded-xl text-xs" style={{ background:t.card, color:t.textSecondary }}>Cancel</button>
                  <button onClick={handleDelete} className="flex-1 py-2 rounded-xl text-xs font-bold" style={{ background:'rgba(239,68,68,0.15)', color:'#ef4444' }}>Yes, delete everything</button>
                </div>
              </div>
            )}
            {deleteStep === 2 && (
              <div className="space-y-2">
                <p className="text-[10px] font-bold" style={{ color:'#ef4444' }}>Final confirmation: Type "DELETE" to proceed.</p>
                <input placeholder='Type "DELETE"' className="w-full px-3 py-2 rounded-lg text-xs outline-none" style={{ background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)', border:'1px solid rgba(239,68,68,0.3)', color:t.text }} onChange={e => { if(e.target.value === 'DELETE') handleDelete(); }} />
              </div>
            )}
            {deleteConfirm && <p className="text-xs font-bold mt-2" style={{ color:'#ef4444' }}>Account deletion initiated. You'll receive a confirmation email.</p>}
          </div>
        </div>
      )}

      {/* Policy Tab */}
      {tab === 'policy' && (
        <div className="space-y-4">
          {/* Policy Versions */}
          <div className="rounded-xl p-4" style={{ background:t.card, border:`1px solid ${t.cardBorder}` }}>
            <h3 className="text-sm font-bold mb-3">📋 Privacy Policy History</h3>
            {PRIVACY_VERSIONS.map((v, i) => (
              <div key={v.version} className="flex items-start gap-3 py-2" style={{ borderTop:i>0?`1px solid ${t.cardBorder}`:'none' }}>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold" style={{ background:i===0?'rgba(34,197,94,0.1)':'rgba(107,114,128,0.1)', color:i===0?'#22c55e':'#6b7280' }}>v{v.version}</span>
                <div>
                  <p className="text-xs font-semibold">Effective: {v.effectiveDate}</p>
                  <p className="text-[10px]" style={{ color:t.textSecondary }}>{v.summary}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Data Retention */}
          <div className="rounded-xl p-4" style={{ background:t.card, border:`1px solid ${t.cardBorder}` }}>
            <h3 className="text-sm font-bold mb-3">⏱️ Data Retention Schedule</h3>
            <div className="space-y-2">
              {RETENTION_POLICIES.map(p => (
                <div key={p.category} className="flex items-center gap-2 py-1.5" style={{ borderBottom:`1px solid ${t.cardBorder}` }}>
                  <span className="text-xs font-semibold capitalize w-28">{p.category.replace('_',' ')}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded" style={{ background:p.retentionDays>365?'rgba(249,115,22,0.1)':'rgba(34,197,94,0.1)', color:p.retentionDays>365?'#f97316':'#22c55e' }}>
                    {p.retentionDays === 0 ? 'Active' : p.retentionDays >= 365 ? `${Math.round(p.retentionDays/365)}yr` : `${p.retentionDays}d`}
                  </span>
                  <span className="text-[9px] flex-1" style={{ color:t.textMuted }}>{p.description}</span>
                  {p.autoDelete && <span className="text-[8px]" style={{ color:'#22c55e' }}>Auto-delete</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Contact DPO */}
          <div className="rounded-xl p-4" style={{ background:t.card, border:`1px solid ${t.cardBorder}` }}>
            <h3 className="text-sm font-bold mb-2">📬 Contact Data Protection Officer</h3>
            <p className="text-[10px]" style={{ color:t.textSecondary }}>For privacy inquiries or to exercise your rights under PIPEDA or GDPR:</p>
            <div className="mt-2 space-y-1">
              <p className="text-xs">📧 privacy@datore.app</p>
              <p className="text-xs">📍 Datore Inc., Toronto, ON, Canada</p>
              <p className="text-[10px]" style={{ color:t.textMuted }}>Response time: Within 30 business days</p>
            </div>
          </div>

          {/* Compliance Badges */}
          <div className="flex gap-2 justify-center">
            {['🇨🇦 PIPEDA','🇪🇺 GDPR','🔒 Encrypted','🛡️ SOC 2 (planned)'].map(b => (
              <span key={b} className="px-3 py-1.5 rounded-lg text-[9px] font-semibold" style={{ background:t.card, border:`1px solid ${t.cardBorder}`, color:t.textSecondary }}>{b}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
