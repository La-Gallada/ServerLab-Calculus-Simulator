import { mathModelConfig } from '../../config/model';

export type LimitCase = 'zero' | 'capacity';

export const limitDistances = [10, 5, 1, 0.5, 0.1, 0.01] as const;

/** Ventana y resolución de la curva continua de cada caso; nunca alcanza n = C. */
export function limitWindow(caseId: LimitCase) {
  const capacity = mathModelConfig.response.referenceCapacityUsers;
  return caseId === 'zero'
    ? { start: 0, end: 15, steps: 100 }
    : { start: capacity - 20, end: capacity - 0.01, steps: 160 };
}
