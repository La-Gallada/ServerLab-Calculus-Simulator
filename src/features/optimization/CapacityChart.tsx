import {
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { mathModelConfig } from '../../config/model';
import { formatters } from '../../math';
import { axisColor, gridColor, tickStyle, tooltipStyle } from './chartTheme';
import { HatchPattern } from './chartMarks';
import { formatNumber } from './optimizationFormat';
import type { CapacityFigure } from './optimizationFigures';

export function CapacityChart({ figure }: { figure: CapacityFigure }) {
  const { baseResponseMs: base, referenceCapacityUsers: capacity } = mathModelConfig.response;
  const { thresholdMs } = figure.parameters;
  const [start, end] = figure.domainMs;
  const inView = thresholdMs >= start;
  const solution = figure.solution;
  // Cerca de los bordes la etiqueta se escribe hacia el interior del gráfico.
  const share = (thresholdMs - start) / (end - start);
  const labelPosition = share > 0.85 ? 'insideTopRight' : share < 0.15 ? 'insideTopLeft' : 'top';

  return (
    <div className="opt-chart opt-chart--capacity">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart margin={{ top: 28, right: 26, left: 14, bottom: 18 }}>
          <HatchPattern id="opt-hatch-capacity" />
          <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
          <XAxis
            dataKey="thresholdMs"
            type="number"
            domain={[start, end]}
            ticks={[start, ...[0.25, 0.5, 0.75, 1].map((fraction) => fraction * end)]}
            allowDuplicatedCategory={false}
            tick={tickStyle}
            tickFormatter={(value) => formatNumber(Number(value), 0)}
            label={{
              value: `${figure.xAxis.label} · ${figure.xAxis.unit}`,
              position: 'insideBottom',
              offset: -12,
              fill: axisColor,
            }}
          />
          <YAxis
            type="number"
            domain={[0, capacity]}
            width={58}
            tick={tickStyle}
            label={{
              value: figure.yAxis.label,
              angle: -90,
              position: 'insideLeft',
              style: { textAnchor: 'middle' },
              fill: axisColor,
            }}
          />
          <ReferenceArea
            className="opt-region opt-region--no-solution"
            x1={start}
            x2={base}
            fill="url(#opt-hatch-capacity)"
            fillOpacity={1}
          />
          <Tooltip
            formatter={(value) => `${formatNumber(Number(value), 2)} usuarios`}
            labelFormatter={(value) => `L = ${formatters.milliseconds(Number(value))}`}
            contentStyle={tooltipStyle}
          />
          <Line
            data={figure.continuous}
            dataKey="continuousUsers"
            name="Frontera continua"
            type="linear"
            stroke="#38bdf8"
            strokeWidth={1.5}
            strokeDasharray="6 4"
            dot={false}
            isAnimationActive={false}
          />
          <Line
            className="opt-steps"
            data={figure.steps}
            dataKey="maximumUsers"
            name="Máximo entero"
            type="stepAfter"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          {inView && (
            <ReferenceLine
              x={thresholdMs}
              stroke="#fcd34d"
              strokeDasharray="8 4"
              label={{
                value: `L = ${formatters.milliseconds(thresholdMs)}`,
                position: labelPosition,
                fill: '#fcd34d',
                fontSize: 12,
              }}
            />
          )}
          {inView && solution.kind === 'feasible' && (
            <ReferenceDot
              className="opt-capacity-selected"
              x={thresholdMs}
              y={solution.maximumIntegerUsers}
              r={6}
              fill="#22c55e"
              stroke="#f1f5f9"
              strokeWidth={2}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
