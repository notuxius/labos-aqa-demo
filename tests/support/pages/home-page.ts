import { expect, type Page } from '@playwright/test';

import { HomePageLocators } from '../locators/home-page.js';

export class HomePage {
  private readonly locators: HomePageLocators;

  constructor(private readonly page: Page) {
    this.locators = new HomePageLocators(page);
  }

  async open(): Promise<void> {
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveTitle(/LabOS/i);
    await expect(this.locators.heroHeading).toBeVisible();
    await expect(this.locators.demoLink).toBeVisible();
  }
}
