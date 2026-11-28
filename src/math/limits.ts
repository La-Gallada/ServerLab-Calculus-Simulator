import { mathModelConfig, type MathModelConfig } from '../config/model';
import type { LimitResult, MathResult, ResponsePoint } from './types';
import { responseTime } from './response';
import { success } from './validation';
export function limitAtZeroFromRight(config: MathModelConfig = mathModelConfig): LimitResult {
  return { kind: 'finite', value: config.response.baseResponseMs, unit: 'ms' };
}
export function limitAtCapacityFromLeft(): LimitResult {
  return { kind: 'positive-infinity', unit: 'ms' };
}
export function verticalAsymptote(config: MathModelConfig = mathModelConfig): number {
  return config.response.referenceCapacityUsers;
}
export function capacityApproximations(
  users: readonly number[] = [90, 95, 99, 99.5, 99.9, 99.99],
  config: MathModelConfig = mathModelConfig,
): MathResult<ResponsePoint[]> {
  const points: ResponsePoint[] = [];
  for (const value of users) {
    const result = responseTime(value, config);
    if (!result.ok) return result;
    points.push({ users: value, responseMs: result.value });
  }
  return success(points);
}
