/**
 * Deferred Maintenance Filter
 * Identifies long-term absentee owners with no permits in 5+ years
 * Tired landlord not investing in property
 */

import type { PropertyData, FilterMatch } from '../types';

export interface DeferredMaintenanceParams {
  minOwnershipYears?: number;
  maxYearsSincePermit?: number;
}

/**
 * Check if property has deferred maintenance
 * Returns match if long-term owner with no recent permits
 */
export function applyDeferredMaintenanceFilter(
  property: PropertyData,
  params: DeferredMaintenanceParams = {}
): FilterMatch {
  const minOwnershipYears = params.minOwnershipYears ?? 10;
  const maxYearsSincePermit = params.maxYearsSincePermit ?? 5;

  // Check if owner-occupied (we want absentee)
  if (property.isOwnerOccupied === true) {
    return {
      filterId: 'deferred_maintenance',
      matched: false,
      score: 0,
      reason: 'Property is owner-occupied',
    };
  }

  // Check ownership duration
  const ownershipYears = property.ownershipMonths ? property.ownershipMonths / 12 : 0;
  if (ownershipYears < minOwnershipYears) {
    return {
      filterId: 'deferred_maintenance',
      matched: false,
      score: 0,
      reason: `Ownership (${Math.round(ownershipYears)} years) below threshold`,
    };
  }

  // Check permit history
  let yearsSincePermit: number | null = null;
  if (property.lastPermitDate) {
    const lastPermit = new Date(property.lastPermitDate);
    yearsSincePermit = (Date.now() - lastPermit.getTime()) / (1000 * 60 * 60 * 24 * 365);
  }

  // No permits or old permits
  const noRecentPermits =
    !property.lastPermitDate ||
    (yearsSincePermit !== null && yearsSincePermit >= maxYearsSincePermit);

  if (noRecentPermits) {
    let score = 65;
    const reasons: string[] = ['Long-term owner with no recent permits'];

    // Bonus for very long ownership
    if (ownershipYears >= 15) {
      score += 15;
      reasons.push('Ownership 15+ years');
    }

    // Bonus for out-of-state owner
    if (property.ownerState && property.state && property.ownerState !== property.state) {
      score += 10;
      reasons.push('Out-of-state owner');
    }

    return {
      filterId: 'deferred_maintenance',
      matched: true,
      score: Math.min(score, 100),
      reason: reasons.join('; '),
      data: {
        ownershipYears: Math.round(ownershipYears * 10) / 10,
        lastPermitDate: property.lastPermitDate,
        yearsSincePermit: yearsSincePermit ? Math.round(yearsSincePermit * 10) / 10 : null,
        isOwnerOccupied: property.isOwnerOccupied,
      },
    };
  }

  return {
    filterId: 'deferred_maintenance',
    matched: false,
    score: 0,
    reason: 'Recent permit activity found',
  };
}

