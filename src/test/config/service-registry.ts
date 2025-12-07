/**
 * Service Registry for Mock/Live Testing
 *
 * Provides conditional service setup based on TEST_MODE environment variable.
 * Integrates with api-toggle.ts to determine which services use mocks vs live APIs.
 *
 * Usage in tests:
 *   import { setupServiceMocks, itLive, describeLive } from '@/test/config/service-registry';
 *
 *   beforeAll(() => setupServiceMocks());
 *
 *   itLive('mapbox', 'performs geocoding', async () => {
 *     // This test runs with live Mapbox if TEST_MODE=live and API key exists
 *     // Otherwise uses mocks
 *   });
 */

import { vi, describe, it, beforeAll, afterAll } from 'vitest';
import {
  shouldUseLiveApi,
  getTestMode,
  getServiceStatus,
  logTestConfiguration,
  type ServiceName,
} from './api-toggle';

// Import mock factories
import { mockMapboxApis } from '../mocks/mapbox';
import { mockShovelsApis } from '../mocks/shovels';
import { mockSkipTraceApis } from '../mocks/skip-trace';

// Track API calls for reporting
export const apiCallStats: Record<ServiceName | 'total', number> = {
  mapbox: 0,
  shovels: 0,
  rentcast: 0,
  xai: 0,
  supabase: 0,
  census: 0,
  twilio: 0,
  sendgrid: 0,
  skipTrace: 0,
  total: 0,
};

/**
 * Mock implementations for each service
 */
const serviceMocks: Record<string, () => ReturnType<typeof vi.fn>> = {
  mapbox: mockMapboxApis,
  shovels: mockShovelsApis,
  skipTrace: mockSkipTraceApis,
  rentcast: createRentCastMock,
  xai: createXaiMock,
  census: createCensusMock,
  twilio: createTwilioMock,
  sendgrid: createSendGridMock,
  supabase: createSupabaseMock,
};

/**
 * URL patterns to identify which service a request belongs to
 */
const serviceUrlPatterns: Record<ServiceName, RegExp[]> = {
  mapbox: [/api\.mapbox\.com/],
  shovels: [/api\.shovels\.ai/],
  rentcast: [/api\.rentcast\.io/],
  xai: [/api\.x\.ai/, /api\.grok\.ai/],
  supabase: [/supabase\.co/, /supabase\.in/],
  census: [/api\.census\.gov/],
  twilio: [/api\.twilio\.com/],
  sendgrid: [/api\.sendgrid\.com/],
  skipTrace: [/skiptrace/, /skip-trace/],
};

/**
 * Identify which service a URL belongs to
 */
function identifyService(url: string): ServiceName | null {
  for (const [service, patterns] of Object.entries(serviceUrlPatterns)) {
    if (patterns.some((pattern) => pattern.test(url))) {
      return service as ServiceName;
    }
  }
  return null;
}

/**
 * Create a smart fetch mock that routes to mock or live based on service
 */
function createSmartFetch(originalFetch: typeof fetch) {
  return vi.fn().mockImplementation(async (url: string | URL | Request, options?: RequestInit) => {
    const urlStr = url.toString();
    const service = identifyService(urlStr);

    if (service) {
      apiCallStats[service]++;
      apiCallStats.total++;

      // If service should use live API, pass through to real fetch
      if (shouldUseLiveApi(service)) {
        return originalFetch(url, options);
      }

      // Otherwise use mock
      const mockFactory = serviceMocks[service];
      if (mockFactory) {
        const mock = mockFactory();
        return mock(url, options);
      }
    }

    // Unknown service: pass through to real fetch in live mode, mock in mock mode
    if (getTestMode() === 'live') {
      return originalFetch(url, options);
    }

    // Default mock response
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(''),
    });
  });
}

// Store original fetch for restoration
let originalFetch: typeof fetch;
let smartFetchMock: ReturnType<typeof vi.fn>;

