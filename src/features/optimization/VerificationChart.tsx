import {
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import { axisColor, gridColor, niceCeiling, tickStyle } from './chartTheme';
import { PointShape } from './chartMarks';
import { formatNumber } from './optimizationFormat';
import type { VerificationFigure } from './optimizationFigures';

export function VerificationChart({ figure }: { figure: VerificationFigure }) {
  const { thresholdMs } = figure.parameters;
  const values = [...figure.data.map((point) => point.responseMs), thresholdMs];
  const low = Math.min(...values);
  const high = Math.max(...values);
  // Marcas redondas para la ampliación local.
  const step = niceCeiling((high - low) / 4);
  const bottom = Math.floor(low / step) * step;
  const intervals = Math.ceil((high - bottom) / step);
  const yTicks = Array.from({ length: intervals + 1 }, (_, index) => bottom + step * index);
  const first = figure.data[0].users;
  const last = figure.data[figure.data.length - 1].users;

  return (
    <div className="opt-chart opt-chart--small">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={figure.data} margin={{ top: 12, right: 18, left: 14, bottom: 18 }}>
          <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
          <XAxis
            dataKey="users"
            type="number"
            domain={[first, last]}
            ticks={figure.integers.map((point) => point.users)}
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
            domain={[bottom, yTicks[yTicks.length - 1]]}
            ticks={yTicks}
            width={66}
            tick={tickStyle}
            tickFormatter={(value) => formatNumber(Number(value), 0)}
            label={{
              value: `R(n) (${figure.yAxis.unit})`,
              angle: -90,
              position: 'insideLeft',
              style: { textAnchor: 'middle' },
              fill: axisColor,
            }}
          />
          <Line
            dataKey="responseMs"
            name="R(n)"
            type="linear"
            stroke="#38bdf8"
            strokeWidth={2.5}
            dot={false}
            isAnimationActive={false}
          />
          <ReferenceLine y={thresholdMs} stroke="#f59e0b" strokeDasharray="8 4" strokeWidth={2} />
          {figure.integers.map((point) => (
            <ReferenceDot
              key={point.users}
              x={point.users}
              y={point.responseMs}
              r={2.5}
              fill="#38bdf8"
              stroke="none"
            />
          ))}
          {figure.points.map((point) => (
            <ReferenceDot
              key={point.role}
              x={point.users}
              y={point.responseMs}
              shape={(props: { cx?: number; cy?: number }) => (
                <PointShape role={point.role} cx={props.cx} cy={props.cy} />
              )}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
