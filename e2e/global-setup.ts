/**
 * Playwright Global Setup
 * Runs once before all tests
 */

import { FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('\n--- Playwright E2E Test Setup ---');
  console.log(`Base URL: ${config.projects[0]?.use?.baseURL || 'http://localhost:3000'}`);
  console.log(`Projects: ${config.projects.map((p) => p.name).join(', ')}`);

  // You can add authentication setup here
  // For example, logging in once and saving the auth state

  // Environment checks
  const requiredEnvVars = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'];

  const missing = requiredEnvVars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    console.warn(`\nWarning: Missing env vars: ${missing.join(', ')}`);
    console.warn('Some E2E tests may fail or be skipped.\n');
  }

  console.log('--- Setup Complete ---\n');
}

export default globalSetup;
