/**
 * Deals Page Object Model
 * Encapsulates deal pipeline/kanban interactions
 */

import { Page, Locator } from '@playwright/test';

export class DealsPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly createDealButton: Locator;
  readonly kanbanBoard: Locator;
  readonly kanbanColumns: Locator;
  readonly dealCards: Locator;
  readonly viewToggleKanban: Locator;
  readonly viewToggleList: Locator;
  readonly viewToggleStats: Locator;
  readonly statsView: Locator;
  readonly createDealDialog: Locator;
  readonly dealForm: Locator;
  readonly loadingSpinner: Locator;

  // Deal Form Fields
  readonly propertyAddressInput: Locator;
  readonly stageSelect: Locator;
  readonly sellerNameInput: Locator;
  readonly sellerPhoneInput: Locator;
  readonly sellerEmailInput: Locator;
  readonly askingPriceInput: Locator;
  readonly offerPriceInput: Locator;
  readonly arvInput: Locator;
  readonly repairsInput: Locator;
  readonly notesInput: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Page elements
    this.pageTitle = page.locator('h1:has-text("Deals"), h1:has-text("Deal Pipeline")');
    this.createDealButton = page.locator('button:has-text("Create Deal"), button:has-text("New Deal"), [data-testid="create-deal"]');
    this.kanbanBoard = page.locator('[data-testid="kanban-board"], .kanban-board, [class*="flex gap-4 overflow-x-auto"]');
    this.kanbanColumns = page.locator('[data-testid="kanban-column"], .kanban-column, [class*="min-w-[280px]"]');
    this.dealCards = page.locator('[data-testid="deal-card"], .deal-card, [class*="rounded-lg border bg-card"]');
    this.viewToggleKanban = page.locator('button:has-text("Kanban"), button[aria-label*="kanban" i], [data-testid="view-kanban"]');
    this.viewToggleList = page.locator('button:has-text("List"), button[aria-label*="list" i], [data-testid="view-list"]');
    this.viewToggleStats = page.locator('button:has-text("Stats"), button[aria-label*="stats" i], [data-testid="view-stats"]');
    this.statsView = page.locator('[data-testid="pipeline-stats"], .pipeline-stats');
    this.createDealDialog = page.locator('[role="dialog"], [data-testid="create-deal-dialog"]');
    this.dealForm = page.locator('form');
    this.loadingSpinner = page.locator('.loading, .spinner, [data-testid="loading"]');

    // Form fields
    this.propertyAddressInput = page.locator('input[name="property_address"], [data-testid="property-address"]');
    this.stageSelect = page.locator('select[name="stage"], [data-testid="stage-select"], button[role="combobox"]');
    this.sellerNameInput = page.locator('input[name="seller_name"], [data-testid="seller-name"]');
    this.sellerPhoneInput = page.locator('input[name="seller_phone"], [data-testid="seller-phone"]');
    this.sellerEmailInput = page.locator('input[name="seller_email"], [data-testid="seller-email"]');
    this.askingPriceInput = page.locator('input[name="asking_price"], [data-testid="asking-price"]');
    this.offerPriceInput = page.locator('input[name="offer_price"], [data-testid="offer-price"]');
    this.arvInput = page.locator('input[name="estimated_arv"], [data-testid="arv"]');
    this.repairsInput = page.locator('input[name="estimated_repairs"], [data-testid="repairs"]');
    this.notesInput = page.locator('textarea[name="notes"], [data-testid="notes"]');
    this.submitButton = page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Save")');
    this.cancelButton = page.locator('button:has-text("Cancel")');
  }

  async goto() {
    await this.page.goto('/deals');
  }

  async waitForLoad() {
    await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {});
    // Wait for either kanban board or a "no deals" message
    await Promise.race([
      this.kanbanColumns.first().waitFor({ state: 'visible', timeout: 30000 }),
      this.page.locator('text=No deals').waitFor({ state: 'visible', timeout: 30000 }),
    ]).catch(() => {});
  }

  async openCreateDealDialog() {
    await this.createDealButton.click();
    await this.createDealDialog.waitFor({ state: 'visible' });
  }

  async getColumnCount() {
    return this.kanbanColumns.count();
  }

  async getDealCount() {
    return this.dealCards.count();
  }

  async getColumnByStage(stageName: string) {
    return this.page.locator(`[data-testid="kanban-column-${stageName}"], .kanban-column:has-text("${stageName}")`);
  }

  async clickDeal(index: number) {
    await this.dealCards.nth(index).click();
  }

  async switchToStatsView() {
    await this.viewToggleStats.click();
    await this.statsView.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
  }

  async switchToKanbanView() {
    await this.viewToggleKanban.click();
    await this.kanbanBoard.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
  }
}

