import { expect, type Page } from '@playwright/test';

import { ChatWidgetLocators } from '../locators/chat-widget.js';

export class ChatWidget {
  private readonly locators: ChatWidgetLocators;

  constructor(page: Page) {
    this.locators = new ChatWidgetLocators(page);
  }

  async open(): Promise<void> {
    await this.locators.launcher.click();
    await expect(this.locators.closeButton).toBeVisible();
  }

  async ask(question: string): Promise<void> {
    await this.locators.composer.fill(question);
    await expect(this.locators.sendButton).toBeEnabled();
    await this.locators.sendButton.click();
  }

  async chooseQuickQuestion(index: number): Promise<string> {
    await expect(this.locators.quickQuestions).toHaveCount(3);

    const quickQuestion = this.locators.quickQuestions.nth(index);
    await expect(quickQuestion).toBeVisible();
    const question = (await quickQuestion.innerText()).trim();
    expect(question).not.toBe('');
    await quickQuestion.click();
    return question;
  }

  async expectAnswerTo(question: string): Promise<void> {
    await expect(this.locators.userMessage(question)).toBeVisible();
    await expect(this.locators.latestAnswer).toBeVisible({ timeout: 30_000 });
    await expect(this.locators.latestAnswer).toHaveAttribute('aria-label', /^LaBot says: .+/);
  }
}
