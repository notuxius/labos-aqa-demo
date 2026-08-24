import { expect, type Locator, type Page } from '@playwright/test';

export class HomePage {
  readonly heroHeading: Locator;
  readonly demoLink: Locator;

  constructor(private readonly page: Page) {
    this.heroHeading = page.getByRole('heading', {
      name: /You Deserve a Better Laboratory Information System/i,
    });
    this.demoLink = page.getByRole('link', { name: 'Request a Live Demo' }).first();
  }

  async open(): Promise<void> {
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveTitle(/LabOS/i);
    await expect(this.heroHeading).toBeVisible();
    await expect(this.demoLink).toBeVisible();
  }
}
