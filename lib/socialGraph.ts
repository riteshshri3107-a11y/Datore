/* ═══════════════════════════════════════════════════════════════
   SOCIAL GRAPH — Graph Algorithms for Relationship Discovery
   ═══════════════════════════════════════════════════════════════
   Phase 1 (Current): In-memory adjacency list + BFS/DFS
   Phase 2: Neo4j or Supabase pg_graphql extension
   Phase 3: Real-time graph updates via event bus + Redis cache

   Algorithms:
   - BFS: shortest path between users, degree of separation
   - Mutual friends: intersection of adjacency sets
   - Friend-of-friend suggestions: 2-hop neighbors
   - Influence scoring: PageRank-inspired centrality
   - Community detection: label propagation
   ═══════════════════════════════════════════════════════════════ */

import { log, track } from './observability';

// ═══ Types ═══
export type RelationshipType = 'friend' | 'follower' | 'blocked' | 'coworker' | 'buddy';

export interface Edge {
  targetId: string;
  type: RelationshipType;
  weight: number;        // Interaction strength (messages, jobs shared, etc.)
  createdAt: number;
}

export interface GraphNode {
  userId: string;
  edges: Edge[];
}

export interface PathResult {
  path: string[];
  distance: number;
}

export interface SuggestionResult {
  userId: string;
  score: number;
  mutualFriends: string[];
  reason: string;
}

// ═══ Social Graph (Adjacency List) ═══
export class SocialGraph {
  private adjacency: Map<string, Edge[]> = new Map();

  // ═══ Add a bidirectional relationship ═══
  addEdge(userA: string, userB: string, type: RelationshipType = 'friend', weight: number = 1): void {
    this.addDirectedEdge(userA, userB, type, weight);
    if (type !== 'follower') {
      this.addDirectedEdge(userB, userA, type, weight);
    }
    track('graph_edge_added', { type });
  }

  // ═══ Add a one-way edge ═══
  addDirectedEdge(from: string, to: string, type: RelationshipType, weight: number = 1): void {
    const edges = this.adjacency.get(from) || [];
    const existing = edges.find(e => e.targetId === to && e.type === type);
    if (existing) {
      existing.weight = weight;
    } else {
      edges.push({ targetId: to, type, weight, createdAt: Date.now() });
    }
    this.adjacency.set(from, edges);
  }

  // ═══ Remove a relationship ═══
  removeEdge(userA: string, userB: string, type?: RelationshipType): void {
    for (const userId of [userA, userB]) {
      const edges = this.adjacency.get(userId);
      if (edges) {
        const filtered = type
          ? edges.filter(e => !(e.targetId === (userId === userA ? userB : userA) && e.type === type))
          : edges.filter(e => e.targetId !== (userId === userA ? userB : userA));
        this.adjacency.set(userId, filtered);
      }
    }
  }

  // ═══ Get direct neighbors ═══
  getNeighbors(userId: string, type?: RelationshipType): string[] {
    const edges = this.adjacency.get(userId) || [];
    return (type ? edges.filter(e => e.type === type) : edges).map(e => e.targetId);
  }

  // ═══ Get friend count ═══
  getDegree(userId: string, type?: RelationshipType): number {
    return this.getNeighbors(userId, type).length;
  }

  // ═══ BFS: Shortest Path Between Two Users ═══
  shortestPath(startId: string, endId: string, maxDepth: number = 6): PathResult | null {
    if (startId === endId) return { path: [startId], distance: 0 };

    const visited = new Set<string>([startId]);
    const parent = new Map<string, string>();
    const queue: Array<{ id: string; depth: number }> = [{ id: startId, depth: 0 }];

    while (queue.length > 0) {
      const { id, depth } = queue.shift()!;
      if (depth >= maxDepth) continue;

      for (const neighbor of this.getNeighbors(id, 'friend')) {
        if (visited.has(neighbor)) continue;
        visited.add(neighbor);
        parent.set(neighbor, id);

        if (neighbor === endId) {
          // Reconstruct path
          const path: string[] = [endId];
          let current = endId;
          while (parent.has(current)) {
            current = parent.get(current)!;
            path.unshift(current);
          }
          track('graph_shortest_path', { distance: String(path.length - 1) });
          return { path, distance: path.length - 1 };
        }

        queue.push({ id: neighbor, depth: depth + 1 });
      }
    }

    return null; // No path found
  }

