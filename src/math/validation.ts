import { mathModelConfig, type MathModelConfig } from '../config/model';
import type { MathResult, ValidationCode } from './types';
export const success = <T>(value: T): MathResult<T> => ({ ok: true, value });
export const failure = <T>(code: ValidationCode, message: string): MathResult<T> => ({
  ok: false,
  error: { code, message },
});
export function validateFinite(value: number, label: string): MathResult<number> {
  return Number.isFinite(value)
    ? success(value)
    : failure('non-finite', `${label} debe ser un número finito.`);
}
export function validateContinuousUsers(
  users: number,
  config: MathModelConfig = mathModelConfig,
): MathResult<number> {
  const finite = validateFinite(users, 'La cantidad de usuarios');
  if (!finite.ok) return finite;
  if (users < 0) return failure('negative-value', 'La cantidad de usuarios no puede ser negativa.');
  if (users === config.response.referenceCapacityUsers)
    return failure('singularity', 'La capacidad de referencia es una singularidad matemática.');
  if (users > config.response.referenceCapacityUsers)
    return failure(
      'outside-domain',
      'La cantidad de usuarios debe ser menor que la capacidad de referencia.',
    );
  return success(users);
}
export function validateOperationalUsers(
  users: number,
  config: MathModelConfig = mathModelConfig,
): MathResult<number> {
  const valid = validateContinuousUsers(users, config);
  if (!valid.ok) return valid;
  return Number.isInteger(users)
    ? valid
    : failure('non-integer-user-count', 'Los usuarios operativos deben ser una cantidad entera.');
}
export function validateTime(
  seconds: number,
  config: MathModelConfig = mathModelConfig,
): MathResult<number> {
  const finite = validateFinite(seconds, 'El tiempo');
  if (!finite.ok) return finite;
  if (seconds < 0) return failure('negative-value', 'El tiempo no puede ser negativo.');
  if (seconds > config.transfer.maximumTimeSeconds)
    return failure('outside-domain', 'El tiempo excede el intervalo provisional permitido.');
  return success(seconds);
}
export function validateResolution(steps: number): MathResult<number> {
  const finite = validateFinite(steps, 'La resolución');
  if (!finite.ok) return finite;
  return Number.isInteger(steps) && steps >= 2 && steps <= 10_000
    ? success(steps)
    : failure('invalid-resolution', 'La resolución debe ser un entero entre 2 y 10000.');
}

export function validateModelConfig(config: MathModelConfig): MathResult<MathModelConfig> {
  const { response, transfer } = config;
  const values = [
    response.referenceCapacityUsers,
    response.baseResponseMs,
    response.growthCoefficientMs,
    transfer.initialRateMbps,
    transfer.rateIncreaseMbpsPerSecond,
    transfer.maximumTimeSeconds,
  ];
  return values.every(Number.isFinite) &&
    response.referenceCapacityUsers > 0 &&
    response.growthCoefficientMs > 0 &&
    transfer.maximumTimeSeconds > 0
    ? success(config)
    : failure(
        'invalid-configuration',
        'La configuración matemática no cumple los parámetros requeridos.',
      );
}
