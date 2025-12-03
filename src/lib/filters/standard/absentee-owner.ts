/**
 * Absentee Owner Filter
 * Identifies properties where the owner doesn't live at the property
 * Key indicator: Mailing address differs from property address
 */

import type { PropertyData, FilterMatch } from '../types';

/**
 * Normalize address string for comparison
 * Removes common variations to enable matching
 */
function normalizeAddress(address: string | null | undefined): string {
  if (!address) return '';
  return address
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[.,#]/g, '')
    .replace(/\b(street|st)\b/g, 'st')
    .replace(/\b(avenue|ave)\b/g, 'ave')
    .replace(/\b(boulevard|blvd)\b/g, 'blvd')
    .replace(/\b(drive|dr)\b/g, 'dr')
    .replace(/\b(road|rd)\b/g, 'rd')
    .replace(/\b(lane|ln)\b/g, 'ln')
    .replace(/\b(court|ct)\b/g, 'ct')
    .replace(/\b(circle|cir)\b/g, 'cir')
    .replace(/\b(apartment|apt)\b/g, 'apt')
    .replace(/\b(suite|ste)\b/g, 'ste')
    .replace(/\b(unit|un)\b/g, 'unit')
    .trim();
}

/**
 * Check if address appears to be a PO Box
 */
function isPOBox(address: string | null | undefined): boolean {
  if (!address) return false;
  const normalized = address.toLowerCase();
  return /\b(p\.?o\.?\s*box|post\s*office\s*box)\b/.test(normalized);
}

/**
 * Build full mailing address from components
 */
function buildMailingAddress(property: PropertyData): string {
  const parts = [
    property.mailingAddress,
    property.mailingCity,
    property.mailingState,
    property.mailingZip,
  ].filter(Boolean);
  return parts.join(' ');
}

/**
 * Build full property address from components
 */
function buildPropertyAddress(property: PropertyData): string {
  const parts = [property.address, property.city, property.state, property.zip].filter(Boolean);
  return parts.join(' ');
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AbsenteeOwnerParams {
  // No configurable parameters for this filter
}

/**
 * Check if property owner is absentee
 * Returns match if mailing address differs from property address
 */
export function applyAbsenteeOwnerFilter(
  property: PropertyData,
  _params: AbsenteeOwnerParams = {}
): FilterMatch {
  // If owner-occupied flag is explicitly set, use it
  if (property.isOwnerOccupied === true) {
    return {
      filterId: 'absentee_owner',
      matched: false,
      score: 0,
      reason: 'Property is owner-occupied',
    };
  }

  if (property.isOwnerOccupied === false) {
    return {
      filterId: 'absentee_owner',
      matched: true,
      score: 95,
      reason: 'Property is marked as not owner-occupied',
    };
  }

  // Compare addresses
  const propertyAddr = normalizeAddress(buildPropertyAddress(property));
  const mailingAddr = normalizeAddress(buildMailingAddress(property));

  // If no mailing address, can't determine
  if (!mailingAddr) {
    return {
      filterId: 'absentee_owner',
      matched: false,
      score: 0,
      reason: 'No mailing address available',
    };
  }

  // Check for PO Box (strong absentee indicator)
  if (isPOBox(property.mailingAddress)) {
    return {
      filterId: 'absentee_owner',
      matched: true,
      score: 85,
      reason: 'Mailing address is a PO Box',
      data: {
        propertyAddress: property.address,
        mailingAddress: property.mailingAddress,
      },
    };
  }

  // Compare state mismatch (strong indicator)
  if (property.mailingState && property.state) {
    if (property.mailingState.toLowerCase() !== property.state.toLowerCase()) {
      return {
        filterId: 'absentee_owner',
        matched: true,
        score: 95,
        reason: 'Owner mailing state differs from property state',
        data: {
          propertyState: property.state,
          ownerState: property.mailingState,
        },
      };
    }
  }

  // Compare full addresses
  if (propertyAddr !== mailingAddr) {
    // Check if zip codes differ (medium-strong indicator)
    const zipsDiffer = property.zip && property.mailingZip && property.zip !== property.mailingZip;

    return {
      filterId: 'absentee_owner',
      matched: true,
      score: zipsDiffer ? 90 : 75,
      reason: zipsDiffer
        ? 'Mailing address in different zip code'
        : 'Mailing address differs from property address',
      data: {
        propertyAddress: property.address,
        mailingAddress: property.mailingAddress,
      },
    };
  }

  return {
    filterId: 'absentee_owner',
    matched: false,
    score: 0,
    reason: 'Mailing address matches property address',
  };
}
