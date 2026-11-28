import { useMemo, useState } from 'react';
import { Activity, ChevronRight, RotateCcw, TrendingUp } from 'lucide-react';
import { Link } from 'react-router';
import katex from 'katex';
import {
  derivativeCurve,
  discreteResponseIncrement,
  firstDerivative,
  responseCurve,
  responseTime,
  secondDerivative,
  tangentCurve,
  tangentLine,
} from '../../math';
import { mathModelConfig } from '../../config/model';
import { useSimulation } from '../../state/useSimulation';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { tangentWindow } from './derivativeWindow';
import { ExportButton } from '../exports/ExportButton';

type ChartMode = 'tangent' | 'first' | 'second';
const examples = [0, 25, 50, 65, 75, 90, 99] as const;
const format = (value: number, digits = 4) =>
  new Intl.NumberFormat('es-CR', { maximumFractionDigits: digits }).format(
    Math.abs(value - Math.round(value)) < 0.00001 ? Math.round(value) : value,
  );
function Formula({ expression, label }: { expression: string; label: string }) {
  return (
    <span
      aria-label={label}
      className="math-formula"
      dangerouslySetInnerHTML={{
        __html: katex.renderToString(expression, { throwOnError: false }),
      }}
    />
  );
}
function Metric({
  label,
  value,
  detail,
  tone = 'violet',
}: {
  label: string;
  value: string;
  detail: string;
  tone?: string;
}) {
  return (
    <Card className={`derivative-metric derivative-metric--${tone}`}>
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{detail}</span>
    </Card>
  );
}

