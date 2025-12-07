/**
 * AI Chat Page Object Model
 * Encapsulates AI chat interface interactions
 */

import { Page, Locator } from '@playwright/test';

export class AIChatPage {
  readonly page: Page;
  readonly chatContainer: Locator;
  readonly messageInput: Locator;
  readonly sendButton: Locator;
  readonly messages: Locator;
  readonly userMessages: Locator;
  readonly assistantMessages: Locator;
  readonly toolCallIndicator: Locator;
  readonly loadingIndicator: Locator;
  readonly suggestedPrompts: Locator;
  readonly clearButton: Locator;
  readonly toolPalette: Locator;

  constructor(page: Page) {
    this.page = page;
    this.chatContainer = page.locator(
      '[data-testid="chat-container"], .chat-container, .ai-chat'
    );
    this.messageInput = page.locator(
      'textarea[placeholder*="message" i], input[placeholder*="message" i], [data-testid="chat-input"]'
    );
    this.sendButton = page.locator(
      'button[type="submit"], button:has-text("Send"), [data-testid="send-button"]'
    );
    this.messages = page.locator('[data-testid="message"], .chat-message, .message');
    this.userMessages = page.locator('[data-role="user"], .user-message');
    this.assistantMessages = page.locator('[data-role="assistant"], .assistant-message');
    this.toolCallIndicator = page.locator(
      '[data-testid="tool-call"], .tool-call, .function-call'
    );
    this.loadingIndicator = page.locator(
      '[data-testid="chat-loading"], .chat-loading, .typing-indicator'
    );
    this.suggestedPrompts = page.locator(
      '[data-testid="suggested-prompt"], .suggested-prompt'
    );
    this.clearButton = page.locator(
      'button:has-text("Clear"), button:has-text("New"), [data-testid="clear-chat"]'
    );
    this.toolPalette = page.locator('[data-testid="tool-palette"], .tool-palette');
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
