import { test } from '@playwright/test';

import { HomePage } from '../pages/home-page.js';

test('@live public homepage exposes the main customer entry point', async ({ page }) => {
  test.skip(!process.env.RUN_LIVE_TESTS, 'Set RUN_LIVE_TESTS=true to call the public site');
  const homePage = new HomePage(page);

  await homePage.open();

  await homePage.expectLoaded();
});
