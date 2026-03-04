"use client";
export const dynamic = "force-dynamic";
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { createJob, getSession } from '@/lib/supabase';
import { JOB_CATEGORIES, URGENCY_OPTIONS } from '@/types';
import { HASHTAGS, getProfilePrefs } from '@/lib/demoData';

export default function CreateJobPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const prefs = getProfilePrefs();
  const [form, setForm] = useState({ title:'', description:'', category:'', customCategory:'', urgency:'today', target_date:'', payment_type:'fixed', amount:'', location_name:'', duration:'', notes:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [posted, setPosted] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [mediaCount, setMediaCount] = useState(0);
  const [mediaFiles, setMediaFiles] = useState<{name:string;type:string;preview:string}[]>([]);
  const jobPhotoRef = useRef<HTMLInputElement>(null);
  const jobVideoRef = useRef<HTMLInputElement>(null);

  const handleJobMedia = (e: React.ChangeEvent<HTMLInputElement>, mtype: string) => {
    const file = e.target.files?.[0];
    if (!file || mediaFiles.length >= 5) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setMediaFiles(prev => [...prev, { name:file.name, type:mtype, preview:ev.target?.result as string }]);
      setMediaCount(prev => prev + 1);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeMedia = (idx: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== idx));
    setMediaCount(prev => Math.max(0, prev - 1));
  };

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));
  const toggleTag = (tag: string) => setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : prev.length < 5 ? [...prev, tag] : prev);

  const allCategories = [...JOB_CATEGORIES, 'Miscellaneous / Other'];

  const handleSubmit = async () => {
    const cat = form.category === 'Miscellaneous / Other' ? (form.customCategory || 'Miscellaneous') : form.category;
    if (!form.title || !cat || !form.amount) { setError('Please fill all required fields'); return; }
    if (form.urgency === 'by_date' && !form.target_date) { setError('Please select a date'); return; }
    setLoading(true); setError('');
    try {
      const { data: { session } } = await getSession();
      if (!session) { router.push('/login'); return; }
      await createJob({
        customer_id: session.user.id,
        category_id: cat,
        job_description: `${form.title}\n\n${form.description}${selectedTags.length ? '\n\n' + selectedTags.join(' ') : ''}${form.notes ? '\n\nNotes: ' + form.notes : ''}`,
        scheduled_time: form.target_date || null,
        agreed_price: parseFloat(form.amount),
        status: 'open',
      });
      setPosted(true);
      setTimeout(() => router.push('/jobplace'), 2000);
    } catch (e: any) { setError(e.message || 'Failed to post job'); }
    setLoading(false);
  };

  const IS = { background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, color:t.text };

  if (posted) return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in ">
      <p className="text-4xl font-bold mb-2" style={{ color:'#22c55e' }}>Posted!</p>
      <h2 className="text-xl font-bold">Job Posted Successfully</h2>
      <p className="text-sm mt-2" style={{ color:t.textSecondary }}>Workers will see your job listing now.</p>
      <p className="text-xs mt-2" style={{ color:t.textMuted }}>Display: {prefs.displayPref} view (from your profile settings)</p>
    </div>
  );

  return (
    <div className="space-y-4 animate-fade-in  pb-8">
      <div className="flex items-center gap-3"><button onClick={() => router.back()} className="text-lg">{'<-'}</button><h1 className="text-xl font-bold">Post a Job</h1></div>

      <div className="glass-card rounded-2xl p-5 space-y-4" style={{ background:t.card, borderColor:t.cardBorder }}>
        {/* Title */}
        <div><label className="text-xs font-medium mb-1 block" style={{ color:t.textSecondary }}>Job Title *</label>
          <input value={form.title} onChange={e => update('title', e.target.value)} placeholder="e.g., Babysitter Needed Tonight" className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={IS} />
        </div>

        {/* Category */}
        <div><label className="text-xs font-medium mb-1 block" style={{ color:t.textSecondary }}>Category *</label>
          <select value={form.category} onChange={e => update('category', e.target.value)} className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={IS}>
            <option value="">Select Category</option>
            {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {form.category === 'Miscellaneous / Other' && (
          <div><label className="text-xs font-medium mb-1 block" style={{ color:t.textSecondary }}>Custom Category *</label>
            <input value={form.customCategory} onChange={e => update('customCategory', e.target.value)} placeholder="Describe your job type" className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={IS} />
          </div>
        )}

        {/* Description */}
        <div><label className="text-xs font-medium mb-1 block" style={{ color:t.textSecondary }}>Description</label>
          <textarea value={form.description} onChange={e => update('description', e.target.value)} rows={3} placeholder="Describe what you need..." className="w-full px-4 py-3 rounded-xl text-sm resize-none outline-none" style={IS} />
        </div>

        {/* Photo/Video upload - REAL file pickers */}
        <div>
          <input ref={jobPhotoRef} type="file" accept="image/*" className="hidden" onChange={e => handleJobMedia(e, 'photo')} />
          <input ref={jobVideoRef} type="file" accept="video/*" className="hidden" onChange={e => handleJobMedia(e, 'video')} />
          <label className="text-xs font-medium mb-2 block" style={{ color:t.textSecondary }}>Photos / Videos (max 5)</label>
          {/* Previews */}
          {mediaFiles.length > 0 && (
            <div className="flex gap-2 mb-2 overflow-x-auto pb-1">
              {mediaFiles.map((m, i) => (
                <div key={i} className="relative shrink-0 w-20 h-20 rounded-xl overflow-hidden" style={{ border:`1px solid ${t.cardBorder}` }}>
                  {m.type === 'photo' ? (
                    <img src={m.preview} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)' }}>
                      <span className="text-[10px] font-bold" style={{ color:'#ef4444' }}>VIDEO</span>
                    </div>
                  )}
                  <button onClick={() => removeMedia(i)} className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ background:'rgba(0,0,0,0.7)' }}>X</button>
                </div>
              ))}
            </div>
          )}
          {/* Upload buttons */}
          {mediaFiles.length < 5 && (
            <div className="flex gap-2">
              <button onClick={() => jobPhotoRef.current?.click()} className="flex-1 h-20 rounded-xl flex flex-col items-center justify-center" style={{ background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.02)', border:`2px dashed ${t.accent}44` }}>
                <span className="text-sm font-bold" style={{ color:t.accent }}>+ Photo</span>
                <span className="text-[10px]" style={{ color:t.textMuted }}>Camera or gallery</span>
              </button>
              <button onClick={() => jobVideoRef.current?.click()} className="flex-1 h-20 rounded-xl flex flex-col items-center justify-center" style={{ background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.02)', border:`2px dashed #ef444444` }}>
                <span className="text-sm font-bold" style={{ color:'#ef4444' }}>+ Video</span>
                <span className="text-[10px]" style={{ color:t.textMuted }}>Record or upload</span>
              </button>
            </div>
          )}
          {mediaCount > 0 && <p className="text-[10px] mt-1" style={{ color:'#22c55e' }}>{mediaCount} file(s) attached</p>}
        </div>

        {/* Urgency */}
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color:t.textSecondary }}>Urgency *</label>
          <div className="grid grid-cols-3 gap-2">
            {URGENCY_OPTIONS.map(u => (
              <button key={u.value} onClick={() => update('urgency', u.value)}
                className="p-2.5 rounded-xl text-xs font-medium text-center"
                style={{ background:form.urgency===u.value?u.color+'22':t.surface, color:form.urgency===u.value?u.color:t.textSecondary, border:`1px solid ${form.urgency===u.value?u.color+'55':t.cardBorder}` }}>
                {u.label}
              </button>
            ))}
          </div>
        </div>

        {form.urgency === 'by_date' && (
          <div><label className="text-xs font-medium mb-1 block" style={{ color:t.textSecondary }}>Select Date *</label>
            <input type="date" value={form.target_date} onChange={e => update('target_date', e.target.value)} className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={IS} />
          </div>
        )}

        {/* Payment */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color:t.textSecondary }}>Payment Type</label>
            <div className="flex gap-2">
              {(['fixed','hourly'] as const).map(pt => (
                <button key={pt} onClick={() => update('payment_type', pt)} className="flex-1 py-2.5 rounded-xl text-xs font-medium"
                  style={{ background:form.payment_type===pt?t.accentLight:t.surface, color:form.payment_type===pt?t.accent:t.textSecondary, border:`1px solid ${form.payment_type===pt?`${t.accent}44`:t.cardBorder}` }}>
                  {pt === 'fixed' ? 'Fixed $' : 'Hourly $/hr'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color:t.textSecondary }}>Amount (CAD) *</label>
            <input type="number" value={form.amount} onChange={e => update('amount', e.target.value)} placeholder="0.00" className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={IS} />
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="text-xs font-medium mb-1 block" style={{ color:t.textSecondary }}>Estimated Duration</label>
          <select value={form.duration} onChange={e => update('duration', e.target.value)} className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={IS}>
            <option value="">Select duration</option>
            {['Less than 1 hour','1-2 hours','2-4 hours','Half day (4-6 hours)','Full day (6-8 hours)','Multiple days','Ongoing / Recurring'].map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Location */}
        <div><label className="text-xs font-medium mb-1 block" style={{ color:t.textSecondary }}>Location</label>
          <input value={form.location_name} onChange={e => update('location_name', e.target.value)} placeholder="Toronto, ON (auto-detect or type manually)" className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={IS} />
          <p className="text-[10px] mt-1" style={{ color:t.textMuted }}>GPS auto-detection + manual entry supported</p>
        </div>

        {/* Special Notes */}
        <div><label className="text-xs font-medium mb-1 block" style={{ color:t.textSecondary }}>Special Notes</label>
          <textarea value={form.notes} onChange={e => update('notes', e.target.value)} rows={2} placeholder="Any special requirements, tools needed, etc." className="w-full px-4 py-3 rounded-xl text-sm resize-none outline-none" style={IS} />
        </div>

        {/* Hashtags */}
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color:t.textSecondary }}>Hashtags (max 5) - helps workers find your job</label>
          <div className="flex flex-wrap gap-1.5">
            {HASHTAGS.map(tag => (
              <button key={tag} onClick={() => toggleTag(tag)} className="px-2.5 py-1 rounded-lg text-[11px] font-medium"
                style={{ background:selectedTags.includes(tag)?t.accentLight:(isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)'), color:selectedTags.includes(tag)?t.accent:t.textMuted, border:`1px solid ${selectedTags.includes(tag)?t.accent+'44':'transparent'}` }}>
                {tag}
              </button>
            ))}
          </div>
          {selectedTags.length > 0 && <p className="text-[10px] mt-1" style={{ color:t.accent }}>Selected: {selectedTags.join(' ')}</p>}
        </div>

        {/* Display preference note */}
        <div className="p-3 rounded-xl" style={{ background:isDark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.02)', border:`1px solid ${t.cardBorder}` }}>
          <p className="text-[10px]" style={{ color:t.textMuted }}>Job will display in <span className="font-bold" style={{ color:t.accent }}>{prefs.displayPref || 'card'}</span> view (set in Profile {'>'} Edit Profile)</p>
        </div>

        {error && <p className="text-xs" style={{ color:'#ef4444' }}>Warning: {error}</p>}

        <button onClick={handleSubmit} disabled={loading} className="w-full py-3.5 rounded-xl font-semibold text-white text-sm"
          style={{ background:`linear-gradient(135deg,${t.accent},#8b5cf6)`, opacity:loading?0.7:1 }}>
          {loading ? 'Posting...' : 'Post Job'}
        </button>
      </div>
    </div>
  );
}
