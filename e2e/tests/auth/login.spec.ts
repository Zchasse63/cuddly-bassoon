/**
 * Login E2E Tests
 * Tests for authentication flows
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { TEST_USER } from '../../fixtures/auth';

test.describe('Login Page', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('should display login form', async ({ page }) => {
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await loginPage.login('invalid@email.com', 'wrongpassword');

    // Wait for error message
    await expect(loginPage.errorMessage).toBeVisible({ timeout: 10000 });
  });

  test('should show error for empty form submission', async ({ page }) => {
    await loginPage.submitButton.click();

    // Should show validation error
    const emailError = page.locator(':text("email"), :text("required")');
    await expect(emailError.first()).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to forgot password', async ({ page }) => {
    await loginPage.forgotPasswordLink.click();
    await expect(page).toHaveURL(/forgot-password/);
  });

  test('should navigate to sign up page', async ({ page }) => {
    if (await loginPage.signUpLink.isVisible()) {
      await loginPage.signUpLink.click();
      await expect(page).toHaveURL(/sign-up|register/);
    }
  });

  test.skip('should login with valid credentials', async ({ page }) => {
    // Skip this test if no test credentials are configured
    if (!process.env.E2E_TEST_EMAIL || !process.env.E2E_TEST_PASSWORD) {
      test.skip();
      return;
    }

    await loginPage.login(TEST_USER.email, TEST_USER.password);
    await loginPage.waitForLogin();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/dashboard|properties|search/);
  });
});

test.describe('Authentication State', () => {
  test('should redirect unauthenticated users from protected routes', async ({ page }) => {
    // Try to access protected route without auth
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL(/login/);
  });

  test('should redirect unauthenticated users from deals page', async ({ page }) => {
    await page.goto('/deals');
    await expect(page).toHaveURL(/login/);
  });

  test('should redirect unauthenticated users from properties page', async ({ page }) => {
    await page.goto('/properties');
    // May redirect to login or show limited view
    // Check if redirected OR if login prompt is shown
    const isOnLogin = page.url().includes('login');
    const hasLoginPrompt = await page.locator('a:has-text("Login"), button:has-text("Sign in")').isVisible().catch(() => false);
    expect(isOnLogin || hasLoginPrompt).toBeTruthy();
  });
});
