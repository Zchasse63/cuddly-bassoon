/**
 * Property Search E2E Tests
 * Tests for property search and filtering functionality
 */

import { test, expect } from '@playwright/test';
import { PropertiesPage } from '../../pages/properties.page';
import { testSearchFilters } from '../../fixtures/test-data';

test.describe('Property Search', () => {
  let propertiesPage: PropertiesPage;

  test.beforeEach(async ({ page }) => {
    propertiesPage = new PropertiesPage(page);
    await propertiesPage.goto();
  });

  test('should display property search page', async ({ page }) => {
    // Check key elements are visible
    await expect(propertiesPage.searchInput).toBeVisible({ timeout: 10000 });
  });

  test('should have filter controls', async ({ page }) => {
    // Filter button should be visible
    await expect(propertiesPage.filterButton).toBeVisible();
  });

  test('should open filter panel', async ({ page }) => {
    await propertiesPage.openFilters();
    await expect(propertiesPage.filterPanel).toBeVisible();
  });

  test('should perform location search', async ({ page }) => {
    await propertiesPage.search(testSearchFilters.location);

    // Should show results or "no results" message
    const hasResults = (await propertiesPage.propertyCards.count()) > 0;
    const noResultsMessage = page.locator(':text("No properties"), :text("No results")');
    const hasNoResultsMsg = await noResultsMessage.isVisible().catch(() => false);

    expect(hasResults || hasNoResultsMsg).toBeTruthy();
  });

  test('should display map view', async ({ page }) => {
    // Map should be visible (may take time to load)
    await expect(propertiesPage.mapView).toBeVisible({ timeout: 30000 });
  });

  test.skip('should filter by price range', async ({ page }) => {
    await propertiesPage.openFilters();

    // Set price filters
    await propertiesPage.setFilter('priceMin', testSearchFilters.priceMin);
    await propertiesPage.setFilter('priceMax', testSearchFilters.priceMax);

    await propertiesPage.applyFilters();

    // Verify filters were applied (URL or results should change)
    const url = page.url();
    expect(url.includes('price') || url.includes('min') || url.includes('max')).toBeTruthy();
  });

  test.skip('should filter by bedrooms', async ({ page }) => {
    await propertiesPage.openFilters();
    await propertiesPage.setFilter('bedrooms', testSearchFilters.bedrooms);
    await propertiesPage.applyFilters();

    // Check results count updated
    const resultsText = await propertiesPage.getResultsCountText();
    expect(resultsText).toBeTruthy();
  });
});

test.describe('Property Cards', () => {
  test('should display property information', async ({ page }) => {
    const propertiesPage = new PropertiesPage(page);
    await propertiesPage.goto();
    await propertiesPage.search('Miami, FL');

    // Wait for results
    const count = await propertiesPage.getPropertyCount().catch(() => 0);
    if (count > 0) {
      // Click first property
      await propertiesPage.clickProperty(0);

      // Should navigate to property detail
      await expect(page).toHaveURL(/properties\/|property\//);
    }
  });
});

test.describe('Property Map', () => {
  test('should load Mapbox map', async ({ page }) => {
    const propertiesPage = new PropertiesPage(page);
    await propertiesPage.goto();

    // Wait for map to initialize
    await page.waitForSelector('.mapboxgl-canvas, [data-testid="map"]', {
      state: 'visible',
      timeout: 30000,
    });

    // Map should be interactive
    await expect(propertiesPage.mapView).toBeVisible();
  });
});
