import { describe, expect, it } from 'vitest';
import { mathModelConfig } from '../../config/model';
import { accumulatedData, transferRate, transferredData, type MathResult } from '../../math';
import { buildIntegralFigure, exampleApplications, integralSeries } from './integralFigures';
import { relation, tex } from './integralTex';

function valueOf<T>(result: MathResult<T>): T {
  if (!result.ok) throw new Error(result.error.message);
  return result.value;
}

describe('valores de referencia de M06', () => {
  it.each([
    [0, 5, 0],
    [5, 6, 27.5],
    [10, 7, 60],
    [15, 8, 97.5],
    [20, 9, 140],
    [25, 10, 187.5],
    [30, 11, 240],
  ])('t = %s s', (seconds, rate, accumulated) => {
    expect(valueOf(transferRate(seconds))).toBeCloseTo(rate, 10);
    expect(valueOf(accumulatedData(seconds))).toBeCloseTo(accumulated, 10);
  });

  it.each([
    [0, 30, 240],
    [10, 20, 80],
    [0, 10, 60],
    [20, 30, 100],
    [5, 15, 70],
    [15, 15, 0],
  ])('D(%s, %s)', (a, b, expected) => {
    expect(valueOf(transferredData(a, b))).toBeCloseTo(expected, 10);
  });

  it('cumple aditividad, A′ = T, tasa positiva y acumulación creciente', () => {
    const parts = [
      [0, 10],
      [10, 20],
      [20, 30],
    ].reduce((sum, [a, b]) => sum + valueOf(transferredData(a, b)), 0);
    expect(parts).toBeCloseTo(valueOf(transferredData(0, 30)), 10);
    const series = valueOf(integralSeries(0, 30));
    expect(series.every((point) => point.rateMBps > 0)).toBe(true);
    expect(
      series.every(
        (point, index) => index === 0 || point.accumulatedMB > series[index - 1].accumulatedMB,
      ),
    ).toBe(true);
    const h = 1e-4;
    for (const t of [1, 7.25, 15, 29]) {
      const slope = (valueOf(accumulatedData(t + h)) - valueOf(accumulatedData(t - h))) / (2 * h);
      expect(slope).toBeCloseTo(valueOf(transferRate(t)), 5);
    }
  });

  it('rechaza intervalos invertidos, tiempos fuera de dominio y valores no finitos', () => {
    expect(buildIntegralFigure('rate', 20, 10)).toMatchObject({
      ok: false,
      error: { code: 'inverted-interval' },
    });
    expect(integralSeries(0, 31)).toMatchObject({ ok: false, error: { code: 'outside-domain' } });
    expect(integralSeries(-1, 10)).toMatchObject({ ok: false, error: { code: 'negative-value' } });
    expect(integralSeries(Number.NaN, 10)).toMatchObject({
      ok: false,
      error: { code: 'non-finite' },
    });
  });
});

describe('series y figuras del laboratorio', () => {
  it('incluye extremos fuera de la cuadrícula y sombrea sólo [a,b]', () => {
    const series = valueOf(integralSeries(10.25, 20.75));
    const selected = series.filter((point) => point.selectedRateMBps !== null);
    expect(selected[0].seconds).toBe(10.25);
    expect(selected.at(-1)?.seconds).toBe(20.75);
    expect(selected.every((point) => point.seconds >= 10.25 && point.seconds <= 20.75)).toBe(true);
    expect(
      series
        .filter((point) => point.seconds < 10.25 || point.seconds > 20.75)
        .every((point) => point.selectedRateMBps === null && point.selectedAccumulatedMB === null),
    ).toBe(true);
    expect(series[0].seconds).toBe(0);
    expect(series.at(-1)?.seconds).toBe(30);
  });

  it('mantiene la serie ordenada, sin duplicados y finita', () => {
    const series = valueOf(integralSeries(10, 20));
    const seconds = series.map((point) => point.seconds);
    expect(new Set(seconds).size).toBe(seconds.length);
    expect(seconds).toEqual([...seconds].sort((a, b) => a - b));
    expect(
      series.every((point) =>
        [point.seconds, point.rateMBps, point.accumulatedMB].every(Number.isFinite),
      ),
    ).toBe(true);
  });

  it('elimina el área en un intervalo de longitud cero y conserva el punto', () => {
    const series = valueOf(integralSeries(15.3, 15.3));
    expect(series.some((point) => point.seconds === 15.3)).toBe(true);
    expect(series.every((point) => point.selectedRateMBps === null)).toBe(true);
  });

  it('describe las cuatro figuras con identificadores y metadatos estables', () => {
    const figures = [
      valueOf(buildIntegralFigure('rate', 0, 30)),
      valueOf(buildIntegralFigure('accumulated', 0, 30)),
      ...exampleApplications.map((example) =>
        valueOf(buildIntegralFigure('rate', example.startSeconds, example.endSeconds, example.id)),
      ),
    ];
    expect(figures.map((figure) => figure.id)).toEqual([
      'integrals-rate-area',
      'integrals-accumulated-data',
      'integrals-example-0-30',
      'integrals-example-10-20',
    ]);
    for (const figure of figures) {
      expect(figure.title).not.toBe('');
      expect(figure.legend.length).toBeGreaterThan(0);
      expect(figure.model).toMatchObject({
        id: mathModelConfig.id,
        version: mathModelConfig.version,
      });
      expect(figure.data.length).toBeGreaterThan(2);
    }
    expect(figures[0].yAxis.unit).toBe('MB/s');
    expect(figures[1].yAxis.unit).toBe('MB');
    expect(figures[3].interval).toEqual({ startSeconds: 10, endSeconds: 20 });
    expect(figures[3].transferredMB).toBeCloseTo(80, 10);
  });

  it('formatea LaTeX con coma decimal e identifica aproximaciones', () => {
    expect(tex(27.5)).toBe('27{,}5');
    expect(relation(27.5, 80.00000000000001)).toBe('=');
    expect(relation(1 / 3)).toBe('\\approx');
  });
});
