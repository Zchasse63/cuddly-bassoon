/**
 * Stratified Scoring Models
 *
 * Three distinct scoring models with different logic per owner type:
 * - Individual: Long ownership = HIGH motivation (life transition likely)
 * - Investor: Long ownership = LOW motivation (stable investment)
 * - Institutional: Process-focused scoring (bureaucratic factors)
 */

import type {
  OwnerClassification,
  OwnerPrimaryClass,
  RawPropertySignals,
  NormalizedSignals,
  ScoringFactor,
  ScoringModelConfig,
  ScoringRules,
  StandardMotivationScore,
} from './types';

// ============================================================================
// Model Configurations
// ============================================================================

/**
 * Individual Owner Model
 *
 * Key insight: For individuals, long ownership often indicates life transitions
 * (retirement, divorce, kids moving out) which correlate with motivation to sell.
 * High equity = capability to sell, moderate motivation increase.
 */
export const individualOwnerModel: ScoringModelConfig = {
  modelId: 'individual_v1',
  modelName: 'Individual Owner Model',
  description: 'Scoring model for owner-occupied and absentee individual owners',
  ownerClasses: ['individual'],

  weights: {
    equity: 0.20,
    duration: 0.25,
    marketPressure: 0.15,
    condition: 0.20,
    distress: 0.20,
  },

  scoringRules: {
    duration: {
      shortTermThresholdYears: 3,
      longTermThresholdYears: 10,
      shortTermScore: 30,           // Recent purchase = low motivation
      longTermScore: 80,            // Long ownership = HIGH motivation (life change)
      invertForInvestor: false,
    },
    equity: {
      lowEquityPercent: 20,
      highEquityPercent: 80,
      lowEquityScore: 40,           // Low equity = harder to sell
      highEquityScore: 70,          // High equity = capability, moderate motivation
      invertForInvestor: false,
    },
    market: {
      hotMarketDom: 20,
      coldMarketDom: 60,
      hotMarketScore: 30,           // Hot market = less motivated (can wait)
      coldMarketScore: 70,          // Cold market = more motivated
    },
    adjustments: {
      trustBonusPoints: 15,         // Trust = likely estate
      reoDiscountPoints: 0,         // N/A for individuals
      distressMultiplier: 1.5,      // Distress signals amplified
    },
  },
};

/**
 * Investor/Entity Owner Model
 *
 * Key insight: For investors, long ownership = stable cash flow = LOW motivation.
 * High equity = no reason to sell (why give up performing asset?).
 * Look for "tired landlord" signals: deferred maintenance, vacancy, rising expenses.
 */
export const investorOwnerModel: ScoringModelConfig = {
  modelId: 'investor_v1',
  modelName: 'Investor/Entity Owner Model',
  description: 'Scoring model for LLCs, corporations, and professional investors',
  ownerClasses: ['investor_entity'],

  weights: {
    equity: 0.15,
    duration: 0.20,
    marketPressure: 0.15,
    condition: 0.30,        // Property condition is key for "tired landlord"
    distress: 0.20,
  },

  scoringRules: {
    duration: {
      shortTermThresholdYears: 2,
      longTermThresholdYears: 10,
      shortTermScore: 60,           // Recent purchase = possible flip
      longTermScore: 25,            // Long ownership = STABLE, LOW motivation
      invertForInvestor: true,      // INVERTED from individual
    },
    equity: {
      lowEquityPercent: 20,
      highEquityPercent: 80,
      lowEquityScore: 50,           // Low equity = might need to sell
      highEquityScore: 20,          // High equity = NO motivation (why sell?)
      invertForInvestor: true,      // INVERTED from individual
    },
    market: {
      hotMarketDom: 20,
      coldMarketDom: 60,
      hotMarketScore: 60,           // Hot market = good time to exit
      coldMarketScore: 40,          // Cold market = hold
    },
    adjustments: {
      trustBonusPoints: 5,          // Living trust = estate planning, not distress
      reoDiscountPoints: 0,         // N/A for investors
      distressMultiplier: 2.0,      // Distress signals are KEY for investors
    },
  },
};

/**
 * Institutional/Distressed Owner Model
 *
 * Key insight: Banks, government, estates have different motivations.
 * Banks: Want to sell but slow process. Focus on timing and protocol compliance.
 * Government: Strict process, limited negotiation. Patience required.
 * Estates: Highly motivated but may have legal/family complications.
 */
