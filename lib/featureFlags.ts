/* ═══════════════════════════════════════════════════════════════
   CANARY DEPLOYMENT — Feature Flags & Gradual Rollouts
   ═══════════════════════════════════════════════════════════════
   Phase 1 (Current): Client-side feature flag evaluation
   Phase 2: LaunchDarkly/Unleash integration
   Phase 3: A/B testing, experiment tracking, auto-rollback
   
   Features: percentage rollout, user targeting, kill switches,
             environment gates, time-based releases, metrics
   ═══════════════════════════════════════════════════════════════ */

import { track, log } from './observability';

// ═══ Types ═══
export type FlagStatus = 'enabled' | 'disabled' | 'canary' | 'scheduled' | 'killed';
export type Environment = 'development' | 'staging' | 'production';

export interface TargetingRule {
  attribute: string;          // 'userId', 'email', 'region', 'trustScore', 'role', 'accountAge'
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'nin' | 'contains' | 'matches';
  value: any;
}

export interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  status: FlagStatus;
  rolloutPercentage: number;  // 0-100 for canary
  environments: Environment[];
  targeting: TargetingRule[];  // AND logic — all must match
  schedule?: {
    enableAt?: number;        // Unix timestamp
    disableAt?: number;
  };
  killSwitch: boolean;        // Emergency disable
  metrics: {
    evaluations: number;
    enabled: number;
    disabled: number;
    errors: number;
  };
  createdAt: number;
  updatedAt: number;
  owner: string;
  tags: string[];
}

export interface FlagContext {
  userId?: string;
  email?: string;
  region?: string;
  trustScore?: number;
  role?: string;
  accountAgeDays?: number;
  environment?: Environment;
  attributes?: Record<string, any>;
}

// ═══ Feature Flag Registry ═══
const flags = new Map<string, FeatureFlag>();

// ═══ Current Environment ═══
const CURRENT_ENV: Environment = (process.env.NODE_ENV === 'production' ? 'production' : 'development') as Environment;

