/* ═══════════════════════════════════════════════════════════════
   PROGRESSIVE ONBOARDING & TRUST SYSTEM
   ═══════════════════════════════════════════════════════════════
   - 5 trust tiers with progressive verification
   - Verification badges (identity, skills, background)
   - Onboarding flow with minimal friction
   - Trust score calculation engine
   - Feature gating by trust level
   ═══════════════════════════════════════════════════════════════ */

// ═══ Trust Tiers ═══
export type TrustTier = 'newcomer' | 'basic' | 'verified' | 'trusted' | 'elite';

export interface TrustTierDef {
  tier: TrustTier;
  label: string;
  icon: string;
  color: string;
  minScore: number;
  maxScore: number;
  badge: string;
  requirements: string[];
  perks: string[];
}

export const TRUST_TIERS: TrustTierDef[] = [
  {
    tier:'newcomer', label:'Newcomer', icon:'🌱', color:'#94a3b8', minScore:0, maxScore:29,
    badge:'New',
    requirements:['Create account', 'Set display name'],
    perks:['Browse marketplace', 'View profiles', 'Basic search'],
  },
  {
    tier:'basic', label:'Basic Member', icon:'⭐', color:'#22c55e', minScore:30, maxScore:59,
    badge:'Basic',
    requirements:['Complete profile', 'Add avatar', 'Verify email'],
    perks:['Post jobs', 'Message workers', 'Join communities', 'Leave reviews'],
  },
  {
    tier:'verified', label:'Verified', icon:'✅', color:'#3b82f6', minScore:60, maxScore:79,
    badge:'Verified',
    requirements:['Phone verification', 'ID verification (optional)', '5+ completed transactions'],
    perks:['Priority in search', 'Verified badge', 'Post listings', 'Create communities'],
  },
  {
    tier:'trusted', label:'Trusted Pro', icon:'🛡️', color:'#8b5cf6', minScore:80, maxScore:94,
    badge:'Trusted',
    requirements:['Background check (workers)', '20+ positive reviews', 'Active 6+ months'],
    perks:['Featured placements', 'Higher job limits', 'Dispute priority', 'Analytics access'],
  },
  {
    tier:'elite', label:'Elite', icon:'💎', color:'#f59e0b', minScore:95, maxScore:100,
    badge:'Elite',
    requirements:['Consistently rated 4.8+', '50+ completed jobs', 'Community leader'],
    perks:['Top of search', 'Elite badge', 'Early access features', 'Revenue sharing', 'Priority support'],
  },
];

// ═══ Get Tier for Score ═══
export function getTrustTier(score: number): TrustTierDef {
  return TRUST_TIERS.find(t => score >= t.minScore && score <= t.maxScore) || TRUST_TIERS[0];
}

// ═══ Verification Types ═══
export type VerificationType = 'email' | 'phone' | 'identity' | 'address' | 'skills' | 'background' | 'police';

export interface VerificationStep {
  type: VerificationType;
  label: string;
  icon: string;
  description: string;
  scoreBonus: number;
  required: boolean; // required for workers
  estimatedTime: string;
}

export const VERIFICATION_STEPS: VerificationStep[] = [
  { type:'email', label:'Email Verified', icon:'📧', description:'Confirm your email address', scoreBonus:10, required:true, estimatedTime:'1 min' },
  { type:'phone', label:'Phone Verified', icon:'📱', description:'Verify via SMS code', scoreBonus:10, required:true, estimatedTime:'2 min' },
  { type:'identity', label:'ID Verification', icon:'🪪', description:'Upload government ID (encrypted)', scoreBonus:15, required:false, estimatedTime:'5 min' },
  { type:'address', label:'Address Verified', icon:'🏠', description:'Confirm your location', scoreBonus:5, required:false, estimatedTime:'2 min' },
  { type:'skills', label:'Skills Certified', icon:'🎓', description:'Upload certifications', scoreBonus:10, required:false, estimatedTime:'5 min' },
  { type:'background', label:'Background Check', icon:'🔍', description:'Third-party background screening', scoreBonus:20, required:false, estimatedTime:'3-5 days' },
  { type:'police', label:'Police Verification', icon:'👮', description:'Police clearance certificate', scoreBonus:15, required:false, estimatedTime:'7-14 days' },
];

// ═══ Onboarding Steps ═══
export type OnboardingStep = 'welcome' | 'account_type' | 'profile_basics' | 'avatar' | 'interests' | 'verification' | 'tour' | 'complete';

export interface OnboardingProgress {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  accountType: 'seeker' | 'provider' | 'both';
  verifications: VerificationType[];
  profileComplete: number; // 0-100
  trustScore: number;
}

