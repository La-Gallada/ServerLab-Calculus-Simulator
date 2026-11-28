/** Figuras de Dashboard y Límites. */
import { mathModelConfig } from '../../config/model';
import { responseViews, type ResponseView } from '../../features/dashboard/responseViews';
import { limitDistances, limitWindow, type LimitCase } from '../../features/limits/limitCases';
import {
  optimizeResponseThreshold,
  responseCurve,
  responseTime,
  success,
  verticalAsymptote,
  type ResponsePoint,
} from '../../math';
import { equals, formatValue } from '../format';
import type { DataValue, ParameterSpec } from '../types';
import {
  capacity,
  continuousDomain,
  lastUser,
  linearAxis,
  logAxis,
  niceCeiling,
  numberValue,
  responseFormula,
  ticks,
  userVariables,
  usersAxis,
  usersAxisLabel,
  usersParameter,
  xy,
  type FigureDefinition,
} from './shared';

const responseAxisLabel = 'Tiempo de respuesta (ms)';
const points = (data: ResponsePoint[]) =>
  xy(
    data,
    (p) => p.users,
    (p) => p.responseMs,
  );

export const dashboardResponse: FigureDefinition = {
  id: 'dashboard-response-time',
  category: 'dashboard',
  name: 'Tiempo de respuesta según usuarios concurrentes',
  description:
    'Curva del tiempo de respuesta del modelo con la carga seleccionada, el umbral y el máximo entero que lo cumple.',
  variables: userVariables,
  formulas: () => [responseFormula()],
  parameters: [
    usersParameter('Carga operativa (n)'),
    {
      key: 'threshold',
      label: 'Umbral de respuesta',
      kind: 'select',
      options: mathModelConfig.controls.responseThresholdsMs.map((value) => ({
        value,
        label: `${formatValue(value)} ms`,
      })),
      default: mathModelConfig.controls.initialThresholdMs,
    },
    {
      key: 'view',
      label: 'Escala gráfica',
      kind: 'select',
      options: [
        { value: 'focus', label: 'Carga habitual (0 a 80)' },
        { value: 'full', label: 'Dominio operativo (0 a 99)' },
      ],
      default: 'focus',
    },
  ],
  build(values) {
    const users = numberValue(values, 'users');
    const threshold = numberValue(values, 'threshold');
    const view = values.view as ResponseView;
    const { end, steps } = responseViews[view];
    const curve = responseCurve(0, end, steps);
    const current = responseTime(users);
    const optimization = optimizeResponseThreshold(threshold);
    if (!curve.ok) return curve;
    if (!current.ok) return current;
    if (optimization.kind === 'invalid-threshold') return { ok: false, error: optimization.error };
    const maximum = optimization.kind === 'feasible' ? optimization.maximumIntegerUsers : null;
    const ceiling = niceCeiling(
      Math.max(curve.value[curve.value.length - 1].responseMs, threshold),
    );
    const outside = users > end;
    return success({
      title: 'Tiempo de respuesta del servidor según la cantidad de usuarios concurrentes',
      notes: [
        `Carga n = ${users}: R(${users}) ${equals(current.value, 4)} ms`,
        `Umbral ${formatValue(threshold)} ms: ${maximum === null ? 'sin solución factible' : `máximo entero ${maximum} usuarios`}${outside ? ' · la carga seleccionada queda fuera de la vista' : ''}`,
      ],
      chart: {
        x: usersAxis(),
        y: linearAxis(responseAxisLabel, [0, ceiling]),
        bands: [],
        areas: [],
        lines: [{ role: 'primary', points: points(curve.value) }],
        references: [
          {
            orientation: 'horizontal',
            value: threshold,
            role: 'threshold',
            label: `Umbral ${formatValue(threshold)} ms`,
          },
          ...(maximum === null
            ? []
            : [
                {
                  orientation: 'vertical' as const,
                  value: maximum,
                  role: 'frontier' as const,
                  label: `Máximo ${maximum}`,
                },
              ]),
          {
            orientation: 'vertical',
            value: verticalAsymptote(),
            role: 'capacity',
            label: `C = ${capacity()}`,
          },
        ],
        markers:
          users <= end
            ? [{ x: users, y: current.value, shape: 'diamond', role: 'derivative' }]
            : [],
      },
      legend: [
        { kind: 'line', role: 'primary', label: 'R(n)' },
        { kind: 'line', role: 'threshold', label: 'Umbral' },
        { kind: 'line', role: 'frontier', label: 'Máximo entero' },
        ...(users <= end
          ? [
              {
                kind: 'marker' as const,
                role: 'derivative' as const,
                shape: 'diamond' as const,
                label: 'Carga seleccionada',
              },
            ]
          : []),
        { kind: 'line', role: 'capacity', label: 'Capacidad (no evaluada)' },
      ],
      table: {
        columns: [
          { label: 'Usuarios concurrentes', unit: 'usuarios' },
          { label: 'Tiempo de respuesta', unit: 'ms' },
          { label: 'Umbral', unit: 'ms' },
          { label: 'Cumple el umbral' },
        ],
        rows: curve.value.map((p) => [
          p.users,
          p.responseMs,
          threshold,
          p.responseMs <= threshold ? 'sí' : 'no',
        ]),
      },
      parameters: [
        { label: 'Carga operativa', value: `${users} usuarios` },
        { label: 'Umbral', value: `${formatValue(threshold)} ms` },
        { label: 'Vista', value: `0 a ${end} usuarios` },
      ],
      domain: continuousDomain(),
      scale: `Lineal en ambos ejes; curva muestreada de 0 a ${end} usuarios.`,
      summary: `R(n) crece de ${formatValue(curve.value[0].responseMs)} a ${formatValue(curve.value[curve.value.length - 1].responseMs)} ms entre 0 y ${end} usuarios. Con ${users} usuarios vale ${formatValue(current.value)} ms.`,
      fileSlug: `tiempo-respuesta-n${users}`,
    });
  },
};

