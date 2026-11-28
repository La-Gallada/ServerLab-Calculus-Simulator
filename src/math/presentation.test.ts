/**
 * Valores citados en docs/PRESENTATION-GUIDE.md. Si el modelo cambia, esta prueba
 * falla para recordar que el guion y las figuras deben actualizarse.
 */
import { describe, expect, it } from 'vitest';
import {
  discreteResponseIncrement,
  firstDerivative,
  optimizeResponseThreshold,
  responseTime,
  transferredData,
  type MathResult,
} from '.';

function valueOf(result: MathResult<number>): number {
  if (!result.ok) throw new Error(result.error.message);
  return result.value;
}

describe('valores del guion de exposición', () => {
  it.each([
    [65, 471.4285714],
    [80, 900],
    [99, 19900],
    [99.9, 199900],
    [99.99, 1999900],
  ])('R(%s)', (n, expected) => expect(valueOf(responseTime(n))).toBeCloseTo(expected, 5));

  it('pendientes e incremento discreto', () => {
    expect(valueOf(firstDerivative(65))).toBeCloseTo(16.3265306, 6);
    expect(valueOf(firstDerivative(75))).toBeCloseTo(32, 10);
    expect(valueOf(discreteResponseIncrement(75))).toBeCloseTo(33.3333333, 6);
    expect(valueOf(firstDerivative(80))).toBeCloseTo(50, 10);
  });

  it('integrales', () => {
    expect(valueOf(transferredData(0, 30))).toBeCloseTo(240, 10);
    expect(valueOf(transferredData(10, 20))).toBeCloseTo(80, 10);
    expect(valueOf(transferredData(20, 30))).toBeCloseTo(100, 10);
  });

  it.each([
    [300, 50],
    [500, 66],
    [1000, 81],
  ])('máximo para %s ms', (threshold, maximum) =>
    expect(optimizeResponseThreshold(threshold)).toMatchObject({
      maximumIntegerUsers: maximum,
    }),
  );
});
