/**
 * AI Tools Test Suite Setup
 *
 * Configures the test environment for AI tool testing with:
 * - Real API connections (Mapbox, Shovels, RentCast, Supabase, xAI)
 * - Mocked Skip Trace (no live API available)
 * - API call tracking and statistics
 * - Test data seeding
 *
 * MODEL SELECTION STRATEGY:
 * - Tests use xAI Grok 4.1 Fast (grok-4-1-fast-non-reasoning) by default for tool selection tests
 * - This is a deliberate choice for balance between speed and capability
 * - Model routing tests in model-selection.test.ts explicitly test Reasoning/Fast/Standard routing
 * - Other test files use Fast for consistency and cost-effectiveness
 *
 * GROK 4.1 MODEL IDENTIFIERS:
 * - Reasoning (High tier): grok-4-1-fast-reasoning (2M context)
 * - Fast (Medium tier):    grok-4-1-fast-non-reasoning (2M context)
 * - Standard (Low tier):   grok-4-1-fast-non-reasoning (2M context, full capabilities)
 *
 * Updated December 2025 - Migrated from Claude to xAI Grok
 */

import { vi, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type { PermissionLevel } from '@/lib/ai/tools/types';

// ============================================================================
// ENVIRONMENT VALIDATION
// ============================================================================

const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_MAPBOX_TOKEN',
  'XAI_API_KEY',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
];

const OPTIONAL_ENV_VARS = [
  'SUPABASE_SECRET_KEY',
  'SHOVELS_API_KEY',
  'RENTCAST_API_KEY',
];

// ============================================================================
// API CALL TRACKING
// ============================================================================

export const apiCallStats = {
  mapbox: { calls: 0, errors: 0, totalMs: 0 },
  grok: { calls: 0, errors: 0, totalMs: 0, tokens: 0 },
  shovels: { calls: 0, errors: 0, totalMs: 0 },
  rentcast: { calls: 0, errors: 0, totalMs: 0 },
  supabase: { calls: 0, errors: 0, totalMs: 0 },
  skipTrace: { calls: 0, errors: 0, totalMs: 0 }, // Mocked
};

export function trackApiCall(
  api: keyof typeof apiCallStats,
  durationMs: number,
  error?: boolean,
  tokens?: number
): void {
  apiCallStats[api].calls++;
  apiCallStats[api].totalMs += durationMs;
  if (error) apiCallStats[api].errors++;
  if (tokens && api === 'grok') {
    (apiCallStats.grok as { tokens: number }).tokens += tokens;
  }
}

export function resetApiStats(): void {
  Object.keys(apiCallStats).forEach(key => {
    const k = key as keyof typeof apiCallStats;
    apiCallStats[k].calls = 0;
    apiCallStats[k].errors = 0;
    apiCallStats[k].totalMs = 0;
  });
  apiCallStats.grok.tokens = 0;
}

export function printApiStats(): void {
  console.log('\n📊 API Call Statistics:');
  Object.entries(apiCallStats).forEach(([api, stats]) => {
    if (stats.calls > 0) {
      const avgMs = stats.calls > 0 ? Math.round(stats.totalMs / stats.calls) : 0;
      console.log(`  ${api}: ${stats.calls} calls, ${stats.errors} errors, avg ${avgMs}ms`);
      if (api === 'grok' && 'tokens' in stats) {
        console.log(`    tokens: ${(stats as { tokens: number }).tokens}`);
      }
    }
  });
}

// ============================================================================
// SUPABASE CLIENT
// ============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const testSupabase = supabaseUrl && supabaseKey
  ? createClient<Database>(supabaseUrl, supabaseKey)
  : null;

// ============================================================================
// SKIP TRACE MOCKING (Only service without live API)
// ============================================================================

vi.mock('@/lib/skip-trace/client', () => ({
  skipTraceClient: {
    lookup: vi.fn().mockImplementation(async (input: { name?: string; address?: string }) => {
      trackApiCall('skipTrace', 50);
      return {
        success: true,
        data: {
          id: `trace-${Date.now()}`,
          status: 'complete',
          subject: {
            firstName: input.name?.split(' ')[0] || 'John',
            lastName: input.name?.split(' ')[1] || 'Doe',
          },
          phones: [
            { number: '+1-305-555-1234', type: 'mobile', confidence: 0.95 },
            { number: '+1-305-555-5678', type: 'landline', confidence: 0.85 },
          ],
          emails: [
            { address: 'test@example.com', type: 'personal', confidence: 0.92 },
          ],
          addresses: [
            { street: input.address || '123 Main St', city: 'Miami', state: 'FL', zip: '33101' },
          ],
        },
        creditsUsed: 1,
        creditsRemaining: 999,
      };
    }),
    validatePhone: vi.fn().mockResolvedValue({
      success: true,
      data: { valid: true, type: 'mobile', carrier: 'Verizon' },
    }),
    validateEmail: vi.fn().mockResolvedValue({
      success: true,
      data: { valid: true, deliverable: true },
    }),
    getCredits: vi.fn().mockResolvedValue({
      available: 999,
      used: 1,
      total: 1000,
    }),
  },
}));

// ============================================================================
// SUPABASE SERVER MOCK (Bypass cookies requirement)
// ============================================================================

vi.mock('@/lib/supabase/server', async () => {
  return {
    createClient: vi.fn().mockResolvedValue(testSupabase),
    createAdminClient: vi.fn().mockReturnValue(testSupabase),
  };
});

// ============================================================================
// SUPABASE CLIENT MOCK (Bypass browser requirement)
// ============================================================================

