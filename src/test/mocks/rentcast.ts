/**
 * RentCast API Mock
 *
 * Provides mock responses for RentCast API calls.
 * Used in TEST_MODE=mock for unit testing.
 */

import { vi } from 'vitest';

// Sample property data that matches RentCast API response format
export const mockRentCastProperties = [
  {
    id: 'prop-001',
    addressLine1: '123 Main St',
    addressLine2: null,
    city: 'Miami',
    state: 'FL',
    zipCode: '33101',
    formattedAddress: '123 Main St, Miami, FL 33101',
    county: 'Miami-Dade',
    propertyType: 'Single Family',
    bedrooms: 3,
    bathrooms: 2,
    squareFootage: 1800,
    lotSize: 5500,
    yearBuilt: 1995,
    lastSaleDate: '2020-06-15',
    lastSalePrice: 350000,
    taxAssessment: {
      year: 2024,
      landValue: 100000,
      improvementValue: 200000,
      marketValue: 380000,
    },
    owner: {
      names: ['John Smith'],
      ownerType: 'individual',
      mailingAddress: {
        addressLine1: '123 Main St',
        city: 'Miami',
        state: 'FL',
        zipCode: '33101',
      },
    },
    coordinates: { latitude: 25.7617, longitude: -80.1918 },
  },
  {
    id: 'prop-002',
    addressLine1: '456 Oak Ave',
    addressLine2: 'Unit 5',
    city: 'Miami',
    state: 'FL',
    zipCode: '33102',
    formattedAddress: '456 Oak Ave Unit 5, Miami, FL 33102',
    county: 'Miami-Dade',
    propertyType: 'Condo',
    bedrooms: 2,
    bathrooms: 2,
    squareFootage: 1200,
    lotSize: null,
    yearBuilt: 2010,
    lastSaleDate: '2022-03-10',
    lastSalePrice: 275000,
    taxAssessment: {
      year: 2024,
      landValue: null,
      improvementValue: 250000,
      marketValue: 290000,
    },
    owner: {
      names: ['Jane Doe', 'John Doe'],
      ownerType: 'trust',
      mailingAddress: {
        addressLine1: '789 Elm St',
        city: 'Orlando',
        state: 'FL',
        zipCode: '32801',
      },
    },
    coordinates: { latitude: 25.7700, longitude: -80.1850 },
  },
  {
    id: 'prop-003',
    addressLine1: '789 Beach Blvd',
    addressLine2: null,
    city: 'Miami Beach',
    state: 'FL',
    zipCode: '33139',
    formattedAddress: '789 Beach Blvd, Miami Beach, FL 33139',
    county: 'Miami-Dade',
    propertyType: 'Single Family',
    bedrooms: 4,
    bathrooms: 3,
    squareFootage: 2500,
    lotSize: 7500,
    yearBuilt: 1985,
    lastSaleDate: '2018-09-20',
    lastSalePrice: 550000,
    taxAssessment: {
      year: 2024,
      landValue: 200000,
      improvementValue: 400000,
      marketValue: 650000,
    },
    owner: {
      names: ['ABC Investments LLC'],
      ownerType: 'corporate',
      mailingAddress: {
        addressLine1: 'PO Box 1234',
        city: 'Miami',
        state: 'FL',
        zipCode: '33101',
      },
    },
    coordinates: { latitude: 25.7900, longitude: -80.1300 },
  },
];

// Mock valuation response
export const mockRentCastValuation = {
  price: 380000,
  priceHigh: 410000,
  priceLow: 350000,
  rentEstimate: 2500,
  rentEstimateHigh: 2800,
  rentEstimateLow: 2200,
  comparables: [
    {
      addressLine1: '125 Main St',
      city: 'Miami',
      state: 'FL',
      squareFootage: 1750,
      bedrooms: 3,
      bathrooms: 2,
      salePrice: 365000,
      saleDate: '2024-02-15',
      distance: 0.2,
    },
    {
      addressLine1: '130 Main St',
      city: 'Miami',
      state: 'FL',
      squareFootage: 1850,
      bedrooms: 3,
      bathrooms: 2,
      salePrice: 390000,
      saleDate: '2024-01-20',
      distance: 0.3,
    },
  ],
};

// Mock rent estimate response
export const mockRentCastRentEstimate = {
  rent: 2500,
  rentHigh: 2800,
  rentLow: 2200,
  latitude: 25.7617,
  longitude: -80.1918,
};

// Mock market data response
export const mockRentCastMarketData = {
  zipCode: '33101',
  medianSalePrice: 425000,
  medianRent: 2300,
  averageDaysOnMarket: 45,
  totalListings: 234,
  pricePerSquareFoot: 285,
  yearOverYearPriceChange: 8.5,
  yearOverYearRentChange: 5.2,
};

/**
 * Mock fetch for RentCast API endpoints
 */
export function mockRentCastApis() {
  return vi.fn().mockImplementation((url: string, _options?: RequestInit) => {
    void _options; // Options not used in mock
    const urlStr = url.toString();

    // Ensure it's a RentCast URL
    if (!urlStr.includes('api.rentcast.io') && !urlStr.includes('rentcast')) {
      return Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Not a RentCast URL' }),
      });
    }

    // Parse the endpoint
    if (urlStr.includes('/properties') && !urlStr.includes('/properties/')) {
      // Property search endpoint - return array of properties
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockRentCastProperties),
      });
    }

    if (urlStr.includes('/properties/')) {
      // Single property lookup
      const propertyId = urlStr.split('/properties/')[1]?.split('?')[0];
      const property = mockRentCastProperties.find(p => p.id === propertyId);

      if (property) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(property),
        });
      }

      return Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: `Property '${propertyId}' was not found` }),
      });
    }

    if (urlStr.includes('/valuation') || urlStr.includes('/avm')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockRentCastValuation),
      });
    }

    if (urlStr.includes('/rent')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockRentCastRentEstimate),
      });
    }

    if (urlStr.includes('/market')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockRentCastMarketData),
      });
    }

    if (urlStr.includes('/listings')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockRentCastProperties.slice(0, 2)),
      });
    }

    // Default response
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });
  });
}

/**
 * Setup RentCast mocks on global fetch
 */
export function setupRentCastMock() {
  const mock = mockRentCastApis();
  vi.stubGlobal('fetch', mock);
  return mock;
}
