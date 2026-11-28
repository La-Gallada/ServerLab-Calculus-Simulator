/**
 * Regresiones M09: con `floor(n*)` el máximo quedaba un usuario por debajo en 17
 * de los 100 umbrales exactos L = R(n).
 */
import { describe, expect, it } from 'vitest';
import { mathModelConfig, type MathModelConfig } from '../config/model';
import {
  buildCapacityFigure,
  buildResponseFigure,
} from '../features/optimization/optimizationFigures';
import { resolveFigure } from '../export/registry';
import {
  optimizeResponseThreshold,
  responseTime,
  simulationSnapshot,
  initialSimulationInput,
} from '.';

const response = (users: number) => {
  const result = responseTime(users);
  if (!result.ok) throw new Error(result.error.message);
  return result.value;
};

/** Número de coma flotante contiguo, para un valor positivo. */
function neighbor(value: number, direction: 1 | -1): number {
  const view = new DataView(new ArrayBuffer(8));
  view.setFloat64(0, value);
  view.setBigInt64(0, view.getBigInt64(0) + BigInt(direction));
  return view.getFloat64(0);
}

function feasible(threshold: number) {
  const result = optimizeResponseThreshold(threshold);
  if (result.kind !== 'feasible') throw new Error(`Sin solución para ${threshold}`);
  return result;
}

/** Comprueba el contrato completo de una solución, sin tolerancias. */
function expectContract(threshold: number, expected: number) {
  const result = feasible(threshold);
  const { maximumIntegerUsers: m, continuousIntersectionUsers: frontier } = result;
  expect(m).toBe(expected);
  expect(response(m)).toBeLessThanOrEqual(threshold);
  if (m < 99) {
    expect(response(m + 1)).toBeGreaterThan(threshold);
    expect(result.responseAtNextUserMs).toBe(response(m + 1));
    expect(frontier).toBeLessThan(m + 1);
  } else expect(result.responseAtNextUserMs).toBeUndefined();
  expect(frontier).toBeGreaterThanOrEqual(m);
  expect(frontier).toBeLessThan(100);
  expect(Number.isFinite(frontier)).toBe(true);
}

const users = Array.from({ length: 100 }, (_, n) => n);

describe('precisión en las fronteras L = R(n)', () => {
  it.each(users)('L = R(%s) admite exactamente n', (n) => {
    expectContract(response(n), n);
  });

  it.each(users)('justo por encima de R(%s) admite n', (n) => {
    expectContract(neighbor(response(n), 1), n);
  });

  it.each(users.slice(1))('justo por debajo de R(%s) admite n − 1', (n) => {
    expectContract(neighbor(response(n), -1), n - 1);
  });

  it('justo por debajo del tiempo base no hay solución', () => {
    expect(optimizeResponseThreshold(neighbor(100, -1)).kind).toBe('no-feasible-load');
  });

  it.each([2, 4, 13, 14, 17, 19, 21, 26, 29, 38, 44, 47, 49, 51, 56, 57, 87])(
    'corrige el caso reportado n = %s',
    (n) => expect(feasible(response(n)).maximumIntegerUsers).toBe(n),
  );
});

describe('umbrales extremos y no válidos', () => {
  it.each([19900.5, 1e12, 1e20, 1e300, 1e308, Number.MAX_VALUE])(
    'no desborda ni alcanza la capacidad: L = %s',
    (threshold) => {
      expectContract(threshold, 99);
      const figure = buildResponseFigure(threshold, 65);
      expect(figure.ok).toBe(true);
      if (figure.ok) expect(figure.value.data.every((point) => point.users < 100)).toBe(true);
    },
  );

  it.each([-1, -100, -Number.MAX_VALUE])('rechaza el umbral negativo %s', (threshold) => {
    expect(optimizeResponseThreshold(threshold)).toMatchObject({
      kind: 'invalid-threshold',
      error: { code: 'negative-value' },
    });
  });

  it('distingue cero, negativo y no finito', () => {
    expect(optimizeResponseThreshold(0).kind).toBe('no-feasible-load');
    expect(optimizeResponseThreshold(-0).kind).toBe('no-feasible-load');
    expect(optimizeResponseThreshold(Number.NaN)).toMatchObject({
      error: { code: 'non-finite' },
    });
  });

  it('respeta parámetros alternativos de configuración', () => {
    const config: MathModelConfig = {
      ...mathModelConfig,
      response: { referenceCapacityUsers: 250, baseResponseMs: 40, growthCoefficientMs: 33 },
    } as unknown as MathModelConfig;
    for (let n = 0; n < 250; n += 1) {
      const at = responseTime(n, config);
      if (!at.ok) throw new Error(at.error.message);
      const result = optimizeResponseThreshold(at.value, config);
      expect(result).toMatchObject({ kind: 'feasible', maximumIntegerUsers: n });
    }
  });
});

describe('coherencia de los consumidores', () => {
  it('la escalera de capacidad coincide con el motor en cada salto', () => {
    const figure = buildCapacityFigure(25000);
    if (!figure.ok) throw new Error(figure.error.message);
    for (const step of figure.value.steps.slice(0, -1))
      expect(feasible(step.thresholdMs).maximumIntegerUsers).toBe(step.maximumUsers);
  });

  it.each([2, 13, 49, 87])('figuras y snapshot usan n = %s en su frontera', (n) => {
    const threshold = response(n);
    const region = buildResponseFigure(threshold, n);
    if (!region.ok) throw new Error(region.error.message);
    expect(region.value.regions.feasible?.[1]).toBeGreaterThanOrEqual(n);
    expect(region.value.points.find((point) => point.role === 'maximum')?.users).toBe(n);
    const verification = resolveFigure('optimization-integer-verification', { threshold });
    if (!verification.ok) throw new Error(verification.error.message);
    expect(verification.value.notes.join(' ')).toContain(`m = ${n} `);
    const snapshot = simulationSnapshot({
      ...initialSimulationInput,
      concurrentUsers: n,
      thresholdMs: threshold,
    });
    if (!snapshot.ok) throw new Error(snapshot.error.message);
    expect(snapshot.value.meetsResponseObjective).toBe(true);
    expect(snapshot.value.optimization).toMatchObject({ maximumIntegerUsers: n });
  });
});
