import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { evidenceDirectory } from './evidence';

const evidence = evidenceDirectory('M09');

const routes = [
  ['#/', 'Dashboard de rendimiento', 'dashboard'],
  ['#/limites', 'Laboratorio de límites', 'limits'],
  ['#/derivadas', 'Laboratorio de derivadas', 'derivatives'],
  ['#/integrales', 'Laboratorio de integrales', 'integrals'],
  ['#/optimizacion', 'Laboratorio de optimización', 'optimization'],
  ['#/exportaciones', 'Centro de exportaciones', 'exports'],
  ['#/acerca', 'Acerca de ServerLab', 'about'],
  ['#/no-existe', 'Ruta no encontrada', 'not-found'],
] as const;

function watchPage(page: Page) {
  const errors: string[] = [];
  const failed: string[] = [];
  const external: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('requestfailed', (request) => failed.push(request.url()));
  page.on('response', (response) => {
    if (response.status() >= 400) failed.push(`${response.status()} ${response.url()}`);
  });
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.protocol.startsWith('http') && url.hostname !== '127.0.0.1') external.push(url.href);
  });
  return () => {
    expect(errors).toEqual([]);
    expect(failed).toEqual([]);
    expect(external).toEqual([]);
  };
}

const heading = (page: Page, name: string) => page.getByRole('heading', { name, level: 1 });

async function expectNoOverflow(page: Page) {
  await expect
    .poll(() => page.locator('html').evaluate((e) => e.scrollWidth <= e.clientWidth))
    .toBe(true);
}

async function expectAccessible(page: Page, context: string) {
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
    .analyze();
  expect(
    violations.map(
      (v) =>
        `${context} ${v.id} (${v.impact}): ${v.nodes
          .slice(0, 4)
          .map((n) => `${n.target.join(' ')} ${n.failureSummary?.split('\n')[1] ?? ''}`)
          .join(' | ')}`,
    ),
  ).toEqual([]);
}

async function ready(page: Page) {
  await expect(page.locator('.route-loading')).toHaveCount(0);
  await page.evaluate(() => document.fonts.ready);
}

for (const width of [1280, 390]) {
  test(`sin infracciones detectables por axe a ${width} px`, async ({ page }) => {
    test.setTimeout(120_000);
    const expectCleanPage = watchPage(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width, height: 800 });
    for (const [hash, title] of routes) {
      await page.goto(`/${hash}`);
      await expect(heading(page, title)).toBeVisible();
      await ready(page);
      await expectAccessible(page, hash);
    }
    // Estados que sólo aparecen tras interactuar.
    await page.goto('/#/integrales');
    await ready(page);
    const field = page.getByRole('textbox', { name: 'Valor exacto de b (s)' });
    await field.fill('99');
    await field.press('Enter');
    await expect(page.getByRole('alert')).toBeVisible();
    await expectAccessible(page, 'integrales con error');
    await page.getByRole('button', { name: 'Exportar gráfica principal' }).click();
    await expect(page.getByRole('dialog').getByRole('img')).toBeVisible();
    await expectAccessible(page, 'diálogo');
    await page.keyboard.press('Escape');
    if (width < 800) {
      await page.getByRole('button', { name: 'Abrir menú' }).click();
      // Se analiza cuando el panel terminó de entrar.
      await expect.poll(async () => (await page.locator('.sidebar').boundingBox())?.x).toBe(0);
      await expectAccessible(page, 'menú móvil');
    }
    expectCleanPage();
  });
}

test('mantiene todas las rutas sin desbordamiento en los cinco tamaños', async ({ page }) => {
  test.setTimeout(180_000);
  const expectCleanPage = watchPage(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const [width, height] of [
    [1440, 900],
    [1280, 720],
    [768, 1024],
    [390, 844],
    [320, 700],
  ]) {
    await page.setViewportSize({ width, height });
    for (const [hash, title] of routes) {
      await page.goto(`/${hash}`);
      await expect(heading(page, title)).toBeVisible();
      await ready(page);
      await expectNoOverflow(page);
      // Ningún texto de tarjetas, botones o campos queda recortado por su contenedor.
      expect(
        await page
          .locator('main .card strong, main button, main .math-formula, main h1, main h2')
          .evaluateAll((elements) =>
            elements
              .filter((e) => e.clientWidth > 0 && e.scrollWidth > e.clientWidth + 1)
              .map((e) => `${e.tagName} ${e.textContent?.slice(0, 40)}`),
          ),
        `${hash} ${width}`,
      ).toEqual([]);
    }
  }
  expectCleanPage();
});

