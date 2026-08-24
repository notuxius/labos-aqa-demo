import { readFile } from 'node:fs/promises';
import path from 'node:path';

import AxeBuilder from '@axe-core/playwright';
import { expect } from '@playwright/test';

import { test } from '../support/fixtures/playwright.js';
import { stubHomePage } from '../support/routes/home-page.js';

test.beforeEach(async ({ page, baseURL }) => {
  const fixturePath = path.resolve('tests/support/fixtures/home-page.html');
  const fixtureHtml = await readFile(fixturePath, 'utf-8');
  if (!baseURL) {
    throw new Error('Playwright baseURL is required');
  }
  await stubHomePage(page, baseURL, fixtureHtml);
});

test('homepage exposes the main product entry point', async ({ homePage }) => {
  await homePage.open();

  await homePage.expectLoaded();
});

test('homepage has no automatically detectable accessibility violations', async ({
  page,
  homePage,
}) => {
  await homePage.open();

  const results = await new AxeBuilder({ page }).analyze();

  expect(results.violations).toEqual([]);
});
