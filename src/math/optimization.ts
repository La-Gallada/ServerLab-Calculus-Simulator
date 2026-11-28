import { mathModelConfig, type MathModelConfig } from '../config/model';
import type { OptimizationResult } from './types';
import { operationalResponseTime, responseTime } from './response';
import { validateFinite } from './validation';
export function optimizeResponseThreshold(
  thresholdMs: number,
  config: MathModelConfig = mathModelConfig,
): OptimizationResult {
  const valid = validateFinite(thresholdMs, 'El umbral');
  if (!valid.ok) return { kind: 'invalid-threshold', error: valid.error };
  const {
    baseResponseMs: base,
    growthCoefficientMs: k,
    referenceCapacityUsers: c,
  } = config.response;
  if (thresholdMs < base) return { kind: 'no-feasible-load', thresholdMs };
  const continuousIntersectionUsers =
    thresholdMs === base ? 0 : (c * (thresholdMs - base)) / (thresholdMs - base + k);
  const maximumIntegerUsers = Math.min(c - 1, Math.floor(continuousIntersectionUsers));
  const atMaximum = operationalResponseTime(maximumIntegerUsers, config);
  if (!atMaximum.ok) return { kind: 'invalid-threshold', error: atMaximum.error };
  const next =
    maximumIntegerUsers + 1 < c ? responseTime(maximumIntegerUsers + 1, config) : undefined;
  return {
    kind: 'feasible',
    thresholdMs,
    continuousIntersectionUsers,
    maximumIntegerUsers,
    responseAtMaximumMs: atMaximum.value,
    responseAtNextUserMs: next?.ok ? next.value : undefined,
    marginMs: thresholdMs - atMaximum.value,
  };
}
