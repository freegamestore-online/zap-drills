import { expect, test } from '@playwright/test';
import { checkNoConsoleErrors, checkNoOverflow, finishCurrentDrill, preparePage, takeScreenshot } from './helpers';

test.beforeEach(async ({ page }) => preparePage(page));

test('updates personal best and history chart after free play', async ({ page }, testInfo) => {
  const assertNoErrors = checkNoConsoleErrors(page);
  await page.getByRole('button', { name: 'Free play' }).click();
  await expect(page.getByRole('region', { name: 'History' })).toBeVisible();
  await expect(page.getByRole('img', { name: /Quick maths: best score per day/ })).toBeVisible();
  await takeScreenshot(page, testInfo, 'freeplay-list-chart');
  await page.getByRole('button', { name: 'Play Quick maths' }).click();
  await finishCurrentDrill(page);
  await page.getByRole('button', { name: 'Back to drills' }).click();
  await expect(page.getByRole('button', { name: 'Play Quick maths' })).not.toContainText('No best yet');
  await expect(page.locator('[data-testid="chart-bar"]')).toHaveCount(14);
  await takeScreenshot(page, testInfo, 'freeplay-best-chart');
  await checkNoOverflow(page);
  assertNoErrors();
});
