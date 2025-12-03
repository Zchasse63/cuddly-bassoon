/**
 * New Absentee Filter
 * Identifies properties where owner recently became absentee (within 2 years)
 * These are often accidental landlords or recent relocations
 */

import type { PropertyData, FilterMatch } from '../types';
import { applyAbsenteeOwnerFilter } from '../standard/absentee-owner';

export interface NewAbsenteeParams {
  maxYearsSinceAbsentee?: number;
}

const DEFAULT_MAX_YEARS = 2;

/**
 * Check if owner recently became absentee
 * Requires: absentee status + recent ownership or move date
 */
export function applyNewAbsenteeFilter(
  property: PropertyData,
  params: NewAbsenteeParams = {}
): FilterMatch {
  const maxYears = params.maxYearsSinceAbsentee ?? DEFAULT_MAX_YEARS;

  // First, check if currently absentee
  const absenteeResult = applyAbsenteeOwnerFilter(property, {});
  
  if (!absenteeResult.matched) {
    return {
      filterId: 'new_absentee',
      matched: false,
      score: 0,
      reason: 'Property is not currently absentee-owned',
    };
  }

  // Check if ownership is recent
  let ownershipYears: number | null = null;
  
  if (property.ownershipMonths !== null && property.ownershipMonths !== undefined) {
    ownershipYears = property.ownershipMonths / 12;
  } else if (property.lastSaleDate) {
    const saleDate = new Date(property.lastSaleDate);
    const now = new Date();
    const diffMs = now.getTime() - saleDate.getTime();
    ownershipYears = diffMs / (1000 * 60 * 60 * 24 * 365.25);
  }

  if (ownershipYears === null) {
    return {
      filterId: 'new_absentee',
      matched: false,
      score: 0,
      reason: 'Unable to determine ownership duration',
    };
  }

  // Check if within the new absentee window
  if (ownershipYears <= maxYears) {
    // Score higher for more recent absentees
    const recencyScore = Math.round(90 - (ownershipYears / maxYears) * 30);

    return {
      filterId: 'new_absentee',
      matched: true,
      score: recencyScore,
      reason: `Owner became absentee ${ownershipYears.toFixed(1)} years ago (within ${maxYears} year window)`,
      data: {
        ownershipYears,
        lastSaleDate: property.lastSaleDate,
        absenteeData: absenteeResult.data,
      },
    };
  }

  return {
    filterId: 'new_absentee',
    matched: false,
    score: 0,
    reason: `Absentee ownership of ${ownershipYears.toFixed(1)} years exceeds ${maxYears} year threshold`,
    data: { ownershipYears },
  };
}

