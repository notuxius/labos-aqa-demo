import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { test } from '../support/fixtures/playwright.js';
import { stubHomePage } from '../support/routes/home-page.js';

test('homepage exposes the main product entry point', async ({ page, baseURL, homePage }) => {
  const fixturePath = path.resolve('tests/support/fixtures/home-page.html');
  const fixtureHtml = await readFile(fixturePath, 'utf-8');
  if (!baseURL) {
    throw new Error('Playwright baseURL is required');
  }
  await stubHomePage(page, baseURL, fixtureHtml);
  await homePage.open();

  await homePage.expectLoaded();
});
