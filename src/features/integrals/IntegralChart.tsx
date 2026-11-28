import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { mathModelConfig } from '../../config/model';
import { formatters, transferRate } from '../../math';
import type { IntegralFigure } from './integralFigures';
import { formatExact } from './integralTex';

const axisColor = '#c8d5eb';
const limitColor = '#f59e0b';
const tickStyle = { fill: '#a7b7cf', fontSize: 12 };
const tickStep = 5;
/** Separación mínima (s) para colocar las etiquetas de a y b a la misma altura. */
const labelSeparation = 9;
/** Distancia sobre el área de trazado para no chocar con la marca superior del eje Y. */
const labelOffset = 14;

export function IntegralChart({ figure }: { figure: IntegralFigure }) {
  const { startSeconds: a, endSeconds: b } = figure.interval;
  const maximum = mathModelConfig.transfer.maximumTimeSeconds;
  const ticks = Array.from({ length: Math.floor(maximum / tickStep) + 1 }, (_, i) => i * tickStep);
  const isRate = figure.kind === 'rate';
  const peakRate = transferRate(maximum);
  const rateCeiling = peakRate.ok ? Math.ceil(peakRate.value) + 1 : 0;
  const atA = figure.data.find((point) => point.seconds === a);
  const atB = figure.data.find((point) => point.seconds === b);
  const zeroInterval = a === b;
  const closeLimits = b - a < labelSeparation;
  const format = isRate ? formatters.megabytesPerSecond : formatters.megabytes;

  return (
    <div className="integral-chart">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={figure.data} margin={{ top: 38, right: 34, left: 4, bottom: 18 }}>
          <CartesianGrid stroke="rgba(148,163,184,.18)" strokeDasharray="3 3" />
          <XAxis
            dataKey="seconds"
            type="number"
            domain={[0, maximum]}
            ticks={ticks}
            tick={tickStyle}
            tickFormatter={(value) => formatExact(Number(value))}
            label={{
              value: `${figure.xAxis.label} · ${figure.xAxis.unit}`,
              position: 'insideBottom',
              offset: -12,
              fill: axisColor,
            }}
          />
          <YAxis
            type="number"
            domain={isRate ? [0, rateCeiling] : [0, 'auto']}
            width={58}
            tick={tickStyle}
            tickFormatter={(value) => formatExact(Number(value))}
            label={{
              value: `${figure.yAxis.label} (${figure.yAxis.unit})`,
              angle: -90,
              position: 'insideLeft',
              style: { textAnchor: 'middle' },
              fill: axisColor,
            }}
          />
          <Tooltip
            formatter={(value) => format(Number(value))}
            labelFormatter={(value) => {
              const seconds = Number(value);
              const inside = !zeroInterval && seconds >= a && seconds <= b;
              return `t = ${formatters.seconds(seconds)}${inside ? ' · dentro de [a,b]' : ''}`;
            }}
            contentStyle={{ background: '#162134', border: '1px solid #334155', borderRadius: 10 }}
          />
          {isRate && !zeroInterval && (
            <Area
              className="integral-area"
              dataKey="selectedRateMBps"
              name="Área de integración"
              type="linear"
              baseValue={0}
              stroke="none"
              fill="#22c55e"
              fillOpacity={0.34}
              activeDot={false}
              tooltipType="none"
              isAnimationActive={false}
            />
          )}
          <Line
            dataKey={isRate ? 'rateMBps' : 'accumulatedMB'}
            name={isRate ? 'T(t)' : 'A(t)'}
            type="linear"
            stroke={isRate ? '#22c55e' : '#38bdf8'}
            strokeWidth={isRate ? 3 : 2}
            dot={false}
            isAnimationActive={false}
          />
          {!isRate && (
            <Line
              dataKey="selectedAccumulatedMB"
              name="Tramo seleccionado"
              type="linear"
              stroke="#22c55e"
              strokeWidth={6}
              dot={false}
              activeDot={false}
              tooltipType="none"
              isAnimationActive={false}
            />
          )}
          {!isRate && atA && atB && (
            <>
              <ReferenceLine
                y={atA.accumulatedMB}
                stroke="#94a3b8"
                strokeDasharray="2 4"
                strokeWidth={1}
              />
              <ReferenceLine
                y={atB.accumulatedMB}
                stroke="#94a3b8"
                strokeDasharray="2 4"
                strokeWidth={1}
              />
              {!zeroInterval && (
                <ReferenceLine
                  className="integral-difference"
                  segment={[
                    { x: b, y: atA.accumulatedMB },
                    { x: b, y: atB.accumulatedMB },
                  ]}
                  stroke="#8b5cf6"
                  strokeWidth={4}
                  strokeDasharray="7 3"
                />
              )}
            </>
          )}
          <ReferenceLine
            className="integral-limit integral-limit--a"
            x={a}
            stroke={limitColor}
            strokeDasharray="5 4"
            label={{
              value: zeroInterval
                ? `a = b = ${formatters.seconds(a)}`
                : `a = ${formatters.seconds(a)}`,
              position: 'top',
              offset: labelOffset,
              fill: '#fcd34d',
              fontSize: 12,
            }}
          />
          <ReferenceLine
            className="integral-limit integral-limit--b"
            x={b}
            stroke={limitColor}
            strokeDasharray="5 4"
            label={
              zeroInterval
                ? undefined
                : {
                    value: `b = ${formatters.seconds(b)}`,
                    // Si los límites están muy juntos, la etiqueta de b baja dentro del área.
                    position: closeLimits ? 'insideTop' : 'top',
                    offset: closeLimits ? 6 : labelOffset,
                    fill: '#fcd34d',
                    fontSize: 12,
                  }
            }
          />
          {!isRate && atA && atB && (
            <>
              <ReferenceDot
                className="integral-point"
                x={a}
                y={atA.accumulatedMB}
                r={6}
                fill="#0b1220"
                stroke="#f1f5f9"
                strokeWidth={2.5}
              />
              <ReferenceDot
                className="integral-point"
                x={b}
                y={atB.accumulatedMB}
                r={6}
                fill="#f1f5f9"
                stroke="#0b1220"
                strokeWidth={2}
              />
            </>
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
