import { describe, expect, it } from 'vitest';
import { mathModelConfig } from '../config/model';
import {
  accumulatedData,
  firstDerivative,
  optimizeResponseThreshold,
  responseTime,
  secondDerivative,
  tangentLine,
  transferRate,
  transferredData,
  type MathResult,
} from '../math';
import { byteOrderMark, toCsv } from './csv';
import { exportFileName, slugify } from './filenames';
import { academicRecord, authorshipNote, hypotheticalNotice } from './metadata';
import { defaultResolution, resolutionById, resolutions } from './png';
import {
  defaultValues,
  figureRegistry,
  findDefinition,
  parseParameter,
  resolveFigure,
} from './registry';
import { renderSvg } from './svg/renderSvg';
import { escapeXml, wrapText } from './svg/text';
import { themes } from './themes';
import type { DataTable, ExportFigure, ParameterValues, SeriesRole } from './types';
import { crc32, createZip } from './zip';

function valueOf<T>(result: MathResult<T>): T {
  if (!result.ok) throw new Error(result.error.message);
  return result.value;
}
const figure = (id: string, values?: ParameterValues) => valueOf(resolveFigure(id, values));
const column = (table: DataTable, index: number) => table.rows.map((row) => row[index]);
const numbers = (table: DataTable, index: number) => column(table, index) as number[];
const parseXml = (svg: string) => new DOMParser().parseFromString(svg, 'image/svg+xml');

const catalog = [
  'dashboard-response-time',
  'limits-zero-approach',
  'limits-capacity-approach',
  'derivatives-tangent',
  'derivatives-first',
  'derivatives-second',
  'integrals-rate-area',
  'integrals-accumulated-data',
  'integrals-example-0-30',
  'integrals-example-10-20',
  'optimization-response-region',
  'optimization-integer-verification',
  'optimization-threshold-capacity',
  'optimization-scenario-300',
  'optimization-scenario-500',
];

describe('registro de figuras', () => {
  it('contiene las 15 figuras con identificadores únicos y estables', () => {
    expect(figureRegistry.map((item) => item.id)).toEqual(catalog);
    expect(new Set(figureRegistry.map((item) => item.name)).size).toBe(15);
    for (const item of figureRegistry) expect(item.id).not.toMatch(/figura|[OID]-0\d/i);
  });

  it.each(catalog)('genera datos finitos y metadatos completos: %s', (id) => {
    const built = figure(id);
    expect(built.title).not.toBe('');
    expect(built.description).not.toBe('');
    expect(built.variables.every((v) => v.symbol && v.unit)).toBe(true);
    expect(built.formulas.length).toBeGreaterThan(0);
    expect(built.model).toEqual({
      id: mathModelConfig.id,
      version: mathModelConfig.version,
      status: 'provisional',
    });
    expect(built.legend.length).toBeGreaterThan(1);
    expect(built.table.rows.length).toBeGreaterThan(0);
    for (const row of built.table.rows) {
      expect(row).toHaveLength(built.table.columns.length);
      for (const value of row)
        if (typeof value === 'number') expect(Number.isFinite(value)).toBe(true);
    }
    for (const axis of [built.chart.x, built.chart.y]) {
      expect(axis.label).not.toBe('');
      expect(axis.domain[1]).toBeGreaterThan(axis.domain[0]);
      if (axis.scale === 'log') expect(axis.domain[0]).toBeGreaterThan(0);
    }
    const coordinates = [
      ...built.chart.lines.flatMap((line) => line.points.flatMap((point) => point ?? [])),
      ...built.chart.markers.flatMap((marker) => [marker.x, marker.y]),
    ];
    expect(coordinates.every(Number.isFinite)).toBe(true);
    expect(JSON.stringify([built.title, built.notes, built.summary, built.table])).not.toMatch(
      /NaN|Infinity|undefined/,
    );
  });

  it('rechaza identificadores y parámetros inválidos sin sustituirlos', () => {
    expect(resolveFigure('no-existe').ok).toBe(false);
    for (const [id, values] of [
      ['dashboard-response-time', { users: 100 }],
      ['dashboard-response-time', { users: 1.5 }],
      ['dashboard-response-time', { threshold: 42 }],
      ['limits-zero-approach', { distance: 0 }],
      ['derivatives-tangent', { users: Number.NaN }],
      ['integrals-rate-area', { a: -1, b: 10 }],
      ['integrals-rate-area', { a: 0, b: 31 }],
      ['optimization-response-region', { threshold: Number.POSITIVE_INFINITY }],
      ['optimization-threshold-capacity', { threshold: -5 }],
    ] as const)
      expect(resolveFigure(id, values).ok, `${id} ${JSON.stringify(values)}`).toBe(false);
    expect(resolveFigure('integrals-rate-area', { a: 20, b: 10 })).toMatchObject({
      ok: false,
      error: { code: 'inverted-interval' },
    });
  });

  it('lee campos numéricos sin aceptar entradas ambiguas', () => {
    const spec = findDefinition('integrals-rate-area')!.parameters[0];
    expect(valueOf(parseParameter(spec, '7,25'))).toBe(7.25);
    for (const text of ['', 'abc', '1.000', '5,', 'Infinity', '31'])
      expect(parseParameter(spec, text).ok, text).toBe(false);
  });
});

