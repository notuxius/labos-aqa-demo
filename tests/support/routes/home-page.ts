import type { Page } from '@playwright/test';

export async function stubHomePage(
  page: Page,
  baseURL: string,
  body: string,
): Promise<void> {
  await page.route(new URL('/', baseURL).toString(), async (route) => {
    await route.fulfill({ status: 200, contentType: 'text/html', body });
  });
}
