/**
 * Major System Due Filter
 * Identifies properties where major systems are past expected lifespan
 * Roof, HVAC, or water heater replacement likely needed
 */

import type { PropertyData, FilterMatch } from '../types';

export interface MajorSystemDueParams {
  roofLifespanYears?: number;
  hvacLifespanYears?: number;
  waterHeaterLifespanYears?: number;
}

/**
 * Check if property has major systems due for replacement
 * Returns match if systems are past expected lifespan with no permit history
 */
export function applyMajorSystemDueFilter(
  property: PropertyData,
  params: MajorSystemDueParams = {}
): FilterMatch {
  const roofLifespan = params.roofLifespanYears ?? 20;
  const hvacLifespan = params.hvacLifespanYears ?? 25;
  const waterHeaterLifespan = params.waterHeaterLifespanYears ?? 15;

  // Need year built to estimate system age
  if (!property.yearBuilt) {
    return {
      filterId: 'major_system_due',
      matched: false,
      score: 0,
      reason: 'Year built not available',
    };
  }

  const currentYear = new Date().getFullYear();
  const propertyAge = currentYear - property.yearBuilt;
  const systemsDue: string[] = [];

  // Check roof
  const roofAge = property.lastRoofingDate
    ? currentYear - new Date(property.lastRoofingDate).getFullYear()
    : propertyAge;
  if (roofAge >= roofLifespan) {
    systemsDue.push('Roof');
  }

  // Check HVAC
  const hvacAge = property.lastHvacDate
    ? currentYear - new Date(property.lastHvacDate).getFullYear()
    : propertyAge;
  if (hvacAge >= hvacLifespan) {
    systemsDue.push('HVAC');
  }

  // Check water heater
  const waterHeaterAge = property.lastWaterHeaterDate
    ? currentYear - new Date(property.lastWaterHeaterDate).getFullYear()
    : propertyAge;
  if (waterHeaterAge >= waterHeaterLifespan) {
    systemsDue.push('Water Heater');
  }

  if (systemsDue.length > 0) {
    let score = 60;
    const reasons: string[] = [`${systemsDue.join(', ')} replacement due`];

    // Bonus for multiple systems due
    if (systemsDue.length >= 2) {
      score += 15;
      reasons.push('Multiple systems due');
    }

    // Bonus for absentee owner
    if (property.isOwnerOccupied === false) {
      score += 15;
      reasons.push('Absentee owner');
    }

    return {
      filterId: 'major_system_due',
      matched: true,
      score: Math.min(score, 100),
      reason: reasons.join('; '),
      data: {
        systemsDue,
        yearBuilt: property.yearBuilt,
        propertyAge,
        lastRoofingDate: property.lastRoofingDate,
        lastHvacDate: property.lastHvacDate,
        lastWaterHeaterDate: property.lastWaterHeaterDate,
      },
    };
  }

  return {
    filterId: 'major_system_due',
    matched: false,
    score: 0,
    reason: 'No major systems due for replacement',
  };
}