export const institutionalOwnerModel: ScoringModelConfig = {
  modelId: 'institutional_v1',
  modelName: 'Institutional/Distressed Owner Model',
  description: 'Scoring model for banks, government, and estate sales',
  ownerClasses: ['institutional_distressed'],

  weights: {
    equity: 0.05,           // Banks don't care about equity (they own the debt)
    duration: 0.15,         // How long in REO affects bank motivation
    marketPressure: 0.25,   // Market conditions affect institutional timeline
    condition: 0.25,        // Condition affects pricing strategy
    distress: 0.30,         // Distress level is primary factor
  },

  scoringRules: {
    duration: {
      shortTermThresholdYears: 0.5,   // 6 months in REO
      longTermThresholdYears: 2,      // 2+ years in REO = very motivated bank
      shortTermScore: 40,             // New REO = bank still testing prices
      longTermScore: 85,              // Long REO = bank desperate to move
      invertForInvestor: false,
    },
    equity: {
      lowEquityPercent: 0,
      highEquityPercent: 100,
      lowEquityScore: 50,
      highEquityScore: 50,            // Equity irrelevant for institutions
      invertForInvestor: false,
    },
    market: {
      hotMarketDom: 20,
      coldMarketDom: 60,
      hotMarketScore: 75,             // Hot market = bank can move faster
      coldMarketScore: 55,            // Cold market = bank still motivated but slower
    },
    adjustments: {
      trustBonusPoints: 25,           // Estate/probate = high motivation
      reoDiscountPoints: -10,         // REO = motivated but slow (discount confidence)
      distressMultiplier: 1.2,        // Already distressed, less amplification
    },
  },
};

// Model registry
const modelRegistry: Record<OwnerPrimaryClass, ScoringModelConfig> = {
  individual: individualOwnerModel,
  investor_entity: investorOwnerModel,
  institutional_distressed: institutionalOwnerModel,
};

// ============================================================================
// Signal Normalization
// ============================================================================

/**
 * Calculate ownership duration in years
 */
