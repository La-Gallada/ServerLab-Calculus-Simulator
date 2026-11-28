import { expect, test, type Page } from '@playwright/test';
import { evidenceDirectory } from './evidence';

const evidence = evidenceDirectory('M06');

async function expectNoHorizontalOverflow(page: Page) {
  await expect
    .poll(() => page.locator('html').evaluate((e) => e.scrollWidth <= e.clientWidth))
    .toBe(true);
}

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

/** Compara en píxeles el área sombreada con las líneas de los límites. */
async function expectAreaBetweenLimits(page: Page) {
  await expect
    .poll(() =>
      page.locator('.integral-chart').evaluate((chart) => {
        const area = chart.querySelector<SVGPathElement>('.recharts-area-area');
        const a = chart.querySelector<SVGLineElement>('.integral-limit--a line');
        const b = chart.querySelector<SVGLineElement>('.integral-limit--b line');
        if (!area || !a || !b) return 'faltan elementos';
        const box = area.getBBox();
        const left = Math.abs(box.x - Number(a.getAttribute('x1')));
        const right = Math.abs(box.x + box.width - Number(b.getAttribute('x1')));
        // La base del área debe coincidir con el cero del eje Y (parte baja de las líneas).
        const zero = Math.max(Number(a.getAttribute('y1')), Number(a.getAttribute('y2')));
        const base = Math.abs(box.y + box.height - zero);
        return left < 0.6 && right < 0.6 && base < 0.6
          ? 'ok'
          : `desfase ${left} / ${right} / ${base}`;
      }),
    )
    .toBe('ok');
}

const metrics = (page: Page) =>
  page.getByRole('region', { name: 'Indicadores del intervalo' }).locator('strong');

const limitSlider = (page: Page, which: 'inferior (a)' | 'superior (b)') =>
  page.getByRole('slider', { name: `Límite ${which}` });

async function showMetricsAtTop(page: Page) {
  // Aleja el puntero para que la evidencia no incluya un tooltip residual.
  await page.mouse.move(0, 0);
  await page
    .getByRole('region', { name: 'Indicadores del intervalo' })
    .evaluate((element) => element.scrollIntoView({ block: 'start' }));
}

