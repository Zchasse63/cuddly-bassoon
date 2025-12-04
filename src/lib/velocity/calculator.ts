/**
 * Market Velocity Index Calculator
 * Core calculation logic for the Market Velocity Index
 */

import type { RentCastMarketData } from '@/lib/rentcast/types';
import type { ShovelsGeoMetrics } from '@/lib/shovels/types';
import type { MarketVelocityIndex, VelocityClassification } from '@/types/velocity';
import { getVelocityClassification } from '@/types/velocity';

// =============================================
// Configuration
// =============================================

/**
 * Weight configuration for velocity index components
 */
export const VELOCITY_WEIGHTS = {
  daysOnMarket: 0.4,      // 40% - How fast properties sell
  absorption: 0.25,        // 25% - Monthly sales rate
  inventory: 0.1,          // 10% - Months of inventory
  permitActivity: 0.15,    // 15% - Construction activity
  investmentConviction: 0.1, // 10% - Investment quality
} as const;

/**
 * Score calculation parameters
 */
export const SCORE_PARAMS = {
  // DOM Score: 10 days = 100, 60 days = 0
  dom: {
    minDays: 10,
    maxDays: 60,
  },
  // Absorption Score: 0.5 (50% monthly) = 100
  absorption: {
    maxRate: 0.5,
  },
  // Inventory Score: 2 months = 100, 8 months = 0
  inventory: {
    minMonths: 2,
    maxMonths: 8,
  },
  // Permit Activity Score: 50 permits per 1000 properties = 100
  permits: {
    baselinePerThousand: 50,
  },
  // Investment Conviction: $50k average permit value = 100
  investment: {
    baselinePermitValue: 50000,
  },
} as const;

// =============================================
// Step 1: Calculate Absorption Rate
// =============================================

/**
 * Calculate the absorption rate from RentCast market data
 * Absorption rate = monthly sales / active listings
 */
export function calculateAbsorptionRate(marketData: RentCastMarketData): number {
  // Get monthly data if available
  const monthlyData = marketData.monthlyData || [];
  const recentMonths = monthlyData.slice(-3);

  // If no monthly data, estimate from inventory and DOM
  if (recentMonths.length === 0) {
    const inventory = marketData.inventory || 100;
    const daysOnMarket = marketData.daysOnMarket || 45;

    // If DOM is 30 days, roughly 1 cycle per month = 100% absorption
    // If DOM is 60 days, roughly 0.5 cycle per month = 50% absorption
    const turnoversPerMonth = 30 / Math.max(15, daysOnMarket);
    return Math.min(1, turnoversPerMonth);
  }

  // Calculate average monthly inventory changes
  let avgMonthlyInventoryChange = 0;
  for (const month of recentMonths) {
    // Estimate new listings as a proxy for monthly activity
    const monthlyInventory = month.inventory || marketData.inventory || 50;
    avgMonthlyInventoryChange += monthlyInventory * 0.2; // Assume ~20% turnover
  }
  avgMonthlyInventoryChange /= recentMonths.length;

  const activeListings = marketData.inventory || 100;

  // Absorption rate: what percentage of current inventory sells per month
  return Math.min(1, avgMonthlyInventoryChange / Math.max(1, activeListings));
}

// =============================================
// Step 2: Calculate Months of Inventory
// =============================================

/**
 * Calculate months of inventory (how long to sell all current inventory)
 */
export function calculateMonthsOfInventory(marketData: RentCastMarketData): number {
  const absorptionRate = calculateAbsorptionRate(marketData);

  if (absorptionRate <= 0) {
    return 12; // Default to 12 months if no data (balanced market)
  }

  // How many months to sell all current inventory at current pace
  return Math.min(24, 1 / absorptionRate);
}

// =============================================
// Step 3: Calculate Permit Intensity
// =============================================

/**
 * Calculate permit intensity score from Shovels metrics
 * Normalizes permits per 1000 properties
 */
