import { expect, test, type Page } from '@playwright/test';
import { evidenceDirectory } from './evidence';

const evidence = evidenceDirectory('M07');

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

async function expectResponsive(page: Page) {
  await expect
    .poll(() => page.locator('html').evaluate((e) => e.scrollWidth <= e.clientWidth))
    .toBe(true);
  // Ni la tabla ni las fórmulas requieren desplazamiento interno.
  await expect
    .poll(() =>
      page
        .locator('.opt-table .table-scroll, .math-formula')
        .evaluateAll((elements) =>
          elements
            .filter((e) => e.scrollWidth > e.clientWidth + 1)
            .map(
              (e) =>
                `${e.getAttribute('aria-label')} ${e.scrollWidth}/${e.clientWidth} ${e.className}`,
            ),
        ),
    )
    .toEqual([]);
}

/** Etiquetas SVG de las gráficas que se enciman o salen de su lienzo. */
async function expectLegibleLabels(page: Page) {
  await expect
    .poll(() =>
      page.locator('.opt-chart svg.recharts-surface').evaluateAll((surfaces) =>
        surfaces.flatMap((surface) => {
          const frame = surface.getBoundingClientRect();
          const labels = [...surface.querySelectorAll('text')]
            .filter((node) => node.textContent?.trim())
            .map((node) => ({ text: node.textContent, box: node.getBoundingClientRect() }));
          const problems: string[] = [];
          labels.forEach((first, index) => {
            if (
              first.box.left < frame.left - 1 ||
              first.box.right > frame.right + 1 ||
              first.box.top < frame.top - 1 ||
              first.box.bottom > frame.bottom + 1
            )
              problems.push(
                `recortada: ${first.text} ${Math.round(first.box.left - frame.left)} ${Math.round(frame.right - first.box.right)} ${Math.round(first.box.top - frame.top)} ${Math.round(frame.bottom - first.box.bottom)} ${innerWidth}`,
              );
            for (const second of labels.slice(index + 1)) {
              const x =
                Math.min(first.box.right, second.box.right) -
                Math.max(first.box.left, second.box.left);
              const y =
                Math.min(first.box.bottom, second.box.bottom) -
                Math.max(first.box.top, second.box.top);
              if (x > 1 && y > 1) problems.push(`encimadas: ${first.text} / ${second.text}`);
            }
          });
          return problems;
        }),
      ),
    )
    .toEqual([]);
}

/** Comprueba en píxeles que regiones, frontera, umbral y curva coinciden. */
async function expectGeometry(page: Page) {
  await expect
    .poll(() =>
      page.locator('[data-figure-id="optimization-response-region"]').evaluate((figure) => {
        const box = (selector: string) =>
          figure.querySelector<SVGGraphicsElement>(selector)?.getBBox();
        const number = (selector: string, attribute: string) =>
          Number(figure.querySelector(selector)?.getAttribute(attribute));
        const feasible = box('.opt-region--feasible path');
        const infeasible = box('.opt-region--infeasible path');
        const frontier = number('.opt-frontier line', 'x1');
        const threshold = number('.opt-threshold line', 'y1');
        const capacity = number('.opt-capacity line', 'x1');
        if (!feasible || !infeasible || !Number.isFinite(frontier)) return 'faltan elementos';
        const ring = figure.querySelector('.opt-point--intersection');
        const errors = [
          Math.abs(feasible.x + feasible.width - frontier),
          Math.abs(infeasible.x - frontier),
          Math.abs(infeasible.x + infeasible.width - capacity),
          Math.abs(Number(ring?.getAttribute('cx')) - frontier),
          Math.abs(Number(ring?.getAttribute('cy')) - threshold),
        ];
        return errors.every((error) => error < 0.8) ? 'ok' : errors.join(' / ');
      }),
    )
    .toBe('ok');
}

const metrics = (page: Page) =>
  page.getByRole('region', { name: 'Indicadores principales' }).locator('strong');
const preset = (page: Page, name: string | RegExp) =>
  page
    .getByRole('group', { name: 'Umbrales predefinidos' })
    .getByRole('button', { name, exact: typeof name === 'string' });
const field = (page: Page) => page.getByRole('textbox', { name: 'Valor exacto de L (ms)' });

