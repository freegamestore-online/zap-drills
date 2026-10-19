import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 90_000,
  workers: 2,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:4175',
    viewport: { width: 390, height: 844 },
    screenshot: 'only-on-failure',
    serviceWorkers: 'block',
  },
  projects: [
    { name: 'light', use: { ...devices['iPhone 14'], browserName: 'chromium', isMobile: true, hasTouch: true, viewport: { width: 390, height: 844 }, colorScheme: 'light' } },
    { name: 'dark', use: { ...devices['iPhone 14'], browserName: 'chromium', isMobile: true, hasTouch: true, viewport: { width: 390, height: 844 }, colorScheme: 'dark' } },
  ],
  webServer: {
    command: 'pnpm --filter @zap-drills/web preview --host 127.0.0.1 --port 4175 --strictPort',
    port: 4175,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  outputDir: 'test-results',
  snapshotDir: 'snapshots',
});
