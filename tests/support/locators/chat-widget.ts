import type { FrameLocator, Locator, Page } from '@playwright/test';

export class ChatWidgetLocators {
  readonly launcher: Locator;
  readonly closeButton: Locator;
  readonly composer: Locator;
  readonly sendButton: Locator;
  readonly quickQuestions: Locator;
  readonly latestAnswer: Locator;

  private readonly frame: FrameLocator;

  constructor(page: Page) {
    this.frame = page.frameLocator('iframe[title="Chat Widget"]');
    this.launcher = this.frame.getByRole('button', { name: 'Open live chat' });
    this.closeButton = this.frame.getByRole('button', { name: 'Close live chat' });
    this.composer = this.frame.getByRole('textbox');
    this.sendButton = this.frame.getByRole('button', { name: 'send message' });
    this.quickQuestions = this.frame.locator(
      '[data-test-id^="ai-prompt-recommendation-"]',
    );
    this.latestAnswer = this.frame.locator('[aria-label^="LaBot says:"]').last();
  }

  userMessage(question: string): Locator {
    return this.frame.getByLabel(`I say: ${question}`, { exact: true });
  }
}
