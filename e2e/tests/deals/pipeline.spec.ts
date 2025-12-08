/**
 * Deals Pipeline E2E Tests
 * Tests for deal management and kanban board functionality
 */

import { test, expect } from '@playwright/test';
import { DealsPage } from '../../pages/deals.page';
import { testDeal } from '../../fixtures/test-data';

test.describe('Deals Page', () => {
  let dealsPage: DealsPage;

  test.beforeEach(async ({ page }) => {
    dealsPage = new DealsPage(page);
    await dealsPage.goto();
  });

  test('should display deals page', async ({ page }) => {
    // The page should load (may redirect to login if not authenticated)
    await page.waitForURL(/\/(deals|login)/, { timeout: 15000 });
    
    // If redirected to login, that's expected behavior for unauthenticated users
    const url = page.url();
    if (url.includes('/login')) {
      await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    } else {
      // If on deals page, should see the page structure
      await expect(page).toHaveURL(/\/deals/);
    }
  });

  test('should show create deal button when authenticated', async ({ page }) => {
    await page.waitForURL(/\/(deals|login)/, { timeout: 15000 });
    
    // Skip if not authenticated
    if (page.url().includes('/login')) {
      test.skip();
      return;
    }

    await dealsPage.waitForLoad();
    await expect(dealsPage.createDealButton).toBeVisible();
  });

  test('should display kanban board with columns', async ({ page }) => {
    await page.waitForURL(/\/(deals|login)/, { timeout: 15000 });
    
    if (page.url().includes('/login')) {
      test.skip();
      return;
    }

    await dealsPage.waitForLoad();
    
    // Should have multiple stage columns
    const columnCount = await dealsPage.getColumnCount();
    expect(columnCount).toBeGreaterThan(0);
  });

  test('should have view toggle options', async ({ page }) => {
    await page.waitForURL(/\/(deals|login)/, { timeout: 15000 });
    
    if (page.url().includes('/login')) {
      test.skip();
      return;
    }

    await dealsPage.waitForLoad();
    
    // Look for view toggle buttons (may be icons)
    const hasKanbanToggle = await dealsPage.viewToggleKanban.isVisible().catch(() => false);
    const hasStatsToggle = await dealsPage.viewToggleStats.isVisible().catch(() => false);
    
    // At least one toggle should exist
    expect(hasKanbanToggle || hasStatsToggle).toBeTruthy();
  });
});

test.describe('Create Deal Dialog', () => {
  test('should open create deal dialog', async ({ page }) => {
    const dealsPage = new DealsPage(page);
    await dealsPage.goto();
    await page.waitForURL(/\/(deals|login)/, { timeout: 15000 });
    
    if (page.url().includes('/login')) {
      test.skip();
      return;
    }

    await dealsPage.waitForLoad();
    await dealsPage.openCreateDealDialog();
    
    await expect(dealsPage.createDealDialog).toBeVisible();
  });

  test('should display deal form fields', async ({ page }) => {
    const dealsPage = new DealsPage(page);
    await dealsPage.goto();
    await page.waitForURL(/\/(deals|login)/, { timeout: 15000 });
    
    if (page.url().includes('/login')) {
      test.skip();
      return;
    }

    await dealsPage.waitForLoad();
    await dealsPage.openCreateDealDialog();
    
    // Check for essential form fields
    await expect(dealsPage.propertyAddressInput).toBeVisible();
    await expect(dealsPage.submitButton).toBeVisible();
  });

  test('should close dialog on cancel', async ({ page }) => {
    const dealsPage = new DealsPage(page);
    await dealsPage.goto();
    await page.waitForURL(/\/(deals|login)/, { timeout: 15000 });
    
    if (page.url().includes('/login')) {
      test.skip();
      return;
    }

    await dealsPage.waitForLoad();
    await dealsPage.openCreateDealDialog();
    await expect(dealsPage.createDealDialog).toBeVisible();
    
    await dealsPage.cancelButton.click();
    await expect(dealsPage.createDealDialog).not.toBeVisible();
  });
});

test.describe('Deal Form Validation', () => {
  test('should require property address', async ({ page }) => {
    const dealsPage = new DealsPage(page);
    await dealsPage.goto();
    await page.waitForURL(/\/(deals|login)/, { timeout: 15000 });
    
    if (page.url().includes('/login')) {
      test.skip();
      return;
    }

    await dealsPage.waitForLoad();
    await dealsPage.openCreateDealDialog();
    
    // Try to submit without filling required field
    await dealsPage.submitButton.click();
    
    // Should show validation error or stay on form
    const dialogStillOpen = await dealsPage.createDealDialog.isVisible();
    expect(dialogStillOpen).toBeTruthy();
  });
});

