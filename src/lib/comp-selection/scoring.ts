/**
 * Comp Scoring Service
 * Scores and classifies comparable properties based on
 * Census geography, subdivision matching, and RentCast data
 */

import {
  SubjectProperty,
  GeocodedComparable,
  ScoredComparable,
  CompTier,
  CompScoringConfig,
  DEFAULT_COMP_CONFIG,
  CompAnalysis,
  CensusBoundaryFeature,
} from '@/types/comp-selection';

// ============================================
// Comp Scoring Functions
// ============================================

/**
 * Calculate the overall score for a comparable property
 */
export function scoreComp(
  subject: SubjectProperty,
  comp: GeocodedComparable,
  config: CompScoringConfig = DEFAULT_COMP_CONFIG
): number {
  let score = 0;

  // Census Block Group Match (highest weight)
  if (comp.blockGroupGeoid && subject.blockGroupGeoid) {
    if (comp.blockGroupGeoid === subject.blockGroupGeoid) {
      score += config.weights.sameBlockGroup;
    } else if (comp.tractGeoid && subject.tractGeoid && comp.tractGeoid === subject.tractGeoid) {
      // Same tract but different block group
      score += config.weights.sameTract;
    }
  }

  // Subdivision Match
  if (
    subject.subdivision &&
    comp.subdivision &&
    normalizeSubdivision(subject.subdivision) === normalizeSubdivision(comp.subdivision)
  ) {
    score += config.weights.sameSubdivision;
  }

  // RentCast Correlation (normalized, default to 0.7 if not provided)
  const correlation = comp.correlation ?? 0.7;
  score += correlation * config.weights.rentCastCorrelation;

  // Distance Score (inverse - closer is better)
  if (comp.distance !== undefined && config.thresholds.maxDistanceMiles > 0) {
    const distanceScore = Math.max(0, 1 - comp.distance / config.thresholds.maxDistanceMiles);
    score += distanceScore * config.weights.distance;
  }

  return Math.min(1, Math.max(0, score)); // Clamp to [0, 1]
}

/**
 * Classify a comparable into quality tiers
 */
export function classifyComp(subject: SubjectProperty, comp: GeocodedComparable): CompTier {
  const sameBlockGroup =
    comp.blockGroupGeoid != null &&
    subject.blockGroupGeoid != null &&
    comp.blockGroupGeoid === subject.blockGroupGeoid;

  const sameTract =
    comp.tractGeoid != null && subject.tractGeoid != null && comp.tractGeoid === subject.tractGeoid;

  const sameSubdivision =
    subject.subdivision != null &&
    comp.subdivision != null &&
    normalizeSubdivision(subject.subdivision) === normalizeSubdivision(comp.subdivision);

  // Tier classification logic
  if (sameBlockGroup && sameSubdivision) {
    return 'excellent';
  }

  if (sameBlockGroup || (sameTract && sameSubdivision)) {
    return 'good';
  }

  if (sameTract) {
    return 'acceptable';
  }

  return 'marginal';
}

/**
 * Get detailed match information for a comparable
 */
export function getMatchDetails(
  subject: SubjectProperty,
  comp: GeocodedComparable,
  config: CompScoringConfig = DEFAULT_COMP_CONFIG
): ScoredComparable['matchDetails'] {
  const sameBlockGroup =
    comp.blockGroupGeoid != null &&
    subject.blockGroupGeoid != null &&
    comp.blockGroupGeoid === subject.blockGroupGeoid;

  const sameTract =
    comp.tractGeoid != null && subject.tractGeoid != null && comp.tractGeoid === subject.tractGeoid;

  const sameSubdivision =
    subject.subdivision != null &&
    comp.subdivision != null &&
    normalizeSubdivision(subject.subdivision) === normalizeSubdivision(comp.subdivision);

  // Distance score (inverse)
  const distanceScore =
    comp.distance !== undefined && config.thresholds.maxDistanceMiles > 0
      ? Math.max(0, 1 - comp.distance / config.thresholds.maxDistanceMiles)
      : 0;

  // Correlation score (normalized)
  const correlationScore = comp.correlation ?? 0.7;

  return {
    sameBlockGroup,
    sameTract,
    sameSubdivision,
    distanceScore,
    correlationScore,
  };
}

