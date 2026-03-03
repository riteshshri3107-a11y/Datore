/* ═══════════════════════════════════════════════════════════════
   COMPLIANCE & PRIVACY — GDPR / PIPEDA / Data Rights
   ═══════════════════════════════════════════════════════════════
   GDPR (EU): General Data Protection Regulation
   PIPEDA (Canada): Personal Information Protection & Electronic Documents Act
   
   Features: Consent management, data export, right to delete,
             data retention policies, cookie consent, privacy notices,
             breach notification, DPO contact
   ═══════════════════════════════════════════════════════════════ */

import { track, log } from './observability';
import { publish } from './eventBus';

// ═══ Types ═══
export type ConsentPurpose = 'essential' | 'analytics' | 'marketing' | 'personalization' | 'third_party' | 'communications';
export type DataCategory = 'profile' | 'posts' | 'messages' | 'payments' | 'reviews' | 'jobs' | 'listings' | 'location' | 'search_history' | 'device_info' | 'moderation';
export type LegalBasis = 'consent' | 'contract' | 'legitimate_interest' | 'legal_obligation' | 'vital_interest' | 'public_interest';
export type PrivacyRegime = 'gdpr' | 'pipeda' | 'ccpa' | 'general';
export type RequestType = 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction' | 'objection';

export interface ConsentRecord {
  userId: string;
  purpose: ConsentPurpose;
  granted: boolean;
  legalBasis: LegalBasis;
  timestamp: number;
  expiresAt?: number;
  source: string;           // 'cookie_banner', 'settings', 'signup', 'api'
  ipAddress?: string;
  version: string;           // consent policy version
}

export interface DataSubjectRequest {
  id: string;
  userId: string;
  type: RequestType;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  regime: PrivacyRegime;
  requestedAt: number;
  completedAt?: number;
  responseDeadline: number;  // GDPR: 30 days, PIPEDA: 30 days
  details?: string;
  attachments?: string[];
}

export interface DataRetentionPolicy {
  category: DataCategory;
  retentionDays: number;
  legalBasis: LegalBasis;
  description: string;
  autoDelete: boolean;
}

// ═══ Consent Store (in-memory — production: Supabase) ═══
const consentStore = new Map<string, ConsentRecord[]>(); // userId → consents
const dsrQueue: DataSubjectRequest[] = [];

// ═══ Consent Purposes Definition ═══
export const CONSENT_PURPOSES: Record<ConsentPurpose, {
  name:string; description:string; required:boolean; legalBasis:LegalBasis; defaultGranted:boolean;
}> = {
  essential: {
    name: 'Essential Services',
    description: 'Required for account security, authentication, and core functionality.',
    required: true, legalBasis: 'contract', defaultGranted: true,
  },
  analytics: {
    name: 'Analytics & Performance',
    description: 'Helps us understand how the platform is used and improve performance.',
    required: false, legalBasis: 'consent', defaultGranted: false,
  },
  marketing: {
    name: 'Marketing Communications',
    description: 'Promotional emails, offers, and newsletters.',
    required: false, legalBasis: 'consent', defaultGranted: false,
  },
  personalization: {
    name: 'Personalization',
    description: 'Tailored job recommendations, feed customization, and search results.',
    required: false, legalBasis: 'consent', defaultGranted: false,
  },
  third_party: {
    name: 'Third-Party Services',
    description: 'Integration with payment processors, map services, and communication tools.',
    required: false, legalBasis: 'consent', defaultGranted: false,
  },
  communications: {
    name: 'Service Notifications',
    description: 'Job updates, booking confirmations, and safety alerts.',
    required: true, legalBasis: 'contract', defaultGranted: true,
  },
};

// ═══ Data Retention Policies ═══
export const RETENTION_POLICIES: DataRetentionPolicy[] = [
  { category:'profile', retentionDays:0, legalBasis:'contract', description:'Retained while account is active', autoDelete:false },
  { category:'posts', retentionDays:730, legalBasis:'consent', description:'2 years after creation', autoDelete:true },
  { category:'messages', retentionDays:365, legalBasis:'contract', description:'1 year for dispute resolution', autoDelete:true },
  { category:'payments', retentionDays:2555, legalBasis:'legal_obligation', description:'7 years (tax/audit requirements)', autoDelete:false },
  { category:'reviews', retentionDays:1095, legalBasis:'legitimate_interest', description:'3 years for trust ecosystem', autoDelete:true },
  { category:'jobs', retentionDays:365, legalBasis:'contract', description:'1 year after completion', autoDelete:true },
  { category:'listings', retentionDays:180, legalBasis:'contract', description:'6 months after sold/expired', autoDelete:true },
  { category:'location', retentionDays:90, legalBasis:'consent', description:'3 months for service matching', autoDelete:true },
  { category:'search_history', retentionDays:90, legalBasis:'consent', description:'3 months for personalization', autoDelete:true },
  { category:'device_info', retentionDays:365, legalBasis:'legitimate_interest', description:'1 year for security', autoDelete:true },
  { category:'moderation', retentionDays:1095, legalBasis:'legitimate_interest', description:'3 years for safety records', autoDelete:false },
];