export function calculatePermitIntensity(
  shovelsMetrics: ShovelsGeoMetrics | null,
  totalProperties: number
): number {
  if (!shovelsMetrics) {
    return 50; // Default to middle score if no Shovels data
  }

  const totalPermits = shovelsMetrics.metrics.total_permits || 0;

  // Normalize: permits per 1000 properties
  const permitsPerThousand = (totalPermits / Math.max(1, totalProperties)) * 1000;

  // Score: 50 permits per 1000 = 100 score
  return Math.min(100, (permitsPerThousand / SCORE_PARAMS.permits.baselinePerThousand) * 100);
}

// =============================================
// Step 4: Calculate Investment Conviction Score
// =============================================

/**
 * Calculate investment conviction score from permit values
 * Higher average permit values = more confident investments
 */
export function calculateInvestmentConviction(shovelsMetrics: ShovelsGeoMetrics | null): number {
  if (!shovelsMetrics) {
    return 50; // Default to middle score if no Shovels data
  }

  const permitValue = shovelsMetrics.metrics.permit_value_total || 0;
  const permitCount = shovelsMetrics.metrics.total_permits || 1;

  // Average permit value indicates investment size
  const avgPermitValue = permitValue / Math.max(1, permitCount);

  // Score: $50k average permit value = 100 score
  return Math.min(100, (avgPermitValue / SCORE_PARAMS.investment.baselinePermitValue) * 100);
}

// =============================================
// Step 5: Calculate Component Scores
// =============================================

interface ComponentScores {
  daysOnMarketScore: number;
  absorptionScore: number;
  inventoryScore: number;
  permitActivityScore: number;
  investmentConvictionScore: number;
}

/**
 * Calculate all component scores
 */
export function calculateComponentScores(
  marketData: RentCastMarketData,
  shovelsMetrics: ShovelsGeoMetrics | null
): ComponentScores {
  // --- DOM Score (40% weight) ---
  // Lower DOM = higher score
  // 10 days = 100, 60 days = 0
  const avgDOM = marketData.daysOnMarket || 45;
  const domRange = SCORE_PARAMS.dom.maxDays - SCORE_PARAMS.dom.minDays;
  const daysOnMarketScore = Math.max(
    0,
    Math.min(100, 100 - ((avgDOM - SCORE_PARAMS.dom.minDays) / domRange) * 100)
  );

  // --- Absorption Score (25% weight) ---
  // Higher absorption = higher score
  // 0.5 (50% monthly) = 100
  const absorptionRate = calculateAbsorptionRate(marketData);
  const absorptionScore = Math.min(100, (absorptionRate / SCORE_PARAMS.absorption.maxRate) * 100);

  // --- Inventory Score (10% weight) ---
  // Lower months of inventory = higher score
  // 2 months = 100, 8 months = 0
  const monthsOfInventory = calculateMonthsOfInventory(marketData);
  const invRange = SCORE_PARAMS.inventory.maxMonths - SCORE_PARAMS.inventory.minMonths;
  const inventoryScore = Math.max(
    0,
    Math.min(100, 100 - ((monthsOfInventory - SCORE_PARAMS.inventory.minMonths) / invRange) * 100)
  );

  // --- Permit Activity Score (15% weight) ---
  // Estimate total properties from inventory (listings typically ~2% of total)
  const estimatedProperties = (marketData.inventory || 50) * 50;
  const permitActivityScore = calculatePermitIntensity(shovelsMetrics, estimatedProperties);

  // --- Investment Conviction Score (10% weight) ---
  const investmentConvictionScore = calculateInvestmentConviction(shovelsMetrics);

  return {
    daysOnMarketScore: Math.round(daysOnMarketScore * 100) / 100,
    absorptionScore: Math.round(absorptionScore * 100) / 100,
    inventoryScore: Math.round(inventoryScore * 100) / 100,
    permitActivityScore: Math.round(permitActivityScore * 100) / 100,
    investmentConvictionScore: Math.round(investmentConvictionScore * 100) / 100,
  };
}

