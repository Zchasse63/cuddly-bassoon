/**
 * Signal Fetcher
 *
 * Fetches raw property signals from various data sources:
 * - RentCast: Property data, valuations, market conditions
 * - Shovels: Permit data, property condition signals
 * - Supabase: Cached data, distress indicators
 */

import { getRentCastClient } from '@/lib/rentcast';
import { getPermitsForAddress, searchAddresses } from '@/lib/shovels/client';
import { createClient } from '@/lib/supabase/server';
import type { Json } from '@/types/database';
import type { RawPropertySignals } from './types';

/**
 * Options for signal fetching
 */
export interface SignalFetchOptions {
  propertyId?: string;
  address?: string;
  zipCode?: string;
  city?: string;
  state?: string;

  // Control which sources to fetch from
  sources?: {
    rentcast?: boolean;
    shovels?: boolean;
    supabase?: boolean;
  };

  // Caching options
  useCache?: boolean;
  cacheTtlSeconds?: number;
}

/**
 * Result of signal fetching
 */
export interface SignalFetchResult {
  signals: RawPropertySignals;
  sources: {
    rentcast: boolean;
    shovels: boolean;
    supabase: boolean;
  };
  errors: Array<{ source: string; error: string }>;
  fetchedAt: string;
}

/**
 * Fetch all available signals for a property
 */
