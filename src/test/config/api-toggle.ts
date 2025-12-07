/**
 * API Mock/Live Toggle System
 *
 * Controls whether tests use mocked or live APIs.
 * Single env var controls all services: TEST_MODE=mock|live|hybrid
 * Per-service overrides available via TEST_LIVE_<SERVICE>=true
 *
 * Usage:
 *   TEST_MODE=mock npm run test:unit    # All mocked (fast CI)
 *   TEST_MODE=live npm run test:live    # All live (where API keys exist)
 *   TEST_MODE=hybrid npm run test:live  # Per-service control
 *
 * In hybrid mode, enable specific services:
 *   TEST_LIVE_MAPBOX=true
 *   TEST_LIVE_SUPABASE=true
 *   etc.
 */

export type TestMode = 'mock' | 'live' | 'hybrid';

export type ServiceName =
  | 'mapbox'
  | 'shovels'
  | 'rentcast'
  | 'xai'
  | 'supabase'
  | 'census'
  | 'twilio'
  | 'sendgrid'
  | 'skipTrace';

// Services that are ALWAYS mocked (cost money, send real messages, or no live API)
const ALWAYS_MOCKED: ServiceName[] = ['twilio', 'sendgrid', 'skipTrace'];

// Services that CAN use live APIs when available
const LIVE_TESTABLE: ServiceName[] = [
  'mapbox',
  'shovels',
  'rentcast',
  'xai',
  'supabase',
  'census',
];

// Environment variable names for each service's API key
const API_KEY_ENV_VARS: Record<ServiceName, string> = {
  mapbox: 'NEXT_PUBLIC_MAPBOX_TOKEN',
  shovels: 'SHOVELS_API_KEY',
  rentcast: 'RENTCAST_API_KEY',
  xai: 'XAI_API_KEY',
  supabase: 'NEXT_PUBLIC_SUPABASE_URL',
  census: 'CENSUS_API_KEY',
  twilio: 'TWILIO_ACCOUNT_SID',
  sendgrid: 'SENDGRID_API_KEY',
  skipTrace: 'SKIP_TRACE_API_KEY',
};

/**
 * Get the current test mode from environment
 */
export function getTestMode(): TestMode {
  const mode = process.env.TEST_MODE as TestMode;
  if (mode === 'live' || mode === 'hybrid') {
    return mode;
  }
  return 'mock'; // Default to mock mode
}

/**
 * Check if a service has its API key configured
 */
export function hasApiKey(service: ServiceName): boolean {
  const envVar = API_KEY_ENV_VARS[service];
  return !!process.env[envVar];
}

/**
 * Determine if a service should use live API
 *
 * Logic:
 * - Always-mocked services (Twilio, SendGrid, SkipTrace) always return false
 * - In 'mock' mode: everything is mocked
 * - In 'live' mode: use live if API key exists
 * - In 'hybrid' mode: check per-service TEST_LIVE_<SERVICE>=true
 */
export function shouldUseLiveApi(service: ServiceName): boolean {
  // Always-mocked services never use live
  if (ALWAYS_MOCKED.includes(service)) {
    return false;
  }

  const mode = getTestMode();

  // Mock mode: everything mocked (except pure functions)
  if (mode === 'mock') {
    return false;
  }

  // Live mode: everything live if API key exists
  if (mode === 'live') {
    return hasApiKey(service);
  }

  // Hybrid mode: check per-service override
  const envOverride = process.env[`TEST_LIVE_${service.toUpperCase()}`];
  return envOverride === 'true' && hasApiKey(service);
}

/**
 * Check if a service is always mocked (Twilio, SendGrid, SkipTrace)
 */
export function isAlwaysMocked(service: ServiceName): boolean {
  return ALWAYS_MOCKED.includes(service);
}

/**
 * Check if a service can potentially use live APIs
 */
export function isLiveTestable(service: ServiceName): boolean {
  return LIVE_TESTABLE.includes(service);
}

/**
 * Get the status of all services (for logging/debugging)
 */
export function getServiceStatus(): Record<ServiceName, 'mock' | 'live'> {
  const services = [...ALWAYS_MOCKED, ...LIVE_TESTABLE] as ServiceName[];
  return services.reduce(
    (acc, service) => {
      acc[service] = shouldUseLiveApi(service) ? 'live' : 'mock';
      return acc;
    },
    {} as Record<ServiceName, 'mock' | 'live'>
  );
}

/**
 * Get list of services that are currently using live APIs
 */
export function getLiveServices(): ServiceName[] {
  return [...ALWAYS_MOCKED, ...LIVE_TESTABLE].filter((service) =>
    shouldUseLiveApi(service as ServiceName)
  ) as ServiceName[];
}

/**
 * Get list of services that are currently mocked
 */
export function getMockedServices(): ServiceName[] {
  return [...ALWAYS_MOCKED, ...LIVE_TESTABLE].filter(
    (service) => !shouldUseLiveApi(service as ServiceName)
  ) as ServiceName[];
}

/**
 * Log the current test configuration (useful in setup files)
 */
export function logTestConfiguration(): void {
  const mode = getTestMode();
  const status = getServiceStatus();

  console.log('\n=== Test Configuration ===');
  console.log(`Mode: ${mode.toUpperCase()}`);
  console.log('\nService Status:');

  Object.entries(status).forEach(([service, state]) => {
    const hasKey = hasApiKey(service as ServiceName);
    const keyStatus = hasKey ? '✓ key' : '✗ no key';
    const emoji = state === 'live' ? '🌐' : '🎭';
    console.log(`  ${emoji} ${service}: ${state} (${keyStatus})`);
  });

  console.log('========================\n');
}

/**
 * Assert that required API keys are present for live testing
 * Throws if any required services don't have API keys in live/hybrid mode
 */
export function assertRequiredApiKeys(requiredServices: ServiceName[]): void {
  const mode = getTestMode();
  if (mode === 'mock') {
    return; // No API keys needed in mock mode
  }

  const missing = requiredServices.filter(
    (service) => !hasApiKey(service) && !isAlwaysMocked(service)
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing API keys for live testing: ${missing.join(', ')}\n` +
        `Required environment variables:\n` +
        missing.map((s) => `  - ${API_KEY_ENV_VARS[s]}`).join('\n')
    );
  }
}
