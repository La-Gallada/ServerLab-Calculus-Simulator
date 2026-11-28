export type ValidationCode =
  | 'non-finite'
  | 'negative-value'
  | 'outside-domain'
  | 'singularity'
  | 'non-integer-user-count'
  | 'inverted-interval'
  | 'invalid-resolution'
  | 'invalid-configuration';
export interface MathError {
  code: ValidationCode;
  message: string;
}
export type MathResult<T> = { ok: true; value: T } | { ok: false; error: MathError };
export type LimitResult =
  { kind: 'finite'; value: number; unit: 'ms' } | { kind: 'positive-infinity'; unit: 'ms' };
export interface ResponsePoint {
  users: number;
  responseMs: number;
}
export interface DerivativePoint {
  users: number;
  value: number;
}
export interface TransferPoint {
  seconds: number;
  rateMBps: number;
  accumulatedMB: number;
}
export interface TangentLine {
  atUsers: number;
  responseMs: number;
  slopeMsPerUser: number;
  evaluate: (users: number) => number;
}
export interface TangentPoint {
  users: number;
  responseMs: number;
}
export interface IntegrationAreaPoint extends TransferPoint {
  baselineMB: number;
}
export type OptimizationResult =
  | { kind: 'invalid-threshold'; error: MathError }
  | { kind: 'no-feasible-load'; thresholdMs: number }
  | {
      kind: 'feasible';
      thresholdMs: number;
      continuousIntersectionUsers: number;
      maximumIntegerUsers: number;
      responseAtMaximumMs: number;
      responseAtNextUserMs?: number;
      marginMs: number;
    };
export interface SimulationInput {
  concurrentUsers: number;
  thresholdMs: number;
  transferTimeSeconds: number;
  integrationStartSeconds: number;
  integrationEndSeconds: number;
}
export interface SimulationSnapshot {
  input: Readonly<SimulationInput>;
  responseMs: number;
  firstDerivativeMsPerUser: number;
  transferRateMBps: number;
  transferredDataMB: number;
  optimization: OptimizationResult;
  meetsResponseObjective: boolean;
}
