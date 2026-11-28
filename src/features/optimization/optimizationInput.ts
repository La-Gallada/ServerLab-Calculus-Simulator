import { lastOperationalUser } from '../../config/domain';
import { mathModelConfig } from '../../config/model';
import { failure, responseTime, type MathResult } from '../../math';
import { parseDecimal } from '../shared/numberInput';
import { niceCeiling } from './chartTheme';

const base = mathModelConfig.response.baseResponseMs;
const presets = mathModelConfig.controls.responseThresholdsMs;
const lastResponse = responseTime(lastOperationalUser);
const largestResponse = lastResponse.ok ? lastResponse.value : Math.max(...presets);

/**
 * Rangos de interacción de la interfaz, derivados de la configuración. No son el
 * dominio del motor, que admite cualquier umbral finito no negativo. El campo
 * llega más allá de R(C − 1) para poder estudiar el último usuario operativo.
 */
export const thresholdRange = Object.freeze({
  sliderMinMs: base / 2,
  sliderMaxMs: Math.max(...presets) * 2,
  fieldMinMs: 0,
  fieldMaxMs: niceCeiling(largestResponse * 1.25),
});

/** Escenarios comparativos: bajo el tiempo base, en él y los umbrales configurados. */
export const scenarioThresholdsMs: readonly number[] = [base / 2, base, ...presets];

export function parseThreshold(text: string): MathResult<number> {
  const parsed = parseDecimal(text);
  if (!parsed.ok) return parsed;
  if (parsed.value < thresholdRange.fieldMinMs)
    return failure('negative-value', 'Un tiempo de respuesta no puede ser negativo.');
  if (parsed.value > thresholdRange.fieldMaxMs)
    return failure(
      'outside-domain',
      `El laboratorio admite umbrales de hasta ${thresholdRange.fieldMaxMs} ms.`,
    );
  return parsed;
}
