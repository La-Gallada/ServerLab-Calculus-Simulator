import { failure, success, type MathResult } from '../math';
import type { DataTable, DataValue } from './types';

export type CsvVariant = 'standard' | 'regional';

export const csvVariants: Record<CsvVariant, { name: string; separator: string; decimal: string }> =
  {
    standard: { name: 'Estándar (coma y punto decimal)', separator: ',', decimal: '.' },
    regional: { name: 'Regional (punto y coma y coma decimal)', separator: ';', decimal: ',' },
  };

/** Marca UTF-8 para que las hojas de cálculo reconozcan los acentos. */
export const byteOrderMark = '﻿';

/**
 * Serializa los datos sin redondearlos. Los valores ausentes quedan vacíos y un
 * número no finito detiene la exportación en lugar de escribirse.
 */
export function toCsv(table: DataTable, variant: CsvVariant = 'standard'): MathResult<string> {
  const { separator, decimal } = csvVariants[variant];
  const quote = (text: string) =>
    text.includes(separator) || /["\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  const cell = (value: DataValue) => {
    if (value === null) return '';
    if (typeof value === 'number') return quote(String(value + 0).replace('.', decimal));
    return quote(value);
  };
  const invalid = table.rows.some((row) =>
    row.some((value) => typeof value === 'number' && !Number.isFinite(value)),
  );
  if (invalid) return failure('non-finite', 'Los datos contienen un valor no finito.');
  if (table.rows.some((row) => row.length !== table.columns.length))
    return failure('invalid-configuration', 'Las filas no coinciden con los encabezados.');
  const header = table.columns.map((column) =>
    quote(column.unit ? `${column.label} (${column.unit})` : column.label),
  );
  const lines = [header, ...table.rows.map((row) => row.map(cell))];
  return success(byteOrderMark + lines.map((line) => line.join(separator)).join('\r\n') + '\r\n');
}