async function showAtTop(page: Page, selector: string) {
  // Aleja el puntero para que la evidencia no incluya un tooltip residual.
  await page.mouse.move(0, 0);
  await page.locator(selector).evaluate((element) => element.scrollIntoView({ block: 'start' }));
}

test('valida el laboratorio de optimización y genera evidencia', async ({ page }) => {
  const expectCleanPage = watchPage(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/#/optimizacion');
  await expect(page.getByRole('heading', { name: 'Laboratorio de optimización' })).toBeVisible();
  await expect(metrics(page)).toHaveText(['500 ms', '66 usuarios', '65 usuarios', '471,43 ms']);

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
    ['optimization-desktop-1440x900.png', { width: 1440, height: 900 }],
    ['optimization-laptop-1280x720.png', { width: 1280, height: 720 }],
    ['optimization-tablet-768x1024.png', { width: 768, height: 1024 }],
    ['optimization-mobile-390x844.png', { width: 390, height: 844 }],
  ] as const) {
    await page.setViewportSize(viewport);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(page.locator('.opt-chart .recharts-surface')).toHaveCount(3);
    await expectResponsive(page);
    await expectGeometry(page);
    await expectLegibleLabels(page);
    await page.screenshot({ path: `${evidence}/${name}` });
  }

  await page.setViewportSize({ width: 1440, height: 900 });

  for (const [name, button, expected] of [
    ['optimization-threshold-300.png', '300 ms', ['300 ms', '50 usuarios']],
    ['optimization-threshold-1000.png', /^1\s000 ms$/, [/^1\s000 ms$/, '81 usuarios']],
    ['optimization-threshold-500.png', '500 ms', ['500 ms', '66 usuarios']],
  ] as const) {
    await preset(page, button).click();
    await expect(metrics(page)).toHaveText([...expected, '65 usuarios', '471,43 ms']);
    await expectGeometry(page);
    await expectLegibleLabels(page);
    await showAtTop(page, '.opt-solution');
    await page.screenshot({ path: `${evidence}/${name}` });
  }

  await page
    .locator('.opt-verification')
    .screenshot({ path: `${evidence}/optimization-integer-verification.png` });
  await page
    .locator('[data-figure-id="optimization-threshold-capacity"]')
    .locator('xpath=..')
    .screenshot({ path: `${evidence}/optimization-threshold-capacity.png` });
  await page
    .locator('.opt-procedure')
    .screenshot({ path: `${evidence}/optimization-mathematical-procedure.png` });

  // Tooltip.
  const surface = page.locator('.opt-chart .recharts-surface').first();
  await surface.scrollIntoViewIfNeeded();
  const area = (await surface.boundingBox())!;
  await page.mouse.move(area.x + area.width * 0.4, area.y + area.height * 0.6);
  await expect(page.locator('.recharts-tooltip-wrapper').first()).toContainText('factible');
  await page.mouse.move(0, 0);

  // Dominio completo: toda la curva cabe y la intersección sigue siendo correcta.
  await page.getByRole('button', { name: 'Dominio completo' }).click();
  await expectGeometry(page);
  await expect(page.getByTestId('opt-outside')).toHaveText('');
  await page.getByRole('button', { name: 'Vista enfocada' }).click();
  await expect(page.getByTestId('opt-outside')).toContainText('R(99)');

  // Teclado en ambos controles.
  const load = page.getByRole('slider', { name: 'Usuarios de análisis' });
  await load.focus();
  await page.keyboard.press('End');
  await expect(load).toHaveValue('99');
  await expect(page.getByTestId('opt-outside')).toContainText('queda fuera de la vista');
  await page.keyboard.press('Home');
  await expect(load).toHaveValue('0');
  const threshold = page.getByRole('slider', { name: 'Umbral de respuesta' });
  await threshold.focus();
  await page.keyboard.press('ArrowRight');
  await expect(threshold).toHaveValue('501');

  // Escritura tecla por tecla: nada se aplica hasta confirmar.
  await field(page).fill('');
  await field(page).pressSequentially('350,5');
  await expect(threshold).toHaveValue('501');
  await page.keyboard.press('Enter');
  await expect(threshold).toHaveValue('350.5');
  await page.keyboard.press('Tab');
  await threshold.focus();
  await page.keyboard.press('ArrowLeft');
  await expect(threshold).toHaveValue('350');
  // Una entrada inválida no se aplica y el siguiente clic no se pierde.
  await field(page).fill('abc');
  await preset(page, '300 ms').click();
  await expect(metrics(page).first()).toHaveText('300 ms');
  await expect(page.getByRole('alert')).toHaveCount(0);
  await field(page).fill('-1');
  await page.getByRole('button', { name: 'Reiniciar laboratorio' }).click();
  await expect(metrics(page).first()).toHaveText('500 ms');
  await expect(load).toHaveValue('65');
  await expect(page.getByRole('alert')).toHaveCount(0);

  // Último usuario operativo.
  await preset(page, 'Último usuario: R(99)').click();
  await expect(metrics(page).nth(1)).toHaveText('99 usuarios');
  await expect(page.locator('.opt-verification')).toContainText('no se evalúa');
  await expectGeometry(page);
  await expectLegibleLabels(page);
  await field(page).fill('25000');
  await field(page).press('Enter');
  await expectGeometry(page);
  await expectLegibleLabels(page);

  // Sin solución factible.
  await preset(page, '50 ms').click();
  await expect(metrics(page).nth(1)).toHaveText('Sin solución');
  await expect(page.locator('.opt-region--feasible')).toHaveCount(0);
  await expect(page.locator('.opt-frontier')).toHaveCount(0);
  await expect(page.locator('.opt-point--maximum')).toHaveCount(0);
  await expectLegibleLabels(page);
  await showAtTop(page, '.opt-solution');
  await page.screenshot({ path: `${evidence}/optimization-no-feasible-solution.png` });

  // Umbral igual al tiempo base.
  await preset(page, '100 ms').click();
  await expect(metrics(page).nth(1)).toHaveText('0 usuarios');
  await expect(page.locator('.opt-region--feasible')).toHaveCount(0);
  await expect(page.locator('.opt-frontier')).toHaveCount(1);
  await expectLegibleLabels(page);
  await showAtTop(page, '.opt-solution');
  await page.screenshot({ path: `${evidence}/optimization-base-threshold.png` });

  for (const viewport of [
    { width: 390, height: 844 },
    { width: 320, height: 700 },
  ]) {
    await page.setViewportSize(viewport);
    for (const name of ['50 ms', '100 ms', '500 ms', 'Último usuario: R(99)']) {
      await preset(page, name).click();
      await expectResponsive(page);
      await expectLegibleLabels(page);
    }
  }
  await expect(page.locator('body')).not.toContainText(/NaN|Infinity|undefined/);
  expectCleanPage();
});