/**
 * Score and rank all comparables for a subject property
 */
export function scoreAndRankComps(
  subject: SubjectProperty,
  comps: GeocodedComparable[],
  config: CompScoringConfig = DEFAULT_COMP_CONFIG
): ScoredComparable[] {
  // Filter comps that don't meet thresholds
  const validComps = comps.filter((comp) => {
    // Distance threshold
    if (comp.distance !== undefined && comp.distance > config.thresholds.maxDistanceMiles) {
      return false;
    }

    // Correlation threshold
    if (comp.correlation !== undefined && comp.correlation < config.thresholds.minCorrelation) {
      return false;
    }

    return true;
  });

  // Score all valid comps
  const scored: ScoredComparable[] = validComps.map((comp) => ({
    ...comp,
    score: scoreComp(subject, comp, config),
    tier: classifyComp(subject, comp),
    rank: 0, // Will be set after sorting
    matchDetails: getMatchDetails(subject, comp, config),
  }));

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Assign ranks and limit count
  const limited = scored.slice(0, config.thresholds.maxCompCount);
  limited.forEach((comp, index) => {
    comp.rank = index + 1;
  });

  return limited;
}

/**
 * Generate analysis summary from scored comps
 */
export function generateAnalysisSummary(scoredComps: ScoredComparable[]): CompAnalysis['summary'] {
  const tierCounts = {
    excellent: 0,
    good: 0,
    acceptable: 0,
    marginal: 0,
  };

  let totalScore = 0;
  let totalDistance = 0;
  let totalPrice = 0;
  let priceCount = 0;

  for (const comp of scoredComps) {
    tierCounts[comp.tier]++;
    totalScore += comp.score;

    if (comp.distance !== undefined) {
      totalDistance += comp.distance;
    }

    if (comp.price !== undefined && comp.price > 0) {
      totalPrice += comp.price;
      priceCount++;
    }
  }

  const count = scoredComps.length;

  return {
    totalCompsAnalyzed: count,
    excellentCount: tierCounts.excellent,
    goodCount: tierCounts.good,
    acceptableCount: tierCounts.acceptable,
    marginalCount: tierCounts.marginal,
    averageScore: count > 0 ? totalScore / count : 0,
    averageDistance: count > 0 ? totalDistance / count : 0,
    estimatedARV: priceCount > 0 ? totalPrice / priceCount : undefined,
    arvConfidence: calculateARVConfidence(scoredComps),
  };
}

/**
 * Calculate ARV confidence based on comp quality distribution
 */
function calculateARVConfidence(scoredComps: ScoredComparable[]): number {
  if (scoredComps.length === 0) return 0;

  // Weight comps by tier quality
  const tierWeights: Record<CompTier, number> = {
    excellent: 1.0,
    good: 0.8,
    acceptable: 0.6,
    marginal: 0.4,
  };

  let totalWeight = 0;
  for (const comp of scoredComps) {
    totalWeight += tierWeights[comp.tier];
  }

  // Normalize by maximum possible weight
  const maxWeight = scoredComps.length * tierWeights.excellent;
  const confidence = totalWeight / maxWeight;

  // Apply count bonus (more comps = more confidence, up to 10)
  const countBonus = Math.min(scoredComps.length / 10, 1);
  const adjustedConfidence = confidence * 0.8 + countBonus * 0.2;

  return Math.min(1, Math.max(0, adjustedConfidence));
}

/**
 * Create a complete comp analysis
 */
export function createCompAnalysis(
  subject: SubjectProperty,
  scoredComps: ScoredComparable[],
  config: CompScoringConfig = DEFAULT_COMP_CONFIG,
  boundaries?: {
    blockGroup: CensusBoundaryFeature | null;
    tract: CensusBoundaryFeature | null;
  }
): CompAnalysis {
  return {
    id: crypto.randomUUID(),
    subjectProperty: subject,
    subjectBlockGroupPolygon: boundaries?.blockGroup ?? undefined,
    subjectTractPolygon: boundaries?.tract ?? undefined,
    scoredComps,
    analysisDate: new Date(),
    scoringConfig: config,
    summary: generateAnalysisSummary(scoredComps),
  };
}