// ═══ Record Consent ═══
export function recordConsent(
  userId: string,
  purpose: ConsentPurpose,
  granted: boolean,
  source: string = 'settings'
): ConsentRecord {
  const record: ConsentRecord = {
    userId, purpose, granted,
    legalBasis: CONSENT_PURPOSES[purpose].legalBasis,
    timestamp: Date.now(),
    source,
    version: '2.0', // Increment when policy changes
  };

  const userConsents = consentStore.get(userId) || [];
  // Remove old consent for same purpose
  const filtered = userConsents.filter(c => c.purpose !== purpose);
  filtered.push(record);
  consentStore.set(userId, filtered);

  track('consent_recorded', { userId:userId.slice(0,8), purpose, granted, source });
  log('info', `Consent ${granted?'granted':'revoked'}: ${purpose}`, { userId:userId.slice(0,8), source }, 'compliance');

  return record;
}

// ═══ Batch Consent (from cookie banner) ═══
export function recordBatchConsent(
  userId: string,
  consents: Record<ConsentPurpose, boolean>,
  source: string = 'cookie_banner'
): ConsentRecord[] {
  const records: ConsentRecord[] = [];
  for (const [purpose, granted] of Object.entries(consents)) {
    // Can't revoke essential/communications
    if (CONSENT_PURPOSES[purpose as ConsentPurpose]?.required && !granted) continue;
    records.push(recordConsent(userId, purpose as ConsentPurpose, granted, source));
  }
  return records;
}

// ═══ Check Consent ═══
export function hasConsent(userId: string, purpose: ConsentPurpose): boolean {
  // Essential services always allowed
  if (CONSENT_PURPOSES[purpose]?.required) return true;
  const consents = consentStore.get(userId) || [];
  const latest = consents.find(c => c.purpose === purpose);
  if (!latest) return CONSENT_PURPOSES[purpose]?.defaultGranted || false;
  if (latest.expiresAt && Date.now() > latest.expiresAt) return false;
  return latest.granted;
}

// ═══ Get User's Consent State ═══
export function getUserConsents(userId: string): Record<ConsentPurpose, { granted:boolean; timestamp:number; source:string }> {
  const consents = consentStore.get(userId) || [];
  const result: any = {};
  for (const [purpose, def] of Object.entries(CONSENT_PURPOSES)) {
    const record = consents.find(c => c.purpose === purpose);
    result[purpose] = {
      granted: record ? record.granted : def.defaultGranted,
      timestamp: record?.timestamp || 0,
      source: record?.source || 'default',
    };
  }
  return result;
}

// ═══ Data Subject Request (DSAR) ═══
export function createDSR(
  userId: string,
  type: RequestType,
  regime: PrivacyRegime = 'pipeda',
  details?: string
): DataSubjectRequest {
  const dsr: DataSubjectRequest = {
    id: `dsr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,6)}`,
    userId, type, regime,
    status: 'pending',
    requestedAt: Date.now(),
    responseDeadline: Date.now() + 30 * 86400_000, // 30 days
    details,
  };
  dsrQueue.push(dsr);
  track('dsr_created', { type, regime, userId:userId.slice(0,8) });
  log('info', `DSR created: ${type}`, { id:dsr.id, regime }, 'compliance');
  publish('system', 'compliance.dsr_created', { dsrId:dsr.id, type, regime });
  return dsr;
}

// ═══ Data Export (Right to Portability) ═══
export interface DataExport {
  userId: string;
  exportedAt: number;
  format: 'json' | 'csv';
  categories: DataCategory[];
  data: Record<DataCategory, any>;
  metadata: {
    totalRecords: number;
    regime: PrivacyRegime;
    requestId?: string;
  };
}

export function generateDataExport(
  userId: string,
  categories: DataCategory[] = ['profile','posts','messages','reviews','jobs','listings'],
  format: 'json' | 'csv' = 'json'
): DataExport {
  // In production: query Supabase for each category
  const data: Record<string, any> = {};
  let totalRecords = 0;

  for (const cat of categories) {
    // Placeholder — real implementation fetches from DB
    data[cat] = { message:`Export of ${cat} data for user ${userId.slice(0,8)}...`, records:0, note:'Connect to Supabase for real data' };
    totalRecords += data[cat].records || 0;
  }

  const exp: DataExport = {
    userId, exportedAt:Date.now(), format, categories,
    data: data as Record<DataCategory, any>,
    metadata: { totalRecords, regime:'pipeda' },
  };

  track('data_exported', { userId:userId.slice(0,8), categories:categories.length, format });
  log('info', 'Data export generated', { userId:userId.slice(0,8), categories }, 'compliance');

  return exp;
}

