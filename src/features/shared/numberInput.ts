/** Lectura de números escritos por la persona, común a todos los campos. */
import { failure, validateFinite, type MathResult } from '../../math';

const plain = /^-?\d+([.,]\d{1,2})?$/;
/** Miles agrupados con espacio, como los muestra es-CR (también espacios no separables). */
const spaceGrouped = /^-?\d{1,3}(\s\d{3})+([.,]\d{1,2})?$/;
/** Punto o coma seguidos de grupos de tres cifras: podrían ser miles o decimales. */
const ambiguous = /^-?\d{1,3}([.,]\d{3})+([.,]\d*)?$/;

export const numberFormatHint =
  'Use coma o punto decimal (máximo dos cifras); los miles pueden separarse con espacio.';

/**
 * Admite `1000`, `1 000`, `1000,5` y `1000.5`. Nunca interpreta un texto ambiguo
 * como `1.000`: lo rechaza para que se escriba sin dudas.
 */
export function parseDecimal(text: string): MathResult<number> {
  const trimmed = text.trim();
  if (ambiguous.test(trimmed))
    return failure(
      'non-finite',
      `«${trimmed}» es ambiguo: para miles escriba el número sin separador o con espacio; para decimales use como máximo dos cifras.`,
    );
  const compact = spaceGrouped.test(trimmed) ? trimmed.replace(/\s/g, '') : trimmed;
  if (!plain.test(compact))
    return failure('non-finite', `Escriba un número válido. ${numberFormatHint}`);
  // La suma normaliza -0.
  return validateFinite(Number(compact.replace(',', '.')) + 0, 'El valor');
}

/** Texto de edición: coma decimal y sin separador de miles. */
export const editableText = (value: number | string) => String(value).replace('.', ',');
