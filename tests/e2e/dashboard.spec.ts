import { expect, test, type Page } from '@playwright/test';
import { evidenceDirectory } from './evidence';

const evidence = evidenceDirectory('M03');

async function expectNoHorizontalOverflow(page: Page) {
  await expect
    .poll(() =>
      page.locator('html').evaluate((element) => element.scrollWidth <= element.clientWidth),
    )
    .toBe(true);
}

test('valida el Dashboard interactivo y genera evidencia en Chromium', async ({ page }) => {
  const consoleErrors: string[] = [];
  const failedAssetRequests: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('requestfailed', (request) => {
    if (request.url().includes('/assets/')) {
      failedAssetRequests.push(
        `${request.url()} (${request.failure()?.errorText ?? 'error desconocido'})`,
      );
    }
  });

  await page.goto('/#/');
  await expect(page.getByRole('heading', { name: 'Dashboard de rendimiento' })).toBeVisible();
  await expect(page.getByText('471,43 ms')).toBeVisible();
  await expect(page.getByText('16,33 ms/usuario')).toBeVisible();
  await expect(page.getByText('66 usuarios').first()).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: `${evidence}/dashboard-initial-state.png` });

  for (const [name, viewport] of [
    ['dashboard-desktop-1440x900.png', { width: 1440, height: 900 }],
    ['dashboard-laptop-1280x720.png', { width: 1280, height: 720 }],
    ['dashboard-tablet-768x1024.png', { width: 768, height: 1024 }],
    ['dashboard-mobile-390x844.png', { width: 390, height: 844 }],
  ] as const) {
    await page.setViewportSize(viewport);
    await expectNoHorizontalOverflow(page);
    await page.screenshot({ path: `${evidence}/${name}` });
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  const users = page.getByRole('slider', { name: 'Usuarios concurrentes' });
  await users.focus();
  await page.keyboard.press('ArrowRight');
  await expect(users).toHaveValue('66');
  await page.keyboard.press('ArrowRight');
  await expect(users).toHaveValue('67');
  await expect(page.getByText('Umbral excedido').first()).toBeVisible();
  await page.screenshot({ path: `${evidence}/dashboard-threshold-exceeded.png` });

  await users.fill('99');
  await expect(users).toHaveValue('99');
  await expect(page.getByText('Umbral excedido').first()).toBeVisible();
  await expect(page.locator('body')).not.toContainText('Infinity');
  await expect(page.locator('body')).not.toContainText('NaN');
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: `${evidence}/dashboard-near-capacity.png` });

  const duration = page.getByRole('slider', { name: 'Duración de transferencia' });
  await duration.fill('10');
  await expect(duration).toHaveValue('10');
  await expect(page.getByText('60 MB').first()).toBeVisible();
  await page.screenshot({ path: `${evidence}/dashboard-transfer-adjusted.png` });

  await page.getByRole('link', { name: 'Ver Derivadas' }).click();
  await expect(page.getByRole('heading', { name: 'Derivadas' })).toBeVisible();

  expect(consoleErrors).toEqual([]);
  expect(failedAssetRequests).toEqual([]);
});
