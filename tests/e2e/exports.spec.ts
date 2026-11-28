import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { crc32 } from 'node:zlib';
import { expect, test, type Download, type Locator, type Page } from '@playwright/test';
import { accumulatedData, responseTime, transferredData } from '../../src/math';
import { evidenceDirectory } from './evidence';

const evidence = evidenceDirectory('M08');
const generated = `${evidence}/generated`;

/** [identificador, categoría] en el orden del catálogo. */
const catalog = [
  ['dashboard-response-time', 'dashboard'],
  ['limits-zero-approach', 'limits'],
  ['limits-capacity-approach', 'limits'],
  ['derivatives-tangent', 'derivatives'],
  ['derivatives-first', 'derivatives'],
  ['derivatives-second', 'derivatives'],
  ['integrals-rate-area', 'integrals'],
  ['integrals-accumulated-data', 'integrals'],
  ['integrals-example-0-30', 'integrals'],
  ['integrals-example-10-20', 'integrals'],
  ['optimization-response-region', 'optimization'],
  ['optimization-integer-verification', 'optimization'],
  ['optimization-threshold-capacity', 'optimization'],
  ['optimization-scenario-300', 'optimization'],
  ['optimization-scenario-500', 'optimization'],
] as const;

/** Una muestra SVG y CSV por categoría. */
const samples = new Set([
  'dashboard-response-time',
  'limits-capacity-approach',
  'derivatives-tangent',
  'integrals-example-10-20',
  'optimization-threshold-capacity',
]);

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

async function expectNoOverflow(page: Page) {
  await expect
    .poll(() => page.locator('html').evaluate((e) => e.scrollWidth <= e.clientWidth))
    .toBe(true);
}

async function download(page: Page, scope: Page | Locator, format: 'PNG' | 'SVG' | 'CSV') {
  // La pestaña auxiliar de inspección deja ésta en segundo plano; Edge la pausa.
  await page.bringToFront();
  await scope.getByRole('radio', { name: new RegExp(`^${format}`) }).check();
  const waiting = page.waitForEvent('download');
  await scope.getByRole('button', { name: `Descargar ${format}` }).click();
  const file: Download = await waiting;
  expect(await file.failure()).toBeNull();
  // El mensaje de éxito sólo aparece con el archivo ya generado.
  await expect(scope.locator('.export-status--done')).toContainText(file.suggestedFilename());
  const bytes = await readFile((await file.path())!);
  return { file, bytes, name: file.suggestedFilename() };
}

