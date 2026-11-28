import { mathModelConfig, type MathModelConfig } from '../config/model';
import type { MathResult, SimulationInput, SimulationSnapshot } from './types';
import { firstDerivative } from './derivatives';
import { optimizeResponseThreshold } from './optimization';
import { operationalResponseTime } from './response';
import { accumulatedData, transferRate, transferredData } from './transfer';
import { success, validateFinite } from './validation';
export const initialSimulationInput: Readonly<SimulationInput> = Object.freeze({
  concurrentUsers: mathModelConfig.controls.initialConcurrentUsers,
  thresholdMs: mathModelConfig.controls.initialThresholdMs,
  transferTimeSeconds: mathModelConfig.controls.initialTransferTimeSeconds,
  integrationStartSeconds: mathModelConfig.controls.initialIntegrationStartSeconds,
  integrationEndSeconds: mathModelConfig.controls.initialIntegrationEndSeconds,
});
export function simulationSnapshot(
  input: SimulationInput,
  config: MathModelConfig = mathModelConfig,
): MathResult<SimulationSnapshot> {
  const response = operationalResponseTime(input.concurrentUsers, config);
  const derivative = firstDerivative(input.concurrentUsers, config);
  const rate = transferRate(input.transferTimeSeconds, config);
  const data = accumulatedData(input.transferTimeSeconds, config);
  const interval = transferredData(
    input.integrationStartSeconds,
    input.integrationEndSeconds,
    config,
  );
  const threshold = validateFinite(input.thresholdMs, 'El umbral');
  if (!response.ok) return response;
  if (!derivative.ok) return derivative;
  if (!rate.ok) return rate;
  if (!data.ok) return data;
  if (!interval.ok) return interval;
  if (!threshold.ok) return threshold;
  const optimization = optimizeResponseThreshold(input.thresholdMs, config);
  return success({
    input: Object.freeze({ ...input }),
    responseMs: response.value,
    firstDerivativeMsPerUser: derivative.value,
    transferRateMBps: rate.value,
    transferredDataMB: data.value,
    optimization,
    meetsResponseObjective: response.value <= input.thresholdMs,
  });
}
