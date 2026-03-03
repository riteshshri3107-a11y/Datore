/* ═══════════════════════════════════════════════════════════════
   EVENT BUS — Kafka-Style Pub/Sub for Real-Time Updates
   ═══════════════════════════════════════════════════════════════
   Phase 1 (Current): In-memory event bus with typed channels
   Phase 2: Redis Pub/Sub + WebSocket gateway
   Phase 3: Kafka/Redpanda for durable event streaming
   
   Channels: jobs, payments, chat, notifications, moderation,
             users, listings, reviews, system
   Features: typed events, replay, dead-letter queue, middleware
   ═══════════════════════════════════════════════════════════════ */

import { track, log } from './observability';

// ═══ Types ═══
export type EventChannel =
  | 'jobs' | 'payments' | 'chat' | 'notifications' | 'moderation'
  | 'users' | 'listings' | 'reviews' | 'system' | 'analytics';

export type EventPriority = 'low' | 'normal' | 'high' | 'critical';

export interface BusEvent<T = any> {
  id: string;
  channel: EventChannel;
  type: string;         // e.g. 'job.created', 'payment.completed'
  payload: T;
  metadata: {
    timestamp: number;
    source: string;      // originating service/module
    userId?: string;
    correlationId?: string;
    priority: EventPriority;
    retryCount: number;
    maxRetries: number;
  };
}

export type EventHandler<T = any> = (event: BusEvent<T>) => Promise<void> | void;
export type EventMiddleware = (event: BusEvent, next: () => Promise<void>) => Promise<void>;

interface Subscription {
  id: string;
  channel: EventChannel;
  pattern: string;      // glob pattern: 'job.*', 'payment.completed', '*'
  handler: EventHandler;
  group?: string;       // consumer group (only one handler per group fires)
}

// ═══ Event Store (for replay & audit) ═══
const eventStore: BusEvent[] = [];
const MAX_STORE = 10_000;

// ═══ Subscriptions ═══
const subscriptions: Subscription[] = [];

// ═══ Dead Letter Queue ═══
const deadLetterQueue: Array<{ event:BusEvent; error:string; failedAt:number }> = [];
const MAX_DLQ = 500;

// ═══ Middleware Stack ═══
const middlewares: EventMiddleware[] = [];

// ═══ Consumer Group Tracking ═══
const groupCounters = new Map<string, number>(); // round-robin index

// ═══ Generate Event ID ═══
let eventCounter = 0;
function generateEventId(): string {
  eventCounter = (eventCounter + 1) % 999999;
  return `evt_${Date.now().toString(36)}_${eventCounter.toString(36)}`;
}

// ═══ Pattern Matching ═══
function matchPattern(pattern: string, eventType: string): boolean {
  if (pattern === '*') return true;
  if (pattern === eventType) return true;
  // Glob: 'job.*' matches 'job.created', 'job.updated'
  if (pattern.endsWith('.*')) {
    const prefix = pattern.slice(0, -2);
    return eventType.startsWith(prefix + '.');
  }
  return false;
}

// ═══ Publish Event ═══
export async function publish<T = any>(
  channel: EventChannel,
  type: string,
  payload: T,
  options?: {
    source?: string;
    userId?: string;
    correlationId?: string;
    priority?: EventPriority;
    maxRetries?: number;
  }
): Promise<BusEvent<T>> {
  const event: BusEvent<T> = {
    id: generateEventId(),
    channel,
    type,
    payload,
    metadata: {
      timestamp: Date.now(),
      source: options?.source || 'app',
      userId: options?.userId,
      correlationId: options?.correlationId || generateEventId(),
      priority: options?.priority || 'normal',
      retryCount: 0,
      maxRetries: options?.maxRetries ?? 3,
    },
  };

  // Store for replay
  eventStore.push(event);
  if (eventStore.length > MAX_STORE) eventStore.splice(0, eventStore.length - MAX_STORE);

  // Track
  track('event_published', { channel, type, priority:event.metadata.priority });

  // Execute middleware chain, then dispatch
  const dispatch = async () => {
    await dispatchEvent(event);
  };

  if (middlewares.length > 0) {
    let idx = 0;
    const runMiddleware = async (): Promise<void> => {
      if (idx < middlewares.length) {
        const mw = middlewares[idx++];
        await mw(event as BusEvent, runMiddleware);
      } else {
        await dispatch();
      }
    };
    await runMiddleware();
  } else {
    await dispatch();
  }

  return event;
}

// ═══ Dispatch to Subscribers ═══
async function dispatchEvent(event: BusEvent) {
  const matching = subscriptions.filter(
    s => s.channel === event.channel && matchPattern(s.pattern, event.type)
  );

  // Group handlers by consumer group
  const groups = new Map<string, Subscription[]>();
  const ungrouped: Subscription[] = [];

  for (const sub of matching) {
    if (sub.group) {
      const g = groups.get(sub.group) || [];
      g.push(sub);
      groups.set(sub.group, g);
    } else {
      ungrouped.push(sub);
    }
  }

  // Ungrouped: fire all
  const promises: Promise<void>[] = [];
  for (const sub of ungrouped) {
    promises.push(safeExecute(sub, event));
  }

  // Grouped: round-robin pick one per group
  for (const [groupName, subs] of groups.entries()) {
    const counter = groupCounters.get(groupName) || 0;
    const chosen = subs[counter % subs.length];
    groupCounters.set(groupName, counter + 1);
    promises.push(safeExecute(chosen, event));
  }

  await Promise.allSettled(promises);
}

