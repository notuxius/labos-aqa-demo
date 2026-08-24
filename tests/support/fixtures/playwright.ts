import { test as base } from '@playwright/test';

import { ChatWidget } from '../pages/chat-widget.js';
import { HomePage } from '../pages/home-page.js';

type UiFixtures = {
  chatWidget: ChatWidget;
  homePage: HomePage;
};

export const test = base.extend<UiFixtures>({
  chatWidget: async ({ page }, use) => {
    await use(new ChatWidget(page));
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
});
