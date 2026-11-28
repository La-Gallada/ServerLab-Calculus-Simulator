import { toCsv } from './csv';
import { exportFileName } from './filenames';
import { academicRecord } from './metadata';
import { resolutionById, svgToPng, type ResolutionId } from './png';
import { defaultValues, figureRegistry, resolveFigure } from './registry';
import { renderSvg } from './svg/renderSvg';
import type { ThemeId } from './types';
import { createZip, type ZipEntry } from './zip';

export const packageName = 'serverlab-paquete-figuras.zip';

/** Genera PNG, SVG, CSV y ficha de todo el catálogo con sus parámetros iniciales. */
export async function buildFigurePackage(
  theme: ThemeId,
  resolution: ResolutionId,
  onProgress: (done: number, total: number) => void = () => {},
): Promise<Blob> {
  const size = resolutionById(resolution);
  const encoder = new TextEncoder();
  const entries: ZipEntry[] = [];
  const total = figureRegistry.length;
  for (const [index, definition] of figureRegistry.entries()) {
    onProgress(index, total);
    const resolved = resolveFigure(definition.id, defaultValues(definition));
    if (!resolved.ok) throw new Error(`${definition.name}: ${resolved.error.message}`);
    const figure = resolved.value;
    const csv = toCsv(figure.table);
    if (!csv.ok) throw new Error(`${definition.name}: ${csv.error.message}`);
    const svg = renderSvg(figure, theme, size);
    const png = await svgToPng(svg, size);
    entries.push(
      {
        path: `png/${exportFileName(figure.fileSlug, 'png', { theme })}`,
        data: new Uint8Array(await png.arrayBuffer()),
      },
      {
        path: `svg/${exportFileName(figure.fileSlug, 'svg', { theme })}`,
        data: encoder.encode(svg),
      },
      {
        path: `csv/${exportFileName(figure.fileSlug, 'csv')}`,
        data: encoder.encode(csv.value),
      },
      {
        path: `fichas/${exportFileName(figure.fileSlug, 'csv').replace(/\.csv$/, '.txt')}`,
        data: encoder.encode(academicRecord(figure)),
      },
    );
  }
  onProgress(total, total);
  return new Blob([createZip(entries)], { type: 'application/zip' });
}
