import { describe, expect, it } from 'vitest';
import {
  accumulatedData,
  areaCurve,
  capacityApproximations,
  derivativeCurve,
  discreteResponseIncrement,
  firstDerivative,
  formatters,
  initialSimulationInput,
  limitAtCapacityFromLeft,
  limitAtZeroFromRight,
  optimizeResponseThreshold,
  operationalResponseTime,
  responseCurve,
  responseTime,
  secondDerivative,
  simulationSnapshot,
  tangentCurve,
  tangentLine,
  transferRate,
  transferredData,
} from '.';

const closeTo = (actual: number, expected: number, precision = 8) =>
  expect(actual).toBeCloseTo(expected, precision);
const valueOf = <T>(result: { ok: true; value: T } | { ok: false }) => {
  expect(result.ok).toBe(true);
  return (result as { ok: true; value: T }).value;
};

describe('motor de respuesta', () => {
  it.each([
    [0, 100],
    [25, 166.6666667],
    [50, 300],
    [60, 400],
    [65, 471.4285714],
    [75, 700],
    [90, 1900],
    [99, 19900],
  ])('calcula R(%s)', (users, expected) => closeTo(valueOf(responseTime(users)), expected, 6));
  it('distingue dominio continuo, operativo y singularidad', () => {
    expect(responseTime(65.5).ok).toBe(true);
    expect(operationalResponseTime(65.5)).toMatchObject({
      ok: false,
      error: { code: 'non-integer-user-count' },
    });
    expect(responseTime(100)).toMatchObject({ ok: false, error: { code: 'singularity' } });
    expect(responseTime(-1)).toMatchObject({ ok: false, error: { code: 'negative-value' } });
  });
  it('mantiene crecimiento estricto y curvas válidas', () => {
    const curve = valueOf(responseCurve(0, 99.9, 200));
    for (let i = 1; i < curve.length; i += 1)
      expect(curve[i].responseMs).toBeGreaterThan(curve[i - 1].responseMs);
    expect(curve.every((point) => Number.isFinite(point.responseMs) && point.users < 100)).toBe(
      true,
    );
  });
});

describe('límites y derivadas', () => {
  it('representa límites sin evaluar la singularidad', () => {
    expect(limitAtZeroFromRight()).toEqual({ kind: 'finite', value: 100, unit: 'ms' });
    expect(limitAtCapacityFromLeft()).toEqual({ kind: 'positive-infinity', unit: 'ms' });
    const samples = valueOf(capacityApproximations());
    expect(samples.at(-1)?.responseMs).toBeGreaterThan(samples[0].responseMs);
  });
  it.each([
    [0, 2],
    [50, 8],
    [60, 12.5],
    [65, 16.3265306],
    [90, 200],
    [99, 20000],
  ])("calcula R'(%s)", (users, expected) => closeTo(valueOf(firstDerivative(users)), expected, 6));
  it.each([
    [0, 0.04],
    [50, 0.32],
    [90, 40],
  ])("calcula R''(%s)", (users, expected) =>
    closeTo(valueOf(secondDerivative(users)), expected, 8),
  );
  it('diferencia incremento discreto y derivada, y genera tangente', () => {
    closeTo(valueOf(discreteResponseIncrement(50)), 8.1632653, 6);
    expect(discreteResponseIncrement(99)).toMatchObject({
      ok: false,
      error: { code: 'singularity' },
    });
    const line = valueOf(tangentLine(60));
    closeTo(line.evaluate(60), valueOf(responseTime(60)));
    const curve = valueOf(tangentCurve(60, 50, 70, 5));
    expect(curve).toHaveLength(5);
    closeTo(curve[2].responseMs, line.evaluate(curve[2].users));
  });
  it('mantiene derivadas positivas y crecientes', () => {
    const curve = valueOf(derivativeCurve(1, 0, 99, 100));
    expect(curve.every((point) => point.value > 0 && Number.isFinite(point.value))).toBe(true);
    expect(curve.at(-1)?.value).toBeGreaterThan(curve[0].value);
  });
});