test('descarga cada pantalla sólo cuando se visita', async ({ page }) => {
  const expectCleanPage = watchPage(page);
  const scripts: string[] = [];
  page.on('request', (request) => {
    const name = new URL(request.url()).pathname.split('/').pop()!;
    if (/\.(js|css)$/.test(name)) scripts.push(name);
  });
  const loaded = (prefix: string) => scripts.some((name) => name.startsWith(`${prefix}-`));
  await page.goto('/#/');
  await expect(heading(page, 'Dashboard de rendimiento')).toBeVisible();
  await page.waitForLoadState('networkidle');
  expect(scripts).toHaveLength(2);
  for (const chunk of ['Formula', 'LimitsLab', 'ExportPanel', 'ExportCenter', 'About'])
    expect(loaded(chunk), chunk).toBe(false);

  // Con la red lenta se anuncia la carga.
  let release = () => {};
  const gate = new Promise<void>((resolve) => (release = resolve));
  await page.route(/IntegralsLab-.*\.js$/, async (route) => {
    await gate;
    await route.continue();
  });
  await page.getByRole('link', { name: 'Integrales', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Cargando la sección' })).toBeVisible();
  release();
  await expect(heading(page, 'Laboratorio de integrales')).toBeVisible();
  // El fragmento «Formula» contiene KaTeX y su hoja de estilos.
  expect(loaded('Formula')).toBe(true);
  expect(loaded('ExportPanel')).toBe(false);
  await page.getByRole('button', { name: 'Exportar gráfica principal' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(loaded('ExportPanel')).toBe(true);
  expectCleanPage();
});

test('permite recuperarse si una pantalla no se descarga', async ({ page }) => {
  await page.goto('/#/');
  await page.route(/DerivativesLab-.*\.js$/, (route) => route.abort());
  await page.getByRole('link', { name: 'Derivadas', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('No fue posible mostrar esta sección');
  await page.getByRole('link', { name: 'Integrales', exact: true }).click();
  await expect(heading(page, 'Laboratorio de integrales')).toBeVisible();
  await page.unroute(/DerivativesLab-.*\.js$/);
  await page.getByRole('link', { name: 'Derivadas', exact: true }).click();
  await page.getByRole('button', { name: 'Recargar la página' }).click();
  await expect(heading(page, 'Laboratorio de derivadas')).toBeVisible();
});

test('gestiona título, foco, desplazamiento, teclado y menú móvil', async ({ page }) => {
  const expectCleanPage = watchPage(page);
  await page.goto('/#/integrales');
  await ready(page);
  await page.keyboard.press('Tab');
  const skip = page.getByRole('button', { name: 'Saltar al contenido' });
  await expect(skip).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();

  await page.getByRole('link', { name: 'Repasar Derivadas' }).click();
  await expect(heading(page, 'Laboratorio de derivadas')).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await expect(page).toHaveTitle('Derivadas · ServerLab');
  await expect(page.locator('main')).toBeFocused();

  // Los procedimientos muestran numeración.
  for (const hash of ['#/limites', '#/derivadas', '#/integrales', '#/optimizacion']) {
    await page.goto(`/${hash}`);
    await ready(page);
    const styles = await page
      .locator('.procedure-card ol')
      .evaluateAll((lists) => lists.map((list) => getComputedStyle(list).listStyleType));
    expect(styles.length).toBeGreaterThan(0);
    expect(new Set(styles)).toEqual(new Set(['decimal']));
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/');
  const dashboardLink = page.locator('.sidebar a', { hasText: 'Dashboard' });
  await expect(dashboardLink).toBeHidden();
  const menu = page.getByRole('button', { name: 'Abrir menú' });
  await menu.focus();
  await page.keyboard.press('Enter');
  await expect(dashboardLink).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(menu).toBeFocused();
  await expect(dashboardLink).toBeHidden();
  expectCleanPage();
});

test('valida campos regionales y libera los recursos de exportación', async ({ page }) => {
  test.setTimeout(120_000);
  const expectCleanPage = watchPage(page);
  await page.addInitScript(() => {
    const live = new Set<string>();
    const create = URL.createObjectURL.bind(URL);
    const revoke = URL.revokeObjectURL.bind(URL);
    URL.createObjectURL = (blob) => {
      const url = create(blob);
      live.add(url);
      return url;
    };
    URL.revokeObjectURL = (url) => {
      live.delete(url);
      revoke(url);
    };
    Object.assign(window, { liveObjectUrls: live });
  });
  await page.goto('/#/optimizacion');
  await ready(page);
  const field = page.getByRole('textbox', { name: 'Valor exacto de L (ms)' });
  const metrics = page.getByRole('region', { name: 'Indicadores principales' }).locator('strong');
  await field.fill('1 000');
  await field.press('Enter');
  await expect(metrics.nth(1)).toHaveText('81 usuarios');
  await field.fill('1.000');
  await field.press('Enter');
  await expect(page.getByRole('alert')).toContainText('ambiguo');
  await expect(metrics.nth(1)).toHaveText('81 usuarios');

  await page.goto('/#/exportaciones');
  await ready(page);
  await page.getByRole('combobox', { name: 'Resolución PNG' }).selectOption('max');
  for (let index = 0; index < 6; index += 1) {
    const waiting = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Descargar PNG' }).click();
    expect(await (await waiting).failure()).toBeNull();
    await expect(page.getByRole('button', { name: 'Descargar PNG' })).toBeEnabled();
  }
  await expect
    .poll(
      () =>
        page.evaluate(
          () => (window as unknown as { liveObjectUrls: Set<string> }).liveObjectUrls.size,
        ),
      { timeout: 20_000 },
    )
    .toBe(0);
  expectCleanPage();
});

test('genera la evidencia visual de la auditoría', async ({ page }) => {
  test.setTimeout(120_000);
  const expectCleanPage = watchPage(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const shot = async (name: string) => {
    await page.mouse.move(0, 0);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `${evidence}/${name}.png` });
  };
  const open = async (hash: string, title: string) => {
    await page.goto(`/${hash}`);
    await expect(heading(page, title)).toBeVisible();
    await ready(page);
  };
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const [hash, title, name] of routes.slice(0, 7)) {
    await open(hash, title);
    if (name === 'exports') await expect(page.locator('.export-preview img')).toBeVisible();
    await shot(`audit-${name}-desktop`);
  }
  await open('#/acerca', 'Acerca de ServerLab');
  await page.screenshot({ path: `${evidence}/audit-about-full.png`, fullPage: true });
  await open('#/no-existe', 'Ruta no encontrada');
  await shot('audit-not-found');

  for (const [hash, title, name] of [
    ['#/limites', 'Laboratorio de límites', 'limits'],
    ['#/derivadas', 'Laboratorio de derivadas', 'derivatives'],
  ] as const) {
    await open(hash, title);
    await page
      .locator('.procedure-card')
      .first()
      .screenshot({ path: `${evidence}/audit-${name}-numbering.png` });
  }

  await open('#/integrales', 'Laboratorio de integrales');
  const upper = page.getByRole('textbox', { name: 'Valor exacto de b (s)' });
  await upper.fill('35');
  await upper.press('Enter');
  await page
    .locator('.interval-card')
    .screenshot({ path: `${evidence}/audit-numeric-validation.png` });
  await upper.press('Escape');

  await open('#/optimizacion', 'Laboratorio de optimización');
  const threshold = page.getByRole('textbox', { name: 'Valor exacto de L (ms)' });
  await threshold.fill('1.000');
  await threshold.press('Enter');
  await page
    .locator('.opt-controls')
    .screenshot({ path: `${evidence}/audit-optimization-ambiguous.png` });

  await open('#/exportaciones', 'Centro de exportaciones');
  await expect(page.locator('.export-preview img')).toBeVisible();
  await page
    .locator('.export-preview')
    .screenshot({ path: `${evidence}/audit-academic-preview.png` });

  await page.setViewportSize({ width: 390, height: 844 });
  await open('#/', 'Dashboard de rendimiento');
  await shot('audit-dashboard-mobile');
  await page.getByRole('button', { name: 'Abrir menú' }).click();
  await expect(page.locator('.sidebar a', { hasText: 'Acerca de' })).toBeVisible();
  await expect.poll(async () => (await page.locator('.sidebar').boundingBox())?.x).toBe(0);
  await shot('audit-mobile-navigation');
  await open('#/exportaciones', 'Centro de exportaciones');
  await shot('audit-exports-mobile');
  expectCleanPage();
});

test('mantiene completos los rótulos de las gráficas interactivas', async ({ page }) => {
  const expectCleanPage = watchPage(page);
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const [hash, card] of [
      ['#/', '.chart-card--response'],
      ['#/limites', '.limits-chart-card'],
      ['#/derivadas', '.derivative-chart-card'],
    ] as const) {
      await page.goto(`/${hash}`);
      await ready(page);
      await expect(page.locator(`${card} .recharts-surface`).first()).toBeVisible();
      await expect
        .poll(() =>
          page.locator(card).evaluate((element) => {
            const frame = element.getBoundingClientRect();
            const labels = [...element.querySelectorAll('svg text, .recharts-legend-item-text')]
              .filter((node) => node.textContent?.trim())
              .map((node) => ({ text: node.textContent, box: node.getBoundingClientRect() }));
            const surface = element.querySelector('.recharts-wrapper')!.getBoundingClientRect();
            const problems: string[] = [];
            labels.forEach((first, index) => {
              if (
                first.box.left < Math.max(frame.left, surface.left) - 1 ||
                first.box.right > Math.min(frame.right, surface.right) + 1
              )
                problems.push(`recortado: ${first.text}`);
              for (const second of labels.slice(index + 1)) {
                const x =
                  Math.min(first.box.right, second.box.right) -
                  Math.max(first.box.left, second.box.left);
                const y =
                  Math.min(first.box.bottom, second.box.bottom) -
                  Math.max(first.box.top, second.box.top);
                if (x > 2 && y > 3) problems.push(`encimados: ${first.text} / ${second.text}`);
              }
            });
            return problems;
          }),
        )
        .toEqual([]);
    }
  }
  expectCleanPage();
});

test('sirve los iconos oficiales declarados, sin errores', async ({ page }) => {
  const expectCleanPage = watchPage(page);
  await page.goto('/#/');
  const declared = await page
    .locator('link[rel="icon"], link[rel="apple-touch-icon"]')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href')!));
  const expected: [path: string, size: number][] = [
    ['/favicon-16x16.png', 16],
    ['/favicon-32x32.png', 32],
    ['/icon-192x192.png', 192],
    ['/icon-512x512.png', 512],
    ['/apple-touch-icon.png', 180],
  ];
  expect([...declared].sort()).toEqual(['/favicon.ico', ...expected.map((e) => e[0])].sort());
  for (const [path, size] of expected) {
    const response = await page.request.get(path);
    expect(response.status(), path).toBe(200);
    expect(response.headers()['content-type']).toBe('image/png');
    const body = await response.body();
    expect([body.readUInt32BE(16), body.readUInt32BE(20)]).toEqual([size, size]);
    // RGBA: se conserva la transparencia del isotipo.
    expect(body[25]).toBe(6);
  }
  const response = await page.request.get('/favicon.ico');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('image/');
  const ico = await response.body();
  expect([ico.readUInt16LE(0), ico.readUInt16LE(2), ico.readUInt16LE(4)]).toEqual([0, 1, 3]);
  expect([ico[6], ico[22], ico[38]]).toEqual([16, 32, 48]);
  // El navegador decodifica cada icono declarado.
  for (const href of declared)
    expect(
      await page.evaluate(async (src) => {
        const image = new Image();
        image.src = src;
        await image.decode();
        return image.naturalWidth;
      }, href),
      href,
    ).toBeGreaterThan(0);
  expectCleanPage();
});
