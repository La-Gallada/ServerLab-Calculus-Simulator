import { mathModelConfig } from './model';

/*
 * Valores derivados de la configuración del modelo. La interfaz los usa en lugar
 * de repetir la capacidad o la duración máxima.
 */
export const capacityUsers = mathModelConfig.response.referenceCapacityUsers;
/** Último usuario entero del dominio operativo. */
export const lastOperationalUser = Math.ceil(capacityUsers) - 1;
export const maximumTransferSeconds = mathModelConfig.transfer.maximumTimeSeconds;

/** Divide [0, maximum] en partes iguales, con dos decimales como máximo. */
export const evenSteps = (maximum: number, parts: number) =>
  Array.from({ length: parts + 1 }, (_, index) => Number(((maximum * index) / parts).toFixed(2)));

/** Cargas de ejemplo menores que el último usuario, seguidas de éste. */
export const exampleLoads = (candidates: readonly number[]) => [
  ...candidates.filter((users) => users < lastOperationalUser),
  lastOperationalUser,
];
