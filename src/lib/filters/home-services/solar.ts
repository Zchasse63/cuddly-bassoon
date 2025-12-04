/**
 * Solar Filters
 * Filters for identifying solar installation opportunities
 */

import type { PropertyData, FilterMatch } from '../types';

// ============================================
// Solar Ready Filter
// ============================================

export interface SolarReadyParams {
  minPropertyValue?: number;
  maxRoofAgeYears?: number;
}

export function applySolarReadyFilter(
  property: PropertyData,
  params: SolarReadyParams = {}
): FilterMatch {
  const minValue = params.minPropertyValue ?? 300000;
  const maxRoofAge = params.maxRoofAgeYears ?? 5;
  const currentYear = new Date().getFullYear();

  // Already has solar
  if (property.lastSolarDate) {
    return {
      filterId: 'solar_ready',
      matched: false,
      score: 0,
      reason: 'Property already has solar installation',
    };
  }

  // Check for recent roof (ideal for solar)
  let roofAge: number | null = null;
  if (property.lastRoofingDate) {
    roofAge = currentYear - new Date(property.lastRoofingDate).getFullYear();
  }

  if (roofAge !== null && roofAge <= maxRoofAge) {
    let score = 85;
    const reasons: string[] = ['Recent roof installation - prime solar candidate'];

    if (property.estimatedValue && property.estimatedValue >= minValue) {
      score += 10;
      reasons.push('High-value property');
    }

    return {
      filterId: 'solar_ready',
      matched: true,
      score: Math.min(score, 100),
      reason: reasons.join('; '),
      data: { roofAge, lastRoofingDate: property.lastRoofingDate, estimatedValue: property.estimatedValue },
    };
  }

  // High-value home without solar
  if (property.estimatedValue && property.estimatedValue >= minValue) {
    return {
      filterId: 'solar_ready',
      matched: true,
      score: 70,
      reason: 'High-value property without solar installation',
      data: { estimatedValue: property.estimatedValue },
    };
  }

  return {
    filterId: 'solar_ready',
    matched: false,
    score: 0,
    reason: 'Does not match solar ready criteria',
  };
}

// ============================================
// Battery Upgrade Filter
// ============================================

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface BatteryUpgradeParams {
  // No configurable parameters
}

export function applyBatteryUpgradeFilter(
  property: PropertyData,
  _params: BatteryUpgradeParams = {}
): FilterMatch {
  // Has solar but no battery - upsell opportunity
  if (property.lastSolarDate) {
    // Check if they might already have battery (would need specific permit data)
    // For now, assume solar without recent electrical work = no battery
    const solarYear = new Date(property.lastSolarDate).getFullYear();
    const currentYear = new Date().getFullYear();
    const yearsSinceSolar = currentYear - solarYear;

    if (yearsSinceSolar >= 2) {
      return {
        filterId: 'battery_upgrade',
        matched: true,
        score: 80,
        reason: 'Has solar installation - battery storage upsell opportunity',
        data: { lastSolarDate: property.lastSolarDate, yearsSinceSolar },
      };
    }
  }

  return {
    filterId: 'battery_upgrade',
    matched: false,
    score: 0,
    reason: 'No solar installation found',
  };
}

// ============================================
// High Consumption Area Filter
// ============================================

export interface HighConsumptionAreaParams {
  minSquareFootage?: number;
}

export function applyHighConsumptionAreaFilter(
  property: PropertyData,
  params: HighConsumptionAreaParams = {}
): FilterMatch {
  const minSqFt = params.minSquareFootage ?? 2500;

  // Already has solar
  if (property.lastSolarDate) {
    return {
      filterId: 'high_consumption_area',
      matched: false,
      score: 0,
      reason: 'Property already has solar installation',
    };
  }

  // Large home = high energy consumption
  if (property.squareFootage && property.squareFootage >= minSqFt) {
    let score = 70;
    const reasons: string[] = ['Large home - high energy consumption likely'];

    if (property.squareFootage >= 4000) {
      score += 15;
      reasons.push('Very large home (4000+ sq ft)');
    }

    // Owner-occupied more likely to invest
    if (property.isOwnerOccupied === true) {
      score += 10;
      reasons.push('Owner-occupied');
    }

    return {
      filterId: 'high_consumption_area',
      matched: true,
      score: Math.min(score, 100),
      reason: reasons.join('; '),
      data: { squareFootage: property.squareFootage, isOwnerOccupied: property.isOwnerOccupied },
    };
  }

  return {
    filterId: 'high_consumption_area',
    matched: false,
    score: 0,
    reason: 'Property does not meet size threshold',
  };
}

