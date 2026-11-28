import { expect, test, type Page } from '@playwright/test';
import { evidenceDirectory } from './evidence';

const evidence = evidenceDirectory('M04');

async function expectNoHorizontalOverflow(page: Page) {
  await expect
    .poll(() =>
      page.locator('html').evaluate((element) => element.scrollWidth <= element.clientWidth),
    )
    .toBe(true);
}

test('valida el laboratorio de límites y genera evidencia en Chromium', async ({ page }) => {
  const consoleErrors: string[] = [];
  const failedRequests: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('requestfailed', (request) => failedRequests.push(request.url()));

  await page.goto('/#/limites');
  await expect(page.getByRole('heading', { name: 'Laboratorio de límites' })).toBeVisible();
  await expect(page.locator('.limit-result strong')).toHaveText('100 ms');
  await expect(page.getByRole('radio', { name: /Carga inicial/ })).toHaveAttribute(
    'aria-checked',
    'true',
  );
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: `${evidence}/limits-zero-approach.png` });

  for (const [name, viewport] of [
    ['limits-desktop-1440x900.png', { width: 1440, height: 900 }],
    ['limits-laptop-1280x720.png', { width: 1280, height: 720 }],
    ['limits-tablet-768x1024.png', { width: 768, height: 1024 }],
    ['limits-mobile-390x844.png', { width: 390, height: 844 }],
  ] as const) {
    await page.setViewportSize(viewport);
    await expectNoHorizontalOverflow(page);
    await page.screenshot({ path: `${evidence}/${name}` });
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  const capacity = page.getByRole('radio', { name: /Capacidad/ });
  await capacity.focus();
  await page.keyboard.press('Enter');
  await expect(capacity).toHaveAttribute('aria-checked', 'true');
  await expect(page.locator('.limit-result strong')).toHaveText('+∞');
  await expect(page.getByText('Escala logarítmica en Y')).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: `${evidence}/limits-capacity-approach.png` });

  await page.getByRole('button', { name: '0,01' }).click();
  await expect(page.getByText('n = 99,99')).toBeVisible();
  await expect(page.locator('body')).not.toContainText('NaN');
  await expect(page.locator('body')).not.toContainText('Infinity');
  await page.screenshot({ path: `${evidence}/limits-near-asymptote.png` });

  await page.getByRole('heading', { name: 'Desarrollo paso a paso' }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${evidence}/limits-mathematical-procedure.png` });

  expect(consoleErrors).toEqual([]);
  expect(failedRequests).toEqual([]);
});
