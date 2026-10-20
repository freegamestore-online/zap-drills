import { expect, test } from '@playwright/test';
import { checkNoConsoleErrors, checkNoOverflow, finishCurrentDrill, preparePage, takeScreenshot } from './helpers';

const drills = [
  ['Quick maths', 'maths'],
  ['Colour word', 'colour-word'],
  ['Memory grid', 'memory-grid'],
  ['Number order', 'number-order'],
  ['Odd one out', 'odd-one-out'],
  ['Reaction tap', 'reaction-tap'],
] as const;

test.beforeEach(async ({ page }) => preparePage(page));

for (const [name, slug] of drills) {
  test(`plays ${name} and reaches a result`, async ({ page }, testInfo) => {
    const assertNoErrors = checkNoConsoleErrors(page);
    await page.getByRole('button', { name: 'Free play' }).click();
    await page.getByRole('button', { name: `Play ${name}` }).click();
    await expect(page.getByRole('button', { name: `Start ${name}` })).toBeVisible();
    await checkNoOverflow(page);
    await takeScreenshot(page, testInfo, `${slug}-start`);
    await finishCurrentDrill(page);
    if (name === 'Reaction tap') {
      await expect(page.getByRole('region', { name: 'Reaction leaderboard' })).toBeVisible();
      await expect(page.getByText('Leaderboard · successful taps')).toBeVisible();
    }
    await takeScreenshot(page, testInfo, `${slug}-result`);
    await checkNoOverflow(page);
    assertNoErrors();
  });
}
