import { mathModelConfig } from '../../config/model';
import {
  buildIntegralFigure,
  exampleApplications,
  figureIds,
  type FigureKind,
} from '../../features/integrals/integralFigures';
import { accumulatedData, success, transferRate } from '../../math';
import { equals, formatValue } from '../format';
import type { ParameterSpec, ParameterValues, Variable, XY } from '../types';
import { linearAxis, niceCeiling, numberValue, ticks, type FigureDefinition } from './shared';

const maximumTime = () => mathModelConfig.transfer.maximumTimeSeconds;

const variables: Variable[] = [
  { symbol: 't', meaning: 'tiempo transcurrido', unit: 's' },
  { symbol: 'T(t)', meaning: 'tasa de transferencia', unit: 'MB/s' },
  { symbol: 'A(t)', meaning: 'datos acumulados desde t = 0', unit: 'MB' },
  { symbol: 'D(a,b)', meaning: 'datos transferidos en [a,b]', unit: 'MB' },
];

const formulas = () => {
  const { initialRateMbps: initial, rateIncreaseMbpsPerSecond: increase } =
    mathModelConfig.transfer;
  return [
    `T(t) = ${formatValue(initial, 6)} + ${formatValue(increase, 6)}t (MB/s), con 0 ≤ t ≤ ${maximumTime()}`,
    `A(t) = ${formatValue(initial, 6)}t + ${formatValue(increase / 2, 6)}t² (MB)`,
    'D(a,b) = ∫ de a a b de T(t) dt = A(b) − A(a) (MB)',
  ];
};

const intervalParameters = (): ParameterSpec[] => [
  {
    key: 'a',
    label: 'Límite inferior a',
    kind: 'number',
    min: 0,
    max: maximumTime(),
    unit: 's',
    default: mathModelConfig.controls.initialIntegrationStartSeconds,
  },
  {
    key: 'b',
    label: 'Límite superior b',
    kind: 'number',
    min: 0,
    max: maximumTime(),
    unit: 's',
    default: mathModelConfig.controls.initialIntegrationEndSeconds,
  },
];