  // ═══ Degrees of Separation ═══
  degreesOfSeparation(userA: string, userB: string): number {
    const result = this.shortestPath(userA, userB);
    return result ? result.distance : -1;
  }

  // ═══ Mutual Friends ═══
  getMutualFriends(userA: string, userB: string): string[] {
    const friendsA = new Set(this.getNeighbors(userA, 'friend'));
    const friendsB = new Set(this.getNeighbors(userB, 'friend'));
    const mutual: string[] = [];

    for (const friend of friendsA) {
      if (friendsB.has(friend)) mutual.push(friend);
    }

    return mutual;
  }

  // ═══ Friend-of-Friend Suggestions (2-hop) ═══
  suggestFriends(userId: string, limit: number = 10): SuggestionResult[] {
    const directFriends = new Set(this.getNeighbors(userId, 'friend'));
    directFriends.add(userId); // Exclude self
    const blocked = new Set(this.getNeighbors(userId, 'blocked'));

    const candidates = new Map<string, { mutualCount: number; mutualIds: string[]; totalWeight: number }>();

    for (const friendId of directFriends) {
      if (friendId === userId) continue;
      const friendEdges = this.adjacency.get(friendId) || [];

      for (const edge of friendEdges) {
        if (edge.type !== 'friend') continue;
        if (directFriends.has(edge.targetId)) continue;
        if (blocked.has(edge.targetId)) continue;

        const existing = candidates.get(edge.targetId) || { mutualCount: 0, mutualIds: [], totalWeight: 0 };
        existing.mutualCount++;
        existing.mutualIds.push(friendId);
        existing.totalWeight += edge.weight;
        candidates.set(edge.targetId, existing);
      }
    }

    // Score: mutual friend count * avg interaction weight
    const suggestions: SuggestionResult[] = [];
    for (const [candidateId, data] of candidates.entries()) {
      const avgWeight = data.totalWeight / data.mutualCount;
      const score = data.mutualCount * (1 + Math.log1p(avgWeight));

      suggestions.push({
        userId: candidateId,
        score,
        mutualFriends: data.mutualIds,
        reason: `${data.mutualCount} mutual friend${data.mutualCount > 1 ? 's' : ''}`,
      });
    }

    suggestions.sort((a, b) => b.score - a.score);
    track('graph_friend_suggestions', { userId, candidates: String(suggestions.length) });
    return suggestions.slice(0, limit);
  }

  // ═══ Influence Score (PageRank-Inspired) ═══
  // Iterative computation: a user's score depends on the scores of those linking to them
  computeInfluence(iterations: number = 20, dampingFactor: number = 0.85): Map<string, number> {
    const allUsers = Array.from(this.adjacency.keys());
    const n = allUsers.length;
    if (n === 0) return new Map();

    // Initialize scores equally
    let scores = new Map<string, number>();
    for (const user of allUsers) {
      scores.set(user, 1 / n);
    }

    for (let iter = 0; iter < iterations; iter++) {
      const newScores = new Map<string, number>();

      for (const user of allUsers) {
        let incomingScore = 0;

        // Sum contributions from all nodes pointing to this user
        for (const [sourceId, edges] of this.adjacency.entries()) {
          const edgeToUser = edges.find(e => e.targetId === user);
          if (edgeToUser) {
            const outDegree = edges.length;
            const sourceScore = scores.get(sourceId) || 0;
            incomingScore += (sourceScore / outDegree) * edgeToUser.weight;
          }
        }

        newScores.set(user, (1 - dampingFactor) / n + dampingFactor * incomingScore);
      }

      scores = newScores;
    }

    // Normalize
    const total = Array.from(scores.values()).reduce((a, b) => a + b, 0);
    if (total > 0) {
      for (const [user, score] of scores) {
        scores.set(user, score / total);
      }
    }

    track('graph_influence_computed', { users: String(n), iterations: String(iterations) });
    return scores;
  }

