/**
 * Integration Test Setup
 * 
 * Sets up the environment for live API testing.
 * Validates required environment variables are present.
 */

import { vi, beforeAll, afterAll } from 'vitest';

// Required environment variables for live API testing
const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN',
  'XAI_API_KEY',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', // Or SUPABASE_SECRET_KEY for full access
];

const OPTIONAL_ENV_VARS = [
  'SHOVELS_API_KEY',
  'RENTCAST_API_KEY',
  'SKIP_TRACE_API_KEY', // Skip trace remains mocked
];

// Track API call stats
export const apiCallStats = {
  mapbox: 0,
  grok: 0,
  shovels: 0,
  rankcast: 0,
  supabase: 0,
  total: 0,
};

// Validate environment on setup
beforeAll(() => {
  console.log('\n🔌 Integration Test Setup');
  console.log('========================\n');
  
  // Check required env vars
  const missing: string[] = [];
  const present: string[] = [];
  
  for (const envVar of REQUIRED_ENV_VARS) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    } else {
      present.push(envVar);
    }
  }
  
  // Check optional env vars
  const optionalStatus: string[] = [];
  for (const envVar of OPTIONAL_ENV_VARS) {
    if (process.env[envVar]) {
      optionalStatus.push(`✅ ${envVar}`);
    } else {
      optionalStatus.push(`⚠️  ${envVar} (not set - some tests will be skipped)`);
    }
  }
  
  console.log('Required Environment Variables:');
  present.forEach(v => console.log(`  ✅ ${v}`));
  missing.forEach(v => console.log(`  ❌ ${v}`));
  
  console.log('\nOptional Environment Variables:');
  optionalStatus.forEach(s => console.log(`  ${s}`));
  
  if (missing.length > 0) {
    console.warn('\n⚠️  Missing environment variables (some tests will skip):');
    missing.forEach(v => console.warn(`   - ${v}`));
    console.log('\nSet these in your .env.local file for full test coverage.');
  } else {
    console.log('\n✅ All required environment variables present');
  }

  console.log('🚀 Starting live API tests against REAL services...\n');
});

// Report stats after all tests
afterAll(() => {
  console.log('\n📊 API Call Statistics');
  console.log('======================');
  console.log(`  Mapbox:   ${apiCallStats.mapbox} calls`);
  console.log(`  Grok:     ${apiCallStats.grok} calls`);
  console.log(`  Shovels:  ${apiCallStats.shovels} calls`);
  console.log(`  Rankcast: ${apiCallStats.rankcast} calls`);
  console.log(`  Supabase: ${apiCallStats.supabase} calls`);
  console.log(`  ─────────────────────`);
  console.log(`  Total:    ${apiCallStats.total} calls\n`);
});

// Mock ONLY skip trace (no live API available for this service)
vi.mock('@/lib/skip-trace/client', () => ({
  skipTraceClient: {
    lookup: vi.fn().mockResolvedValue({
      success: true,
      data: {
        phones: [{ number: '555-123-4567', type: 'mobile', score: 95 }],
        emails: [{ email: 'test@example.com', score: 85 }],
        addresses: [],
      },
    }),
    getCredits: vi.fn().mockResolvedValue({
      remaining: 1000,
      used: 50,
      limit: 1050,
    }),
  },
}));

// Use real Supabase client for tests (bypasses cookies requirement)
// The server client uses cookies() which doesn't work in Vitest
// Instead, we redirect to use a direct client with secret/publishable key
vi.mock('@/lib/supabase/server', async () => {
  const { createClient } = await import('@supabase/supabase-js');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Try secret key first (full access), fall back to publishable key
  const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️  Supabase env vars not set - database tests will fail');
  }

  const client = supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null;

  return {
    createClient: vi.fn().mockResolvedValue(client),
  };
});

// Increase timeout for slow API calls
vi.setConfig({
  testTimeout: 120000,
  hookTimeout: 60000,
});

