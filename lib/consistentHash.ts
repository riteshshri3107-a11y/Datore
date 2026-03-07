/* ═══════════════════════════════════════════════════════════════
   CONSISTENT HASHING — Hash Ring for Distributed Sharding
   ═══════════════════════════════════════════════════════════════
   Phase 1 (Current): In-memory hash ring for routing decisions
   Phase 2: Redis cluster slot mapping + auto-rebalancing
   Phase 3: Multi-region ring with cross-DC replication awareness

   Use cases:
   - Cache key distribution across Redis nodes
   - Chat message routing to specific WS servers
   - Worker job assignment to processing nodes
   - Media upload routing to storage shards
   ═══════════════════════════════════════════════════════════════ */

import { log, track } from './observability';

// ═══ Types ═══
export interface HashNode {
  id: string;
  host: string;
  port: number;
  weight: number;        // Higher weight = more virtual nodes = more traffic
  region: string;
  status: 'active' | 'draining' | 'down';
  metadata?: Record<string, any>;
}

interface VirtualNode {
  hash: number;
  nodeId: string;
}

interface RingStats {
  totalNodes: number;
  totalVirtualNodes: number;
  keyDistribution: Record<string, number>;
  loadFactor: Record<string, number>;  // % of ring owned per node
}

// ═══ Hash Function (FNV-1a 32-bit) ═══
// Fast, well-distributed, deterministic — ideal for hash rings
function fnv1a(input: string): number {
  let hash = 0x811c9dc5; // FNV offset basis
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0; // FNV prime, keep as uint32
  }
  return hash;
}

