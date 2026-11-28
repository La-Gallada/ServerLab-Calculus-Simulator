import { mathModelConfig } from '../../config/model';
import { tangentWindow } from '../../features/derivatives/derivativeWindow';
import {
  derivativeCurve,
  firstDerivative,
  responseCurve,
  responseTime,
  secondDerivative,
  success,
  tangentCurve,
  tangentLine,
  verticalAsymptote,
  type ResponsePoint,
} from '../../math';
import { equals, formatValue } from '../format';
import type { ParameterSpec } from '../types';
import {
  capacity,
  continuousDomain,
  lastUser,
  linearAxis,
  logAxis,
  niceCeiling,
  numberValue,
  responseFormula,
  userVariables,
  usersAxis,
  usersAxisLabel,
  usersParameter,
  xy,
  type FigureDefinition,
} from './shared';

export const tangentFigure: FigureDefinition = {
  id: 'derivatives-tangent',
  category: 'derivatives',
  name: 'Función original y recta tangente',
  description:
    'Tiempo de respuesta y su recta tangente en el punto seleccionado, cuya pendiente es la primera derivada.',
  variables: [
    ...userVariables,
    { symbol: 'y(n)', meaning: 'recta tangente', unit: 'ms' },
    { symbol: 'R′(n)', meaning: 'pendiente de la tangente', unit: 'ms/usuario' },
  ],
  formulas: () => [responseFormula(), 'y(n) = R(a) + R′(a)(n − a)'],
  parameters: [usersParameter('Punto de tangencia (n)')],
  build(values) {
    const users = numberValue(values, 'users');
    const { curveStart, curveEnd, tangentStart, tangentEnd } = tangentWindow(users);
    const curve = responseCurve(curveStart, curveEnd, 120);
    const tangent = tangentCurve(users, tangentStart, tangentEnd, 25);
    const line = tangentLine(users);
    if (!curve.ok) return curve;
    if (!tangent.ok) return tangent;
    if (!line.ok) return line;
    const { responseMs, slopeMsPerUser } = line.value;
    // El punto de tangencia y los enteros de la ventana forman parte de los datos.
    const abscissas = new Set([
      ...curve.value.map((p) => p.users),
      ...tangent.value.map((p) => p.users),
      users,
    ]);
    const data: (ResponsePoint & { tangentMs: number | null })[] = [];
    for (const n of [...abscissas].sort((a, b) => a - b)) {
      const response = responseTime(n);
      if (!response.ok) return response;
      const inTangent = n >= tangentStart && n <= tangentEnd;
      data.push({
        users: n,
        responseMs: response.value,
        tangentMs: inTangent ? line.value.evaluate(n) : null,
      });
    }
    const visible = data.filter((p) => p.users >= curveStart && p.users <= curveEnd);
    const ceiling = niceCeiling(Math.max(...visible.map((p) => p.responseMs)));
    return success({
      title: `Tiempo de respuesta y recta tangente en n = ${users}`,
      notes: [
        `R(${users}) ${equals(responseMs)} ms · pendiente R′(${users}) ${equals(slopeMsPerUser)} ms/usuario`,
        `Recta tangente: y ≈ ${formatValue(responseMs, 3)} + ${formatValue(slopeMsPerUser, 3)}(n − ${users})`,
      ],
      chart: {
        x: linearAxis(usersAxisLabel, [curveStart, curveEnd]),
        y: linearAxis('Tiempo de respuesta (ms)', [0, ceiling]),
        bands: [],
        areas: [],
        lines: [
          {
            role: 'primary',
            points: xy(
              visible,
              (p) => p.users,
              (p) => p.responseMs,
            ),
          },
          {
            role: 'tangent',
            points: xy(
              tangent.value,
              (p) => p.users,
              (p) => p.responseMs,
            ),
          },
        ],
        references: [{ orientation: 'vertical', value: users, role: 'reference' }],
        markers: [{ x: users, y: responseMs, shape: 'ring', role: 'tangent' }],
      },
      legend: [
        { kind: 'line', role: 'primary', label: 'R(n)' },
        { kind: 'line', role: 'tangent', label: 'Recta tangente' },
        { kind: 'marker', role: 'tangent', shape: 'ring', label: 'Punto de tangencia' },
      ],
      table: {
        columns: [
          { label: 'Usuarios (n continuo)', unit: 'usuarios' },
          { label: 'Tiempo de respuesta R(n)', unit: 'ms' },
          { label: 'Recta tangente y(n)', unit: 'ms' },
          { label: 'Punto de tangencia' },
        ],
        rows: data.map((p) => [
          p.users,
          p.responseMs,
          p.tangentMs,
          p.users === users ? 'sí' : 'no',
        ]),
      },
      parameters: [
        { label: 'Punto de tangencia', value: `${users} usuarios` },
        { label: 'Ventana', value: `${curveStart} a ${curveEnd} usuarios` },
      ],
      domain: continuousDomain(),
      scale:
        'Lineal en ambos ejes; conserva la pendiente. La tangente se recorta si sale del área de trazado.',
      summary: `La recta tangente toca R(n) en n = ${users} con pendiente ${formatValue(slopeMsPerUser, 4)} ms/usuario.`,
      fileSlug: `recta-tangente-n${users}`,
    });
  },
};

