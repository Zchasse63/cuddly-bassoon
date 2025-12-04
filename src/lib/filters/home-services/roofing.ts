/**
 * Roofing Filters
 * Filters for identifying roofing service opportunities
 */

import type { PropertyData, FilterMatch } from '../types';

// ============================================
// Aging Roof Filter
// ============================================

export interface AgingRoofParams {
  minRoofAgeYears?: number;
}

export function applyAgingRoofFilter(
  property: PropertyData,
  params: AgingRoofParams = {}
): FilterMatch {
  const minRoofAge = params.minRoofAgeYears ?? 15;
  const currentYear = new Date().getFullYear();

  // Calculate roof age
  let roofAge: number | null = null;

  if (property.lastRoofingDate) {
    roofAge = currentYear - new Date(property.lastRoofingDate).getFullYear();
  } else if (property.yearBuilt) {
    roofAge = currentYear - property.yearBuilt;
  }

  if (roofAge === null) {
    return {
      filterId: 'aging_roof',
      matched: false,
      score: 0,
      reason: 'Unable to determine roof age',
    };
  }

  if (roofAge >= minRoofAge) {
    let score = 70;
    const reasons: string[] = [`Roof approximately ${roofAge} years old`];

    if (roofAge >= 25) {
      score += 20;
      reasons.push('Roof past typical lifespan');
    }

    return {
      filterId: 'aging_roof',
      matched: true,
      score: Math.min(score, 100),
      reason: reasons.join('; '),
      data: { roofAge, lastRoofingDate: property.lastRoofingDate, yearBuilt: property.yearBuilt },
    };
  }

  return {
    filterId: 'aging_roof',
    matched: false,
    score: 0,
    reason: `Roof age (${roofAge} years) below threshold`,
  };
}

// ============================================
// Storm Damage Filter (Neighbor Just Roofed)
// ============================================

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface StormDamageParams {
  // No configurable parameters
}

export function applyStormDamageFilter(
  property: PropertyData,
  _params: StormDamageParams = {}
): FilterMatch {
  // This filter would ideally check for recent roofing activity in the neighborhood
  // For now, we check if the property has an old roof and is in an area with permit activity

  if (!property.shovelsAddressId) {
    return {
      filterId: 'storm_damage',
      matched: false,
      score: 0,
      reason: 'No Shovels data available',
    };
  }

  const currentYear = new Date().getFullYear();
  let roofAge: number | null = null;

  if (property.lastRoofingDate) {
    roofAge = currentYear - new Date(property.lastRoofingDate).getFullYear();
  } else if (property.yearBuilt) {
    roofAge = currentYear - property.yearBuilt;
  }

  // If roof is old and area has permit activity, potential storm damage opportunity
  if (roofAge && roofAge >= 15 && property.yoyPermitGrowth && property.yoyPermitGrowth > 0) {
    return {
      filterId: 'storm_damage',
      matched: true,
      score: 65,
      reason: 'Old roof in active permit area - potential storm damage opportunity',
      data: { roofAge, yoyPermitGrowth: property.yoyPermitGrowth },
    };
  }

  return {
    filterId: 'storm_damage',
    matched: false,
    score: 0,
    reason: 'No storm damage indicators',
  };
}

// ============================================
// No Reroof History Filter
// ============================================

export interface NoReroofHistoryParams {
  minPropertyAgeYears?: number;
}

export function applyNoReroofHistoryFilter(
  property: PropertyData,
  params: NoReroofHistoryParams = {}
): FilterMatch {
  const minPropertyAge = params.minPropertyAgeYears ?? 20;
  const currentYear = new Date().getFullYear();

  if (!property.yearBuilt) {
    return {
      filterId: 'no_reroof_history',
      matched: false,
      score: 0,
      reason: 'Year built not available',
    };
  }

  const propertyAge = currentYear - property.yearBuilt;

  if (propertyAge >= minPropertyAge && !property.lastRoofingDate) {
    let score = 75;
    const reasons: string[] = [`${propertyAge}-year-old property with no roofing permit history`];

    if (propertyAge >= 30) {
      score += 15;
      reasons.push('Property over 30 years old');
    }

    return {
      filterId: 'no_reroof_history',
      matched: true,
      score: Math.min(score, 100),
      reason: reasons.join('; '),
      data: { propertyAge, yearBuilt: property.yearBuilt },
    };
  }

  return {
    filterId: 'no_reroof_history',
    matched: false,
    score: 0,
    reason: property.lastRoofingDate ? 'Has roofing permit history' : 'Property too new',
  };
}

