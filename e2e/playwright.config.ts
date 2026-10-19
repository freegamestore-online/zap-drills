import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    viewport: { width: 390, height: 844 },
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'light', use: { ...devices['iPhone 14'], viewport: { width: 390, height: 844 }, colorScheme: 'light' } },
    { name: 'dark', use: { ...devices['iPhone 14'], viewport: { width: 390, height: 844 }, colorScheme: 'dark' } },
  ],
  webServer: {
    command: 'pnpm --filter @zap-drills/web preview --host 127.0.0.1 --port 4173',
    port: 4173,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  outputDir: 'test-results',
  snapshotDir: 'snapshots',
});
