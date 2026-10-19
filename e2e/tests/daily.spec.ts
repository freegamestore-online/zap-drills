import { expect, test } from '@playwright/test';
import { checkNoConsoleErrors, checkNoOverflow, finishCurrentDrill, preparePage, takeScreenshot } from './helpers';

test.beforeEach(async ({ page }) => preparePage(page));

test('completes the three-drill daily workout, records its total and streak, submits leaderboard score', async ({ page }, testInfo) => {
  const assertNoErrors = checkNoConsoleErrors(page);
  let submittedScore: unknown;
  await page.route('https://leaderboard.freegamestore.online/v1/api/scores', async (route) => {
    if (route.request().method() === 'POST') submittedScore = route.request().postDataJSON();
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, rank: 1 }) });
  });
  await page.getByRole('button', { name: 'Daily workout' }).click();
  await expect(page.getByRole('button', { name: 'Start workout' })).toBeVisible();
  await checkNoOverflow(page);
  await takeScreenshot(page, testInfo, 'daily-intro');
  await page.getByRole('button', { name: 'Start workout' }).click();
  for (let i = 0; i < 3; i++) {
    await finishCurrentDrill(page);
    await takeScreenshot(page, testInfo, `daily-drill-${i + 1}`);
    await page.getByRole('button', { name: i === 2 ? 'See results' : `Next drill (${i + 2} of 3)` }).click();
  }
  await expect(page.getByRole('heading', { name: 'Workout complete' })).toBeVisible();
  await expect(page.getByText(/^Streak: 1 day$/)).toBeVisible();
  await expect(page.getByText('Total', { exact: true })).toBeVisible();
  await expect.poll(() => submittedScore).toMatchObject({ game: 'zap-drills', score: expect.any(Number) });
  await takeScreenshot(page, testInfo, 'daily-results');
  await checkNoOverflow(page);
  assertNoErrors();
});
