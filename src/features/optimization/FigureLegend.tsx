import type { OptimizationLegendItem } from './optimizationFigures';

export function FigureLegend({ items }: { items: OptimizationLegendItem[] }) {
  return (
    <ul className="opt-legend" aria-label="Leyenda">
      {items.map((item) => (
        <li key={item.label}>
          <span aria-hidden="true" className={`opt-marker opt-marker--${item.marker}`} />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
