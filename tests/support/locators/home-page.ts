import type { Locator, Page } from '@playwright/test';

export class HomePageLocators {
  readonly heroHeading: Locator;
  readonly demoLink: Locator;

  constructor(page: Page) {
    this.heroHeading = page.getByRole('heading', {
      name: /You Deserve a Better Laboratory Information System/i,
    });
    this.demoLink = page.getByRole('link', { name: 'Request a Live Demo' }).first();
  }
}
