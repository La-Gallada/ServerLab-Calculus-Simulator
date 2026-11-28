import { mathModelConfig, type MathModelConfig } from '../config/model';
import type { DerivativePoint, MathResult, TangentLine, TangentPoint } from './types';
import { operationalResponseTime, responseTime } from './response';
import {
  failure,
  success,
  validateContinuousUsers,
  validateOperationalUsers,
  validateResolution,
} from './validation';
export function firstDerivative(
  users: number,
  config: MathModelConfig = mathModelConfig,
): MathResult<number> {
  const valid = validateContinuousUsers(users, config);
  if (!valid.ok) return valid;
  const { growthCoefficientMs: k, referenceCapacityUsers: c } = config.response;
  return success((k * c) / (c - users) ** 2);
}
export function secondDerivative(
  users: number,
  config: MathModelConfig = mathModelConfig,
): MathResult<number> {
  const valid = validateContinuousUsers(users, config);
  if (!valid.ok) return valid;
  const { growthCoefficientMs: k, referenceCapacityUsers: c } = config.response;
  return success((2 * k * c) / (c - users) ** 3);
}
export function discreteResponseIncrement(
  users: number,
  config: MathModelConfig = mathModelConfig,
): MathResult<number> {
  const valid = validateOperationalUsers(users, config);
  if (!valid.ok) return valid;
  const current = responseTime(users, config);
  const next = operationalResponseTime(users + 1, config);
  if (!current.ok) return current;
  if (!next.ok) return next;
  return success(next.value - current.value);
}
export function tangentLine(
  users: number,
  config: MathModelConfig = mathModelConfig,
): MathResult<TangentLine> {
  const response = responseTime(users, config);
  const slope = firstDerivative(users, config);
  if (!response.ok) return response;
  if (!slope.ok) return slope;
  return success({
    atUsers: users,
    responseMs: response.value,
    slopeMsPerUser: slope.value,
    evaluate: (x) => response.value + slope.value * (x - users),
  });
}
export function tangentCurve(
  atUsers: number,
  startUsers: number,
  endUsers: number,
  steps = 20,
  config: MathModelConfig = mathModelConfig,
): MathResult<TangentPoint[]> {
  const line = tangentLine(atUsers, config);
  const start = validateContinuousUsers(startUsers, config);
  const end = validateContinuousUsers(endUsers, config);
  const resolution = validateResolution(steps);
  if (!line.ok) return line;
  if (!start.ok) return start;
  if (!end.ok) return end;
  if (!resolution.ok) return resolution;
  if (endUsers <= startUsers)
    return failure('outside-domain', 'El final de la tangente debe ser mayor que el inicio.');
  const increment = (endUsers - startUsers) / (steps - 1);
  return success(
    Array.from({ length: steps }, (_, index) => {
      const users = index === steps - 1 ? endUsers : startUsers + increment * index;
      return { users, responseMs: line.value.evaluate(users) };
    }),
  );
}
export function derivativeCurve(
  order: 1 | 2,
  startUsers: number,
  endUsers: number,
  steps = 100,
  config: MathModelConfig = mathModelConfig,
): MathResult<DerivativePoint[]> {
  const start = validateContinuousUsers(startUsers, config);
  const end = validateContinuousUsers(endUsers, config);
  const resolution = validateResolution(steps);
  if (!start.ok) return start;
  if (!end.ok) return end;
  if (!resolution.ok) return resolution;
  if (endUsers <= startUsers)
    return failure('outside-domain', 'El final de la curva debe ser mayor que el inicio.');
  const evaluate = order === 1 ? firstDerivative : secondDerivative;
  const increment = (endUsers - startUsers) / (steps - 1);
  const points: DerivativePoint[] = [];
  for (let index = 0; index < steps; index += 1) {
    const users = index === steps - 1 ? endUsers : startUsers + increment * index;
    const value = evaluate(users, config);
    if (!value.ok) return value;
    points.push({ users, value: value.value });
  }
  return success(points);
}
