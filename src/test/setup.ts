/**
 * Vitest Test Setup
 * Global configuration and mocks for all tests
 */

import { vi, beforeAll, afterEach, afterAll } from 'vitest';

// Mock environment variables
process.env.MAPBOX_ACCESS_TOKEN = 'pk.test_mapbox_token';
process.env.SHOVELS_API_KEY = 'test_shovels_api_key';
process.env.SKIP_TRACE_API_KEY = 'test_skip_trace_api_key';
process.env.TWILIO_ACCOUNT_SID = 'test_twilio_sid';
process.env.TWILIO_AUTH_TOKEN = 'test_twilio_token';
process.env.SENDGRID_API_KEY = 'test_sendgrid_key';
process.env.XAI_API_KEY = 'test_xai_key';
process.env.ANTHROPIC_API_KEY = 'test_anthropic_key'; // Legacy

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