function calculateOwnershipYears(lastSaleDate?: string): number | null {
  if (!lastSaleDate) return null;
  const saleDate = new Date(lastSaleDate);
  const now = new Date();
  const years = (now.getTime() - saleDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  return Math.max(0, years);
}

/**
 * Estimate equity percentage
 */
function estimateEquityPercent(signals: RawPropertySignals): number | null {
  const value = signals.estimatedValue || signals.assessedValue;
  if (!value) return null;

  // If we have mortgage balance, calculate directly
  if (signals.mortgageBalance !== undefined) {
    const equity = value - signals.mortgageBalance;
    return Math.max(0, Math.min(100, (equity / value) * 100));
  }

  // If we have last sale data, estimate based on time and appreciation
  if (signals.lastSaleDate && signals.lastSalePrice) {
    const years = calculateOwnershipYears(signals.lastSaleDate) || 0;
    // Assume ~3% annual appreciation and ~80% initial LTV
    const estimatedOriginalLoan = signals.lastSalePrice * 0.8;
    const estimatedCurrentValue = signals.lastSalePrice * Math.pow(1.03, years);
    const estimatedPaydown = estimatedOriginalLoan * (years * 0.02); // ~2% paydown per year
    const estimatedMortgage = Math.max(0, estimatedOriginalLoan - estimatedPaydown);
    const estimatedEquity = estimatedCurrentValue - estimatedMortgage;
    return Math.max(0, Math.min(100, (estimatedEquity / value) * 100));
  }

  return null;
}

/**
 * Normalize duration score based on model rules
 */
function normalizeDurationScore(
  years: number,
  rules: ScoringRules
): { score: number; description: string } {
  const { shortTermThresholdYears, longTermThresholdYears, shortTermScore, longTermScore } = rules.duration;

  if (years < shortTermThresholdYears) {
    return {
      score: shortTermScore,
      description: `Short-term owner (${years.toFixed(1)} years)`,
    };
  } else if (years >= longTermThresholdYears) {
    return {
      score: longTermScore,
      description: `Long-term owner (${years.toFixed(1)} years)`,
    };
  } else {
    // Linear interpolation
    const range = longTermThresholdYears - shortTermThresholdYears;
    const position = (years - shortTermThresholdYears) / range;
    const score = shortTermScore + position * (longTermScore - shortTermScore);
    return {
      score: Math.round(score),
      description: `Medium-term owner (${years.toFixed(1)} years)`,
    };
  }
}

/**
 * Normalize equity score based on model rules
 */
function normalizeEquityScore(
  equityPercent: number,
  rules: ScoringRules
): { score: number; description: string } {
  const { lowEquityPercent, highEquityPercent, lowEquityScore, highEquityScore } = rules.equity;

  if (equityPercent <= lowEquityPercent) {
    return {
      score: lowEquityScore,
      description: `Low equity (${equityPercent.toFixed(0)}%)`,
    };
  } else if (equityPercent >= highEquityPercent) {
    return {
      score: highEquityScore,
      description: `High equity (${equityPercent.toFixed(0)}%)`,
    };
  } else {
    // Linear interpolation
    const range = highEquityPercent - lowEquityPercent;
    const position = (equityPercent - lowEquityPercent) / range;
    const score = lowEquityScore + position * (highEquityScore - lowEquityScore);
    return {
      score: Math.round(score),
      description: `Moderate equity (${equityPercent.toFixed(0)}%)`,
    };
  }
}

/**
 * Normalize market pressure score based on DOM
 */
function normalizeMarketScore(
  dom: number,
  rules: ScoringRules
): { score: number; description: string; trend: string } {
  const { hotMarketDom, coldMarketDom, hotMarketScore, coldMarketScore } = rules.market;

  if (dom <= hotMarketDom) {
    return {
      score: hotMarketScore,
      description: `Hot market (${dom} DOM)`,
      trend: 'hot',
    };
  } else if (dom >= coldMarketDom) {
    return {
      score: coldMarketScore,
      description: `Slow market (${dom} DOM)`,
      trend: 'cold',
    };
  } else {
    // Linear interpolation
    const range = coldMarketDom - hotMarketDom;
    const position = (dom - hotMarketDom) / range;
    const score = hotMarketScore + position * (coldMarketScore - hotMarketScore);
    return {
      score: Math.round(score),
      description: `Balanced market (${dom} DOM)`,
      trend: 'neutral',
    };
  }
}

/**
 * Score property condition based on permits
 */
function scorePropertyCondition(
  signals: RawPropertySignals,
  multiplier: number
): { score: number; description: string } {
  let baseScore = 50; // Neutral starting point
  const conditions: string[] = [];

  if (signals.recentPermits && signals.recentPermits.length > 0) {
    const permits = signals.recentPermits;

    // Abandoned/inactive permits = distress signal
    const inactiveCount = permits.filter(p => p.status === 'inactive').length;
    if (inactiveCount > 0) {
      baseScore += 25;
      conditions.push(`${inactiveCount} abandoned permit(s)`);
    }

    // Major repair permits = deferred maintenance
    const repairTags = ['roofing', 'plumbing', 'electrical', 'hvac', 'foundation'];
    const repairPermits = permits.filter(p =>
      p.tags?.some(tag => repairTags.includes(tag))
    );
    if (repairPermits.length > 0) {
      baseScore += 15;
      conditions.push('Major repair permits');
    }

    // Recent renovation might mean flip or preparing to sell
    const renoTags = ['remodel', 'renovation', 'addition'];
    const renoPermits = permits.filter(p =>
      p.status === 'final' &&
      p.tags?.some(tag => renoTags.includes(tag))
    );
    if (renoPermits.length > 0) {
      baseScore -= 10; // Lower motivation (just renovated)
      conditions.push('Recent renovations completed');
    }
  }

  // Apply multiplier (higher for investors where condition matters more)
  const adjustedScore = Math.min(100, Math.max(0, baseScore * multiplier));

  return {
    score: Math.round(adjustedScore),
    description: conditions.length > 0 ? conditions.join(', ') : 'No permit signals',
  };
}

/**
 * Score distress signals
 */
function scoreDistressSignals(
  signals: RawPropertySignals,
  multiplier: number
): { score: number; factors: string[] } {
  let baseScore = 0;
  const factors: string[] = [];

  if (signals.preForeclosure) {
    baseScore += 40;
    factors.push('Pre-foreclosure');
  }

  if (signals.taxDelinquent) {
    baseScore += 30;
    factors.push('Tax delinquent');
  }

  if (signals.vacantIndicator) {
    baseScore += 20;
    factors.push('Vacant property');
  }

  if (signals.codeLiens && signals.codeLiens > 0) {
    baseScore += Math.min(20, signals.codeLiens * 5);
    factors.push(`${signals.codeLiens} code lien(s)`);
  }

  // Apply multiplier
  const adjustedScore = Math.min(100, baseScore * multiplier);

  return {
    score: Math.round(adjustedScore),
    factors,
  };
}

// ============================================================================
// Main Scoring Function
// ============================================================================

/**
 * Calculate motivation score using the appropriate stratified model
 */
export function calculateMotivationScore(
  signals: RawPropertySignals,
  classification: OwnerClassification
): StandardMotivationScore {
  // Get the appropriate model
  const model = modelRegistry[classification.primaryClass];
  const factors: ScoringFactor[] = [];
  let totalScore = 0;
  const riskFactors: string[] = [];

  // 1. Duration Score
  const ownershipYears = calculateOwnershipYears(signals.lastSaleDate);
  if (ownershipYears !== null) {
    const durationResult = normalizeDurationScore(ownershipYears, model.scoringRules);
    factors.push({
      name: 'Ownership Duration',
      weight: model.weights.duration,
      rawValue: `${ownershipYears.toFixed(1)} years`,
      normalizedScore: durationResult.score,
      impact: durationResult.score >= 60 ? 'positive' : durationResult.score <= 40 ? 'negative' : 'neutral',
      description: model.scoringRules.duration.invertForInvestor
        ? `${durationResult.description} - ${durationResult.score >= 60 ? 'May be exiting investment' : 'Stable hold, low motivation'}`
        : `${durationResult.description} - ${durationResult.score >= 60 ? 'Likely life transition' : 'Recent purchase, likely staying'}`,
      dataSource: 'rentcast',
    });
    totalScore += durationResult.score * model.weights.duration;
  }

  // 2. Equity Score
  const equityPercent = estimateEquityPercent(signals);
  if (equityPercent !== null) {
    const equityResult = normalizeEquityScore(equityPercent, model.scoringRules);
    factors.push({
      name: 'Equity Position',
      weight: model.weights.equity,
      rawValue: `${equityPercent.toFixed(0)}%`,
      normalizedScore: equityResult.score,
      impact: equityResult.score >= 60 ? 'positive' : equityResult.score <= 40 ? 'negative' : 'neutral',
      description: model.scoringRules.equity.invertForInvestor
        ? `${equityResult.description} - ${equityResult.score >= 60 ? 'May take profit' : 'No urgency to sell'}`
        : `${equityResult.description} - ${equityResult.score >= 60 ? 'Flexibility to sell' : 'Limited selling options'}`,
      dataSource: 'derived',
    });
    totalScore += equityResult.score * model.weights.equity;
  }

  // 3. Market Pressure Score
  if (signals.daysOnMarket !== undefined) {
    const marketResult = normalizeMarketScore(signals.daysOnMarket, model.scoringRules);
    factors.push({
      name: 'Market Conditions',
      weight: model.weights.marketPressure,
      rawValue: signals.daysOnMarket,
      normalizedScore: marketResult.score,
      impact: marketResult.score >= 60 ? 'positive' : marketResult.score <= 40 ? 'negative' : 'neutral',
      description: marketResult.description,
      dataSource: 'rentcast',
    });
    totalScore += marketResult.score * model.weights.marketPressure;
  }

  // 4. Property Condition Score
  const conditionResult = scorePropertyCondition(signals, model.scoringRules.adjustments.distressMultiplier);
  factors.push({
    name: 'Property Condition',
    weight: model.weights.condition,
    rawValue: signals.recentPermits?.length || 0,
    normalizedScore: conditionResult.score,
    impact: conditionResult.score >= 60 ? 'positive' : conditionResult.score <= 40 ? 'negative' : 'neutral',
    description: conditionResult.description,
    dataSource: 'shovels',
  });
  totalScore += conditionResult.score * model.weights.condition;

  // 5. Distress Signals Score
  const distressResult = scoreDistressSignals(signals, model.scoringRules.adjustments.distressMultiplier);
  if (distressResult.factors.length > 0) {
    factors.push({
      name: 'Distress Indicators',
      weight: model.weights.distress,
      rawValue: distressResult.factors.join(', '),
      normalizedScore: distressResult.score,
      impact: distressResult.score >= 40 ? 'positive' : 'neutral',
      description: `Active distress signals: ${distressResult.factors.join(', ')}`,
      dataSource: 'supabase',
    });
    totalScore += distressResult.score * model.weights.distress;
    riskFactors.push(...distressResult.factors.map(f => `Distress signal: ${f}`));
  } else {
    factors.push({
      name: 'Distress Indicators',
      weight: model.weights.distress,
      rawValue: null,
      normalizedScore: 30,  // Low base score when no distress
      impact: 'neutral',
      description: 'No active distress signals detected',
      dataSource: 'supabase',
    });
    totalScore += 30 * model.weights.distress;
  }

  // Apply classification-specific adjustments
  if (classification.subClass.includes('trust') || classification.subClass.includes('estate')) {
    totalScore += model.scoringRules.adjustments.trustBonusPoints;
    riskFactors.push('Trust/estate ownership may have legal complexities');
  }

  if (classification.subClass === 'bank_reo') {
    totalScore += model.scoringRules.adjustments.reoDiscountPoints;
    riskFactors.push('REO sales have longer timelines and strict protocols');
  }

  // Normalize total score
  const usedWeights = factors.reduce((sum, f) => sum + f.weight, 0);
  const normalizedTotalScore = usedWeights > 0 ? totalScore / usedWeights : 50;
  const finalScore = Math.round(Math.max(0, Math.min(100, normalizedTotalScore)));

  // Calculate confidence based on data availability
  const maxFactors = 5;
  const factorsWithData = factors.filter(f => f.rawValue !== null).length;
  const dataConfidence = factorsWithData / maxFactors;
  const classificationConfidence = classification.confidence;
  const overallConfidence = (dataConfidence * 0.6 + classificationConfidence * 0.4);

  // Generate recommendation
  const recommendation = generateRecommendation(
    finalScore,
    classification,
    factors,
    riskFactors
  );

  return {
    score: finalScore,
    confidence: Math.round(overallConfidence * 100) / 100,
    modelUsed: model.modelId,
    ownerClassification: classification,
    factors,
    recommendation,
    riskFactors,
  };
}

/**
 * Generate recommendation based on score and factors
 */
function generateRecommendation(
  score: number,
  classification: OwnerClassification,
  factors: ScoringFactor[],
  riskFactors: string[]
): string {
  const ownerType = classification.primaryClass;
  const parts: string[] = [];

  // Score-based opening
  if (score >= 80) {
    parts.push('Very high motivation detected.');
  } else if (score >= 65) {
    parts.push('Strong motivation indicators present.');
  } else if (score >= 50) {
    parts.push('Moderate motivation signals.');
  } else if (score >= 35) {
    parts.push('Limited motivation indicators.');
  } else {
    parts.push('Low motivation signals detected.');
  }

  // Owner-type specific advice
  if (ownerType === 'individual') {
    if (score >= 65) {
      parts.push('Personal approach recommended - empathize with their situation.');
    } else {
      parts.push('May need relationship building before negotiation.');
    }
  } else if (ownerType === 'investor_entity') {
    if (score >= 65) {
      parts.push('Focus on numbers and quick close terms.');
    } else {
      parts.push('Look for tired landlord signals or portfolio exit opportunity.');
    }
  } else if (classification.subClass === 'bank_reo') {
    parts.push('Follow REO protocols. Patience required - expect 45-60 day process.');
  } else if (classification.subClass.includes('estate')) {
    parts.push('High motivation but verify legal authority. May need probate clearance.');
  } else {
    parts.push('Institutional seller - follow their process, limited negotiation flexibility.');
  }

  // Key factor callout
  const highImpactFactors = factors.filter(f => f.impact === 'positive' && f.normalizedScore >= 70);
  if (highImpactFactors.length > 0) {
    parts.push(`Key positive factor: ${highImpactFactors[0]!.name}.`);
  }

  // Risk callout
  if (riskFactors.length > 0) {
    parts.push(`Note: ${riskFactors[0]}.`);
  }

  return parts.join(' ');
}

/**
 * Get the model configuration for an owner class
 */
export function getModelForOwnerClass(primaryClass: OwnerPrimaryClass): ScoringModelConfig {
  return modelRegistry[primaryClass];
}

/**
 * Export all models for testing
 */
export const scoringModels = {
  individual: individualOwnerModel,
  investor: investorOwnerModel,
  institutional: institutionalOwnerModel,
};
