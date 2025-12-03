/**
 * High Equity Filter
 * Identifies properties with significant equity position
 * Default threshold: 40% equity
 */

import type { PropertyData, FilterMatch } from '../types';

export interface HighEquityParams {
  minEquityPercent?: number;
}

const DEFAULT_MIN_EQUITY_PERCENT = 40;

/**
 * Calculate equity percentage if not provided
 * Equity = (Value - Mortgage) / Value * 100
 */
function calculateEquityPercent(property: PropertyData): number | null {
  // Use pre-calculated equity if available
  if (property.equityPercent !== null && property.equityPercent !== undefined) {
    return property.equityPercent;
  }

  // Calculate from value and mortgage
  const value = property.estimatedValue;
  const mortgage = property.mortgageBalance;

  if (!value || value <= 0) {
    return null;
  }

  // If no mortgage balance, assume free & clear or unknown
  if (mortgage === null || mortgage === undefined) {
    return null;
  }

  // Free & clear = 100% equity
  if (mortgage <= 0) {
    return 100;
  }

  const equity = ((value - mortgage) / value) * 100;
  return Math.max(0, Math.min(100, equity));
}

/**
 * Check if property has high equity
 */
export function applyHighEquityFilter(
  property: PropertyData,
  params: HighEquityParams = {}
): FilterMatch {
  const minEquityPercent = params.minEquityPercent ?? DEFAULT_MIN_EQUITY_PERCENT;
  const equityPercent = calculateEquityPercent(property);

  // Can't determine equity
  if (equityPercent === null) {
    return {
      filterId: 'high_equity',
      matched: false,
      score: 0,
      reason: 'Unable to calculate equity (missing valuation or mortgage data)',
    };
  }

  const matched = equityPercent >= minEquityPercent;

  if (matched) {
    // Score based on how far above threshold
    const score = Math.min(100, 50 + (equityPercent - minEquityPercent));

    return {
      filterId: 'high_equity',
      matched: true,
      score: Math.round(score),
      reason: `Property has ${equityPercent.toFixed(1)}% equity (threshold: ${minEquityPercent}%)`,
      data: {
        equityPercent,
        estimatedValue: property.estimatedValue,
        mortgageBalance: property.mortgageBalance,
        equityAmount: property.equityAmount,
      },
    };
  }

  return {
    filterId: 'high_equity',
    matched: false,
    score: 0,
    reason: `Equity ${equityPercent.toFixed(1)}% is below ${minEquityPercent}% threshold`,
    data: { equityPercent },
  };
}