/**
 * Setup service mocks based on TEST_MODE
 * Call this in beforeAll() of your test file
 */
export function setupServiceMocks() {
  const mode = getTestMode();

  // Log configuration in verbose mode
  if (process.env.TEST_VERBOSE === 'true') {
    logTestConfiguration();
  } else {
    console.log(`\n[Test Mode: ${mode.toUpperCase()}]`);
  }

  // Store original fetch
  originalFetch = global.fetch;

  // Create and install smart fetch
  smartFetchMock = createSmartFetch(originalFetch);
  vi.stubGlobal('fetch', smartFetchMock);

  return smartFetchMock;
}

/**
 * Teardown service mocks
 * Call this in afterAll() of your test file
 */
export function teardownServiceMocks() {
  // Restore original fetch
  if (originalFetch) {
    global.fetch = originalFetch;
  }

  // Report stats
  if (process.env.TEST_VERBOSE === 'true') {
    console.log('\n--- API Call Stats ---');
    Object.entries(apiCallStats).forEach(([service, count]) => {
      if (count > 0 || service === 'total') {
        console.log(`  ${service}: ${count}`);
      }
    });
  }

  // Reset stats
  Object.keys(apiCallStats).forEach((key) => {
    apiCallStats[key as keyof typeof apiCallStats] = 0;
  });
}

/**
 * Conditional test that requires a specific service
 * Skips the test if the service is not available in the current mode
 *
 * Usage:
 *   itLive('mapbox', 'geocodes an address', async () => { ... });
 */
export function itLive(
  service: ServiceName,
  name: string,
  fn: () => void | Promise<void>,
  timeout?: number
) {
  const isLive = shouldUseLiveApi(service);
  const status = getServiceStatus();
  const label = `[${status[service].toUpperCase()}] ${name}`;

  return it(label, fn, timeout);
}

/**
 * Conditional describe block that requires a specific service
 *
 * Usage:
 *   describeLive('mapbox', 'Mapbox Geocoding', () => { ... });
 */
export function describeLive(service: ServiceName, name: string, fn: () => void) {
  const status = getServiceStatus();
  const label = `[${status[service].toUpperCase()}] ${name}`;

  return describe(label, fn);
}

/**
 * Skip test if service is mocked (only run on live APIs)
 */
export function itOnlyLive(
  service: ServiceName,
  name: string,
  fn: () => void | Promise<void>,
  timeout?: number
) {
  const isLive = shouldUseLiveApi(service);

  if (!isLive) {
    return it.skip(`[SKIP - needs live ${service}] ${name}`, fn, timeout);
  }

  return it(`[LIVE] ${name}`, fn, timeout);
}

/**
 * Skip test if service is live (only run on mocks)
 */
export function itOnlyMock(
  service: ServiceName,
  name: string,
  fn: () => void | Promise<void>,
  timeout?: number
) {
  const isLive = shouldUseLiveApi(service);

  if (isLive) {
    return it.skip(`[SKIP - mocked only] ${name}`, fn, timeout);
  }

  return it(`[MOCK] ${name}`, fn, timeout);
}

/**
 * Get the current mock for a specific service (for assertions)
 */
export function getServiceMock(service: ServiceName) {
  return smartFetchMock;
}

/**
 * Check if a service is currently using live API
 */
export function isServiceLive(service: ServiceName): boolean {
  return shouldUseLiveApi(service);
}

// ============================================
// Mock Factories for Services Without Mocks
// ============================================

function createRentCastMock() {
  return vi.fn().mockImplementation((url: string) => {
    const urlStr = url.toString();

    // Property valuation
    if (urlStr.includes('/avm') || urlStr.includes('/value')) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            price: 425000,
            priceHigh: 475000,
            priceLow: 375000,
            rentEstimate: 2200,
            rentEstimateHigh: 2500,
            rentEstimateLow: 1900,
          }),
      });
    }

    // Rent estimate
    if (urlStr.includes('/rent')) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            rent: 2200,
            rentHigh: 2500,
            rentLow: 1900,
          }),
      });
    }

    // Market stats
    if (urlStr.includes('/market')) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            medianRent: 2100,
            averageRent: 2250,
            medianPrice: 400000,
            averagePrice: 425000,
            daysOnMarket: 35,
          }),
      });
    }

    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
    });
  });
}