describe('coherencia con el motor', () => {
  it('usa R(n) en Dashboard y Límites sin evaluar la singularidad', () => {
    for (const id of [
      'dashboard-response-time',
      'limits-zero-approach',
      'limits-capacity-approach',
    ]) {
      const { table } = figure(id);
      for (const row of table.rows) expect(row[1]).toBe(valueOf(responseTime(row[0] as number)));
      expect(Math.max(...numbers(table, 0))).toBeLessThan(100);
    }
    const near = figure('limits-capacity-approach');
    expect(near.chart.y.scale).toBe('log');
    expect(near.scale).toContain('logarítmico');
    expect(near.chart.references).toContainEqual(
      expect.objectContaining({ orientation: 'vertical', value: 100, role: 'capacity' }),
    );
    expect(Math.max(...numbers(near.table, 0))).toBeCloseTo(99.99, 8);
    expect(near.notes.join(' ')).toContain('+∞');
    const zero = figure('limits-zero-approach');
    expect(Math.min(...numbers(zero.table, 0))).toBe(0);
    expect(zero.notes.join(' ')).toContain('por la derecha');
  });

  it.each([0, 30, 65, 90, 99])('traza la tangente exacta en n = %s', (users) => {
    const built = figure('derivatives-tangent', { users });
    const line = valueOf(tangentLine(users));
    const point = built.table.rows.find((row) => row[0] === users)!;
    expect(point[1]).toBe(valueOf(responseTime(users)));
    expect(point[2]).toBeCloseTo(point[1] as number, 10);
    expect(point[3]).toBe('sí');
    expect(built.chart.markers[0]).toMatchObject({ x: users, y: line.responseMs });
    for (const row of built.table.rows)
      if (row[2] !== null) expect(row[2]).toBeCloseTo(line.evaluate(row[0] as number), 8);
    expect(built.chart.y.scale).toBe('linear');
    expect(built.fileSlug).toBe(`recta-tangente-n${users}`);
  });

  it('distingue unidades y valores de las derivadas', () => {
    for (const [id, evaluate, unit] of [
      ['derivatives-first', firstDerivative, 'ms/usuario'],
      ['derivatives-second', secondDerivative, 'ms/usuario²'],
    ] as const) {
      const built = figure(id);
      expect(built.table.columns[1].unit).toBe(unit);
      for (const row of built.table.rows) expect(row[1]).toBe(valueOf(evaluate(row[0] as number)));
      expect(figure(id, { scale: 'linear' }).chart.y.scale).toBe('linear');
    }
  });

  it.each([
    [0, 30],
    [10, 20],
    [7.25, 22.75],
  ])('limita el área a [%s, %s]', (a, b) => {
    const built = figure('integrals-rate-area', { a, b });
    const area = built.chart.areas[0].points;
    expect(area[0]).toEqual([a, valueOf(transferRate(a))]);
    expect(area.at(-1)).toEqual([b, valueOf(transferRate(b))]);
    expect(area.every(([t]) => t >= a && t <= b)).toBe(true);
    expect(built.notes[0]).toContain(
      new Intl.NumberFormat('es-CR', { maximumFractionDigits: 6 }).format(
        valueOf(transferredData(a, b)),
      ),
    );
    for (const row of built.table.rows) {
      expect(row[1]).toBe(valueOf(transferRate(row[0] as number)));
      expect(row[2]).toBe(valueOf(accumulatedData(row[0] as number)));
    }
    expect(figure('integrals-accumulated-data', { a, b }).chart.areas).toEqual([]);
  });

  it('elimina el área en un intervalo nulo', () => {
    for (const id of ['integrals-rate-area', 'integrals-accumulated-data']) {
      const built = figure(id, { a: 15, b: 15 });
      expect(built.chart.areas).toEqual([]);
      expect(built.chart.lines.map((line) => line.role)).not.toContain('selected');
      expect(built.chart.references.map((r) => r.role)).not.toContain('difference');
    }
  });

  it.each([100, 300, 500, 1000, 25000])('representa la solución de L = %s', (threshold) => {
    const built = figure('optimization-response-region', { threshold });
    const solution = optimizeResponseThreshold(threshold);
    if (solution.kind !== 'feasible') throw new Error('Se esperaba solución');
    const frontier = solution.continuousIntersectionUsers;
    const feasible = built.chart.bands.find((band) => band.role === 'feasible')!;
    expect([feasible.from, feasible.to]).toEqual([0, frontier]);
    expect(built.chart.markers.find((m) => m.shape === 'circle')?.x).toBe(
      solution.maximumIntegerUsers,
    );
    expect(built.chart.markers.some((m) => m.shape === 'square')).toBe(
      solution.responseAtNextUserMs !== undefined,
    );
    expect(Math.max(...numbers(built.table, 0))).toBeLessThan(100);
    for (const row of built.table.rows)
      expect(row[3]).toBe((row[0] as number) <= frontier ? 'sí' : 'no');
  });

  it('no inventa frontera ni cero usuarios cuando no hay solución', () => {
    const region = figure('optimization-response-region', { threshold: 50 });
    expect(region.chart.bands.map((band) => band.role)).toEqual(['infeasible']);
    expect(region.chart.references.map((r) => r.role)).not.toContain('frontier');
    expect(region.chart.markers).toHaveLength(1);
    expect(region.parameters.at(-1)?.value).toBe('sin solución factible');
    const check = figure('optimization-integer-verification', { threshold: 50 });
    expect(column(check.table, 3).every((state) => state === 'no factible')).toBe(true);
    const capacity = figure('optimization-threshold-capacity', { threshold: 50 });
    expect(capacity.table.rows[0]).toEqual([50, null, null, 'sin solución factible']);
    expect(capacity.chart.markers).toEqual([]);
  });

  it('conserva los saltos exactos de la capacidad', () => {
    const capacity = figure('optimization-threshold-capacity');
    const steps = capacity.table.rows.filter((row) => row[3] === 'escalón entero');
    for (const row of steps.slice(0, -1))
      expect(row[0]).toBe(valueOf(responseTime(row[1] as number)));
    expect(capacity.chart.lines[0].interpolation).toBe('step');
  });

  it('fija los parámetros de los ejemplos y escenarios', () => {
    expect(figure('integrals-example-10-20', { a: 1, b: 2 }).fileSlug).toBe('integral-10-20s');
    expect(figure('optimization-scenario-300').notes[0]).toContain('m = 50');
    expect(figure('optimization-scenario-500').notes[0]).toContain('m = 66');
  });
});

