/* ═══════════════════════════════════════════════════════════════
   MULTI-REGION & EDGE CACHING STRATEGY
   ═══════════════════════════════════════════════════════════════
   Phase 1 (Current): In-memory LRU cache + stale-while-revalidate
   Phase 2: Redis cluster + Cloudflare KV at edge
   Phase 3: Multi-region Supabase replicas + geo-routing
   
   Layers: L1 (in-memory) → L2 (Redis) → L3 (CDN/KV) → Origin
   Features: TTL, stale-while-revalidate, cache tags, invalidation
   ═══════════════════════════════════════════════════════════════ */

import { track, log } from './observability';
import { publish, EventTypes } from './eventBus';

// ═══ Types ═══
export type CacheRegion = 'ca-east' | 'ca-west' | 'us-east' | 'us-west' | 'in-west' | 'in-south' | 'eu-west';
export type CacheTier = 'l1_memory' | 'l2_redis' | 'l3_edge' | 'origin';

export interface CacheEntry<T = any> {
  key: string;
  value: T;
  tags: string[];
  createdAt: number;
  expiresAt: number;
  staleAt: number;        // After this, serve stale + revalidate in background
  region: CacheRegion;
  tier: CacheTier;
  hits: number;
  size: number;           // Approximate bytes
}

export interface CacheConfig {
  defaultTTL: number;           // seconds (default: 300 = 5 min)
  staleTTL: number;             // seconds (default: 60 = 1 min grace)
  maxEntries: number;           // max items in L1 (default: 5000)
  maxMemoryMB: number;          // approx memory cap (default: 50MB)
  region: CacheRegion;
  enableStaleWhileRevalidate: boolean;
}

// ═══ Default Config ═══
const config: CacheConfig = {
  defaultTTL: 300,
  staleTTL: 60,
  maxEntries: 5000,
  maxMemoryMB: 50,
  region: 'ca-east', // Toronto default
  enableStaleWhileRevalidate: true,
};

// ═══ L1 In-Memory LRU Cache ═══
const cache = new Map<string, CacheEntry>();
const accessOrder: string[] = []; // LRU tracking

// ═══ Cache Stats ═══
let stats = { hits:0, misses:0, staleHits:0, evictions:0, invalidations:0, revalidations:0, totalSize:0 };

// ═══ Approximate Size ═══
function estimateSize(value: any): number {
  try { return JSON.stringify(value).length * 2; } // rough bytes
  catch { return 1024; }
}

// ═══ LRU Eviction ═══
function evictIfNeeded() {
  // Evict by count
  while (cache.size > config.maxEntries && accessOrder.length > 0) {
    const oldest = accessOrder.shift()!;
    const entry = cache.get(oldest);
    if (entry) stats.totalSize -= entry.size;
    cache.delete(oldest);
    stats.evictions++;
  }
  // Evict by memory
  while (stats.totalSize > config.maxMemoryMB * 1024 * 1024 && accessOrder.length > 0) {
    const oldest = accessOrder.shift()!;
    const entry = cache.get(oldest);
    if (entry) stats.totalSize -= entry.size;
    cache.delete(oldest);
    stats.evictions++;
  }
}

// ═══ Touch (update LRU order) ═══
function touch(key: string) {
  const idx = accessOrder.indexOf(key);
  if (idx >= 0) accessOrder.splice(idx, 1);
  accessOrder.push(key);
}

