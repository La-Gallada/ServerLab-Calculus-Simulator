/** Tipos del sistema de exportación. No contienen fórmulas ni cálculos del modelo. */

export type FigureCategory = 'dashboard' | 'limits' | 'derivatives' | 'integrals' | 'optimization';

export type ThemeId = 'academic' | 'serverlab';

/** Función gráfica de un elemento; cada tema decide su color, trazo y trama. */
export type SeriesRole =
  | 'primary'
  | 'derivative'
  | 'integral'
  | 'selected'
  | 'tangent'
  | 'threshold'
  | 'frontier'
  | 'capacity'
  | 'reference'
  | 'continuous'
  | 'difference'
  | 'steps';

export type FillRole = 'area' | 'feasible' | 'infeasible';

export type MarkerShape = 'circle' | 'open' | 'ring' | 'square' | 'diamond' | 'dot';

export type XY = [x: number, y: number];

export interface ChartAxis {
  label: string;
  domain: [number, number];
  ticks: number[];
  scale: 'linear' | 'log';
}

export interface ChartBand {
  from: number;
  to: number;
  role: FillRole;
  label?: string;
}

export interface ChartArea {
  /** Contorno superior; el relleno baja hasta y = 0. */
  points: XY[];
  role: FillRole;
}

export interface ChartLine {
  role: SeriesRole;
  /** `null` interrumpe el trazo. */
  points: (XY | null)[];
  /** `step` mantiene cada valor hasta la siguiente abscisa. */
  interpolation?: 'linear' | 'step';
}

export interface ChartReference {
  orientation: 'vertical' | 'horizontal';
  value: number;
  /** Extremos opcionales sobre el otro eje para dibujar un segmento. */
  span?: [number, number];
  role: SeriesRole;
  label?: string;
  /** Extremo en el que se escribe el rótulo de una línea horizontal. */
  labelAlign?: 'start' | 'end';
}

export interface ChartMarker {
  x: number;
  y: number;
  shape: MarkerShape;
  role: SeriesRole;
}

export interface Chart {
  x: ChartAxis;
  y: ChartAxis;
  bands: ChartBand[];
  areas: ChartArea[];
  lines: ChartLine[];
  references: ChartReference[];
  markers: ChartMarker[];
}

export type LegendItem =
  | { kind: 'line'; role: SeriesRole; label: string }
  | { kind: 'fill'; role: FillRole; label: string }
  | { kind: 'marker'; role: SeriesRole; shape: MarkerShape; label: string };

export interface DataColumn {
  label: string;
  unit?: string;
}

export type DataValue = number | string | null;

/** Datos originales del motor, sin redondeo. `null` significa ausencia de valor. */
export interface DataTable {
  columns: DataColumn[];
  rows: DataValue[][];
}

export interface LabeledValue {
  label: string;
  value: string;
}

export type ParameterValues = Record<string, number | string>;

export type ParameterSpec =
  | {
      key: string;
      label: string;
      kind: 'number';
      min: number;
      max: number;
      integer?: boolean;
      unit?: string;
      default: number;
    }
  | {
      key: string;
      label: string;
      kind: 'select';
      options: { value: number | string; label: string }[];
      default: number | string;
    };

/** Contenido que produce una figura para unos parámetros concretos. */
export interface FigureContent {
  title: string;
  /** Anotaciones matemáticas que acompañan a la gráfica. */
  notes: string[];
  chart: Chart;
  legend: LegendItem[];
  table: DataTable;
  parameters: LabeledValue[];
  domain: string;
  scale: string;
  /** Alternativa textual de la gráfica. */
  summary: string;
  /** Parte del nombre de archivo, sin extensión ni prefijo. */
  fileSlug: string;
}

export interface Variable {
  symbol: string;
  meaning: string;
  unit: string;
}

export interface ModelReference {
  id: string;
  version: string;
  status: string;
}

export interface ExportFigure extends FigureContent {
  id: string;
  category: FigureCategory;
  name: string;
  description: string;
  variables: Variable[];
  formulas: string[];
  model: ModelReference;
}
