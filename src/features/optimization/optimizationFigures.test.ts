import { describe, expect, it } from 'vitest';
import { mathModelConfig } from '../../config/model';
import { optimizeResponseThreshold, responseTime, type MathResult } from '../../math';
import {
  buildCapacityFigure,
  buildResponseFigure,
  buildVerificationFigure,
  optimizationScenarios,
} from './optimizationFigures';
import { parseThreshold } from './optimizationInput';

function valueOf<T>(result: MathResult<T>): T {
  if (!result.ok) throw new Error(result.error.message);
  return result.value;
}
const response = (users: number) => valueOf(responseTime(users));

describe('casos de referencia de M07', () => {
  it.each([
    [100, 0, 0, 100, 102.020202],
    [300, 50, 50, 300, 308.1632653],
    [500, 66, 66.6666667, 488.2352941, 506.0606061],
    [1000, 81, 81.8181818, 952.6315789, 1011.1111111],
  ])('L = %s ms', (threshold, maximum, frontier, atMaximum, atNext) => {
    const result = optimizeResponseThreshold(threshold);
    if (result.kind !== 'feasible') throw new Error('Se esperaba solución factible');
    expect(result.maximumIntegerUsers).toBe(maximum);
    expect(result.continuousIntersectionUsers).toBeCloseTo(frontier, 6);
    expect(result.responseAtMaximumMs).toBeCloseTo(atMaximum, 6);
    expect(result.responseAtNextUserMs).toBeCloseTo(atNext, 6);
    expect(result.marginMs).toBeCloseTo(threshold - atMaximum, 6);
  });

  it('distingue sin solución de cero usuarios', () => {
    expect(optimizeResponseThreshold(50)).toEqual({ kind: 'no-feasible-load', thresholdMs: 50 });
    expect(optimizeResponseThreshold(99.99).kind).toBe('no-feasible-load');
  });

  it.each([19900, 20000, 25000])('limita el máximo a 99 sin evaluar R(100): L = %s', (limit) => {
    const result = optimizeResponseThreshold(limit);
    expect(result).toMatchObject({ kind: 'feasible', maximumIntegerUsers: 99 });
    if (result.kind === 'feasible') expect(result.responseAtNextUserMs).toBeUndefined();
  });

  it('coincide con una búsqueda exhaustiva para umbrales con dos decimales', () => {
    const responses = Array.from({ length: 100 }, (_, users) => response(users));
    let mismatches = 0;
    for (let cents = 10_000; cents <= 2_500_000; cents += 7) {
      const limit = cents / 100;
      const expected = responses.filter((value) => value <= limit).length - 1;
      const result = optimizeResponseThreshold(limit);
      if (result.kind !== 'feasible' || result.maximumIntegerUsers !== expected) mismatches += 1;
    }
    for (const limit of [100, 150, 212.5, 300, 400, 525, 700, 900, 1150, 1900, 4900, 19900]) {
      const result = optimizeResponseThreshold(limit);
      if (
        result.kind !== 'feasible' ||
        result.maximumIntegerUsers !== responses.filter((value) => value <= limit).length - 1
      )
        mismatches += 1;
    }
    expect(mismatches).toBe(0);
  });
});

describe('figura de respuesta y región factible', () => {
  it.each([100.5, 300, 500, 1000, 19900, 25000])(
    'separa las regiones en la frontera: L = %s',
    (limit) => {
      const figure = valueOf(buildResponseFigure(limit, 65));
      const [start, frontier] = figure.regions.feasible!;
      expect(start).toBe(0);
      expect(figure.regions.infeasible).toEqual([frontier, 100]);
      for (const point of figure.data) {
        expect(point.users).toBeLessThan(100);
        expect(Number.isFinite(point.responseMs)).toBe(true);
        if (point.users < frontier - 1e-9) expect(point.responseMs).toBeLessThanOrEqual(limit);
        if (point.users > frontier + 1e-9) expect(point.responseMs).toBeGreaterThan(limit);
      }
      const intersection = figure.points.find((point) => point.role === 'intersection')!;
      expect(intersection.responseMs).toBeCloseTo(limit, 6);
      expect(figure.data.map((point) => point.users)).toContain(intersection.users);
    },
  );

  it('marca intersección, máximo, siguiente y carga como puntos distintos', () => {
    const figure = valueOf(buildResponseFigure(500, 65));
    expect(figure.points.map((point) => point.role)).toEqual([
      'intersection',
      'maximum',
      'next',
      'current',
    ]);
    expect(figure.points.map((point) => point.users)).toEqual([
      expect.closeTo(66.6666667, 6),
      66,
      67,
      65,
    ]);
  });

  it('no inventa frontera cuando no hay solución', () => {
    const figure = valueOf(buildResponseFigure(50, 65));
    expect(figure.regions).toEqual({ feasible: null, infeasible: [0, 100] });
    expect(figure.points.map((point) => point.role)).toEqual(['current']);
    expect(figure.legend.map((item) => item.marker)).not.toContain('frontier');
    expect(valueOf(buildVerificationFigure(50))).toBeNull();
  });

  it('con L = B sólo admite n = 0', () => {
    const figure = valueOf(buildResponseFigure(100, 0));
    expect(figure.regions.feasible).toEqual([0, 0]);
    const verification = valueOf(buildVerificationFigure(100))!;
    expect(verification.integers[0]).toEqual({ users: 0, responseMs: 100 });
    expect(verification.points.map((point) => point.users)).toEqual([0, 0, 1]);
  });

  it('omite el siguiente usuario cuando el máximo es 99', () => {
    const verification = valueOf(buildVerificationFigure(25000))!;
    expect(verification.points.map((point) => point.role)).toEqual(['intersection', 'maximum']);
    expect(verification.integers.at(-1)?.users).toBe(99);
    expect(verification.data.every((point) => point.users < 100)).toBe(true);
  });

  it('rechaza umbrales y cargas inválidas sin convertirlas en cero', () => {
    expect(buildResponseFigure(Number.NaN, 65).ok).toBe(false);
    expect(buildCapacityFigure(Number.POSITIVE_INFINITY).ok).toBe(false);
    expect(buildResponseFigure(500, 100)).toMatchObject({
      ok: false,
      error: { code: 'singularity' },
    });
    expect(buildResponseFigure(500, -1).ok).toBe(false);
  });
});

