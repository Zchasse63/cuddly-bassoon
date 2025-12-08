/**
 * Properties Page Object Model
 * Encapsulates property search and listing interactions
 *
 * Updated for split-view layout (map left, list right, horizontal filters)
 */

import { Page, Locator } from '@playwright/test';

export class PropertiesPage {
  readonly page: Page;

  // Horizontal Filter Bar (top)
  readonly searchInput: Locator;
  readonly bedsFilter: Locator;
  readonly priceFilter: Locator;
  readonly equityFilter: Locator;
  readonly moreFiltersButton: Locator;
  readonly sortDropdown: Locator;
  readonly resultsCount: Locator;

  // Split-View Layout
  readonly mapPanel: Locator;
  readonly mapView: Locator;
  readonly listPanel: Locator;
  readonly propertyCards: Locator;

  // Floating AI Dialog
  readonly aiDialogTrigger: Locator;
  readonly aiDialog: Locator;
  readonly aiChatInput: Locator;

  // Legacy selectors (for backward compatibility)
  readonly filterButton: Locator;
  readonly filterPanel: Locator;
  readonly listView: Locator;
  readonly pagination: Locator;
  readonly loadingSpinner: Locator;

  constructor(page: Page) {
    this.page = page;

    // Horizontal Filter Bar
    this.searchInput = page.locator(
      'input[placeholder*="search" i], input[placeholder*="address" i], [data-testid="search-input"]'
    );
    this.bedsFilter = page.locator('[data-testid="beds-filter"], button:has-text("Beds")');
    this.priceFilter = page.locator('[data-testid="price-filter"], button:has-text("Price")');
    this.equityFilter = page.locator('[data-testid="equity-filter"], button:has-text("Equity")');
    this.moreFiltersButton = page.locator('[data-testid="more-filters"], button:has-text("More")');
    this.sortDropdown = page.locator('[data-testid="sort"], select:has-text("Sort")');
    this.resultsCount = page.locator('[data-testid="results-count"], .results-count, :text("properties")');

    // Split-View Layout
    this.mapPanel = page.locator('[data-testid="map-panel"], .map-panel');
    this.mapView = page.locator('[data-testid="map-view"], .map-container, #map, .mapboxgl-canvas');
    this.listPanel = page.locator('[data-testid="list-panel"], .list-panel, .property-list-panel');
    this.propertyCards = page.locator(
      '[data-testid="property-card"], .property-card, .property-card-compact'
    );

    // Floating AI Dialog
    this.aiDialogTrigger = page.locator('[data-testid="ai-dialog-trigger"], button:has-text("Ask AI")');
    this.aiDialog = page.locator('[data-testid="ai-dialog"], [role="dialog"]');
    this.aiChatInput = page.locator('[data-testid="ai-chat-input"], textarea[placeholder*="Ask" i]');

    // Legacy selectors (backward compatibility)
    this.filterButton = page.locator(
      'button:has-text("Filter"), button:has-text("Filters"), [data-testid="filter-button"]'
    );
    this.filterPanel = page.locator('[data-testid="filter-panel"], .filter-panel, .horizontal-filter-bar');
    this.listView = this.listPanel; // Alias
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

  // Legacy method - horizontal filters are always visible
  async openFilters() {
    // Filters are now in horizontal bar (always visible)
    // This method is kept for backward compatibility
    await this.filterPanel.waitFor({ state: 'visible' });
  }

  // New methods for split-view layout
  async openAIDialog() {
    await this.aiDialogTrigger.click();
    await this.aiDialog.waitFor({ state: 'visible' });
  }

  async closeAIDialog() {
    // Press Escape or click close button
    await this.page.keyboard.press('Escape');
    await this.aiDialog.waitFor({ state: 'hidden' });
  }

  async askAI(query: string) {
    await this.openAIDialog();
    await this.aiChatInput.fill(query);
    await this.aiChatInput.press('Enter');
  }

  async clickMapMarker(index: number = 0) {
    const markers = this.mapView.locator('.property-marker, [data-testid="property-marker"]');
    await markers.nth(index).click();
  }

  async hoverPropertyCard(index: number = 0) {
    await this.propertyCards.nth(index).hover();
  }

  async waitForMapLoad() {
    await this.mapView.waitFor({ state: 'visible', timeout: 30000 });
    // Wait for Mapbox to fully initialize
    await this.page.waitForSelector('.mapboxgl-canvas', { state: 'visible', timeout: 30000 });
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
