/**
 * Accidental Landlord Filter
 * Identifies properties that were previously owner-occupied but now rented
 * These owners often didn't plan to be landlords and may be motivated sellers
 */

import type { PropertyData, FilterMatch } from '../types';

export interface AccidentalLandlordParams {
  // No configurable parameters
}

/**
 * Extended property data with historical occupancy info
 */
export interface PropertyWithHistory extends PropertyData {
  previouslyOwnerOccupied?: boolean;
  homesteadExemptionRemoved?: boolean;
  homesteadRemovalDate?: string;
}

/**
 * Check if property shows signs of accidental landlord situation
 */
export function applyAccidentalLandlordFilter(
  property: PropertyWithHistory,
  _params: AccidentalLandlordParams = {}
): FilterMatch {
  // Strong indicator: explicit flag
  if (property.previouslyOwnerOccupied === true) {
    return {
      filterId: 'accidental_landlord',
      matched: true,
      score: 95,
      reason: 'Property was previously owner-occupied, now rental',
      data: {
        ownerName: property.ownerName,
        isOwnerOccupied: property.isOwnerOccupied,
      },
    };
  }

  // Strong indicator: homestead exemption was removed
  if (property.homesteadExemptionRemoved === true) {
    let score = 90;
    let reason = 'Homestead exemption removed (previously primary residence)';

    // Higher score for recent removal
    if (property.homesteadRemovalDate) {
      const removalDate = new Date(property.homesteadRemovalDate);
      const yearsSinceRemoval = (Date.now() - removalDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
      
      if (yearsSinceRemoval <= 2) {
        score = 95;
        reason = `Homestead exemption removed ${yearsSinceRemoval.toFixed(1)} years ago`;
      }
    }

    return {
      filterId: 'accidental_landlord',
      matched: true,
      score,
      reason,
      data: {
        homesteadRemovalDate: property.homesteadRemovalDate,
        ownerName: property.ownerName,
      },
    };
  }

  // Inference: currently not owner-occupied + single family + individual owner
  const isAbsentee = property.isOwnerOccupied === false;
  const isSingleFamily = property.propertyType?.toLowerCase().includes('single') ||
                         property.propertyType?.toLowerCase().includes('sfr');
  const isIndividualOwner = property.ownerType?.toLowerCase() === 'individual' ||
                            !property.ownerType?.toLowerCase().includes('llc');

  if (isAbsentee && isSingleFamily && isIndividualOwner) {
    // Check for short ownership suggesting unplanned rental
    const ownershipYears = property.ownershipMonths 
      ? property.ownershipMonths / 12 
      : null;

    if (ownershipYears !== null && ownershipYears >= 3 && ownershipYears <= 10) {
      return {
        filterId: 'accidental_landlord',
        matched: true,
        score: 70,
        reason: 'Single-family, individual owner, not owner-occupied (possible accidental landlord)',
        data: {
          propertyType: property.propertyType,
          ownerType: property.ownerType,
          ownershipYears,
          note: 'Inferred - historical occupancy data not available',
        },
      };
    }
  }

  // Check for specific property types that are typically primary residences
  if (isSingleFamily && isAbsentee) {
    // Without historical data, we can only make weak inference
    return {
      filterId: 'accidental_landlord',
      matched: false,
      score: 0,
      reason: 'Property is absentee-owned but cannot confirm previous owner-occupancy',
      data: {
        propertyType: property.propertyType,
        isOwnerOccupied: property.isOwnerOccupied,
        note: 'Historical occupancy data not available',
      },
    };
  }

  return {
    filterId: 'accidental_landlord',
    matched: false,
    score: 0,
    reason: 'No indicators of accidental landlord situation',
  };
}

