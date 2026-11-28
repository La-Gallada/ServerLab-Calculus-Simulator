import { failure, validateFinite, type MathResult } from '../../math';

/**
 * Rangos de interacción de la interfaz. No son el dominio del motor, que admite
 * cualquier umbral finito. El campo llega más allá de R(C − 1) para poder
 * estudiar el último usuario operativo.
 */
export const thresholdRange = Object.freeze({
  sliderMinMs: 50,
  sliderMaxMs: 2000,
  fieldMinMs: 0,
  fieldMaxMs: 25000,
});

/** Umbrales de los escenarios comparativos; los dos primeros son casos educativos. */
export const scenarioThresholdsMs = [50, 100, 300, 500, 1000] as const;

const decimalPattern = /^-?\d+([.,]\d{1,2})?$/;

export function parseThreshold(text: string): MathResult<number> {
  const trimmed = text.trim();
  if (!decimalPattern.test(trimmed))
    return failure(
      'non-finite',
      'Escriba un número sin separador de miles y con un máximo de dos decimales.',
    );
  // La suma normaliza -0.
  const value = Number(trimmed.replace(',', '.')) + 0;
  const finite = validateFinite(value, 'El umbral');
  if (!finite.ok) return finite;
  if (value < thresholdRange.fieldMinMs)
    return failure('negative-value', 'Un tiempo de respuesta no puede ser negativo.');
  if (value > thresholdRange.fieldMaxMs)
    return failure(
      'outside-domain',
      `El laboratorio admite umbrales de hasta ${thresholdRange.fieldMaxMs} ms.`,
    );
  return finite;
}
