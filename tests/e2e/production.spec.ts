import { expect, test, type Page } from '@playwright/test';
import { evidenceDirectory } from './evidence';

const evidence = evidenceDirectory('M10');

/** Registra bloqueos de la política, errores de consola y solicitudes anómalas. */
async function watchPolicy(page: Page) {
  const problems: string[] = [];
  await page.exposeFunction('reportViolation', (text: string) => problems.push(`CSP ${text}`));
  await page.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (event) => {
      const report = (window as unknown as { reportViolation: (text: string) => void })
        .reportViolation;
      report(`${event.violatedDirective} ${event.blockedURI}`);
    });
  });
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') problems.push(message.text());
  });
  page.on('pageerror', (error) => problems.push(error.message));
  page.on('requestfailed', (request) => problems.push(request.url()));
  page.on('response', (response) => {
    if (response.status() >= 400) problems.push(`${response.status()} ${response.url()}`);
  });
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.protocol.startsWith('http') && url.hostname !== '127.0.0.1') problems.push(url.href);
  });
  return problems;
}

const policy = {
  'default-src': "'none'",
  'script-src': "'self'",
  'style-src': "'self' 'unsafe-inline'",
  'img-src': "'self' data: blob:",
  'font-src': "'self'",
  'connect-src': "'self'",
  'frame-ancestors': "'none'",
  'object-src': "'none'",
};

test('aplica los encabezados de seguridad a documentos y recursos', async ({ page, request }) => {
  const response = (await page.goto('/#/'))!;
  const headers = response.headers();
  for (const [directive, value] of Object.entries(policy))
    expect(headers['content-security-policy']).toContain(`${directive} ${value}`);
  expect(headers['content-security-policy']).not.toMatch(/unsafe-eval|script-src[^;]*unsafe|\*/);
  expect(headers['x-content-type-options']).toBe('nosniff');
  expect(headers['x-frame-options']).toBe('DENY');
  expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
  expect(headers['permissions-policy']).toContain('camera=()');
  const icon = await request.get('/favicon.ico');
  expect(icon.headers()['x-content-type-options']).toBe('nosniff');
  // El archivo de reglas no se publica.
  const rules = await request.get('/_headers');
  expect(rules.headers()['content-type']).toContain('text/html');
});

test('la política bloquea lo no permitido y no afecta a la aplicación', async ({ page }) => {
  await page.goto('/#/');
  const blocked = await page.evaluate(async () => {
    const seen: string[] = [];
    document.addEventListener('securitypolicyviolation', (e) => seen.push(e.violatedDirective));
    const inline = document.createElement('script');
    inline.textContent = 'window.inlineRan = true';
    document.body.append(inline);
    const external = document.createElement('img');
    external.src = 'https://example.invalid/pixel.png';
    document.body.append(external);
    const frame = document.createElement('iframe');
    frame.src = '/';
    document.body.append(frame);
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { seen, ran: 'inlineRan' in window };
  });
  expect(blocked.ran).toBe(false);
  expect(blocked.seen.join(' ')).toMatch(/script-src/);
  expect(blocked.seen.join(' ')).toMatch(/img-src/);
  expect(blocked.seen.join(' ')).toMatch(/frame-src|default-src|child-src/);
});

test('recorre rutas y genera todos los formatos bajo la política', async ({ page }) => {
  test.setTimeout(120_000);
  const problems = await watchPolicy(page);
  for (const [hash, title] of [
    ['#/', 'Dashboard de rendimiento'],
    ['#/limites', 'Laboratorio de límites'],
    ['#/derivadas', 'Laboratorio de derivadas'],
    ['#/integrales', 'Laboratorio de integrales'],
    ['#/optimizacion', 'Laboratorio de optimización'],
    ['#/acerca', 'Acerca de ServerLab'],
    ['#/exportaciones', 'Centro de exportaciones'],
  ]) {
    await page.goto(`/${hash}`);
    await expect(page.getByRole('heading', { name: title, level: 1 })).toBeVisible();
  }
  await expect
    .poll(() =>
      page.locator('.export-preview img').evaluate((e) => (e as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0);
  for (const format of ['PNG', 'SVG', 'CSV']) {
    await page.getByRole('radio', { name: new RegExp(`^${format}`) }).check();
    const waiting = page.waitForEvent('download');
    await page.getByRole('button', { name: `Descargar ${format}` }).click();
    expect(await (await waiting).failure()).toBeNull();
  }
  const zip = page.waitForEvent('download', { timeout: 60_000 });
  await page.getByRole('button', { name: 'Descargar paquete' }).click();
  expect(await (await zip).failure()).toBeNull();
  await page.waitForTimeout(300);
  expect(problems).toEqual([]);
});

test('publica sólo lo necesario y metadatos coherentes', async ({ page, request }) => {
  await page.goto('/#/');
  const meta = async (selector: string) => page.locator(selector).getAttribute('content');
  const site = 'https://serverlab-calculus-simulator.pages.dev/';
  expect(await page.locator('html').getAttribute('lang')).toBe('es');
  expect(await page.locator('link[rel="canonical"]').getAttribute('href')).toBe(site);
  expect(await meta('meta[name="author"]')).toBe('Grupo #4');
  expect(await meta('meta[property="og:url"]')).toBe(site);
  expect(await meta('meta[property="og:image"]')).toBe(`${site}og-image.png`);
  expect(await meta('meta[name="description"]')).toContain('hipotético');
  const image = await request.get('/og-image.png');
  expect(image.headers()['content-type']).toBe('image/png');
  const body = await image.body();
  expect([body.readUInt32BE(16), body.readUInt32BE(20)]).toEqual([1200, 630]);
  // Las copias sin uso ya no se publican.
  for (const path of [
    '/assets/branding/serverlab-logo-full.png',
    '/assets/icons/icon-limits.png',
  ]) {
    const response = await request.get(path);
    expect(response.headers()['content-type'], path).toContain('text/html');
  }
});

test('genera la evidencia visual de la versión candidata', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const [hash, title, name] of [
    ['#/', 'Dashboard de rendimiento', 'candidate-dashboard'],
    ['#/exportaciones', 'Centro de exportaciones', 'candidate-exports'],
    ['#/acerca', 'Acerca de ServerLab', 'candidate-about'],
  ]) {
    await page.goto(`/${hash}`);
    await expect(page.getByRole('heading', { name: title, level: 1 })).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: `${evidence}/${name}.png`,
      fullPage: name === 'candidate-about',
    });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/acerca');
  await expect(page.getByRole('contentinfo')).toContainText('Grupo #4');
  await page
    .getByRole('contentinfo')
    .screenshot({ path: `${evidence}/candidate-footer-mobile.png` });
});