// ═══ GET — Multi-layer read ═══
export async function cacheGet<T = any>(
  key: string,
  fetcher?: () => Promise<T>,
  options?: { ttl?:number; tags?:string[]; staleTTL?:number }
): Promise<{ value:T|null; tier:CacheTier; stale:boolean }> {
  const now = Date.now();

  // L1: In-memory
  const entry = cache.get(key);
  if (entry) {
    touch(key);
    entry.hits++;

    // Fresh hit
    if (now < entry.staleAt) {
      stats.hits++;
      track('cache_hit', { key:key.slice(0,50), tier:'l1_memory' });
      return { value:entry.value as T, tier:'l1_memory', stale:false };
    }

    // Stale but within grace period — serve stale + revalidate
    if (now < entry.expiresAt && config.enableStaleWhileRevalidate && fetcher) {
      stats.staleHits++;
      track('cache_stale_hit', { key:key.slice(0,50) });
      // Background revalidation
      revalidateInBackground(key, fetcher, options);
      return { value:entry.value as T, tier:'l1_memory', stale:true };
    }

    // Expired — evict
    cache.delete(key);
    const idx = accessOrder.indexOf(key);
    if (idx >= 0) accessOrder.splice(idx, 1);
    stats.totalSize -= entry.size;
  }

  // Cache miss
  stats.misses++;
  track('cache_miss', { key:key.slice(0,50) });

  // Fetch from origin if fetcher provided
  if (fetcher) {
    try {
      const value = await fetcher();
      cacheSet(key, value, options);
      return { value, tier:'origin', stale:false };
    } catch (err: any) {
      log('error', `Cache fetcher failed: ${key}`, { error:err.message }, 'cache');
      return { value:null, tier:'origin', stale:false };
    }
  }

  return { value:null, tier:'l1_memory', stale:false };
}

// ═══ SET ═══
export function cacheSet<T = any>(
  key: string,
  value: T,
  options?: { ttl?:number; tags?:string[]; staleTTL?:number }
) {
  const ttl = (options?.ttl || config.defaultTTL) * 1000;
  const staleTTL = (options?.staleTTL || config.staleTTL) * 1000;
  const size = estimateSize(value);
  const now = Date.now();

  const entry: CacheEntry<T> = {
    key,
    value,
    tags: options?.tags || [],
    createdAt: now,
    staleAt: now + ttl - staleTTL,
    expiresAt: now + ttl,
    region: config.region,
    tier: 'l1_memory',
    hits: 0,
    size,
  };

  // Remove old entry size if exists
  const old = cache.get(key);
  if (old) stats.totalSize -= old.size;

  cache.set(key, entry);
  stats.totalSize += size;
  touch(key);
  evictIfNeeded();
}

// ═══ Background Revalidation ═══
async function revalidateInBackground<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: { ttl?:number; tags?:string[]; staleTTL?:number }
) {
  try {
    const freshValue = await fetcher();
    cacheSet(key, freshValue, options);
    stats.revalidations++;
    track('cache_revalidated', { key:key.slice(0,50) });
  } catch (err: any) {
    log('warn', `Background revalidation failed: ${key}`, { error:err.message }, 'cache');
  }
}

// ═══ Invalidation by Key ═══
export function cacheInvalidate(key: string) {
  const entry = cache.get(key);
  if (entry) {
    stats.totalSize -= entry.size;
    cache.delete(key);
    const idx = accessOrder.indexOf(key);
    if (idx >= 0) accessOrder.splice(idx, 1);
    stats.invalidations++;
    track('cache_invalidated', { key:key.slice(0,50) });
  }
}

// ═══ Invalidation by Tag (powerful for related data) ═══
export function cacheInvalidateByTag(tag: string) {
  let count = 0;
  for (const [key, entry] of cache.entries()) {
    if (entry.tags.includes(tag)) {
      stats.totalSize -= entry.size;
      cache.delete(key);
      const idx = accessOrder.indexOf(key);
      if (idx >= 0) accessOrder.splice(idx, 1);
      count++;
    }
  }
  stats.invalidations += count;
  track('cache_tag_invalidated', { tag, count });
  // Publish cache invalidation event for other regions
  publish('system', EventTypes.CACHE_INVALIDATED, { tag, count, region:config.region });
  return count;
}

// ═══ Invalidation by Prefix ═══
export function cacheInvalidateByPrefix(prefix: string) {
  let count = 0;
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cacheInvalidate(key);
      count++;
    }
  }
  return count;
}

// ═══ Clear All ═══
export function cacheClear() {
  cache.clear();
  accessOrder.length = 0;
  stats.totalSize = 0;
  track('cache_cleared', { region:config.region });
}

// ═══ Pre-warm (load common queries on startup) ═══
export async function cacheWarm(
  entries: Array<{ key:string; fetcher:()=>Promise<any>; ttl?:number; tags?:string[] }>
) {
  let warmed = 0;
  for (const { key, fetcher, ttl, tags } of entries) {
    try {
      const value = await fetcher();
      cacheSet(key, value, { ttl, tags });
      warmed++;
    } catch { /* skip failed warm */ }
  }
  track('cache_warmed', { count:warmed, region:config.region });
  return warmed;
}