// ============================================
// Helper Functions
// ============================================

/**
 * Normalize subdivision name for comparison
 * Handles common variations like "Phase 1", "Unit 2", etc.
 */
export function normalizeSubdivision(subdivision: string): string {
  return (
    subdivision
      .toLowerCase()
      .trim()
      // Remove common suffixes/variations
      .replace(/\s+(phase|unit|section|block|lot)\s*\d*/gi, '')
      // Remove punctuation
      .replace(/[.,\-_]/g, ' ')
      // Collapse multiple spaces
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/**
 * Check if two subdivision names are a fuzzy match
 */
export function isSubdivisionMatch(
  sub1: string | undefined | null,
  sub2: string | undefined | null,
  threshold = 0.8
): boolean {
  if (!sub1 || !sub2) return false;

  const norm1 = normalizeSubdivision(sub1);
  const norm2 = normalizeSubdivision(sub2);

  // Exact match after normalization
  if (norm1 === norm2) return true;

  // Simple Levenshtein-based similarity
  const similarity = calculateStringSimilarity(norm1, norm2);
  return similarity >= threshold;
}

/**
 * Calculate string similarity using Levenshtein distance
 */
function calculateStringSimilarity(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;

  if (len1 === 0 && len2 === 0) return 1;
  if (len1 === 0 || len2 === 0) return 0;

  // Create matrix with explicit initialization
  const matrix: number[][] = [];
  for (let i = 0; i <= len1; i++) {
    matrix[i] = new Array(len2 + 1).fill(0) as number[];
  }

  // Initialize first column and row
  for (let i = 0; i <= len1; i++) {
    const row = matrix[i];
    if (row) row[0] = i;
  }
  const firstRow = matrix[0];
  if (firstRow) {
    for (let j = 0; j <= len2; j++) {
      firstRow[j] = j;
    }
  }

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      const currentRow = matrix[i];
      const prevRow = matrix[i - 1];
      if (currentRow && prevRow) {
        const deletion = (prevRow[j] ?? 0) + 1;
        const insertion = (currentRow[j - 1] ?? 0) + 1;
        const substitution = (prevRow[j - 1] ?? 0) + cost;
        currentRow[j] = Math.min(deletion, insertion, substitution);
      }
    }
  }

  const lastRow = matrix[len1];
  const distance = lastRow?.[len2] ?? len1;
  const maxLen = Math.max(len1, len2);

  return 1 - distance / maxLen;
}

/**
 * Calculate weighted average price from scored comps
 * Uses comp score as weight
 */
export function calculateWeightedARV(scoredComps: ScoredComparable[]): number | undefined {
  const validComps = scoredComps.filter((comp) => comp.price !== undefined && comp.price > 0);

  if (validComps.length === 0) return undefined;

  let totalWeightedPrice = 0;
  let totalWeight = 0;

  for (const comp of validComps) {
    const weight = comp.score;
    totalWeightedPrice += comp.price * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) return undefined;

  return totalWeightedPrice / totalWeight;
}

/**
 * Calculate price per square foot from scored comps
 */
export function calculateAveragePricePerSqft(scoredComps: ScoredComparable[]): number | undefined {
  const validComps = scoredComps.filter(
    (comp) =>
      comp.price !== undefined &&
      comp.price > 0 &&
      comp.squareFootage !== undefined &&
      comp.squareFootage > 0
  );

  if (validComps.length === 0) return undefined;

  let totalPricePerSqft = 0;
  let totalWeight = 0;

  for (const comp of validComps) {
    const pricePerSqft = comp.price / comp.squareFootage!;
    const weight = comp.score;
    totalPricePerSqft += pricePerSqft * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) return undefined;

  return totalPricePerSqft / totalWeight;
}
