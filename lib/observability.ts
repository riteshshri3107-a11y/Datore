/* ═══════════════════════════════════════════════════════════════
   OBSERVABILITY MODULE — Metrics, Tracing, Logging, SLOs
   ═══════════════════════════════════════════════════════════════
   Phase 1 (Current): Client-side + in-memory metrics
   Phase 2: OpenTelemetry integration, Prometheus export
   Phase 3: Grafana dashboards, PagerDuty alerts
   
   Tracks: API latency, error rates, auth events, moderation,
           page loads, user actions, feature usage, SLO compliance
   ═══════════════════════════════════════════════════════════════ */

// ═══ Types ═══
export type MetricType = 'counter' | 'gauge' | 'histogram' | 'timing';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

export interface MetricEntry {
  name: string;
  value: number;
  type: MetricType;
  tags: Record<string, string>;
  timestamp: number;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: number;
  source: string;
  traceId?: string;
}

export interface SLODefinition {
  name: string;
  target: number;         // e.g. 0.999 = 99.9%
  window: number;         // rolling window in ms
  metric: string;         // which metric to evaluate
  condition: 'lt' | 'gt'; // for timing: lt (latency < target), for availability: gt (success > target)
  threshold: number;      // the value to compare against
}

// ═══ In-Memory Metrics Store ═══
const metrics: MetricEntry[] = [];
const logs: LogEntry[] = [];
const MAX_METRICS = 10_000;
const MAX_LOGS = 5_000;

// Counters (monotonically increasing)
const counters = new Map<string, number>();
// Gauges (point-in-time values)
const gauges = new Map<string, number>();
// Histograms (distributions)
const histograms = new Map<string, number[]>();

// ═══ Core Tracking Functions ═══
export function track(event: string, data?: Record<string, any>) {
  const entry: MetricEntry = {
    name: event,
    value: 1,
    type: 'counter',
    tags: data ? Object.fromEntries(Object.entries(data).map(([k,v]) => [k, String(v)])) : {},
    timestamp: Date.now(),
  };
  metrics.push(entry);
  if (metrics.length > MAX_METRICS) metrics.splice(0, metrics.length - MAX_METRICS);
  
  // Increment counter
  counters.set(event, (counters.get(event) || 0) + 1);
}

export function trackTiming(name: string, durationMs: number, tags?: Record<string, string>) {
  const entry: MetricEntry = {
    name,
    value: durationMs,
    type: 'timing',
    tags: tags || {},
    timestamp: Date.now(),
  };
  metrics.push(entry);
  if (metrics.length > MAX_METRICS) metrics.splice(0, metrics.length - MAX_METRICS);
  
  // Add to histogram
  const hist = histograms.get(name) || [];
  hist.push(durationMs);
  if (hist.length > 1000) hist.splice(0, hist.length - 1000);
  histograms.set(name, hist);
}

export function setGauge(name: string, value: number) {
  gauges.set(name, value);
}

export function increment(name: string, by: number = 1) {
  counters.set(name, (counters.get(name) || 0) + by);
}

// ═══ Logging ═══
export function log(level: LogLevel, message: string, data?: any, source: string = 'app') {
  const entry: LogEntry = {
    level, message, data, source,
    timestamp: Date.now(),
    traceId: generateTraceId(),
  };
  logs.push(entry);
  if (logs.length > MAX_LOGS) logs.splice(0, logs.length - MAX_LOGS);
  
  // Console output with structured format
  const prefix = `[${level.toUpperCase()}] [${source}]`;
  if (level === 'error' || level === 'critical') {
    console.error(prefix, message, data || '');
  } else if (level === 'warn') {
    console.warn(prefix, message, data || '');
  } else if (level === 'debug') {
    // Only in dev
    if (process.env.NODE_ENV === 'development') console.log(prefix, message, data || '');
  }
}

// ═══ Trace ID Generation ═══
let traceCounter = 0;
function generateTraceId(): string {
  traceCounter = (traceCounter + 1) % 999999;
  return `tr_${Date.now().toString(36)}_${traceCounter.toString(36)}`;
}