const scaleParameter: ParameterSpec = {
  key: 'scale',
  label: 'Escala gráfica',
  kind: 'select',
  options: [
    { value: 'log', label: 'Logarítmica' },
    { value: 'linear', label: 'Lineal' },
  ],
  default: 'log',
};

function derivativeDefinition(order: 1 | 2): FigureDefinition {
  const isFirst = order === 1;
  const symbol = isFirst ? 'R′(n)' : 'R″(n)';
  const unit = isFirst
    ? mathModelConfig.units.firstDerivative
    : mathModelConfig.units.secondDerivative;
  const evaluate = isFirst ? firstDerivative : secondDerivative;
  const name = isFirst ? 'Primera derivada' : 'Segunda derivada';
  return {
    id: isFirst ? 'derivatives-first' : 'derivatives-second',
    category: 'derivatives',
    name,
    description: isFirst
      ? 'Tasa instantánea de cambio del tiempo de respuesta respecto a la carga.'
      : 'Variación de la tasa instantánea; su signo positivo indica convexidad.',
    variables: [
      userVariables[0],
      {
        symbol,
        meaning: isFirst ? 'tasa de cambio de R' : 'tasa de cambio de R′',
        unit,
      },
    ],
    formulas: () => {
      const { growthCoefficientMs: k } = mathModelConfig.response;
      return [
        responseFormula(),
        isFirst
          ? `R′(n) = (${k} · ${capacity()})/(${capacity()} − n)² (${unit})`
          : `R″(n) = (2 · ${k} · ${capacity()})/(${capacity()} − n)³ (${unit})`,
      ];
    },
    parameters: [usersParameter('Punto marcado (n)'), scaleParameter],
    build(values) {
      const users = numberValue(values, 'users');
      const logarithmic = values.scale === 'log';
      const curve = derivativeCurve(order, 0, lastUser(), 100);
      const selected = evaluate(users);
      if (!curve.ok) return curve;
      if (!selected.ok) return selected;
      const data = curve.value.map((p) => p.value);
      const label = `${symbol} (${unit})${logarithmic ? ', escala log.' : ''}`;
      return success({
        title: `${name} del tiempo de respuesta, ${symbol}`,
        notes: [
          `${symbol} en n = ${users} ${equals(selected.value)} ${unit}`,
          `${symbol} > 0 en todo el dominio y crece al acercarse a la capacidad`,
        ],
        chart: {
          x: usersAxis(),
          y: logarithmic
            ? logAxis(label, Math.min(...data), Math.max(...data))
            : linearAxis(label, [0, niceCeiling(Math.max(...data))]),
          bands: [],
          areas: [],
          lines: [
            {
              role: 'derivative',
              points: xy(
                curve.value,
                (p) => p.users,
                (p) => p.value,
              ),
            },
          ],
          references: [
            { orientation: 'vertical', value: users, role: 'tangent' },
            {
              orientation: 'vertical',
              value: verticalAsymptote(),
              role: 'capacity',
              label: `C = ${capacity()}`,
            },
          ],
          markers: [{ x: users, y: selected.value, shape: 'ring', role: 'tangent' }],
        },
        legend: [
          { kind: 'line', role: 'derivative', label: symbol },
          { kind: 'marker', role: 'tangent', shape: 'ring', label: 'Punto marcado' },
          { kind: 'line', role: 'capacity', label: 'Capacidad (no evaluada)' },
        ],
        table: {
          columns: [
            { label: 'Usuarios concurrentes', unit: 'usuarios' },
            { label: isFirst ? 'Primera derivada' : 'Segunda derivada', unit },
            { label: 'Punto marcado' },
          ],
          rows: curve.value.map((p) => [p.users, p.value, p.users === users ? 'sí' : 'no']),
        },
        parameters: [
          { label: 'Punto marcado', value: `${users} usuarios` },
          { label: 'Escala', value: logarithmic ? 'logarítmica' : 'lineal' },
        ],
        domain: continuousDomain(),
        scale: logarithmic
          ? 'Eje horizontal lineal y eje vertical logarítmico de base 10.'
          : 'Lineal en ambos ejes.',
        summary: `${symbol} crece de ${formatValue(data[0], 4)} a ${formatValue(data[data.length - 1], 4)} ${unit} entre 0 y ${lastUser()} usuarios.`,
        fileSlug: isFirst ? 'primera-derivada' : 'segunda-derivada',
      });
    },
  };
}

export const firstDerivativeFigure = derivativeDefinition(1);
export const secondDerivativeFigure = derivativeDefinition(2);
