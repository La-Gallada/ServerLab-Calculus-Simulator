import { mathModelConfig } from '../../config/model';
import {
  optimizeResponseThreshold,
  responseCurve,
  responseTime,
  success,
  type MathResult,
  type OptimizationResult,
  type ResponsePoint,
} from '../../math';
import { thresholdRange } from './optimizationInput';

export interface OptimizationLegendItem {
  label: string;
  marker:
    | 'curve'
    | 'threshold'
    | 'frontier'
    | 'capacity'
    | 'feasible'
    | 'infeasible'
    | 'intersection'
    | 'maximum'
    | 'next'
    | 'current'
    | 'steps'
    | 'continuous';
}

interface FigureBase {
  id: string;
  title: string;
  xAxis: { label: string; unit: string };
  yAxis: { label: string; unit: string };
  legend: OptimizationLegendItem[];
  model: { id: string; version: string; status: string };
}

export type FeasibleSolution = Extract<OptimizationResult, { kind: 'feasible' }>;
export type SolvedOptimization = Exclude<OptimizationResult, { kind: 'invalid-threshold' }>;

export interface MarkedPoint extends ResponsePoint {
  role: 'intersection' | 'maximum' | 'next' | 'current';
}

export interface ResponseFigure extends FigureBase {
  parameters: { thresholdMs: number; users: number };
  solution: SolvedOptimization;
  /** Intervalos de n que cumplen y que incumplen R(n) ≤ L en 0 ≤ n < C. */
  regions: { feasible: [number, number] | null; infeasible: [number, number] };
  points: MarkedPoint[];
  currentResponseMs: number;
  data: ResponsePoint[];
}

export interface VerificationFigure extends FigureBase {
  parameters: { thresholdMs: number };
  solution: FeasibleSolution;
  points: MarkedPoint[];
  /** Curva continua local y usuarios enteros de la misma ventana. */
  data: ResponsePoint[];
  integers: ResponsePoint[];
}

export interface CapacityPoint {
  thresholdMs: number;
  maximumUsers: number | null;
  continuousUsers: number | null;
}

export interface CapacityFigure extends FigureBase {
  parameters: { thresholdMs: number };
  solution: SolvedOptimization;
  domainMs: [number, number];
  /** Saltos exactos de la solución entera: desde L = R(m) el máximo es m. */
  steps: CapacityPoint[];
  continuous: CapacityPoint[];
}

export const optimizationFigureIds = {
  response: 'optimization-response-region',
  verification: 'optimization-integer-verification',
  capacity: 'optimization-threshold-capacity',
} as const;

export const optimizationScenarios = [
  { id: 'optimization-scenario-500', thresholdMs: 500 },
  { id: 'optimization-scenario-300', thresholdMs: 300 },
] as const;

const model = () => ({
  id: mathModelConfig.id,
  version: mathModelConfig.version,
  status: mathModelConfig.status,
});

const usersAxis = {
  label: 'Usuarios concurrentes (n)',
  unit: mathModelConfig.units.concurrentUsers,
};
const responseAxis = { label: 'Tiempo de respuesta', unit: mathModelConfig.units.responseTime };

export function solveThreshold(thresholdMs: number): MathResult<SolvedOptimization> {
  const result = optimizeResponseThreshold(thresholdMs);
  return result.kind === 'invalid-threshold' ? { ok: false, error: result.error } : success(result);
}

/** Puntos del motor ordenados y sin abscisas repetidas. */
function mergePoints(...groups: ResponsePoint[][]): ResponsePoint[] {
  const byUsers = new Map<number, ResponsePoint>();
  for (const point of groups.flat()) byUsers.set(point.users, point);
  return [...byUsers.values()].sort((first, second) => first.users - second.users);
}

function evaluate(role: MarkedPoint['role'], count: number): MathResult<MarkedPoint> {
  const response = responseTime(count);
  return response.ok ? success({ role, users: count, responseMs: response.value }) : response;
}

/** Intersección, máximo entero y siguiente usuario, sin evaluar nunca n = C. */
function solutionPoints(solution: SolvedOptimization): MathResult<MarkedPoint[]> {
  if (solution.kind !== 'feasible') return success([]);
  const points: MarkedPoint[] = [];
  const requested: [MarkedPoint['role'], number][] = [
    ['intersection', solution.continuousIntersectionUsers],
    ['maximum', solution.maximumIntegerUsers],
  ];
  if (solution.responseAtNextUserMs !== undefined)
    requested.push(['next', solution.maximumIntegerUsers + 1]);
  for (const [role, count] of requested) {
    const point = evaluate(role, count);
    if (!point.ok) return point;
    points.push(point.value);
  }
  return success(points);
}

