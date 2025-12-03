/**
 * FSBO Fatigue Filter
 * Identifies For Sale By Owner listings that have been active for 90+ days
 * These sellers often become motivated after failing to sell on their own
 */

import type { PropertyData, FilterMatch } from '../types';

export interface FSBOFatigueParams {
  minDaysOnMarket?: number;
}

const DEFAULT_MIN_DAYS = 90;

/**
 * Extended property data with FSBO information
 */
export interface PropertyWithFSBOData extends PropertyData {
  isFSBO?: boolean;
  fsboListingDate?: string;
  fsboListingSource?: string;
}

/**
 * Check if listing is FSBO
 */
function isFSBOListing(property: PropertyWithFSBOData): boolean {
  // Explicit FSBO flag
  if (property.isFSBO === true) {
    return true;
  }

  // Check listing status
  if (property.listingStatus) {
    const status = property.listingStatus.toLowerCase();
    if (status.includes('fsbo') || 
        status.includes('for sale by owner') ||
        status.includes('owner sale')) {
      return true;
    }
  }

  // Check listing source
  if (property.fsboListingSource) {
    const source = property.fsboListingSource.toLowerCase();
    if (source.includes('fsbo') || 
        source.includes('craigslist') ||
        source.includes('facebook marketplace')) {
      return true;
    }
  }

  return false;
}

/**
 * Calculate days on market
 */
function getDaysOnMarket(property: PropertyWithFSBOData): number | null {
  // Use provided days on market
  if (property.daysOnMarket !== null && property.daysOnMarket !== undefined) {
    return property.daysOnMarket;
  }

  // Calculate from listing date
  const listingDate = property.fsboListingDate || property.listingDate;
  if (listingDate) {
    const date = new Date(listingDate);
    if (!isNaN(date.getTime())) {
      const diffMs = Date.now() - date.getTime();
      return Math.floor(diffMs / (1000 * 60 * 60 * 24));
    }
  }

  return null;
}

/**
 * Check if property shows FSBO fatigue
 */
export function applyFSBOFatigueFilter(
  property: PropertyWithFSBOData,
  params: FSBOFatigueParams = {}
): FilterMatch {
  const minDays = params.minDaysOnMarket ?? DEFAULT_MIN_DAYS;

  // First check if it's a FSBO listing
  if (!isFSBOListing(property)) {
    return {
      filterId: 'fsbo_fatigue',
      matched: false,
      score: 0,
      reason: 'Property is not a For Sale By Owner listing',
    };
  }

  // Get days on market
  const daysOnMarket = getDaysOnMarket(property);

  if (daysOnMarket === null) {
    return {
      filterId: 'fsbo_fatigue',
      matched: false,
      score: 0,
      reason: 'FSBO listing date not available',
    };
  }

  // Check if exceeds threshold
  if (daysOnMarket >= minDays) {
    // Higher score for longer listings
    const additionalDays = daysOnMarket - minDays;
    const score = Math.min(100, 75 + Math.floor(additionalDays / 10) * 2);

    return {
      filterId: 'fsbo_fatigue',
      matched: true,
      score,
      reason: `FSBO listing active for ${daysOnMarket} days (threshold: ${minDays})`,
      data: {
        daysOnMarket,
        listingDate: property.fsboListingDate || property.listingDate,
        fsboSource: property.fsboListingSource,
      },
    };
  }

  return {
    filterId: 'fsbo_fatigue',
    matched: false,
    score: 0,
    reason: `FSBO listing only ${daysOnMarket} days old (threshold: ${minDays})`,
    data: { daysOnMarket },
  };
}

