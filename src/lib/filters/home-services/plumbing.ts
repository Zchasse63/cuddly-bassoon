/**
 * Plumbing Filters
 * Filters for identifying plumbing service opportunities
 */

import type { PropertyData, FilterMatch } from '../types';

// ============================================
// Repiping Candidate Filter
// ============================================

export interface RepipingCandidateParams {
  minPropertyAgeYears?: number;
}

export function applyRepipingCandidateFilter(
  property: PropertyData,
  params: RepipingCandidateParams = {}
): FilterMatch {
  const minPropertyAge = params.minPropertyAgeYears ?? 40;
  const currentYear = new Date().getFullYear();

  if (!property.yearBuilt) {
    return {
      filterId: 'repiping_candidate',
      matched: false,
      score: 0,
      reason: 'Year built not available',
    };
  }

  const propertyAge = currentYear - property.yearBuilt;

  // Older homes with no plumbing permits likely have original pipes
  if (propertyAge >= minPropertyAge && !property.lastPlumbingDate) {
    let score = 75;
    const reasons: string[] = [`${propertyAge}-year-old property - likely has original plumbing`];

    if (propertyAge >= 50) {
      score += 15;
      reasons.push('Property over 50 years old - high repiping priority');
    }

    return {
      filterId: 'repiping_candidate',
      matched: true,
      score: Math.min(score, 100),
      reason: reasons.join('; '),
      data: { propertyAge, yearBuilt: property.yearBuilt },
    };
  }

  return {
    filterId: 'repiping_candidate',
    matched: false,
    score: 0,
    reason: property.lastPlumbingDate ? 'Has plumbing permit history' : 'Property too new',
  };
}

// ============================================
// Water Heater Due Filter
// ============================================

export interface WaterHeaterDueParams {
  minWaterHeaterAgeYears?: number;
}

export function applyWaterHeaterDueFilter(
  property: PropertyData,
  params: WaterHeaterDueParams = {}
): FilterMatch {
  const minAge = params.minWaterHeaterAgeYears ?? 12;
  const currentYear = new Date().getFullYear();

  let waterHeaterAge: number | null = null;

  if (property.lastWaterHeaterDate) {
    waterHeaterAge = currentYear - new Date(property.lastWaterHeaterDate).getFullYear();
  } else if (property.yearBuilt) {
    // Assume original if no permit history
    waterHeaterAge = currentYear - property.yearBuilt;
  }

  if (waterHeaterAge === null) {
    return {
      filterId: 'water_heater_due',
      matched: false,
      score: 0,
      reason: 'Unable to determine water heater age',
    };
  }

  if (waterHeaterAge >= minAge) {
    let score = 70;
    const reasons: string[] = [`Water heater approximately ${waterHeaterAge} years old`];

    if (waterHeaterAge >= 15) {
      score += 20;
      reasons.push('Water heater past typical lifespan');
    }

    return {
      filterId: 'water_heater_due',
      matched: true,
      score: Math.min(score, 100),
      reason: reasons.join('; '),
      data: { waterHeaterAge, lastWaterHeaterDate: property.lastWaterHeaterDate },
    };
  }

  return {
    filterId: 'water_heater_due',
    matched: false,
    score: 0,
    reason: `Water heater age (${waterHeaterAge} years) below threshold`,
  };
}

// ============================================
// No Plumbing Permits Filter
// ============================================

export interface NoPlumbingPermitsParams {
  minPropertyAgeYears?: number;
}

export function applyNoPlumbingPermitsFilter(
  property: PropertyData,
  params: NoPlumbingPermitsParams = {}
): FilterMatch {
  const minPropertyAge = params.minPropertyAgeYears ?? 25;
  const currentYear = new Date().getFullYear();

  if (!property.yearBuilt) {
    return {
      filterId: 'no_plumbing_permits',
      matched: false,
      score: 0,
      reason: 'Year built not available',
    };
  }

  const propertyAge = currentYear - property.yearBuilt;

  if (propertyAge >= minPropertyAge && !property.lastPlumbingDate) {
    let score = 70;
    const reasons: string[] = [`${propertyAge}-year-old property with no plumbing permit history`];

    if (propertyAge >= 35) {
      score += 15;
      reasons.push('Property over 35 years old');
    }

    return {
      filterId: 'no_plumbing_permits',
      matched: true,
      score: Math.min(score, 100),
      reason: reasons.join('; '),
      data: { propertyAge, yearBuilt: property.yearBuilt },
    };
  }

  return {
    filterId: 'no_plumbing_permits',
    matched: false,
    score: 0,
    reason: property.lastPlumbingDate ? 'Has plumbing permit history' : 'Property too new',
  };
}

