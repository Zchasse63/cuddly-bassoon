/**
 * Out-of-State Owner Filter
 * Identifies properties where the owner lives in a different state
 */

import type { PropertyData, FilterMatch } from '../types';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface OutOfStateParams {
  // No configurable parameters
}

/**
 * Normalize state to 2-letter code
 */
function normalizeState(state: string | null | undefined): string | null {
  if (!state) return null;

  const stateMap: Record<string, string> = {
    alabama: 'AL',
    alaska: 'AK',
    arizona: 'AZ',
    arkansas: 'AR',
    california: 'CA',
    colorado: 'CO',
    connecticut: 'CT',
    delaware: 'DE',
    florida: 'FL',
    georgia: 'GA',
    hawaii: 'HI',
    idaho: 'ID',
    illinois: 'IL',
    indiana: 'IN',
    iowa: 'IA',
    kansas: 'KS',
    kentucky: 'KY',
    louisiana: 'LA',
    maine: 'ME',
    maryland: 'MD',
    massachusetts: 'MA',
    michigan: 'MI',
    minnesota: 'MN',
    mississippi: 'MS',
    missouri: 'MO',
    montana: 'MT',
    nebraska: 'NE',
    nevada: 'NV',
    'new hampshire': 'NH',
    'new jersey': 'NJ',
    'new mexico': 'NM',
    'new york': 'NY',
    'north carolina': 'NC',
    'north dakota': 'ND',
    ohio: 'OH',
    oklahoma: 'OK',
    oregon: 'OR',
    pennsylvania: 'PA',
    'rhode island': 'RI',
    'south carolina': 'SC',
    'south dakota': 'SD',
    tennessee: 'TN',
    texas: 'TX',
    utah: 'UT',
    vermont: 'VT',
    virginia: 'VA',
    washington: 'WA',
    'west virginia': 'WV',
    wisconsin: 'WI',
    wyoming: 'WY',
    'district of columbia': 'DC',
  };

  const trimmed = state.trim();

  // Already a 2-letter code
  if (trimmed.length === 2) {
    return trimmed.toUpperCase();
  }

  // Convert full name to code
  const normalized = stateMap[trimmed.toLowerCase()];
  return normalized || null;
}

/**
 * Check if owner is from a different state
 */
export function applyOutOfStateFilter(
  property: PropertyData,
  _params: OutOfStateParams = {}
): FilterMatch {
  // Get property state
  const propertyState = normalizeState(property.state);

  if (!propertyState) {
    return {
      filterId: 'out_of_state',
      matched: false,
      score: 0,
      reason: 'Property state not available',
    };
  }

  // Try owner state from different sources
  const ownerState = normalizeState(property.ownerState) || normalizeState(property.mailingState);

  if (!ownerState) {
    return {
      filterId: 'out_of_state',
      matched: false,
      score: 0,
      reason: 'Owner state not available',
    };
  }

  // Compare states
  if (propertyState !== ownerState) {
    return {
      filterId: 'out_of_state',
      matched: true,
      score: 90,
      reason: `Owner is in ${ownerState}, property is in ${propertyState}`,
      data: {
        propertyState,
        ownerState,
        ownerName: property.ownerName,
      },
    };
  }

  return {
    filterId: 'out_of_state',
    matched: false,
    score: 0,
    reason: `Owner is in the same state as property (${propertyState})`,
    data: {
      propertyState,
      ownerState,
    },
  };
}
