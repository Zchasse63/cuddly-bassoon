/**
 * Sunk Cost Filter
 * Identifies high-equity owners with stalled/abandoned projects
 * Owner has resources but gave up on the project
 */

import type { PropertyData, FilterMatch } from '../types';

export interface SunkCostParams {
  minEquityPercent?: number;
}

/**
 * Check if property has sunk cost abandonment
 * Returns match if high equity owner with abandoned project
 */
export function applySunkCostFilter(
  property: PropertyData,
  params: SunkCostParams = {}
): FilterMatch {
  const minEquity = params.minEquityPercent ?? 50;

  // Check if we have both RentCast and Shovels data
  if (!property.shovelsAddressId) {
    return {
      filterId: 'sunk_cost',
      matched: false,
      score: 0,
      reason: 'No Shovels permit data available',
    };
  }

  if (property.equityPercent === null || property.equityPercent === undefined) {
    return {
      filterId: 'sunk_cost',
      matched: false,
      score: 0,
      reason: 'Missing equity data',
    };
  }

  // Check equity threshold
  if (property.equityPercent < minEquity) {
    return {
      filterId: 'sunk_cost',
      matched: false,
      score: 0,
      reason: `Equity (${property.equityPercent}%) below threshold`,
    };
  }

  // Check for abandoned project (stalled or expired permit)
  const hasAbandonedProject = property.hasStalledPermit || property.hasExpiredPermit;

  if (hasAbandonedProject) {
    let score = 80;
    const reasons: string[] = ['High equity owner with abandoned project'];

    // Bonus for very high equity
    if (property.equityPercent >= 70) {
      score += 10;
      reasons.push('Very high equity (70%+)');
    }

    // Bonus for high permit value
    if (property.avgJobValue && property.avgJobValue > 30000) {
      score += 10;
      reasons.push('High permit value (>$30K)');
    }

    return {
      filterId: 'sunk_cost',
      matched: true,
      score: Math.min(score, 100),
      reason: reasons.join('; '),
      data: {
        equityPercent: property.equityPercent,
        hasStalledPermit: property.hasStalledPermit,
        hasExpiredPermit: property.hasExpiredPermit,
        avgJobValue: property.avgJobValue,
      },
    };
  }

  return {
    filterId: 'sunk_cost',
    matched: false,
    score: 0,
    reason: 'No abandoned projects found',
  };
}

