/**
 * AI Tools Test Suite Configuration
 * 
 * Specialized configuration for testing AI tool selection, model routing,
 * and tool execution against REAL APIs.
 * 
 * Usage: npx vitest --config src/test/ai-tools/vitest.ai-tools.config.ts
 */

import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    test: {
      globals: true,
      environment: 'node',
      include: ['src/test/ai-tools/**/*.test.ts'],
      exclude: ['node_modules', '.next', 'dist'],
      setupFiles: ['./src/test/ai-tools/setup.ts'],
      
      // Extended timeouts for AI/API calls
      testTimeout: 180000, // 3 minutes per test (AI can be slow)
      hookTimeout: 60000,  // 1 minute for hooks
      
      // Sequential execution to avoid rate limiting
      pool: 'forks',
      poolOptions: {
        forks: {
          singleFork: true,
        },
      },
      
      // Retry for network flakiness
      retry: 2,
      
      // Continue on failure to get full test report
      bail: 0,
      
      // Make env vars available
      env,
      
      // Reporter configuration
      reporters: ['verbose', 'html'],
      outputFile: {
        html: './test-results/ai-tools-report.html',
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '../../../src'),
      },
    },
  };
});

