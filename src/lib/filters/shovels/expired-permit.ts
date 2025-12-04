/**
 * Expired Permit Filter
 * Identifies properties with expired permits without final inspection
 * Indicates incomplete work and potential legal occupancy issues
 */

import type { PropertyData, FilterMatch } from '../types';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ExpiredPermitParams {
  // No configurable parameters
}

/**
 * Check if property has expired permits
 * Returns match if permit expired without final inspection
 */
export function applyExpiredPermitFilter(
  property: PropertyData,
  _params: ExpiredPermitParams = {}
): FilterMatch {
  // Check if we have Shovels data
  if (!property.shovelsAddressId) {
    return {
      filterId: 'expired_permit',
      matched: false,
      score: 0,
      reason: 'No Shovels permit data available',
    };
  }

  // Check for expired permit flag
  if (property.hasExpiredPermit === true) {
    let score = 65;
    const reasons: string[] = ['Permit expired without final inspection'];

    // Bonus for remodel or addition permits (more significant)
    if (property.totalJobValue && property.totalJobValue > 20000) {
      score += 20;
      reasons.push('High-value permit (likely remodel/addition)');
    }

    // Bonus for multiple expired permits
    if (property.expiredPermits && property.expiredPermits > 1) {
      score += 10;
      reasons.push('Multiple expired permits');
    }

    return {
      filterId: 'expired_permit',
      matched: true,
      score: Math.min(score, 100),
      reason: reasons.join('; '),
      data: {
        hasExpiredPermit: true,
        expiredPermits: property.expiredPermits,
        totalJobValue: property.totalJobValue,
        lastPermitDate: property.lastPermitDate,
      },
    };
  }

  return {
    filterId: 'expired_permit',
    matched: false,
    score: 0,
    reason: 'No expired permits found',
  };
}