function content(kind: FigureKind, a: number, b: number, id: string, slug: string) {
  const built = buildIntegralFigure(kind, a, b, id);
  if (!built.ok) return built;
  const figure = built.value;
  const startRate = transferRate(a);
  const endRate = transferRate(b);
  const startData = accumulatedData(a);
  const endData = accumulatedData(b);
  const peakRate = transferRate(maximumTime());
  const peakData = accumulatedData(maximumTime());
  if (!startRate.ok) return startRate;
  if (!endRate.ok) return endRate;
  if (!startData.ok) return startData;
  if (!endData.ok) return endData;
  if (!peakRate.ok) return peakRate;
  if (!peakData.ok) return peakData;

  const isRate = kind === 'rate';
  const zero = a === b;
  const total = figure.transferredMB;
  const seconds = (value: number) => `${formatValue(value)} s`;
  const interval = `[${seconds(a)}; ${seconds(b)}]`;
  const rateCeiling = Math.ceil(peakRate.value) + 1;
  const dataCeiling = niceCeiling(peakData.value);
  const curve: XY[] = figure.data.map((p) => [p.seconds, isRate ? p.rateMBps : p.accumulatedMB]);
  const selected = figure.data.filter((p) => !zero && p.seconds >= a && p.seconds <= b);
  const limits = zero
    ? [
        {
          orientation: 'vertical' as const,
          value: a,
          role: 'tangent' as const,
          label: `a = b = ${seconds(a)}`,
        },
      ]
    : [
        {
          orientation: 'vertical' as const,
          value: a,
          role: 'tangent' as const,
          label: `a = ${seconds(a)}`,
        },
        {
          orientation: 'vertical' as const,
          value: b,
          role: 'tangent' as const,
          label: `b = ${seconds(b)}`,
        },
      ];

  return success({
    title: isRate
      ? `Tasa de transferencia y área bajo la curva en ${interval}`
      : `Datos acumulados y diferencia A(b) − A(a) en ${interval}`,
    notes: isRate
      ? [
          zero
            ? `Intervalo de longitud cero: D = 0 MB, sin área`
            : `Área sombreada: D(a,b) = ∫ T(t) dt ${equals(total)} MB`,
          `T(a) ${equals(startRate.value)} MB/s · T(b) ${equals(endRate.value)} MB/s`,
        ]
      : [
          `A(a) ${equals(startData.value)} MB · A(b) ${equals(endData.value)} MB`,
          `Datos transferidos: A(b) − A(a) ${equals(total)} MB (diferencia de alturas, no área bajo A)`,
        ],
    chart: {
      x: linearAxis(
        `${figure.xAxis.label} (${figure.xAxis.unit})`,
        [0, maximumTime()],
        ticks(0, maximumTime(), 6),
      ),
      y: linearAxis(
        `${figure.yAxis.label} (${figure.yAxis.unit})`,
        [0, isRate ? rateCeiling : dataCeiling],
        ticks(0, isRate ? rateCeiling : dataCeiling, isRate ? rateCeiling / 2 : 5),
      ),
      bands: [],
      areas:
        isRate && !zero
          ? [{ role: 'area' as const, points: selected.map((p): XY => [p.seconds, p.rateMBps]) }]
          : [],
      lines: [
        { role: 'integral' as const, points: curve },
        ...(!isRate && !zero
          ? [
              {
                role: 'selected' as const,
                points: selected.map((p): XY => [p.seconds, p.accumulatedMB]),
              },
            ]
          : []),
      ],
      references: [
        ...limits,
        ...(isRate
          ? []
          : [
              {
                orientation: 'horizontal' as const,
                value: startData.value,
                role: 'reference' as const,
              },
              {
                orientation: 'horizontal' as const,
                value: endData.value,
                role: 'reference' as const,
              },
              ...(zero
                ? []
                : [
                    {
                      orientation: 'vertical' as const,
                      value: b,
                      span: [startData.value, endData.value] as [number, number],
                      role: 'difference' as const,
                    },
                  ]),
            ]),
      ],
      markers: isRate
        ? []
        : [
            { x: a, y: startData.value, shape: 'open' as const, role: 'integral' as const },
            { x: b, y: endData.value, shape: 'circle' as const, role: 'integral' as const },
          ],
    },
    legend: isRate
      ? [
          {
            kind: 'line' as const,
            role: 'integral' as const,
            label: 'T(t): tasa de transferencia',
          },
          { kind: 'fill' as const, role: 'area' as const, label: 'Área entre a y b' },
          { kind: 'line' as const, role: 'tangent' as const, label: 'Límites a y b' },
        ]
      : [
          { kind: 'line' as const, role: 'integral' as const, label: 'A(t) desde 0' },
          { kind: 'line' as const, role: 'selected' as const, label: 'Tramo [a,b]' },
          {
            kind: 'marker' as const,
            role: 'integral' as const,
            shape: 'open' as const,
            label: 'A(a)',
          },
          {
            kind: 'marker' as const,
            role: 'integral' as const,
            shape: 'circle' as const,
            label: 'A(b)',
          },
          { kind: 'line' as const, role: 'difference' as const, label: 'A(b) − A(a)' },
          { kind: 'line' as const, role: 'tangent' as const, label: 'Límites a y b' },
        ],
    table: {
      columns: [
        { label: 'Tiempo', unit: 's' },
        { label: 'Tasa de transferencia', unit: 'MB/s' },
        { label: 'Datos acumulados', unit: 'MB' },
        { label: 'Dentro del intervalo' },
      ],
      rows: figure.data.map((p) => [
        p.seconds,
        p.rateMBps,
        p.accumulatedMB,
        p.seconds >= a && p.seconds <= b ? 'sí' : 'no',
      ]),
    },
    parameters: [
      { label: 'Límite inferior a', value: seconds(a) },
      { label: 'Límite superior b', value: seconds(b) },
      { label: 'Datos transferidos D(a,b)', value: `${formatValue(total, 6)} MB` },
    ],
    domain: `0 ≤ t ≤ ${maximumTime()} s, con 0 ≤ a ≤ b.`,
    scale: 'Lineal en ambos ejes, con el eje vertical desde cero.',
    summary: zero
      ? `El intervalo ${interval} tiene longitud cero: no hay área ni datos transferidos.`
      : isRate
        ? `La tasa pasa de ${formatValue(startRate.value)} a ${formatValue(endRate.value)} MB/s; el área bajo T(t) en ${interval} equivale a ${formatValue(total)} MB.`
        : `A(t) pasa de ${formatValue(startData.value)} a ${formatValue(endData.value)} MB; la diferencia, ${formatValue(total)} MB, es lo transferido en ${interval}.`,
    fileSlug: slug,
  });
}

const rangeSlug = (values: ParameterValues) =>
  `${numberValue(values, 'a')}-${numberValue(values, 'b')}s`;

export const transferRateFigure: FigureDefinition = {
  id: figureIds.rate,
  category: 'integrals',
  name: 'Tasa de transferencia',
  description: 'Tasa de transferencia T(t) con el área bajo la curva en el intervalo elegido.',
  variables,
  formulas,
  parameters: intervalParameters(),
  build: (values) =>
    content(
      'rate',
      numberValue(values, 'a'),
      numberValue(values, 'b'),
      figureIds.rate,
      `tasa-transferencia-${rangeSlug(values)}`,
    ),
};

export const accumulatedFigure: FigureDefinition = {
  id: figureIds.accumulated,
  category: 'integrals',
  name: 'Datos acumulados',
  description: 'Datos acumulados A(t) y la diferencia entre los extremos del intervalo.',
  variables,
  formulas,
  parameters: intervalParameters(),
  build: (values) =>
    content(
      'accumulated',
      numberValue(values, 'a'),
      numberValue(values, 'b'),
      figureIds.accumulated,
      `datos-acumulados-${rangeSlug(values)}`,
    ),
};

export const integralExampleFigures: FigureDefinition[] = exampleApplications.map((example) => {
  const { id, startSeconds: a, endSeconds: b } = example;
  return {
    id,
    category: 'integrals',
    name: `Integral definida entre ${a} y ${b} segundos`,
    description: `Aplicación académica: datos transferidos entre t = ${a} s y t = ${b} s.`,
    variables,
    formulas,
    parameters: [],
    build: () => content('rate', a, b, id, `integral-${a}-${b}s`),
  };
});
