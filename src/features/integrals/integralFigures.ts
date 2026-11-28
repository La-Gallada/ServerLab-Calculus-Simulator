import { mathModelConfig } from '../../config/model';
import {
  success,
  transferCurve,
  transferredData,
  type MathResult,
  type TransferPoint,
} from '../../math';

export type FigureKind = 'rate' | 'accumulated';

export interface IntegralSeriesPoint extends TransferPoint {
  /** `null` fuera de [a,b] y en intervalos de longitud cero. */
  selectedRateMBps: number | null;
  selectedAccumulatedMB: number | null;
}

export interface FigureLegendItem {
  label: string;
  marker: 'line' | 'thick-line' | 'area' | 'dashed-line' | 'dot';
}

/** Descripción autosuficiente de una figura; M08 la reutilizará para exportar. */
export interface IntegralFigure {
  id: string;
  kind: FigureKind;
  title: string;
  xAxis: { label: string; unit: string };
  yAxis: { label: string; unit: string };
  legend: FigureLegendItem[];
  model: { id: string; version: string; status: string };
  interval: { startSeconds: number; endSeconds: number };
  transferredMB: number;
  data: IntegralSeriesPoint[];
}

export const figureIds: Record<FigureKind, string> = {
  rate: 'integrals-rate-area',
  accumulated: 'integrals-accumulated-data',
};

export const exampleApplications = [
  { id: 'integrals-example-0-30', startSeconds: 0, endSeconds: 30 },
  { id: 'integrals-example-10-20', startSeconds: 10, endSeconds: 20 },
] as const;

const samplesPerSecond = 2;

/** Muestrea el dominio completo y garantiza que a y b formen parte de los datos. */
export function integralSeries(
  startSeconds: number,
  endSeconds: number,
): MathResult<IntegralSeriesPoint[]> {
  const maximum = mathModelConfig.transfer.maximumTimeSeconds;
  const domain = transferCurve(0, maximum, Math.round(maximum * samplesPerSecond) + 1);
  const limits = transferCurve(startSeconds, endSeconds, 2);
  if (!domain.ok) return domain;
  if (!limits.ok) return limits;
  const bySecond = new Map<number, TransferPoint>();
  for (const point of [...domain.value, ...limits.value]) bySecond.set(point.seconds, point);
  const hasArea = endSeconds > startSeconds;
  return success(
    [...bySecond.values()]
      .sort((first, second) => first.seconds - second.seconds)
      .map((point) => {
        const selected = hasArea && point.seconds >= startSeconds && point.seconds <= endSeconds;
        return {
          ...point,
          selectedRateMBps: selected ? point.rateMBps : null,
          selectedAccumulatedMB: selected ? point.accumulatedMB : null,
        };
      }),
  );
}

export function buildIntegralFigure(
  kind: FigureKind,
  startSeconds: number,
  endSeconds: number,
  id: string = figureIds[kind],
): MathResult<IntegralFigure> {
  const total = transferredData(startSeconds, endSeconds);
  if (!total.ok) return total;
  const series = integralSeries(startSeconds, endSeconds);
  if (!series.ok) return series;
  const { units } = mathModelConfig;
  const isRate = kind === 'rate';
  return success({
    id,
    kind,
    title: isRate ? 'Tasa de transferencia y área bajo la curva' : 'Datos acumulados',
    xAxis: { label: 'Tiempo transcurrido (t)', unit: units.time },
    yAxis: isRate
      ? { label: 'Tasa de transferencia', unit: units.transferRate }
      : { label: 'Datos acumulados', unit: units.transferredData },
    legend: isRate
      ? [
          { label: 'T(t): tasa de transferencia', marker: 'line' },
          { label: 'Área entre a y b: D(a,b)', marker: 'area' },
          { label: 'Límites a y b', marker: 'dashed-line' },
        ]
      : [
          { label: 'A(t): acumulado desde 0', marker: 'line' },
          { label: 'Tramo [a,b]', marker: 'thick-line' },
          { label: 'Puntos A(a) y A(b)', marker: 'dot' },
          { label: 'Diferencia A(b) − A(a)', marker: 'dashed-line' },
        ],
    model: {
      id: mathModelConfig.id,
      version: mathModelConfig.version,
      status: mathModelConfig.status,
    },
    interval: { startSeconds, endSeconds },
    transferredMB: total.value,
    data: series.value,
  });
}
