/**
 * Seller Motivation Scoring Engine
 *
 * Main orchestration layer that:
 * 1. Fetches signals from all data sources
 * 2. Classifies the owner type
 * 3. Routes to the appropriate scoring model
 * 4. Calculates both Standard and DealFlow IQ scores
 */

import { classifyOwner } from './owner-classifier';
import { calculateMotivationScore } from './scoring-models';
import { fetchPropertySignals, getCachedSignals, cacheSignals } from './signal-fetcher';
import type {
  OwnerClassification,
  RawPropertySignals,
  StandardMotivationScore,
  DealFlowIQScore,
  ScoringFactor,
} from './types';

// ============================================================================
// Types
// ============================================================================

/**
 * Input options for scoring
 */
export interface ScoringOptions {
  propertyId?: string;
  address?: string;
  zipCode?: string;

  // Optional pre-fetched data
  signals?: RawPropertySignals;
  classification?: OwnerClassification;

  // Score type
  scoreType?: 'standard' | 'dealflow_iq' | 'both';

  // Caching
  useCache?: boolean;
  cacheTtlSeconds?: number;
}

/**
 * Complete scoring result
 */
export interface ScoringResult {
  standardScore: StandardMotivationScore;
  dealFlowIQ?: DealFlowIQScore;
  signals: RawPropertySignals;
  classification: OwnerClassification;
  dataQuality: {
    signalsAvailable: number;
    signalsMissing: string[];
    sourcesUsed: string[];
    confidence: number;
  };
  timing: {
    fetchMs: number;
    classifyMs: number;
    scoreMs: number;
    totalMs: number;
  };
}

// ============================================================================
// Main Scoring Function
// ============================================================================

/**
 * Calculate seller motivation score for a property
 */
export async function calculateSellerMotivation(options: ScoringOptions): Promise<ScoringResult> {
  const startTime = Date.now();
  let fetchMs = 0;
  let classifyMs = 0;
  let scoreMs = 0;

  // Validate input
  if (!options.propertyId && !options.address) {
    throw new Error('Either propertyId or address is required');
  }

  // 1. Fetch signals
  let signals = options.signals;
  if (!signals) {
    // Check cache first
    if (options.useCache && options.propertyId) {
      signals = (await getCachedSignals(options.propertyId)) || undefined;
    }

    if (!signals) {
      const fetchStart = Date.now();
      const fetchResult = await fetchPropertySignals({
        propertyId: options.propertyId,
        address: options.address,
        zipCode: options.zipCode,
        useCache: options.useCache,
      });
      signals = fetchResult.signals;
      fetchMs = Date.now() - fetchStart;

      // Cache the signals
      if (options.propertyId && options.useCache !== false) {
        await cacheSignals(options.propertyId, signals, options.cacheTtlSeconds);
      }
    }
  }

  // 2. Classify owner
  let classification = options.classification;
  if (!classification) {
    const classifyStart = Date.now();

    const ownerName = signals.ownerName || 'Unknown Owner';
    classification = classifyOwner(ownerName, {
      ownerType: signals.ownerType,
      ownerOccupied: signals.ownerOccupied,
      mailingState: signals.ownerMailingState,
      propertyState: undefined, // Would need to extract from address
    });

    classifyMs = Date.now() - classifyStart;
  }

  // 3. Calculate standard score
  const scoreStart = Date.now();
  const standardScore = calculateMotivationScore(signals, classification);
  scoreMs = Date.now() - scoreStart;

  // 4. Calculate DealFlow IQ score if requested
  let dealFlowIQ: DealFlowIQScore | undefined;
  if (options.scoreType === 'dealflow_iq' || options.scoreType === 'both') {
    dealFlowIQ = await calculateDealFlowIQScore(standardScore, signals, classification);
  }

  // 5. Calculate data quality metrics
  const dataQuality = calculateDataQuality(signals, standardScore.factors);

  return {
    standardScore,
    dealFlowIQ,
    signals,
    classification,
    dataQuality,
    timing: {
      fetchMs,
      classifyMs,
      scoreMs,
      totalMs: Date.now() - startTime,
    },
  };
}

// ============================================================================
// DealFlow IQ Score (AI-Enhanced)
// ============================================================================

/**
 * Calculate the AI-enhanced DealFlow IQ score
 */
