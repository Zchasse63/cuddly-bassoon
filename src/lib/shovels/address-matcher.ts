/**
 * Address Matching Service
 * Matches properties to Shovels.ai addresses and calculates metrics
 */

import { createClient } from '@/lib/supabase/server';
import { searchAddresses, getPermitsForAddress } from './client';
import type { ShovelsPermit, ShovelsPermitTag } from './types';

// ============================================
// Types
// ============================================

export interface MatchResult {
  propertyId: string;
  shovelsAddressId: string | null;
  matchConfidence: 'high' | 'medium' | 'low' | 'none';
  matchMethod: 'exact' | 'normalized' | 'fuzzy' | 'none';
}

// ============================================
// Address Normalization
// ============================================

/**
 * Normalize address for matching.
 * Standardizes common abbreviations and removes punctuation.
 */
export function normalizeAddress(address: string): string {
  return address
    .toLowerCase()
    .replace(/\bstreet\b/g, 'st')
    .replace(/\bavenue\b/g, 'ave')
    .replace(/\bboulevard\b/g, 'blvd')
    .replace(/\bdrive\b/g, 'dr')
    .replace(/\broad\b/g, 'rd')
    .replace(/\blane\b/g, 'ln')
    .replace(/\bcourt\b/g, 'ct')
    .replace(/\bapartment\b/g, 'apt')
    .replace(/\bsuite\b/g, 'ste')
    .replace(/\bnorth\b/g, 'n')
    .replace(/\bsouth\b/g, 's')
    .replace(/\beast\b/g, 'e')
    .replace(/\bwest\b/g, 'w')
    .replace(/[.,#]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ============================================
// Property Matching
// ============================================

/**
 * Match a property to a Shovels address.
 */
export async function matchPropertyToShovels(
  propertyId: string,
  address: string,
  city: string,
  state: string,
  zipCode: string
): Promise<MatchResult> {
  const supabase = await createClient();

  // Check if already matched
  // Note: shovels_address_id column will be added via migration
  const { data: existing } = await supabase
    .from('properties')
    .select('*')
    .eq('id', propertyId)
    .single();

  const existingWithShovels = existing as { shovels_address_id?: string } | null;
  if (existingWithShovels?.shovels_address_id) {
    return {
      propertyId,
      shovelsAddressId: existingWithShovels.shovels_address_id,
      matchConfidence: 'high',
      matchMethod: 'exact',
    };
  }

  // Search Shovels for address
  const fullAddress = `${address}, ${city}, ${state} ${zipCode}`;
  const results = await searchAddresses(fullAddress);

  if (results.length === 0) {
    return {
      propertyId,
      shovelsAddressId: null,
      matchConfidence: 'none',
      matchMethod: 'none',
    };
  }

  // Try exact match first
  const normalizedInput = normalizeAddress(fullAddress);

  for (const result of results) {
    const normalizedResult = normalizeAddress(result.formatted_address);

    if (normalizedResult === normalizedInput) {
      // Update property with Shovels ID
      // Note: These columns will be added via migration
      await supabase
        .from('properties')
        .update({
          shovels_address_id: result.address_id,
          shovels_matched_at: new Date().toISOString(),
        } as Record<string, unknown>)
        .eq('id', propertyId);

      return {
        propertyId,
        shovelsAddressId: result.address_id,
        matchConfidence: 'high',
        matchMethod: 'exact',
      };
    }
  }

  // Use first result as best match if no exact match
  const bestMatch = results[0]!;

  // Note: These columns will be added via migration
  await supabase
    .from('properties')
    .update({
      shovels_address_id: bestMatch.address_id,
      shovels_matched_at: new Date().toISOString(),
    } as Record<string, unknown>)
    .eq('id', propertyId);

  return {
    propertyId,
    shovelsAddressId: bestMatch.address_id,
    matchConfidence: 'medium',
    matchMethod: 'normalized',
  };
}

/**
 * Batch match multiple properties to Shovels addresses.
 */
export async function batchMatchProperties(
  properties: Array<{
    id: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  }>
): Promise<MatchResult[]> {
  const results: MatchResult[] = [];

  // Process in batches of 10 to respect rate limits
  for (let i = 0; i < properties.length; i += 10) {
    const batch = properties.slice(i, i + 10);

    const batchResults = await Promise.all(
      batch.map((p) => matchPropertyToShovels(p.id, p.address, p.city, p.state, p.zipCode))
    );

    results.push(...batchResults);

    // Small delay between batches
    if (i + 10 < properties.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return results;
}

// ============================================
// Metrics Calculation
// ============================================

/**
 * Calculate and store address metrics after matching.
 */
export async function calculateAddressMetrics(
  addressId: string,
  _propertyId?: string
): Promise<void> {
  const supabase = await createClient();

  // Get all permits for address
  const permits = await getPermitsForAddress(addressId);

  if (permits.length === 0) {
    return;
  }

  const now = new Date();
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  const twoYearsAgo = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());

  // Calculate metrics
  const permitsLast12Months = permits.filter(
    (p) => new Date(p.file_date || '') >= oneYearAgo
  ).length;
  const permitsPrior12Months = permits.filter((p) => {
    const date = new Date(p.file_date || '');
    return date >= twoYearsAgo && date < oneYearAgo;
  }).length;

  const yoyGrowth =
    permitsPrior12Months > 0
      ? ((permitsLast12Months - permitsPrior12Months) / permitsPrior12Months) * 100
      : null;

  const metrics = {
    shovels_address_id: addressId,
    street_address: permits[0]?.address?.street || '',
    city: permits[0]?.address?.city || null,
    state: permits[0]?.address?.state || null,
    zip_code: permits[0]?.address?.zip_code || null,
    total_permits: permits.length,
    active_permits: permits.filter((p) => p.status === 'active').length,
    completed_permits: permits.filter((p) => p.status === 'final').length,
    expired_permits: permits.filter((p) => p.status === 'inactive').length,
    permit_counts_by_tag: getPermitCountsByTag(permits),
    total_job_value: permits.reduce((sum, p) => sum + (p.job_value || 0), 0),
    avg_job_value: calculateAverage(permits.filter((p) => p.job_value).map((p) => p.job_value!)),
    max_job_value: Math.max(...permits.map((p) => p.job_value || 0)),
    permits_last_12_months: permitsLast12Months,
    permits_prior_12_months: permitsPrior12Months,
    yoy_permit_growth: yoyGrowth,
    avg_inspection_pass_rate: calculateAverage(
      permits.filter((p) => p.inspection_pass_rate).map((p) => p.inspection_pass_rate!)
    ),
    last_permit_date: getMaxDate(permits.map((p) => p.file_date)),
    first_permit_date: getMinDate(permits.map((p) => p.file_date)),
    has_stalled_permit: permits.some(
      (p) => p.status === 'active' && p.file_date && daysSince(p.file_date) > 180
    ),
    has_expired_permit: permits.some(
      (p) => p.status !== 'final' && p.issue_date && daysSince(p.issue_date) > 365
    ),
    last_roofing_date: getLastDateForTag(permits, 'roofing'),
    last_hvac_date: getLastDateForTag(permits, 'hvac'),
    last_water_heater_date: getLastDateForTag(permits, 'water_heater'),
    last_electrical_date: getLastDateForTag(permits, 'electrical'),
    last_plumbing_date: getLastDateForTag(permits, 'plumbing'),
    last_solar_date: getLastDateForTag(permits, 'solar'),
    calculated_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  await supabase.from('shovels_address_metrics').upsert(metrics, {
    onConflict: 'shovels_address_id',
  });
}

// ============================================
// Helper Functions
// ============================================

function getLastDateForTag(permits: ShovelsPermit[], tag: ShovelsPermitTag): string | null {
  const filtered = permits.filter((p) => p.tags.includes(tag));
  if (filtered.length === 0) return null;

  return filtered.reduce((max, p) => {
    const d = p.file_date || '';
    return d > max ? d : max;
  }, '');
}

function getPermitCountsByTag(permits: ShovelsPermit[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const permit of permits) {
    for (const tag of permit.tags) {
      counts[tag] = (counts[tag] || 0) + 1;
    }
  }
  return counts;
}

function daysSince(dateStr: string): number {
  const date = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

function calculateAverage(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function getMaxDate(dates: (string | undefined)[]): string | null {
  const validDates = dates.filter((d): d is string => !!d);
  if (validDates.length === 0) return null;
  return validDates.reduce((max, d) => (d > max ? d : max), '');
}

function getMinDate(dates: (string | undefined)[]): string | null {
  const validDates = dates.filter((d): d is string => !!d);
  if (validDates.length === 0) return null;
  return validDates.reduce((min, d) => (d < min ? d : min), validDates[0]!);
}