// =============================================
// Main Calculator Function
// =============================================

export interface CalculateVelocityOptions {
  zipCode: string;
  geoId?: string;
  city?: string;
  state?: string;
  county?: string;
  centerLat?: number;
  centerLng?: number;
}

/**
 * Calculate the complete Market Velocity Index
 */
export function calculateMarketVelocityIndex(
  marketData: RentCastMarketData,
  shovelsMetrics: ShovelsGeoMetrics | null,
  options: CalculateVelocityOptions
): MarketVelocityIndex {
  // Calculate all component scores
  const scores = calculateComponentScores(marketData, shovelsMetrics);

  // Calculate weighted composite score
  const velocityIndex = Math.round(
    scores.daysOnMarketScore * VELOCITY_WEIGHTS.daysOnMarket +
      scores.absorptionScore * VELOCITY_WEIGHTS.absorption +
      scores.inventoryScore * VELOCITY_WEIGHTS.inventory +
      scores.permitActivityScore * VELOCITY_WEIGHTS.permitActivity +
      scores.investmentConvictionScore * VELOCITY_WEIGHTS.investmentConviction
  );

  // Get classification based on score
  const classification = getVelocityClassification(velocityIndex);

  // Calculate raw metrics
  const absorptionRate = calculateAbsorptionRate(marketData);
  const monthsOfInventory = calculateMonthsOfInventory(marketData);

  return {
    zipCode: options.zipCode,
    geoId: options.geoId || shovelsMetrics?.geo_id,
    city: options.city || marketData.city || undefined,
    state: options.state || marketData.state || undefined,
    county: options.county || marketData.county || undefined,

    // Component Scores
    daysOnMarketScore: scores.daysOnMarketScore,
    absorptionScore: scores.absorptionScore,
    inventoryScore: scores.inventoryScore,
    permitActivityScore: scores.permitActivityScore,
    investmentConvictionScore: scores.investmentConvictionScore,

    // Raw Metrics
    avgDaysOnMarket: marketData.daysOnMarket || 45,
    medianDaysOnMarket: Math.round((marketData.daysOnMarket || 45) * 0.85), // Median typically lower
    absorptionRate: Math.round(absorptionRate * 10000) / 10000,
    monthsOfInventory: Math.round(monthsOfInventory * 100) / 100,
    totalListings: marketData.inventory || 0,
    permitVolume: shovelsMetrics?.metrics.total_permits || 0,
    permitValueTotal: shovelsMetrics?.metrics.permit_value_total || 0,

    // Composite
    velocityIndex,
    classification,

    // Coordinates
    centerLat: options.centerLat,
    centerLng: options.centerLng,

    // Metadata
    calculatedAt: new Date().toISOString(),
    dataFreshness: {
      rentcastLastUpdated: new Date().toISOString(),
      shovelsLastUpdated: shovelsMetrics ? new Date().toISOString() : undefined,
    },
  };
}

// =============================================
// Interpretation Helpers
// =============================================

/**
 * Generate interpretation for Days on Market
 */
export function interpretDOM(avgDOM: number): string {
  if (avgDOM <= 15) return 'Very fast market - properties moving quickly';
  if (avgDOM <= 25) return 'Fast market - healthy buyer demand';
  if (avgDOM <= 35) return 'Normal market pace';
  if (avgDOM <= 50) return 'Slower market - more negotiation time';
  return 'Slow market - properties sitting longer';
}

/**
 * Generate interpretation for Absorption Rate
 */
export function interpretAbsorption(rate: number): string {
  const percent = rate * 100;
  if (percent >= 40) return 'Very high absorption - strong buyer demand';
  if (percent >= 25) return 'Good absorption - healthy market activity';
  if (percent >= 15) return 'Moderate absorption - balanced market';
  if (percent >= 8) return 'Low absorption - slower market';
  return 'Very low absorption - stagnant market';
}

/**
 * Generate interpretation for Months of Inventory
 */
