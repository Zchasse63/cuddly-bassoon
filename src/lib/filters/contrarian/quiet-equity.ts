/**
 * Quiet Equity Builder Filter
 * Identifies long-term owners (15+ years) with no recent refinance activity
 * These owners have significant untapped equity and may not realize it
 */

import type { PropertyData, FilterMatch } from '../types';

export interface QuietEquityParams {
  minOwnershipYears?: number;
}

const DEFAULT_MIN_OWNERSHIP_YEARS = 15;

/**
 * Extended property data with refinance history
 */
export interface PropertyWithRefinanceHistory extends PropertyData {
  lastRefinanceDate?: string;
  refinanceHistory?: Array<{
    date: string;
    amount?: number;
  }>;
  originalMortgageDate?: string;
}

/**
 * Get ownership duration in years
 */
function getOwnershipYears(property: PropertyData): number | null {
  if (property.ownershipMonths !== null && property.ownershipMonths !== undefined) {
    return property.ownershipMonths / 12;
  }

  if (property.lastSaleDate) {
    const saleDate = new Date(property.lastSaleDate);
    const now = new Date();
    const diffMs = now.getTime() - saleDate.getTime();
    return diffMs / (1000 * 60 * 60 * 24 * 365.25);
  }

  return null;
}

/**
 * Check years since last refinance
 */
function getYearsSinceRefinance(property: PropertyWithRefinanceHistory): number | null {
  if (property.lastRefinanceDate) {
    const refiDate = new Date(property.lastRefinanceDate);
    const now = new Date();
    const diffMs = now.getTime() - refiDate.getTime();
    return diffMs / (1000 * 60 * 60 * 24 * 365.25);
  }

  if (property.refinanceHistory && property.refinanceHistory.length > 0) {
    const sorted = [...property.refinanceHistory].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const lastRefi = sorted[0]!;
    const refiDate = new Date(lastRefi.date);
    const now = new Date();
    const diffMs = now.getTime() - refiDate.getTime();
    return diffMs / (1000 * 60 * 60 * 24 * 365.25);
  }

  return null;
}

/**
 * Check if property is a quiet equity builder
 */
export function applyQuietEquityFilter(
  property: PropertyWithRefinanceHistory,
  params: QuietEquityParams = {}
): FilterMatch {
  const minYears = params.minOwnershipYears ?? DEFAULT_MIN_OWNERSHIP_YEARS;
  const ownershipYears = getOwnershipYears(property);

  if (ownershipYears === null) {
    return {
      filterId: 'quiet_equity',
      matched: false,
      score: 0,
      reason: 'Unable to determine ownership duration',
    };
  }

  // Check if ownership meets threshold
  if (ownershipYears < minYears) {
    return {
      filterId: 'quiet_equity',
      matched: false,
      score: 0,
      reason: `Ownership of ${ownershipYears.toFixed(1)} years is below ${minYears} year threshold`,
      data: { ownershipYears },
    };
  }

  // Check refinance activity
  const yearsSinceRefi = getYearsSinceRefinance(property);

  // If we have refinance data
  if (yearsSinceRefi !== null) {
    // Recent refinance means they've already tapped equity
    if (yearsSinceRefi < 5) {
      return {
        filterId: 'quiet_equity',
        matched: false,
        score: 0,
        reason: `Refinanced ${yearsSinceRefi.toFixed(1)} years ago (not quiet equity)`,
        data: { ownershipYears, yearsSinceRefi },
      };
    }

    // Long time since refi = quiet equity builder
    const score = Math.min(100, 70 + (yearsSinceRefi - 5) * 3);

    return {
      filterId: 'quiet_equity',
      matched: true,
      score: Math.round(score),
      reason: `Owned ${ownershipYears.toFixed(1)} years, no refinance in ${yearsSinceRefi.toFixed(1)} years`,
      data: {
        ownershipYears,
        yearsSinceRefi,
        equityPercent: property.equityPercent,
        estimatedValue: property.estimatedValue,
      },
    };
  }

  // No refinance data - assume no recent refinance if long-term owner
  const score = Math.min(100, 60 + (ownershipYears - minYears) * 2);

  return {
    filterId: 'quiet_equity',
    matched: true,
    score: Math.round(score),
    reason: `Owned ${ownershipYears.toFixed(1)} years (refinance history not available)`,
    data: {
      ownershipYears,
      equityPercent: property.equityPercent,
      note: 'No refinance history available - assumed quiet equity',
    },
  };
}

