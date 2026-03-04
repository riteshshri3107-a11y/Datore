"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { useAuthStore } from '@/store/useAuthStore';
import { updateProfile } from '@/lib/supabase';
import { TRUST_TIERS, VERIFICATION_STEPS, ONBOARDING_STEPS, getTrustTier, calculateTrustScore, getOnboardingProgress, type OnboardingStep, type TrustScoreFactors } from '@/lib/onboarding';
import { IcoBack, IcoCheck, IcoShield, IcoUser, IcoStar } from '@/components/Icons';

const INTEREST_OPTIONS = ['Home Repair','Tutoring','Pet Care','Cooking','Tech Help','Cleaning','Babysitting','Gardening','Moving','Photography','Music','Fitness','Beauty','Auto','Events','Catering'];

export default function OnboardingPage() {
  const router = useRouter();
  const { isDark } = useThemeStore();
  const t = getTheme(isDark);
  const { user, profile } = useAuthStore();
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [accountType, setAccountType] = useState<'seeker'|'provider'|'both'>('seeker');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [verifications, setVerifications] = useState<string[]>(['email']);

  // Prefill from profile if available
  useEffect(() => {
    if (profile) {
      if (profile.name) setName(profile.name);
      if (profile.bio) setBio(profile.bio);
      if (profile.role) setAccountType(profile.role === 'worker' ? 'provider' : profile.role === 'both' ? 'both' : 'seeker');
      if (profile.interests) setInterests(profile.interests);
    }
  }, [profile]);

  const progress = getOnboardingProgress({ name, email:'user@example.com', avatar:name?'set':undefined, interests, emailVerified:verifications.includes('email'), phoneVerified:verifications.includes('phone'), accountType });
  const stepIdx = ONBOARDING_STEPS.findIndex(s => s.step === step);
  const factors: TrustScoreFactors = { profileComplete:progress.percent, emailVerified:verifications.includes('email'), phoneVerified:verifications.includes('phone'), idVerified:verifications.includes('identity'), backgroundCheck:verifications.includes('background'), policeVerified:verifications.includes('police'), completedJobs:0, positiveReviews:0, totalReviews:0, accountAgeDays:1, reportCount:0, communityContributions:0 };
  const trustResult = calculateTrustScore(factors);
  const tier = getTrustTier(trustResult.score);

  const goNext = () => {
    const nextIdx = Math.min(stepIdx + 1, ONBOARDING_STEPS.length - 1);
    setStep(ONBOARDING_STEPS[nextIdx].step);
  };
  const goBack = () => {
    const prevIdx = Math.max(stepIdx - 1, 0);
    setStep(ONBOARDING_STEPS[prevIdx].step);
  };

  return (
    <div className="space-y-4 animate-fade-in pb-10 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => stepIdx > 0 ? goBack() : router.back()} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:t.card }}><IcoBack size={18} color={t.textMuted} /></button>
        <div className="flex-1">
          <h1 className="text-lg font-bold">Get Started</h1>
          <p className="text-[10px]" style={{ color:t.textMuted }}>Step {stepIdx+1} of {ONBOARDING_STEPS.length}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold" style={{ color:tier.color }}>{tier.icon} {trustResult.score}</p>
          <p className="text-[9px]" style={{ color:t.textMuted }}>{tier.label}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex gap-1">
        {ONBOARDING_STEPS.map((s, i) => (
          <div key={s.step} className="flex-1 h-1.5 rounded-full" style={{ background:i <= stepIdx ? t.accent : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', transition:'all 0.3s' }} />
        ))}
      </div>

      {/* Step Content */}
      <div className="rounded-2xl p-6" style={{ background:t.card, border:`1px solid ${t.cardBorder}`, minHeight:300 }}>
        {/* Welcome */}
        {step === 'welcome' && (
          <div className="text-center space-y-4">
            <div className="text-5xl mb-2">👋</div>
            <h2 className="text-xl font-bold">Welcome to Datore!</h2>
            <p className="text-sm" style={{ color:t.textSecondary }}>Your verified community marketplace. Find trusted workers, post jobs, and connect with your neighborhood.</p>
            <div className="grid grid-cols-3 gap-3 mt-6">
              {[{icon:'🔒',label:'Verified & Safe'},{icon:'📍',label:'Local First'},{icon:'⭐',label:'Rated & Trusted'}].map(f => (
                <div key={f.label} className="p-3 rounded-xl" style={{ background:isDark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.02)' }}>
                  <p className="text-xl mb-1">{f.icon}</p>
                  <p className="text-[10px] font-medium" style={{ color:t.textSecondary }}>{f.label}</p>
                </div>
              ))}
            </div>
            <button onClick={goNext} className="btn-accent w-full py-3 rounded-xl text-sm mt-4">Let's Go →</button>
          </div>
        )}

        {/* Account Type */}
        {step === 'account_type' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">What brings you here?</h2>
            <p className="text-xs" style={{ color:t.textSecondary }}>You can always change this later</p>
            {[
              { key:'seeker' as const, icon:'🔍', label:'I need services', desc:'Find workers, post jobs, hire locally' },
              { key:'provider' as const, icon:'💪', label:'I offer services', desc:'Get hired, showcase skills, build reputation' },
              { key:'both' as const, icon:'🤝', label:'Both!', desc:'I want to find AND offer services' },
            ].map(opt => (
              <button key={opt.key} onClick={() => { setAccountType(opt.key); setTimeout(goNext, 300); }} className="w-full p-4 rounded-xl text-left flex items-center gap-3" style={{ background:accountType===opt.key?`${t.accent}10`:isDark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.02)', border:`2px solid ${accountType===opt.key?t.accent:t.cardBorder}`, transition:'all 0.2s' }}>
                <span className="text-2xl">{opt.icon}</span>
                <div><p className="text-sm font-bold">{opt.label}</p><p className="text-[10px]" style={{ color:t.textSecondary }}>{opt.desc}</p></div>
                {accountType===opt.key && <IcoCheck size={18} color={t.accent} />}
              </button>
            ))}
          </div>
        )}

        {/* Profile Basics */}
        {step === 'profile_basics' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">👤 About You</h2>
            <div>
              <label className="text-xs font-semibold block mb-1">Display Name *</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name or business name" className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)', border:`1px solid ${t.cardBorder}`, color:t.text }} />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">Short Bio</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell people about yourself..." rows={3} className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none" style={{ background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)', border:`1px solid ${t.cardBorder}`, color:t.text }} />
            </div>
            <button onClick={goNext} disabled={!name.trim()} className="btn-accent w-full py-3 rounded-xl text-sm" style={{ opacity:name.trim()?1:0.4 }}>Continue →</button>
          </div>
        )}

        {/* Avatar */}
        {step === 'avatar' && (
          <div className="space-y-4 text-center">
            <h2 className="text-lg font-bold">🖼️ Choose Your Look</h2>
            <p className="text-xs" style={{ color:t.textSecondary }}>Pick an avatar or upload a photo later</p>
            <div className="grid grid-cols-6 gap-2 mt-4">
              {['👨‍💼','👩‍💻','🧑‍🔬','👨‍🎨','👩‍🏫','🧑‍🚀','👨‍🍳','👩‍⚕️','🦸','🧑‍💼','👷','🧑‍🎤','👨‍🔧','👩‍🌾','🧑‍✈️','👮','🧑‍🏭','👩‍🎓'].map(emoji => (
                <button key={emoji} className="text-2xl w-12 h-12 rounded-xl flex items-center justify-center" style={{ background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)', border:`1px solid ${t.cardBorder}` }}>{emoji}</button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={goNext} className="flex-1 py-3 rounded-xl text-sm font-semibold" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', color:t.textSecondary }}>Skip for now</button>
              <button onClick={goNext} className="btn-accent flex-1 py-3 rounded-xl text-sm">Continue →</button>
            </div>
          </div>
        )}

        {/* Interests */}
        {step === 'interests' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">💡 What interests you?</h2>
            <p className="text-xs" style={{ color:t.textSecondary }}>Select at least 2 to personalize your experience</p>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map(i => {
                const active = interests.includes(i);
                return (
                  <button key={i} onClick={() => setInterests(active ? interests.filter(x=>x!==i) : [...interests,i])} className="px-3 py-2 rounded-xl text-xs font-medium" style={{ background:active?`${t.accent}15`:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)', color:active?t.accent:t.textSecondary, border:`1.5px solid ${active?t.accent+'44':t.cardBorder}` }}>{i}</button>
                );
              })}
            </div>
            <p className="text-[10px]" style={{ color:interests.length>=2?'#22c55e':t.textMuted }}>{interests.length}/2 minimum selected</p>
            <button onClick={goNext} disabled={interests.length<2} className="btn-accent w-full py-3 rounded-xl text-sm" style={{ opacity:interests.length>=2?1:0.4 }}>Continue →</button>
          </div>
        )}

        {/* Verification */}
        {step === 'verification' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">✅ Get Verified</h2>
            <p className="text-xs" style={{ color:t.textSecondary }}>Verification increases your trust score and visibility</p>
            <div className="space-y-2">
              {VERIFICATION_STEPS.map(v => {
                const done = verifications.includes(v.type);
                return (
                  <button key={v.type} onClick={() => setVerifications(done ? verifications.filter(x=>x!==v.type) : [...verifications, v.type])} className="w-full p-3 rounded-xl flex items-center gap-3 text-left" style={{ background:done?`${t.accent}08`:isDark?'rgba(255,255,255,0.02)':'rgba(0,0,0,0.01)', border:`1.5px solid ${done?'#22c55e44':t.cardBorder}` }}>
                    <span className="text-lg">{v.icon}</span>
                    <div className="flex-1">
                      <p className="text-xs font-bold">{v.label}</p>
                      <p className="text-[9px]" style={{ color:t.textMuted }}>{v.description} · {v.estimatedTime}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-bold" style={{ color:done?'#22c55e':'#f59e0b' }}>+{v.scoreBonus}</span>
                      {done && <IcoCheck size={16} color="#22c55e" />}
                    </div>
                  </button>
                );
              })}
            </div>
            <button onClick={goNext} className="btn-accent w-full py-3 rounded-xl text-sm">Continue →</button>
          </div>
        )}

        {/* Tour */}
        {step === 'tour' && (
          <div className="space-y-4 text-center">
            <h2 className="text-lg font-bold">🗺️ Quick Tour</h2>
            <div className="space-y-3 text-left">
              {[
                { icon:'🏠', title:'Home Feed', desc:'See posts, jobs, and updates from your community' },
                { icon:'💼', title:'Job Marketplace', desc:'Post jobs or find work with verified professionals' },
                { icon:'🛒', title:'Marketplace', desc:'Buy and sell products and services locally' },
                { icon:'👥', title:'Friends & Discover', desc:'Connect with nearby people — privacy first' },
                { icon:'🤖', title:'Dato AI', desc:'Your AI assistant — click the chat bubble anytime' },
              ].map(f => (
                <div key={f.title} className="flex items-center gap-3 p-2.5 rounded-xl" style={{ background:isDark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.02)' }}>
                  <span className="text-xl">{f.icon}</span>
                  <div><p className="text-xs font-bold">{f.title}</p><p className="text-[9px]" style={{ color:t.textSecondary }}>{f.desc}</p></div>
                </div>
              ))}
            </div>
            <button onClick={goNext} className="btn-accent w-full py-3 rounded-xl text-sm">Almost done →</button>
          </div>
        )}

        {/* Complete */}
        {step === 'complete' && (
          <div className="text-center space-y-4">
            <div className="text-5xl">🎉</div>
            <h2 className="text-xl font-bold">You're All Set!</h2>
            {/* Trust Score Card */}
            <div className="p-4 rounded-2xl" style={{ background:`linear-gradient(135deg,${tier.color}15,${tier.color}05)`, border:`1.5px solid ${tier.color}33` }}>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl">{tier.icon}</span>
                <span className="text-3xl font-bold" style={{ color:tier.color }}>{trustResult.score}</span>
              </div>
              <p className="text-sm font-bold" style={{ color:tier.color }}>{tier.label}</p>
              <p className="text-[10px] mt-1" style={{ color:t.textSecondary }}>{tier.badge} member</p>
              {/* Progress to next tier */}
              {trustResult.score < 95 && (
                <div className="mt-3">
                  <div className="h-2 rounded-full overflow-hidden" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.06)' }}>
                    <div className="h-full rounded-full" style={{ width:`${(trustResult.score/100)*100}%`, background:tier.color, transition:'all 0.5s' }} />
                  </div>
                  <p className="text-[9px] mt-1" style={{ color:t.textMuted }}>
                    {TRUST_TIERS.find(tt => tt.minScore > trustResult.score)?.minScore! - trustResult.score} points to {TRUST_TIERS.find(tt => tt.minScore > trustResult.score)?.label}
                  </p>
                </div>
              )}
            </div>
            {/* Score Breakdown */}
            <div className="text-left space-y-1">
              {Object.entries(trustResult.breakdown).filter(([_,v]) => v !== 0).map(([k,v]) => (
                <div key={k} className="flex justify-between text-[10px]">
                  <span style={{ color:t.textSecondary }}>{k.replace(/([A-Z])/g,' $1')}</span>
                  <span className="font-bold" style={{ color:v>0?'#22c55e':'#ef4444' }}>{v>0?'+':''}{Math.round(v)}</span>
                </div>
              ))}
            </div>
            <button onClick={async () => {
              if (user?.id) {
                try {
                  await updateProfile(user.id, {
                    name: name.trim() || undefined,
                    bio: bio.trim() || undefined,
                    role: accountType,
                    interests,
                    onboarding_completed: true,
                  });
                } catch {}
              }
              router.push('/home');
            }} className="btn-accent w-full py-3.5 rounded-xl text-sm mt-4">🚀 Start Exploring</button>
          </div>
        )}
      </div>

      {/* Trust Tier Preview (always visible) */}
      <div className="flex gap-1">
        {TRUST_TIERS.map(tt => (
          <div key={tt.tier} className="flex-1 text-center py-2 rounded-lg" style={{ background:trustResult.score >= tt.minScore ? `${tt.color}12` : isDark?'rgba(255,255,255,0.02)':'rgba(0,0,0,0.01)', border:`1px solid ${trustResult.score >= tt.minScore ? tt.color+'33' : t.cardBorder}` }}>
            <p className="text-xs">{tt.icon}</p>
            <p className="text-[8px] font-semibold" style={{ color:trustResult.score >= tt.minScore ? tt.color : t.textMuted }}>{tt.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
