import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';

import { defineConfig, devices } from '@playwright/test';

for (const envFile of ['.env', '.env.example']) {
  if (existsSync(envFile)) {
    loadEnvFile(envFile);
  }
}

const baseURL = process.env.LABOS_BASE_URL;
const runLiveTests = process.env.RUN_LIVE_TESTS === 'true';
const chromiumProject = {
  name: 'chromium',
  use: { ...devices['Desktop Chrome'] },
};
const deterministicProjects = [
  chromiumProject,
  {
    name: 'firefox',
    use: { ...devices['Desktop Firefox'] },
  },
  {
    name: 'webkit',
    use: { ...devices['Desktop Safari'] },
  },
  {
    name: 'mobile-chrome',
    use: { ...devices['Pixel 7'] },
  },
];
if (!baseURL) {
  throw new Error('LABOS_BASE_URL is required in the shell, .env, or .env.example');
}

export default defineConfig({
  testDir: './tests/ui',
  outputDir: 'reports/ui/artifacts',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: runLiveTests ? 1 : process.env.CI ? 2 : undefined,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/ui/html', open: 'never' }],
    ['junit', { outputFile: 'reports/ui/junit.xml' }],
  ],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: runLiveTests ? [chromiumProject] : deterministicProjects,
});