export const ONBOARDING_STEPS: { step:OnboardingStep; label:string; icon:string; required:boolean }[] = [
  { step:'welcome', label:'Welcome', icon:'👋', required:true },
  { step:'account_type', label:'I want to...', icon:'🎯', required:true },
  { step:'profile_basics', label:'About You', icon:'👤', required:true },
  { step:'avatar', label:'Your Look', icon:'🖼️', required:false },
  { step:'interests', label:'Interests', icon:'💡', required:true },
  { step:'verification', label:'Get Verified', icon:'✅', required:false },
  { step:'tour', label:'Quick Tour', icon:'🗺️', required:false },
  { step:'complete', label:'All Set!', icon:'🎉', required:true },
];

// ═══ Trust Score Calculator ═══
export interface TrustScoreFactors {
  profileComplete: number;    // 0-100
  emailVerified: boolean;
  phoneVerified: boolean;
  idVerified: boolean;
  backgroundCheck: boolean;
  policeVerified: boolean;
  completedJobs: number;
  positiveReviews: number;
  totalReviews: number;
  accountAgeDays: number;
  reportCount: number;
  communityContributions: number;
}

export function calculateTrustScore(factors: TrustScoreFactors): { score:number; breakdown:Record<string,number> } {
  const breakdown: Record<string, number> = {};
  
  // Profile completeness (max 15)
  breakdown.profile = Math.round((factors.profileComplete / 100) * 15);
  
  // Verifications (max 35)
  breakdown.emailVerified = factors.emailVerified ? 5 : 0;
  breakdown.phoneVerified = factors.phoneVerified ? 5 : 0;
  breakdown.idVerified = factors.idVerified ? 10 : 0;
  breakdown.backgroundCheck = factors.backgroundCheck ? 10 : 0;
  breakdown.policeVerified = factors.policeVerified ? 5 : 0;
  
  // Activity (max 25)
  breakdown.completedJobs = Math.min(15, factors.completedJobs * 0.3);
  breakdown.accountAge = Math.min(10, factors.accountAgeDays / 30);
  
  // Reputation (max 20)
  const reviewRate = factors.totalReviews > 0 ? factors.positiveReviews / factors.totalReviews : 0;
  breakdown.reviews = Math.round(reviewRate * Math.min(15, factors.totalReviews * 0.5));
  breakdown.community = Math.min(5, factors.communityContributions * 0.5);
  
  // Penalties (negative)
  breakdown.reports = -(factors.reportCount * 5);
  
  const rawScore = Object.values(breakdown).reduce((a, b) => a + b, 0);
  const score = Math.max(0, Math.min(100, Math.round(rawScore)));
  
  return { score, breakdown };
}

// ═══ Feature Gates ═══
export interface FeatureGate {
  feature: string;
  minTier: TrustTier;
  minScore: number;
}

const FEATURE_GATES: FeatureGate[] = [
  { feature:'browse_marketplace', minTier:'newcomer', minScore:0 },
  { feature:'send_messages', minTier:'basic', minScore:20 },
  { feature:'post_jobs', minTier:'basic', minScore:30 },
  { feature:'leave_reviews', minTier:'basic', minScore:30 },
  { feature:'create_listings', minTier:'verified', minScore:50 },
  { feature:'create_communities', minTier:'verified', minScore:60 },
  { feature:'featured_placement', minTier:'trusted', minScore:80 },
  { feature:'analytics_access', minTier:'trusted', minScore:80 },
  { feature:'revenue_sharing', minTier:'elite', minScore:95 },
];

export function canAccessFeature(trustScore: number, feature: string): { allowed:boolean; requiredScore:number; requiredTier:TrustTier } {
  const gate = FEATURE_GATES.find(g => g.feature === feature);
  if (!gate) return { allowed:true, requiredScore:0, requiredTier:'newcomer' };
  return { allowed:trustScore >= gate.minScore, requiredScore:gate.minScore, requiredTier:gate.minTier };
}

// ═══ Onboarding Completion Check ═══
export function getOnboardingProgress(data: {
  name?:string; email?:string; avatar?:string; interests?:string[];
  emailVerified?:boolean; phoneVerified?:boolean; accountType?:string;
}): { percent:number; nextStep:OnboardingStep; completed:OnboardingStep[] } {
  const completed: OnboardingStep[] = ['welcome'];
  let score = 10;
  
  if (data.accountType) { completed.push('account_type'); score += 15; }
  if (data.name && data.email) { completed.push('profile_basics'); score += 20; }
  if (data.avatar) { completed.push('avatar'); score += 10; }
  if (data.interests && data.interests.length >= 2) { completed.push('interests'); score += 15; }
  if (data.emailVerified || data.phoneVerified) { completed.push('verification'); score += 20; }
  
  const allRequired = ONBOARDING_STEPS.filter(s => s.required && s.step !== 'complete');
  const requiredDone = allRequired.filter(s => completed.includes(s.step)).length;
  if (requiredDone >= allRequired.length) { completed.push('complete'); score = 100; }
  
  const nextStep = ONBOARDING_STEPS.find(s => !completed.includes(s.step))?.step || 'complete';
  return { percent:Math.min(100, score), nextStep, completed };
}
