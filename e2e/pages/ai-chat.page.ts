/**
 * AI Chat Page Object Model
 * Encapsulates AI chat interface interactions
 *
 * Note: The /search page has a simple search input, while the AI chat
 * sidebar is available across all dashboard pages.
 */

import { Page, Locator } from '@playwright/test';

export class AIChatPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly suggestedPrompts: Locator;

  // AI Sidebar elements (available on all pages)
  readonly aiSidebar: Locator;
  readonly aiSidebarToggle: Locator;
  readonly chatContainer: Locator;
  readonly messageInput: Locator;
  readonly sendButton: Locator;
  readonly messages: Locator;
  readonly clearButton: Locator;
  readonly toolPalette: Locator;
  readonly loadingIndicator: Locator;

  constructor(page: Page) {
    this.page = page;

    // /search page elements
    this.pageTitle = page.locator('h1:has-text("AI Search"), h1:has-text("Search")');
    this.searchInput = page.locator('input[placeholder*="Find" i], input[placeholder*="bedroom" i], input[placeholder*="search" i]');
    this.searchButton = page.locator('button:has-text("Search")');
    this.suggestedPrompts = page.locator('button[variant="outline"]:has-text("Vacant"), button:has-text("Pre-foreclosures"), button:has-text("Absentee")');

    // AI Sidebar elements (persistent across pages)
    this.aiSidebar = page.locator('[data-testid="ai-sidebar"], .ai-chat-sidebar, aside:has-text("AI Assistant")');
    this.aiSidebarToggle = page.locator('button:has-text("AI"), [data-testid="ai-toggle"]');
    this.chatContainer = page.locator('[data-testid="chat-container"], .chat-container');
    this.messageInput = page.locator('textarea[placeholder*="Ask" i], textarea[placeholder*="anything" i]');
    this.sendButton = page.locator('button[type="submit"], button:has-text("Send")');
    this.messages = page.locator('[data-testid="message"], .chat-message');
    this.clearButton = page.locator('button:has-text("Clear"), button:has-text("New")');
    this.toolPalette = page.locator('[data-testid="tool-palette"], .tool-palette');
    this.loadingIndicator = page.locator('.loading, .spinner, [data-testid="loading"]');
  }

  async goto() {
    await this.page.goto('/search');
  }

  async sendMessage(message: string) {
    await this.messageInput.fill(message);
    await this.sendButton.click();
    await this.waitForResponse();
  }

  async waitForResponse(timeout = 60000) {
    // Wait for loading to start
    await this.loadingIndicator.waitFor({ state: 'visible' }).catch(() => {});
    // Wait for loading to complete
    await this.loadingIndicator.waitFor({ state: 'hidden', timeout });
    // Wait for assistant message to appear
    await this.assistantMessages.last().waitFor({ state: 'visible' });
  }

  async getLastAssistantMessage() {
    return this.assistantMessages.last().textContent();
  }

  async getMessageCount() {
    return this.messages.count();
  }

  async hasToolCalls() {
    return (await this.toolCallIndicator.count()) > 0;
  }

  async getToolCalls() {
    return this.toolCallIndicator.allTextContents();
  }

  async clickSuggestedPrompt(index: number) {
    await this.suggestedPrompts.nth(index).click();
    await this.waitForResponse();
  }

  async clearChat() {
    await this.clearButton.click();
    // Wait for messages to clear
    await this.page.waitForFunction(
      () => document.querySelectorAll('[data-testid="message"], .chat-message').length === 0
    );
  }

  async openToolPalette() {
    const paletteButton = this.page.locator(
      'button:has-text("Tools"), [data-testid="tool-palette-button"]'
    );
    await paletteButton.click();
    await this.toolPalette.waitFor({ state: 'visible' });
  }

  async selectTool(toolName: string) {
    await this.openToolPalette();
    await this.toolPalette.locator(`button:has-text("${toolName}")`).click();
  }
}