  // ═══ Community Detection (Label Propagation) ═══
  detectCommunities(maxIterations: number = 50): Map<string, string> {
    const allUsers = Array.from(this.adjacency.keys());

    // Initialize: each node gets its own label
    const labels = new Map<string, string>();
    for (const user of allUsers) {
      labels.set(user, user);
    }

    for (let iter = 0; iter < maxIterations; iter++) {
      let changed = false;

      // Shuffle order for randomized propagation
      const shuffled = [...allUsers].sort(() => Math.random() - 0.5);

      for (const user of shuffled) {
        const edges = this.adjacency.get(user) || [];
        if (edges.length === 0) continue;

        // Count neighbor labels weighted by edge weight
        const labelCounts = new Map<string, number>();
        for (const edge of edges) {
          const neighborLabel = labels.get(edge.targetId);
          if (neighborLabel) {
            labelCounts.set(neighborLabel, (labelCounts.get(neighborLabel) || 0) + edge.weight);
          }
        }

        // Pick the most common label
        let maxCount = 0;
        let bestLabel = labels.get(user)!;
        for (const [label, count] of labelCounts) {
          if (count > maxCount) {
            maxCount = count;
            bestLabel = label;
          }
        }

        if (bestLabel !== labels.get(user)) {
          labels.set(user, bestLabel);
          changed = true;
        }
      }

      if (!changed) break; // Converged
    }

    track('graph_communities_detected', {
      users: String(allUsers.length),
      communities: String(new Set(labels.values()).size),
    });
    return labels;
  }

  // ═══ Get users within N hops ═══
  getUsersWithinHops(userId: string, maxHops: number): Map<string, number> {
    const distances = new Map<string, number>();
    const queue: Array<{ id: string; depth: number }> = [{ id: userId, depth: 0 }];
    distances.set(userId, 0);

    while (queue.length > 0) {
      const { id, depth } = queue.shift()!;
      if (depth >= maxHops) continue;

      for (const neighbor of this.getNeighbors(id)) {
        if (!distances.has(neighbor)) {
          distances.set(neighbor, depth + 1);
          queue.push({ id: neighbor, depth: depth + 1 });
        }
      }
    }

    distances.delete(userId); // Remove self
    return distances;
  }

  // ═══ Clustering Coefficient (how tightly-knit a user's friends are) ═══
  clusteringCoefficient(userId: string): number {
    const neighbors = this.getNeighbors(userId, 'friend');
    const k = neighbors.length;
    if (k < 2) return 0;

    let connections = 0;
    const neighborSet = new Set(neighbors);

    for (let i = 0; i < neighbors.length; i++) {
      const friendEdges = this.adjacency.get(neighbors[i]) || [];
      for (const edge of friendEdges) {
        if (neighborSet.has(edge.targetId) && edge.targetId !== neighbors[i]) {
          connections++;
        }
      }
    }

    // Each edge counted once (undirected), max possible = k*(k-1)
    return connections / (k * (k - 1));
  }

  // ═══ Load graph from Supabase friend_requests data ═══
  loadFromFriendRequests(requests: Array<{ from_user_id: string; to_user_id: string; status: string }>): void {
    for (const req of requests) {
      if (req.status === 'accepted') {
        this.addEdge(req.from_user_id, req.to_user_id, 'friend');
      } else if (req.status === 'blocked') {
        this.addDirectedEdge(req.from_user_id, req.to_user_id, 'blocked');
      }
    }
    log('info', `Social graph loaded: ${requests.length} relationships`, { nodes: this.adjacency.size }, 'socialGraph');
  }

  // ═══ Graph Statistics ═══
  getStats() {
    let totalEdges = 0;
    let maxDegree = 0;
    let totalDegree = 0;

    for (const [, edges] of this.adjacency) {
      totalEdges += edges.length;
      totalDegree += edges.length;
      if (edges.length > maxDegree) maxDegree = edges.length;
    }

    return {
      totalNodes: this.adjacency.size,
      totalEdges: totalEdges / 2, // Undirected counted twice
      avgDegree: this.adjacency.size > 0 ? totalDegree / this.adjacency.size : 0,
      maxDegree,
    };
  }

  get size(): number {
    return this.adjacency.size;
  }
}

// ═══ Singleton graph instance ═══
export const socialGraph = new SocialGraph();
