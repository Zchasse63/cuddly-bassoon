/**
 * Over-Improved Filter
 * Identifies properties with significant permit investment but below-average appreciation
 * Owner can't recoup their investment
 */

import type { PropertyData, FilterMatch } from '../types';

export interface OverImprovedParams {
  minPermitValue?: number;
  yearsToConsider?: number;
}

/**
 * Check if property is over-improved for the area
 * Returns match if high permit investment with low appreciation
 */
export function applyOverImprovedFilter(
  property: PropertyData,
  params: OverImprovedParams = {}
): FilterMatch {
  const minPermitValue = params.minPermitValue ?? 50000;

  // Check if we have both RentCast and Shovels data
  if (!property.shovelsAddressId) {
    return {
      filterId: 'over_improved',
      matched: false,
      score: 0,
      reason: 'No Shovels permit data available',
    };
  }

  if (!property.lastSalePrice || !property.estimatedValue) {
    return {
      filterId: 'over_improved',
      matched: false,
      score: 0,
      reason: 'Missing sale price or current value data',
    };
  }

  // Check total permit value
  const totalPermitValue = property.totalJobValue ?? 0;
  if (totalPermitValue < minPermitValue) {
    return {
      filterId: 'over_improved',
      matched: false,
      score: 0,
      reason: `Permit investment ($${totalPermitValue.toLocaleString()}) below threshold`,
    };
  }

  // Calculate appreciation
  const appreciation =
    ((property.estimatedValue - property.lastSalePrice) / property.lastSalePrice) * 100;

  // If appreciation is low relative to investment, it's over-improved
  // Rough heuristic: if appreciation % is less than (permit value / sale price) * 50
  const expectedAppreciation = (totalPermitValue / property.lastSalePrice) * 50;

  if (appreciation < expectedAppreciation) {
    let score = 70;
    const reasons: string[] = ['High permit investment with low appreciation'];

    // Bonus for very high investment
    if (totalPermitValue > 100000) {
      score += 15;
      reasons.push('Permit investment over $100K');
    }

    // Bonus for absentee owner
    if (property.isOwnerOccupied === false) {
      score += 10;
      reasons.push('Absentee owner');
    }

    return {
      filterId: 'over_improved',
      matched: true,
      score: Math.min(score, 100),
      reason: reasons.join('; '),
      data: {
        totalPermitValue,
        lastSalePrice: property.lastSalePrice,
        estimatedValue: property.estimatedValue,
        appreciationPercent: Math.round(appreciation * 100) / 100,
        expectedAppreciation: Math.round(expectedAppreciation * 100) / 100,
      },
    };
  }

  return {
    filterId: 'over_improved',
    matched: false,
    score: 0,
    reason: 'Property appreciation aligns with investment',
  };
}

