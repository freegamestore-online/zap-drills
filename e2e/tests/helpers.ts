import { expect, type Page, type TestInfo } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

export async function preparePage(page: Page) {
  await page.clock.install({ time: new Date('2026-10-20T12:00:00Z') });
  await page.route('https://auth.freegamestore.online/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ user: null }) }),
  );
  await page.addInitScript(() => {
    let state = 42;
    Math.random = () => {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 0x100000000;
    };
  });
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
}

export function checkNoConsoleErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  return () => expect(errors, `Browser console errors:\n${errors.join('\n')}`).toEqual([]);
}

export async function checkNoOverflow(page: Page) {
  const sizes = await page.evaluate(() => ({
    bodyWidth: document.body.scrollWidth,
    viewportWidth: window.innerWidth,
    bodyHeight: document.body.scrollHeight,
    viewportHeight: window.innerHeight,
  }));
  expect(sizes.bodyWidth, 'page should not overflow horizontally').toBeLessThanOrEqual(sizes.viewportWidth);
  expect(sizes.bodyHeight, 'page height should remain within two phone screens').toBeLessThanOrEqual(sizes.viewportHeight * 2);
}

export async function takeScreenshot(page: Page, testInfo: TestInfo, name: string) {
  const path = join(testInfo.project.testDir, '..', 'snapshots', `${testInfo.project.name}-${name}.png`);
  await mkdir(join(testInfo.project.testDir, '..', 'snapshots'), { recursive: true });
  await page.screenshot({ path, fullPage: true });
}

export async function finishCurrentDrill(page: Page) {
  const start = page.getByRole('button', { name: /^Start / });
  if (await start.isVisible().catch(() => false)) await start.click();

  const title = await page.locator('header h1').innerText();
  if (title === 'Memory grid') {
    await page.clock.fastForward(1_000);
    await page.getByRole('button', { name: 'Cell 1' }).click();
    await page.getByRole('button', { name: 'Submit' }).click();
  } else if (title === 'Number order') {
    for (let i = 1; i <= 3; i++) {
      const number = page.getByRole('button', { name: `Number ${i}` });
      if (await number.isVisible().catch(() => false)) await number.click();
    }
  } else if (title === 'Odd one out') {
    await page.getByRole('button', { name: 'Tile 1' }).click();
  } else if (title === 'Reaction tap') {
    await page.clock.fastForward(1_000);
    const target = page.getByRole('button', { name: 'Target: tap now' });
    if (await target.isVisible().catch(() => false)) await target.click();
  } else {
    const answer = page.getByRole('button', { name: /^(YES|NO|MATCH|NO MATCH)$/ }).first();
    await answer.click();
  }
  await page.clock.runFor(61_000);
  await expect(page.getByRole('region', { name: 'Drill complete' })).toBeVisible();
}