const distanceParameter: ParameterSpec = {
  key: 'distance',
  label: 'Distancia de aproximación',
  kind: 'select',
  options: limitDistances.map((value) => ({ value, label: formatValue(value) })),
  default: 0.1,
};

function limitDefinition(caseId: LimitCase): FigureDefinition {
  const isZero = caseId === 'zero';
  return {
    id: isZero ? 'limits-zero-approach' : 'limits-capacity-approach',
    category: 'limits',
    name: isZero
      ? 'Aproximación a cero por la derecha'
      : 'Aproximación a la capacidad por la izquierda',
    description: isZero
      ? 'Comportamiento de R(n) cuando la carga se aproxima a cero con valores positivos.'
      : 'Crecimiento sin cota de R(n) cuando la carga se aproxima a la capacidad con valores menores.',
    variables: userVariables,
    formulas: () => [
      responseFormula(),
      isZero
        ? `lím n→0⁺ R(n) = ${mathModelConfig.response.baseResponseMs} ms`
        : `lím n→${capacity()}⁻ R(n) = +∞ (no es un valor; n = ${capacity()} no pertenece al dominio)`,
    ],
    parameters: [distanceParameter],
    build(values) {
      const distance = numberValue(values, 'distance');
      const { start, end, steps } = limitWindow(caseId);
      const curve = responseCurve(start, end, steps);
      if (!curve.ok) return curve;
      const at = (d: number) => (isZero ? d : capacity() - d);
      const approaches: (ResponsePoint & { distance: number })[] = [];
      for (const d of limitDistances) {
        const response = responseTime(at(d));
        if (!response.ok) return response;
        approaches.push({ distance: d, users: at(d), responseMs: response.value });
      }
      const selected = approaches.find((item) => item.distance === distance) ?? approaches[0];
      const base = mathModelConfig.response.baseResponseMs;
      const all = [...curve.value, ...approaches].sort((a, b) => a.users - b.users);
      const responses = all.map((p) => p.responseMs);
      const low = Math.floor(Math.min(...responses) / 10) * 10 - 10;
      const high = Math.ceil(Math.max(...responses) / 10) * 10 + 10;
      const rows: DataValue[][] = all.map((p) => {
        const approach = approaches.find((item) => item.users === p.users);
        return [
          p.users,
          p.responseMs,
          approach ? 'aproximación' : 'curva',
          approach ? approach.distance : null,
        ];
      });
      const direction = isZero
        ? 'n → 0⁺ (por la derecha)'
        : `n → ${capacity()}⁻ (por la izquierda)`;
      return success({
        title: isZero
          ? 'Límite del tiempo de respuesta cuando la carga se aproxima a cero por la derecha'
          : 'Límite del tiempo de respuesta cuando la carga se aproxima a la capacidad por la izquierda',
        notes: [
          isZero
            ? `${direction}: lím R(n) = ${base} ms`
            : `${direction}: R(n) crece sin cota, lím R(n) = +∞`,
          `Punto seleccionado: n = ${formatValue(selected.users, 4)} (distancia ${formatValue(distance)}), R(n) ${equals(selected.responseMs, 4)} ms`,
        ],
        chart: {
          x: isZero
            ? linearAxis(usersAxisLabel, [0, end], ticks(0, end))
            : linearAxis(usersAxisLabel, [start, capacity()], ticks(start, capacity())),
          y: isZero
            ? linearAxis(responseAxisLabel, [low, high], ticks(low, high, (high - low) / 10))
            : logAxis(`${responseAxisLabel}, escala log.`, responses[0], Math.max(...responses)),
          bands: [],
          areas: [],
          lines: [{ role: 'primary', points: points(all) }],
          references: [
            isZero
              ? {
                  orientation: 'horizontal',
                  value: base,
                  role: 'reference',
                  label: `Límite: ${base} ms`,
                  labelAlign: 'end',
                }
              : {
                  orientation: 'vertical',
                  value: verticalAsymptote(),
                  role: 'capacity',
                  label: `Asíntota n = ${capacity()}`,
                },
            { orientation: 'vertical', value: selected.users, role: 'tangent' },
          ],
          markers: [
            ...approaches
              .filter((item) => item !== selected)
              .map((item) => ({
                x: item.users,
                y: item.responseMs,
                shape: 'dot' as const,
                role: 'primary' as const,
              })),
            { x: selected.users, y: selected.responseMs, shape: 'ring', role: 'tangent' },
          ],
        },
        legend: [
          { kind: 'line', role: 'primary', label: 'R(n)' },
          { kind: 'marker', role: 'primary', shape: 'dot', label: 'Puntos de aproximación' },
          { kind: 'marker', role: 'tangent', shape: 'ring', label: 'Punto seleccionado' },
          isZero
            ? { kind: 'line', role: 'reference', label: 'Valor del límite' }
            : { kind: 'line', role: 'capacity', label: 'Asíntota vertical (sin evaluar)' },
        ],
        table: {
          columns: [
            { label: 'Usuarios (n continuo)', unit: 'usuarios' },
            { label: 'Tiempo de respuesta', unit: 'ms' },
            { label: 'Tipo de punto' },
            { label: 'Distancia al punto límite', unit: 'usuarios' },
          ],
          rows,
        },
        parameters: [
          { label: 'Caso de límite', value: direction },
          { label: 'Distancia seleccionada', value: formatValue(distance) },
        ],
        domain: continuousDomain(),
        scale: isZero
          ? 'Lineal en ambos ejes; el eje vertical no comienza en cero.'
          : 'Eje horizontal lineal y eje vertical logarítmico de base 10.',
        summary: isZero
          ? `Al acercarse n a cero por la derecha, R(n) se aproxima a ${base} ms.`
          : `Entre n = ${formatValue(start)} y n = ${formatValue(end)}, R(n) pasa de ${formatValue(responses[0])} a ${formatValue(Math.max(...responses))} ms y crece sin cota. El usuario ${lastUser() + 1} no se evalúa.`,
        fileSlug: isZero ? 'limite-carga-inicial' : 'limite-capacidad',
      });
    },
  };
}

export const limitZero = limitDefinition('zero');
export const limitCapacity = limitDefinition('capacity');
