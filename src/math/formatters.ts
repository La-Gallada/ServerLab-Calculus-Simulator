const format = (value: number, unit: string, digits = 2) =>
  `${new Intl.NumberFormat('es-CR', { maximumFractionDigits: digits }).format(value)} ${unit}`;
export const formatters = Object.freeze({
  milliseconds: (value: number) => format(value, 'ms'),
  users: (value: number) => format(value, Math.round(value) === 1 ? 'usuario' : 'usuarios', 0),
  megabytes: (value: number) => format(value, 'MB'),
  megabytesPerSecond: (value: number) => format(value, 'MB/s'),
  millisecondsPerUser: (value: number) => format(value, 'ms/usuario'),
  millisecondsPerUserSquared: (value: number) => format(value, 'ms/usuario²'),
  seconds: (value: number) => format(value, 's'),
});