async function calculateDealFlowIQScore(
  standardScore: StandardMotivationScore,
  signals: RawPropertySignals,
  classification: OwnerClassification
): Promise<DealFlowIQScore> {
  const aiAdjustments: DealFlowIQScore['aiAdjustments'] = [];

  // Start with standard score
  let iqScore = standardScore.score;

  // 1. Seasonal adjustment
  const month = new Date().getMonth();
  let seasonalAdjustment = 0;
  if (month >= 2 && month <= 4) {
    // Spring (March-May) - peak selling season
    seasonalAdjustment = -3; // Sellers have more leverage
  } else if (month >= 10 || month <= 1) {
    // Winter (November-February) - off season
    seasonalAdjustment = 5; // Sellers more motivated
  }

  if (seasonalAdjustment !== 0) {
    iqScore += seasonalAdjustment;
    aiAdjustments.push({
      factor: 'Seasonal Timing',
      adjustment: seasonalAdjustment,
      reasoning:
        seasonalAdjustment > 0
          ? 'Off-season listings often indicate higher motivation'
          : 'Peak season gives sellers more leverage',
    });
  }

  // 2. Market momentum adjustment
  if (signals.priceChangeYoY !== undefined) {
    let momentumAdjustment = 0;
    if (signals.priceChangeYoY < -5) {
      // Declining market
      momentumAdjustment = 8;
      aiAdjustments.push({
        factor: 'Market Momentum',
        adjustment: momentumAdjustment,
        reasoning: `Market declining ${Math.abs(signals.priceChangeYoY).toFixed(1)}% YoY - sellers more motivated to act`,
      });
    } else if (signals.priceChangeYoY > 10) {
      // Rapidly appreciating market
      momentumAdjustment = -5;
      aiAdjustments.push({
        factor: 'Market Momentum',
        adjustment: momentumAdjustment,
        reasoning: `Market rising ${signals.priceChangeYoY.toFixed(1)}% YoY - sellers may wait for more appreciation`,
      });
    }
    iqScore += momentumAdjustment;
  }

  // 3. Owner duration pattern adjustment
  if (signals.lastSaleDate) {
    const years =
      (Date.now() - new Date(signals.lastSaleDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000);

    // 7-year itch pattern for individuals
    if (classification.primaryClass === 'individual' && years >= 6 && years <= 8) {
      const adjustment = 5;
      iqScore += adjustment;
      aiAdjustments.push({
        factor: 'Duration Pattern',
        adjustment,
        reasoning: '7-year ownership pattern often correlates with major life transitions',
      });
    }

    // First year LLC pattern (flips)
    if (classification.primaryClass === 'investor_entity' && years < 1) {
      const adjustment = 10;
      iqScore += adjustment;
      aiAdjustments.push({
        factor: 'Flip Indicator',
        adjustment,
        reasoning: 'Recent investor purchase suggests potential flip - may be ready to exit',
      });
    }
  }

  // 4. Property age adjustment (older properties = more maintenance = tired owners)
  if (signals.yearBuilt) {
    const age = new Date().getFullYear() - signals.yearBuilt;
    if (age > 50 && classification.primaryClass !== 'institutional_distressed') {
      const adjustment = Math.min(5, Math.floor((age - 50) / 10));
      if (adjustment > 0) {
        iqScore += adjustment;
        aiAdjustments.push({
          factor: 'Property Age',
          adjustment,
          reasoning: `${age}-year-old property likely has ongoing maintenance burden`,
        });
      }
    }
  }

  // 5. Multi-factor distress boost
  const distressCount = [
    signals.preForeclosure,
    signals.taxDelinquent,
    signals.vacantIndicator,
    (signals.codeLiens || 0) > 0,
  ].filter(Boolean).length;

  if (distressCount >= 2) {
    const adjustment = distressCount * 5;
    iqScore += adjustment;
    aiAdjustments.push({
      factor: 'Compound Distress',
      adjustment,
      reasoning: `Multiple distress signals (${distressCount}) indicate urgent seller situation`,
    });
  }

  // Calculate market context
  const marketContext = {
    seasonalAdjustment,
    similarPropertyOutcomes: 0.72, // Would come from RAG in production
    competitorActivity: signals.inventory ? Math.min(100, (signals.inventory / 100) * 50) : 50,
  };

  // Generate predictions
  const predictions = generatePredictions(iqScore, classification, signals);

  // Normalize final score
  iqScore = Math.max(0, Math.min(100, Math.round(iqScore)));

  return {
    iqScore,
    standardScore: standardScore.score,
    confidence: Math.min(0.95, standardScore.confidence + 0.1),
    aiAdjustments,
    marketContext,
    predictions,
    ownerClassification: classification,
    factors: standardScore.factors,
  };
}

/**
 * Generate predictions based on IQ score
 */
function generatePredictions(
  iqScore: number,
  classification: OwnerClassification,
  signals: RawPropertySignals
): DealFlowIQScore['predictions'] {
  // Time to decision based on owner type and score
  let timeToDecision: string;
  if (classification.primaryClass === 'institutional_distressed') {
    timeToDecision = classification.subClass === 'bank_reo' ? '4-8 weeks' : '2-6 weeks';
  } else if (iqScore >= 75) {
    timeToDecision = '1-2 weeks';
  } else if (iqScore >= 50) {
    timeToDecision = '2-4 weeks';
  } else {
    timeToDecision = '1-2 months';
  }

  // Best timing
  let bestApproachTiming: string;
  if (iqScore >= 70) {
    bestApproachTiming = 'Now - high motivation detected';
  } else if (signals.daysOnMarket && signals.daysOnMarket > 60) {
    bestApproachTiming = 'Now - extended market time indicates flexibility';
  } else if (iqScore < 40) {
    bestApproachTiming = 'Wait 30-60 days for circumstances to change';
  } else {
    bestApproachTiming = 'Within 2 weeks';
  }

  // Offer range based on score
  const baseDiscount = 100 - iqScore; // Higher motivation = accept lower offer
  const minDiscount = Math.max(5, baseDiscount - 5);
  const maxDiscount = Math.min(30, baseDiscount + 10);

  // Calculate from market value
  const marketValue = signals.estimatedValue || signals.assessedValue || 200000;
  const optimalOfferRange = {
    min: Math.round(marketValue * (1 - maxDiscount / 100)),
    max: Math.round(marketValue * (1 - minDiscount / 100)),
  };

  return {
    timeToDecision,
    bestApproachTiming,
    optimalOfferRange,
  };
}

// ============================================================================
// Data Quality Assessment
// ============================================================================

/**
 * Calculate data quality metrics
 */
function calculateDataQuality(
  signals: RawPropertySignals,
  factors: ScoringFactor[]
): ScoringResult['dataQuality'] {
  const allPossibleSignals = [
    'ownerName',
    'ownerType',
    'ownerOccupied',
    'lastSaleDate',
    'lastSalePrice',
    'estimatedValue',
    'daysOnMarket',
    'saleToListRatio',
    'recentPermits',
    'preForeclosure',
    'taxDelinquent',
  ];

  const presentSignals = allPossibleSignals.filter(
    (key) => (signals as Record<string, unknown>)[key] !== undefined
  );

  const missingSignals = allPossibleSignals.filter(
    (key) => (signals as Record<string, unknown>)[key] === undefined
  );

  const sourcesUsed: string[] = [];
  if (signals.ownerName || signals.estimatedValue) sourcesUsed.push('rentcast');
  if (signals.recentPermits) sourcesUsed.push('shovels');
  if (signals.preForeclosure !== undefined || signals.taxDelinquent !== undefined) {
    sourcesUsed.push('supabase');
  }

  // Calculate confidence based on available data
  const dataConfidence = presentSignals.length / allPossibleSignals.length;
  const factorConfidence = factors.filter((f) => f.rawValue !== null).length / factors.length;
  const overallConfidence = dataConfidence * 0.5 + factorConfidence * 0.5;

  return {
    signalsAvailable: presentSignals.length,
    signalsMissing: missingSignals,
    sourcesUsed,
    confidence: Math.round(overallConfidence * 100) / 100,
  };
}

// ============================================================================
// Batch Scoring
// ============================================================================

/**
 * Score multiple properties in batch
 */
export async function batchCalculateMotivation(
  properties: Array<{ propertyId?: string; address: string }>,
  options?: {
    scoreType?: 'standard' | 'dealflow_iq' | 'both';
    concurrency?: number;
  }
): Promise<
  Array<{
    input: { propertyId?: string; address: string };
    result: ScoringResult | null;
    error?: string;
  }>
> {
  const results: Array<{
    input: { propertyId?: string; address: string };
    result: ScoringResult | null;
    error?: string;
  }> = [];
  const concurrency = options?.concurrency || 5;

  // Process in batches
  for (let i = 0; i < properties.length; i += concurrency) {
    const batch = properties.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(async (prop) => {
        try {
          const result = await calculateSellerMotivation({
            propertyId: prop.propertyId,
            address: prop.address,
            scoreType: options?.scoreType,
            useCache: true,
          });
          return { input: prop, result, error: undefined };
        } catch (e) {
          return {
            input: prop,
            result: null,
            error: e instanceof Error ? e.message : 'Unknown error',
          };
        }
      })
    );
    results.push(...batchResults);
  }

  return results;
}

// ============================================================================
// Quick Score (Simplified API)
// ============================================================================

/**
 * Quick score for API responses - returns just the essential data
 */
export async function quickScore(options: { propertyId?: string; address?: string }): Promise<{
  score: number;
  confidence: number;
  ownerType: string;
  recommendation: string;
}> {
  const result = await calculateSellerMotivation({
    ...options,
    scoreType: 'standard',
    useCache: true,
  });

  return {
    score: result.standardScore.score,
    confidence: result.standardScore.confidence,
    ownerType: `${result.classification.primaryClass}/${result.classification.subClass}`,
    recommendation: result.standardScore.recommendation,
  };
}