// ═══ Cache Key Builders (consistent naming) ═══
export const CacheKeys = {
  userProfile: (id:string) => `user:profile:${id}`,
  workerList: (cat?:string) => `workers:list:${cat||'all'}`,
  jobList: (cat?:string) => `jobs:list:${cat||'all'}`,
  jobDetail: (id:string) => `jobs:detail:${id}`,
  listingList: (cat?:string) => `listings:list:${cat||'all'}`,
  feed: (userId:string, page:number) => `feed:${userId}:p${page}`,
  search: (query:string, filters:string) => `search:${query}:${filters}`,
  reviews: (targetId:string) => `reviews:${targetId}`,
  notifications: (userId:string) => `notif:${userId}`,
  trending: () => `trending:global`,
};

// ═══ Multi-Region Replication Config ═══
export interface RegionConfig {
  region: CacheRegion;
  primary: boolean;
  dbHost: string;
  replicaOf?: CacheRegion;
  edgeEndpoint?: string;
  latencyMs: number; // expected latency from user
}

export const REGION_CONFIGS: RegionConfig[] = [
  { region:'ca-east', primary:true, dbHost:'db.ca-east.supabase.co', latencyMs:5 },
  { region:'ca-west', primary:false, dbHost:'db.ca-west.supabase.co', replicaOf:'ca-east', latencyMs:30 },
  { region:'in-west', primary:false, dbHost:'db.in-west.supabase.co', replicaOf:'ca-east', edgeEndpoint:'https://edge.in-west.datore.app', latencyMs:150 },
  { region:'in-south', primary:false, dbHost:'db.in-south.supabase.co', replicaOf:'in-west', edgeEndpoint:'https://edge.in-south.datore.app', latencyMs:160 },
  { region:'us-east', primary:false, dbHost:'db.us-east.supabase.co', replicaOf:'ca-east', latencyMs:15 },
  { region:'us-west', primary:false, dbHost:'db.us-west.supabase.co', replicaOf:'us-east', latencyMs:40 },
  { region:'eu-west', primary:false, dbHost:'db.eu-west.supabase.co', replicaOf:'ca-east', edgeEndpoint:'https://edge.eu-west.datore.app', latencyMs:120 },
];

// ═══ Geo-Route to Nearest Region ═══
export function getNearestRegion(lat: number, lng: number): RegionConfig {
  const regionCoords: Record<CacheRegion, [number,number]> = {
    'ca-east': [43.65, -79.38],  // Toronto
    'ca-west': [49.28, -123.12], // Vancouver
    'us-east': [40.71, -74.01],  // New York
    'us-west': [37.77, -122.42], // San Francisco
    'in-west': [19.08, 72.88],   // Mumbai
    'in-south': [12.97, 77.59],  // Bangalore
    'eu-west': [51.51, -0.13],   // London
  };
  
  let nearest: RegionConfig = REGION_CONFIGS[0];
  let minDist = Infinity;
  
  for (const rc of REGION_CONFIGS) {
    const [rlat, rlng] = regionCoords[rc.region];
    const dist = Math.sqrt(Math.pow(lat - rlat, 2) + Math.pow(lng - rlng, 2));
    if (dist < minDist) { minDist = dist; nearest = rc; }
  }
  
  return nearest;
}

// ═══ Cache Dashboard Stats ═══
export function getCacheStats() {
  const hitRate = (stats.hits + stats.staleHits) / Math.max(1, stats.hits + stats.staleHits + stats.misses);
  return {
    ...stats,
    entries: cache.size,
    hitRate: (hitRate * 100).toFixed(1) + '%',
    totalSizeMB: (stats.totalSize / 1024 / 1024).toFixed(2),
    maxEntries: config.maxEntries,
    maxMemoryMB: config.maxMemoryMB,
    region: config.region,
    staleWhileRevalidate: config.enableStaleWhileRevalidate,
    regionConfigs: REGION_CONFIGS,
  };
}