// ═══ MurmurHash3 (32-bit) — Better distribution for production ═══
function murmur3(key: string, seed: number = 0): number {
  let h = seed;
  const len = key.length;
  const c1 = 0xcc9e2d51;
  const c2 = 0x1b873593;

  let i = 0;
  while (i + 4 <= len) {
    let k =
      (key.charCodeAt(i) & 0xff) |
      ((key.charCodeAt(i + 1) & 0xff) << 8) |
      ((key.charCodeAt(i + 2) & 0xff) << 16) |
      ((key.charCodeAt(i + 3) & 0xff) << 24);
    k = Math.imul(k, c1);
    k = (k << 15) | (k >>> 17);
    k = Math.imul(k, c2);
    h ^= k;
    h = (h << 13) | (h >>> 19);
    h = Math.imul(h, 5) + 0xe6546b64;
    i += 4;
  }

  let k = 0;
  switch (len - i) {
    case 3: k ^= (key.charCodeAt(i + 2) & 0xff) << 16; // fallthrough
    case 2: k ^= (key.charCodeAt(i + 1) & 0xff) << 8;  // fallthrough
    case 1:
      k ^= key.charCodeAt(i) & 0xff;
      k = Math.imul(k, c1);
      k = (k << 15) | (k >>> 17);
      k = Math.imul(k, c2);
      h ^= k;
  }

  h ^= len;
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

// ═══ Consistent Hash Ring ═══
const DEFAULT_VIRTUAL_NODES = 150; // Per unit of weight

export class HashRing {
  private ring: VirtualNode[] = [];       // Sorted by hash
  private nodes: Map<string, HashNode> = new Map();
  private virtualNodesPerWeight: number;
  private sorted = false;

  constructor(virtualNodesPerWeight: number = DEFAULT_VIRTUAL_NODES) {
    this.virtualNodesPerWeight = virtualNodesPerWeight;
  }

  // ═══ Add a node to the ring ═══
  addNode(node: HashNode): void {
    if (this.nodes.has(node.id)) {
      this.removeNode(node.id);
    }

    this.nodes.set(node.id, node);
    const vnCount = this.virtualNodesPerWeight * node.weight;

    for (let i = 0; i < vnCount; i++) {
      const hash = murmur3(`${node.id}:vn${i}`);
      this.ring.push({ hash, nodeId: node.id });
    }

    this.sorted = false;
    track('hashring_node_added', { nodeId: node.id, virtualNodes: String(vnCount) });
    log('info', `Node added to hash ring: ${node.id} (${vnCount} virtual nodes)`, { host: node.host }, 'consistentHash');
  }

  // ═══ Remove a node from the ring ═══
  removeNode(nodeId: string): void {
    if (!this.nodes.has(nodeId)) return;

    this.ring = this.ring.filter(vn => vn.nodeId !== nodeId);
    this.nodes.delete(nodeId);
    this.sorted = false;

    track('hashring_node_removed', { nodeId });
    log('info', `Node removed from hash ring: ${nodeId}`, {}, 'consistentHash');
  }

  // ═══ Ensure ring is sorted ═══
  private ensureSorted(): void {
    if (!this.sorted) {
      this.ring.sort((a, b) => a.hash - b.hash);
      this.sorted = true;
    }
  }

  // ═══ Get the node responsible for a key ═══
  getNode(key: string): HashNode | null {
    if (this.ring.length === 0) return null;
    this.ensureSorted();

    const hash = murmur3(key);
    let idx = this.binarySearch(hash);

    // Walk forward to find an active node
    const totalVN = this.ring.length;
    for (let attempt = 0; attempt < totalVN; attempt++) {
      const vn = this.ring[(idx + attempt) % totalVN];
      const node = this.nodes.get(vn.nodeId);
      if (node && node.status === 'active') {
        return node;
      }
    }

    return null; // All nodes are down
  }

  // ═══ Get N distinct nodes for replication ═══
  getNodes(key: string, count: number): HashNode[] {
    if (this.ring.length === 0) return [];
    this.ensureSorted();

    const hash = murmur3(key);
    let idx = this.binarySearch(hash);
    const result: HashNode[] = [];
    const seen = new Set<string>();

    const totalVN = this.ring.length;
    for (let attempt = 0; attempt < totalVN && result.length < count; attempt++) {
      const vn = this.ring[(idx + attempt) % totalVN];
      if (!seen.has(vn.nodeId)) {
        seen.add(vn.nodeId);
        const node = this.nodes.get(vn.nodeId);
        if (node && node.status === 'active') {
          result.push(node);
        }
      }
    }

    return result;
  }

  // ═══ Binary search: find the first virtual node with hash >= target ═══
  private binarySearch(hash: number): number {
    let low = 0;
    let high = this.ring.length - 1;

    if (hash > this.ring[high].hash) return 0; // Wrap around

    while (low < high) {
      const mid = (low + high) >>> 1;
      if (this.ring[mid].hash < hash) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    return low;
  }

  // ═══ Mark node as draining (stop new assignments, finish existing) ═══
  drainNode(nodeId: string): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.status = 'draining';
      track('hashring_node_draining', { nodeId });
    }
  }

  // ═══ Mark node as down ═══
  markDown(nodeId: string): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.status = 'down';
      track('hashring_node_down', { nodeId });
    }
  }

  // ═══ Mark node as active ═══
  markActive(nodeId: string): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.status = 'active';
      track('hashring_node_active', { nodeId });
    }
  }

  // ═══ Get ring statistics ═══
  getStats(): RingStats {
    this.ensureSorted();

    const keyDistribution: Record<string, number> = {};
    const loadFactor: Record<string, number> = {};
    const totalRange = 0xFFFFFFFF;

    for (const node of this.nodes.values()) {
      keyDistribution[node.id] = 0;
    }

    // Calculate arc lengths for each node
    for (let i = 0; i < this.ring.length; i++) {
      const current = this.ring[i];
      const next = this.ring[(i + 1) % this.ring.length];
      const arcLength = next.hash > current.hash
        ? next.hash - current.hash
        : (totalRange - current.hash) + next.hash;
      keyDistribution[current.nodeId] = (keyDistribution[current.nodeId] || 0) + arcLength;
    }

    for (const [nodeId, arcTotal] of Object.entries(keyDistribution)) {
      loadFactor[nodeId] = Number(((arcTotal / totalRange) * 100).toFixed(2));
    }

    return {
      totalNodes: this.nodes.size,
      totalVirtualNodes: this.ring.length,
      keyDistribution,
      loadFactor,
    };
  }

  // ═══ Get all registered nodes ═══
  getAllNodes(): HashNode[] {
    return Array.from(this.nodes.values());
  }

  // ═══ Get node count ═══
  get size(): number {
    return this.nodes.size;
  }
}

// ═══ Pre-configured Rings for Datore Services ═══

// Cache shard ring — distributes cache keys across Redis nodes
export const cacheRing = new HashRing(150);

// Chat routing ring — routes chat rooms to WebSocket servers
export const chatRing = new HashRing(100);

// Media storage ring — routes uploads to storage shards
export const mediaRing = new HashRing(200);

// ═══ Helper: Route a Supabase table key to a shard ═══
export function getShardForKey(ring: HashRing, key: string, replicaCount: number = 1): HashNode[] {
  if (replicaCount <= 1) {
    const node = ring.getNode(key);
    return node ? [node] : [];
  }
  return ring.getNodes(key, replicaCount);
}

// ═══ Helper: Initialize a ring with node configs ═══
export function initializeRing(ring: HashRing, configs: Array<{ id: string; host: string; port: number; weight?: number; region?: string }>): void {
  for (const cfg of configs) {
    ring.addNode({
      id: cfg.id,
      host: cfg.host,
      port: cfg.port,
      weight: cfg.weight || 1,
      region: cfg.region || 'ca-east',
      status: 'active',
    });
  }
  log('info', `Hash ring initialized with ${configs.length} nodes`, { stats: ring.getStats() }, 'consistentHash');
}
