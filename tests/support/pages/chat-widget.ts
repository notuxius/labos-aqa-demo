import { expect, type FrameLocator, type Locator, type Page } from '@playwright/test';

export class ChatWidget {
  private readonly frame: FrameLocator;
  private readonly launcher: Locator;
  private readonly composer: Locator;
  private readonly sendButton: Locator;

  constructor(page: Page) {
    this.frame = page.frameLocator('iframe[title="Chat Widget"]');
    this.launcher = this.frame.getByRole('button', { name: 'Open live chat' });
    this.composer = this.frame.getByRole('textbox');
    this.sendButton = this.frame.getByRole('button', { name: 'send message' });
  }

  async open(): Promise<void> {
    await this.launcher.click();
    await expect(this.frame.getByRole('button', { name: 'Close live chat' })).toBeVisible();
  }

  async ask(question: string): Promise<void> {
    await this.composer.fill(question);
    await expect(this.sendButton).toBeEnabled();
    await this.sendButton.click();
  }

  async chooseQuickQuestion(index: number): Promise<string> {
    const quickQuestions = this.frame.locator(
      '[data-test-id^="ai-prompt-recommendation-"]',
    );
    await expect(quickQuestions).toHaveCount(3);

    const quickQuestion = quickQuestions.nth(index);
    await expect(quickQuestion).toBeVisible();
    const question = (await quickQuestion.innerText()).trim();
    expect(question).not.toBe('');
    await quickQuestion.click();
    return question;
  }

  async expectAnswerTo(question: string): Promise<void> {
    await expect(this.frame.getByLabel(`I say: ${question}`, { exact: true })).toBeVisible();

    const latestAnswer = this.frame.locator('[aria-label^="LaBot says:"]').last();
    await expect(latestAnswer).toBeVisible({ timeout: 30_000 });
    await expect(latestAnswer).toHaveAttribute('aria-label', /^LaBot says: .+/);
  }
}
