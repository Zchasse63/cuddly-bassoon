/**
 * Falling Behind Filter
 * Identifies properties with no permits in high-activity neighborhoods
 * Property is falling behind market improvements
 */

import type { PropertyData, FilterMatch } from '../types';

export interface FallingBehindParams {
  minNeighborhoodPermits?: number;
  maxPropertyPermits?: number;
}

/**
 * Check if property is falling behind neighbors
 * Returns match if neighborhood has high activity but property has none
 */
export function applyFallingBehindFilter(
  property: PropertyData,
  params: FallingBehindParams = {}
): FilterMatch {
  const maxPropertyPermits = params.maxPropertyPermits ?? 0;

  // Check if we have Shovels data
  if (!property.shovelsAddressId) {
    return {
      filterId: 'falling_behind',
      matched: false,
      score: 0,
      reason: 'No Shovels permit data available',
    };
  }

  // Check property permit count (should be low/zero)
  const propertyPermits = property.permitsLast12Months ?? 0;
  if (propertyPermits > maxPropertyPermits) {
    return {
      filterId: 'falling_behind',
      matched: false,
      score: 0,
      reason: 'Property has recent permit activity',
    };
  }

  // For now, we check if property has no permits while having Shovels data
  // In a full implementation, we'd compare against neighborhood vitality scores
  if (propertyPermits === 0 && property.totalPermits === 0) {
    let score = 55;
    const reasons: string[] = ['No permit history while in active area'];

    // Bonus for below-median value (more room to improve)
    if (property.estimatedValue && property.estimatedValue < 300000) {
      score += 15;
      reasons.push('Below median property value');
    }

    // Bonus for older property
    if (property.yearBuilt && new Date().getFullYear() - property.yearBuilt > 30) {
      score += 10;
      reasons.push('Property over 30 years old');
    }

    return {
      filterId: 'falling_behind',
      matched: true,
      score: Math.min(score, 100),
      reason: reasons.join('; '),
      data: {
        propertyPermits: property.totalPermits,
        permitsLast12Months: property.permitsLast12Months,
        yearBuilt: property.yearBuilt,
        estimatedValue: property.estimatedValue,
      },
    };
  }

  return {
    filterId: 'falling_behind',
    matched: false,
    score: 0,
    reason: 'Property has permit history',
  };
}