vi.mock('@/lib/supabase/client', async () => {
  return {
    createClient: vi.fn().mockReturnValue(testSupabase),
    createBrowserClient: vi.fn().mockReturnValue(testSupabase),
  };
});

// ============================================================================
// TEST LIFECYCLE HOOKS
// ============================================================================

beforeAll(() => {
  console.log('\n🧪 AI Tools Test Suite');
  console.log('======================\n');
  
  // Validate environment
  const missing: string[] = [];
  const present: string[] = [];
  
  REQUIRED_ENV_VARS.forEach(v => {
    if (process.env[v]) present.push(v);
    else missing.push(v);
  });
  
  console.log('Required Environment Variables:');
  present.forEach(v => console.log(`  ✅ ${v}`));
  missing.forEach(v => console.log(`  ❌ ${v}`));
  
  console.log('\nOptional Environment Variables:');
  OPTIONAL_ENV_VARS.forEach(v => {
    console.log(`  ${process.env[v] ? '✅' : '⚠️ '} ${v}`);
  });
  
  if (missing.length > 0) {
    console.warn('\n⚠️  Some required env vars missing - tests may fail');
  }
  
  console.log('\n🚀 Starting AI tools tests with REAL APIs (xAI Grok)...\n');
  console.log('   (Skip Trace is MOCKED - no live API available)\n');
});

afterAll(() => {
  console.log('\n📊 API Call Statistics');
  console.log('======================');

  Object.entries(apiCallStats).forEach(([api, stats]) => {
    const avgMs = stats.calls > 0 ? Math.round(stats.totalMs / stats.calls) : 0;
    const errorRate = stats.calls > 0 ? Math.round((stats.errors / stats.calls) * 100) : 0;
    console.log(`  ${api.padEnd(12)} ${stats.calls} calls, ${avgMs}ms avg, ${errorRate}% errors`);
  });

  if (apiCallStats.grok.tokens > 0) {
    console.log(`\n  Grok tokens used: ${apiCallStats.grok.tokens}`);
  }

  console.log('\n');
});

beforeEach(() => {
  // Reset any per-test state if needed
});

afterEach(() => {
  // Clean up after each test if needed
});

// ============================================================================
// TEST UTILITIES
// ============================================================================

// Test user email that matches the seeded data
export const TEST_USER_EMAIL = 'ai-test@example.com';

// Default test user ID - will be populated by getTestUserId() if available
// This matches the seeded test user in the database
let cachedTestUserId: string | null = null;

export const TEST_SESSION_ID = 'test-session-ai-tools';

/**
 * Get the test user ID from the database (cached after first call)
 * Falls back to a valid UUID format if database is unavailable
 */
export async function getTestUserId(): Promise<string> {
  if (cachedTestUserId) {
    return cachedTestUserId;
  }

  if (testSupabase) {
    try {
      const { data, error } = await testSupabase
        .from('user_profiles')
        .select('id')
        .eq('email', TEST_USER_EMAIL)
        .single();

      if (!error && data?.id) {
        cachedTestUserId = data.id;
        console.log(`[Test Setup] Found seeded test user: ${cachedTestUserId}`);
        return cachedTestUserId;
      }
    } catch (e) {
      console.log('[Test Setup] Could not fetch test user from database');
    }
  }

  // Fallback to valid UUID format if database unavailable
  cachedTestUserId = '00000000-0000-0000-0000-000000000000';
  console.log('[Test Setup] Using fallback test user ID');
  return cachedTestUserId;
}

// For synchronous access - use getTestUserId() for async contexts
export const TEST_USER_ID = '827d4b30-542d-4943-9c28-a16977aab13b'; // Seeded test user

/**
 * Create a test context with properly typed permissions
 */
export function createTestContext(overrides?: Record<string, unknown>) {
  const permissions: PermissionLevel[] = ['read', 'write', 'execute', 'admin'];
  return {
    userId: TEST_USER_ID,
    sessionId: TEST_SESSION_ID,
    permissions,
    vertical: 'residential',
    ...overrides,
  };
}

/**
 * Create a test context with async user ID lookup
 */
export async function createTestContextAsync(overrides?: Record<string, unknown>) {
  const userId = await getTestUserId();
  const permissions: PermissionLevel[] = ['read', 'write', 'execute', 'admin'];
  return {
    userId,
    sessionId: TEST_SESSION_ID,
    permissions,
    vertical: 'residential',
    ...overrides,
  };
}

/**
 * Helper to wrap API calls and track timing
 */
export async function withApiTracking<T>(
  api: keyof typeof apiCallStats,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    trackApiCall(api, performance.now() - start);
    return result;
  } catch (error) {
    trackApiCall(api, performance.now() - start, true);
    throw error;
  }
}

export function isApiAvailable(api: 'mapbox' | 'grok' | 'shovels' | 'rentcast' | 'supabase'): boolean {
  const envVars = {
    mapbox: 'NEXT_PUBLIC_MAPBOX_TOKEN',
    grok: 'XAI_API_KEY',
    shovels: 'SHOVELS_API_KEY',
    rentcast: 'RENTCAST_API_KEY',
    supabase: 'NEXT_PUBLIC_SUPABASE_URL',
  } as const;
  const envVar = envVars[api];
  return !!process.env[envVar];
}

export function skipIfNoApi(api: 'mapbox' | 'grok' | 'shovels' | 'rentcast' | 'supabase'): boolean {
  if (!isApiAvailable(api)) {
    console.log(`⚠️  Skipping - ${api} API not configured`);
    return true;
  }
  return false;
}

// Increase vitest timeout for AI operations
vi.setConfig({
  testTimeout: 180000,
  hookTimeout: 60000,
});

