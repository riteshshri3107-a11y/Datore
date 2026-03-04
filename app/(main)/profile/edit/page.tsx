"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { useAuthStore } from '@/store/useAuthStore';
import { getTheme } from '@/lib/theme';
import { getProfilePrefs, saveProfilePrefs, JOB_DISPLAY_OPTIONS } from '@/lib/demoData';
import { IcoBack, IcoCamera } from '@/components/Icons';
import { getProfile, updateProfile, uploadAvatar } from '@/lib/supabase';

const AVATARS = ['👤','👩','👨','👩‍💻','👨‍💻','👩‍🔧','👨‍🔧','👩‍🍳','👨‍🍳','👩‍🏫','👨‍🏫','🧑‍🎨'];
const CITIES = ['Toronto','Mississauga','Brampton','Scarborough','North York','Etobicoke','Markham','Vaughan','Richmond Hill','Oakville','Burlington','Hamilton'];
const LANGS = ['English','French','Hindi','Punjabi','Mandarin','Cantonese','Tamil','Urdu','Spanish','Arabic','Portuguese','Tagalog'];
const DEGREES = ['High School','Diploma','Associate','Bachelor','Master','PhD','Certificate','Other'];

export default function ProfileEditPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const { user } = useAuthStore();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('Toronto');
  const [phone, setPhone] = useState('');
  const [displayPref, setDisplayPref] = useState<typeof JOB_DISPLAY_OPTIONS[number]>('card');
  const [skills, setSkills] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  // New fields
  const [profilePhoto, setProfilePhoto] = useState<string|null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<string|null>(null);
  const [showAvatars, setShowAvatars] = useState(false);
  const [street, setStreet] = useState('');
  const [province, setProvince] = useState('Ontario');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('Canada');
  const [school, setSchool] = useState('');
  const [degree, setDegree] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [gradYear, setGradYear] = useState('');
  const [languages, setLanguages] = useState<string[]>(['English']);
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [instagram, setInstagram] = useState('');
  const photoInputRef = useRef<HTMLInputElement>(null);

  const allSkills = ['Babysitting','Plumbing','Cleaning','Tutoring','Pet Care','Moving','Cooking','Gardening','Painting','Electrical','Tech Support','Photography','Event Planning','General Labor'];

  useEffect(() => {
    const prefs = getProfilePrefs();
    setDisplayPref(prefs.displayPref || 'card');

    // Load from Supabase profile
    const loadProfile = async () => {
      if (!user?.id) return;
      const p = await getProfile(user.id);
      if (p) {
        setName(p.name || '');
        setBio(p.bio || '');
        setCity(p.city || 'Toronto');
        setPhone(p.phone || '');
        setProvince(p.state || 'Ontario');
        if (p.avatar_url) setProfilePhoto(p.avatar_url);
        if (p.education) {
          try { const edu = JSON.parse(p.education); setSchool(edu.school||''); setDegree(edu.degree||''); setFieldOfStudy(edu.fieldOfStudy||''); setGradYear(edu.gradYear||''); } catch {}
        }
        if (p.links) {
          try { const links = typeof p.links === 'string' ? JSON.parse(p.links) : p.links; setLinkedin(links.linkedin||''); setInstagram(links.instagram||''); } catch {}
        }
        if (p.contact_info) {
          try { const ci = typeof p.contact_info === 'string' ? JSON.parse(p.contact_info) : p.contact_info; setEmergencyName(ci.emergencyName||''); setEmergencyPhone(ci.emergencyPhone||''); setStreet(ci.street||''); setPostalCode(ci.postalCode||''); setCountry(ci.country||'Canada'); } catch {}
        }
      }
    };
    loadProfile();
  }, [user?.id]);

  const toggleSkill = (s: string) => setSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const toggleLang = (l: string) => setLanguages(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setProfilePhoto(ev.target?.result as string); setSelectedAvatar(null); };
    reader.readAsDataURL(file);
    if (user?.id) {
      const result = await uploadAvatar(user.id, file);
      if (result.url) setProfilePhoto(result.url);
    }
  };

  const selectAvatar = (a: string) => { setSelectedAvatar(a); setProfilePhoto(null); setShowAvatars(false); };

  const handleSave = async () => {
    saveProfilePrefs({ displayPref, setupDone: true, name: name || 'Demo User' });
    // Save to Supabase
    if (user?.id) {
      await updateProfile(user.id, {
        name: name || 'User',
        bio,
        city,
        state: province,
        phone,
        education: JSON.stringify({ school, degree, fieldOfStudy, gradYear }),
        links: JSON.stringify({ linkedin, instagram }),
        contact_info: JSON.stringify({ emergencyName, emergencyPhone, street, postalCode, country }),
      });
    }
    setSaved(true);
    setTimeout(() => { setSaved(false); router.push('/profile'); }, 1500);
  };

  const inputStyle = { background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, color:t.text };

  const displayOptions = [
    { id: 'card' as const, label: 'Card View', desc: 'Large cards with full details' },
    { id: 'list' as const, label: 'List View', desc: 'Compact rows' },
    { id: 'grid' as const, label: 'Grid View', desc: '2-column grid' },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} style={{ background:'none', border:'none', color:t.text, cursor:'pointer' }}><IcoBack size={20} /></button>
        <h1 className="text-xl font-bold">Edit Profile</h1>
      </div>

      {saved && <div className="p-3 rounded-xl text-center text-sm font-semibold" style={{ background:'rgba(34,197,94,0.15)', color:'#22c55e' }}>✓ Profile saved successfully!</div>}

      {/* Profile Photo & Avatar */}
      <div className="glass-card rounded-2xl p-5" style={{ background:t.card, borderColor:t.cardBorder }}>
        <h3 className="font-semibold text-sm mb-3">Profile Photo</h3>
        <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
        <div className="flex items-center gap-4">
          <div onClick={() => photoInputRef.current?.click()} className="relative cursor-pointer" style={{ width:72, height:72, borderRadius:20, overflow:'hidden', border:`2px dashed ${t.accent}55`, display:'flex', alignItems:'center', justifyContent:'center', background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.02)' }}>
            {profilePhoto ? <img src={profilePhoto} alt="Profile" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            : selectedAvatar ? <span style={{ fontSize:36 }}>{selectedAvatar}</span>
            : <IcoCamera size={24} color={t.textMuted} />}
            <div style={{ position:'absolute', bottom:0, left:0, right:0, background:'rgba(0,0,0,0.5)', padding:2, textAlign:'center' }}><span style={{ fontSize:8, color:'white', fontWeight:600 }}>CHANGE</span></div>
          </div>
          <div className="flex-1 space-y-2">
            <button onClick={() => photoInputRef.current?.click()} className="w-full py-2 rounded-xl text-xs font-medium" style={{ background:t.accentLight, color:t.accent, border:`1px solid ${t.accent}33` }}>📷 Upload Photo</button>
            <button onClick={() => setShowAvatars(!showAvatars)} className="w-full py-2 rounded-xl text-xs font-medium" style={{ background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)', color:t.textSecondary, border:`1px solid ${t.cardBorder}` }}>😊 Choose Avatar</button>
          </div>
        </div>
        {showAvatars && (
          <div className="mt-3 grid grid-cols-6 gap-2">
            {AVATARS.map(a => (
              <button key={a} onClick={() => selectAvatar(a)} className="h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background:selectedAvatar===a?t.accentLight:(isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.02)'), border:`1px solid ${selectedAvatar===a?t.accent+'55':t.cardBorder}` }}>{a}</button>
            ))}
          </div>
        )}
      </div>

      {/* Basic Info */}
      <div className="glass-card rounded-2xl p-5 space-y-3" style={{ background:t.card, borderColor:t.cardBorder }}>
        <h3 className="font-semibold text-sm">Basic Information</h3>
        <div>
          <label className="text-xs font-medium" style={{ color:t.textMuted }}>Full Name *</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="w-full mt-1 p-3 rounded-xl text-sm outline-none" style={inputStyle} />
        </div>
        <div>
          <label className="text-xs font-medium" style={{ color:t.textMuted }}>Bio</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} placeholder="Tell others about yourself..." className="w-full mt-1 p-3 rounded-xl text-sm outline-none resize-none" style={inputStyle} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className="text-xs font-medium" style={{ color:t.textMuted }}>Phone</label><input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (416) 000-0000" className="w-full mt-1 p-3 rounded-xl text-sm outline-none" style={inputStyle} /></div>
          <div><label className="text-xs font-medium" style={{ color:t.textMuted }}>Date of Birth</label><input type="date" className="w-full mt-1 p-3 rounded-xl text-sm outline-none" style={inputStyle} /></div>
        </div>
      </div>

      {/* Address */}
      <div className="glass-card rounded-2xl p-5 space-y-3" style={{ background:t.card, borderColor:t.cardBorder }}>
        <h3 className="font-semibold text-sm">📍 Address</h3>
        <div><label className="text-xs font-medium" style={{ color:t.textMuted }}>Street Address</label><input value={street} onChange={e => setStreet(e.target.value)} placeholder="123 Main Street, Apt 4" className="w-full mt-1 p-3 rounded-xl text-sm outline-none" style={inputStyle} /></div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className="text-xs font-medium" style={{ color:t.textMuted }}>City</label><select value={city} onChange={e => setCity(e.target.value)} className="w-full mt-1 p-3 rounded-xl text-sm outline-none" style={inputStyle}>{CITIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          <div><label className="text-xs font-medium" style={{ color:t.textMuted }}>Province</label><input value={province} onChange={e => setProvince(e.target.value)} className="w-full mt-1 p-3 rounded-xl text-sm outline-none" style={inputStyle} /></div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className="text-xs font-medium" style={{ color:t.textMuted }}>Postal Code</label><input value={postalCode} onChange={e => setPostalCode(e.target.value)} placeholder="M5V 1A1" className="w-full mt-1 p-3 rounded-xl text-sm outline-none" style={inputStyle} /></div>
          <div><label className="text-xs font-medium" style={{ color:t.textMuted }}>Country</label><input value={country} onChange={e => setCountry(e.target.value)} className="w-full mt-1 p-3 rounded-xl text-sm outline-none" style={inputStyle} /></div>
        </div>
      </div>

      {/* Education */}
      <div className="glass-card rounded-2xl p-5 space-y-3" style={{ background:t.card, borderColor:t.cardBorder }}>
        <h3 className="font-semibold text-sm">🎓 Education</h3>
        <div><label className="text-xs font-medium" style={{ color:t.textMuted }}>School / University</label><input value={school} onChange={e => setSchool(e.target.value)} placeholder="University of Toronto" className="w-full mt-1 p-3 rounded-xl text-sm outline-none" style={inputStyle} /></div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className="text-xs font-medium" style={{ color:t.textMuted }}>Degree</label><select value={degree} onChange={e => setDegree(e.target.value)} className="w-full mt-1 p-3 rounded-xl text-sm outline-none" style={inputStyle}><option value="">Select...</option>{DEGREES.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
          <div><label className="text-xs font-medium" style={{ color:t.textMuted }}>Graduation Year</label><input value={gradYear} onChange={e => setGradYear(e.target.value)} placeholder="2024" className="w-full mt-1 p-3 rounded-xl text-sm outline-none" style={inputStyle} /></div>
        </div>
        <div><label className="text-xs font-medium" style={{ color:t.textMuted }}>Field of Study</label><input value={fieldOfStudy} onChange={e => setFieldOfStudy(e.target.value)} placeholder="Computer Science" className="w-full mt-1 p-3 rounded-xl text-sm outline-none" style={inputStyle} /></div>
      </div>

      {/* Languages */}
      <div className="glass-card rounded-2xl p-5 space-y-3" style={{ background:t.card, borderColor:t.cardBorder }}>
        <h3 className="font-semibold text-sm">🌐 Languages</h3>
        <div className="flex flex-wrap gap-2">
          {LANGS.map(l => <button key={l} onClick={() => toggleLang(l)} className="px-3 py-1.5 rounded-xl text-xs font-medium" style={{ background:languages.includes(l)?t.accentLight:(isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)'), color:languages.includes(l)?t.accent:t.textSecondary, border:`1px solid ${languages.includes(l)?t.accent+'44':t.cardBorder}` }}>{l}</button>)}
        </div>
      </div>

      {/* Skills */}
      <div className="glass-card rounded-2xl p-5 space-y-3" style={{ background:t.card, borderColor:t.cardBorder }}>
        <h3 className="font-semibold text-sm">🛠 Skills</h3>
        <div className="flex flex-wrap gap-2">
          {allSkills.map(s => <button key={s} onClick={() => toggleSkill(s)} className="px-3 py-1.5 rounded-xl text-xs font-medium" style={{ background:skills.includes(s)?t.accentLight:(isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)'), color:skills.includes(s)?t.accent:t.textSecondary, border:`1px solid ${skills.includes(s)?t.accent+'44':t.cardBorder}` }}>{s}</button>)}
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="glass-card rounded-2xl p-5 space-y-3" style={{ background:t.card, borderColor:t.cardBorder }}>
        <h3 className="font-semibold text-sm">🆘 Emergency Contact</h3>
        <p className="text-[10px]" style={{ color:t.textMuted }}>Visible only during SOS events</p>
        <div className="grid grid-cols-2 gap-2">
          <div><label className="text-xs font-medium" style={{ color:t.textMuted }}>Name</label><input value={emergencyName} onChange={e => setEmergencyName(e.target.value)} placeholder="Contact name" className="w-full mt-1 p-3 rounded-xl text-sm outline-none" style={inputStyle} /></div>
          <div><label className="text-xs font-medium" style={{ color:t.textMuted }}>Phone</label><input value={emergencyPhone} onChange={e => setEmergencyPhone(e.target.value)} placeholder="+1 (416) 000-0000" className="w-full mt-1 p-3 rounded-xl text-sm outline-none" style={inputStyle} /></div>
        </div>
      </div>

      {/* Social Links */}
      <div className="glass-card rounded-2xl p-5 space-y-3" style={{ background:t.card, borderColor:t.cardBorder }}>
        <h3 className="font-semibold text-sm">🔗 Social Links (Optional)</h3>
        <div><label className="text-xs font-medium" style={{ color:t.textMuted }}>LinkedIn</label><input value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/yourname" className="w-full mt-1 p-3 rounded-xl text-sm outline-none" style={inputStyle} /></div>
        <div><label className="text-xs font-medium" style={{ color:t.textMuted }}>Instagram</label><input value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="@yourhandle" className="w-full mt-1 p-3 rounded-xl text-sm outline-none" style={inputStyle} /></div>
      </div>

      {/* Job Display Preference */}
      <div className="glass-card rounded-2xl p-5 space-y-3" style={{ background:t.card, borderColor:t.cardBorder }}>
        <h3 className="font-semibold text-sm">Job Display Preference</h3>
        <div className="space-y-2">
          {displayOptions.map(opt => (
            <button key={opt.id} onClick={() => setDisplayPref(opt.id)} className="w-full p-3 rounded-xl text-left flex items-center gap-3" style={{ background:displayPref===opt.id?t.accentLight:(isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.02)'), border:`1px solid ${displayPref===opt.id?t.accent+'55':t.cardBorder}` }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ background:displayPref===opt.id?t.accent:t.surface, color:displayPref===opt.id?'white':t.textMuted }}>{opt.id[0].toUpperCase()}</div>
              <div><p className="text-sm font-medium" style={{ color:displayPref===opt.id?t.accent:t.text }}>{opt.label}</p><p className="text-[10px]" style={{ color:t.textMuted }}>{opt.desc}</p></div>
              {displayPref===opt.id && <span className="ml-auto text-sm font-bold" style={{ color:t.accent }}>✓</span>}
            </button>
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
