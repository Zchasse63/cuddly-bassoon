/**
 * Vitest Test Setup
 * Global configuration and mocks for all tests
 */

import { vi, beforeAll, afterEach, afterAll } from 'vitest';

// Mock environment variables
process.env.MAPBOX_ACCESS_TOKEN = 'pk.test_mapbox_token';
process.env.NEXT_PUBLIC_MAPBOX_TOKEN = 'pk.test_mapbox_token';
process.env.SHOVELS_API_KEY = 'test_shovels_api_key';
process.env.SKIP_TRACE_API_KEY = 'test_skip_trace_api_key';
process.env.TWILIO_ACCOUNT_SID = 'test_twilio_sid';
process.env.TWILIO_AUTH_TOKEN = 'test_twilio_token';
process.env.SENDGRID_API_KEY = 'test_sendgrid_key';
process.env.XAI_API_KEY = 'test_xai_key';
process.env.RENTCAST_API_KEY = 'test_rentcast_api_key';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'test_key';

// Mock Supabase server client (which uses cookies())
vi.mock('@/lib/supabase/server', () => {
  const mockFrom = vi.fn().mockReturnValue({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    like: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    contains: vi.fn().mockReturnThis(),
    containedBy: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    then: vi.fn().mockResolvedValue({ data: [], error: null }),
  });

  return {
    createClient: vi.fn().mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'test-user-id', email: 'test@example.com' } },
          error: null,
        }),
        getSession: vi.fn().mockResolvedValue({
          data: { session: { access_token: 'test-token' } },
          error: null,
        }),
      },
      from: mockFrom,
      rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  };
});

// Mock Next.js cookies
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockReturnValue({
    get: vi.fn().mockReturnValue(null),
    getAll: vi.fn().mockReturnValue([]),
    set: vi.fn(),
    delete: vi.fn(),
  }),
  headers: vi.fn().mockReturnValue(new Headers()),
}));

// Mock RentCast client to avoid real API calls
vi.mock('@/lib/rentcast/client', () => {
  const mockProperties = [
    {
      id: 'prop-001',
      addressLine1: '123 Main St',
      city: 'Miami',
      state: 'FL',
      zipCode: '33101',
      formattedAddress: '123 Main St, Miami, FL 33101',
      propertyType: 'Single Family',
      bedrooms: 3,
      bathrooms: 2,
      squareFootage: 1800,
      yearBuilt: 1995,
      lastSalePrice: 350000,
      taxAssessment: { marketValue: 380000 },
      owner: { names: ['John Smith'], ownerType: 'individual' },
    },
    {
      id: 'prop-002',
      addressLine1: '456 Oak Ave',
      city: 'Miami',
      state: 'FL',
      zipCode: '33102',
      formattedAddress: '456 Oak Ave, Miami, FL 33102',
      propertyType: 'Condo',
      bedrooms: 2,
      bathrooms: 2,
      squareFootage: 1200,
      yearBuilt: 2010,
      lastSalePrice: 275000,
      taxAssessment: { marketValue: 290000 },
      owner: { names: ['Jane Doe'], ownerType: 'trust' },
    },
    {
      id: 'prop-003',
      addressLine1: '789 Beach Blvd',
      city: 'Miami Beach',
      state: 'FL',
      zipCode: '33139',
      formattedAddress: '789 Beach Blvd, Miami Beach, FL 33139',
      propertyType: 'Single Family',
      bedrooms: 4,
      bathrooms: 3,
      squareFootage: 2500,
      yearBuilt: 1985,
      lastSalePrice: 550000,
      taxAssessment: { marketValue: 650000 },
      owner: { names: ['ABC Investments LLC'], ownerType: 'corporate' },
    },
  ];

  return {
    RentCastClient: vi.fn().mockImplementation(() => ({
      searchProperties: vi.fn().mockImplementation((params) => {
        const limit = params?.limit || 25;
        return Promise.resolve(mockProperties.slice(0, limit));
      }),
      getProperty: vi.fn().mockImplementation((id) => {
        const property = mockProperties.find(p => p.id === id);
        if (property) return Promise.resolve(property);
        // Return first property if not found (for test purposes)
        return Promise.resolve({ ...mockProperties[0], id });
      }),
      getValuation: vi.fn().mockResolvedValue({
        price: 380000,
        priceHigh: 410000,
        priceLow: 350000,
        comparables: [
          { addressLine1: '125 Main St', city: 'Miami', state: 'FL', salePrice: 365000, saleDate: '2024-02-15' },
          { addressLine1: '130 Main St', city: 'Miami', state: 'FL', salePrice: 390000, saleDate: '2024-01-20' },
        ],
      }),
      getRentEstimate: vi.fn().mockResolvedValue({
        rent: 2500,
        rentHigh: 2800,
        rentLow: 2200,
      }),
      getMarketData: vi.fn().mockResolvedValue({
        medianSalePrice: 425000,
        medianRent: 2300,
        averageDaysOnMarket: 45,
      }),
      searchListings: vi.fn().mockResolvedValue(mockProperties.slice(0, 2)),
    })),
    getRentCastClient: vi.fn().mockImplementation(() => ({
      searchProperties: vi.fn().mockImplementation((params) => {
        const limit = params?.limit || 25;
        return Promise.resolve(mockProperties.slice(0, limit));
      }),
      getProperty: vi.fn().mockImplementation((id) => {
        const property = mockProperties.find(p => p.id === id);
        if (property) return Promise.resolve(property);
        return Promise.resolve({ ...mockProperties[0], id });
      }),
      getValuation: vi.fn().mockResolvedValue({
        price: 380000,
        priceHigh: 410000,
        priceLow: 350000,
        comparables: [],
      }),
      getRentEstimate: vi.fn().mockResolvedValue({ rent: 2500 }),
      getMarketData: vi.fn().mockResolvedValue({ medianSalePrice: 425000 }),
      searchListings: vi.fn().mockResolvedValue([]),
    })),
  };
});

// Mock console.log/error to reduce test noise (comment out for debugging)
// vi.spyOn(console, 'log').mockImplementation(() => {});
// vi.spyOn(console, 'error').mockImplementation(() => {});

// Global fetch mock setup
const originalFetch = global.fetch;

beforeAll(() => {
  // Setup global mocks if needed
});

afterEach(() => {
  // Reset all mocks after each test
  vi.restoreAllMocks();
});

afterAll(() => {
  // Cleanup
  global.fetch = originalFetch;
});