describe('relación entre umbral y capacidad', () => {
  const figure = valueOf(buildCapacityFigure(500));

  it('produce una escalera exacta respecto al motor', () => {
    expect(figure.steps[0]).toMatchObject({ thresholdMs: 100, maximumUsers: 0 });
    for (let index = 1; index < figure.steps.length; index += 1) {
      const previous = figure.steps[index - 1];
      const middle = (previous.thresholdMs + figure.steps[index].thresholdMs) / 2;
      const result = optimizeResponseThreshold(middle);
      expect(result).toMatchObject({
        kind: 'feasible',
        maximumIntegerUsers: previous.maximumUsers,
      });
    }
    expect(figure.steps.at(-1)?.thresholdMs).toBe(2000);
  });

  it('no representa como cero los umbrales sin solución', () => {
    expect(figure.domainMs[0]).toBeLessThan(mathModelConfig.response.baseResponseMs);
    for (const point of [...figure.steps, ...figure.continuous])
      expect(point.thresholdMs).toBeGreaterThanOrEqual(100);
    expect(figure.continuous.at(-1)?.continuousUsers).toBeCloseTo(90.4761905, 6);
  });

  it('amplía el dominio para umbrales altos sin superar 99 usuarios', () => {
    const wide = valueOf(buildCapacityFigure(25000));
    expect(wide.domainMs[1]).toBe(25000);
    expect(Math.max(...wide.steps.map((point) => point.maximumUsers!))).toBe(99);
  });

  it('conserva identificadores y metadatos estables', () => {
    const figures = [
      valueOf(buildResponseFigure(500, 65)),
      valueOf(buildVerificationFigure(500))!,
      figure,
      ...optimizationScenarios.map((scenario) =>
        valueOf(buildResponseFigure(scenario.thresholdMs, 65, scenario.id)),
      ),
    ];
    expect(figures.map((item) => item.id)).toEqual([
      'optimization-response-region',
      'optimization-integer-verification',
      'optimization-threshold-capacity',
      'optimization-scenario-500',
      'optimization-scenario-300',
    ]);
    for (const item of figures) {
      expect(item.title).not.toBe('');
      expect(item.xAxis.unit).not.toBe('');
      expect(item.yAxis.unit).not.toBe('');
      expect(item.legend.length).toBeGreaterThan(0);
      expect(item.model.version).toBe(mathModelConfig.version);
      expect(item.parameters.thresholdMs).toBeGreaterThan(0);
    }
  });
});

describe('validación del campo de umbral', () => {
  it.each([
    ['500', 500],
    [' 300,5 ', 300.5],
    ['300.25', 300.25],
    ['0', 0],
    ['25000', 25000],
  ])('acepta «%s»', (text, expected) => expect(valueOf(parseThreshold(text))).toBe(expected));

  it.each([
    ['', 'non-finite'],
    ['abc', 'non-finite'],
    ['NaN', 'non-finite'],
    ['Infinity', 'non-finite'],
    ['1.000', 'non-finite'],
    ['500,', 'non-finite'],
    ['9'.repeat(400), 'non-finite'],
    ['-5', 'negative-value'],
    ['25000,01', 'outside-domain'],
  ])('rechaza «%s»', (text, code) =>
    expect(parseThreshold(text)).toMatchObject({ ok: false, error: { code } }),
  );
});