// ═══ Right to Erasure (Delete Account) ═══
export interface ErasureResult {
  userId: string;
  deletedCategories: DataCategory[];
  retainedCategories: Array<{ category:DataCategory; reason:string; retainUntil:number }>;
  completedAt: number;
}

export function processErasure(userId: string): ErasureResult {
  const deleted: DataCategory[] = [];
  const retained: Array<{ category:DataCategory; reason:string; retainUntil:number }> = [];

  for (const policy of RETENTION_POLICIES) {
    if (policy.legalBasis === 'legal_obligation') {
      // Must retain for legal reasons
      retained.push({
        category: policy.category,
        reason: policy.description,
        retainUntil: Date.now() + policy.retentionDays * 86400_000,
      });
    } else {
      // Can delete
      deleted.push(policy.category);
      // In production: actually delete from Supabase
    }
  }

  // Clear consents
  consentStore.delete(userId);

  const result: ErasureResult = { userId, deletedCategories:deleted, retainedCategories:retained, completedAt:Date.now() };
  track('data_erased', { userId:userId.slice(0,8), deleted:deleted.length, retained:retained.length });
  log('info', 'Data erasure processed', { userId:userId.slice(0,8) }, 'compliance');
  publish('users', 'user.data_erased', { userId, deletedCategories:deleted });

  return result;
}

// ═══ Cookie Banner State ═══
export interface CookieBannerState {
  shown: boolean;
  consented: boolean;
  preferences: Record<ConsentPurpose, boolean>;
  version: string;
}

export function getDefaultBannerState(): CookieBannerState {
  return {
    shown: false,
    consented: false,
    preferences: {
      essential: true,
      communications: true,
      analytics: false,
      marketing: false,
      personalization: false,
      third_party: false,
    },
    version: '2.0',
  };
}

// ═══ Privacy Notice Versions ═══
export const PRIVACY_VERSIONS = [
  { version:'2.0', effectiveDate:'2025-06-01', summary:'Added PIPEDA compliance, India data localization, consent granularity' },
  { version:'1.1', effectiveDate:'2025-01-15', summary:'Updated data retention policies, added right to portability' },
  { version:'1.0', effectiveDate:'2024-09-01', summary:'Initial privacy policy' },
];

// ═══ Detect User's Privacy Regime ═══
export function detectRegime(countryCode: string): PrivacyRegime {
  const EU_COUNTRIES = ['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE'];
  if (EU_COUNTRIES.includes(countryCode.toUpperCase())) return 'gdpr';
  if (countryCode.toUpperCase() === 'CA') return 'pipeda';
  if (countryCode.toUpperCase() === 'US') return 'ccpa'; // California
  return 'general';
}

// ═══ Breach Notification ═══
export interface BreachNotification {
  id: string;
  detectedAt: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedUsers: number;
  dataTypes: DataCategory[];
  description: string;
  notifiedAt?: number;
  regulatoryNotifiedAt?: number; // GDPR: 72 hours, PIPEDA: "as soon as feasible"
}

export function reportBreach(breach: Omit<BreachNotification, 'id'>): BreachNotification {
  const full: BreachNotification = { id:`breach_${Date.now().toString(36)}`, ...breach };
  track('data_breach_reported', { severity:breach.severity, affectedUsers:breach.affectedUsers });
  log('critical', `DATA BREACH: ${breach.description}`, { severity:breach.severity, affected:breach.affectedUsers }, 'compliance');
  publish('system', 'compliance.breach_detected', full, { priority:'critical' });
  return full;
}

// ═══ Compliance Dashboard Stats ═══
export function getComplianceStats() {
  const allConsents = [...consentStore.values()].flat();
  const consentRates: Record<string, { granted:number; total:number }> = {};
  for (const c of allConsents) {
    if (!consentRates[c.purpose]) consentRates[c.purpose] = { granted:0, total:0 };
    consentRates[c.purpose].total++;
    if (c.granted) consentRates[c.purpose].granted++;
  }

  return {
    totalUsers: consentStore.size,
    totalConsents: allConsents.length,
    consentRates,
    pendingDSRs: dsrQueue.filter(d => d.status === 'pending').length,
    completedDSRs: dsrQueue.filter(d => d.status === 'completed').length,
    retentionPolicies: RETENTION_POLICIES.length,
    privacyVersion: PRIVACY_VERSIONS[0].version,
    dsrQueue: dsrQueue.slice(-20),
  };
}
