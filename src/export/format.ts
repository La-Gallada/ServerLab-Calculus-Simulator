/** Presentación es-CR para figuras y fichas. Los datos CSV no pasan por aquí. */
export const formatValue = (value: number, maximumFractionDigits = 2) =>
  new Intl.NumberFormat('es-CR', { maximumFractionDigits }).format(value + 0);

export const isRounded = (value: number, places: number) =>
  Math.abs(value - Number(value.toFixed(places))) > 1e-9;

/** `= x` o `≈ x` según si el valor mostrado está redondeado. */
export const equals = (value: number, places = 6) =>
  `${isRounded(value, places) ? '≈' : '='} ${formatValue(value, places)}`;
