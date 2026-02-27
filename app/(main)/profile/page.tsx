"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { useAuthStore } from '@/store/useAuthStore';
import { getTheme } from '@/lib/theme';
import { getSession, getProfile } from '@/lib/supabase';

const ABOUT_TABS = ['Intro', 'Work', 'Education', 'Skills', 'Hobbies', 'Travel', 'Links', 'Contact'];

export default function ProfilePage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const [activeTab, setActiveTab] = useState('Intro');
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    getSession().then(async ({ data }) => {
      if (!data.session) { router.push('/login'); return; }
      const p = await getProfile(data.session.user.id);
      setProfile(p || { full_name: data.session.user.user_metadata?.full_name || 'User', email: data.session.user.email });
    });
  }, []);

  return (
    <div className="space-y-4 animate-fade-in max-w-lg mx-auto">
      {/* Profile Header */}
      <div className="glass-card rounded-2xl p-5 text-center" style={{ background: t.card, borderColor: t.cardBorder, boxShadow: t.glassShadow }}>
        <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-3xl font-bold mb-3"
          style={{ background: `linear-gradient(135deg, ${t.accent}44, #8b5cf644)`, color: t.accent }}>
          {profile?.full_name?.[0] || '?'}
        </div>
        <h2 className="text-xl font-bold">{profile?.full_name || 'Loading...'}</h2>
        <p className="text-sm" style={{ color: t.textSecondary }}>{profile?.email}</p>
        <div className="flex justify-center gap-6 mt-4">
          <div><p className="font-bold">0</p><p className="text-xs" style={{ color: t.textMuted }}>Jobs</p></div>
          <div><p className="font-bold">0</p><p className="text-xs" style={{ color: t.textMuted }}>Reviews</p></div>
          <div><p className="font-bold">50</p><p className="text-xs" style={{ color: t.textMuted }}>Trust</p></div>
        </div>
        <button onClick={() => router.push('/profile/edit')} className="btn-accent text-xs px-5 py-2 rounded-xl mt-4">Edit Profile</button>
      </div>

      {/* About Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {ABOUT_TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="glass-button px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap"
            style={{ background: activeTab === tab ? t.accentLight : t.surface, color: activeTab === tab ? t.accent : t.textSecondary }}>
            {tab}
          </button>
        ))}
      </div>

      <div className="glass-card rounded-2xl p-5" style={{ background: t.card, borderColor: t.cardBorder }}>
        <h3 className="font-semibold mb-3">{activeTab}</h3>
        <p className="text-sm" style={{ color: t.textSecondary }}>
          {activeTab === 'Intro' ? 'Add a short intro about yourself...' :
           activeTab === 'Work' ? 'Add your work experience...' :
           activeTab === 'Education' ? 'Add your education history...' :
           activeTab === 'Skills' ? 'Add your skills and certifications...' :
           activeTab === 'Hobbies' ? 'Share your hobbies and interests...' :
           activeTab === 'Travel' ? 'Places you\'ve been...' :
           activeTab === 'Links' ? 'Add your social links...' :
           'Add your contact information...'}
        </p>
        <button className="text-xs font-medium mt-3" style={{ color: t.accent }}>+ Add {activeTab}</button>
      </div>
    </div>
  );
}