// ═══ Register Flags ═══
function registerFlag(flag: Omit<FeatureFlag, 'metrics' | 'createdAt' | 'updatedAt'>): FeatureFlag {
  const full: FeatureFlag = {
    ...flag,
    metrics: { evaluations:0, enabled:0, disabled:0, errors:0 },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  flags.set(flag.key, full);
  return full;
}

// ═══ Default Feature Flags ═══
const DEFAULT_FLAGS: Array<Omit<FeatureFlag, 'metrics' | 'createdAt' | 'updatedAt'>> = [
  {
    key: 'new_search_engine', name: 'New Search Engine', description: 'TF-IDF powered search with fuzzy matching',
    status: 'canary', rolloutPercentage: 50, environments: ['development','staging','production'],
    targeting: [], killSwitch: false, owner: 'platform', tags: ['search','performance'],
  },
  {
    key: 'ai_moderation_v2', name: 'AI Moderation V2', description: 'ML-powered content classification (replaces regex)',
    status: 'canary', rolloutPercentage: 20, environments: ['development','staging'],
    targeting: [{ attribute:'role', operator:'in', value:['admin','moderator'] }],
    killSwitch: false, owner: 'trust-safety', tags: ['moderation','ml'],
  },
  {
    key: 'payment_escrow', name: 'Payment Escrow', description: 'Hold funds until job completion',
    status: 'enabled', rolloutPercentage: 100, environments: ['development','staging','production'],
    targeting: [{ attribute:'trustScore', operator:'gte', value:30 }],
    killSwitch: false, owner: 'payments', tags: ['payments','trust'],
  },
  {
    key: 'video_calls', name: 'Video Calls', description: 'WebRTC video calls between workers and clients',
    status: 'disabled', rolloutPercentage: 0, environments: ['development'],
    targeting: [], killSwitch: false, owner: 'communications', tags: ['chat','video'],
  },
  {
    key: 'dark_mode_v2', name: 'Dark Mode V2', description: 'Refined dark theme with OLED blacks',
    status: 'canary', rolloutPercentage: 75, environments: ['development','staging','production'],
    targeting: [], killSwitch: false, owner: 'design', tags: ['ui','theme'],
  },
  {
    key: 'trust_badges_ui', name: 'Trust Badges UI', description: 'Visual trust tier badges on profiles and search',
    status: 'enabled', rolloutPercentage: 100, environments: ['development','staging','production'],
    targeting: [], killSwitch: false, owner: 'trust-safety', tags: ['trust','ui'],
  },
  {
    key: 'real_time_notifications', name: 'Real-time Notifications', description: 'WebSocket push notifications',
    status: 'canary', rolloutPercentage: 40, environments: ['development','staging'],
    targeting: [{ attribute:'trustScore', operator:'gte', value:50 }],
    killSwitch: false, owner: 'platform', tags: ['notifications','websocket'],
  },
  {
    key: 'multi_language', name: 'Multi-Language Support', description: 'Hindi, Punjabi, French, Tamil translations',
    status: 'scheduled', rolloutPercentage: 0, environments: ['development'],
    targeting: [{ attribute:'region', operator:'in', value:['in-west','in-south','ca-east'] }],
    schedule: { enableAt: Date.now() + 30 * 86400_000 }, // 30 days from now
    killSwitch: false, owner: 'i18n', tags: ['i18n','india','canada'],
  },
  {
    key: 'buddy_group_chat', name: 'Buddy Group Chat', description: 'Group messaging in buddy communities',
    status: 'canary', rolloutPercentage: 60, environments: ['development','staging','production'],
    targeting: [], killSwitch: false, owner: 'communities', tags: ['chat','communities'],
  },
  {
    key: 'analytics_dashboard', name: 'Analytics Dashboard', description: 'Worker/poster performance analytics',
    status: 'canary', rolloutPercentage: 30, environments: ['development','staging'],
    targeting: [{ attribute:'role', operator:'in', value:['worker','admin'] }],
    killSwitch: false, owner: 'analytics', tags: ['analytics','workers'],
  },
];

// Initialize flags
DEFAULT_FLAGS.forEach(registerFlag);

// ═══ Deterministic Hash (for consistent percentage rollout) ═══
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function isInRollout(flagKey: string, userId: string, percentage: number): boolean {
  if (percentage >= 100) return true;
  if (percentage <= 0) return false;
  const bucket = hashString(`${flagKey}:${userId}`) % 100;
  return bucket < percentage;
}

// ═══ Evaluate Targeting Rules ═══
function evaluateTargeting(rules: TargetingRule[], context: FlagContext): boolean {
  if (rules.length === 0) return true; // No rules = all pass

  return rules.every(rule => {
    const value = (context as any)[rule.attribute] ?? context.attributes?.[rule.attribute];
    if (value === undefined) return false;

    switch (rule.operator) {
      case 'eq': return value === rule.value;
      case 'neq': return value !== rule.value;
      case 'gt': return value > rule.value;
      case 'lt': return value < rule.value;
      case 'gte': return value >= rule.value;
      case 'lte': return value <= rule.value;
      case 'in': return Array.isArray(rule.value) && rule.value.includes(value);
      case 'nin': return Array.isArray(rule.value) && !rule.value.includes(value);
      case 'contains': return typeof value === 'string' && value.includes(rule.value);
      case 'matches': return typeof value === 'string' && new RegExp(rule.value).test(value);
      default: return false;
    }
  });
}

// ═══ Main Evaluation ═══
export function isEnabled(flagKey: string, context: FlagContext = {}): boolean {
  const flag = flags.get(flagKey);
  if (!flag) { track('flag_unknown', { key:flagKey }); return false; }

  flag.metrics.evaluations++;
  const env = context.environment || CURRENT_ENV;

  try {
    // Kill switch — immediate disable
    if (flag.killSwitch) { flag.metrics.disabled++; return false; }

    // Environment gate
    if (!flag.environments.includes(env)) { flag.metrics.disabled++; return false; }

    // Schedule check
    if (flag.schedule) {
      const now = Date.now();
      if (flag.schedule.enableAt && now < flag.schedule.enableAt) { flag.metrics.disabled++; return false; }
      if (flag.schedule.disableAt && now > flag.schedule.disableAt) { flag.metrics.disabled++; return false; }
    }

    // Status check
    if (flag.status === 'disabled' || flag.status === 'killed') { flag.metrics.disabled++; return false; }
    if (flag.status === 'enabled') {
      // Still check targeting rules
      if (!evaluateTargeting(flag.targeting, context)) { flag.metrics.disabled++; return false; }
      flag.metrics.enabled++;
      return true;
    }

    // Canary: targeting + percentage rollout
    if (flag.status === 'canary') {
      if (!evaluateTargeting(flag.targeting, context)) { flag.metrics.disabled++; return false; }
      const userId = context.userId || context.email || 'anonymous';
      const result = isInRollout(flagKey, userId, flag.rolloutPercentage);
      result ? flag.metrics.enabled++ : flag.metrics.disabled++;
      return result;
    }

    // Scheduled but within window
    if (flag.status === 'scheduled') {
      if (!evaluateTargeting(flag.targeting, context)) { flag.metrics.disabled++; return false; }
      flag.metrics.enabled++;
      return true;
    }

    flag.metrics.disabled++;
    return false;

  } catch (err: any) {
    flag.metrics.errors++;
    log('error', `Flag evaluation error: ${flagKey}`, { error:err.message }, 'featureFlags');
    return false; // Fail closed
  }
}

// ═══ Update Flag ═══
export function updateFlag(key: string, updates: Partial<FeatureFlag>) {
  const flag = flags.get(key);
  if (!flag) return null;
  Object.assign(flag, updates, { updatedAt:Date.now() });
  track('flag_updated', { key, ...updates });
  log('info', `Flag updated: ${key}`, updates, 'featureFlags');
  return flag;
}

// ═══ Kill Switch ═══
export function killFlag(key: string) {
  return updateFlag(key, { killSwitch:true, status:'killed' });
}

// ═══ Rollout Adjustments ═══
export function setRollout(key: string, percentage: number) {
  return updateFlag(key, { rolloutPercentage:Math.max(0, Math.min(100, percentage)) });
}

// ═══ Gradual Rollout (auto-increment) ═══
export function gradualRollout(key: string, incrementPercent: number = 10, intervalMs: number = 3600_000) {
  const flag = flags.get(key);
  if (!flag) return;
  const timer = setInterval(() => {
    const current = flags.get(key);
    if (!current || current.killSwitch || current.rolloutPercentage >= 100) {
      clearInterval(timer);
      return;
    }
    const newPct = Math.min(100, current.rolloutPercentage + incrementPercent);
    setRollout(key, newPct);
    log('info', `Gradual rollout: ${key} → ${newPct}%`, {}, 'featureFlags');
    // Auto-kill if error rate spikes (canary safety)
    if (current.metrics.errors > current.metrics.evaluations * 0.05) {
      killFlag(key);
      log('error', `Auto-killed flag ${key}: error rate > 5%`, { errors:current.metrics.errors }, 'featureFlags');
      clearInterval(timer);
    }
  }, intervalMs);
}

// ═══ Get All Flags ═══
export function getAllFlags(): FeatureFlag[] {
  return [...flags.values()];
}

// ═══ Get Flag Stats ═══
export function getFlagStats() {
  const all = getAllFlags();
  return {
    total: all.length,
    enabled: all.filter(f => f.status === 'enabled').length,
    canary: all.filter(f => f.status === 'canary').length,
    disabled: all.filter(f => f.status === 'disabled').length,
    killed: all.filter(f => f.killSwitch).length,
    scheduled: all.filter(f => f.status === 'scheduled').length,
    flags: all,
  };
}
