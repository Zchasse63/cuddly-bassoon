/**
 * Shovels API Client
 * Main client for interacting with the Shovels.ai API
 */

import { getShovelsRateLimiter } from './rate-limiter';
import { getShovelsCache } from './cache';
import {
  ShovelsApiError,
  ShovelsAuthenticationError,
  ShovelsRateLimitError,
  ShovelsNotFoundError,
  ShovelsValidationError,
  ShovelsNetworkError,
} from './errors';
import type {
  ShovelsPermit,
  ShovelsContractor,
  ShovelsGeoMetrics,
  ShovelsAddressResident,
  ShovelsSearchParams,
  ShovelsPaginatedResponse,
  ShovelsPermitTag,
} from './types';

// ============================================
// Configuration
// ============================================

const SHOVELS_API_KEY = process.env.SHOVELS_API_KEY!;
const SHOVELS_BASE_URL = process.env.SHOVELS_API_BASE_URL || 'https://api.shovels.ai/v2';

// ============================================
// Base Fetch Function
// ============================================

async function shovelsFetch<T>(
  endpoint: string,
  params?: Record<string, unknown>,
  requestId?: string
): Promise<T> {
  const rateLimiter = getShovelsRateLimiter();

  // Acquire rate limit slot
  await rateLimiter.acquire();

  const url = new URL(`${SHOVELS_BASE_URL}${endpoint}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((v) => url.searchParams.append(key, String(v)));
        } else {
          url.searchParams.set(key, String(value));
        }
      }
    });
  }

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'X-API-Key': SHOVELS_API_KEY,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      await handleHttpError(response, requestId);
    }

    return response.json();
  } catch (error) {
    if (error instanceof ShovelsApiError) {
      throw error;
    }

    if (error instanceof Error) {
      throw new ShovelsNetworkError(error.message, requestId);
    }

    throw new ShovelsApiError('Unknown error occurred', 0, requestId);
  }
}

async function handleHttpError(response: Response, requestId?: string): Promise<never> {
  const status = response.status;
  let message = `Shovels API error: ${response.statusText}`;

  try {
    const errorBody = await response.json();
    message = errorBody.message || errorBody.error || message;
  } catch {
    // Ignore JSON parsing errors
  }

  switch (status) {
    case 401:
      throw new ShovelsAuthenticationError(message, requestId);
    case 403:
      throw new ShovelsAuthenticationError('API key does not have access', requestId);
    case 404:
      throw new ShovelsNotFoundError(message, requestId);
    case 429:
      throw new ShovelsRateLimitError(message, requestId);
    case 400:
      throw new ShovelsValidationError(message, requestId);
    default:
      throw new ShovelsApiError(message, status, requestId);
  }
}

// ============================================
// Permit Operations
// ============================================

export async function searchPermits(
  params: ShovelsSearchParams
): Promise<ShovelsPaginatedResponse<ShovelsPermit>> {
  const cache = getShovelsCache();

  return cache.getOrSet('PERMIT_SEARCH', params as unknown as Record<string, unknown>, async () => {
    const apiParams: Record<string, unknown> = {
      geo_id: params.geo_id,
      permit_from: params.permit_from,
      permit_to: params.permit_to,
      size: params.size || 50,
    };

    if (params.status) apiParams.status = params.status;
    if (params.permit_tags) apiParams.permit_tags = params.permit_tags;
    if (params.property_type) apiParams.property_type = params.property_type;
    if (params.keyword) apiParams.keyword = params.keyword;
    if (params.min_job_value) apiParams.min_job_value = params.min_job_value;
    if (params.min_inspection_pass_rate) apiParams.min_inspection_pass_rate = params.min_inspection_pass_rate;
    if (params.has_contractor !== undefined) apiParams.has_contractor = params.has_contractor;
    if (params.cursor) apiParams.cursor = params.cursor;
    if (params.page) apiParams.page = params.page;

    return shovelsFetch<ShovelsPaginatedResponse<ShovelsPermit>>('/permits/search', apiParams);
  });
}

export async function getPermitsByIds(ids: string[]): Promise<ShovelsPermit[]> {
  const data = await shovelsFetch<{ items: ShovelsPermit[] }>('/permits', { id: ids });
  return data.items;
}

export async function getPermitsForAddress(
  addressId: string,
  options?: { from?: string; to?: string }
): Promise<ShovelsPermit[]> {
  const cache = getShovelsCache();

  return cache.getOrSet('PERMITS', { addressId, ...options }, async () => {
    const params: ShovelsSearchParams = {
      geo_id: addressId,
      permit_from: options?.from || '2000-01-01',
      permit_to: options?.to || new Date().toISOString().split('T')[0]!,
      size: 100,
    };

    const allPermits: ShovelsPermit[] = [];
    let cursor: string | undefined;

    do {
      if (cursor) params.cursor = cursor;
      const response = await searchPermits(params);
      allPermits.push(...response.items);
      cursor = response.cursor;
    } while (cursor);

    return allPermits;
  });
}

// ============================================
// Geographic Operations
// ============================================

export async function searchCities(
  query: string
): Promise<Array<{ geo_id: string; name: string; state: string }>> {
  const data = await shovelsFetch<{
    items: Array<{ geo_id: string; name: string; state: string }>;
  }>('/cities/search', { q: query });
  return data.items;
}

export async function getCityMetrics(geoId: string): Promise<ShovelsGeoMetrics> {
  const cache = getShovelsCache();
  return cache.getOrSet('GEO_METRICS', { type: 'city', geoId }, () =>
    shovelsFetch<ShovelsGeoMetrics>(`/cities/${geoId}/metrics`)
  );
}

export async function getCountyMetrics(geoId: string): Promise<ShovelsGeoMetrics> {
  const cache = getShovelsCache();
  return cache.getOrSet('GEO_METRICS', { type: 'county', geoId }, () =>
    shovelsFetch<ShovelsGeoMetrics>(`/counties/${geoId}/metrics`)
  );
}

export async function getJurisdictionMetrics(geoId: string): Promise<ShovelsGeoMetrics> {
  const cache = getShovelsCache();
  return cache.getOrSet('GEO_METRICS', { type: 'jurisdiction', geoId }, () =>
    shovelsFetch<ShovelsGeoMetrics>(`/jurisdictions/${geoId}/metrics`)
  );
}

// ============================================
// Address Operations
// ============================================

export async function searchAddresses(
  query: string
): Promise<Array<{ address_id: string; formatted_address: string }>> {
  const data = await shovelsFetch<{
    items: Array<{ geo_id: string; formatted_address: string }>;
  }>('/addresses/search', { q: query });
  return data.items.map((item) => ({
    address_id: item.geo_id,
    formatted_address: item.formatted_address,
  }));
}

export async function getAddressMetrics(addressId: string): Promise<Record<string, unknown>> {
  const cache = getShovelsCache();
  return cache.getOrSet('ADDRESS_METRICS', { addressId }, () =>
    shovelsFetch<Record<string, unknown>>(`/addresses/${addressId}/metrics`)
  );
}

export async function getAddressResidents(addressId: string): Promise<ShovelsAddressResident[]> {
  const cache = getShovelsCache();
  return cache.getOrSet('RESIDENTS', { addressId }, async () => {
    const data = await shovelsFetch<{ items: ShovelsAddressResident[] }>(
      `/addresses/${addressId}/residents`
    );
    return data.items;
  });
}

// ============================================
// Contractor Operations
// ============================================

export async function searchContractors(params: {
  geo_id: string;
  permit_from: string;
  permit_to: string;
  permit_tags?: ShovelsPermitTag[];
  property_type?: 'residential' | 'commercial';
}): Promise<ShovelsPaginatedResponse<ShovelsContractor>> {
  return shovelsFetch<ShovelsPaginatedResponse<ShovelsContractor>>(
    '/contractors/search',
    params as Record<string, unknown>
  );
}

export async function getContractorById(id: string): Promise<ShovelsContractor> {
  const cache = getShovelsCache();
  return cache.getOrSet('CONTRACTORS', { id }, () =>
    shovelsFetch<ShovelsContractor>(`/contractors/${id}`)
  );
}

export async function getContractorPermits(
  contractorId: string,
  params: { permit_from: string; permit_to: string }
): Promise<ShovelsPermit[]> {
  const data = await shovelsFetch<ShovelsPaginatedResponse<ShovelsPermit>>(
    `/contractors/${contractorId}/permits`,
    params
  );
  return data.items;
}

// ============================================
// Client Class (Alternative OOP Interface)
// ============================================

export class ShovelsClient {
  // Permit operations
  searchPermits = searchPermits;
  getPermitsByIds = getPermitsByIds;
  getPermitsForAddress = getPermitsForAddress;

  // Geographic operations
  searchCities = searchCities;
  getCityMetrics = getCityMetrics;
  getCountyMetrics = getCountyMetrics;
  getJurisdictionMetrics = getJurisdictionMetrics;

  // Address operations
  searchAddresses = searchAddresses;
  getAddressMetrics = getAddressMetrics;
  getAddressResidents = getAddressResidents;

  // Contractor operations
  searchContractors = searchContractors;
  getContractorById = getContractorById;
  getContractorPermits = getContractorPermits;
}

// Singleton instance
let clientInstance: ShovelsClient | null = null;

export function getShovelsClient(): ShovelsClient {
  if (!clientInstance) {
    clientInstance = new ShovelsClient();
  }
  return clientInstance;
}

