import type { FillRole, SeriesRole, ThemeId } from './types';

export interface SeriesStyle {
  color: string;
  width: number;
  dash?: string;
}

export interface ExportTheme {
  id: ThemeId;
  name: string;
  background: string;
  text: string;
  muted: string;
  grid: string;
  axis: string;
  series: Record<SeriesRole, SeriesStyle>;
  fills: Record<FillRole, { fill: string; hatch?: string }>;
}

type Palette = Record<SeriesRole, string>;

/** Los trazos son comunes a ambos temas y distinguen las series en escala de grises. */
const strokes: Record<SeriesRole, Omit<SeriesStyle, 'color'>> = {
  primary: { width: 3.5 },
  derivative: { width: 3.5 },
  integral: { width: 3.5 },
  selected: { width: 8 },
  tangent: { width: 3, dash: '14 7' },
  threshold: { width: 2.5, dash: '12 6' },
  frontier: { width: 2.5, dash: '3 6' },
  capacity: { width: 2.5, dash: '16 5 3 5' },
  reference: { width: 1.5, dash: '5 5' },
  continuous: { width: 2.5, dash: '9 6' },
  difference: { width: 5, dash: '9 5' },
  steps: { width: 3 },
};

const withStrokes = (palette: Palette) =>
  Object.fromEntries(
    (Object.keys(strokes) as SeriesRole[]).map((role) => [
      role,
      { ...strokes[role], color: palette[role] },
    ]),
  ) as Record<SeriesRole, SeriesStyle>;

export const themes: Record<ThemeId, ExportTheme> = {
  academic: {
    id: 'academic',
    name: 'Académico',
    background: '#ffffff',
    text: '#111827',
    muted: '#374151',
    grid: '#e5e7eb',
    axis: '#374151',
    series: withStrokes({
      primary: '#1e3a8a',
      derivative: '#5b21b6',
      integral: '#166534',
      selected: '#14532d',
      tangent: '#92400e',
      threshold: '#92400e',
      frontier: '#78350f',
      capacity: '#b91c1c',
      reference: '#4b5563',
      continuous: '#1e3a8a',
      difference: '#5b21b6',
      steps: '#92400e',
    }),
    fills: {
      area: { fill: '#bbf7d0' },
      feasible: { fill: '#dcfce7' },
      infeasible: { fill: '#fef2f2', hatch: '#dc8c8c' },
    },
  },
  serverlab: {
    id: 'serverlab',
    name: 'ServerLab',
    background: '#0b1220',
    text: '#f1f5f9',
    muted: '#b6c4da',
    grid: '#22304a',
    axis: '#94a3b8',
    series: withStrokes({
      primary: '#38bdf8',
      derivative: '#a78bfa',
      integral: '#22c55e',
      selected: '#4ade80',
      tangent: '#f59e0b',
      threshold: '#f59e0b',
      frontier: '#fcd34d',
      capacity: '#f87171',
      reference: '#a7b7cf',
      continuous: '#38bdf8',
      difference: '#a78bfa',
      steps: '#f59e0b',
    }),
    fills: {
      area: { fill: '#14532d' },
      feasible: { fill: '#123524' },
      infeasible: { fill: '#2a1420', hatch: '#8f3a45' },
    },
  },
};
