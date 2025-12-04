/**
 * Electrical Filters
 * Filters for identifying electrical service opportunities
 */

import type { PropertyData, FilterMatch } from '../types';

// ============================================
// Panel Upgrade Candidate Filter
// ============================================

export interface PanelUpgradeCandidateParams {
  maxYearBuilt?: number;
}

export function applyPanelUpgradeCandidateFilter(
  property: PropertyData,
  params: PanelUpgradeCandidateParams = {}
): FilterMatch {
  const maxYearBuilt = params.maxYearBuilt ?? 1990;

  if (!property.yearBuilt) {
    return {
      filterId: 'panel_upgrade_candidate',
      matched: false,
      score: 0,
      reason: 'Year built not available',
    };
  }

  // Older home with high-draw additions
  if (property.yearBuilt < maxYearBuilt) {
    const hasHighDrawAddition =
      property.lastSolarDate || property.lastHvacDate || property.lastElectricalDate;

    if (hasHighDrawAddition) {
      return {
        filterId: 'panel_upgrade_candidate',
        matched: true,
        score: 80,
        reason: 'Older home with high-draw additions - likely needs panel upgrade',
        data: {
          yearBuilt: property.yearBuilt,
          lastSolarDate: property.lastSolarDate,
          lastHvacDate: property.lastHvacDate,
        },
      };
    }
  }

  return {
    filterId: 'panel_upgrade_candidate',
    matched: false,
    score: 0,
    reason: 'Does not match panel upgrade criteria',
  };
}

// ============================================
// EV Charger Ready Filter
// ============================================

export interface EvChargerReadyParams {
  minPropertyValue?: number;
}

export function applyEvChargerReadyFilter(
  property: PropertyData,
  params: EvChargerReadyParams = {}
): FilterMatch {
  const minValue = params.minPropertyValue ?? 400000;

  // Higher value homes without EV charger
  if (property.estimatedValue && property.estimatedValue >= minValue) {
    // Check if they already have EV charger permit
    if (property.lastElectricalDate) {
      // Has electrical work but we'd need to check specifically for EV
      // For now, assume no EV if no solar (eco-conscious indicator)
      if (!property.lastSolarDate) {
        return {
          filterId: 'ev_charger_ready',
          matched: true,
          score: 70,
          reason: 'High-value home without solar - potential EV charger candidate',
          data: { estimatedValue: property.estimatedValue },
        };
      }
    } else {
      return {
        filterId: 'ev_charger_ready',
        matched: true,
        score: 75,
        reason: 'High-value home with no electrical upgrades - EV charger opportunity',
        data: { estimatedValue: property.estimatedValue },
      };
    }
  }

  return {
    filterId: 'ev_charger_ready',
    matched: false,
    score: 0,
    reason: 'Does not match EV charger criteria',
  };
}

// ============================================
// No Electrical Upgrades Filter
// ============================================

export interface NoElectricalUpgradesParams {
  minPropertyAgeYears?: number;
}

export function applyNoElectricalUpgradesFilter(
  property: PropertyData,
  params: NoElectricalUpgradesParams = {}
): FilterMatch {
  const minPropertyAge = params.minPropertyAgeYears ?? 30;
  const currentYear = new Date().getFullYear();

  if (!property.yearBuilt) {
    return {
      filterId: 'no_electrical_upgrades',
      matched: false,
      score: 0,
      reason: 'Year built not available',
    };
  }

  const propertyAge = currentYear - property.yearBuilt;

  if (propertyAge >= minPropertyAge && !property.lastElectricalDate) {
    let score = 70;
    const reasons: string[] = [`${propertyAge}-year-old property with no electrical permit history`];

    if (propertyAge >= 40) {
      score += 20;
      reasons.push('Property over 40 years old - likely needs electrical updates');
    }

    return {
      filterId: 'no_electrical_upgrades',
      matched: true,
      score: Math.min(score, 100),
      reason: reasons.join('; '),
      data: { propertyAge, yearBuilt: property.yearBuilt },
    };
  }

  return {
    filterId: 'no_electrical_upgrades',
    matched: false,
    score: 0,
    reason: property.lastElectricalDate ? 'Has electrical permit history' : 'Property too new',
  };
}

