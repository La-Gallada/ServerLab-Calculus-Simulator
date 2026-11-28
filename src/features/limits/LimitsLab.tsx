import { useMemo, useState } from 'react';
import { BookOpen, ChevronRight, Infinity as InfinityIcon, ServerCog } from 'lucide-react';
import { Link } from 'react-router';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import {
  limitAtCapacityFromLeft,
  limitAtZeroFromRight,
  responseCurve,
  responseTime,
  verticalAsymptote,
} from '../../math';
import { mathModelConfig } from '../../config/model';
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

type LimitCase = 'zero' | 'capacity';

const distances = [10, 5, 1, 0.5, 0.1, 0.01] as const;

const formatContinuous = (value: number, maximumFractionDigits = 4) =>
  new Intl.NumberFormat('es-CR', { maximumFractionDigits }).format(value);

const formatResponse = (value: number) =>
  formatContinuous(Math.abs(value - Math.round(value)) < 0.00001 ? Math.round(value) : value, 6);

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

export function LimitsLab() {
  const [caseId, setCaseId] = useState<LimitCase>('zero');
  const [selectedDistance, setSelectedDistance] = useState<(typeof distances)[number]>(0.1);
  const capacity = mathModelConfig.response.referenceCapacityUsers;
  const base = mathModelConfig.response.baseResponseMs;
  const coefficient = mathModelConfig.response.growthCoefficientMs;
  const isZero = caseId === 'zero';
  const limit = isZero ? limitAtZeroFromRight() : limitAtCapacityFromLeft();
  const tableRows = useMemo(
    () =>
      distances.map((distance) => {
        const users = isZero ? distance : capacity - distance;
        const result = responseTime(users);
        return { distance, users, responseMs: result.ok ? result.value : null };
      }),
    [capacity, isZero],
  );
  const selected = tableRows.find((row) => row.distance === selectedDistance) ?? tableRows[0];
  const curve = useMemo(() => {
    const result = isZero
      ? responseCurve(0, 15, 100)
      : responseCurve(capacity - 20, capacity - 0.01, 160);
    return result.ok ? result.value : [];
  }, [capacity, isZero]);
  const formula = `R(n) = ${base} + \\frac{${coefficient}n}{${capacity}-n}`;
  const limitFormula = isZero
    ? `\\lim_{n \\to 0^+} R(n) = ${base}\\,\\mathrm{ms}`
    : `\\lim_{n \\to ${capacity}^{-}} R(n) = +\\infty`;
  const procedure = isZero
    ? [
        'Identificamos R(n) y su dominio continuo: 0 ≤ n < 100.',
        'Al aproximarnos a 0 por la derecha, el denominador 100 − n no se anula.',
        'Aplicamos sustitución directa: R(0) = 100 + (200 · 0)/(100 − 0).',
        'El término fraccionario es 0, por lo que el resultado es 100 ms.',
        'El límite representa el tiempo base del modelo hipotético con carga casi nula.',
      ]
    : [
        'Estudiamos n acercándose a 100 exclusivamente por valores inferiores.',
        'El numerador 200n se aproxima a un valor positivo cercano a 20 000.',
        'El denominador 100 − n se aproxima a 0 mediante valores positivos.',
        'Un cociente positivo entre un valor positivo muy pequeño crece sin cota.',
        'Por tanto, el límite es +∞ y n = 100 es una asíntota vertical, no una evaluación.',
        'Describe una saturación idealizada del modelo, no un tiempo medido en un servidor real.',
      ];

  function changeCase(next: LimitCase) {
    setCaseId(next);
    setSelectedDistance(0.1);
  }

  return (
    <div className="limits-lab" aria-label="Laboratorio de límites">
      <header className="limits-lab__intro">
        <div>
          <p className="eyebrow">Cálculo I · modelo provisional</p>
          <h1>Laboratorio de límites</h1>
          <p>
            Explora el comportamiento continuo de R(n) cerca de la carga inicial y de la capacidad
            de referencia.
          </p>
        </div>
        <div className="limits-lab__nav">
          <Link to="/">Ir al Dashboard</Link>
          <Link to="/derivadas">
            Continuar a Derivadas <ChevronRight aria-hidden="true" size={16} />
          </Link>
        </div>
      </header>

      <section className="limits-grid limits-grid--top">
        <Card className="formula-card">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Función del modelo</p>
              <h2>Tiempo de respuesta</h2>
            </div>
            <BookOpen aria-hidden="true" />
          </div>
          <Formula expression={formula} label="R de n es 100 más 200 n entre 100 menos n" />
          <p>
            Dominio continuo: <strong>0 ≤ n &lt; {capacity}</strong>. R(n) se expresa en
            milisegundos y n representa usuarios concurrentes en la extensión matemática del modelo.
          </p>
        </Card>

        <Card className="case-card">
          <p className="eyebrow">Caso de análisis</p>
          <div className="case-selector" role="radiogroup" aria-label="Caso de límite">
            <button
              aria-checked={isZero}
              className={isZero ? 'selected' : ''}
              onClick={() => changeCase('zero')}
              role="radio"
            >
              Carga inicial
              <small>n → 0⁺</small>
            </button>
            <button
              aria-checked={!isZero}
              className={!isZero ? 'selected' : ''}
              onClick={() => changeCase('capacity')}
              role="radio"
            >
              Capacidad
              <small>n → {capacity}⁻</small>
            </button>
          </div>
          <div
            className={`limit-result ${isZero ? 'limit-result--finite' : 'limit-result--infinite'}`}
          >
            <InfinityIcon aria-hidden="true" />
            <div>
              <span>Resultado del límite lateral</span>
              <strong>
                {limit.kind === 'finite' ? `${formatContinuous(limit.value)} ${limit.unit}` : '+∞'}
              </strong>
            </div>
          </div>
        </Card>
      </section>

      <section className="limits-grid limits-grid--visual">
        <Card className="limits-chart-card">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Figura L-{isZero ? '01' : '02'}</p>
              <h2>{isZero ? 'Aproximación a la carga inicial' : 'Aproximación a la capacidad'}</h2>
            </div>
            <span className="chart-scale">
              {isZero ? 'Escala lineal' : 'Escala logarítmica en Y'}
            </span>
          </div>
          <div className="limits-chart" aria-label="Gráfica del límite de tiempo de respuesta">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={curve} margin={{ top: 14, right: 22, left: 10, bottom: 8 }}>
                <CartesianGrid stroke="rgba(148,163,184,.18)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="users"
                  type="number"
                  domain={isZero ? [0, 15] : [capacity - 20, capacity]}
                  tickFormatter={(value) => formatContinuous(value, 2)}
                  label={{
                    value: 'Usuarios concurrentes (n)',
                    position: 'insideBottom',
                    offset: -2,
                    fill: '#c8d5eb',
                  }}
                />
                <YAxis
                  dataKey="responseMs"
                  scale={isZero ? 'auto' : 'log'}
                  domain={isZero ? ['auto', 'auto'] : ['auto', 'auto']}
                  width={72}
                  tickFormatter={(value) => `${formatContinuous(Number(value), 0)} ms`}
                  label={{
                    value: 'Tiempo de respuesta',
                    angle: -90,
                    position: 'insideLeft',
                    fill: '#c8d5eb',
                  }}
                />
                <Tooltip
                  formatter={(value) => `${formatResponse(Number(value))} ms`}
                  labelFormatter={(value) => `n = ${formatContinuous(Number(value), 4)}`}
                  contentStyle={{
                    background: '#162134',
                    border: '1px solid #334155',
                    borderRadius: 10,
                  }}
                />
                <Legend />
                <ReferenceLine
                  x={verticalAsymptote()}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  label="C = 100"
                />
                <ReferenceLine x={selected.users} stroke="#f59e0b" strokeDasharray="5 4" />
                {selected.responseMs !== null && (
                  <ReferenceLine y={selected.responseMs} stroke="#f59e0b" strokeDasharray="2 4" />
                )}
                <Line
                  dataKey="responseMs"
                  name="R(n)"
                  stroke="#38bdf8"
                  strokeWidth={3}
                  dot={false}
                  type="linear"
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="chart-note">
            {isZero
              ? 'La escala lineal permite observar el acercamiento a 100 ms.'
              : 'La escala logarítmica permite comparar valores muy grandes cerca de la asíntota sin alterar los datos.'}
          </p>
        </Card>

        <Card className="approach-card">
          <p className="eyebrow">Control de aproximación</p>
          <h2>Distancia al punto límite</h2>
          <p>
            Estas distancias son valores continuos para el análisis de límites; no modifican la
            carga operativa del Dashboard.
          </p>
          <div className="distance-controls" aria-label="Distancia de aproximación">
            {distances.map((distance) => (
              <button
                className={distance === selectedDistance ? 'selected' : ''}
                key={distance}
                onClick={() => setSelectedDistance(distance)}
              >
                {formatContinuous(distance, 2)}
              </button>
            ))}
          </div>
          <div className="sample-readout" aria-live="polite">
            <span>Punto seleccionado</span>
            <strong>n = {formatContinuous(selected.users, 4)}</strong>
            <span>
              R(n) ={' '}
              {selected.responseMs === null
                ? 'No disponible'
                : `${formatResponse(selected.responseMs)} ms`}
            </span>
          </div>
        </Card>
      </section>

      <section className="limits-grid limits-grid--learning">
        <Card className="table-card">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Valores calculados</p>
              <h2>Tabla de aproximación</h2>
            </div>
          </div>
          <div className="table-scroll">
            <table>
              <caption>
                Seleccione una fila para actualizar el punto resaltado en la gráfica.
              </caption>
              <thead>
                <tr>
                  <th>Distancia</th>
                  <th>n continuo</th>
                  <th>R(n)</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row) => (
                  <tr
                    className={row.distance === selectedDistance ? 'is-selected' : ''}
                    key={row.distance}
                  >
                    <td>
                      <button
                        onClick={() => setSelectedDistance(row.distance)}
                        aria-label={`Seleccionar distancia ${row.distance}`}
                      >
                        {formatContinuous(row.distance, 2)}
                      </button>
                    </td>
                    <td>{formatContinuous(row.users, 4)}</td>
                    <td>
                      {row.responseMs === null
                        ? 'No disponible'
                        : `${formatResponse(row.responseMs)} ms`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="procedure-card">
          <p className="eyebrow">Procedimiento</p>
          <h2>Desarrollo paso a paso</h2>
          <Formula
            expression={limitFormula}
            label={
              isZero
                ? 'límite de R de n cuando n tiende a cero por la derecha es 100 milisegundos'
                : 'límite de R de n cuando n tiende a 100 por la izquierda es infinito positivo'
            }
          />
          <ol>
            {procedure.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </Card>
      </section>

      <section className="limits-grid limits-grid--context">
        <Card className="interpretation-card">
          <ServerCog aria-hidden="true" />
          <div>
            <p className="eyebrow">Interpretación académica</p>
            <h2>{isZero ? 'Tiempo base del modelo' : 'Margen antes de la capacidad'}</h2>
            <p>
              {isZero
                ? 'El límite de 100 ms describe el valor base supuesto por el modelo cuando la carga se aproxima a cero. No afirma una medición real con cero usuarios.'
                : 'El crecimiento sin cota señala que se necesitan márgenes operativos antes de la capacidad de referencia. El infinito es un resultado matemático, no una métrica de un servidor real.'}
            </p>
          </div>
        </Card>
        <Card className="systems-card">
          <p className="eyebrow">Ingeniería en Sistemas</p>
          <h2>Dos aplicaciones de límites</h2>
          <ul>
            <li>Estimar el comportamiento base al iniciar una carga hipotética.</li>
            <li>
              Identificar condiciones cercanas a saturación y justificar umbrales conservadores.
            </li>
          </ul>
          <p>
            Este análisis es educativo y provisional; no sustituye una prueba de carga sobre
            infraestructura real.
          </p>
        </Card>
      </section>
    </div>
  );
}