// ═══ Safe Handler Execution with Retry ═══
async function safeExecute(sub: Subscription, event: BusEvent) {
  try {
    await Promise.resolve(sub.handler(event));
    track('event_handled', { channel:event.channel, type:event.type, handler:sub.id });
  } catch (err: any) {
    log('error', `Event handler failed: ${sub.id}`, { event:event.id, error:err.message }, 'eventBus');
    
    // Retry logic
    if (event.metadata.retryCount < event.metadata.maxRetries) {
      event.metadata.retryCount++;
      const delay = Math.min(1000 * Math.pow(2, event.metadata.retryCount), 30000); // Exponential backoff
      setTimeout(() => safeExecute(sub, event), delay);
      track('event_retry', { eventId:event.id, attempt:event.metadata.retryCount });
    } else {
      // Dead letter queue
      deadLetterQueue.push({ event, error:err.message, failedAt:Date.now() });
      if (deadLetterQueue.length > MAX_DLQ) deadLetterQueue.splice(0, deadLetterQueue.length - MAX_DLQ);
      track('event_dead_lettered', { eventId:event.id, channel:event.channel, type:event.type });
      log('warn', `Event dead-lettered: ${event.id}`, { type:event.type, error:err.message }, 'eventBus');
    }
  }
}

// ═══ Subscribe ═══
export function subscribe(
  channel: EventChannel,
  pattern: string,
  handler: EventHandler,
  options?: { group?: string }
): string {
  const id = `sub_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,6)}`;
  subscriptions.push({ id, channel, pattern, handler, group:options?.group });
  track('event_subscribed', { channel, pattern, group:options?.group });
  return id;
}

// ═══ Unsubscribe ═══
export function unsubscribe(subscriptionId: string) {
  const idx = subscriptions.findIndex(s => s.id === subscriptionId);
  if (idx >= 0) subscriptions.splice(idx, 1);
}

// ═══ Add Middleware ═══
export function use(middleware: EventMiddleware) {
  middlewares.push(middleware);
}

// ═══ Replay Events (from store) ═══
export async function replay(
  channel: EventChannel,
  since: number,
  handler: EventHandler
): Promise<number> {
  const events = eventStore.filter(e => e.channel === channel && e.metadata.timestamp >= since);
  for (const event of events) {
    await Promise.resolve(handler(event));
  }
  return events.length;
}

// ═══ Event Bus Stats ═══
export function getEventBusStats() {
  const channelCounts: Record<string, number> = {};
  for (const e of eventStore.slice(-1000)) {
    channelCounts[e.channel] = (channelCounts[e.channel] || 0) + 1;
  }
  return {
    totalEvents: eventStore.length,
    subscriptions: subscriptions.length,
    deadLetterQueue: deadLetterQueue.length,
    middlewares: middlewares.length,
    channelBreakdown: channelCounts,
    recentEvents: eventStore.slice(-20).reverse(),
    dlqItems: deadLetterQueue.slice(-10).reverse(),
  };
}

// ═══ Built-in Middleware: Logging ═══
export const loggingMiddleware: EventMiddleware = async (event, next) => {
  const start = Date.now();
  log('debug', `[EventBus] ${event.channel}/${event.type}`, { id:event.id, priority:event.metadata.priority }, 'eventBus');
  await next();
  const duration = Date.now() - start;
  if (duration > 100) log('warn', `Slow event handler: ${event.type} (${duration}ms)`, { id:event.id }, 'eventBus');
};

// ═══ Built-in Middleware: Rate Limiting ═══
const channelRates = new Map<string, number[]>();
export const rateLimitMiddleware: EventMiddleware = async (event, next) => {
  const key = `${event.channel}:${event.type}`;
  const now = Date.now();
  const window = channelRates.get(key) || [];
  const recent = window.filter(t => now - t < 1000); // 1 second window
  if (recent.length > 100) { // max 100 events/sec per type
    log('warn', `Event rate limited: ${key}`, {}, 'eventBus');
    track('event_rate_limited', { channel:event.channel, type:event.type });
    return; // Drop event
  }
  recent.push(now);
  channelRates.set(key, recent);
  await next();
};

// ═══ Pre-defined Event Types (for type safety) ═══
export const EventTypes = {
  // Jobs
  JOB_CREATED: 'job.created',
  JOB_UPDATED: 'job.updated',
  JOB_APPLIED: 'job.applied',
  JOB_ASSIGNED: 'job.assigned',
  JOB_COMPLETED: 'job.completed',
  JOB_CANCELLED: 'job.cancelled',
  // Payments
  PAYMENT_INITIATED: 'payment.initiated',
  PAYMENT_COMPLETED: 'payment.completed',
  PAYMENT_FAILED: 'payment.failed',
  PAYMENT_REFUNDED: 'payment.refunded',
  PAYMENT_ESCROWED: 'payment.escrowed',
  PAYMENT_RELEASED: 'payment.released',
  // Chat
  MESSAGE_SENT: 'message.sent',
  MESSAGE_READ: 'message.read',
  ROOM_CREATED: 'room.created',
  // Users
  USER_REGISTERED: 'user.registered',
  USER_VERIFIED: 'user.verified',
  USER_TRUST_UPDATED: 'user.trust_updated',
  USER_BANNED: 'user.banned',
  // Moderation
  CONTENT_FLAGGED: 'content.flagged',
  CONTENT_APPROVED: 'content.approved',
  CONTENT_REJECTED: 'content.rejected',
  REPORT_CREATED: 'report.created',
  // Listings
  LISTING_CREATED: 'listing.created',
  LISTING_SOLD: 'listing.sold',
  // Reviews
  REVIEW_POSTED: 'review.posted',
  // System
  SYSTEM_ALERT: 'system.alert',
  SYSTEM_DEPLOY: 'system.deploy',
  CACHE_INVALIDATED: 'cache.invalidated',
} as const;
