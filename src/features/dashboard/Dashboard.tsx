import { useMemo, useState } from 'react';
import {
  Activity,
  Database,
  Gauge,
  RotateCcw,
  SlidersHorizontal,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Link } from 'react-router';
import {
  derivativeCurve,
  formatters,
  optimizeResponseThreshold,
  responseCurve,
  simulationSnapshot,
  transferCurve,
} from '../../math';
import { mathModelConfig } from '../../config/model';
import { useSimulation } from '../../state/useSimulation';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  Area,
  AreaChart,
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

type ViewMode = 'focus' | 'full';

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  tone = 'cyan',
}: {
  icon: typeof Users;
  label: string;
  value: string;
  detail: string;
  tone?: 'cyan' | 'violet' | 'green' | 'amber';
}) {
  return (
    <Card className={`metric-card metric-card--${tone}`}>
      <Icon aria-hidden="true" />
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <span>{detail}</span>
      </div>
    </Card>
  );
}

export function Dashboard() {
  const { input, update, reset } = useSimulation();
  const [view, setView] = useState<ViewMode>('focus');
  const snapshotResult = simulationSnapshot(input);
  const snapshot = snapshotResult.ok ? snapshotResult.value : null;
  const optimization = optimizeResponseThreshold(input.thresholdMs);
  const maxUsers = optimization.kind === 'feasible' ? optimization.maximumIntegerUsers : 0;
  const responseSeries = useMemo(() => {
    const result = responseCurve(0, view === 'focus' ? 80 : 99, view === 'focus' ? 81 : 100);
    return result.ok ? result.value : [];
  }, [view]);
  const derivativeSeries = useMemo(() => {
    const result = derivativeCurve(1, 0, 99, 100);
    return result.ok ? result.value : [];
  }, []);
  const transferSeries = useMemo(() => {
    const result = transferCurve(
      0,
      input.transferTimeSeconds,
      Math.max(2, Math.round(input.transferTimeSeconds) + 1),
    );
    return result.ok ? result.value : [];
  }, [input.transferTimeSeconds]);
  if (!snapshot)
    return <p role="alert">No fue posible calcular la simulación con las entradas actuales.</p>;
  const withinObjective = snapshot.meetsResponseObjective;
  const capacityPercent =
    (input.concurrentUsers / mathModelConfig.response.referenceCapacityUsers) * 100;
  const userMargin = maxUsers - input.concurrentUsers;

  return (
    <div className="dashboard" aria-label="Dashboard de rendimiento simulado">
      <header className="dashboard__intro">
        <div>
          <p className="eyebrow">Simulación educativa · modelo provisional</p>
          <h1>Dashboard de rendimiento</h1>
          <p>
            Visualiza cómo la carga hipotética modifica el tiempo de respuesta y la transferencia de
            datos.
          </p>
        </div>
        <div className="dashboard__actions">
          <Badge tone={withinObjective ? 'green' : 'amber'}>
            {withinObjective ? 'Dentro del objetivo' : 'Umbral excedido'}
          </Badge>
          <Button onClick={reset} variant="secondary">
            <RotateCcw aria-hidden="true" size={18} /> Reiniciar
          </Button>
        </div>
      </header>

      <section className="metrics-grid" aria-label="Indicadores principales">
        <MetricCard
          icon={Users}
          label="Usuarios concurrentes"
          value={formatters.users(input.concurrentUsers)}
          detail={`${capacityPercent.toFixed(0)}% de la capacidad de referencia`}
        />
        <MetricCard
          icon={Activity}
          label="Tiempo de respuesta"
          value={formatters.milliseconds(snapshot.responseMs)}
          detail={
            withinObjective ? 'Cumple el umbral seleccionado' : 'Supera el umbral seleccionado'
          }
          tone={withinObjective ? 'violet' : 'amber'}
        />
        <MetricCard
          icon={TrendingUp}
          label="Tasa de cambio"
          value={formatters.millisecondsPerUser(snapshot.firstDerivativeMsPerUser)}
          detail="Tasa instantánea del modelo continuo"
          tone="green"
        />
        <MetricCard
          icon={Database}
          label="Datos transferidos"
          value={formatters.megabytes(snapshot.transferredDataMB)}
          detail={`Acumulados en ${formatters.seconds(input.transferTimeSeconds)}`}
          tone="amber"
        />
      </section>

      <section className="dashboard-grid dashboard-grid--main">
        <Card className="chart-card chart-card--response">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">R(n) · ms</p>
              <h2>Rendimiento del servidor</h2>
            </div>
            <div className="segmented" aria-label="Escala de respuesta">
              <button
                className={view === 'focus' ? 'selected' : ''}
                onClick={() => setView('focus')}
              >
                Carga habitual
              </button>
              <button className={view === 'full' ? 'selected' : ''} onClick={() => setView('full')}>
                Dominio operativo
              </button>
            </div>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={responseSeries} margin={{ top: 14, right: 18, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.18)" />
                <XAxis
                  dataKey="users"
                  type="number"
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}`}
                  label={{
                    value: 'Usuarios concurrentes',
                    position: 'insideBottom',
                    offset: -2,
                    fill: '#c8d5eb',
                  }}
                />
                <YAxis
                  dataKey="responseMs"
                  width={72}
                  tickFormatter={(value) => `${Math.round(value)} ms`}
                  label={{
                    value: 'Tiempo de respuesta',
                    angle: -90,
                    position: 'insideLeft',
                    fill: '#c8d5eb',
                  }}
                />
                <Tooltip
                  formatter={(value) => formatters.milliseconds(Number(value))}
                  labelFormatter={(label) => `${label} usuarios`}
                  contentStyle={{
                    background: '#162134',
                    border: '1px solid #334155',
                    borderRadius: 10,
                  }}
                />
                <Legend />
                <ReferenceLine
                  y={input.thresholdMs}
                  stroke="#f59e0b"
                  strokeDasharray="7 5"
                  name="Umbral"
                />
                <ReferenceLine
                  x={maxUsers}
                  stroke="#22c55e"
                  strokeDasharray="5 5"
                  name="Máximo entero"
                />
                <ReferenceLine x={100} stroke="#ef4444" strokeDasharray="3 3" label="C=100" />
                <Line
                  type="monotone"
                  dataKey="responseMs"
                  name="Tiempo de respuesta"
                  stroke="#38bdf8"
                  strokeWidth={3}
                  dot={false}
                  isAnimationActive={false}
                />
                <ReferenceLine x={input.concurrentUsers} stroke="#8b5cf6" />
                <ReferenceLine y={snapshot.responseMs} stroke="#8b5cf6" strokeDasharray="2 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="chart-note">
            La línea roja indica la capacidad de referencia y no representa un punto evaluado de la
            función.
          </p>
        </Card>

        <Card className="controls-card">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Parámetros</p>
              <h2>Controles de simulación</h2>
            </div>
            <SlidersHorizontal aria-hidden="true" />
          </div>
          <label>
            Usuarios concurrentes <output>{input.concurrentUsers}</output>
            <input
              aria-label="Usuarios concurrentes"
              type="range"
              min="0"
              max="99"
              step="1"
              value={input.concurrentUsers}
              onChange={(event) => update({ concurrentUsers: Number(event.target.value) })}
            />
          </label>
          <label>
            Duración de transferencia{' '}
            <output>{formatters.seconds(input.transferTimeSeconds)}</output>
            <input
              aria-label="Duración de transferencia"
              type="range"
              min="0"
              max="30"
              step="1"
              value={input.transferTimeSeconds}
              onChange={(event) =>
                update({
                  transferTimeSeconds: Number(event.target.value),
                  integrationEndSeconds: Number(event.target.value),
                })
              }
            />
          </label>
          <fieldset>
            <legend>Tiempo máximo permitido</legend>
            <div className="thresholds">
              {mathModelConfig.controls.responseThresholdsMs.map((threshold) => (
                <button
                  key={threshold}
                  className={input.thresholdMs === threshold ? 'selected' : ''}
                  onClick={() => update({ thresholdMs: threshold })}
                >
                  {threshold} ms
                </button>
              ))}
            </div>
          </fieldset>
          <div className={`objective-status ${withinObjective ? 'is-good' : 'is-warning'}`}>
            <Gauge aria-hidden="true" />
            <div>
              <strong>{withinObjective ? 'Dentro del objetivo' : 'Umbral excedido'}</strong>
              <span>Máximo permitido: {formatters.users(maxUsers)}</span>
            </div>
          </div>
        </Card>
      </section>

      <section className="dashboard-grid dashboard-grid--summary">
        <Card className="chart-card">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">R′(n) · ms/usuario</p>
              <h2>Tasa de cambio</h2>
            </div>
            <Link to="/derivadas">Ver Derivadas</Link>
          </div>
          <div className="mini-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={derivativeSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.14)" />
                <XAxis dataKey="users" />
                <YAxis tickFormatter={(value) => `${Math.round(value)}`} width={45} />
                <Tooltip formatter={(value) => formatters.millisecondsPerUser(Number(value))} />
                <Area
                  type="monotone"
                  dataKey="value"
                  name="R′(n)"
                  stroke="#8b5cf6"
                  fill="rgba(139,92,246,.32)"
                  isAnimationActive={false}
                />
                <ReferenceLine x={input.concurrentUsers} stroke="#38bdf8" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p>La derivada expresa la tasa instantánea de crecimiento en la extensión continua.</p>
        </Card>
        <Card className="chart-card">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">T(t) · MB/s</p>
              <h2>Transferencia de datos</h2>
            </div>
            <Link to="/integrales">Ver Integrales</Link>
          </div>
          <div className="mini-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={transferSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.14)" />
                <XAxis dataKey="seconds" />
                <YAxis tickFormatter={(value) => `${value}`} width={40} />
                <Tooltip
                  formatter={(value) => formatters.megabytesPerSecond(Number(value))}
                  labelFormatter={(value) => `${value} s`}
                />
                <Area
                  type="monotone"
                  dataKey="rateMBps"
                  name="Tasa"
                  stroke="#22c55e"
                  fill="rgba(34,197,94,.28)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p>
            El área bajo la tasa desde 0 hasta {formatters.seconds(input.transferTimeSeconds)}{' '}
            acumula <strong>{formatters.megabytes(snapshot.transferredDataMB)}</strong>.
          </p>
        </Card>
        <Card className="optimization-card">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">R(n) ≤ {formatters.milliseconds(input.thresholdMs)}</p>
              <h2>Optimización</h2>
            </div>
            <Link to="/optimizacion">Ver Optimización</Link>
          </div>
          <div className="optimization-number">
            <strong>{formatters.users(maxUsers)}</strong>
            <span>máximo para el umbral</span>
          </div>
          <div
            className="load-bar"
            aria-label={`Carga actual ${input.concurrentUsers} de máximo ${maxUsers}`}
          >
            <span
              style={{
                width: `${Math.min(100, maxUsers === 0 ? 100 : (input.concurrentUsers / maxUsers) * 100)}%`,
              }}
            />
          </div>
          <p>
            {withinObjective
              ? `La carga actual conserva ${formatters.users(Math.max(0, userMargin))} de margen respecto al objetivo.`
              : `La carga actual excede el objetivo por ${formatters.users(Math.abs(userMargin))}.`}
          </p>
          <div className="optimization-footer">
            <Badge tone={withinObjective ? 'green' : 'amber'}>
              {withinObjective ? 'Objetivo cumplido' : 'Revisar umbral'}
            </Badge>
            <span>Modelo hipotético</span>
          </div>
        </Card>
      </section>

      <Card className="model-note">
        <strong>Supuesto académico:</strong> {mathModelConfig.assumptions}
      </Card>
    </div>
  );
}
