"use client";
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { createJob, getSession } from '@/lib/supabase';
import { JOB_CATEGORIES, URGENCY_OPTIONS } from '@/types';

export default function CreateJobPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const [form, setForm] = useState({ title: '', description: '', category: '', urgency: 'today', target_date: '', payment_type: 'fixed', amount: '', location_name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async () => {
    if (!form.title || !form.category || !form.amount) { setError('Please fill all required fields'); return; }
    if (form.urgency === 'by_date' && !form.target_date) { setError('Please select a date'); return; }
    setLoading(true); setError('');
    try {
      const { data: { session } } = await getSession();
      if (!session) { router.push('/login'); return; }
      await createJob({
        poster_id: session.user.id,
        poster_name: session.user.user_metadata?.full_name || session.user.email,
        title: form.title, description: form.description, category: form.category,
        urgency: form.urgency, target_date: form.target_date || null,
        payment_type: form.payment_type, amount: parseFloat(form.amount),
        currency: 'CAD', location_name: form.location_name || 'Toronto, ON',
        location_lat: 43.65, location_lng: -79.38, status: 'open',
      });
      router.push('/jobplace');
    } catch (e: any) { setError(e.message || 'Failed to post job'); }
    setLoading(false);
  };

  const inputStyle = { background: t.input, color: t.text, borderColor: t.inputBorder };

  return (
    <div className="space-y-4 animate-fade-in max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => router.back()} className="text-lg">←</button>
        <h1 className="text-xl font-bold">Post a Job</h1>
      </div>

      <div className="glass-card rounded-2xl p-5 space-y-4" style={{ background: t.card, borderColor: t.cardBorder, boxShadow: t.glassShadow }}>
        <div>
          <label className="text-xs font-medium mb-1 block" style={{ color: t.textSecondary }}>Job Title *</label>
          <input value={form.title} onChange={e => update('title', e.target.value)} placeholder="e.g., Babysitter Needed Tonight"
            className="glass-input w-full px-4 py-3 rounded-xl text-sm" style={inputStyle} />
        </div>

        <div>
          <label className="text-xs font-medium mb-1 block" style={{ color: t.textSecondary }}>Category *</label>
          <select value={form.category} onChange={e => update('category', e.target.value)}
            className="glass-input w-full px-4 py-3 rounded-xl text-sm" style={inputStyle}>
            <option value="">Select Category</option>
            {JOB_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium mb-1 block" style={{ color: t.textSecondary }}>Description</label>
          <textarea value={form.description} onChange={e => update('description', e.target.value)} rows={3}
            placeholder="Describe what you need..." className="glass-input w-full px-4 py-3 rounded-xl text-sm resize-none" style={inputStyle} />
        </div>

        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: t.textSecondary }}>Urgency *</label>
          <div className="grid grid-cols-3 gap-2">
            {URGENCY_OPTIONS.map(u => (
              <button key={u.value} onClick={() => update('urgency', u.value)}
                className="glass-button p-2.5 rounded-xl text-xs font-medium text-center"
                style={{ background: form.urgency === u.value ? u.color + '22' : t.surface, color: form.urgency === u.value ? u.color : t.textSecondary, borderColor: form.urgency === u.value ? u.color + '55' : t.cardBorder }}>
                {u.label}
              </button>
            ))}
          </div>
        </div>

        {form.urgency === 'by_date' && (
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: t.textSecondary }}>Select Date *</label>
            <input type="date" value={form.target_date} onChange={e => update('target_date', e.target.value)}
              className="glass-input w-full px-4 py-3 rounded-xl text-sm" style={inputStyle} />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: t.textSecondary }}>Payment Type</label>
            <div className="flex gap-2">
              {['fixed', 'hourly'].map(pt => (
                <button key={pt} onClick={() => update('payment_type', pt)}
                  className="glass-button flex-1 py-2.5 rounded-xl text-xs font-medium"
                  style={{ background: form.payment_type === pt ? t.accentLight : t.surface, color: form.payment_type === pt ? t.accent : t.textSecondary, borderColor: form.payment_type === pt ? `${t.accent}44` : t.cardBorder }}>
                  {pt === 'fixed' ? '💵 Fixed' : '⏱️ Hourly'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: t.textSecondary }}>Amount (CAD) *</label>
            <input type="number" value={form.amount} onChange={e => update('amount', e.target.value)} placeholder="0.00"
              className="glass-input w-full px-4 py-3 rounded-xl text-sm" style={inputStyle} />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium mb-1 block" style={{ color: t.textSecondary }}>Location</label>
          <input value={form.location_name} onChange={e => update('location_name', e.target.value)} placeholder="Toronto, ON"
            className="glass-input w-full px-4 py-3 rounded-xl text-sm" style={inputStyle} />
        </div>

        {error && <p className="text-xs" style={{ color: t.danger }}>⚠️ {error}</p>}

        <button onClick={handleSubmit} disabled={loading} className="btn-accent w-full py-3.5 rounded-xl font-semibold">
          {loading ? 'Posting...' : '📋 Post Job'}
        </button>
      </div>
    </div>
  );
}
