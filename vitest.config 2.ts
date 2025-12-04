import { defineConfig } from 'vitest/config';
import path from 'path';

/**
 * Unit Test Configuration
 *
 * Runs fast, mocked tests for development and CI.
 * Excludes integration tests (which use real APIs).
 *
 * Usage: npm run test:unit (or npm run test:run)
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    // Exclude integration tests - they run separately with vitest.integration.config.ts
    exclude: [
      'node_modules',
      '.next',
      'dist',
      'src/lib/ai/tools/__tests__/integration/**',
    ],
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/lib/ai/tools/**/*.ts'],
      exclude: ['src/lib/ai/tools/**/*.test.ts', 'node_modules'],
    },
    testTimeout: 30000,
    hookTimeout: 30000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});

