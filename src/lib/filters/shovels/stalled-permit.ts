/**
 * Stalled Permit Filter
 * Identifies properties with permits in review for 90+ days
 * Indicates owner started a project they couldn't complete
 */

import type { PropertyData, FilterMatch } from '../types';

export interface StalledPermitParams {
  minDaysStalled?: number;
}

/**
 * Check if property has a stalled permit
 * Returns match if permit has been in review for extended period
 */
export function applyStalledPermitFilter(
  property: PropertyData,
  params: StalledPermitParams = {}
): FilterMatch {
  // minDaysStalled is used to configure the threshold (default 90 days)
  // The hasStalledPermit flag is pre-calculated based on this threshold
  const _minDays = params.minDaysStalled ?? 90;

  // Check if we have Shovels data
  if (!property.shovelsAddressId) {
    return {
      filterId: 'stalled_permit',
      matched: false,
      score: 0,
      reason: 'No Shovels permit data available',
    };
  }

  // Check for stalled permit flag (pre-calculated based on minDays threshold)
  if (property.hasStalledPermit === true) {
    // Calculate score based on additional factors
    let score = 70;
    const reasons: string[] = [`Permit in review for ${_minDays}+ days`];

    // Bonus for high job value
    if (property.avgJobValue && property.avgJobValue > 25000) {
      score += 15;
      reasons.push('High permit value (>$25K)');
    }

    // Bonus for multiple active permits
    if (property.activePermits && property.activePermits > 1) {
      score += 10;
      reasons.push('Multiple stalled permits');
    }

    return {
      filterId: 'stalled_permit',
      matched: true,
      score: Math.min(score, 100),
      reason: reasons.join('; '),
      data: {
        hasStalledPermit: true,
        activePermits: property.activePermits,
        avgJobValue: property.avgJobValue,
        lastPermitDate: property.lastPermitDate,
      },
    };
  }

  return {
    filterId: 'stalled_permit',
    matched: false,
    score: 0,
    reason: 'No stalled permits found',
  };
}

