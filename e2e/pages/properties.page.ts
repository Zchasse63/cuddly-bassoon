/**
 * Properties Page Object Model
 * Encapsulates property search and listing interactions
 */

import { Page, Locator } from '@playwright/test';

export class PropertiesPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly filterButton: Locator;
  readonly filterPanel: Locator;
  readonly propertyCards: Locator;
  readonly mapView: Locator;
  readonly listView: Locator;
  readonly sortDropdown: Locator;
  readonly resultsCount: Locator;
  readonly pagination: Locator;
  readonly loadingSpinner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.locator(
      'input[placeholder*="search" i], input[placeholder*="address" i], [data-testid="search-input"]'
    );
    this.filterButton = page.locator(
      'button:has-text("Filter"), button:has-text("Filters"), [data-testid="filter-button"]'
    );
    this.filterPanel = page.locator('[data-testid="filter-panel"], .filter-panel, .filter-sidebar');
    this.propertyCards = page.locator(
      '[data-testid="property-card"], .property-card, .property-item'
    );
    this.mapView = page.locator('[data-testid="map-view"], .map-container, #map');
    this.listView = page.locator('[data-testid="list-view"], .property-list');
    this.sortDropdown = page.locator('[data-testid="sort"], select:has-text("Sort")');
    this.resultsCount = page.locator('[data-testid="results-count"], .results-count');
    this.pagination = page.locator('[data-testid="pagination"], .pagination');
    this.loadingSpinner = page.locator('.loading, .spinner, [data-testid="loading"]');
  }

  async goto() {
    await this.page.goto('/properties');
  }

  async search(query: string) {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
    await this.waitForResults();
  }

  async waitForResults() {
    // Wait for loading to complete
    await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {});
    // Wait for property cards to appear
    await this.propertyCards.first().waitFor({ state: 'visible', timeout: 30000 });
  }

  async openFilters() {
    await this.filterButton.click();
    await this.filterPanel.waitFor({ state: 'visible' });
  }

  async setFilter(filterName: string, value: string | number) {
    const filterInput = this.filterPanel.locator(
      `input[name="${filterName}"], select[name="${filterName}"], [data-testid="filter-${filterName}"]`
    );
    if ((await filterInput.getAttribute('type')) === 'checkbox') {
      await filterInput.check();
    } else {
      await filterInput.fill(String(value));
    }
  }

  async applyFilters() {
    await this.filterPanel.locator('button:has-text("Apply"), button[type="submit"]').click();
    await this.waitForResults();
  }

  async getPropertyCount() {
    return this.propertyCards.count();
  }

  async clickProperty(index: number) {
    await this.propertyCards.nth(index).click();
  }

  async getResultsCountText() {
    return this.resultsCount.textContent();
  }

  async sortBy(option: string) {
    await this.sortDropdown.selectOption({ label: option });
    await this.waitForResults();
  }
}
