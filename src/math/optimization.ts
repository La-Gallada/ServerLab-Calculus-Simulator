import { mathModelConfig, type MathModelConfig } from '../config/model';
import type { MathResult, OptimizationResult } from './types';
import { operationalResponseTime, responseTime } from './response';
import { success, validateFinite } from './validation';

/** Mayor número representable estrictamente menor que un valor positivo. */
const justBelow = (value: number) => value * (1 - Number.EPSILON / 2);

/**
 * Mayor entero m del dominio con R(m) ≤ L, por búsqueda binaria sobre la propia
 * función de respuesta. R es estrictamente creciente, así que no se necesitan
 * tolerancias. Requiere R(0) ≤ L.
 */
function largestFeasibleUsers(thresholdMs: number, config: MathModelConfig): MathResult<number> {
  let feasible = 0;
  let upper = Math.ceil(config.response.referenceCapacityUsers) - 1;
  while (feasible < upper) {
    const middle = Math.ceil((feasible + upper) / 2);
    const response = operationalResponseTime(middle, config);
    if (!response.ok) return response;
    if (response.value <= thresholdMs) feasible = middle;
    else upper = middle - 1;
  }
  return success(feasible);
}

/**
 * Frontera continua n* = C(L − B)/(L − B + k), coherente con la solución entera.
 * La fórmula sólo aproxima en coma flotante: el resultado se mantiene en
 * [m, m + 1) y siempre por debajo de C.
 */
function continuousFrontier(
  thresholdMs: number,
  maximumUsers: number,
  config: MathModelConfig,
): number {
  const {
    baseResponseMs: base,
    growthCoefficientMs: k,
    referenceCapacityUsers: c,
  } = config.response;
  const excess = thresholdMs - base;
  if (excess === 0) return 0;
  const product = c * excess;
  // Para umbrales enormes se divide antes de multiplicar y se evita el desbordamiento.
  const formula = Number.isFinite(product) ? product / (excess + k) : c * (excess / (excess + k));
  const ceiling = justBelow(Math.min(c, maximumUsers + 1));
  return Math.min(ceiling, Math.max(maximumUsers, formula));
}

export function optimizeResponseThreshold(
  thresholdMs: number,
  config: MathModelConfig = mathModelConfig,
): OptimizationResult {
  const valid = validateFinite(thresholdMs, 'El umbral');
  if (!valid.ok) return { kind: 'invalid-threshold', error: valid.error };
  if (thresholdMs < 0)
    return {
      kind: 'invalid-threshold',
      error: { code: 'negative-value', message: 'El umbral no puede ser negativo.' },
    };
  const { baseResponseMs: base, referenceCapacityUsers: c } = config.response;
  if (thresholdMs < base) return { kind: 'no-feasible-load', thresholdMs };
  const maximum = largestFeasibleUsers(thresholdMs, config);
  if (!maximum.ok) return { kind: 'invalid-threshold', error: maximum.error };
  const maximumIntegerUsers = maximum.value;
  const atMaximum = operationalResponseTime(maximumIntegerUsers, config);
  if (!atMaximum.ok) return { kind: 'invalid-threshold', error: atMaximum.error };
  const next =
    maximumIntegerUsers + 1 < c ? responseTime(maximumIntegerUsers + 1, config) : undefined;
  return {
    kind: 'feasible',
    thresholdMs,
    continuousIntersectionUsers: continuousFrontier(thresholdMs, maximumIntegerUsers, config),
    maximumIntegerUsers,
    responseAtMaximumMs: atMaximum.value,
    responseAtNextUserMs: next?.ok ? next.value : undefined,
    marginMs: thresholdMs - atMaximum.value,
  };
}
