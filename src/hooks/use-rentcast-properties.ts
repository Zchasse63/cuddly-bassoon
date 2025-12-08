'use client';

import { useQuery } from '@tanstack/react-query';
import type { MapProperty } from '@/components/map/MapProperty';

interface RentcastSearchParams {
  city?: string;
  state?: string;
  zipCode?: string;
  limit?: number;
}

// The API returns NormalizedProperty from transform.ts
interface NormalizedPropertyResponse {
  id: string;
  rentcastId?: string;
  address: string;
  city?: string;
  state?: string;
  zip?: string;
  latitude?: number;
  longitude?: number;
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
  lastSalePrice?: number;
  marketValue?: number;
  assessedValue?: number;
}

interface RentcastAPIResponse {
  data: NormalizedPropertyResponse[];
  meta: {
    cached: boolean;
    count: number;
  };
}

async function fetchRentcastProperties(params: RentcastSearchParams): Promise<MapProperty[]> {
  const searchParams = new URLSearchParams();
  if (params.city) searchParams.set('city', params.city);
  if (params.state) searchParams.set('state', params.state);
  if (params.zipCode) searchParams.set('zipCode', params.zipCode);
  if (params.limit) searchParams.set('limit', params.limit.toString());

  const response = await fetch(`/api/rentcast/properties?${searchParams.toString()}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch properties: ${response.statusText}`);
  }

  const result: RentcastAPIResponse = await response.json();

  if (!result.data || !Array.isArray(result.data)) {
    console.warn('Rentcast API returned no data');
    return [];
  }

  // Transform to MapProperty format
  return result.data
    .filter((p) => p.latitude && p.longitude) // Only include properties with coordinates
    .map((p) => ({
      id: p.id || p.rentcastId || crypto.randomUUID(),
      address: p.address || 'Unknown Address',
      city: p.city || '',
      state: p.state || '',
      latitude: p.latitude!,
      longitude: p.longitude!,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      sqft: p.squareFootage,
      estimatedValue: p.marketValue || p.assessedValue,
      lastSalePrice: p.lastSalePrice,
    }));
}

export interface UseRentcastPropertiesOptions {
  city?: string;
  state?: string;
  zipCode?: string;
  limit?: number;
  enabled?: boolean;
}

export function useRentcastProperties(options: UseRentcastPropertiesOptions = {}) {
  const { city, state, zipCode, limit = 50, enabled = true } = options;

  return useQuery({
    queryKey: ['rentcast-properties', { city, state, zipCode, limit }],
    queryFn: () => fetchRentcastProperties({ city, state, zipCode, limit }),
    enabled: enabled && Boolean(city || state || zipCode),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 2,
  });
}

