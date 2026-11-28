const digits = 7;

export const formatNumber = (value: number, maximumFractionDigits = digits) =>
  new Intl.NumberFormat('es-CR', { maximumFractionDigits }).format(value);

export const isRounded = (value: number, places = digits) =>
  Math.abs(value - Number(value.toFixed(places))) > 1e-9;

/** Antepone `≈` sólo cuando el número mostrado está redondeado. */
export const approx = (value: number, unit = '') =>
  `${isRounded(value) ? '≈ ' : ''}${formatNumber(value)}${unit ? ` ${unit}` : ''}`;

/** Igual que `approx`, con signo explícito para usar tras una variable. */
export const equation = (value: number, unit = '') =>
  `${isRounded(value) ? '' : '= '}${approx(value, unit)}`;

export const users = (count: number) =>
  `${formatNumber(count, 0)} ${count === 1 ? 'usuario' : 'usuarios'}`;