/** Comprueba firma, dimensiones, opacidad, fondo y contenido real de un PNG. */
async function expectPng(
  page: Page,
  bytes: Buffer,
  width: number,
  height: number,
  background: [number, number, number],
) {
  expect([...bytes.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
  expect(bytes.subarray(12, 16).toString('ascii')).toBe('IHDR');
  expect([bytes.readUInt32BE(16), bytes.readUInt32BE(20)]).toEqual([width, height]);
  const stats = await page.evaluate(
    async ({ base64, color }) => {
      const raw = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      const bitmap = await createImageBitmap(new Blob([raw], { type: 'image/png' }));
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const context = canvas.getContext('2d')!;
      context.drawImage(bitmap, 0, 0);
      const { data } = context.getImageData(0, 0, bitmap.width, bitmap.height);
      let content = 0;
      let minimumAlpha = 255;
      const colors = new Set<number>();
      for (let i = 0; i < data.length; i += 4) {
        minimumAlpha = Math.min(minimumAlpha, data[i + 3]);
        if (color.some((channel, c) => Math.abs(data[i + c] - channel) > 8)) content += 1;
        if (i % 404 === 0) colors.add((data[i] << 16) | (data[i + 1] << 8) | data[i + 2]);
      }
      return {
        corner: [data[0], data[1], data[2]],
        minimumAlpha,
        content: content / (data.length / 4),
        colors: colors.size,
      };
    },
    { base64: bytes.toString('base64'), color: background },
  );
  expect(stats.minimumAlpha).toBe(255);
  expect(stats.corner).toEqual(background);
  expect(stats.content).toBeGreaterThan(0.02);
  expect(stats.colors).toBeGreaterThan(8);
}

/** Interpreta el SVG en el navegador: XML válido, autónomo y sin rótulos encimados. */
async function inspectSvg(inspector: Page, svg: string) {
  return inspector.evaluate((source) => {
    const parsed = new DOMParser().parseFromString(source, 'image/svg+xml');
    if (parsed.querySelector('parsererror')) return ['XML inválido'];
    document.body.replaceChildren(document.importNode(parsed.documentElement, true));
    const root = document.body.querySelector('svg')!;
    const problems: string[] = [];
    if (root.querySelector('script, foreignObject, image')) problems.push('elemento no permitido');
    if (/href=|url\((?!#)|@import/.test(source)) problems.push('referencia externa');
    if (!root.querySelector('path[data-series]')) problems.push('sin series');
    const frame = root.getBoundingClientRect();
    const texts = [...root.querySelectorAll('text')].map((node) => ({
      text: node.textContent,
      box: node.getBoundingClientRect(),
    }));
    texts.forEach((first, index) => {
      const { box } = first;
      if (
        box.left < frame.left - 0.5 ||
        box.right > frame.right + 0.5 ||
        box.top < frame.top - 0.5 ||
        box.bottom > frame.bottom + 0.5
      )
        problems.push(`recortado: ${first.text}`);
      for (const second of texts.slice(index + 1)) {
        const x = Math.min(box.right, second.box.right) - Math.max(box.left, second.box.left);
        const y = Math.min(box.bottom, second.box.bottom) - Math.max(box.top, second.box.top);
        if (x > 1.5 && y > 3) problems.push(`encimados: ${first.text} / ${second.text}`);
      }
    });
    // Los símbolos de la leyenda no deben invadir los textos vecinos.
    const labels = [...root.querySelectorAll('[data-role="legend-label"]')];
    for (const symbol of root.querySelectorAll('[data-marker][data-role="legend"]')) {
      const a = symbol.getBoundingClientRect();
      for (const label of labels) {
        const b = label.getBoundingClientRect();
        if (
          Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 &&
          Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1
        )
          problems.push(`símbolo sobre ${label.textContent}`);
      }
    }
    return problems;
  }, svg);
}

const figureButton = (page: Page, id: string) => page.locator(`button[data-figure="${id}"]`);
const preview = (page: Page | Locator) => page.getByRole('img', { name: /^Vista previa:/ });

async function previewLoaded(scope: Page | Locator) {
  await expect
    .poll(() => preview(scope).evaluate((e) => (e as HTMLImageElement).naturalWidth))
    .toBeGreaterThan(0);
}

async function showAtTop(page: Page, selector: string) {
  await page.mouse.move(0, 0);
  await page.locator(selector).evaluate((element) => element.scrollIntoView({ block: 'start' }));
}

test('genera las 15 figuras con archivos reales y verificados', async ({ page, context }) => {
  test.setTimeout(240_000);
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const expectCleanPage = watchPage(page);
  const inspector = await context.newPage();
  await inspector.setViewportSize({ width: 1200, height: 800 });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/#/exportaciones');
  await expect(page.getByRole('heading', { name: 'Centro de exportaciones' })).toBeVisible();
  const problems: string[] = [];

  for (const [id, category] of catalog) {
    await figureButton(page, id).click();
    await expect(figureButton(page, id)).toHaveAttribute('aria-pressed', 'true');
    await previewLoaded(page);

    const png = await download(page, page, 'PNG');
    await expectPng(page, png.bytes, 2400, 1600, [255, 255, 255]);
    await png.file.saveAs(`${generated}/png/${png.name}`);

    const svg = await download(page, page, 'SVG');
    const source = svg.bytes.toString('utf8');
    expect(source).toContain(`data-figure-id="${id}"`);
    problems.push(...(await inspectSvg(inspector, source)).map((p) => `${id}: ${p}`));
    if (samples.has(id)) await svg.file.saveAs(`${generated}/svg/${svg.name}`);

    const csv = await download(page, page, 'CSV');
    const text = csv.bytes.toString('utf8');
    expect(text.charCodeAt(0)).toBe(0xfeff);
    expect(text).not.toMatch(/NaN|Infinity|undefined/);
    const lines = text.slice(1).trimEnd().split('\r\n');
    expect(lines.length).toBeGreaterThan(2);
    const width = lines[0].split(',').length;
    for (const line of lines) expect(line.split(',')).toHaveLength(width);
    const rows = lines.slice(1).map((line) => line.split(','));
    // Valores representativos contrastados con el motor.
    for (const row of [rows[0], rows[Math.floor(rows.length / 2)], rows[rows.length - 1]]) {
      const first = Number(row[0]);
      if (category === 'integrals') {
        const accumulated = accumulatedData(first);
        expect(accumulated.ok && Number(row[2])).toBe(accumulated.ok && accumulated.value);
      } else if (category === 'derivatives' && id !== 'derivatives-tangent') {
        expect(Number(row[1])).toBeGreaterThan(0);
      } else if (id !== 'optimization-threshold-capacity') {
        const response = responseTime(first);
        expect(response.ok && Number(row[1])).toBe(response.ok && response.value);
      }
    }
    if (samples.has(id)) await csv.file.saveAs(`${generated}/csv/${csv.name}`);

    await page.getByRole('button', { name: 'Copiar ficha académica' }).click();
    await expect(page.getByText('Ficha copiada al portapapeles.')).toBeVisible();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    const record = await page.getByRole('textbox', { name: 'Ficha académica' }).inputValue();
    expect(copied.replace(/\r\n/g, '\n')).toBe(record);
    expect(record).toContain('Elaboración propia del Grupo #4 mediante ServerLab');
    expect(record).toContain('hipotético');
    const recordName = png.name.replace(/\.png$/, '.txt');
    await mkdir(`${generated}/fichas`, { recursive: true });
    await writeFile(`${generated}/fichas/${recordName}`, copied);
  }
  expect(problems).toEqual([]);

  // Tema ServerLab: las mismas 15 figuras sin rótulos encimados.
  await page.getByRole('radio', { name: /^ServerLab/ }).check();
  for (const [id] of catalog) {
    await figureButton(page, id).click();
    const svg = await download(page, page, 'SVG');
    expect(svg.name).toContain('tema-oscuro');
    problems.push(
      ...(await inspectSvg(inspector, svg.bytes.toString('utf8'))).map((p) => `${id}: ${p}`),
    );
  }
  expect(problems).toEqual([]);
  expectCleanPage();
});

test('mantiene figuras legibles con parámetros extremos', async ({ page, context }) => {
  test.setTimeout(180_000);
  const expectCleanPage = watchPage(page);
  const inspector = await context.newPage();
  await inspector.setViewportSize({ width: 1200, height: 800 });
  await page.goto('/#/exportaciones');
  const problems: string[] = [];
  const cases: [id: string, fields: [label: RegExp, value: string][]][] = [
    ['dashboard-response-time', [[/Carga operativa/, '99']]],
    ['derivatives-tangent', [[/Punto de tangencia/, '0']]],
    ['derivatives-tangent', [[/Punto de tangencia/, '99']]],
    ['derivatives-first', [[/Punto marcado/, '99']]],
    ['integrals-rate-area', [[/Límite inferior a/, '30']]],
    [
      'integrals-rate-area',
      [
        [/Límite inferior a/, '14'],
        [/Límite superior b/, '14,5'],
      ],
    ],
    [
      'integrals-accumulated-data',
      [
        [/Límite superior b/, '0'],
        [/Límite inferior a/, '0'],
      ],
    ],
    ['optimization-response-region', [[/Umbral de respuesta L/, '50']]],
    ['optimization-response-region', [[/Umbral de respuesta L/, '100']]],
    ['optimization-response-region', [[/Umbral de respuesta L/, '25000']]],
    ['optimization-integer-verification', [[/Umbral de respuesta L/, '50']]],
    ['optimization-integer-verification', [[/Umbral de respuesta L/, '100']]],
    ['optimization-integer-verification', [[/Umbral de respuesta L/, '19900']]],
    ['optimization-threshold-capacity', [[/Umbral de respuesta L/, '50']]],
    ['optimization-threshold-capacity', [[/Umbral de respuesta L/, '25000']]],
  ];
  for (const [id, fields] of cases) {
    await figureButton(page, id).click();
    const reset = page.getByRole('button', { name: 'Restablecer parámetros' });
    await reset.click();
    for (const [label, value] of fields) {
      const input = page.getByRole('textbox', { name: label });
      await input.fill(value);
      await input.press('Enter');
      await expect(input).toHaveAttribute('aria-invalid', 'false');
    }
    const svg = await download(page, page, 'SVG');
    problems.push(
      ...(await inspectSvg(inspector, svg.bytes.toString('utf8'))).map(
        (p) => `${id} ${fields.map((f) => f[1]).join('/')}: ${p}`,
      ),
    );
  }
  // Cada opción de los selectores.
  for (const [id] of catalog) {
    await figureButton(page, id).click();
    const selects = page.locator('.export-parameters select');
    for (let index = 0; index < (await selects.count()); index += 1) {
      const options = await selects
        .nth(index)
        .locator('option')
        .evaluateAll((nodes) => nodes.map((n) => (n as HTMLOptionElement).value));
      for (const option of options) {
        await selects.nth(index).selectOption(option);
        const svg = await download(page, page, 'SVG');
        problems.push(
          ...(await inspectSvg(inspector, svg.bytes.toString('utf8'))).map(
            (p) => `${id} ${option}: ${p}`,
          ),
        );
      }
    }
  }
  expect(problems).toEqual([]);
  expectCleanPage();
});

test('ofrece navegación, filtros, parámetros, resoluciones y paquete', async ({ page }) => {
  test.setTimeout(180_000);
  const expectCleanPage = watchPage(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/#/');
  await page.getByRole('slider', { name: 'Usuarios concurrentes' }).fill('42');
  const link = page.getByRole('link', { name: 'Exportaciones', exact: true });
  await link.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Centro de exportaciones' })).toBeVisible();
  await expect(link).toHaveAttribute('aria-current', 'page');
  await previewLoaded(page);

  for (const [name, viewport] of [
    ['exports-desktop-1440x900.png', { width: 1440, height: 900 }],
    ['exports-laptop-1280x720.png', { width: 1280, height: 720 }],
    ['exports-tablet-768x1024.png', { width: 768, height: 1024 }],
    ['exports-mobile-390x844.png', { width: 390, height: 844 }],
  ] as const) {
    await page.setViewportSize(viewport);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expectNoOverflow(page);
    await page.screenshot({ path: `${evidence}/${name}` });
  }
  await page.setViewportSize({ width: 320, height: 700 });
  await expectNoOverflow(page);
  await page.setViewportSize({ width: 1440, height: 900 });

  const items = page.getByRole('list', { name: 'Figuras disponibles' }).getByRole('button');
  await expect(items).toHaveCount(15);
  const filter = page.getByRole('group', { name: 'Filtrar por módulo' });
  for (const [name, count] of [
    ['Dashboard', 1],
    ['Límites', 2],
    ['Derivadas', 3],
    ['Integrales', 4],
    ['Optimización', 5],
  ] as const) {
    await filter.getByRole('button', { name }).click();
    await expect(items).toHaveCount(count);
  }
  await filter.getByRole('button', { name: 'Integrales' }).click();
  await figureButton(page, 'integrals-rate-area').click();
  await showAtTop(page, '.export-layout');
  await previewLoaded(page);
  await page.screenshot({ path: `${evidence}/exports-figure-selection.png` });

  // Parámetros por teclado, validados antes de aplicarse.
  const lower = page.getByRole('textbox', { name: /Límite inferior a/ });
  const upper = page.getByRole('textbox', { name: /Límite superior b/ });
  await upper.fill('20');
  await upper.press('Enter');
  await lower.fill('10');
  await page.keyboard.press('Tab');
  await expect(upper).toBeFocused();
  const summary = page.getByLabel('Selección activa');
  await expect(summary).toContainText('serverlab-tasa-transferencia-10-20s.png');
  await lower.fill('25');
  await lower.press('Enter');
  await expect(page.getByRole('alert')).toContainText('no puede ser menor');
  await expect(summary).toContainText('serverlab-tasa-transferencia-10-20s.png');
  await showAtTop(page, '.export-parameters');
  await page.screenshot({ path: `${evidence}/exports-parameters.png` });
  await lower.press('Escape');

  const csv = await download(page, page, 'CSV');
  const total = transferredData(10, 20);
  const rows = csv.bytes
    .toString('utf8')
    .trimEnd()
    .split('\r\n')
    .map((line) => line.split(','));
  const at = (seconds: string) => Number(rows.find((row) => row[0] === seconds)![2]);
  expect(at('20') - at('10')).toBe(total.ok && total.value);
  await page.getByRole('combobox', { name: 'Variante CSV' }).selectOption('regional');
  const regional = await download(page, page, 'CSV');
  expect(regional.name).toBe('serverlab-tasa-transferencia-10-20s-regional.csv');
  const regionalText = regional.bytes.toString('utf8');
  expect(regionalText.split('\r\n')[0].split(';')).toHaveLength(4);
  expect(regionalText).toContain('\r\n0,5;5,1;');
  await regional.file.saveAs(`${generated}/csv/${regional.name}`);

  // Resoluciones reales.
  await page.getByRole('radio', { name: /^PNG/ }).check();
  for (const [value, width, height] of [
    ['standard', 1200, 800],
    ['high', 2400, 1600],
    ['max', 3600, 2400],
  ] as const) {
    await page.getByRole('combobox', { name: 'Resolución PNG' }).selectOption(value);
    await expect(summary).toContainText(`${width} × ${height} px`);
    const png = await download(page, page, 'PNG');
    await expectPng(page, png.bytes, width, height, [255, 255, 255]);
  }
  await page.getByRole('combobox', { name: 'Resolución PNG' }).selectOption('high');
  await showAtTop(page, '.export-options');
  await page.screenshot({ path: `${evidence}/exports-download-controls.png` });

  await showAtTop(page, '.export-output');
  await previewLoaded(page);
  await page
    .locator('.export-preview')
    .screenshot({ path: `${evidence}/exports-academic-preview.png` });
  await page.getByRole('radio', { name: /^ServerLab/ }).check();
  await previewLoaded(page);
  await page
    .locator('.export-preview')
    .screenshot({ path: `${evidence}/exports-dark-preview.png` });
  const dark = await download(page, page, 'PNG');
  await expectPng(page, dark.bytes, 2400, 1600, [11, 18, 32]);
  await page.getByRole('radio', { name: /^Académico/ }).check();

  // Un fallo de generación se informa y no produce descarga ni éxito.
  await page.evaluate(() => {
    const original = HTMLCanvasElement.prototype.toBlob;
    HTMLCanvasElement.prototype.toBlob = function (callback) {
      HTMLCanvasElement.prototype.toBlob = original;
      callback(null);
    };
  });
  let downloads = 0;
  const count = () => (downloads += 1);
  page.on('download', count);
  await page.getByRole('button', { name: 'Descargar PNG' }).click();
  await expect(page.getByRole('alert')).toContainText('No se generó el archivo');
  await expect(page.locator('.export-status--done')).toHaveCount(0);
  expect(downloads).toBe(0);
  page.off('download', count);

  // Paquete opcional: estructura ZIP, CRC y firmas.
  await page.getByRole('combobox', { name: 'Resolución PNG' }).selectOption('standard');
  const waiting = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Descargar paquete' }).click();
  await expect(page.getByRole('button', { name: 'Descargar paquete' })).toBeDisabled();
  const archive = await waiting;
  const zip = await readFile((await archive.path())!);
  const end = zip.length - 22;
  expect(zip.readUInt32LE(end)).toBe(0x06054b50);
  const entries = zip.readUInt16LE(end + 10);
  expect(entries).toBe(60);
  let offset = zip.readUInt32LE(end + 16);
  const names: string[] = [];
  for (let index = 0; index < entries; index += 1) {
    expect(zip.readUInt32LE(offset)).toBe(0x02014b50);
    const crc = zip.readUInt32LE(offset + 16);
    const size = zip.readUInt32LE(offset + 20);
    const nameLength = zip.readUInt16LE(offset + 28);
    const local = zip.readUInt32LE(offset + 42);
    const name = zip.subarray(offset + 46, offset + 46 + nameLength).toString('utf8');
    const start = local + 30 + zip.readUInt16LE(local + 26);
    const data = zip.subarray(start, start + size);
    expect(crc32(data)).toBe(crc);
    if (name.endsWith('.png')) expect(data.readUInt32BE(16)).toBe(1200);
    names.push(name);
    offset += 46 + nameLength;
  }
  expect(new Set(names).size).toBe(60);
  await expect(page.getByText(/Paquete generado/)).toBeVisible();

  await page.getByRole('link', { name: 'Ir al Dashboard' }).click();
  await expect(page.getByRole('slider', { name: 'Usuarios concurrentes' })).toHaveValue('42');
  expectCleanPage();
});

test('exporta desde cada laboratorio con sus parámetros actuales', async ({ page }) => {
  test.setTimeout(180_000);
  const expectCleanPage = watchPage(page);
  await page.setViewportSize({ width: 1440, height: 900 });

  async function exportFrom(button: string, expected: string, shot?: string) {
    const trigger = page.getByRole('button', { name: button, exact: true });
    await trigger.focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await previewLoaded(dialog);
    if (shot) await page.screenshot({ path: `${evidence}/${shot}` });
    const png = await download(page, dialog, 'PNG');
    expect(png.name).toBe(expected);
    await expectPng(page, png.bytes, 2400, 1600, [255, 255, 255]);
    await expectNoOverflow(page);
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
  }

  await page.goto('/#/');
  await page.getByRole('slider', { name: 'Usuarios concurrentes' }).fill('72');
  await page.getByRole('slider', { name: 'Duración de transferencia' }).fill('18');
  await exportFrom('Exportar respuesta', 'serverlab-tiempo-respuesta-n72.png');
  await exportFrom('Exportar derivada', 'serverlab-primera-derivada.png');
  await exportFrom('Exportar transferencia', 'serverlab-tasa-transferencia-0-18s.png');

  await page.getByRole('link', { name: 'Límites', exact: true }).click();
  await page.getByRole('radio', { name: /Capacidad/ }).click();
  await exportFrom('Exportar gráfica principal', 'serverlab-limite-capacidad.png');

  await page.getByRole('link', { name: 'Derivadas', exact: true }).click();
  await page.getByRole('slider', { name: 'Usuarios del punto de análisis' }).fill('50');
  await exportFrom('Exportar gráfica principal', 'serverlab-recta-tangente-n50.png');
  await page.getByRole('radio', { name: 'R″(n)' }).click();
  await exportFrom('Exportar gráfica principal', 'serverlab-segunda-derivada.png');

  await page.getByRole('link', { name: 'Integrales', exact: true }).click();
  await page.getByRole('textbox', { name: 'Valor exacto de a (s)' }).fill('7,25');
  await exportFrom('Exportar gráfica principal', 'serverlab-tasa-transferencia-7p25-18s.png');
  await exportFrom('Exportar ejemplo 2', 'serverlab-integral-10-20s.png');
  // La exportación conserva los parámetros del laboratorio.
  await expect(page.getByRole('slider', { name: 'Límite inferior (a)' })).toHaveValue('7.25');

  await page.getByRole('link', { name: 'Optimización', exact: true }).click();
  await page.getByRole('button', { name: 'Cargar escenario de 300 ms' }).click();
  await exportFrom(
    'Exportar gráfica principal',
    'serverlab-optimizacion-300ms.png',
    'exports-from-laboratory.png',
  );
  await exportFrom('Exportar verificación entera', 'serverlab-verificacion-entera-300ms.png');
  await exportFrom('Exportar sensibilidad', 'serverlab-capacidad-segun-umbral.png');
  await exportFrom('Exportar escenario 1', 'serverlab-optimizacion-escenario-500ms.png');

  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 700 });
    await page.getByRole('button', { name: 'Exportar sensibilidad' }).click();
    const dialog = page.getByRole('dialog');
    await previewLoaded(dialog);
    await expect.poll(() => dialog.evaluate((e) => e.scrollWidth <= e.clientWidth)).toBe(true);
    await expectNoOverflow(page);
    await dialog.getByRole('button', { name: 'Cerrar exportación' }).click();
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByRole('link', { name: 'Dashboard', exact: true }).click();
  await expect(page.getByRole('slider', { name: 'Usuarios concurrentes' })).toHaveValue('72');
  await expect(page.getByRole('slider', { name: 'Duración de transferencia' })).toHaveValue('18');
  expectCleanPage();
});