test('valida el laboratorio de integrales y genera evidencia real', async ({ page }) => {
  const expectCleanPage = watchPage(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/#/integrales');
  await expect(page.getByRole('heading', { name: 'Laboratorio de integrales' })).toBeVisible();
  await expect(metrics(page)).toHaveText(['240 MB', '30 s', '5 MB/s', '11 MB/s']);
  await expectAreaBetweenLimits(page);

  // KaTeX con fuentes locales.
  await expect(page.locator('.katex').first()).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(async () => {
        await document.fonts.ready;
        return [...document.fonts].some(
          (font) => font.family.includes('KaTeX') && font.status === 'loaded',
        );
      }),
    )
    .toBe(true);
  await expect(page.locator('.katex-error')).toHaveCount(0);
  await expect
    .poll(() =>
      page
        .locator('img')
        .evaluateAll((images) => images.every((i) => (i as HTMLImageElement).naturalWidth > 0)),
    )
    .toBe(true);

  for (const [name, viewport] of [
    ['integrals-desktop-1440x900.png', { width: 1440, height: 900 }],
    ['integrals-laptop-1280x720.png', { width: 1280, height: 720 }],
    ['integrals-tablet-768x1024.png', { width: 768, height: 1024 }],
    ['integrals-mobile-390x844.png', { width: 390, height: 844 }],
  ] as const) {
    await page.setViewportSize(viewport);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expectNoHorizontalOverflow(page);
    // La tabla completa cabe sin desplazamiento interno.
    await expect
      .poll(() => page.locator('.table-scroll').evaluate((e) => e.scrollWidth <= e.clientWidth + 1))
      .toBe(true);
    await expect(page.locator('.integral-chart .recharts-surface')).toBeVisible();
    await expectAreaBetweenLimits(page);
    // Ninguna fórmula queda recortada.
    await expect
      .poll(() =>
        page
          .locator('.math-formula')
          .evaluateAll((formulas) =>
            formulas
              .filter((f) => f.scrollWidth > f.clientWidth + 1)
              .map((f) => `${f.getAttribute('aria-label')} ${f.scrollWidth}/${f.clientWidth}`),
          ),
      )
      .toEqual([]);
    await page.screenshot({ path: `${evidence}/${name}` });
  }

  await page.setViewportSize({ width: 1440, height: 900 });

  // Teclado y límites que no coinciden con la cuadrícula de muestreo.
  const lower = limitSlider(page, 'inferior (a)');
  const upper = limitSlider(page, 'superior (b)');
  await lower.focus();
  await page.keyboard.press('ArrowRight');
  await expect(lower).toHaveValue('1');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('textbox', { name: 'Valor exacto de a (s)' })).toBeFocused();
  await page.getByRole('textbox', { name: 'Valor exacto de a (s)' }).fill('7,25');
  await page.getByRole('textbox', { name: 'Valor exacto de b (s)' }).fill('22,75');
  await expect(metrics(page)).toHaveText(['124 MB', '15,5 s', '6,45 MB/s', '9,55 MB/s']);
  await expectAreaBetweenLimits(page);
  await upper.focus();
  await page.keyboard.press('ArrowLeft');
  await expect(upper).toHaveValue('22');
  await page.keyboard.press('Home');
  await expect(upper).toHaveValue('7.25');
  await expect(lower).toHaveValue('7.25');

  // Escritura inválida tecla por tecla.
  const upperField = page.getByRole('textbox', { name: 'Valor exacto de b (s)' });
  await upperField.fill('');
  await upperField.pressSequentially('12,5');
  await expect(upper).toHaveValue('12.5');
  await upperField.fill('99');
  await expect(page.getByRole('alert')).toContainText('excede el intervalo');
  await expect(upper).toHaveValue('12.5');

  await page.getByRole('button', { name: 'Reiniciar intervalo' }).click();
  await expect(metrics(page)).toHaveText(['240 MB', '30 s', '5 MB/s', '11 MB/s']);
  await expect(page.getByRole('alert')).toHaveCount(0);

  // Representación de tasa en un intervalo interior.
  await page.getByRole('button', { name: 'Fijar 5 s como límite inferior a' }).click();
  await page.getByRole('button', { name: 'Fijar 15 s como límite superior b' }).click();
  await expect(metrics(page)).toHaveText(['70 MB', '10 s', '6 MB/s', '8 MB/s']);
  await expectAreaBetweenLimits(page);
  await showMetricsAtTop(page);
  await page.screenshot({ path: `${evidence}/integrals-transfer-rate.png` });

  // Tooltip.
  const surface = page.locator('.integral-chart .recharts-surface');
  const box = await surface.boundingBox();
  await page.mouse.move(box!.x + box!.width * 0.4, box!.y + box!.height * 0.6);
  await expect(page.locator('.recharts-tooltip-wrapper')).toContainText('MB/s');
  await page.mouse.move(0, 0);

  // Datos acumulados.
  const accumulatedButton = page.getByRole('button', { name: 'Datos acumulados' });
  await accumulatedButton.focus();
  await page.keyboard.press('Enter');
  await expect(accumulatedButton).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('heading', { name: 'Datos acumulados', exact: true })).toBeVisible();
  await expect(page.locator('.integral-chart .recharts-area-area')).toHaveCount(0);
  await expect(page.locator('.integral-chart .integral-point')).toHaveCount(2);
  await expect(page.locator('.integral-chart .integral-difference line')).toHaveCount(1);
  await expect(metrics(page)).toHaveText(['70 MB', '10 s', '6 MB/s', '8 MB/s']);
  await showMetricsAtTop(page);
  await page.screenshot({ path: `${evidence}/integrals-accumulated-data.png` });
  await page.mouse.move(box!.x + box!.width * 0.4, box!.y + box!.height * 0.6);
  await expect(page.locator('.recharts-tooltip-wrapper')).toContainText('A(t)');
  await page.getByRole('button', { name: 'Tasa y área' }).click();

  // Aplicaciones académicas.
  for (const [button, name, expected] of [
    ['Cargar ejemplo [0, 30]', 'integrals-example-0-30.png', ['240 MB', '30 s', '5 MB/s']],
    ['Cargar ejemplo [10, 20]', 'integrals-example-10-20.png', ['80 MB', '10 s', '7 MB/s']],
  ] as const) {
    await page.getByRole('button', { name: button }).click();
    await expect(metrics(page)).toHaveText([...expected, /MB\/s/]);
    await expectAreaBetweenLimits(page);
    await showMetricsAtTop(page);
    await page.screenshot({ path: `${evidence}/${name}` });
  }

  await page
    .locator('.dynamic-procedure')
    .screenshot({ path: `${evidence}/integrals-mathematical-procedure.png` });

  // Intervalo de longitud cero.
  await upper.focus();
  await page.keyboard.press('Home');
  await expect(upper).toHaveValue('10');
  await expect(metrics(page)).toHaveText(['0 MB', '0 s', '7 MB/s', '7 MB/s']);
  await expect(page.locator('.integral-chart .recharts-area-area')).toHaveCount(0);
  await showMetricsAtTop(page);
  await page.screenshot({ path: `${evidence}/integrals-zero-interval.png` });

  for (const viewport of [
    { width: 390, height: 844 },
    { width: 320, height: 700 },
  ]) {
    await page.setViewportSize(viewport);
    await expectNoHorizontalOverflow(page);
  }
  await expect(page.locator('body')).not.toContainText('NaN');
  await expect(page.locator('body')).not.toContainText('Infinity');
  expectCleanPage();
});

test('conserva el estado del Dashboard y navega entre módulos', async ({ page }) => {
  const expectCleanPage = watchPage(page);
  await page.goto('/#/');
  await page.getByRole('slider', { name: 'Duración de transferencia' }).fill('18');
  await page.getByRole('slider', { name: 'Usuarios concurrentes' }).fill('42');
  await page.getByRole('button', { name: '300 ms' }).click();
  await page.getByRole('link', { name: 'Ver Integrales' }).click();
  await expect(limitSlider(page, 'inferior (a)')).toHaveValue('0');
  await expect(limitSlider(page, 'superior (b)')).toHaveValue('18');
  await page.getByRole('button', { name: 'Cargar ejemplo [10, 20]' }).click();
  await page.getByRole('link', { name: 'Ir al Dashboard' }).click();
  await expect(page.getByRole('slider', { name: 'Duración de transferencia' })).toHaveValue('18');
  await expect(page.getByRole('slider', { name: 'Usuarios concurrentes' })).toHaveValue('42');
  await expect(page.getByRole('button', { name: '300 ms' })).toHaveClass(/selected/);

  await page.getByRole('link', { name: 'Integrales', exact: true }).click();
  await expect(limitSlider(page, 'superior (b)')).toHaveValue('18');
  for (const [link, heading] of [
    ['Repasar Límites', 'Laboratorio de límites'],
    ['Repasar Derivadas', 'Laboratorio de derivadas'],
    ['Ver Optimización', 'Laboratorio de optimización'],
  ] as const) {
    await page.getByRole('link', { name: link }).click();
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
    await page.goBack();
    await expect(page.getByRole('heading', { name: 'Laboratorio de integrales' })).toBeVisible();
  }
  expectCleanPage();
});
