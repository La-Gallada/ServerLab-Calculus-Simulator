/**
 * Auditoría M09: contrasta el motor con las expresiones del enunciado y con
 * aproximaciones numéricas que no reutilizan sus fórmulas.
 */
import { describe, expect, it } from 'vitest';
import {
  accumulatedData,
  discreteResponseIncrement,
  firstDerivative,
  formatters,
  responseTime,
  secondDerivative,
  tangentLine,
  transferRate,
  transferredData,
  type MathResult,
} from '.';

function valueOf(result: MathResult<number>): number {
  if (!result.ok) throw new Error(result.error.message);
  return result.value;
}
const R = (n: number) => valueOf(responseTime(n));
const relative = (actual: number, expected: number) =>
  Math.abs(actual - expected) / Math.max(1, Math.abs(expected));

const continuous = Array.from({ length: 400 }, (_, index) => index * 0.2475);

describe('respuesta y derivadas', () => {
  it('coincide con las expresiones del modelo en el dominio continuo', () => {
    for (const n of continuous) {
      expect(relative(R(n), 100 + (200 * n) / (100 - n))).toBeLessThan(1e-12);
      expect(relative(valueOf(firstDerivative(n)), 20000 / (100 - n) ** 2)).toBeLessThan(1e-12);
      expect(relative(valueOf(secondDerivative(n)), 40000 / (100 - n) ** 3)).toBeLessThan(1e-12);
    }
  });

  it('coincide con diferencias finitas y es creciente y convexa', () => {
    for (const n of continuous.filter((value) => value > 0.01 && value < 97)) {
      const h = 1e-4;
      const first = (R(n + h) - R(n - h)) / (2 * h);
      const second = (R(n + h) - 2 * R(n) + R(n - h)) / h ** 2;
      expect(relative(valueOf(firstDerivative(n)), first)).toBeLessThan(1e-6);
      expect(relative(valueOf(secondDerivative(n)), second)).toBeLessThan(1e-3);
      expect(first).toBeGreaterThan(0);
      expect(second).toBeGreaterThan(0);
    }
  });

  it('mantiene tangente e incremento discreto coherentes', () => {
    for (let n = 0; n < 99; n += 1) {
      const line = tangentLine(n);
      if (!line.ok) throw new Error(line.error.message);
      expect(line.value.evaluate(n)).toBe(R(n));
      // Convexidad: la tangente queda por debajo y la secante supera a la derivada.
      expect(line.value.evaluate(n + 1)).toBeLessThan(R(n + 1));
      expect(valueOf(discreteResponseIncrement(n))).toBeGreaterThan(line.value.slopeMsPerUser);
      expect(valueOf(discreteResponseIncrement(n))).toBeCloseTo(R(n + 1) - R(n), 10);
    }
    expect(discreteResponseIncrement(99).ok).toBe(false);
    expect(responseTime(100).ok).toBe(false);
  });
});

describe('transferencia', () => {
  it('integra numéricamente la tasa y respeta aditividad', () => {
    for (let a = 0; a <= 30; a += 2.5)
      for (let b = a; b <= 30; b += 2.5) {
        const steps = 200;
        const h = (b - a) / steps;
        let sum = 0;
        for (let i = 0; i < steps; i += 1) sum += valueOf(transferRate(a + (i + 0.5) * h)) * h;
        const data = valueOf(transferredData(a, b));
        expect(data).toBeCloseTo(sum, 8);
        expect(data).toBeCloseTo(valueOf(accumulatedData(b)) - valueOf(accumulatedData(a)), 10);
        if (a === b) expect(data).toBe(0);
        else expect(data).toBeGreaterThan(0);
      }
  });
});

describe('presentación de unidades', () => {
  it('concuerda en número con la cantidad de usuarios', () => {
    expect(formatters.users(0)).toBe('0 usuarios');
    expect(formatters.users(1)).toBe('1 usuario');
    expect(formatters.users(2)).toBe('2 usuarios');
  });
});
