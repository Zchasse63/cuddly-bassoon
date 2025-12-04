/**
 * HVAC Filters
 * Filters for identifying HVAC service opportunities
 */

import type { PropertyData, FilterMatch } from '../types';

// ============================================
// HVAC Replacement Due Filter
// ============================================

export interface HvacReplacementDueParams {
  minHvacAgeYears?: number;
}

export function applyHvacReplacementDueFilter(
  property: PropertyData,
  params: HvacReplacementDueParams = {}
): FilterMatch {
  const minHvacAge = params.minHvacAgeYears ?? 15;
  const currentYear = new Date().getFullYear();

  let hvacAge: number | null = null;

  if (property.lastHvacDate) {
    hvacAge = currentYear - new Date(property.lastHvacDate).getFullYear();
  } else if (property.yearBuilt) {
    hvacAge = currentYear - property.yearBuilt;
  }

  if (hvacAge === null) {
    return {
      filterId: 'hvac_replacement_due',
      matched: false,
      score: 0,
      reason: 'Unable to determine HVAC age',
    };
  }

  if (hvacAge >= minHvacAge) {
    let score = 70;
    const reasons: string[] = [`HVAC approximately ${hvacAge} years old`];

    if (hvacAge >= 20) {
      score += 20;
      reasons.push('HVAC past typical lifespan');
    }

    return {
      filterId: 'hvac_replacement_due',
      matched: true,
      score: Math.min(score, 100),
      reason: reasons.join('; '),
      data: { hvacAge, lastHvacDate: property.lastHvacDate, yearBuilt: property.yearBuilt },
    };
  }

  return {
    filterId: 'hvac_replacement_due',
    matched: false,
    score: 0,
    reason: `HVAC age (${hvacAge} years) below threshold`,
  };
}

// ============================================
// Heat Pump Candidate Filter
// ============================================

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface HeatPumpCandidateParams {
  // No configurable parameters
}

export function applyHeatPumpCandidateFilter(
  property: PropertyData,
  _params: HeatPumpCandidateParams = {}
): FilterMatch {
  if (!property.shovelsAddressId) {
    return {
      filterId: 'heat_pump_candidate',
      matched: false,
      score: 0,
      reason: 'No Shovels data available',
    };
  }

  // Has solar but no heat pump - environmentally conscious with capital
  if (property.lastSolarDate && !property.lastHvacDate) {
    return {
      filterId: 'heat_pump_candidate',
      matched: true,
      score: 80,
      reason: 'Has solar installation, no heat pump - likely eco-conscious homeowner',
      data: { lastSolarDate: property.lastSolarDate },
    };
  }

  return {
    filterId: 'heat_pump_candidate',
    matched: false,
    score: 0,
    reason: 'Does not match heat pump candidate criteria',
  };
}

// ============================================
// No HVAC History Filter
// ============================================

export interface NoHvacHistoryParams {
  minPropertyAgeYears?: number;
}

export function applyNoHvacHistoryFilter(
  property: PropertyData,
  params: NoHvacHistoryParams = {}
): FilterMatch {
  const minPropertyAge = params.minPropertyAgeYears ?? 20;
  const currentYear = new Date().getFullYear();

  if (!property.yearBuilt) {
    return {
      filterId: 'no_hvac_history',
      matched: false,
      score: 0,
      reason: 'Year built not available',
    };
  }

  const propertyAge = currentYear - property.yearBuilt;

  if (propertyAge >= minPropertyAge && !property.lastHvacDate) {
    let score = 75;
    const reasons: string[] = [`${propertyAge}-year-old property with no HVAC permit history`];

    if (propertyAge >= 25) {
      score += 15;
      reasons.push('Property over 25 years old');
    }

    return {
      filterId: 'no_hvac_history',
      matched: true,
      score: Math.min(score, 100),
      reason: reasons.join('; '),
      data: { propertyAge, yearBuilt: property.yearBuilt },
    };
  }

  return {
    filterId: 'no_hvac_history',
    matched: false,
    score: 0,
    reason: property.lastHvacDate ? 'Has HVAC permit history' : 'Property too new',
  };
}

