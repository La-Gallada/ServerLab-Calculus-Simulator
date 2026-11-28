import { mathModelConfig, type MathModelConfig } from '../config/model';
import type { IntegrationAreaPoint, MathResult, TransferPoint } from './types';
import { failure, success, validateResolution, validateTime } from './validation';
export function transferRate(
  seconds: number,
  config: MathModelConfig = mathModelConfig,
): MathResult<number> {
  const valid = validateTime(seconds, config);
  return valid.ok
    ? success(config.transfer.initialRateMbps + config.transfer.rateIncreaseMbpsPerSecond * seconds)
    : valid;
}
export function accumulatedData(
  seconds: number,
  config: MathModelConfig = mathModelConfig,
): MathResult<number> {
  const valid = validateTime(seconds, config);
  return valid.ok
    ? success(
        config.transfer.initialRateMbps * seconds +
          (config.transfer.rateIncreaseMbpsPerSecond * seconds ** 2) / 2,
      )
    : valid;
}
export function transferredData(
  startSeconds: number,
  endSeconds: number,
  config: MathModelConfig = mathModelConfig,
): MathResult<number> {
  const start = validateTime(startSeconds, config);
  const end = validateTime(endSeconds, config);
  if (!start.ok) return start;
  if (!end.ok) return end;
  if (endSeconds < startSeconds)
    return failure(
      'inverted-interval',
      'El límite final no puede ser menor que el límite inicial.',
    );
  const from = accumulatedData(startSeconds, config);
  const to = accumulatedData(endSeconds, config);
  if (!from.ok) return from;
  if (!to.ok) return to;
  return success(to.value - from.value);
}
export function areaCurve(
  startSeconds: number,
  endSeconds: number,
  steps = 61,
  config: MathModelConfig = mathModelConfig,
): MathResult<IntegrationAreaPoint[]> {
  const interval = transferredData(startSeconds, endSeconds, config);
  const resolution = validateResolution(steps);
  const baseline = accumulatedData(startSeconds, config);
  if (!interval.ok) return interval;
  if (!resolution.ok) return resolution;
  if (!baseline.ok) return baseline;
  if (startSeconds === endSeconds) {
    const rate = transferRate(startSeconds, config);
    if (!rate.ok) return rate;
    return success([
      {
        seconds: startSeconds,
        rateMBps: rate.value,
        accumulatedMB: baseline.value,
        baselineMB: baseline.value,
      },
    ]);
  }
  const increment = (endSeconds - startSeconds) / (steps - 1);
  const points: IntegrationAreaPoint[] = [];
  for (let index = 0; index < steps; index += 1) {
    const seconds = index === steps - 1 ? endSeconds : startSeconds + increment * index;
    const rate = transferRate(seconds, config);
    const total = accumulatedData(seconds, config);
    if (!rate.ok) return rate;
    if (!total.ok) return total;
    points.push({
      seconds,
      rateMBps: rate.value,
      accumulatedMB: total.value,
      baselineMB: baseline.value,
    });
  }
  return success(points);
}
export function transferCurve(
  startSeconds: number = 0,
  endSeconds: number = mathModelConfig.transfer.maximumTimeSeconds,
  steps = 61,
  config: MathModelConfig = mathModelConfig,
): MathResult<TransferPoint[]> {
  const area = areaCurve(startSeconds, endSeconds, steps, config);
  return area.ok
    ? success(
        area.value.map((point) => ({
          seconds: point.seconds,
          rateMBps: point.rateMBps,
          accumulatedMB: point.accumulatedMB,
        })),
      )
    : area;
}
