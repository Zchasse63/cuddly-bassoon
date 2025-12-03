/**
 * Life Stage Transition Filter
 * Identifies properties with life event indicators (probate, divorce, senior)
 * These situations often create urgency to sell
 */

import type { PropertyData, FilterMatch } from '../types';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface LifeStageParams {
  // No configurable parameters
}

/**
 * Extended property data with life stage indicators
 */
export interface PropertyWithLifeStageData extends PropertyData {
  isProbate?: boolean;
  probateFilingDate?: string;
  isDivorce?: boolean;
  divorceFilingDate?: string;
  isSeniorOwner?: boolean;
  ownerAge?: number;
  isEstate?: boolean;
  isPreForeclosure?: boolean;
  isTaxLien?: boolean;
  lifeEventIndicators?: string[];
}

/**
 * Life stage event types with motivation levels
 */
type LifeEvent = {
  type: string;
  detected: boolean;
  score: number;
  reason: string;
  data?: Record<string, unknown>;
};

/**
 * Detect life stage events from property data
 */
function detectLifeEvents(property: PropertyWithLifeStageData): LifeEvent[] {
  const events: LifeEvent[] = [];

  // Probate
  if (property.isProbate || property.isEstate) {
    events.push({
      type: 'probate',
      detected: true,
      score: 95,
      reason: 'Property is in probate/estate',
      data: {
        probateFilingDate: property.probateFilingDate,
      },
    });
  }

  // Divorce
  if (property.isDivorce) {
    events.push({
      type: 'divorce',
      detected: true,
      score: 90,
      reason: 'Property associated with divorce proceedings',
      data: {
        divorceFilingDate: property.divorceFilingDate,
      },
    });
  }

  // Senior owner
  if (property.isSeniorOwner || (property.ownerAge && property.ownerAge >= 70)) {
    events.push({
      type: 'senior',
      detected: true,
      score: 70,
      reason: property.ownerAge
        ? `Owner is ${property.ownerAge} years old`
        : 'Owner identified as senior',
      data: {
        ownerAge: property.ownerAge,
      },
    });
  }

  // Pre-foreclosure (financial distress)
  if (property.isPreForeclosure) {
    events.push({
      type: 'pre_foreclosure',
      detected: true,
      score: 95,
      reason: 'Property is in pre-foreclosure',
    });
  }

  // Tax lien (financial distress)
  if (property.isTaxLien) {
    events.push({
      type: 'tax_lien',
      detected: true,
      score: 90,
      reason: 'Property has tax lien',
    });
  }

  // Check owner name for estate/trust indicators
  if (property.ownerName) {
    const name = property.ownerName.toLowerCase();

    if (name.includes('estate of') || name.includes('deceased')) {
      events.push({
        type: 'estate_name',
        detected: true,
        score: 85,
        reason: 'Owner name indicates estate/deceased',
        data: { ownerName: property.ownerName },
      });
    }
  }

  // Check explicit life event indicators
  if (property.lifeEventIndicators && property.lifeEventIndicators.length > 0) {
    for (const indicator of property.lifeEventIndicators) {
      events.push({
        type: 'indicator',
        detected: true,
        score: 75,
        reason: `Life event indicator: ${indicator}`,
      });
    }
  }

  return events;
}

/**
 * Check for life stage transition indicators
 */
export function applyLifeStageFilter(
  property: PropertyWithLifeStageData,
  _params: LifeStageParams = {}
): FilterMatch {
  const events = detectLifeEvents(property);

  if (events.length === 0) {
    return {
      filterId: 'life_stage',
      matched: false,
      score: 0,
      reason: 'No life stage transition indicators detected',
    };
  }

  // Use highest scoring event
  const sortedEvents = [...events].sort((a, b) => b.score - a.score);
  const primaryEvent = sortedEvents[0]!;

  // Combine scores for multiple events
  let combinedScore = primaryEvent.score;
  if (events.length > 1) {
    combinedScore = Math.min(100, combinedScore + (events.length - 1) * 5);
  }

  return {
    filterId: 'life_stage',
    matched: true,
    score: combinedScore,
    reason:
      primaryEvent.reason + (events.length > 1 ? ` (+${events.length - 1} other indicators)` : ''),
    data: {
      primaryEvent: primaryEvent.type,
      allEvents: events.map((e) => e.type),
      eventDetails: events,
    },
  };
}
