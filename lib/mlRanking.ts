/* ═══════════════════════════════════════════════════════════════
   ML RANKING ENGINE — Collaborative Filtering & Feed Ranking
   ═══════════════════════════════════════════════════════════════
   Phase 1 (Current): In-memory collaborative filtering + heuristic ranking
   Phase 2: Feature vectors + logistic regression server-side
   Phase 3: Neural embeddings + real-time personalization via Redis

   Algorithms:
   - Item-based collaborative filtering (cosine similarity)
   - User-based collaborative filtering (Pearson correlation)
   - Hybrid feed ranking (engagement + recency + affinity)
   - Trending detection (velocity-based)
   ═══════════════════════════════════════════════════════════════ */

import { log, track } from './observability';

// ═══ Types ═══
export type InteractionType = 'view' | 'like' | 'comment' | 'share' | 'save' | 'click' | 'apply' | 'hire' | 'message';

export interface Interaction {
  userId: string;
  itemId: string;
  type: InteractionType;
  value: number;       // Implicit rating (view=1, like=3, comment=5, share=7, hire=10)
  timestamp: number;
}

export interface RankedItem {
  itemId: string;
  score: number;
  signals: {
    collaborative: number;
    engagement: number;
    recency: number;
    affinity: number;
    trending: number;
  };
}

// ═══ Interaction Weights (implicit feedback) ═══
const INTERACTION_WEIGHTS: Record<InteractionType, number> = {
  view: 1,
  click: 2,
  like: 3,
  save: 4,
  comment: 5,
  share: 7,
  apply: 8,
  message: 6,
  hire: 10,
};

// ═══ Interaction Store ═══
const interactions: Interaction[] = [];
const MAX_INTERACTIONS = 100_000;

// User-item matrix: userId -> { itemId -> rating }
const userItemMatrix = new Map<string, Map<string, number>>();

// Item-user matrix: itemId -> { userId -> rating }
const itemUserMatrix = new Map<string, Map<string, number>>();

// ═══ Record an Interaction ═══
export function recordInteraction(userId: string, itemId: string, type: InteractionType): void {
  const value = INTERACTION_WEIGHTS[type];
  const interaction: Interaction = { userId, itemId, type, value, timestamp: Date.now() };

  interactions.push(interaction);
  if (interactions.length > MAX_INTERACTIONS) interactions.splice(0, interactions.length - MAX_INTERACTIONS);

  // Update user-item matrix (keep highest interaction value)
  if (!userItemMatrix.has(userId)) userItemMatrix.set(userId, new Map());
  const userRatings = userItemMatrix.get(userId)!;
  const current = userRatings.get(itemId) || 0;
  userRatings.set(itemId, Math.max(current, value));

  // Update item-user matrix
  if (!itemUserMatrix.has(itemId)) itemUserMatrix.set(itemId, new Map());
  const itemRatings = itemUserMatrix.get(itemId)!;
  itemRatings.set(userId, Math.max(itemRatings.get(userId) || 0, value));

  track('ml_interaction_recorded', { type, userId, itemId });
}

