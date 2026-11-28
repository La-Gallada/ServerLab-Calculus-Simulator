import type { CsvVariant } from './csv';
import type { ThemeId } from './types';

export type ExportFormat = 'png' | 'svg' | 'csv';

/** Fragmento válido en Windows: minúsculas ASCII, dígitos y guiones. */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/(\d)[.,](\d)/g, '$1p$2')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

export function exportFileName(
  fileSlug: string,
  format: ExportFormat,
  options: { theme?: ThemeId; csvVariant?: CsvVariant } = {},
): string {
  const parts = ['serverlab', slugify(fileSlug)];
  if (format !== 'csv' && options.theme === 'serverlab') parts.push('tema-oscuro');
  if (format === 'csv' && options.csvVariant === 'regional') parts.push('regional');
  return `${parts.join('-')}.${format}`;
}
