import { teamName } from '../../config/authorship';
import { formatValue } from '../format';
import { themes, type ExportTheme } from '../themes';
import type {
  Chart,
  ChartAxis,
  ExportFigure,
  FillRole,
  LegendItem,
  MarkerShape,
  ThemeId,
  XY,
} from '../types';
import { escapeXml, textWidth, wrapText } from './text';

/** Lienzo lógico 3:2; el tamaño en píxeles sólo cambia `width` y `height`. */
export const canvasSize = Object.freeze({ width: 1200, height: 800 });
export const fontFamily = 'Arial, Helvetica, sans-serif';

const margin = { left: 118, right: 48, side: 40 };
const sizes = { title: 28, note: 18, axis: 19, tick: 17, label: 16, legend: 17, footer: 13 };
const legendRow = 30;

const round = (value: number) => Math.round(value * 100) / 100;

interface Frame {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

interface TextOptions {
  size: number;
  fill: string;
  anchor?: 'start' | 'middle' | 'end';
  bold?: boolean;
  rotate?: boolean;
  halo?: string;
  role?: string;
}

function textElement(x: number, y: number, content: string, options: TextOptions) {
  const attributes = [
    `x="${round(x)}"`,
    `y="${round(y)}"`,
    `font-size="${options.size}"`,
    `fill="${options.fill}"`,
    `text-anchor="${options.anchor ?? 'start'}"`,
    options.bold ? 'font-weight="bold"' : '',
    options.rotate ? `transform="rotate(-90 ${round(x)} ${round(y)})"` : '',
    // El contorno del color de fondo mantiene legibles los rótulos sobre las líneas.
    options.halo
      ? `stroke="${options.halo}" stroke-width="5" stroke-linejoin="round" paint-order="stroke"`
      : '',
    options.role ? `data-role="${options.role}"` : '',
  ].filter(Boolean);
  return `<text ${attributes.join(' ')}>${escapeXml(content)}</text>`;
}

function scaleFor(axis: ChartAxis, from: number, to: number) {
  const [low, high] = axis.domain;
  if (axis.scale === 'log') {
    const base = Math.log10(low);
    const span = Math.log10(high) - base;
    return (value: number) => from + ((Math.log10(value) - base) / span) * (to - from);
  }
  return (value: number) => from + ((value - low) / (high - low)) * (to - from);
}

function markerElement(
  x: number,
  y: number,
  shape: MarkerShape,
  color: string,
  theme: ExportTheme,
  role: string,
) {
  const common = `data-marker="${shape}" data-role="${role}"`;
  const outline = `stroke="${theme.background}" stroke-width="2"`;
  const cx = round(x);
  const cy = round(y);
  if (shape === 'ring')
    return `<circle ${common} cx="${cx}" cy="${cy}" r="12" fill="none" stroke="${color}" stroke-width="3.5"/>`;
  if (shape === 'open')
    return `<circle ${common} cx="${cx}" cy="${cy}" r="7" fill="${theme.background}" stroke="${color}" stroke-width="3.5"/>`;
  if (shape === 'square')
    return `<rect ${common} x="${round(x - 7)}" y="${round(y - 7)}" width="14" height="14" fill="${color}" ${outline}/>`;
  if (shape === 'diamond')
    return `<path ${common} d="M${cx} ${round(y - 11)}L${round(x + 11)} ${cy}L${cx} ${round(y + 11)}L${round(x - 11)} ${cy}Z" fill="${color}" ${outline}/>`;
  if (shape === 'dot') return `<circle ${common} cx="${cx}" cy="${cy}" r="4.5" fill="${color}"/>`;
  return `<circle ${common} cx="${cx}" cy="${cy}" r="8" fill="${color}" ${outline}/>`;
}

function linePath(
  points: (XY | null)[],
  step: boolean,
  x: (v: number) => number,
  y: (v: number) => number,
) {
  let path = '';
  let drawing = false;
  for (const point of points) {
    if (!point) {
      drawing = false;
      continue;
    }
    const px = round(x(point[0]));
    const py = round(y(point[1]));
    if (!drawing) path += `M${px} ${py}`;
    else path += step ? `H${px}V${py}` : `L${px} ${py}`;
    drawing = true;
  }
  return path;
}

interface LegendLayout {
  rows: { items: { item: LegendItem; offset: number }[]; width: number }[];
}

function layoutLegend(items: LegendItem[]): LegendLayout {
  const available = canvasSize.width - margin.side * 2;
  const rows: LegendLayout['rows'] = [{ items: [], width: 0 }];
  for (const item of items) {
    const width = 54 + textWidth(item.label, sizes.legend);
    let row = rows[rows.length - 1];
    const gap = row.items.length ? 28 : 0;
    if (row.items.length && row.width + gap + width > available) {
      row = { items: [], width: 0 };
      rows.push(row);
    }
    const offset = row.items.length ? row.width + 28 : 0;
    row.items.push({ item, offset });
    row.width = offset + width;
  }
  return { rows };
}

function fillPaint(role: FillRole, theme: ExportTheme, prefix: string) {
  return theme.fills[role].hatch ? `url(#${prefix}-hatch-${role})` : theme.fills[role].fill;
}

function legendElements(layout: LegendLayout, top: number, theme: ExportTheme, prefix: string) {
  return layout.rows
    .map((row, index) => {
      const left = (canvasSize.width - row.width) / 2;
      const y = top + index * legendRow;
      return row.items
        .map(({ item, offset }) => {
          const x = left + offset;
          let symbol: string;
          if (item.kind === 'line') {
            const style = theme.series[item.role];
            symbol = `<line x1="${round(x)}" y1="${y}" x2="${round(x + 44)}" y2="${y}" stroke="${style.color}" stroke-width="${Math.min(style.width, 6)}"${style.dash ? ` stroke-dasharray="${style.dash}"` : ''}/>`;
          } else if (item.kind === 'fill') {
            symbol = `<rect x="${round(x + 6)}" y="${y - 10}" width="32" height="20" fill="${fillPaint(item.role, theme, prefix)}" stroke="${theme.axis}" stroke-width="1"/>`;
          } else {
            symbol = markerElement(
              x + 22,
              y,
              item.shape,
              theme.series[item.role].color,
              theme,
              'legend',
            );
          }
          return (
            symbol +
            textElement(x + 54, y + 6, item.label, {
              size: sizes.legend,
              fill: theme.text,
              role: 'legend-label',
            })
          );
        })
        .join('');
    })
    .join('');
}

/** Rótulos de líneas verticales: se apilan en filas para que no se encimen. */
function verticalLabels(
  chart: Chart,
  x: (value: number) => number,
  frame: Frame,
  theme: ExportTheme,
) {
  const placed: { from: number; to: number }[][] = [[], [], []];
  return chart.references
    .filter(
      (reference) =>
        reference.orientation === 'vertical' &&
        reference.label &&
        reference.value >= chart.x.domain[0] &&
        reference.value <= chart.x.domain[1],
    )
    .map((reference) => {
      const label = reference.label!;
      const half = textWidth(label, sizes.label) / 2;
      const center = Math.min(canvasSize.width - half - 8, Math.max(half + 8, x(reference.value)));
      const from = center - half - 6;
      const to = center + half + 6;
      let row = placed.findIndex((used) => used.every((o) => to <= o.from || from >= o.to));
      if (row < 0) row = placed.length - 1;
      placed[row].push({ from, to });
      return textElement(center, frame.top - 10 - row * 21, label, {
        size: sizes.label,
        fill: theme.series[reference.role].color,
        anchor: 'middle',
        bold: true,
        role: 'reference-label',
      });
    })
    .join('');
}

export function renderSvg(
  figure: ExportFigure,
  themeId: ThemeId = 'academic',
  size: { width: number; height: number } = canvasSize,
): string {
  const theme = themes[themeId];
  const { chart } = figure;
  const prefix = `sl-${figure.id}-${themeId}`;
  const contentWidth = canvasSize.width - margin.side * 2;

  const titleLines = wrapText(figure.title, sizes.title, contentWidth, true);
  const noteLines = figure.notes.flatMap((note) => wrapText(note, sizes.note, contentWidth));
  const titleBottom = 24 + titleLines.length * 34;
  const notesBottom = titleBottom + noteLines.length * 25;
  const legend = layoutLegend(figure.legend);
  const verticalRows = chart.references.some((r) => r.orientation === 'vertical' && r.label);
  const legendTop = canvasSize.height - 34 - (legend.rows.length - 1) * legendRow - 14;
  // El margen crece para que el título del eje no toque las marcas largas.
  const tickSpace = Math.max(
    ...chart.y.ticks.map((tick) => textWidth(formatValue(tick, 4), sizes.tick)),
  );
  const frame: Frame = {
    left: Math.max(margin.left, Math.ceil(tickSpace) + 70),
    right: canvasSize.width - margin.right,
    top: notesBottom + (verticalRows ? 62 : 24),
    bottom: legendTop - 88,
  };
  const x = scaleFor(chart.x, frame.left, frame.right);
  const y = scaleFor(chart.y, frame.bottom, frame.top);
  const clip = `url(#${prefix}-clip)`;

  const patterns = (Object.keys(theme.fills) as FillRole[])
    .filter((role) => theme.fills[role].hatch)
    .map(
      (role) =>
        `<pattern id="${prefix}-hatch-${role}" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="12" height="12" fill="${theme.fills[role].fill}"/><line x1="0" y1="0" x2="0" y2="12" stroke="${theme.fills[role].hatch}" stroke-width="3"/></pattern>`,
    )
    .join('');

  const bands = chart.bands
    .filter((band) => band.to > band.from)
    .map(
      (band) =>
        `<rect data-band="${band.role}" x="${round(x(band.from))}" y="${frame.top}" width="${round(x(band.to) - x(band.from))}" height="${round(frame.bottom - frame.top)}" fill="${fillPaint(band.role, theme, prefix)}"/>`,
    )
    .join('');

  const areas = chart.areas
    .filter((area) => area.points.length > 1)
    .map((area) => {
      const floor = round(y(chart.y.domain[0]));
      const first = area.points[0][0];
      const last = area.points[area.points.length - 1][0];
      const top = area.points.map((p) => `L${round(x(p[0]))} ${round(y(p[1]))}`).join('');
      return `<path data-area="${area.role}" d="M${round(x(first))} ${floor}${top}L${round(x(last))} ${floor}Z" fill="${fillPaint(area.role, theme, prefix)}" opacity="0.85"/>`;
    })
    .join('');

  const grid = [
    ...chart.x.ticks.map(
      (tick) =>
        `<line x1="${round(x(tick))}" y1="${frame.top}" x2="${round(x(tick))}" y2="${frame.bottom}" stroke="${theme.grid}" stroke-width="1"/>`,
    ),
    ...chart.y.ticks.map(
      (tick) =>
        `<line x1="${frame.left}" y1="${round(y(tick))}" x2="${frame.right}" y2="${round(y(tick))}" stroke="${theme.grid}" stroke-width="1"/>`,
    ),
  ].join('');

  const inside = (value: number, axis: ChartAxis) =>
    value >= axis.domain[0] - 1e-9 && value <= axis.domain[1] + 1e-9;

  const references = chart.references
    .filter((r) => inside(r.value, r.orientation === 'vertical' ? chart.x : chart.y))
    .map((reference) => {
      const style = theme.series[reference.role];
      const vertical = reference.orientation === 'vertical';
      const position = round(vertical ? x(reference.value) : y(reference.value));
      const along = vertical ? y : x;
      const [start, end] = reference.span
        ? [round(along(reference.span[0])), round(along(reference.span[1]))]
        : vertical
          ? [frame.top, frame.bottom]
          : [frame.left, frame.right];
      const coordinates = vertical
        ? `x1="${position}" y1="${start}" x2="${position}" y2="${end}"`
        : `x1="${start}" y1="${position}" x2="${end}" y2="${position}"`;
      return `<line data-reference="${reference.role}" ${coordinates} stroke="${style.color}" stroke-width="${style.width}"${style.dash ? ` stroke-dasharray="${style.dash}"` : ''}/>`;
    })
    .join('');

  const lines = chart.lines
    .map((line) => {
      const style = theme.series[line.role];
      const path = linePath(line.points, line.interpolation === 'step', x, y);
      if (!path) return '';
      return `<path data-series="${line.role}" d="${path}" fill="none" stroke="${style.color}" stroke-width="${style.width}" stroke-linejoin="round"${style.dash ? ` stroke-dasharray="${style.dash}"` : ''}/>`;
    })
    .join('');

  const markers = chart.markers
    .filter((marker) => inside(marker.x, chart.x) && inside(marker.y, chart.y))
    .map((marker) =>
      markerElement(
        x(marker.x),
        y(marker.y),
        marker.shape,
        theme.series[marker.role].color,
        theme,
        marker.role,
      ),
    )
    .join('');

  const horizontalValues = chart.references
    .filter((r) => r.orientation === 'horizontal' && r.label)
    .map((r) => y(r.value));

  const horizontalLabels = chart.references
    .filter((r) => r.orientation === 'horizontal' && r.label && inside(r.value, chart.y))
    .map((reference) => {
      const position = y(reference.value);
      // Encima de la línea, o debajo si está pegada al borde superior.
      const baseline = position - 10 < frame.top + 16 ? position + 22 : position - 10;
      const atEnd = reference.labelAlign === 'end';
      return textElement(atEnd ? frame.right - 12 : frame.left + 12, baseline, reference.label!, {
        anchor: atEnd ? 'end' : 'start',
        size: sizes.label,
        fill: theme.series[reference.role].color,
        bold: true,
        halo: theme.background,
        role: 'reference-label',
      });
    })
    .join('');

  const bandLabels = chart.bands
    .filter(
      (band) =>
        band.label && x(band.to) - x(band.from) > textWidth(band.label, sizes.label, true) + 16,
    )
    .map((band) => {
      const low = frame.bottom - 14;
      // Se evita el borde inferior cuando un rótulo horizontal ya lo ocupa.
      const crowded = horizontalValues.some((value) => value > frame.bottom - 48);
      return textElement(
        (x(band.from) + x(band.to)) / 2,
        crowded ? frame.top + 24 : low,
        band.label!,
        {
          size: sizes.label,
          fill: theme.text,
          anchor: 'middle',
          bold: true,
          halo: theme.background,
          role: 'band-label',
        },
      );
    })
    .join('');

  const xTicks = chart.x.ticks
    .map((tick) =>
      textElement(x(tick), frame.bottom + 27, formatValue(tick, 4), {
        size: sizes.tick,
        fill: theme.muted,
        anchor: 'middle',
        role: 'x-tick',
      }),
    )
    .join('');
  const yTicks = chart.y.ticks
    .map((tick) =>
      textElement(frame.left - 12, y(tick) + 6, formatValue(tick, 4), {
        size: sizes.tick,
        fill: theme.muted,
        anchor: 'end',
        role: 'y-tick',
      }),
    )
    .join('');

  const axes = `<path d="M${frame.left} ${frame.top}V${frame.bottom}H${frame.right}" fill="none" stroke="${theme.axis}" stroke-width="2"/>`;

  const header = [
    ...titleLines.map((line, index) =>
      textElement(canvasSize.width / 2, 48 + index * 34, line, {
        size: sizes.title,
        fill: theme.text,
        anchor: 'middle',
        bold: true,
        role: 'title',
      }),
    ),
    ...noteLines.map((line, index) =>
      textElement(canvasSize.width / 2, titleBottom + 22 + index * 25, line, {
        size: sizes.note,
        fill: theme.muted,
        anchor: 'middle',
        role: 'note',
      }),
    ),
  ].join('');

  const axisTitles =
    textElement((frame.left + frame.right) / 2, frame.bottom + 58, chart.x.label, {
      size: sizes.axis,
      fill: theme.text,
      anchor: 'middle',
      role: 'x-title',
    }) +
    textElement(30, (frame.top + frame.bottom) / 2, chart.y.label, {
      size: sizes.axis,
      fill: theme.text,
      anchor: 'middle',
      rotate: true,
      role: 'y-title',
    });

  const footer = textElement(
    canvasSize.width - 16,
    canvasSize.height - 10,
    `ServerLab · ${teamName} · modelo hipotético y provisional · ${figure.model.id} (${figure.model.version})`,
    { size: sizes.footer, fill: theme.muted, anchor: 'end', role: 'footer' },
  );

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size.width}" height="${size.height}" viewBox="0 0 ${canvasSize.width} ${canvasSize.height}" font-family="${fontFamily}" role="img" aria-labelledby="${prefix}-title ${prefix}-desc" data-figure-id="${figure.id}" data-theme="${themeId}">`,
    `<title id="${prefix}-title">${escapeXml(figure.title)}</title>`,
    `<desc id="${prefix}-desc">${escapeXml(figure.summary)}</desc>`,
    `<defs><clipPath id="${prefix}-clip"><rect x="${frame.left}" y="${frame.top}" width="${frame.right - frame.left}" height="${round(frame.bottom - frame.top)}"/></clipPath>${patterns}</defs>`,
    `<rect data-role="background" width="${canvasSize.width}" height="${canvasSize.height}" fill="${theme.background}"/>`,
    `<g clip-path="${clip}">${bands}</g>`,
    grid,
    `<g clip-path="${clip}">${areas}${lines}</g>`,
    axes,
    references,
    markers,
    bandLabels,
    horizontalLabels,
    verticalLabels(chart, x, frame, theme),
    xTicks,
    yTicks,
    header,
    axisTitles,
    legendElements(legend, legendTop, theme, prefix),
    footer,
    '</svg>',
  ].join('\n');
}
