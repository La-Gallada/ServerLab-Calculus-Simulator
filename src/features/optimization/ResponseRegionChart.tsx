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
import { HatchPattern, PointShape } from './chartMarks';
import { formatNumber } from './optimizationFormat';
import type { ResponseFigure } from './optimizationFigures';

/** Anchura mínima (en usuarios) para rotular una región dentro del gráfico. */
const labelWidth = 22;

export function ResponseRegionChart({
  figure,
  ceiling,
}: {
  figure: ResponseFigure;
  ceiling: number;
}) {
  const capacity = mathModelConfig.response.referenceCapacityUsers;
  const { thresholdMs } = figure.parameters;
  const { feasible, infeasible } = figure.regions;
  const frontier = feasible?.[1] ?? null;
  const nearCapacity = frontier !== null && frontier > capacity - 20;

  // Junto al eje Y la etiqueta de n* se escribe dentro del gráfico.
  const nearAxis = frontier !== null && frontier < 10;

  return (
    <div className="opt-chart">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={figure.data} margin={{ top: 46, right: 26, left: 14, bottom: 18 }}>
          <HatchPattern id="opt-hatch-response" />
          <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
          <XAxis
            dataKey="users"
            type="number"
            domain={[0, capacity]}
            ticks={[0, 0.25, 0.5, 0.75, 1].map((fraction) => fraction * capacity)}
            tick={tickStyle}
            label={{
              value: figure.xAxis.label,
              position: 'insideBottom',
              offset: -12,
              fill: axisColor,
            }}
          />
          <YAxis
            type="number"
            domain={[0, ceiling]}
            allowDataOverflow
            width={66}
            tick={tickStyle}
            tickFormatter={(value) => formatNumber(Number(value), 0)}
            label={{
              value: `${figure.yAxis.label} (${figure.yAxis.unit})`,
              angle: -90,
              position: 'insideLeft',
              style: { textAnchor: 'middle' },
              fill: axisColor,
            }}
          />
          {feasible && feasible[1] > feasible[0] && (
            <ReferenceArea
              className="opt-region opt-region--feasible"
              x1={feasible[0]}
              x2={feasible[1]}
              fill="#22c55e"
              fillOpacity={0.16}
              label={
                feasible[1] - feasible[0] >= labelWidth
                  ? { value: 'Factible', position: 'insideTop', fill: '#86efac', fontSize: 12 }
                  : undefined
              }
            />
          )}
          <ReferenceArea
            className="opt-region opt-region--infeasible"
            x1={infeasible[0]}
            x2={infeasible[1]}
            fill="url(#opt-hatch-response)"
            fillOpacity={1}
            label={
              infeasible[1] - infeasible[0] >= labelWidth
                ? {
                    value: 'No factible',
                    position: 'insideTopRight',
                    fill: '#fca5a5',
                    fontSize: 12,
                  }
                : undefined
            }
          />
          <Tooltip
            formatter={(value) => formatters.milliseconds(Number(value))}
            labelFormatter={(value) => {
              const count = Number(value);
              const meets = frontier !== null && count <= frontier;
              return `n = ${formatNumber(count, 2)} · ${meets ? 'factible' : 'no factible'}`;
            }}
            contentStyle={tooltipStyle}
          />
          <Line
            dataKey="responseMs"
            name="R(n)"
            type="linear"
            stroke="#38bdf8"
            strokeWidth={3}
            dot={false}
            isAnimationActive={false}
          />
          <ReferenceLine
            className="opt-threshold"
            y={thresholdMs}
            stroke="#f59e0b"
            strokeDasharray="8 4"
            strokeWidth={2}
            label={{
              value: `L = ${formatters.milliseconds(thresholdMs)}`,
              position: 'insideTopLeft',
              fill: '#fcd34d',
              fontSize: 12,
            }}
          />
          <ReferenceLine
            className="opt-capacity"
            x={capacity}
            stroke="#ef4444"
            strokeWidth={2}
            label={{
              value: `C = ${capacity}`,
              position: 'top',
              offset: nearCapacity ? 27 : 8,
              fill: '#fca5a5',
              fontSize: 12,
            }}
          />
          {frontier !== null && (
            <ReferenceLine
              className="opt-frontier"
              x={frontier}
              stroke="#fcd34d"
              strokeDasharray="2 4"
              strokeWidth={1.5}
              label={{
                value: `n* = ${formatNumber(frontier, 2)}`,
                position: nearAxis ? 'insideTopLeft' : 'top',
                offset: 8,
                fill: '#fcd34d',
                fontSize: 12,
              }}
            />
          )}
          {figure.points.map((point) => (
            <ReferenceDot
              key={point.role}
              x={point.users}
              y={point.responseMs}
              ifOverflow="hidden"
              shape={(props: { cx?: number; cy?: number }) =>
                point.responseMs > ceiling ? (
                  <g />
                ) : (
                  <PointShape role={point.role} cx={props.cx} cy={props.cy} />
                )
              }
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