describe('transferencia e integrales', () => {
  it.each([
    [0, 5],
    [10, 7],
    [20, 9],
    [30, 11],
  ])('calcula T(%s)', (seconds, expected) => closeTo(valueOf(transferRate(seconds)), expected));
  it.each([
    [0, 0],
    [10, 60],
    [20, 140],
    [30, 240],
  ])('calcula A(%s)', (seconds, expected) => closeTo(valueOf(accumulatedData(seconds)), expected));
  it('calcula integrales, aditividad y rechaza intervalos inválidos', () => {
    closeTo(valueOf(transferredData(0, 30)), 240);
    closeTo(valueOf(transferredData(10, 20)), 80);
    closeTo(valueOf(transferredData(15, 15)), 0);
    closeTo(
      valueOf(transferredData(0, 10)) + valueOf(transferredData(10, 30)),
      valueOf(transferredData(0, 30)),
    );
    expect(transferredData(20, 10)).toMatchObject({
      ok: false,
      error: { code: 'inverted-interval' },
    });
    expect(transferRate(31)).toMatchObject({ ok: false, error: { code: 'outside-domain' } });
  });
  it('genera área válida y conserva la relación A′=T', () => {
    const area = valueOf(areaCurve(10, 20, 11));
    expect(area).toHaveLength(11);
    expect(area[0].baselineMB).toBe(60);
    expect(
      area.every(
        (point) => Number.isFinite(point.rateMBps) && Number.isFinite(point.accumulatedMB),
      ),
    ).toBe(true);
    const h = 0.0001;
    const numericalDerivative =
      (valueOf(accumulatedData(10 + h)) - valueOf(accumulatedData(10 - h))) / (2 * h);
    closeTo(numericalDerivative, valueOf(transferRate(10)), 4);
  });
});

describe('optimización y snapshot', () => {
  it('resuelve casos de umbral y verifica usuarios vecinos', () => {
    expect(optimizeResponseThreshold(50)).toEqual({ kind: 'no-feasible-load', thresholdMs: 50 });
    const atBase = optimizeResponseThreshold(100);
    expect(atBase).toMatchObject({ kind: 'feasible', maximumIntegerUsers: 0 });
    for (const [threshold, maximum] of [
      [300, 50],
      [500, 66],
      [1000, 81],
    ] as const) {
      const result = optimizeResponseThreshold(threshold);
      expect(result).toMatchObject({ kind: 'feasible', maximumIntegerUsers: maximum });
      if (result.kind === 'feasible') {
        expect(result.responseAtMaximumMs).toBeLessThanOrEqual(threshold);
        expect(result.responseAtNextUserMs).toBeGreaterThan(threshold);
      }
    }
  });
  it('verifica el corte de 500 ms y el snapshot inicial inmutable', () => {
    const result = optimizeResponseThreshold(500);
    if (result.kind !== 'feasible') throw new Error('Se esperaba solución factible');
    closeTo(result.continuousIntersectionUsers, 66.6666667, 6);
    closeTo(result.responseAtMaximumMs, 488.2352941, 6);
    closeTo(result.responseAtNextUserMs ?? 0, 506.0606061, 6);
    const input = { ...initialSimulationInput };
    const snapshot = valueOf(simulationSnapshot(input));
    expect(snapshot.meetsResponseObjective).toBe(true);
    expect(snapshot.input).not.toBe(input);
    expect(formatters.milliseconds(snapshot.responseMs)).toContain('ms');
  });
  it('rechaza valores no finitos y resoluciones inválidas', () => {
    expect(responseTime(Number.NaN)).toMatchObject({ ok: false, error: { code: 'non-finite' } });
    expect(responseCurve(0, 99, 1)).toMatchObject({
      ok: false,
      error: { code: 'invalid-resolution' },
    });
    expect(areaCurve(0, 30, Infinity)).toMatchObject({ ok: false, error: { code: 'non-finite' } });
  });
});