// ═══ Performance Percentiles ═══
export function getPercentile(name: string, p: number): number {
  const hist = histograms.get(name);
  if (!hist || hist.length === 0) return 0;
  const sorted = [...hist].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

export function getHistogramStats(name: string): {
  p50:number; p95:number; p99:number; avg:number; min:number; max:number; count:number
} {
  const hist = histograms.get(name);
  if (!hist || hist.length === 0) return { p50:0, p95:0, p99:0, avg:0, min:0, max:0, count:0 };
  return {
    p50: getPercentile(name, 50),
    p95: getPercentile(name, 95),
    p99: getPercentile(name, 99),
    avg: hist.reduce((a,b) => a+b, 0) / hist.length,
    min: Math.min(...hist),
    max: Math.max(...hist),
    count: hist.length,
  };
}

// ═══ SLO Evaluation ═══
const SLO_DEFINITIONS: SLODefinition[] = [
  { name:'API Availability', target:0.999, window:3600_000, metric:'api_success', condition:'gt', threshold:0.999 },
  { name:'Feed Latency p95', target:0.95, window:3600_000, metric:'api_feed_latency', condition:'lt', threshold:500 },
  { name:'Auth Latency p95', target:0.99, window:3600_000, metric:'api_auth_latency', condition:'lt', threshold:200 },
  { name:'Moderation Accuracy', target:0.95, window:86400_000, metric:'moderation_accuracy', condition:'gt', threshold:0.95 },
  { name:'Error Rate', target:0.001, window:3600_000, metric:'api_error', condition:'lt', threshold:0.001 },
];

export function evaluateSLOs(): Array<{ slo:SLODefinition; current:number; withinBudget:boolean; remaining:number }> {
  return SLO_DEFINITIONS.map(slo => {
    const total = (counters.get('api_success') || 0) + (counters.get('api_error') || 0);
    let current = 0;
    
    if (slo.metric === 'api_success' && total > 0) {
      current = (counters.get('api_success') || 0) / total;
    } else if (slo.metric === 'api_error' && total > 0) {
      current = (counters.get('api_error') || 0) / total;
    } else if (slo.metric.includes('latency')) {
      current = getPercentile(slo.metric, 95);
    } else {
      current = counters.get(slo.metric) || 0;
    }

    const withinBudget = slo.condition === 'gt' ? current >= slo.threshold : current <= slo.threshold;
    const remaining = slo.condition === 'gt' 
      ? Math.max(0, current - slo.threshold)
      : Math.max(0, slo.threshold - current);

    return { slo, current, withinBudget, remaining };
  });
}

// ═══ Dashboard Data Export ═══
export function getDashboardData() {
  const now = Date.now();
  const last5m = metrics.filter(m => now - m.timestamp < 300_000);
  const last1h = metrics.filter(m => now - m.timestamp < 3600_000);
  
  // Request breakdown
  const endpoints = new Map<string, { count:number; errors:number; avgMs:number }>();
  for (const m of last1h) {
    if (m.tags.endpoint) {
      const ep = endpoints.get(m.tags.endpoint) || { count:0, errors:0, avgMs:0 };
      ep.count++;
      if (m.name === 'api_error') ep.errors++;
      if (m.tags.duration) ep.avgMs = (ep.avgMs * (ep.count-1) + Number(m.tags.duration)) / ep.count;
      endpoints.set(m.tags.endpoint, ep);
    }
  }

  return {
    overview: {
      totalRequests: counters.get('api_success') || 0,
      totalErrors: counters.get('api_error') || 0,
      errorRate: ((counters.get('api_error') || 0) / Math.max(1, (counters.get('api_success') || 0) + (counters.get('api_error') || 0)) * 100).toFixed(3),
      activeUsers: gauges.get('active_users') || 0,
      requestsPer5m: last5m.length,
      requestsPer1h: last1h.length,
    },
    latency: {
      feed: getHistogramStats('api_feed_latency'),
      auth: getHistogramStats('api_auth_latency'),
      search: getHistogramStats('api_search_latency'),
      payments: getHistogramStats('api_payment_latency'),
      overall: getHistogramStats('api_latency'),
    },
    slos: evaluateSLOs(),
    endpoints: Object.fromEntries(endpoints),
    security: {
      authFailures: counters.get('api_auth_failed') || 0,
      rateLimited: counters.get('api_rate_limited') || 0,
      contentBlocked: counters.get('api_content_blocked') || 0,
      botBlocked: counters.get('api_method_blocked') || 0,
    },
    moderation: {
      totalScanned: counters.get('moderation_scanned') || 0,
      blocked: counters.get('moderation_blocked') || 0,
      censored: counters.get('moderation_censored') || 0,
      clean: counters.get('moderation_clean') || 0,
    },
    recentLogs: logs.slice(-50).reverse(),
    counters: Object.fromEntries(counters),
  };
}

// ═══ Page Performance Tracking (Client-Side) ═══
export function trackPageLoad(page: string) {
  if (typeof window === 'undefined') return;
  const perf = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  if (perf) {
    trackTiming('page_load', perf.loadEventEnd - perf.startTime, { page });
    trackTiming('page_ttfb', perf.responseStart - perf.requestStart, { page });
    trackTiming('page_dom_interactive', perf.domInteractive - perf.startTime, { page });
  }
  track('page_view', { page });
}

// ═══ Error Boundary Tracking ═══
export function trackError(error: Error, context?: Record<string, any>) {
  track('client_error', {
    message: error.message,
    stack: error.stack?.slice(0, 200) || '',
    ...context,
  });
  log('error', error.message, { stack:error.stack?.slice(0,500), ...context }, 'client');
}

// ═══ Feature Usage Tracking ═══
export function trackFeature(feature: string, action: string = 'used') {
  track('feature_usage', { feature, action });
  increment(`feature:${feature}`);
}
