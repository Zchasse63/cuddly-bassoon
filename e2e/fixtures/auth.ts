/**
 * Authentication Fixtures
 * Test fixtures for handling auth state in E2E tests
 */

import { test as base, Page } from '@playwright/test';

// Test user credentials (use test/development credentials)
export const TEST_USER = {
  email: process.env.E2E_TEST_EMAIL || 'test@example.com',
  password: process.env.E2E_TEST_PASSWORD || 'testpassword123',
};

// Extend base test with auth fixtures
export const test = base.extend<{
  authenticatedPage: Page;
}>({
  authenticatedPage: async ({ page }, use) => {
    // Navigate to login
    await page.goto('/login');

    // Fill in credentials
    await page.fill('input[name="email"], input[type="email"]', TEST_USER.email);
    await page.fill('input[name="password"], input[type="password"]', TEST_USER.password);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL(/\/(dashboard|properties|deals)/, { timeout: 10000 });

    await use(page);
  },
});

export { expect } from '@playwright/test';

/**
 * Helper to login programmatically (for tests that need fresh auth)
 */
export async function login(page: Page, email?: string, password?: string) {
  await page.goto('/login');
  await page.fill('input[name="email"], input[type="email"]', email || TEST_USER.email);
  await page.fill('input[name="password"], input[type="password"]', password || TEST_USER.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(dashboard|properties|deals)/, { timeout: 10000 });
}

/**
 * Helper to logout
 */
export async function logout(page: Page) {
  // Look for logout button or link
  const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout"), [data-testid="logout"]');
  if (await logoutButton.isVisible()) {
    await logoutButton.click();
    await page.waitForURL('/login');
  }
}
