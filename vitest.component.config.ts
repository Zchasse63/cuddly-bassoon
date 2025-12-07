import { defineConfig } from 'vitest/config';
import path from 'path';

/**
 * Component Test Configuration
 *
 * Runs React component tests using jsdom environment.
 * Uses @testing-library/react for component testing.
 *
 * Usage: npm run test:components
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.component.test.tsx', 'src/test/components/**/*.test.tsx'],
    exclude: ['node_modules', '.next', 'dist'],
    setupFiles: ['./src/test/components/setup.tsx'],
    testTimeout: 30000,
    hookTimeout: 30000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Redirect map libraries to manual mocks to avoid resolution issues
      'react-map-gl': path.resolve(__dirname, './src/test/mocks/react-map-gl.ts'),
      'mapbox-gl': path.resolve(__dirname, './src/test/mocks/mapbox-gl.ts'),
    },
  },
});
