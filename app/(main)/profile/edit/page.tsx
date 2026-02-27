"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { getProfilePrefs, saveProfilePrefs, JOB_DISPLAY_OPTIONS } from '@/lib/demoData';

export default function ProfileEditPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('Toronto');
  const [phone, setPhone] = useState('');
  const [displayPref, setDisplayPref] = useState<typeof JOB_DISPLAY_OPTIONS[number]>('card');
  const [skills, setSkills] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  const allSkills = ['Babysitting','Plumbing','Cleaning','Tutoring','Pet Care','Moving','Cooking','Gardening','Painting','Electrical','Tech Support','Photography','Event Planning','General Labor'];

  useEffect(() => {
    const prefs = getProfilePrefs();
    setName(prefs.name || '');
    setDisplayPref(prefs.displayPref || 'card');
  }, []);

  const toggleSkill = (s: string) => {
    setSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const handleSave = () => {
    saveProfilePrefs({ displayPref, setupDone: true, name: name || 'Demo User' });
    setSaved(true);
    setTimeout(() => { setSaved(false); router.push('/profile'); }, 1500);
  };

  const displayOptions = [
    { id: 'card' as const, label: 'Card View', desc: 'Large cards with images and full details' },
    { id: 'list' as const, label: 'List View', desc: 'Compact rows, more jobs visible at once' },
    { id: 'grid' as const, label: 'Grid View', desc: '2-column grid for quick browsing' },
  ];

  return (
    <div className="space-y-4 animate-fade-in max-w-lg mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-lg">{'<-'}</button>
        <h1 className="text-xl font-bold">Edit Profile</h1>
      </div>

      {saved && (
        <div className="p-3 rounded-xl text-center text-sm font-semibold" style={{ background:'rgba(34,197,94,0.15)', color:'#22c55e' }}>
          Profile saved successfully!
        </div>
      )}

      {/* Basic Info */}
      <div className="glass-card rounded-2xl p-5 space-y-4" style={{ background:t.card, borderColor:t.cardBorder }}>
        <h3 className="font-semibold text-sm">Basic Information</h3>
        <div>
          <label className="text-xs font-medium" style={{ color:t.textMuted }}>Full Name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="w-full mt-1 p-3 rounded-xl text-sm outline-none" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, color:t.text }} />
        </div>
        <div>
          <label className="text-xs font-medium" style={{ color:t.textMuted }}>Bio</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} placeholder="Tell others about yourself..." className="w-full mt-1 p-3 rounded-xl text-sm outline-none resize-none" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, color:t.text }} />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs font-medium" style={{ color:t.textMuted }}>City</label>
            <select value={city} onChange={e => setCity(e.target.value)} className="w-full mt-1 p-3 rounded-xl text-sm outline-none" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, color:t.text }}>
              {['Toronto','Mississauga','Brampton','Scarborough','North York','Etobicoke','Markham','Vaughan','Richmond Hill'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs font-medium" style={{ color:t.textMuted }}>Phone</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (416) 000-0000" className="w-full mt-1 p-3 rounded-xl text-sm outline-none" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, color:t.text }} />
          </div>
        </div>
      </div>

      {/* Job Display Preference */}
      <div className="glass-card rounded-2xl p-5 space-y-3" style={{ background:t.card, borderColor:t.cardBorder }}>
        <h3 className="font-semibold text-sm">Job Display Preference</h3>
        <p className="text-xs" style={{ color:t.textMuted }}>Choose how job listings appear when you post or browse</p>
        <div className="space-y-2">
          {displayOptions.map(opt => (
            <button key={opt.id} onClick={() => setDisplayPref(opt.id)}
              className="w-full p-3 rounded-xl text-left flex items-center gap-3"
              style={{
                background: displayPref === opt.id ? t.accentLight : (isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.02)'),
                border: `1px solid ${displayPref === opt.id ? t.accent+'55' : t.cardBorder}`,
                color: displayPref === opt.id ? t.accent : t.text
              }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{
                background: displayPref === opt.id ? t.accent : t.surface,
                color: displayPref === opt.id ? 'white' : t.textMuted
              }}>
                {opt.id === 'card' ? 'C' : opt.id === 'list' ? 'L' : 'G'}
              </div>
              <div>
                <p className="text-sm font-medium">{opt.label}</p>
                <p className="text-[10px]" style={{ color:t.textMuted }}>{opt.desc}</p>
              </div>
              {displayPref === opt.id && <span className="ml-auto text-sm font-bold" style={{ color:t.accent }}>Selected</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="glass-card rounded-2xl p-5 space-y-3" style={{ background:t.card, borderColor:t.cardBorder }}>
        <h3 className="font-semibold text-sm">Your Skills (for offering services)</h3>
        <p className="text-xs" style={{ color:t.textMuted }}>Select skills you can offer to others</p>
        <div className="flex flex-wrap gap-2">
          {allSkills.map(s => (
            <button key={s} onClick={() => toggleSkill(s)} className="px-3 py-1.5 rounded-xl text-xs font-medium"
              style={{
                background: skills.includes(s) ? t.accentLight : (isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)'),
                color: skills.includes(s) ? t.accent : t.textSecondary,
                border: `1px solid ${skills.includes(s) ? t.accent+'44' : t.cardBorder}`
              }}>{s}</button>
          ))}
        </div>
      </div>

      {/* Save */}
      <div className="flex gap-2 sticky bottom-20 md:bottom-4">
        <button onClick={handleSave} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white" style={{ background:`linear-gradient(135deg,${t.accent},#8b5cf6)` }}>Save Profile</button>
        <button onClick={() => router.back()} className="px-6 py-3 rounded-xl text-sm" style={{ background:t.surface, color:t.textSecondary, border:`1px solid ${t.cardBorder}` }}>Cancel</button>
      </div>
    </div>
  );
}