function createXaiMock() {
  return vi.fn().mockImplementation((url: string, options?: RequestInit) => {
    // Parse the request to understand what's being asked
    const body = options?.body ? JSON.parse(options.body as string) : {};

    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          id: 'mock-completion-id',
          choices: [
            {
              message: {
                role: 'assistant',
                content:
                  'This is a mock AI response. In live mode, this would be a real response from xAI Grok.',
                tool_calls: body.tools
                  ? [
                      {
                        id: 'mock-tool-call',
                        type: 'function',
                        function: {
                          name: body.tools[0]?.function?.name || 'mock_tool',
                          arguments: '{}',
                        },
                      },
                    ]
                  : undefined,
              },
              finish_reason: body.tools ? 'tool_calls' : 'stop',
            },
          ],
          usage: {
            prompt_tokens: 100,
            completion_tokens: 50,
            total_tokens: 150,
          },
        }),
    });
  });
}

function createCensusMock() {
  return vi.fn().mockImplementation((url: string) => {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve([
          ['NAME', 'B01003_001E', 'state', 'county'],
          ['Miami-Dade County, Florida', '2716940', '12', '086'],
        ]),
    });
  });
}

function createTwilioMock() {
  return vi.fn().mockImplementation((url: string, options?: RequestInit) => {
    const urlStr = url.toString();

    // SMS send
    if (urlStr.includes('/Messages')) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            sid: 'SM' + 'mock'.repeat(8),
            status: 'queued',
            to: '+15551234567',
            from: '+15559876543',
            body: 'Mock SMS sent',
            dateCreated: new Date().toISOString(),
          }),
      });
    }

    // Call
    if (urlStr.includes('/Calls')) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            sid: 'CA' + 'mock'.repeat(8),
            status: 'queued',
            to: '+15551234567',
            from: '+15559876543',
          }),
      });
    }

    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });
}

function createSendGridMock() {
  return vi.fn().mockImplementation((url: string, options?: RequestInit) => {
    return Promise.resolve({
      ok: true,
      status: 202,
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(''),
    });
  });
}

function createSupabaseMock() {
  return vi.fn().mockImplementation((url: string, options?: RequestInit) => {
    const urlStr = url.toString();

    // Auth endpoints
    if (urlStr.includes('/auth/')) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            user: {
              id: 'mock-user-id',
              email: 'test@example.com',
              role: 'authenticated',
            },
            session: {
              access_token: 'mock-access-token',
              refresh_token: 'mock-refresh-token',
            },
          }),
      });
    }

    // REST API (PostgREST)
    if (urlStr.includes('/rest/v1/')) {
      const method = options?.method || 'GET';

      if (method === 'GET') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
          headers: new Headers({ 'content-range': '0-0/0' }),
        });
      }

      if (method === 'POST') {
        const body = options?.body ? JSON.parse(options.body as string) : {};
        return Promise.resolve({
          ok: true,
          status: 201,
          json: () => Promise.resolve({ id: 'mock-id', ...body }),
        });
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    }

    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
    });
  });
}

// ============================================
// Test Setup Helpers
// ============================================

/**
 * Create a complete test setup with beforeAll/afterAll hooks
 */
export function createTestSetup() {
  beforeAll(() => {
    setupServiceMocks();
  });

  afterAll(() => {
    teardownServiceMocks();
  });
}

/**
 * Export convenience function to get mode for conditional logic in tests
 */
export { getTestMode, getServiceStatus, shouldUseLiveApi };
