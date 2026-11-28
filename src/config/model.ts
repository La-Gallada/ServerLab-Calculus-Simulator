export const mathModelConfig = Object.freeze({
  id: 'serverlab-response-transfer-v1',
  version: 'provisional-2026-11',
  status: 'provisional' as const,
  assumptions:
    'Modelo hipotético educativo; no representa mediciones de un servidor real ni una capacidad operativa garantizada.',
  response: Object.freeze({
    referenceCapacityUsers: 100,
    baseResponseMs: 100,
    growthCoefficientMs: 200,
  }),
  transfer: Object.freeze({
    initialRateMbps: 5,
    rateIncreaseMbpsPerSecond: 0.2,
    maximumTimeSeconds: 30,
  }),
  controls: Object.freeze({
    responseThresholdsMs: Object.freeze([300, 500, 1000] as const),
    initialConcurrentUsers: 65,
    initialThresholdMs: 500,
    initialTransferTimeSeconds: 30,
    initialIntegrationStartSeconds: 0,
    initialIntegrationEndSeconds: 30,
  }),
  units: Object.freeze({
    responseTime: 'ms',
    concurrentUsers: 'usuarios',
    transferRate: 'MB/s',
    transferredData: 'MB',
    time: 's',
    firstDerivative: 'ms/usuario',
    secondDerivative: 'ms/usuario²',
  }),
});

export type MathModelConfig = typeof mathModelConfig;

/** Backward-compatible metadata for the M01 application shell. */
export const modelMetadata = Object.freeze({
  version: mathModelConfig.version,
  status: 'hipotético' as const,
  source: 'docs/MATHEMATICAL-MODEL.md',
});
