export const axisColor = '#c8d5eb';
export const tickStyle = { fill: '#a7b7cf', fontSize: 12 };
export const gridColor = 'rgba(148,163,184,.18)';
export const tooltipStyle = {
  background: '#162134',
  border: '1px solid #334155',
  borderRadius: 10,
};

/** Redondea el máximo de un eje a 1, 2, 2,5 o 5 veces una potencia de diez. */
export function niceCeiling(value: number): number {
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((factor) => factor * magnitude >= value) ?? 10;
  return step * magnitude;
}
