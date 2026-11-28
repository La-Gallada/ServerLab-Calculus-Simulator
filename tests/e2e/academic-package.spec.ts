/**
 * Genera el paquete académico provisional con el exportador de la aplicación.
 * Sólo escribe en `docs/academic-delivery` con `ACADEMIC_PACKAGE=1`; en cualquier
 * otra ejecución escribe en `test-results/` y actúa como prueba de integridad.
 */
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { createZip, type ZipEntry } from '../../src/export/zip';
import { resolveFigure } from '../../src/export/registry';

const target =
  process.env.ACADEMIC_PACKAGE === '1'
    ? 'docs/academic-delivery'
    : 'test-results/academic-delivery';
const zipName = 'serverlab-grupo4-paquete-academico-provisional.zip';
const site = 'https://serverlab-calculus-simulator.pages.dev/';

type Tier = 'Esencial' | 'Complementaria';

interface Selection {
  id: string;
  tier: Tier;
  presentation: boolean;
  /** Lectura conceptual. Las cifras provienen del resumen calculado de cada figura. */
  interpretation: string;
}

const selection: Selection[] = [
  {
    id: 'dashboard-response-time',
    tier: 'Esencial',
    presentation: true,
    interpretation:
      'Presenta la función central del proyecto: el tiempo de respuesta crece con la carga y lo hace cada vez más rápido. Sirve para introducir el umbral y la capacidad de referencia.',
  },
  {
    id: 'limits-zero-approach',
    tier: 'Complementaria',
    presentation: false,
    interpretation:
      'El límite lateral en cero coincide con el tiempo base del modelo: describe la respuesta esperada con carga casi nula, no una medición.',
  },
  {
    id: 'limits-capacity-approach',
    tier: 'Esencial',
    presentation: true,
    interpretation:
      'Al acercarse a la capacidad por la izquierda la respuesta crece sin cota. La asíntota representa una saturación idealizada y justifica operar con margen.',
  },
  {
    id: 'derivatives-tangent',
    tier: 'Esencial',
    presentation: true,
    interpretation:
      'La pendiente de la tangente es la sensibilidad instantánea de la respuesta ante la carga. Aproxima el cambio local, distinto del incremento discreto de un usuario.',
  },
  {
    id: 'derivatives-first',
    tier: 'Complementaria',
    presentation: false,
    interpretation:
      'La primera derivada es positiva y creciente: cada usuario adicional cuesta más cuanto mayor es la carga.',
  },
  {
    id: 'derivatives-second',
    tier: 'Complementaria',
    presentation: false,
    interpretation:
      'La segunda derivada positiva indica convexidad: la tasa de deterioro se acelera y no hay punto de inflexión en el dominio.',
  },
  {
    id: 'integrals-example-0-30',
    tier: 'Complementaria',
    presentation: false,
    interpretation:
      'El área bajo la tasa en todo el intervalo es el volumen total de datos transferidos. Las unidades pasan de MB/s a MB.',
  },
  {
    id: 'integrals-example-10-20',
    tier: 'Esencial',
    presentation: true,
    interpretation:
      'La integral definida en un intervalo parcial separa lo transferido en ese periodo de lo acumulado desde el inicio.',
  },
  {
    id: 'integrals-accumulated-data',
    tier: 'Complementaria',
    presentation: false,
    interpretation:
      'La función acumulada muestra el teorema fundamental: la transferencia es la diferencia de alturas A(b) − A(a), no un área bajo A.',
  },
  {
    id: 'optimization-response-region',
    tier: 'Esencial',
    presentation: true,
    interpretation:
      'La región factible reúne las cargas que cumplen el tiempo máximo. Como la respuesta es creciente, el óptimo está en la frontera de esa región.',
  },
  {
    id: 'optimization-integer-verification',
    tier: 'Esencial',
    presentation: true,
    interpretation:
      'Comprueba que la solución entera cumple el umbral y que el siguiente usuario lo supera: la frontera continua no es una cantidad de usuarios.',
  },
  {
    id: 'optimization-threshold-capacity',
    tier: 'Complementaria',
    presentation: false,
    interpretation:
      'Relaciona la exigencia de respuesta con la capacidad admitida: relajar el umbral aporta cada vez menos usuarios adicionales.',
  },
];

const redundant = [
  ['integrals-rate-area', 'Con sus parámetros iniciales coincide con la integral de 0 a 30 s.'],
  [
    'optimization-scenario-500',
    'Con sus parámetros iniciales coincide con la región factible de 500 ms.',
  ],
  [
    'optimization-scenario-300',
    'No es duplicada, pero repite el formato de la región factible; útil si se comparan objetivos.',
  ],
] as const;

async function save(path: string, data: string | Uint8Array) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, data);
}

