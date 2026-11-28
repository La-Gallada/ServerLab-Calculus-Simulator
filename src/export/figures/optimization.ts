import { mathModelConfig } from '../../config/model';
import {
  buildCapacityFigure,
  buildResponseFigure,
  buildVerificationFigure,
  optimizationFigureIds,
  optimizationScenarios,
  responseCeiling,
  solveThreshold,
  verificationTicks,
  type MarkedPoint,
  type ResponseScale,
} from '../../features/optimization/optimizationFigures';
import { thresholdRange } from '../../features/optimization/optimizationInput';
import { responseCurve, responseTime, success, type MathResult } from '../../math';
import { equals, formatValue } from '../format';
import type { ChartMarker, DataValue, FigureContent, LegendItem, ParameterSpec } from '../types';
import {
  capacity,
  continuousDomain,
  lastUser,
  linearAxis,
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

const thresholdParameter: ParameterSpec = {
  key: 'threshold',
  label: 'Umbral de respuesta L',
  kind: 'number',
  min: thresholdRange.fieldMinMs,
  max: thresholdRange.fieldMaxMs,
  unit: 'ms',
  default: mathModelConfig.controls.initialThresholdMs,
};

const viewParameter: ParameterSpec = {
  key: 'view',
  label: 'Escala gráfica',
  kind: 'select',
  options: [
    { value: 'focus', label: 'Vista enfocada' },
    { value: 'full', label: 'Dominio completo' },
  ],
  default: 'focus',
};

const variables = [
  ...userVariables,
  { symbol: 'L', meaning: 'tiempo máximo permitido', unit: 'ms' },
  { symbol: 'm', meaning: 'máximo entero factible', unit: 'usuarios' },
];

const formulas = () => [
  responseFormula(),
  'Maximizar n sujeto a R(n) ≤ L, con n entero',
  'Frontera continua (si L ≥ B): n* = C(L − B)/(L − B + k)',
  'Máximo entero: m = mín(⌊n*⌋, C − 1)',
];

const roleStyle: Record<MarkedPoint['role'], Pick<ChartMarker, 'shape' | 'role'>> = {
  intersection: { shape: 'ring', role: 'threshold' },
  maximum: { shape: 'circle', role: 'integral' },
  next: { shape: 'square', role: 'capacity' },
  current: { shape: 'diamond', role: 'derivative' },
};

const roleName: Record<MarkedPoint['role'], string> = {
  intersection: 'intersección continua',
  maximum: 'máximo entero',
  next: 'siguiente usuario',
  current: 'carga de análisis',
};

const roleLegend = (role: MarkedPoint['role'], label: string): LegendItem => ({
  kind: 'marker',
  label,
  ...roleStyle[role],
});

const marker = (point: MarkedPoint): ChartMarker => ({
  x: point.users,
  y: point.responseMs,
  ...roleStyle[point.role],
});

const ms = (value: number) => `${formatValue(value)} ms`;

function regionContent(
  threshold: number,
  load: number,
  view: ResponseScale,
  id: string,
  slug: string,
): MathResult<FigureContent> {
  const built = buildResponseFigure(threshold, load, id);
  if (!built.ok) return built;
  const highest = responseTime(lastUser());
  if (!highest.ok) return highest;
  const figure = built.value;
  const { solution, regions } = figure;
  const ceiling = responseCeiling(figure, view, highest.value);
  const feasible = solution.kind === 'feasible' ? solution : null;
  const frontier = regions.feasible?.[1] ?? null;
  const outside = figure.currentResponseMs > ceiling;
  const base = mathModelConfig.response.baseResponseMs;
  const solutionNote = feasible
    ? `n* ${equals(feasible.continuousIntersectionUsers, 7)} · máximo entero m = ${feasible.maximumIntegerUsers} · R(m) ${equals(feasible.responseAtMaximumMs, 7)} ms${feasible.responseAtNextUserMs === undefined ? ` · el usuario ${capacity()} está fuera del dominio` : ` · R(m+1) ${equals(feasible.responseAtNextUserMs, 7)} ms`}`
    : `Sin solución factible: L es menor que el tiempo base de ${ms(base)}; no equivale a cero usuarios`;

  return success({
    title: `Tiempo de respuesta y región factible para un máximo de ${ms(threshold)}`,
    notes: [
      solutionNote,
      `Carga de análisis n = ${load}: R(n) ${equals(figure.currentResponseMs, 4)} ms${outside ? ' (fuera de la vista)' : ''}`,
    ],
    chart: {
      x: usersAxis(),
      y: linearAxis('Tiempo de respuesta (ms)', [0, ceiling]),
      bands: [
        ...(regions.feasible
          ? [
              {
                from: regions.feasible[0],
                to: regions.feasible[1],
                role: 'feasible' as const,
                label: 'Factible',
              },
            ]
          : []),
        {
          from: regions.infeasible[0],
          to: regions.infeasible[1],
          role: 'infeasible',
          label: 'No factible',
        },
      ],
      areas: [],
      lines: [
        {
          role: 'primary',
          points: xy(
            figure.data,
            (p) => p.users,
            (p) => p.responseMs,
          ),
        },
      ],
      references: [
        {
          orientation: 'horizontal',
          value: threshold,
          role: 'threshold',
          label: `L = ${ms(threshold)}`,
        },
        ...(frontier === null
          ? []
          : [
              {
                orientation: 'vertical' as const,
                value: frontier,
                role: 'frontier' as const,
                label: `n* = ${formatValue(frontier)}`,
              },
            ]),
        {
          orientation: 'vertical',
          value: capacity(),
          role: 'capacity',
          label: `C = ${capacity()}`,
        },
      ],
      // El máximo entero se dibuja al final para que ningún otro punto lo oculte.
      markers: [...figure.points]
        .sort((a, b) => Number(a.role === 'maximum') - Number(b.role === 'maximum'))
        .map(marker),
    },
    legend: [
      { kind: 'line', role: 'primary', label: 'R(n)' },
      { kind: 'line', role: 'threshold', label: 'Umbral L' },
      ...(frontier !== null && frontier > 0
        ? [{ kind: 'fill' as const, role: 'feasible' as const, label: 'Región factible' }]
        : []),
      { kind: 'fill', role: 'infeasible', label: 'Región no factible' },
      ...(feasible
        ? [
            { kind: 'line' as const, role: 'frontier' as const, label: 'Frontera continua' },
            roleLegend('intersection', 'Intersección'),
            roleLegend('maximum', 'Máximo entero m'),
          ]
        : []),
      ...(figure.points.some((p) => p.role === 'next')
        ? [roleLegend('next', 'Usuario m + 1')]
        : []),
      ...(outside ? [] : [roleLegend('current', 'Carga de análisis')]),
      { kind: 'line', role: 'capacity', label: 'Capacidad (no evaluada)' },
    ],
    table: {
      columns: [
        { label: 'Usuarios (n continuo)', unit: 'usuarios' },
        { label: 'Tiempo de respuesta', unit: 'ms' },
        { label: 'Umbral', unit: 'ms' },
        { label: 'Factible' },
        { label: 'Punto destacado' },
      ],
      rows: figure.data.map((p) => [
        p.users,
        p.responseMs,
        threshold,
        frontier !== null && p.users <= frontier ? 'sí' : 'no',
        figure.points
          .filter((point) => point.users === p.users)
          .map((point) => roleName[point.role])
          .join(' + ') || null,
      ]),
    },
    parameters: [
      { label: 'Umbral L', value: ms(threshold) },
      { label: 'Carga de análisis', value: `${load} usuarios` },
      { label: 'Vista', value: view === 'focus' ? 'enfocada' : 'dominio completo' },
      {
        label: 'Máximo entero',
        value: feasible ? `${feasible.maximumIntegerUsers} usuarios` : 'sin solución factible',
      },
    ],
    domain: continuousDomain(),
    scale: `Lineal en ambos ejes; eje vertical de 0 a ${ms(ceiling)}${ceiling < highest.value ? ', la curva continúa fuera de la vista' : ''}.`,
    summary: feasible
      ? `Con un máximo de ${ms(threshold)}, la región factible llega hasta n* = ${formatValue(feasible.continuousIntersectionUsers, 4)} y el máximo entero es ${feasible.maximumIntegerUsers} usuarios.`
      : `Con un máximo de ${ms(threshold)} ninguna carga es factible.`,
    fileSlug: slug,
  });
}

function verificationContent(threshold: number): MathResult<FigureContent> {
  const built = buildVerificationFigure(threshold);
  if (!built.ok) return built;
  const solved = solveThreshold(threshold);
  if (!solved.ok) return solved;
  const base = mathModelConfig.response.baseResponseMs;
  const title = `Verificación del máximo entero para un máximo de ${ms(threshold)}`;
  const columns = [
    { label: 'Usuarios (n)', unit: 'usuarios' },
    { label: 'Tiempo de respuesta', unit: 'ms' },
    { label: 'Umbral', unit: 'ms' },
    { label: 'Estado' },
  ];
  const parameters = [{ label: 'Umbral L', value: ms(threshold) }];
  const figure = built.value;

  if (!figure) {
    // Sin solución: se muestra por qué ni siquiera n = 0 cumple la restricción.
    const curve = responseCurve(0, 4, 33);
    if (!curve.ok) return curve;
    const integers = curve.value.filter((p) => Number.isInteger(p.users));
    const high = Math.ceil(curve.value[curve.value.length - 1].responseMs / 10) * 10 + 10;
    return success({
      title,
      notes: [`Sin solución factible: R(0) = ${ms(base)} ya supera L = ${ms(threshold)}`],
      chart: {
        x: linearAxis(usersAxisLabel, [0, 4], ticks(0, 4, 4)),
        y: linearAxis('Tiempo de respuesta (ms)', [0, high]),
        bands: [],
        areas: [],
        lines: [
          {
            role: 'primary',
            points: xy(
              curve.value,
              (p) => p.users,
              (p) => p.responseMs,
            ),
          },
        ],
        references: [
          {
            orientation: 'horizontal',
            value: threshold,
            role: 'threshold',
            label: `L = ${ms(threshold)}`,
          },
        ],
        markers: integers.map((p) => ({
          x: p.users,
          y: p.responseMs,
          shape: 'square',
          role: 'capacity',
        })),
      },
      legend: [
        { kind: 'line', role: 'primary', label: 'R(n)' },
        { kind: 'line', role: 'threshold', label: 'Umbral L' },
        { kind: 'marker', role: 'capacity', shape: 'square', label: 'Cargas que incumplen' },
      ],
      table: {
        columns,
        rows: integers.map((p) => [p.users, p.responseMs, threshold, 'no factible']),
      },
      parameters,
      domain: continuousDomain(),
      scale: 'Lineal en ambos ejes.',
      summary: `No existe solución: todas las cargas superan ${ms(threshold)}.`,
      fileSlug: `verificacion-entera-${threshold}ms`,
    });
  }

  const { solution } = figure;
  const maximum = solution.maximumIntegerUsers;
  const next = solution.responseAtNextUserMs;
  const yTicks = verificationTicks(figure);
  const first = figure.data[0].users;
  const last = figure.data[figure.data.length - 1].users;
  const rows: DataValue[][] = figure.integers.map((p) => [
    p.users,
    p.responseMs,
    threshold,
    p.users === maximum
      ? 'máximo entero factible'
      : p.responseMs <= threshold
        ? 'factible'
        : 'no factible',
  ]);
  return success({
    title,
    notes: [
      `n* ${equals(solution.continuousIntersectionUsers, 7)} (frontera continua) · m = ${maximum} (máximo entero)`,
      `R(${maximum}) ${equals(solution.responseAtMaximumMs, 7)} ms ≤ L · ${next === undefined ? `el usuario ${maximum + 1} está fuera del dominio` : `R(${maximum + 1}) ${equals(next, 7)} ms > L`}`,
    ],
    chart: {
      x: linearAxis(
        usersAxisLabel,
        [first, last],
        figure.integers.map((p) => p.users),
      ),
      y: linearAxis('Tiempo de respuesta (ms)', [yTicks[0], yTicks[yTicks.length - 1]], yTicks),
      bands: [],
      areas: [],
      lines: [
        {
          role: 'primary',
          points: xy(
            figure.data,
            (p) => p.users,
            (p) => p.responseMs,
          ),
        },
      ],
      references: [
        {
          orientation: 'horizontal',
          value: threshold,
          role: 'threshold',
          label: `L = ${ms(threshold)}`,
        },
      ],
      markers: [
        ...figure.integers.map((p): ChartMarker => ({
          x: p.users,
          y: p.responseMs,
          shape: 'dot',
          role: 'primary',
        })),
        ...figure.points.map(marker),
      ],
    },
    legend: [
      { kind: 'line', role: 'primary', label: 'R(n)' },
      { kind: 'line', role: 'threshold', label: 'Umbral L' },
      roleLegend('intersection', 'Intersección continua'),
      roleLegend('maximum', 'Máximo entero m'),
      ...(next === undefined ? [] : [roleLegend('next', 'Usuario m + 1')]),
    ],
    table: { columns, rows },
    parameters,
    domain: continuousDomain(),
    scale: 'Lineal; ampliación local, el eje vertical puede no comenzar en cero.',
    summary: `El máximo entero es ${maximum}; ${next === undefined ? 'no hay siguiente usuario en el dominio' : `el usuario ${maximum + 1} supera el umbral`}.`,
    fileSlug: `verificacion-entera-${threshold}ms`,
  });
}

function capacityContent(threshold: number): MathResult<FigureContent> {
  const built = buildCapacityFigure(threshold);
  if (!built.ok) return built;
  const figure = built.value;
  const [start, end] = figure.domainMs;
  const base = mathModelConfig.response.baseResponseMs;
  const { solution } = figure;
  const maximum = solution.kind === 'feasible' ? solution.maximumIntegerUsers : null;
  const visible = threshold >= start && threshold <= end;
  const rows: DataValue[][] = [
    [start, null, null, 'sin solución factible'],
    ...figure.steps.map((p): DataValue[] => [
      p.thresholdMs,
      p.maximumUsers,
      null,
      'escalón entero',
    ]),
    ...figure.continuous.map((p): DataValue[] => [
      p.thresholdMs,
      null,
      p.continuousUsers,
      'frontera continua',
    ]),
  ];
  return success({
    title: 'Relación entre el umbral de respuesta y la capacidad operativa máxima',
    notes: [
      `Umbral seleccionado ${ms(threshold)}: ${maximum === null ? 'sin solución factible' : `máximo entero ${maximum} usuarios`}${visible ? '' : ' (fuera de la vista)'}`,
      `La solución entera sube un usuario cuando L alcanza R(m); por debajo de ${ms(base)} no hay valor`,
    ],
    chart: {
      x: linearAxis(
        'Umbral de respuesta L (ms)',
        [start, end],
        [start, ...[0.25, 0.5, 0.75, 1].map((f) => f * end)],
      ),
      y: linearAxis('Máximo de usuarios permitido', [0, capacity()]),
      bands: [{ from: start, to: base, role: 'infeasible', label: 'Sin solución' }],
      areas: [],
      lines: [
        {
          role: 'steps',
          interpolation: 'step',
          points: figure.steps.map((p) => [p.thresholdMs, p.maximumUsers!]),
        },
        {
          role: 'continuous',
          points: figure.continuous.map((p) => [p.thresholdMs, p.continuousUsers!]),
        },
      ],
      references: visible
        ? [
            {
              orientation: 'vertical',
              value: threshold,
              role: 'reference',
              label: `L = ${ms(threshold)}`,
            },
          ]
        : [],
      markers:
        visible && maximum !== null
          ? [{ x: threshold, y: maximum, shape: 'circle', role: 'integral' }]
          : [],
    },
    legend: [
      { kind: 'line', role: 'steps', label: 'Máximo entero (escalonado)' },
      { kind: 'line', role: 'continuous', label: 'Frontera continua' },
      { kind: 'fill', role: 'infeasible', label: 'Sin solución factible' },
      { kind: 'line', role: 'reference', label: 'Umbral seleccionado' },
      { kind: 'marker', role: 'integral', shape: 'circle', label: 'Solución seleccionada' },
    ],
    table: {
      columns: [
        { label: 'Umbral', unit: 'ms' },
        { label: 'Máximo entero desde este umbral', unit: 'usuarios' },
        { label: 'Frontera continua', unit: 'usuarios' },
        { label: 'Estado' },
      ],
      rows,
    },
    parameters: [{ label: 'Umbral seleccionado', value: ms(threshold) }],
    domain: `Umbrales de ${ms(start)} a ${ms(end)}; solución factible sólo con L ≥ ${ms(base)}.`,
    scale: 'Lineal en ambos ejes; escalones en los saltos exactos L = R(m).',
    summary: `La capacidad entera crece de forma escalonada con el umbral; con ${ms(threshold)} ${maximum === null ? 'no hay solución' : `permite ${maximum} usuarios`}.`,
    fileSlug: 'capacidad-segun-umbral',
  });
}

export const regionFigure: FigureDefinition = {
  id: optimizationFigureIds.response,
  category: 'optimization',
  name: 'Función y región factible',
  description: 'Región de cargas que cumplen el tiempo máximo y solución entera.',
  variables,
  formulas,
  parameters: [thresholdParameter, usersParameter('Carga de análisis (n)'), viewParameter],
  build: (values) =>
    regionContent(
      numberValue(values, 'threshold'),
      numberValue(values, 'users'),
      values.view as ResponseScale,
      optimizationFigureIds.response,
      `optimizacion-${numberValue(values, 'threshold')}ms`,
    ),
};

export const verificationFigure: FigureDefinition = {
  id: optimizationFigureIds.verification,
  category: 'optimization',
  name: 'Verificación de la solución entera máxima',
  description: 'Ampliación en torno al máximo entero y al siguiente usuario.',
  variables,
  formulas,
  parameters: [thresholdParameter],
  build: (values) => verificationContent(numberValue(values, 'threshold')),
};

export const capacityFigure: FigureDefinition = {
  id: optimizationFigureIds.capacity,
  category: 'optimization',
  name: 'Relación entre umbral y capacidad operativa',
  description: 'Máximo entero de usuarios en función del tiempo de respuesta permitido.',
  variables,
  formulas,
  parameters: [thresholdParameter],
  build: (values) => capacityContent(numberValue(values, 'threshold')),
};

export const scenarioFigures: FigureDefinition[] = [...optimizationScenarios]
  .sort((a, b) => a.thresholdMs - b.thresholdMs)
  .map(({ id, thresholdMs }) => ({
    id,
    category: 'optimization',
    name: `Escenario de optimización de ${thresholdMs} ms`,
    description: `Aplicación académica con un tiempo máximo de ${thresholdMs} ms.`,
    variables,
    formulas,
    parameters: [usersParameter('Carga de análisis (n)'), viewParameter],
    build: (values) =>
      regionContent(
        thresholdMs,
        numberValue(values, 'users'),
        values.view as ResponseScale,
        id,
        `optimizacion-escenario-${thresholdMs}ms`,
      ),
  }));
