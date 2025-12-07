/**
 * Login Page Object Model
 * Encapsulates login page interactions
 */

import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly forgotPasswordLink: Locator;
  readonly signUpLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[name="email"], input[type="email"]');
    this.passwordInput = page.locator('input[name="password"], input[type="password"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('[role="alert"], .error-message, [data-testid="error"]');
    this.forgotPasswordLink = page.locator('a:has-text("Forgot"), a:has-text("forgot")');
    this.signUpLink = page.locator('a:has-text("Sign up"), a:has-text("Register")');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async waitForLogin() {
    await this.page.waitForURL(/\/(dashboard|properties|deals|search)/, {
      timeout: 10000,
    });
  }

  async getErrorMessage() {
    return this.errorMessage.textContent();
  }

  async isErrorVisible() {
    return this.errorMessage.isVisible();
  }
}
