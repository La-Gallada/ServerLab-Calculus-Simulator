import { capacityUsers, lastOperationalUser } from '../../config/domain';

export type ResponseView = 'focus' | 'full';

/** La vista habitual llega al 80 % de la capacidad. */
const focusEnd = Math.min(Math.round(capacityUsers * 0.8), lastOperationalUser);

/** Muestreo de la curva principal del Dashboard; ambos permanecen bajo la capacidad. */
export const responseViews: Record<ResponseView, { end: number; steps: number }> = {
  focus: { end: focusEnd, steps: focusEnd + 1 },
  full: { end: lastOperationalUser, steps: lastOperationalUser + 1 },
};
