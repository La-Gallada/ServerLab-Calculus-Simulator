/** Utilidades de las definiciones: ejes, parámetros y textos. Sin fórmulas del modelo. */
import { mathModelConfig } from '../../config/model';
import { niceCeiling } from '../../features/optimization/chartTheme';
import type { MathResult } from '../../math';
import type {
  ChartAxis,
  ExportFigure,
  FigureCategory,
  FigureContent,
  ParameterSpec,
  ParameterValues,
  Variable,
  XY,
} from '../types';

export interface FigureDefinition {
  /** Identificador técnico estable; no es el número de figura del documento. */
  id: string;
  category: FigureCategory;
  name: string;
  description: string;
  variables: Variable[];
  formulas: () => string[];
  parameters: ParameterSpec[];
  build: (values: ParameterValues) => MathResult<FigureContent>;
}

export type BuiltFigure = MathResult<ExportFigure>;

export { niceCeiling };

export const capacity = () => mathModelConfig.response.referenceCapacityUsers;
export const lastUser = () => capacity() - 1;

export function ticks(low: number, high: number, count = 5): number[] {
  return Array.from({ length: count + 1 }, (_, index) =>
    Number((low + ((high - low) * index) / count).toPrecision(12)),
  );
}

export function linearAxis(
  label: string,
  domain: [number, number],
  tickValues: number[] = ticks(...domain),
): ChartAxis {
  return { label, domain, ticks: tickValues, scale: 'linear' };
}

/** Eje logarítmico entre potencias de diez que contienen los datos positivos. */
export function logAxis(label: string, minimum: number, maximum: number): ChartAxis {
  const low = Math.floor(Math.log10(minimum));
  const high = Math.ceil(Math.log10(maximum));
  return {
    label,
    domain: [10 ** low, 10 ** high],
    ticks: Array.from({ length: high - low + 1 }, (_, index) => Number(`1e${low + index}`)),
    scale: 'log',
  };
}

export const usersAxisLabel = 'Usuarios concurrentes (n)';
export const usersAxis = () => linearAxis(usersAxisLabel, [0, capacity()]);

export const numberValue = (values: ParameterValues, key: string) => Number(values[key]);

export const xy = <T>(items: T[], x: (item: T) => number, y: (item: T) => number): XY[] =>
  items.map((item) => [x(item), y(item)]);

export const userVariables: Variable[] = [
  { symbol: 'n', meaning: 'usuarios concurrentes', unit: 'usuarios' },
  { symbol: 'R(n)', meaning: 'tiempo de respuesta', unit: 'ms' },
];

export const usersParameter = (label = 'Usuarios concurrentes (n)'): ParameterSpec => ({
  key: 'users',
  label,
  kind: 'number',
  integer: true,
  min: 0,
  max: lastUser(),
  unit: 'usuarios',
  default: mathModelConfig.controls.initialConcurrentUsers,
});

export const responseFormula = () => {
  const { baseResponseMs: b, growthCoefficientMs: k } = mathModelConfig.response;
  return `R(n) = ${b} + ${k}n/(${capacity()} − n), con 0 ≤ n < ${capacity()} (ms)`;
};

export const continuousDomain = () =>
  `Extensión continua 0 ≤ n < ${capacity()}; la operación usa enteros de 0 a ${lastUser()}. n = ${capacity()} no se evalúa.`;
