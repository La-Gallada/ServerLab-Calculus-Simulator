export type ResponseView = 'focus' | 'full';

/** Muestreo de la curva principal del Dashboard; ambos permanecen bajo la capacidad. */
export const responseViews: Record<ResponseView, { end: number; steps: number }> = {
  focus: { end: 80, steps: 81 },
  full: { end: 99, steps: 100 },
};