// ═══ Cosine Similarity ═══
function cosineSimilarity(vecA: Map<string, number>, vecB: Map<string, number>): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  // Only iterate over shared keys for dot product
  for (const [key, valA] of vecA) {
    normA += valA * valA;
    const valB = vecB.get(key);
    if (valB !== undefined) {
      dotProduct += valA * valB;
    }
  }

  for (const valB of vecB.values()) {
    normB += valB * valB;
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

// ═══ Pearson Correlation ═══
function pearsonCorrelation(vecA: Map<string, number>, vecB: Map<string, number>): number {
  // Find common items
  const common: string[] = [];
  for (const key of vecA.keys()) {
    if (vecB.has(key)) common.push(key);
  }

  const n = common.length;
  if (n < 2) return 0;

  let sumA = 0, sumB = 0, sumAB = 0, sumA2 = 0, sumB2 = 0;
  for (const key of common) {
    const a = vecA.get(key)!;
    const b = vecB.get(key)!;
    sumA += a;
    sumB += b;
    sumAB += a * b;
    sumA2 += a * a;
    sumB2 += b * b;
  }

  const numerator = n * sumAB - sumA * sumB;
  const denominator = Math.sqrt((n * sumA2 - sumA * sumA) * (n * sumB2 - sumB * sumB));
  return denominator === 0 ? 0 : numerator / denominator;
}

// ═══ Item-Based Collaborative Filtering ═══
// "Users who liked X also liked Y"
export function recommendByItem(userId: string, limit: number = 10): RankedItem[] {
  const userRatings = userItemMatrix.get(userId);
  if (!userRatings || userRatings.size === 0) return [];

  // Find similar items to what the user has interacted with
  const candidateScores = new Map<string, number>();

  for (const [likedItemId, userRating] of userRatings) {
    const likedItemUsers = itemUserMatrix.get(likedItemId);
    if (!likedItemUsers) continue;

    // Compare with all other items
    for (const [candidateId, candidateUsers] of itemUserMatrix) {
      if (userRatings.has(candidateId)) continue; // Already interacted

      const similarity = cosineSimilarity(likedItemUsers, candidateUsers);
      if (similarity > 0.1) {
        const existing = candidateScores.get(candidateId) || 0;
        candidateScores.set(candidateId, existing + similarity * userRating);
      }
    }
  }

  const results: RankedItem[] = [];
  for (const [itemId, score] of candidateScores) {
    results.push({
      itemId,
      score,
      signals: { collaborative: score, engagement: 0, recency: 0, affinity: 0, trending: 0 },
    });
  }

  results.sort((a, b) => b.score - a.score);
  track('ml_recommend_by_item', { userId, results: String(results.length) });
  return results.slice(0, limit);
}

// ═══ User-Based Collaborative Filtering ═══
// "Users similar to you liked Y"
export function recommendByUser(userId: string, limit: number = 10): RankedItem[] {
  const userRatings = userItemMatrix.get(userId);
  if (!userRatings || userRatings.size === 0) return [];

  // Find similar users
  const similarUsers: Array<{ userId: string; similarity: number }> = [];

  for (const [otherUserId, otherRatings] of userItemMatrix) {
    if (otherUserId === userId) continue;

    const similarity = pearsonCorrelation(userRatings, otherRatings);
    if (similarity > 0.2) {
      similarUsers.push({ userId: otherUserId, similarity });
    }
  }

  similarUsers.sort((a, b) => b.similarity - a.similarity);
  const topK = similarUsers.slice(0, 20); // Top 20 similar users

  // Aggregate their ratings for items the target user hasn't seen
  const candidateScores = new Map<string, { weightedSum: number; simSum: number }>();

  for (const { userId: simUserId, similarity } of topK) {
    const simRatings = userItemMatrix.get(simUserId)!;
    for (const [itemId, rating] of simRatings) {
      if (userRatings.has(itemId)) continue;

      const existing = candidateScores.get(itemId) || { weightedSum: 0, simSum: 0 };
      existing.weightedSum += similarity * rating;
      existing.simSum += Math.abs(similarity);
      candidateScores.set(itemId, existing);
    }
  }

  const results: RankedItem[] = [];
  for (const [itemId, { weightedSum, simSum }] of candidateScores) {
    const score = simSum > 0 ? weightedSum / simSum : 0;
    results.push({
      itemId,
      score,
      signals: { collaborative: score, engagement: 0, recency: 0, affinity: 0, trending: 0 },
    });
  }

  results.sort((a, b) => b.score - a.score);
  track('ml_recommend_by_user', { userId, results: String(results.length) });
  return results.slice(0, limit);
}

// ═══ Hybrid Feed Ranking ═══
// Combines multiple signals into a final ranking score
export function rankFeed(
  userId: string,
  items: Array<{ id: string; authorId: string; createdAt: number; likes: number; comments: number; shares: number }>,
  friendIds: Set<string>,
): RankedItem[] {
  const now = Date.now();
  const userRatings = userItemMatrix.get(userId) || new Map();

  // Trending velocity: count interactions in last hour per item
  const hourAgo = now - 3600_000;
  const trendingVelocity = new Map<string, number>();
  for (const interaction of interactions) {
    if (interaction.timestamp > hourAgo) {
      trendingVelocity.set(interaction.itemId, (trendingVelocity.get(interaction.itemId) || 0) + interaction.value);
    }
  }
  const maxTrending = Math.max(1, ...trendingVelocity.values());

  const ranked: RankedItem[] = items.map(item => {
    // 1. Engagement score (normalized)
    const engagementRaw = item.likes * 3 + item.comments * 5 + item.shares * 7;
    const engagement = Math.log1p(engagementRaw) / 10;

    // 2. Recency decay (half-life of 24 hours)
    const ageHours = (now - item.createdAt) / 3600_000;
    const recency = Math.pow(0.5, ageHours / 24);

    // 3. Social affinity (friend content boosted)
    let affinity = 0;
    if (friendIds.has(item.authorId)) affinity = 0.3;
    // Boost more if user frequently interacts with this author
    const authorInteractions = interactions.filter(
      i => i.userId === userId && i.itemId.startsWith(item.authorId)
    ).length;
    affinity += Math.min(0.3, authorInteractions * 0.05);

    // 4. Collaborative signal
    const collaborative = userRatings.has(item.id) ? 0 : recommendScoreForItem(userId, item.id);

    // 5. Trending velocity
    const trending = (trendingVelocity.get(item.id) || 0) / maxTrending;

    // ═══ Final weighted score ═══
    const score =
      engagement  * 0.25 +
      recency     * 0.25 +
      affinity    * 0.20 +
      collaborative * 0.15 +
      trending    * 0.15;

    return {
      itemId: item.id,
      score,
      signals: { collaborative, engagement, recency, affinity, trending },
    };
  });

  ranked.sort((a, b) => b.score - a.score);
  track('ml_feed_ranked', { userId, items: String(ranked.length) });
  return ranked;
}

// ═══ Quick collaborative score for a single item ═══
function recommendScoreForItem(userId: string, itemId: string): number {
  const userRatings = userItemMatrix.get(userId);
  const itemUsers = itemUserMatrix.get(itemId);
  if (!userRatings || !itemUsers) return 0;

  let totalSim = 0;
  let count = 0;

  for (const [likedItemId] of userRatings) {
    const likedItemUsers = itemUserMatrix.get(likedItemId);
    if (!likedItemUsers) continue;
    const sim = cosineSimilarity(likedItemUsers, itemUsers);
    if (sim > 0) {
      totalSim += sim;
      count++;
    }
  }

  return count > 0 ? totalSim / count : 0;
}

// ═══ Trending Detection (velocity + acceleration) ═══
export function getTrending(timeWindowMs: number = 3600_000, limit: number = 10): Array<{ itemId: string; velocity: number; acceleration: number }> {
  const now = Date.now();
  const windowStart = now - timeWindowMs;
  const prevWindowStart = windowStart - timeWindowMs;

  // Current window counts
  const currentCounts = new Map<string, number>();
  const prevCounts = new Map<string, number>();

  for (const interaction of interactions) {
    if (interaction.timestamp >= windowStart) {
      currentCounts.set(interaction.itemId, (currentCounts.get(interaction.itemId) || 0) + interaction.value);
    } else if (interaction.timestamp >= prevWindowStart) {
      prevCounts.set(interaction.itemId, (prevCounts.get(interaction.itemId) || 0) + interaction.value);
    }
  }

  const trending: Array<{ itemId: string; velocity: number; acceleration: number }> = [];

  for (const [itemId, currentVelocity] of currentCounts) {
    const prevVelocity = prevCounts.get(itemId) || 0;
    const acceleration = prevVelocity > 0 ? (currentVelocity - prevVelocity) / prevVelocity : currentVelocity;

    trending.push({ itemId, velocity: currentVelocity, acceleration });
  }

  trending.sort((a, b) => b.velocity + b.acceleration - (a.velocity + a.acceleration));
  return trending.slice(0, limit);
}

// ═══ Stats ═══
export function getMLStats() {
  return {
    totalInteractions: interactions.length,
    uniqueUsers: userItemMatrix.size,
    uniqueItems: itemUserMatrix.size,
    avgInteractionsPerUser: userItemMatrix.size > 0
      ? Math.round(interactions.length / userItemMatrix.size)
      : 0,
  };
}
