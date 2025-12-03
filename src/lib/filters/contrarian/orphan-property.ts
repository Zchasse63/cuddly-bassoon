/**
 * Orphan Property Filter
 * Identifies properties with no active management (vacant, code violations)
 * These properties often have motivated or absent owners
 */

import type { PropertyData, FilterMatch } from '../types';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface OrphanPropertyParams {
  // No configurable parameters
}

/**
 * Extended property data with vacancy and violation info
 */
export interface PropertyWithVacancyData extends PropertyData {
  isVacant?: boolean;
  vacancyDuration?: number; // months
  hasCodeViolations?: boolean;
  codeViolationCount?: number;
  codeViolations?: Array<{
    type: string;
    date: string;
    status: string;
  }>;
  hasUtilityDisconnect?: boolean;
  utilityDisconnectDate?: string;
  mailReturnedUndeliverable?: boolean;
  lastKnownOccupancy?: string;
}

/**
 * Orphan indicators with weights
 */
type OrphanIndicator = {
  type: string;
  detected: boolean;
  weight: number;
  reason: string;
  data?: Record<string, unknown>;
};

/**
 * Detect orphan property indicators
 */
function detectOrphanIndicators(property: PropertyWithVacancyData): OrphanIndicator[] {
  const indicators: OrphanIndicator[] = [];

  // Vacancy
  if (property.isVacant) {
    let weight = 30;
    let reason = 'Property is vacant';

    if (property.vacancyDuration) {
      weight = Math.min(50, 30 + property.vacancyDuration * 2);
      reason = `Property vacant for ${property.vacancyDuration} months`;
    }

    indicators.push({
      type: 'vacant',
      detected: true,
      weight,
      reason,
      data: { vacancyDuration: property.vacancyDuration },
    });
  }

  // Code violations
  if (
    property.hasCodeViolations ||
    (property.codeViolationCount && property.codeViolationCount > 0)
  ) {
    const count = property.codeViolationCount || 1;
    const weight = Math.min(40, 20 + count * 5);

    indicators.push({
      type: 'code_violations',
      detected: true,
      weight,
      reason: `Property has ${count} code violation(s)`,
      data: {
        violationCount: count,
        violations: property.codeViolations,
      },
    });
  }

  // Utility disconnect
  if (property.hasUtilityDisconnect) {
    indicators.push({
      type: 'utility_disconnect',
      detected: true,
      weight: 25,
      reason: 'Utilities disconnected',
      data: { disconnectDate: property.utilityDisconnectDate },
    });
  }

  // Mail returned
  if (property.mailReturnedUndeliverable) {
    indicators.push({
      type: 'mail_returned',
      detected: true,
      weight: 20,
      reason: 'Mail returned as undeliverable',
    });
  }

  // Absentee + no recent activity
  if (property.isOwnerOccupied === false) {
    // Check for signs of neglect
    if (property.lastKnownOccupancy) {
      const lastOccupancy = new Date(property.lastKnownOccupancy);
      const monthsSinceOccupancy =
        (Date.now() - lastOccupancy.getTime()) / (1000 * 60 * 60 * 24 * 30);

      if (monthsSinceOccupancy > 12) {
        indicators.push({
          type: 'long_term_absentee',
          detected: true,
          weight: 15,
          reason: `No occupancy for ${Math.round(monthsSinceOccupancy)} months`,
          data: { monthsSinceOccupancy },
        });
      }
    }
  }

  return indicators;
}

/**
 * Check if property shows orphan characteristics
 */
export function applyOrphanPropertyFilter(
  property: PropertyWithVacancyData,
  _params: OrphanPropertyParams = {}
): FilterMatch {
  const indicators = detectOrphanIndicators(property);

  if (indicators.length === 0) {
    return {
      filterId: 'orphan_property',
      matched: false,
      score: 0,
      reason: 'No orphan property indicators detected',
    };
  }

  // Calculate combined score from weights
  const totalWeight = indicators.reduce((sum, ind) => sum + ind.weight, 0);
  const score = Math.min(100, 50 + totalWeight);

  // Build reason from top indicators
  const sortedIndicators = [...indicators].sort((a, b) => b.weight - a.weight);
  const primaryReason = sortedIndicators[0]!.reason;

  return {
    filterId: 'orphan_property',
    matched: true,
    score,
    reason:
      primaryReason +
      (indicators.length > 1 ? ` (+${indicators.length - 1} other indicators)` : ''),
    data: {
      indicatorCount: indicators.length,
      indicators: indicators.map((i) => i.type),
      indicatorDetails: indicators,
    },
  };
}