export function DerivativesLab() {
  const { input } = useSimulation();
  const [users, setUsers] = useState(input.concurrentUsers);
  const [mode, setMode] = useState<ChartMode>('tangent');
  const c = mathModelConfig.response.referenceCapacityUsers;
  const k = mathModelConfig.response.growthCoefficientMs;
  const r = responseTime(users);
  const first = firstDerivative(users);
  const second = secondDerivative(users);
  const increment = discreteResponseIncrement(users);
  const tangent = tangentLine(users);
  const responseData = useMemo(() => {
    const { curveStart, curveEnd } = tangentWindow(users);
    const result = responseCurve(curveStart, curveEnd, 120);
    return result.ok ? result.value : [];
  }, [users]);
  const tangentData = useMemo(() => {
    const { tangentStart, tangentEnd } = tangentWindow(users);
    const result = tangentCurve(users, tangentStart, tangentEnd, 25);
    return result.ok
      ? result.value.map((point) => ({
          users: point.users,
          responseMs: point.responseMs,
          value: point.responseMs,
        }))
      : [];
  }, [users]);
  const firstData = useMemo(() => {
    const result = derivativeCurve(1, 0, 99, 120);
    return result.ok ? result.value : [];
  }, []);
  const secondData = useMemo(() => {
    const result = derivativeCurve(2, 0, 99, 120);
    return result.ok ? result.value : [];
  }, []);
  const rows = useMemo(
    () =>
      examples.map((n) => ({
        n,
        response: responseTime(n),
        first: firstDerivative(n),
        second: secondDerivative(n),
        increment: discreteResponseIncrement(n),
      })),
    [],
  );
  if (!r.ok || !first.ok || !second.ok || !tangent.ok)
    return <p role="alert">No fue posible calcular el análisis diferencial.</p>;
  const chart =
    mode === 'tangent'
      ? responseData.map((point) => ({ ...point, value: point.responseMs }))
      : (mode === 'first' ? firstData : secondData).map((point) => ({
          users: point.users,
          responseMs: point.value,
          value: point.value,
        }));
  const dataKey = mode === 'tangent' ? 'responseMs' : 'value';
  const title =
    mode === 'tangent'
      ? 'Función y recta tangente'
      : mode === 'first'
        ? 'Primera derivada'
        : 'Segunda derivada';
  const unit = mode === 'tangent' ? 'ms' : mode === 'first' ? 'ms/usuario' : 'ms/usuario²';
  const visibleFormula =
    mode === 'tangent'
      ? `y \\approx ${format(r.value, 3)} + ${format(first.value, 3)}(n-${users})`
      : mode === 'first'
        ? `R'(n) = \\frac{${k * c}}{(${c}-n)^2}`
        : `R''(n) = \\frac{${2 * k * c}}{(${c}-n)^3}`;

  return (
    <div className="derivatives-lab" aria-label="Laboratorio de derivadas">
      <header className="limits-lab__intro">
        <div>
          <p className="eyebrow">Cálculo diferencial · modelo provisional</p>
          <h1>Laboratorio de derivadas</h1>
          <p>
            Analiza la sensibilidad del tiempo de respuesta hipotético ante cambios en la carga
            concurrente.
          </p>
        </div>
        <div className="limits-lab__nav">
          <Link to="/">Ir al Dashboard</Link>
          <Link to="/limites">
            Volver a Límites <ChevronRight aria-hidden="true" size={16} />
          </Link>
        </div>
      </header>
      <section className="derivatives-grid derivatives-grid--intro">
        <Card className="formula-card">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Modelo de respuesta</p>
              <h2>Función original</h2>
            </div>
            <Activity aria-hidden="true" />
          </div>
          <Formula
            expression={`R(n) = ${mathModelConfig.response.baseResponseMs} + \\frac{${k}n}{${c}-n}`}
            label="función de tiempo de respuesta"
          />
          <p>
            Dominio continuo: 0 ≤ n &lt; {c}. Los controles del laboratorio utilizan n entero para
            comparar también el incremento discreto.
          </p>
        </Card>
        <Card className="analysis-control">
          <p className="eyebrow">Punto de análisis</p>
          <h2>n = {users} usuarios</h2>
          <label htmlFor="derivative-users">Usuarios concurrentes</label>
          <input
            id="derivative-users"
            aria-label="Usuarios del punto de análisis"
            type="range"
            min="0"
            max="99"
            step="1"
            value={users}
            onChange={(e) => setUsers(Number(e.target.value))}
          />
          <div>
            <span>{users} usuarios</span>
            <Button variant="secondary" onClick={() => setUsers(input.concurrentUsers)}>
              <RotateCcw aria-hidden="true" size={16} /> Reiniciar análisis
            </Button>
          </div>
          <p>
            Valor inicial tomado del Dashboard; cambiarlo aquí no modifica la simulación compartida.
          </p>
        </Card>
      </section>
      <section className="derivative-metrics" aria-label="Indicadores diferenciales">
        <Metric
          label="Tiempo de respuesta"
          value={`${format(r.value, 6)} ms`}
          detail="R(n) en el punto seleccionado"
          tone="cyan"
        />
        <Metric
          label="Primera derivada"
          value={`${format(first.value, 6)} ms/usuario`}
          detail="Tasa instantánea del modelo continuo"
        />
        <Metric
          label="Segunda derivada"
          value={`${format(second.value, 6)} ms/usuario²`}
          detail="Crecimiento de la tasa instantánea"
          tone="green"
        />
        <Metric
          label="Incremento discreto"
          value={increment.ok ? `${format(increment.value, 6)} ms` : 'No definido'}
          detail={increment.ok ? 'R(n + 1) − R(n)' : 'n + 1 está fuera del dominio'}
          tone="amber"
        />
      </section>
      <section className="derivatives-grid derivatives-grid--chart">
        <Card className="derivative-chart-card">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">
                Figura D-{mode === 'tangent' ? '01' : mode === 'first' ? '02' : '03'}
              </p>
              <h2>{title}</h2>
            </div>
            <div className="segmented" role="radiogroup" aria-label="Representación gráfica">
              <button
                role="radio"
                aria-checked={mode === 'tangent'}
                className={mode === 'tangent' ? 'selected' : ''}
                onClick={() => setMode('tangent')}
              >
                Función y tangente
              </button>
              <button
                role="radio"
                aria-checked={mode === 'first'}
                className={mode === 'first' ? 'selected' : ''}
                onClick={() => setMode('first')}
              >
                R′(n)
              </button>
              <button
                role="radio"
                aria-checked={mode === 'second'}
                className={mode === 'second' ? 'selected' : ''}
                onClick={() => setMode('second')}
              >
                R″(n)
              </button>
            </div>
          </div>
          <div className="derivative-chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chart} margin={{ top: 14, right: 20, left: 8, bottom: 8 }}>
                <CartesianGrid stroke="rgba(148,163,184,.18)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="users"
                  type="number"
                  domain={[0, 100]}
                  label={{
                    value: 'Usuarios concurrentes (n)',
                    position: 'insideBottom',
                    offset: -2,
                    fill: '#c8d5eb',
                  }}
                />
                <YAxis
                  dataKey={dataKey}
                  scale={mode === 'tangent' ? 'auto' : 'log'}
                  domain={['auto', 'auto']}
                  width={80}
                  tickFormatter={(v) => `${format(Number(v), 0)}`}
                  label={{ value: unit, angle: -90, position: 'insideLeft', fill: '#c8d5eb' }}
                />
                <Tooltip
                  formatter={(v) => `${format(Number(v), 6)} ${unit}`}
                  labelFormatter={(v) => `n = ${v}`}
                  contentStyle={{
                    background: '#162134',
                    border: '1px solid #334155',
                    borderRadius: 10,
                  }}
                />
                <Legend />
                <ReferenceLine x={users} stroke="#f59e0b" strokeDasharray="5 4" />
                {mode === 'tangent' && (
                  <>
                    <Line
                      data={tangentData}
                      dataKey="responseMs"
                      name="Recta tangente"
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      dot={false}
                      type="linear"
                      isAnimationActive={false}
                    />
                    <ReferenceLine y={r.value} stroke="#f59e0b" strokeDasharray="2 4" />
                  </>
                )}
                <Line
                  dataKey={dataKey}
                  name={mode === 'tangent' ? 'R(n)' : mode === 'first' ? 'R′(n)' : 'R″(n)'}
                  stroke={mode === 'tangent' ? '#38bdf8' : '#8b5cf6'}
                  strokeWidth={3}
                  dot={false}
                  type="linear"
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="chart-note">
            {mode === 'tangent'
              ? 'La recta ámbar coincide con R(n) en el punto seleccionado y sólo aproxima la curva localmente.'
              : mode === 'first'
                ? 'Escala logarítmica: R′(n) es positiva y aumenta al acercarse a la capacidad.'
                : 'Escala logarítmica: R″(n) es positiva; R(n) es convexa en todo el dominio.'}
          </p>
          <ExportButton
            figureId={
              mode === 'tangent'
                ? 'derivatives-tangent'
                : mode === 'first'
                  ? 'derivatives-first'
                  : 'derivatives-second'
            }
            values={mode === 'tangent' ? { users } : { users, scale: 'log' }}
            label="Exportar gráfica principal"
          />
        </Card>
        <Card className="tangent-card">
          <p className="eyebrow">Recta tangente</p>
          <h2>Aproximación local</h2>
          <Formula expression={visibleFormula} label="ecuación de la recta tangente aproximada" />
          <p>
            La pendiente es R′({users}) = <strong>{format(first.value, 6)} ms/usuario</strong>. La
            ecuación visible está redondeada sólo para lectura; el gráfico usa la utilidad exacta
            del motor.
          </p>
          <div className="discrete-comparison">
            <TrendingUp aria-hidden="true" />
            <div>
              <strong>Derivada e incremento no son lo mismo</strong>
              <span>
                R′({users}) = {format(first.value, 6)} ms/usuario
              </span>
              <span>
                R′({users}) × 1 usuario = {format(first.value, 6)} ms (aproximación diferencial)
              </span>
              <span>
                ΔR({users}) ={' '}
                {increment.ok
                  ? `${format(increment.value, 6)} ms`
                  : 'no definido dentro del dominio'}
              </span>
              {increment.ok && (
                <span>Diferencia: {format(increment.value - first.value, 6)} ms</span>
              )}
            </div>
          </div>
        </Card>
      </section>
      <section className="derivatives-grid derivatives-grid--learning">
        <Card className="table-card">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Comparación calculada</p>
              <h2>Tabla de cargas</h2>
            </div>
          </div>
          <div className="table-scroll">
            <table>
              <caption>Seleccione una carga para actualizar el punto de análisis.</caption>
              <thead>
                <tr>
                  <th>n</th>
                  <th>R(n)</th>
                  <th>R′(n)</th>
                  <th>R″(n)</th>
                  <th>ΔR(n)</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.n} className={row.n === users ? 'is-selected' : ''}>
                    <td>
                      <button
                        aria-label={`Seleccionar ${row.n} usuarios`}
                        onClick={() => setUsers(row.n)}
                      >
                        {row.n}
                      </button>
                    </td>
                    <td>{row.response.ok ? `${format(row.response.value, 4)} ms` : '—'}</td>
                    <td>{row.first.ok ? format(row.first.value, 4) : '—'}</td>
                    <td>{row.second.ok ? format(row.second.value, 4) : '—'}</td>
                    <td>{row.increment.ok ? format(row.increment.value, 4) : 'No definido'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card className="procedure-card">
          <p className="eyebrow">Aplicaciones académicas</p>
          <h2>Derivación y convexidad</h2>
          <Formula
            expression={`R'(n)=\\frac{${k}(${c})}{(${c}-n)^2}=\\frac{${k * c}}{(${c}-n)^2}`}
            label="primera derivada"
          />
          <ol>
            <li>La derivada de la constante es cero.</li>
            <li>La regla del cociente simplifica el numerador a {k * c}.</li>
            <li>
              R′({users}) = {format(first.value, 6)} ms/usuario expresa sensibilidad instantánea.
            </li>
          </ol>
          <Formula
            expression={`R''(n)=\\frac{${2 * k * c}}{(${c}-n)^3}`}
            label="segunda derivada"
          />
          <ol>
            <li>Reescribimos R′(n) con exponente negativo y aplicamos regla de la cadena.</li>
            <li>
              R″({users}) = {format(second.value, 6)} ms/usuario².
            </li>
            <li>
              Como R″(n) &gt; 0, la tasa aumenta y la función es convexa; no existe punto de
              inflexión.
            </li>
          </ol>
        </Card>
      </section>
      <Card className="model-note">
        <strong>Interpretación profesional:</strong> el cálculo diferencial ayuda a comparar
        sensibilidad y deterioro acelerado antes de la capacidad de referencia. Es un modelo
        educativo hipotético, no una medición de infraestructura real.
      </Card>
    </div>
  );
}
