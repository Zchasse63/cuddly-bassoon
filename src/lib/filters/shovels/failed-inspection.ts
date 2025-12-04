/**
 * Failed Inspection Filter
 * Identifies properties with low inspection pass rates
 * Indicates construction problems or contractor abandonment
 */

import type { PropertyData, FilterMatch } from '../types';

export interface FailedInspectionParams {
  maxPassRate?: number;
}

/**
 * Check if property has failed inspections
 * Returns match if inspection pass rate is below threshold
 */
export function applyFailedInspectionFilter(
  property: PropertyData,
  params: FailedInspectionParams = {}
): FilterMatch {
  const maxPassRate = params.maxPassRate ?? 50;

  // Check if we have Shovels data
  if (!property.shovelsAddressId) {
    return {
      filterId: 'failed_inspection',
      matched: false,
      score: 0,
      reason: 'No Shovels permit data available',
    };
  }

  // Check inspection pass rate
  if (
    property.avgInspectionPassRate !== null &&
    property.avgInspectionPassRate !== undefined &&
    property.avgInspectionPassRate < maxPassRate
  ) {
    let score = 75;
    const reasons: string[] = [`Inspection pass rate below ${maxPassRate}%`];

    // Bonus for very low pass rate
    if (property.avgInspectionPassRate < 30) {
      score += 15;
      reasons.push('Very low pass rate (<30%)');
    }

    // Bonus for old permits (indicates long-standing issues)
    if (property.lastPermitDate) {
      const permitDate = new Date(property.lastPermitDate);
      const monthsAgo = (Date.now() - permitDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
      if (monthsAgo > 6) {
        score += 10;
        reasons.push('Permit over 6 months old');
      }
    }

    return {
      filterId: 'failed_inspection',
      matched: true,
      score: Math.min(score, 100),
      reason: reasons.join('; '),
      data: {
        avgInspectionPassRate: property.avgInspectionPassRate,
        totalPermits: property.totalPermits,
        lastPermitDate: property.lastPermitDate,
      },
    };
  }

  return {
    filterId: 'failed_inspection',
    matched: false,
    score: 0,
    reason: property.avgInspectionPassRate
      ? `Inspection pass rate (${property.avgInspectionPassRate}%) above threshold`
      : 'No inspection data available',
  };
}

