/**
 * Mock Index
 * Central export for all test mocks
 */

export * from './mapbox';
export * from './shovels';
export * from './skip-trace';

import { vi } from 'vitest';
import { mockMapboxApis } from './mapbox';
import { mockShovelsApis } from './shovels';
import { mockSkipTraceApis } from './skip-trace';

/**
 * Combined mock that handles all external API calls
 */
export function mockAllExternalApis() {
  const mapboxMock = mockMapboxApis();
  const shovelsMock = mockShovelsApis();
  const skipTraceMock = mockSkipTraceApis();
  
  return vi.fn().mockImplementation((url: string, options?: RequestInit) => {
    const urlStr = url.toString();
    
    // Route to appropriate mock based on URL
    if (urlStr.includes('api.mapbox.com')) {
      return mapboxMock(url, options);
    }
    
    if (urlStr.includes('api.shovels.ai')) {
      return shovelsMock(url, options);
    }
    
    if (urlStr.includes('skiptrace') || urlStr.includes('skip-trace')) {
      return skipTraceMock(url, options);
    }
    
    // Default: simulate a successful empty response
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
    });
  });
}

/**
 * Setup all mocks for a test file
 */
export function setupAllMocks() {
  const fetchMock = mockAllExternalApis();
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

/**
 * Mock property search responses
 */
export const mockPropertySearchResponse = {
  properties: [
    {
      id: 'prop-001',
      address: '123 Main St',
      city: 'Miami',
      state: 'FL',
      zip: '33101',
      price: 350000,
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1800,
      yearBuilt: 1995,
      propertyType: 'single_family',
      status: 'active',
      daysOnMarket: 30,
      coordinates: { lat: 25.7617, lng: -80.1918 },
    },
    {
      id: 'prop-002',
      address: '456 Oak Ave',
      city: 'Miami',
      state: 'FL',
      zip: '33102',
      price: 425000,
      bedrooms: 4,
      bathrooms: 2.5,
      sqft: 2200,
      yearBuilt: 2005,
      propertyType: 'single_family',
      status: 'active',
      daysOnMarket: 15,
      coordinates: { lat: 25.7700, lng: -80.1850 },
    },
  ],
  total: 2,
  page: 1,
  pageSize: 25,
};

/**
 * Mock deal analysis response
 */
export const mockDealAnalysisResponse = {
  propertyId: 'prop-001',
  arv: 420000,
  estimatedRepairs: 35000,
  mao: 262500,
  profitPotential: 52500,
  roi: 20,
  riskScore: 35,
  recommendation: 'Proceed with offer at $265,000',
  comparables: [
    { address: '125 Main St', soldPrice: 415000, soldDate: '2024-01-15' },
    { address: '130 Main St', soldPrice: 425000, soldDate: '2023-12-01' },
  ],
};

/**
 * Mock market analysis response
 */
export const mockMarketAnalysisResponse = {
  location: 'Miami, FL',
  medianPrice: 425000,
  priceChange12Month: 8.5,
  averageDaysOnMarket: 45,
  inventoryLevel: 'low',
  marketTrend: 'appreciation',
  supplyDemandRatio: 0.65,
  forecast: {
    '3month': 3.2,
    '6month': 5.1,
    '12month': 7.8,
  },
};

