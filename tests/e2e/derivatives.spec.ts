import { expect, test, type Page } from '@playwright/test';
import { evidenceDirectory } from './evidence';

const evidence = evidenceDirectory('M05');
async function noOverflow(page: Page) {
  await expect
    .poll(() => page.locator('html').evaluate((e) => e.scrollWidth <= e.clientWidth))
    .toBe(true);
}

test('valida derivadas, controles y evidencia real', async ({ page }) => {
  const errors: string[] = [];
  const failed: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('requestfailed', (r) => failed.push(r.url()));
  await page.goto('/#/derivadas');
  await expect(page.getByRole('heading', { name: 'Laboratorio de derivadas' })).toBeVisible();
  await expect(page.getByRole('slider', { name: 'Usuarios del punto de análisis' })).toHaveValue(
    '65',
  );
  for (const [name, viewport] of [
    ['derivatives-desktop-1440x900.png', { width: 1440, height: 900 }],
    ['derivatives-laptop-1280x720.png', { width: 1280, height: 720 }],
    ['derivatives-tablet-768x1024.png', { width: 768, height: 1024 }],
    ['derivatives-mobile-390x844.png', { width: 390, height: 844 }],
  ] as const) {
    await page.setViewportSize(viewport);
    await noOverflow(page);
    await page.screenshot({ path: `${evidence}/${name}` });
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({ path: `${evidence}/derivatives-tangent.png` });
  await page.getByRole('radio', { name: 'R′(n)' }).click();
  await expect(page.getByRole('heading', { name: 'Primera derivada' })).toBeVisible();
  await page.screenshot({ path: `${evidence}/derivatives-first-derivative.png` });
  await page.getByRole('radio', { name: 'R″(n)' }).click();
  await expect(page.getByRole('heading', { name: 'Segunda derivada' })).toBeVisible();
  await page.screenshot({ path: `${evidence}/derivatives-second-derivative.png` });
  await page.getByRole('radio', { name: 'Función y tangente' }).click();
  const slider = page.getByRole('slider', { name: 'Usuarios del punto de análisis' });
  await slider.focus();
  await page.keyboard.press('End');
  await expect(slider).toHaveValue('99');
  await expect(page.getByText('No definido').first()).toBeVisible();
  await expect(page.locator('body')).not.toContainText('NaN');
  await expect(page.locator('body')).not.toContainText('Infinity');
  await page.screenshot({ path: `${evidence}/derivatives-near-capacity.png` });
  await page.getByText('Derivada e incremento no son lo mismo').scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${evidence}/derivatives-discrete-comparison.png` });
  await page.getByRole('heading', { name: 'Derivación y convexidad' }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${evidence}/derivatives-mathematical-procedure.png` });
  await page.getByRole('link', { name: 'Ir al Dashboard' }).click();
  await expect(page.getByRole('slider', { name: 'Usuarios concurrentes' })).toHaveValue('65');
  expect(errors).toEqual([]);
  expect(failed).toEqual([]);
});
