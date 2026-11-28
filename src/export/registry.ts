import { mathModelConfig } from '../config/model';
import { parseDecimal } from '../features/shared/numberInput';
import { failure, success, type MathResult } from '../math';
import {
  firstDerivativeFigure,
  secondDerivativeFigure,
  tangentFigure,
} from './figures/derivatives';
import { accumulatedFigure, integralExampleFigures, transferRateFigure } from './figures/integrals';
import {
  capacityFigure,
  regionFigure,
  scenarioFigures,
  verificationFigure,
} from './figures/optimization';
import { dashboardResponse, limitCapacity, limitZero } from './figures/response';
import type { FigureDefinition } from './figures/shared';
import { formatValue } from './format';
import type { ExportFigure, FigureCategory, ParameterSpec, ParameterValues } from './types';

export type { FigureDefinition };

/** Catálogo central. El orden es de presentación, no la numeración del documento. */
export const figureRegistry: readonly FigureDefinition[] = Object.freeze([
  dashboardResponse,
  limitZero,
  limitCapacity,
  tangentFigure,
  firstDerivativeFigure,
  secondDerivativeFigure,
  transferRateFigure,
  accumulatedFigure,
  ...integralExampleFigures,
  regionFigure,
  verificationFigure,
  capacityFigure,
  ...scenarioFigures,
]);

export const categoryNames: Record<FigureCategory, string> = {
  dashboard: 'Dashboard',
  limits: 'Límites',
  derivatives: 'Derivadas',
  integrals: 'Integrales',
  optimization: 'Optimización',
};

export const findDefinition = (id: string) => figureRegistry.find((item) => item.id === id);

export const defaultValues = (definition: FigureDefinition): ParameterValues =>
  Object.fromEntries(definition.parameters.map((spec) => [spec.key, spec.default]));

/** Comprueba un valor contra su especificación; nunca lo corrige ni lo sustituye. */
export function validateParameter(
  spec: ParameterSpec,
  value: number | string,
): MathResult<number | string> {
  if (spec.kind === 'select')
    return spec.options.some((option) => option.value === value)
      ? success(value)
      : failure('outside-domain', `${spec.label}: opción no disponible.`);
  if (typeof value !== 'number' || !Number.isFinite(value))
    return failure('non-finite', `${spec.label}: escriba un número finito.`);
  if (value < spec.min || value > spec.max)
    return failure(
      'outside-domain',
      `${spec.label}: debe estar entre ${formatValue(spec.min)} y ${formatValue(spec.max)}.`,
    );
  if (spec.integer && !Number.isInteger(value))
    return failure('non-integer-user-count', `${spec.label}: debe ser un número entero.`);
  return success(value);
}

/** Lee el texto de un campo numérico con las mismas reglas que los laboratorios. */
export function parseParameter(spec: ParameterSpec, text: string): MathResult<number | string> {
  const parsed = parseDecimal(text);
  if (!parsed.ok) return failure(parsed.error.code, `${spec.label}: ${parsed.error.message}`);
  return validateParameter(spec, parsed.value);
}

/** Resuelve una figura con sus parámetros validados y los datos del motor. */
export function resolveFigure(id: string, values: ParameterValues = {}): MathResult<ExportFigure> {
  const definition = findDefinition(id);
  if (!definition) return failure('invalid-configuration', 'La figura solicitada no existe.');
  const complete: ParameterValues = defaultValues(definition);
  for (const spec of definition.parameters) {
    const provided = values[spec.key] ?? spec.default;
    const valid = validateParameter(spec, provided);
    if (!valid.ok) return valid;
    complete[spec.key] = valid.value;
  }
  const content = definition.build(complete);
  if (!content.ok) return content;
  return success({
    ...content.value,
    id: definition.id,
    category: definition.category,
    name: definition.name,
    description: definition.description,
    variables: definition.variables,
    formulas: definition.formulas(),
    model: {
      id: mathModelConfig.id,
      version: mathModelConfig.version,
      status: mathModelConfig.status,
    },
  });
}
