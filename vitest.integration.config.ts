import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import path from 'path';

/**
 * Integration Test Configuration
 *
 * Runs tests against REAL APIs (Mapbox, Shovels, Rankcast, Claude, Supabase, etc.)
 * Requires proper environment variables to be set in .env.local
 *
 * Usage: npm run test:live
 */
export default defineConfig(({ mode }) => {
  // Load env from .env.local (loads all vars, not just VITE_ prefixed)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    test: {
      globals: true,
      environment: 'node',
      include: ['src/lib/ai/tools/__tests__/integration/**/*.test.ts'],
      exclude: ['node_modules', '.next', 'dist'],
      setupFiles: ['./src/test/setup.integration.ts'],
      // Longer timeouts for real API calls
      testTimeout: 120000, // 2 minutes per test
      hookTimeout: 60000,  // 1 minute for hooks
      // Run tests sequentially to avoid rate limiting
      pool: 'forks',
      poolOptions: {
        forks: {
          singleFork: true,
        },
      },
      // Retry flaky tests (network issues)
      retry: 1,
      // Bail on first failure for faster feedback
      bail: 1,
      // Make env vars available
      env,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});

