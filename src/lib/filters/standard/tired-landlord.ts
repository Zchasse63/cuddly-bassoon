/**
 * Tired Landlord Filter
 * Identifies long-term rental property owners who may be ready to sell
 * Key criteria: Owned 10+ years and property is a rental
 */

import type { PropertyData, FilterMatch } from '../types';

export interface TiredLandlordParams {
  minOwnershipYears?: number;
}

const DEFAULT_MIN_OWNERSHIP_YEARS = 10;

/**
 * Calculate ownership duration in years
 */
function getOwnershipYears(property: PropertyData): number | null {
  // Use pre-calculated ownership months if available
  if (property.ownershipMonths !== null && property.ownershipMonths !== undefined) {
    return property.ownershipMonths / 12;
  }

  // Calculate from last sale date
  if (property.lastSaleDate) {
    const saleDate = new Date(property.lastSaleDate);
    const now = new Date();
    const diffMs = now.getTime() - saleDate.getTime();
    const diffYears = diffMs / (1000 * 60 * 60 * 24 * 365.25);
    return Math.max(0, diffYears);
  }

  return null;
}

/**
 * Determine if property is likely a rental
 */
function isLikelyRental(property: PropertyData): boolean {
  // Explicit rental flag
  if (property.isRental === true) {
    return true;
  }

  // Not owner-occupied is likely rental
  if (property.isOwnerOccupied === false) {
    return true;
  }

  // Absentee owner indicators suggest rental
  if (property.mailingState && property.state) {
    if (property.mailingState.toLowerCase() !== property.state.toLowerCase()) {
      return true;
    }
  }

  // Multi-family properties are often rentals
  if (property.propertyType) {
    const type = property.propertyType.toLowerCase();
    if (type.includes('multi') || type.includes('duplex') || 
        type.includes('triplex') || type.includes('fourplex') ||
        type.includes('apartment')) {
      return true;
    }
  }

  return false;
}

/**
 * Check if owner is a "tired landlord"
 */
export function applyTiredLandlordFilter(
  property: PropertyData,
  params: TiredLandlordParams = {}
): FilterMatch {
  const minYears = params.minOwnershipYears ?? DEFAULT_MIN_OWNERSHIP_YEARS;
  const ownershipYears = getOwnershipYears(property);

  // Can't determine ownership duration
  if (ownershipYears === null) {
    return {
      filterId: 'tired_landlord',
      matched: false,
      score: 0,
      reason: 'Unable to determine ownership duration',
    };
  }

  // Check ownership duration
  if (ownershipYears < minYears) {
    return {
      filterId: 'tired_landlord',
      matched: false,
      score: 0,
      reason: `Ownership of ${ownershipYears.toFixed(1)} years is below ${minYears} year threshold`,
      data: { ownershipYears },
    };
  }

  // Check if rental
  const isRental = isLikelyRental(property);
  
  if (!isRental) {
    return {
      filterId: 'tired_landlord',
      matched: false,
      score: 0,
      reason: `Property appears to be owner-occupied, not a rental`,
      data: { ownershipYears, isOwnerOccupied: property.isOwnerOccupied },
    };
  }

  // Calculate score based on years above threshold
  const yearsAboveThreshold = ownershipYears - minYears;
  const score = Math.min(100, 60 + yearsAboveThreshold * 4);

  return {
    filterId: 'tired_landlord',
    matched: true,
    score: Math.round(score),
    reason: `Rental property owned for ${ownershipYears.toFixed(1)} years (threshold: ${minYears})`,
    data: {
      ownershipYears,
      ownershipMonths: property.ownershipMonths,
      isRental: true,
      lastSaleDate: property.lastSaleDate,
    },
  };
}