export function interpretInventory(months: number): string {
  if (months <= 2) return "Seller's market - very low inventory";
  if (months <= 4) return "Seller's market - limited inventory";
  if (months <= 6) return 'Balanced market';
  if (months <= 8) return "Buyer's market - adequate inventory";
  return "Buyer's market - high inventory";
}

/**
 * Generate interpretation for Permit Activity
 */
export function interpretPermits(permitCount: number): string {
  if (permitCount >= 100) return 'High construction activity - active development';
  if (permitCount >= 50) return 'Moderate construction activity';
  if (permitCount >= 20) return 'Some construction activity';
  return 'Low construction activity';
}

/**
 * Generate interpretation for Investment Conviction
 */
export function interpretInvestment(permitValue: number): string {
  if (permitValue >= 5000000) return 'Major investments - high conviction';
  if (permitValue >= 1000000) return 'Significant investment activity';
  if (permitValue >= 250000) return 'Moderate investment activity';
  return 'Lower investment activity';
}

/**
 * Generate wholesale implications based on velocity data
 */
export function generateWholesaleImplications(velocity: MarketVelocityIndex): string {
  const implications: string[] = [];

  // Overall assessment
  if (velocity.classification === 'On Fire' || velocity.classification === 'Hot') {
    implications.push(
      'This is a strong market for wholesaling with confident assignment potential.'
    );
    implications.push(
      `With an average ${velocity.avgDaysOnMarket}-day DOM, you should be able to find a buyer within your typical 30-45 day contract window.`
    );
  } else if (velocity.classification === 'Warm') {
    implications.push(
      'This is a decent market for wholesaling with reasonable assignment potential.'
    );
    implications.push('Standard marketing timeline should work for finding buyers.');
  } else if (velocity.classification === 'Balanced') {
    implications.push(
      'This is a neutral market - extra due diligence recommended before locking up deals.'
    );
    implications.push(
      'Consider having backup buyers lined up before making offers.'
    );
  } else {
    implications.push(
      'Caution advised in this market - assignment risk is elevated.'
    );
    implications.push(
      'Consider longer contract periods or having buyers pre-committed before making offers.'
    );
  }

  // Specific factors
  if (velocity.absorptionRate >= 0.3) {
    implications.push(
      `High ${Math.round(velocity.absorptionRate * 100)}% absorption rate means active buyer competition.`
    );
  }

  if (velocity.monthsOfInventory <= 3) {
    implications.push(
      `Only ${velocity.monthsOfInventory.toFixed(1)} months of inventory creates urgency among buyers.`
    );
  }

  if (velocity.permitActivityScore >= 70) {
    implications.push(
      'Strong permit activity suggests investor interest in the area.'
    );
  }

  return implications.join(' ');
}

/**
 * Generate comparison analysis between multiple markets
 */
export function generateComparisonAnalysis(velocities: MarketVelocityIndex[]): string {
  if (velocities.length < 2) {
    return 'Need at least 2 markets to compare.';
  }

  const sorted = [...velocities].sort((a, b) => b.velocityIndex - a.velocityIndex);
  const best = sorted[0]!;
  const worst = sorted[sorted.length - 1]!;

  const analysis: string[] = [];

  // Winner summary
  analysis.push(
    `${best.city || best.zipCode} leads with a velocity index of ${best.velocityIndex} (${best.classification}).`
  );

  // Key differentiators
  if (best.avgDaysOnMarket !== worst.avgDaysOnMarket) {
    const domDiff = worst.avgDaysOnMarket - best.avgDaysOnMarket;
    if (domDiff > 10) {
      analysis.push(
        `Properties sell ${Math.round(domDiff)} days faster in ${best.city || best.zipCode}.`
      );
    }
  }

  // Recommendation
  if (best.velocityIndex - worst.velocityIndex > 20) {
    analysis.push(
      `${best.city || best.zipCode} is significantly stronger for wholesaling.`
    );
  } else {
    analysis.push('Both markets are relatively comparable for wholesaling activity.');
  }

  return analysis.join(' ');
}
