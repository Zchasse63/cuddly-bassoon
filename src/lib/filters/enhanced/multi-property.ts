/**
 * Multi-Property Owner Filter
 * Identifies owners who have multiple properties (2+)
 * These owners may be portfolio landlords looking to consolidate
 */

import type { PropertyData, FilterMatch } from '../types';

export interface MultiPropertyParams {
  minPropertyCount?: number;
}

const DEFAULT_MIN_PROPERTY_COUNT = 2;

/**
 * Extended property data with portfolio information
 * This would typically come from a portfolio analysis step
 */
export interface PropertyWithPortfolio extends PropertyData {
  ownerPropertyCount?: number;
  ownerProperties?: Array<{
    id: string;
    address: string;
    state?: string;
  }>;
}

/**
 * Check if owner has multiple properties
 * 
 * Note: This filter requires portfolio data from a separate lookup.
 * The property data should be enriched with owner portfolio info
 * before this filter is applied.
 */
export function applyMultiPropertyFilter(
  property: PropertyWithPortfolio,
  params: MultiPropertyParams = {}
): FilterMatch {
  const minCount = params.minPropertyCount ?? DEFAULT_MIN_PROPERTY_COUNT;

  // Check for pre-calculated property count
  if (property.ownerPropertyCount !== undefined && property.ownerPropertyCount !== null) {
    if (property.ownerPropertyCount >= minCount) {
      const score = Math.min(100, 60 + (property.ownerPropertyCount - minCount) * 10);

      return {
        filterId: 'multi_property',
        matched: true,
        score,
        reason: `Owner has ${property.ownerPropertyCount} properties (threshold: ${minCount})`,
        data: {
          propertyCount: property.ownerPropertyCount,
          ownerName: property.ownerName,
          ownerProperties: property.ownerProperties,
        },
      };
    }

    return {
      filterId: 'multi_property',
      matched: false,
      score: 0,
      reason: `Owner has ${property.ownerPropertyCount} properties (below ${minCount} threshold)`,
      data: { propertyCount: property.ownerPropertyCount },
    };
  }

  // Check if owner type suggests institutional ownership
  if (property.ownerType) {
    const type = property.ownerType.toLowerCase();
    
    // Companies and trusts often own multiple properties
    if (type.includes('company') || type.includes('corp') || 
        type.includes('llc') || type.includes('trust') ||
        type.includes('inc') || type.includes('lp')) {
      return {
        filterId: 'multi_property',
        matched: true,
        score: 70, // Lower confidence without actual count
        reason: `Owner type "${property.ownerType}" suggests entity ownership (likely multiple properties)`,
        data: {
          ownerType: property.ownerType,
          ownerName: property.ownerName,
          note: 'Inferred from owner type - actual count not available',
        },
      };
    }
  }

  // Check owner name for entity patterns
  if (property.ownerName) {
    const name = property.ownerName.toLowerCase();
    
    if (name.includes('llc') || name.includes('inc') || 
        name.includes('corp') || name.includes('trust') ||
        name.includes('properties') || name.includes('investments') ||
        name.includes('holdings') || name.includes('real estate')) {
      return {
        filterId: 'multi_property',
        matched: true,
        score: 65,
        reason: `Owner name "${property.ownerName}" suggests investment entity`,
        data: {
          ownerName: property.ownerName,
          note: 'Inferred from owner name pattern - actual count not available',
        },
      };
    }
  }

  // Cannot determine without portfolio data
  return {
    filterId: 'multi_property',
    matched: false,
    score: 0,
    reason: 'Unable to determine owner property count (portfolio data not available)',
    data: {
      ownerName: property.ownerName,
      ownerType: property.ownerType,
    },
  };
}

