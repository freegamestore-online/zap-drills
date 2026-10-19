import { expect, type Page, type TestInfo } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const consoleErrors = new WeakMap<Page, string[]>();

export async function preparePage(page: Page) {
  const errors: string[] = [];
  consoleErrors.set(page, errors);
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('https://auth.freegamestore.online/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: 'null' }),
  );
  await page.route('https://api.freegamestore.online/**', (route) => route.fulfill({ status: 200, body: '' }));
  await page.route('https://leaderboard.freegamestore.online/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ scores: [] }) }),
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
  await page.clock.install({ time: new Date('2026-10-20T12:00:00Z') });
}

export function checkNoConsoleErrors(page: Page) {
  const errors = consoleErrors.get(page) ?? [];
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
    const litCells = await page.getByRole('button', { name: /^Cell / }).evaluateAll((cells) => {
      const sample = document.createElement('div');
      sample.style.backgroundColor = 'var(--accent)';
      document.body.append(sample);
      const accent = getComputedStyle(sample).backgroundColor;
      sample.remove();
      return cells.flatMap((cell, index) => getComputedStyle(cell).backgroundColor === accent ? [index + 1] : []);
    });
    const firstCell = page.getByRole('button', { name: 'Cell 1' });
    for (let i = 0; i < 8 && !(await firstCell.isEnabled()); i++) await page.clock.fastForward(250);
    for (const cell of litCells) await page.getByRole('button', { name: `Cell ${cell}` }).click();
    await page.getByRole('button', { name: 'Submit' }).click();
  } else if (title === 'Number order') {
    for (let i = 1; i <= 3; i++) {
      const number = page.getByRole('button', { name: `Number ${i}` });
      if (await number.isVisible().catch(() => false)) await number.click();
    }
  } else if (title === 'Odd one out') {
    const tiles = page.getByRole('button', { name: /^Tile / });
    const signatures = await tiles.evaluateAll((buttons) => buttons.map((button) => {
      const shape = button.querySelector('svg g');
      return `${shape?.getAttribute('fill')}:${shape?.innerHTML}`;
    }));
    const oddIndex = signatures.findIndex((signature) => signatures.filter((value) => value === signature).length === 1);
    await page.getByRole('button', { name: `Tile ${oddIndex + 1}` }).click();
  } else if (title === 'Reaction tap') {
    const target = page.getByRole('button', { name: 'Target: tap now' });
    for (let i = 0; i < 16 && !(await target.isVisible().catch(() => false)); i++) {
      await page.clock.fastForward(250);
    }
    await expect(target).toBeVisible();
    await target.click();
  } else if (title === 'Quick maths') {
    const equation = await page.locator('p').filter({ hasText: /\d+\s*[+−×]\s*\d+\s*=\s*\d+/ }).first().innerText();
    const match = equation.match(/(\d+)\s*([+−×])\s*(\d+)\s*=\s*(\d+)/);
    if (!match) throw new Error(`Could not parse maths question: ${equation}`);
    const [, lhsText, operator, rhsText, shownText] = match;
    const lhs = Number(lhsText);
    const rhs = Number(rhsText);
    const shown = Number(shownText);
    const correct = operator === '+' ? lhs + rhs : operator === '−' ? lhs - rhs : lhs * rhs;
    await page.getByRole('button', { name: correct === shown ? 'YES' : 'NO' }).click();
  } else if (title === 'Colour word') {
    const prompt = page.locator('p').filter({ hasText: /^(BLUE|ORANGE|GREEN|RED|GREY)$/i }).first();
    const { word, ink } = await prompt.evaluate((element) => ({
      word: element.textContent?.trim().toLowerCase() ?? '',
      ink: getComputedStyle(element).color,
    }));
    const inkMatchesWord = await page.evaluate((word) => {
      const palette: Record<string, string> = {
        blue: '#0077BB', orange: '#EE7733', green: '#009988', red: '#CC3311', grey: 'var(--drill-grey)',
      };
      const sample = document.createElement('span');
      sample.style.color = palette[word] ?? '';
      document.body.append(sample);
      const expected = getComputedStyle(sample).color;
      sample.remove();
      return expected;
    }, word);
    await page.getByRole('button', { name: ink === inkMatchesWord ? 'MATCH' : 'NO MATCH', exact: true }).click();
  } else {
    const answer = page.getByRole('button', { name: /^(YES|NO|MATCH|NO MATCH)$/ }).first();
    await answer.click();
  }
  await page.clock.runFor(61_000);
  await expect(page.getByRole('region', { name: 'Drill complete' })).toBeVisible();
}
