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
    // Navigate to landing page (will show auth modal)
    await page.goto('/');

    // Open login modal (if not already open)
    const loginButton = page.locator('button:has-text("Sign In")').first();
    if (await loginButton.isVisible()) {
      await loginButton.click();
    }

    // Fill in credentials in modal
    await page.fill('input[name="email"], input[type="email"]', TEST_USER.email);
    await page.fill('input[name="password"], input[type="password"]', TEST_USER.password);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for redirect to /properties (new default landing)
    await page.waitForURL(/\/(properties|dashboard|deals)/, { timeout: 10000 });

    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(page);
  },
});

export { expect } from '@playwright/test';

/**
 * Helper to login programmatically (for tests that need fresh auth)
 */
export async function login(page: Page, email?: string, password?: string) {
  await page.goto('/');

  // Open login modal
  const loginButton = page.locator('button:has-text("Sign In")').first();
  if (await loginButton.isVisible()) {
    await loginButton.click();
  }

  await page.fill('input[name="email"], input[type="email"]', email || TEST_USER.email);
  await page.fill('input[name="password"], input[type="password"]', password || TEST_USER.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(properties|dashboard|deals)/, { timeout: 10000 });
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
