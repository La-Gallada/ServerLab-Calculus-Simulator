import { mathModelConfig, type MathModelConfig } from '../config/model';
import type { MathResult, ResponsePoint } from './types';
import {
  failure,
  success,
  validateContinuousUsers,
  validateOperationalUsers,
  validateResolution,
} from './validation';
export function responseTime(
  users: number,
  config: MathModelConfig = mathModelConfig,
): MathResult<number> {
  const valid = validateContinuousUsers(users, config);
  if (!valid.ok) return valid;
  const {
    baseResponseMs: base,
    growthCoefficientMs: k,
    referenceCapacityUsers: c,
  } = config.response;
  return success(base + (k * users) / (c - users));
}
export function operationalResponseTime(
  users: number,
  config: MathModelConfig = mathModelConfig,
): MathResult<number> {
  const valid = validateOperationalUsers(users, config);
  return valid.ok ? responseTime(users, config) : valid;
}
export function responseCurve(
  startUsers: number,
  endUsers: number,
  steps = 100,
  config: MathModelConfig = mathModelConfig,
): MathResult<ResponsePoint[]> {
  const start = validateContinuousUsers(startUsers, config);
  if (!start.ok) return start;
  const end = validateContinuousUsers(endUsers, config);
  if (!end.ok) return end;
  const resolution = validateResolution(steps);
  if (!resolution.ok) return resolution;
  if (endUsers <= startUsers)
    return failure('outside-domain', 'El final de la curva debe ser mayor que el inicio.');
  const increment = (endUsers - startUsers) / (steps - 1);
  const points: ResponsePoint[] = [];
  for (let index = 0; index < steps; index += 1) {
    const users = index === steps - 1 ? endUsers : startUsers + increment * index;
    const value = responseTime(users, config);
    if (!value.ok) return value;
    points.push({ users, responseMs: value.value });
  }
  return success(points);
}