describe('SVG', () => {
  it.each(catalog)('es autónomo y bien formado en ambos temas: %s', (id) => {
    const built = figure(id);
    for (const theme of ['academic', 'serverlab'] as const) {
      const svg = renderSvg(built, theme);
      const document = parseXml(svg);
      expect(document.querySelector('parsererror')).toBeNull();
      const root = document.documentElement;
      expect(root.getAttribute('viewBox')).toBe('0 0 1200 800');
      expect(root.getAttribute('width')).toBe('1200');
      expect(document.querySelector('[data-role="background"]')?.getAttribute('fill')).toBe(
        themes[theme].background,
      );
      expect(document.querySelectorAll('path[data-series]').length).toBeGreaterThan(0);
      expect(document.querySelector('[data-role="x-title"]')?.textContent).toBe(
        built.chart.x.label,
      );
      expect(document.querySelectorAll('[data-role="legend-label"]')).toHaveLength(
        built.legend.length,
      );
      expect(svg).not.toMatch(/<script|<foreignObject|\son\w+=|href=|@import|file:|NaN|Infinity/i);
      expect(svg.match(/url\((?!#)/g)).toBeNull();
      const ids = [...svg.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
      expect(new Set(ids).size).toBe(ids.length);
      for (const [, reference] of svg.matchAll(/url\(#([^)]+)\)/g))
        expect(ids).toContain(reference);
    }
  });

  it('cambia el tema sin cambiar los trazos matemáticos', () => {
    const built = figure('optimization-response-region');
    const paths = (theme: 'academic' | 'serverlab') =>
      [...parseXml(renderSvg(built, theme)).querySelectorAll('path[data-series]')].map((p) =>
        p.getAttribute('d'),
      );
    expect(paths('academic')).toEqual(paths('serverlab'));
    expect(themes.academic.background).toBe('#ffffff');
  });

  it('escala width y height conservando el viewBox', () => {
    const svg = renderSvg(figure('derivatives-first'), 'academic', { width: 3600, height: 2400 });
    expect(svg).toContain('width="3600" height="2400" viewBox="0 0 1200 800"');
  });

  it('escapa el texto y elimina caracteres no válidos', () => {
    expect(escapeXml('a<b & "c" \'d\' >\u0001')).toBe(
      'a&lt;b &amp; &quot;c&quot; &apos;d&apos; &gt;',
    );
    const hostile: ExportFigure = {
      ...figure('derivatives-first'),
      title: '<script>alert(1)</script> & "x"',
    };
    const svg = renderSvg(hostile);
    expect(svg).not.toContain('<script>');
    const document = parseXml(svg);
    expect(document.querySelector('parsererror')).toBeNull();
    expect(document.querySelector('title')?.textContent).toBe(hostile.title);
    expect(wrapText('palabra '.repeat(40).trim(), 20, 300).length).toBeGreaterThan(1);
  });

  it('mantiene contraste suficiente de texto y series en ambos temas', () => {
    const luminance = (hex: string) => {
      const [r, g, b] = [1, 3, 5].map((index) => {
        const channel = parseInt(hex.slice(index, index + 2), 16) / 255;
        return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const contrast = (a: string, b: string) => {
      const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
      return (high + 0.05) / (low + 0.05);
    };
    for (const theme of Object.values(themes)) {
      expect(contrast(theme.text, theme.background)).toBeGreaterThanOrEqual(7);
      expect(contrast(theme.muted, theme.background)).toBeGreaterThanOrEqual(4.5);
      for (const role of Object.keys(theme.series) as SeriesRole[])
        expect(
          contrast(theme.series[role].color, theme.background),
          `${theme.id} ${role}`,
        ).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe('CSV', () => {
  const table: DataTable = {
    columns: [{ label: 'Valor, "raro"', unit: 'ms' }, { label: 'Estado' }],
    rows: [
      [1 / 3, 'a;b'],
      [null, 'línea\nnueva'],
      [-0, 'x,y'],
    ],
  };

  it('usa coma y punto decimal sin redondear', () => {
    expect(valueOf(toCsv(table))).toBe(
      `${byteOrderMark}"Valor, ""raro"" (ms)",Estado\r\n0.3333333333333333,a;b\r\n,"línea\nnueva"\r\n0,"x,y"\r\n`,
    );
  });

  it('usa punto y coma y coma decimal en la variante regional', () => {
    expect(valueOf(toCsv(table, 'regional'))).toBe(
      `${byteOrderMark}"Valor, ""raro"" (ms)";Estado\r\n0,3333333333333333;"a;b"\r\n;"línea\nnueva"\r\n0;x,y\r\n`,
    );
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'rechaza %s',
    (value) => {
      expect(toCsv({ columns: [{ label: 'x' }], rows: [[value]] })).toMatchObject({
        ok: false,
        error: { code: 'non-finite' },
      });
    },
  );

  it('exporta los datos originales de las 15 figuras', () => {
    for (const id of catalog) {
      const built = figure(id);
      const lines = valueOf(toCsv(built.table)).trimEnd().split('\r\n');
      expect(lines).toHaveLength(built.table.rows.length + 1);
      expect(lines[0]).toContain('(');
    }
    const csv = valueOf(toCsv(figure('optimization-integer-verification').table));
    expect(csv).toContain(`66,${valueOf(responseTime(66))},500,máximo entero factible`);
  });
});

describe('nombres, metadatos y paquete', () => {
  it('genera nombres válidos en Windows y reconocibles', () => {
    expect(slugify('Límite: carga <inicial> 7,25 s')).toBe('limite-carga-inicial-7p25-s');
    expect(exportFileName(figure('dashboard-response-time').fileSlug, 'png')).toBe(
      'serverlab-tiempo-respuesta-n65.png',
    );
    expect(exportFileName(figure('integrals-example-0-30').fileSlug, 'png')).toBe(
      'serverlab-integral-0-30s.png',
    );
    expect(exportFileName(figure('optimization-response-region').fileSlug, 'png')).toBe(
      'serverlab-optimizacion-500ms.png',
    );
    expect(
      exportFileName(figure('optimization-threshold-capacity').fileSlug, 'csv', {
        csvVariant: 'regional',
      }),
    ).toBe('serverlab-capacidad-segun-umbral-regional.csv');
    expect(exportFileName('segunda-derivada', 'svg', { theme: 'serverlab' })).toBe(
      'serverlab-segunda-derivada-tema-oscuro.svg',
    );
    const names = catalog.map((id) => exportFileName(figure(id).fileSlug, 'png'));
    expect(new Set(names).size).toBe(15);
    for (const name of names) expect(name).toMatch(/^serverlab-[a-z0-9-]+\.png$/);
  });

  it('redacta una ficha completa sin numeración ni citas', () => {
    const record = academicRecord(figure('integrals-rate-area', { a: 10, b: 20 }));
    for (const text of [
      'Título:',
      'Descripción:',
      't: tiempo transcurrido (s)',
      'Límite inferior a: 10 s',
      'Dominio:',
      'T(t) = 5 + 0,2t',
      mathModelConfig.version,
      'Escala gráfica:',
      authorshipNote,
      hypotheticalNotice,
    ])
      expect(record).toContain(text);
    expect(record).not.toMatch(/Figura \d|https?:/);
  });

  it('ofrece las tres resoluciones 3:2 con alta por defecto', () => {
    expect(resolutions.map((r) => [r.width, r.height])).toEqual([
      [1200, 800],
      [2400, 1600],
      [3600, 2400],
    ]);
    expect(resolutionById(defaultResolution).width).toBe(2400);
    expect(Object.keys(defaultValues(findDefinition('integrals-example-0-30')!))).toEqual([]);
  });

  it('escribe un ZIP con directorio y CRC correctos', () => {
    const data = new TextEncoder().encode('123456789');
    expect(crc32(data)).toBe(0xcbf43926);
    const zip = createZip([{ path: 'fichas/á.txt', data }]);
    const view = new DataView(zip.buffer);
    expect(view.getUint32(0, true)).toBe(0x04034b50);
    const end = zip.length - 22;
    expect(view.getUint32(end, true)).toBe(0x06054b50);
    expect(view.getUint16(end + 10, true)).toBe(1);
    expect(view.getUint32(view.getUint32(end + 16, true), true)).toBe(0x02014b50);
  });
});
