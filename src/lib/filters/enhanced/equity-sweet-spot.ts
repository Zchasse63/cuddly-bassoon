/**
 * Equity Sweet Spot Filter
 * Identifies properties with ideal equity range (40-70%)
 * This range often indicates motivated sellers with negotiation room
 */

import type { PropertyData, FilterMatch } from '../types';

export interface EquitySweetSpotParams {
  equityRange?: [number, number];
}

const DEFAULT_EQUITY_RANGE: [number, number] = [40, 70];

/**
 * Calculate equity percentage if not provided
 */
function calculateEquityPercent(property: PropertyData): number | null {
  if (property.equityPercent !== null && property.equityPercent !== undefined) {
    return property.equityPercent;
  }

  const value = property.estimatedValue;
  const mortgage = property.mortgageBalance;

  if (!value || value <= 0) return null;
  if (mortgage === null || mortgage === undefined) return null;
  if (mortgage <= 0) return 100;

  const equity = ((value - mortgage) / value) * 100;
  return Math.max(0, Math.min(100, equity));
}

/**
 * Calculate how centered the equity is within the sweet spot
 */
function calculateCenterScore(
  equityPercent: number,
  min: number,
  max: number
): number {
  const center = (min + max) / 2;
  const range = max - min;
  const distanceFromCenter = Math.abs(equityPercent - center);
  const maxDistance = range / 2;

  // Score 100 at center, lower toward edges
  return Math.round(100 - (distanceFromCenter / maxDistance) * 30);
}

/**
 * Check if property equity is in the sweet spot range
 */
export function applyEquitySweetSpotFilter(
  property: PropertyData,
  params: EquitySweetSpotParams = {}
): FilterMatch {
  const [minEquity, maxEquity] = params.equityRange ?? DEFAULT_EQUITY_RANGE;
  const equityPercent = calculateEquityPercent(property);

  if (equityPercent === null) {
    return {
      filterId: 'equity_sweet_spot',
      matched: false,
      score: 0,
      reason: 'Unable to calculate equity (missing valuation or mortgage data)',
    };
  }

  // Check if in range
  if (equityPercent >= minEquity && equityPercent <= maxEquity) {
    const score = calculateCenterScore(equityPercent, minEquity, maxEquity);

    return {
      filterId: 'equity_sweet_spot',
      matched: true,
      score,
      reason: `Equity of ${equityPercent.toFixed(1)}% is in sweet spot (${minEquity}-${maxEquity}%)`,
      data: {
        equityPercent,
        rangeMin: minEquity,
        rangeMax: maxEquity,
        estimatedValue: property.estimatedValue,
        mortgageBalance: property.mortgageBalance,
      },
    };
  }

  // Not in range
  const position = equityPercent < minEquity ? 'below' : 'above';
  
  return {
    filterId: 'equity_sweet_spot',
    matched: false,
    score: 0,
    reason: `Equity of ${equityPercent.toFixed(1)}% is ${position} the ${minEquity}-${maxEquity}% sweet spot`,
    data: { equityPercent },
  };
}

