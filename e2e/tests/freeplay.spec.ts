import { expect, test } from '@playwright/test';
import { checkNoConsoleErrors, checkNoOverflow, finishCurrentDrill, preparePage, takeScreenshot } from './helpers';

test.beforeEach(async ({ page }) => preparePage(page));

test('updates personal best and history chart after free play', async ({ page }, testInfo) => {
  const assertNoErrors = checkNoConsoleErrors(page);
  await page.getByRole('button', { name: 'Free play' }).click();
  await expect(page.getByRole('region', { name: 'Weekly progress' })).toBeVisible();
  await expect(page.getByText('No runs in the last 7 days yet.')).toBeVisible();
  await expect(page.getByRole('region', { name: 'History' })).toBeVisible();
  await expect(page.getByText('No runs in the last 30 days yet.')).toBeVisible();
  await takeScreenshot(page, testInfo, 'freeplay-list-chart');
  await page.getByRole('button', { name: 'Play Quick maths' }).click();
  await finishCurrentDrill(page);
  await expect(page.getByRole('status')).toHaveText('New personal best!');
  await takeScreenshot(page, testInfo, 'freeplay-new-best');
  await page.getByRole('button', { name: 'Back to drills' }).click();
  await expect(page.getByRole('button', { name: 'Play Quick maths' })).not.toContainText('No best yet');
  await expect(page.getByRole('img', { name: /Quick maths: best score per day for the last 30 days/ })).toBeVisible();
  await expect(page.getByRole('list', { name: 'Quick maths personal-best history' })).toContainText('2026-10-20');
  await expect(page.getByRole('img', { name: /Weekly progress across all drills/ })).toBeVisible();
  await expect(page.getByRole('region', { name: 'History' }).locator('[data-testid="chart-bar"]')).toHaveCount(1);
  await takeScreenshot(page, testInfo, 'freeplay-best-chart');
  await checkNoOverflow(page);
  assertNoErrors();
});