export function buildResponseFigure(
  thresholdMs: number,
  currentUsers: number,
  id: string = optimizationFigureIds.response,
): MathResult<ResponseFigure> {
  const capacity = mathModelConfig.response.referenceCapacityUsers;
  const lastUser = capacity - 1;
  const solution = solveThreshold(thresholdMs);
  if (!solution.ok) return solution;
  const current = evaluate('current', currentUsers);
  if (!current.ok) return current;
  const marked = solutionPoints(solution.value);
  if (!marked.ok) return marked;
  const domain = responseCurve(0, lastUser, lastUser * 4 + 1);
  if (!domain.ok) return domain;
  const frontier =
    solution.value.kind === 'feasible' ? solution.value.continuousIntersectionUsers : null;
  // Sólo si la frontera supera al último usuario se prolonga la extensión continua hasta ella.
  const extension =
    frontier !== null && frontier > lastUser ? responseCurve(lastUser, frontier, 9) : success([]);
  if (!extension.ok) return extension;
  const points = [...marked.value, current.value];
  return success({
    id,
    title: 'Función de respuesta y región factible',
    xAxis: usersAxis,
    yAxis: responseAxis,
    legend: [
      { label: 'R(n)', marker: 'curve' },
      { label: 'Umbral L', marker: 'threshold' },
      ...(frontier !== null && frontier > 0
        ? ([{ label: 'Región factible', marker: 'feasible' }] as const)
        : []),
      ...(frontier === null
        ? []
        : ([
            { label: 'Frontera continua n*', marker: 'frontier' },
            { label: 'Intersección continua', marker: 'intersection' },
            { label: 'Máximo entero m', marker: 'maximum' },
          ] as const)),
      ...(points.some((point) => point.role === 'next')
        ? ([{ label: 'Siguiente usuario m + 1', marker: 'next' }] as const)
        : []),
      { label: 'Región no factible (rayada)', marker: 'infeasible' },
      { label: 'Carga de análisis', marker: 'current' },
      { label: `Capacidad de referencia C = ${capacity}`, marker: 'capacity' },
    ],
    model: model(),
    parameters: { thresholdMs, users: currentUsers },
    solution: solution.value,
    regions: {
      feasible: frontier === null ? null : [0, frontier],
      infeasible: [frontier ?? 0, capacity],
    },
    points,
    currentResponseMs: current.value.responseMs,
    data: mergePoints(domain.value, extension.value, points),
  });
}

const windowBefore = 3;
const windowAfter = 4;

/** Devuelve `null` cuando no hay solución factible que verificar. */
export function buildVerificationFigure(
  thresholdMs: number,
): MathResult<VerificationFigure | null> {
  const solution = solveThreshold(thresholdMs);
  if (!solution.ok) return solution;
  if (solution.value.kind !== 'feasible') return success(null);
  const { maximumIntegerUsers: maximum, continuousIntersectionUsers: frontier } = solution.value;
  const lastUser = mathModelConfig.response.referenceCapacityUsers - 1;
  const first = Math.max(0, maximum - windowBefore);
  const last = Math.min(lastUser, maximum + windowAfter);
  const end = Math.max(last, frontier);
  const marked = solutionPoints(solution.value);
  if (!marked.ok) return marked;
  const curve = responseCurve(first, end, 57);
  if (!curve.ok) return curve;
  const integers: ResponsePoint[] = [];
  for (let count = first; count <= last; count += 1) {
    const response = responseTime(count);
    if (!response.ok) return response;
    integers.push({ users: count, responseMs: response.value });
  }
  return success({
    id: optimizationFigureIds.verification,
    title: 'Verificación del máximo entero',
    xAxis: usersAxis,
    yAxis: responseAxis,
    legend: [
      { label: 'R(n)', marker: 'curve' },
      { label: 'Umbral L', marker: 'threshold' },
      { label: 'Intersección continua', marker: 'intersection' },
      { label: 'Máximo entero m', marker: 'maximum' },
      ...(solution.value.responseAtNextUserMs === undefined
        ? []
        : ([{ label: 'Siguiente usuario m + 1', marker: 'next' }] as const)),
    ],
    model: model(),
    parameters: { thresholdMs },
    solution: solution.value,
    points: marked.value,
    data: mergePoints(curve.value, integers, marked.value),
    integers,
  });
}

const continuousSamples = 80;

export function buildCapacityFigure(thresholdMs: number): MathResult<CapacityFigure> {
  const solution = solveThreshold(thresholdMs);
  if (!solution.ok) return solution;
  const { baseResponseMs: base, referenceCapacityUsers: capacity } = mathModelConfig.response;
  const start = thresholdRange.sliderMinMs;
  const end = Math.max(thresholdRange.sliderMaxMs, thresholdMs);
  const steps: CapacityPoint[] = [];
  for (let count = 0; count < capacity; count += 1) {
    const response = responseTime(count);
    if (!response.ok) return response;
    if (response.value > end) break;
    steps.push({ thresholdMs: response.value, maximumUsers: count, continuousUsers: null });
  }
  const lastStep = steps.at(-1);
  if (lastStep && lastStep.thresholdMs < end) steps.push({ ...lastStep, thresholdMs: end });
  const continuous: CapacityPoint[] = [];
  for (let index = 0; index <= continuousSamples; index += 1) {
    // Muestreo más denso cerca del tiempo base, donde la frontera cambia más rápido.
    const threshold = base + (end - base) * (index / continuousSamples) ** 2;
    const sample = optimizeResponseThreshold(threshold);
    if (sample.kind !== 'feasible') continue;
    continuous.push({
      thresholdMs: threshold,
      maximumUsers: null,
      continuousUsers: sample.continuousIntersectionUsers,
    });
  }
  return success({
    id: optimizationFigureIds.capacity,
    title: 'Umbral permitido y capacidad operativa',
    xAxis: { label: 'Umbral de respuesta (L)', unit: mathModelConfig.units.responseTime },
    yAxis: { label: 'Usuarios permitidos', unit: mathModelConfig.units.concurrentUsers },
    legend: [
      { label: 'Máximo entero (escalonado)', marker: 'steps' },
      { label: 'Frontera continua teórica', marker: 'continuous' },
      { label: 'Sin solución factible (L < B)', marker: 'infeasible' },
      { label: 'Umbral seleccionado', marker: 'threshold' },
    ],
    model: model(),
    parameters: { thresholdMs },
    solution: solution.value,
    domainMs: [start, end],
    steps,
    continuous,
  });
}
