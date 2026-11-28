import { expect, test, type Page } from '@playwright/test';
import { evidenceDirectory } from './evidence';

const evidence = evidenceDirectory('M01');

async function expectNoHorizontalOverflow(page: Page) {
  await expect
    .poll(() =>
      page.locator('html').evaluate((element) => element.scrollWidth <= element.clientWidth),
    )
    .toBe(true);
}

async function waitForSidebarPosition(page: Page, open: boolean) {
  const sidebar = page.getByRole('complementary', { name: 'Navegación principal' });
  // Cerrado queda oculto, para que no reciba el foco del teclado.
  if (!open) return expect(sidebar).toBeHidden();
  await expect.poll(async () => Math.abs((await sidebar.boundingBox())?.x ?? -999) < 1).toBe(true);
}

test('valida navegación, recursos y experiencia responsive del Application Shell', async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  const failedAssetRequests: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
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
  await expect(page.getByRole('img', { name: 'ServerLab Calculus Simulator' })).toBeVisible();
  await expectNoHorizontalOverflow(page);

  const routes = [
    ['Límites', 'Laboratorio de límites'],
    ['Derivadas', 'Laboratorio de derivadas'],
    ['Integrales', 'Laboratorio de integrales'],
    ['Optimización', 'Laboratorio de optimización'],
    ['Acerca de', 'Acerca de ServerLab'],
  ] as const;

  for (const [navigationLabel, heading] of routes) {
    const link = page.getByRole('link', { name: navigationLabel, exact: true });
    await link.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { name: heading })).toBeVisible();
    await expect(link).toHaveAttribute('aria-current', 'page');
    await expectNoHorizontalOverflow(page);
  }

  await page.goto('/#/no-existe');
  await expect(page.getByRole('heading', { name: 'Ruta no encontrada' })).toBeVisible();

  for (const [name, viewport] of [
    ['desktop-1440x900.png', { width: 1440, height: 900 }],
    ['laptop-1280x720.png', { width: 1280, height: 720 }],
    ['tablet-768x1024.png', { width: 768, height: 1024 }],
    ['mobile-390x844.png', { width: 390, height: 844 }],
  ] as const) {
    await page.setViewportSize(viewport);
    await page.goto('/#/');
    await expect(page.getByRole('heading', { name: 'Dashboard de rendimiento' })).toBeVisible();
    if (viewport.width <= 800) {
      await waitForSidebarPosition(page, false);
    }
    await expectNoHorizontalOverflow(page);
    await page.screenshot({ path: `${evidence}/${name}`, fullPage: true });
  }

  await page.getByRole('button', { name: 'Abrir menú' }).click();
  await expect(page.getByRole('complementary', { name: 'Navegación principal' })).toHaveClass(
    /sidebar--open/,
  );
  await waitForSidebarPosition(page, true);
  await page.screenshot({
    path: `${evidence}/mobile-navigation-open.png`,
    fullPage: true,
  });
  await page.getByRole('button', { name: 'Cerrar menú' }).first().click();
  await expect(page.getByRole('complementary', { name: 'Navegación principal' })).not.toHaveClass(
    /sidebar--open/,
  );

  expect(consoleErrors).toEqual([]);
  expect(failedAssetRequests).toEqual([]);
});
