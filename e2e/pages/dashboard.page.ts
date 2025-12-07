/**
 * Dashboard Page Object Model
 * Encapsulates dashboard page interactions
 */

import { Page, Locator } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly welcomeMessage: Locator;
  readonly statCards: Locator;
  readonly recentDeals: Locator;
  readonly quickActions: Locator;
  readonly aiChatButton: Locator;
  readonly navigationMenu: Locator;

  constructor(page: Page) {
    this.page = page;
    this.welcomeMessage = page.locator('h1, h2').filter({ hasText: /welcome|dashboard/i });
    this.statCards = page.locator('[data-testid="stat-card"], .stat-card, .metric-card');
    this.recentDeals = page.locator('[data-testid="recent-deals"], .recent-deals');
    this.quickActions = page.locator('[data-testid="quick-actions"], .quick-actions');
    this.aiChatButton = page.locator('button:has-text("AI"), [data-testid="ai-chat"]');
    this.navigationMenu = page.locator('nav, [role="navigation"]');
  }

  async goto() {
    await this.page.goto('/dashboard');
  }

  async getStatValue(statName: string) {
    const statCard = this.page.locator(
      `[data-testid="stat-${statName}"], .stat-card:has-text("${statName}")`
    );
    return statCard.locator('.stat-value, .value').textContent();
  }

  async navigateTo(section: string) {
    await this.navigationMenu.locator(`a:has-text("${section}")`).click();
  }

  async openAIChat() {
    await this.aiChatButton.click();
    await this.page.waitForSelector('[data-testid="ai-chat-panel"], .ai-chat-panel', {
      state: 'visible',
    });
  }
}