export async function fetchPropertySignals(
  options: SignalFetchOptions
): Promise<SignalFetchResult> {
  const signals: RawPropertySignals = {};
  const errors: Array<{ source: string; error: string }> = [];
  const sourcesUsed = {
    rentcast: false,
    shovels: false,
    supabase: false,
  };

  const sourcesToFetch = options.sources || {
    rentcast: true,
    shovels: true,
    supabase: true,
  };

  let resolvedAddress = options.address;
  let resolvedZipCode = options.zipCode;

  // Try to resolve address from Supabase if we only have propertyId
  if (options.propertyId && !resolvedAddress && sourcesToFetch.supabase) {
    try {
      const supabase = await createClient();
      const { data: shovelsData } = await supabase
        .from('shovels_address_metrics')
        .select('formatted_address, zip_code, city, state')
        .eq('address_id', options.propertyId)
        .single();

      if (shovelsData) {
        resolvedAddress = shovelsData.formatted_address || undefined;
        resolvedZipCode = shovelsData.zip_code || resolvedZipCode;
        sourcesUsed.supabase = true;
      }
    } catch {
      errors.push({ source: 'supabase', error: 'Failed to resolve address from propertyId' });
    }
  }

  // Fetch from RentCast
  if (sourcesToFetch.rentcast && resolvedAddress) {
    try {
      const rentcastSignals = await fetchRentCastSignals(resolvedAddress, resolvedZipCode);
      Object.assign(signals, rentcastSignals);
      sourcesUsed.rentcast = true;
    } catch (e) {
      errors.push({
        source: 'rentcast',
        error: e instanceof Error ? e.message : 'Unknown RentCast error',
      });
    }
  }

  // Fetch from Shovels
  if (sourcesToFetch.shovels && resolvedAddress) {
    try {
      const shovelsSignals = await fetchShovelsSignals(
        resolvedAddress,
        options.city,
        options.state
      );
      Object.assign(signals, shovelsSignals);
      sourcesUsed.shovels = true;
    } catch (e) {
      errors.push({
        source: 'shovels',
        error: e instanceof Error ? e.message : 'Unknown Shovels error',
      });
    }
  }

  // Fetch distress indicators from Supabase
  if (sourcesToFetch.supabase && (options.propertyId || resolvedAddress)) {
    try {
      const distressSignals = await fetchDistressSignals(options.propertyId, resolvedAddress);
      Object.assign(signals, distressSignals);
      sourcesUsed.supabase = true;
    } catch (e) {
      errors.push({
        source: 'supabase',
        error: e instanceof Error ? e.message : 'Unknown Supabase error',
      });
    }
  }

  return {
    signals,
    sources: sourcesUsed,
    errors,
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Fetch signals from RentCast API
 */
async function fetchRentCastSignals(
  address: string,
  zipCode?: string
): Promise<Partial<RawPropertySignals>> {
  const rentcast = getRentCastClient();
  const signals: Partial<RawPropertySignals> = {};

  // Get property data
  try {
    const properties = await rentcast.searchProperties({ address, limit: 1 });
    const property = properties[0];

    if (property) {
      // Owner signals - names is an array, use first name
      signals.ownerName = property.owner?.names?.[0] || undefined;
      signals.ownerType = property.owner?.ownerType || undefined;
      signals.ownerOccupied = property.ownerOccupied ?? undefined;
      signals.ownerMailingAddress = property.owner?.mailingAddress?.addressLine1 || undefined;
      signals.ownerMailingCity = property.owner?.mailingAddress?.city || undefined;
      signals.ownerMailingState = property.owner?.mailingAddress?.state || undefined;
      signals.ownerMailingZip = property.owner?.mailingAddress?.zipCode || undefined;

      // Sale history
      signals.lastSaleDate = property.lastSaleDate || undefined;
      signals.lastSalePrice = property.lastSalePrice ?? undefined;

      // Property characteristics
      signals.propertyType = property.propertyType || undefined;
      signals.bedrooms = property.bedrooms ?? undefined;
      signals.bathrooms = property.bathrooms ?? undefined;
      signals.squareFootage = property.squareFootage ?? undefined;
      signals.yearBuilt = property.yearBuilt ?? undefined;
      signals.lotSize = property.lotSize ?? undefined;

      // Value estimate - use taxAssessment values from RentCast
      signals.estimatedValue = property.taxAssessment?.marketValue ?? undefined;
      signals.assessedValue = property.taxAssessment?.assessedValue ?? undefined;

      // Use property's zip if not provided
      zipCode = zipCode || property.zipCode || undefined;
    }
  } catch (e) {
    console.warn('[SignalFetcher] Property fetch error:', e);
  }

  // Get valuation for better value estimate
  try {
    const valuation = await rentcast.getValuation(address);
    if (valuation.price) {
      signals.estimatedValue = valuation.price;
    }
  } catch {
    // Valuation is optional, don't fail
  }

  // Get market data
  if (zipCode) {
    try {
      const marketData = await rentcast.getMarketData(zipCode);
      signals.daysOnMarket = marketData.daysOnMarket ?? undefined;
      signals.saleToListRatio = marketData.saleToListRatio ?? undefined;
      signals.inventory = marketData.inventory ?? undefined;
      signals.medianPrice = marketData.medianSalePrice ?? undefined;
      signals.priceChangeYoY = marketData.yearOverYearChange ?? undefined;
    } catch (e) {
      console.warn('[SignalFetcher] Market data error:', e);
    }
  }

  return signals;
}

/**
 * Fetch signals from Shovels API
 */
async function fetchShovelsSignals(
  address: string,
  _city?: string,
  _state?: string
): Promise<Partial<RawPropertySignals>> {
  const signals: Partial<RawPropertySignals> = {};

  try {
    // Find address ID
    const addresses = await searchAddresses(address);
    const firstAddress = addresses[0];
    if (!firstAddress) {
      return signals;
    }

    const addressId = firstAddress.address_id;

    // Get permits from last 3 years
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

    const permits = await getPermitsForAddress(addressId, {
      from: threeYearsAgo.toISOString().split('T')[0],
    });

    if (permits.length > 0) {
      signals.recentPermits = permits.map((p) => ({
        type: p.tags?.[0] || 'unknown', // Use first tag as type
        status: (p.status as 'active' | 'final' | 'inactive' | 'in_review') || 'active',
        filedDate: p.issue_date,
        tags: p.tags,
      }));
    }

    // Note: City metrics from getCityMetrics could be added here when
    // RawPropertySignals type is extended to support them
  } catch (e) {
    console.warn('[SignalFetcher] Shovels error:', e);
  }

  return signals;
}

/**
 * Fetch distress indicators from Supabase
 *
 * Note: Distress columns (pre_foreclosure, tax_delinquent, vacant, code_liens)
 * would need to be added to the properties table or a separate distress_indicators
 * table before this functionality can be enabled.
 */
async function fetchDistressSignals(
  _propertyId?: string,
  _address?: string
): Promise<Partial<RawPropertySignals>> {
  // TODO: Enable when distress_indicators table or columns are available
  // Currently the properties table doesn't have these columns
  return {};
}

/**
 * Check cached signals before fetching
 */
export async function getCachedSignals(propertyId: string): Promise<RawPropertySignals | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('property_signals')
      .select('signal_data, expires_at')
      .eq('property_id', propertyId)
      .single();

    if (data && new Date(data.expires_at) > new Date()) {
      return data.signal_data as RawPropertySignals;
    }
  } catch {
    // Cache miss
  }
  return null;
}

/**
 * Store signals in cache
 * Note: Uses composite unique key (property_id, address, signal_source)
 */
export async function cacheSignals(
  propertyId: string,
  signals: RawPropertySignals,
  ttlSeconds: number = 3600,
  address?: string
): Promise<void> {
  try {
    const supabase = await createClient();
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    // Delete existing entry first, then insert new one
    // This handles the composite unique constraint correctly
    await supabase
      .from('property_signals')
      .delete()
      .eq('property_id', propertyId)
      .eq('signal_source', 'combined');

    await supabase.from('property_signals').insert({
      property_id: propertyId,
      address: address || null,
      signal_data: signals as unknown as Json,
      signal_source: 'combined',
      fetched_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
    });
  } catch (e) {
    console.warn('[SignalFetcher] Cache write error:', e);
  }
}
