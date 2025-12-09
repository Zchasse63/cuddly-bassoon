/**
 * Live API Testing Utilities
 * 
 * Helpers for running tests against real APIs with proper
 * error handling, retries, and skip logic.
 */

import { apiCallStats } from '../setup.integration';

/**
 * Check if an API is available (has env var set)
 */
export function isApiAvailable(api: 'mapbox' | 'grok' | 'shovels' | 'rentcast' | 'skipTrace' | 'supabase' | 'census'): boolean {
  const envVars = {
    mapbox: 'NEXT_PUBLIC_MAPBOX_TOKEN',
    grok: 'XAI_API_KEY',
    shovels: 'SHOVELS_API_KEY',
    rentcast: 'RENTCAST_API_KEY',
    skipTrace: 'SKIP_TRACE_API_KEY',
    supabase: 'NEXT_PUBLIC_SUPABASE_URL',
    census: 'NEXT_PUBLIC_SUPABASE_URL', // Census uses internal API, just need app running
  } as const;
  const envVar = envVars[api];
  return !!process.env[envVar];
}

/**
 * Skip test if API is not available
 * Returns true if API is NOT available (test should skip)
 */
export function skipIfNoApi(api: 'mapbox' | 'grok' | 'shovels' | 'rentcast' | 'skipTrace' | 'supabase' | 'census'): boolean {
  if (!isApiAvailable(api)) {
    console.log(`⚠️  Skipping test - ${api} API not configured`);
    return true;
  }
  return false;
}

/**
 * Check if any required API is available for running tests
 */
export function hasAnyApi(): boolean {
  return isApiAvailable('mapbox') || isApiAvailable('grok');
}

/**
 * Track API call for stats
 */
export function trackApiCall(api: keyof typeof apiCallStats): void {
  apiCallStats[api]++;
  apiCallStats.total++;
}

/**
 * Retry wrapper for flaky API calls
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    delayMs?: number;
    backoff?: boolean;
  } = {}
): Promise<T> {
  const { maxRetries = 3, delayMs = 1000, backoff = true } = options;
  
  let lastError: Error | undefined;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on validation errors
      if (lastError.message.includes('validation') || 
          lastError.message.includes('invalid')) {
        throw lastError;
      }
      
      if (attempt < maxRetries) {
        const delay = backoff ? delayMs * attempt : delayMs;
        console.log(`  ↻ Retry ${attempt}/${maxRetries} after ${delay}ms...`);
        await sleep(delay);
      }
    }
  }
  
  throw lastError;
}

/**
 * Sleep helper
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Rate limiter to avoid hitting API limits
 */
const rateLimiters: Record<string, number> = {};

export async function rateLimit(api: string, minDelayMs: number = 100): Promise<void> {
  const lastCall = rateLimiters[api] || 0;
  const elapsed = Date.now() - lastCall;
  
  if (elapsed < minDelayMs) {
    await sleep(minDelayMs - elapsed);
  }
  
  rateLimiters[api] = Date.now();
}

/**
 * Assert that a result contains expected data patterns
 */
export function assertValidMapboxResponse(result: unknown): void {
  if (!result || typeof result !== 'object') {
    throw new Error('Expected Mapbox response to be an object');
  }
}

export function assertValidGrokResponse(result: unknown): void {
  if (!result || typeof result !== 'object') {
    throw new Error('Expected Grok response to be an object');
  }
}

// Backwards compatibility alias
export const assertValidClaudeResponse = assertValidGrokResponse;

/**
 * Test data generators for live API tests
 */
export const testLocations = {
  miami: { lat: 25.7617, lng: -80.1918, name: 'Miami, FL' },
  losAngeles: { lat: 34.0522, lng: -118.2437, name: 'Los Angeles, CA' },
  newYork: { lat: 40.7128, lng: -74.0060, name: 'New York, NY' },
  chicago: { lat: 41.8781, lng: -87.6298, name: 'Chicago, IL' },
  houston: { lat: 29.7604, lng: -95.3698, name: 'Houston, TX' },
};

export const testPropertyIds = [
  'test-prop-001',
  'test-prop-002',
  'test-prop-003',
];

export const testDealInputs = {
  standard: {
    propertyId: 'test-prop-001',
    askingPrice: 350000,
    arv: 450000,
    repairCost: 50000,
  },
  luxury: {
    propertyId: 'test-prop-002',
    askingPrice: 1200000,
    arv: 1500000,
    repairCost: 150000,
  },
};