async function download(page: Page, format: 'PNG' | 'SVG' | 'CSV') {
  await page.getByRole('radio', { name: new RegExp(`^${format}`) }).check();
  const waiting = page.waitForEvent('download');
  await page.getByRole('button', { name: `Descargar ${format}` }).click();
  const file = await waiting;
  expect(await file.failure()).toBeNull();
  return { name: file.suggestedFilename(), bytes: await readFile((await file.path())!) };
}

test('genera el paquete académico provisional', async ({ page }) => {
  test.setTimeout(180_000);
  for (const folder of ['png', 'svg', 'csv', 'fichas'])
    await rm(`${target}/${folder}`, { recursive: true, force: true });
  const entries: ZipEntry[] = [];
  const index: string[] = [];
  const add = async (path: string, data: Uint8Array) => {
    await save(`${target}/${path}`, data);
    entries.push({ path, data });
  };
  const provisional = (name: string) => name.replace(/^serverlab-/, 'serverlab-provisional-');

  await page.goto('/#/exportaciones');
  for (const [position, item] of selection.entries()) {
    await page.locator(`button[data-figure="${item.id}"]`).click();
    const png = await download(page, 'PNG');
    expect([png.bytes.readUInt32BE(16), png.bytes.readUInt32BE(20)]).toEqual([2400, 1600]);
    const pngName = provisional(png.name);
    await add(`png/${pngName}`, png.bytes);
    const svg = await download(page, 'SVG');
    expect(svg.bytes.toString('utf8')).toContain('Grupo #4');
    expect(svg.bytes.toString('utf8')).toContain('hipotético y provisional');
    await add(`svg/${provisional(svg.name)}`, svg.bytes);
    await page.getByRole('radio', { name: /^CSV/ }).check();
    for (const variant of ['standard', 'regional']) {
      await page.getByRole('combobox', { name: 'Variante CSV' }).selectOption(variant);
      const csv = await download(page, 'CSV');
      await add(`csv/${provisional(csv.name)}`, csv.bytes);
    }
    await page.getByRole('combobox', { name: 'Variante CSV' }).selectOption('standard');
    const record = await page.getByRole('textbox', { name: 'Ficha académica' }).inputValue();
    expect(record).toContain('Elaboración propia del Grupo #4');
    const recordName = pngName.replace(/\.png$/, '.txt');
    await add(`fichas/${recordName}`, Buffer.from(`${record}\n`, 'utf8'));

    const figure = resolveFigure(item.id);
    expect(figure.ok).toBe(true);
    if (!figure.ok) continue;
    index.push(
      `## ${position + 1}. ${figure.value.title}`,
      '',
      `- Categoría: **${item.tier}**${item.presentation ? ' · recomendada para la exposición' : ''}`,
      `- Archivos: [PNG](png/${pngName}) · [SVG](svg/${pngName.replace(/png$/, 'svg')}) · [CSV](csv/${pngName.replace(/png$/, 'csv')}) · [CSV regional](csv/${pngName.replace(/\.png$/, '-regional.csv')}) · [ficha](fichas/${recordName})`,
      `- Descripción: ${figure.value.description}`,
      `- Resultado calculado: ${figure.value.summary}`,
      `- Interpretación: ${item.interpretation}`,
      '',
    );
  }

  const readme = [
    '# Paquete académico provisional de ServerLab',
    '',
    '**No es la entrega académica definitiva.** Las figuras y los datos corresponden a un modelo matemático **hipotético y provisional**, pendiente de confirmación por el grupo. No son mediciones de un servidor real.',
    '',
    'Desarrollado por el Grupo #4. Proyecto de Investigación de Cálculo I. Ingeniería en Sistemas. Universidad Latina de Costa Rica. III Cuatrimestre, 2026.',
    '',
    `Simulador: <${site}>`,
    '',
    '![Código QR del simulador](qr/serverlab-sitio-qr.png)',
    '',
    'La numeración de este índice es provisional; la definitiva se decide en el documento. Cada ficha incluye la nota de elaboración propia. Para el documento se recomienda el PNG.',
    '',
    '## Figuras que no se incluyen',
    '',
    ...redundant.map(([id, reason]) => `- \`${id}\`: ${reason} Sigue disponible en la aplicación.`),
    '',
    ...index,
  ].join('\n');
  await save(`${target}/README.md`, `${readme.trimEnd()}\n`);
  entries.push({ path: 'README.md', data: Buffer.from(`${readme.trimEnd()}\n`, 'utf8') });
  for (const name of ['serverlab-sitio-qr.png', 'serverlab-sitio-qr.svg'])
    entries.push({
      path: `qr/${name}`,
      data: await readFile(`docs/academic-delivery/qr/${name}`),
    });
  await save(`${target}/${zipName}`, createZip(entries));

  // 12 figuras × 5 archivos, índice y dos versiones del QR.
  expect(entries).toHaveLength(selection.length * 5 + 3);
  expect(new Set(entries.map((entry) => entry.path)).size).toBe(entries.length);
  for (const entry of entries) expect(entry.data.length, entry.path).toBeGreaterThan(100);
});
