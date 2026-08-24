import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { test } from '@playwright/test';

import { HomePage } from '../pages/home-page.js';

test('homepage exposes the main product entry point', async ({ page }) => {
  const fixturePath = path.resolve('tests/ui/fixtures/home-page.html');
  const fixtureHtml = await readFile(fixturePath, 'utf-8');
  await page.route('https://labos.co/', async (route) => {
    await route.fulfill({ status: 200, contentType: 'text/html', body: fixtureHtml });
  });
  const homePage = new HomePage(page);

  await homePage.open();

  await homePage.expectLoaded();
});