test('mantiene el Dashboard independiente y navega entre módulos', async ({ page }) => {
  const expectCleanPage = watchPage(page);
  await page.goto('/#/');
  await page.getByRole('slider', { name: 'Usuarios concurrentes' }).fill('42');
  await page.getByRole('button', { name: '300 ms' }).click();
  await page.getByRole('link', { name: 'Ver Optimización' }).click();
  await expect(metrics(page)).toHaveText(['300 ms', '50 usuarios', '42 usuarios', /ms$/]);
  await preset(page, /^1\s000 ms$/).click();
  await page.getByRole('slider', { name: 'Usuarios de análisis' }).fill('90');
  await page.getByRole('button', { name: 'Cargar escenario de 50 ms' }).click();
  await page.getByRole('link', { name: 'Ir al Dashboard' }).click();
  await expect(page.getByRole('slider', { name: 'Usuarios concurrentes' })).toHaveValue('42');
  await expect(page.getByRole('button', { name: '300 ms' })).toHaveClass(/selected/);

  await page.getByRole('link', { name: 'Optimización', exact: true }).click();
  await expect(metrics(page)).toHaveText(['300 ms', '50 usuarios', '42 usuarios', /ms$/]);
  for (const [link, heading] of [
    ['Repasar Límites', 'Laboratorio de límites'],
    ['Repasar Derivadas', 'Laboratorio de derivadas'],
    ['Repasar Integrales', 'Laboratorio de integrales'],
    ['Acerca del proyecto', 'Acerca de ServerLab'],
  ] as const) {
    await page.getByRole('link', { name: link }).click();
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
    await page.goBack();
    await expect(page.getByRole('heading', { name: 'Laboratorio de optimización' })).toBeVisible();
  }
  expectCleanPage();
});
