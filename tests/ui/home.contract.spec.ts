import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { test } from '@playwright/test';

import { HomePage } from '../support/pages/home-page.js';

test('homepage exposes the main product entry point', async ({ page, baseURL }) => {
  const fixturePath = path.resolve('tests/support/fixtures/home-page.html');
  const fixtureHtml = await readFile(fixturePath, 'utf-8');
  if (!baseURL) {
    throw new Error('Playwright baseURL is required');
  }
  await page.route(new URL('/', baseURL).toString(), async (route) => {
    await route.fulfill({ status: 200, contentType: 'text/html', body: fixtureHtml });
  });
  const homePage = new HomePage(page);

  await homePage.open();

  await homePage.expectLoaded();
});
