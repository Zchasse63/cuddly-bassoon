/**
 * Signal Fetcher
 *
 * Fetches raw property signals from various data sources:
 * - RentCast: Property data, valuations, market conditions
 * - Shovels: Permit data, property condition signals
 * - Supabase: Cached data, distress indicators
 */

import { getRentCastClient } from '@/lib/rentcast';
import { getPermitsForAddress, searchAddresses, getCityMetrics } from '@/lib/shovels/client';
import { createClient } from '@/lib/supabase/server';
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
        resolvedAddress = shovelsData.formatted_address;
        resolvedZipCode = shovelsData.zip_code || resolvedZipCode;
        sourcesUsed.supabase = true;
      }
    } catch (e) {
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
      const shovelsSignals = await fetchShovelsSignals(resolvedAddress, options.city, options.state);
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
      // Owner signals
      signals.ownerName = property.owner?.name;
      signals.ownerType = property.owner?.ownerType;
      signals.ownerOccupied = property.ownerOccupied;
      signals.ownerMailingAddress = property.owner?.address?.address;
      signals.ownerMailingCity = property.owner?.address?.city;
      signals.ownerMailingState = property.owner?.address?.state;
      signals.ownerMailingZip = property.owner?.address?.zipCode;

      // Sale history
      signals.lastSaleDate = property.lastSaleDate;
      signals.lastSalePrice = property.lastSalePrice;

      // Property characteristics
      signals.propertyType = property.propertyType;
      signals.bedrooms = property.bedrooms;
      signals.bathrooms = property.bathrooms;
      signals.squareFootage = property.squareFootage;
      signals.yearBuilt = property.yearBuilt;
      signals.lotSize = property.lotSize;

      // Value estimate
      signals.estimatedValue = property.price || property.estimatedValue;
      signals.assessedValue = property.assessedValue;

      // Use property's zip if not provided
      zipCode = zipCode || property.zipCode;
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
  } catch (e) {
    // Valuation is optional, don't fail
  }

  // Get market data
  if (zipCode) {
    try {
      const marketData = await rentcast.getMarketData(zipCode);
      signals.daysOnMarket = marketData.daysOnMarket;
      signals.saleToListRatio = marketData.saleToListRatio;
      signals.inventory = marketData.inventory;
      signals.medianPrice = marketData.medianPrice;
      signals.priceChangeYoY = marketData.priceChange;
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
  city?: string,
  state?: string
): Promise<Partial<RawPropertySignals>> {
  const signals: Partial<RawPropertySignals> = {};

  try {
    // Find address ID
    const addresses = await searchAddresses(address);
    if (addresses.length === 0) {
      return signals;
    }

    const addressId = addresses[0].address_id;

    // Get permits from last 3 years
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

    const permits = await getPermitsForAddress(addressId, {
      from: threeYearsAgo.toISOString().split('T')[0],
    });

    if (permits.length > 0) {
      signals.recentPermits = permits.map(p => ({
        type: p.type || 'unknown',
        status: (p.status as 'active' | 'final' | 'inactive' | 'in_review') || 'active',
        filedDate: p.issue_date,
        tags: p.tags,
      }));
    }

    // Get city metrics if we have city/state
    if (city && state) {
      try {
        const metrics = await getCityMetrics(city, state);
        // Add any relevant city-level metrics here
      } catch (e) {
        // City metrics are optional
      }
    }
  } catch (e) {
    console.warn('[SignalFetcher] Shovels error:', e);
  }

  return signals;
}

/**
 * Fetch distress indicators from Supabase
 */
async function fetchDistressSignals(
  propertyId?: string,
  address?: string
): Promise<Partial<RawPropertySignals>> {
  const signals: Partial<RawPropertySignals> = {};
  const supabase = await createClient();

  // Try to get property from various tables

  // Check for pre-foreclosure indicators
  if (propertyId) {
    try {
      const { data: propertyData } = await supabase
        .from('properties')
        .select('pre_foreclosure, tax_delinquent, vacant, code_liens')
        .eq('id', propertyId)
        .single();

      if (propertyData) {
        signals.preForeclosure = propertyData.pre_foreclosure || false;
        signals.taxDelinquent = propertyData.tax_delinquent || false;
        signals.vacantIndicator = propertyData.vacant || false;
        signals.codeLiens = propertyData.code_liens || 0;
      }
    } catch (e) {
      // Table might not exist or property not found
    }
  }

  // Check for address-based distress data
  if (address) {
    try {
      const { data: distressData } = await supabase
        .from('distress_indicators')
        .select('*')
        .ilike('address', `%${address}%`)
        .limit(1)
        .single();

      if (distressData) {
        signals.preForeclosure = distressData.pre_foreclosure || signals.preForeclosure;
        signals.taxDelinquent = distressData.tax_delinquent || signals.taxDelinquent;
        signals.vacantIndicator = distressData.vacant || signals.vacantIndicator;
        signals.codeLiens = distressData.code_liens || signals.codeLiens;
      }
    } catch (e) {
      // Table might not exist or address not found
    }
  }

  return signals;
}

/**
 * Check cached signals before fetching
 */
export async function getCachedSignals(
  propertyId: string
): Promise<RawPropertySignals | null> {
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
  } catch (e) {
    // Cache miss
  }
  return null;
}

/**
 * Store signals in cache
 */
export async function cacheSignals(
  propertyId: string,
  signals: RawPropertySignals,
  ttlSeconds: number = 3600
): Promise<void> {
  try {
    const supabase = await createClient();
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    await supabase
      .from('property_signals')
      .upsert({
        property_id: propertyId,
        signal_data: signals,
        signal_source: 'combined',
        fetched_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
      }, { onConflict: 'property_id' });
  } catch (e) {
    console.warn('[SignalFetcher] Cache write error:', e);
  }
}
