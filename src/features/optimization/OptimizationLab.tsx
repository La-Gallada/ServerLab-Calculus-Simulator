import { useState } from 'react';
import { ChevronRight, CircleCheck, CircleX, RotateCcw, ServerCog, Target } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Formula } from '../../components/ui/Formula';
import { mathModelConfig } from '../../config/model';
import { formatters, responseTime } from '../../math';
import { useSimulation } from '../../state/useSimulation';
import { CapacityChart } from './CapacityChart';
import { FigureLegend } from './FigureLegend';
import {
  buildCapacityFigure,
  buildResponseFigure,
  buildVerificationFigure,
  optimizationScenarios,
  solveThreshold,
  responseCeiling,
  type ResponseScale,
} from './optimizationFigures';
import { approx, equation, formatNumber, users } from './optimizationFormat';
import { scenarioThresholdsMs, thresholdRange } from './optimizationInput';
import { OptimizationProcedure } from './OptimizationProcedure';
import { generalBoundTex, responseTex } from './optimizationTex';
import { ResponseRegionChart } from './ResponseRegionChart';
import { ScenarioApplication } from './ScenarioApplication';
import { ThresholdField } from './ThresholdField';
import { VerificationChart } from './VerificationChart';
import { ExportButton } from '../exports/ExportButton';

function Metric({
  label,
  value,
  detail,
  tone = 'amber',
}: {
  label: string;
  value: string;
  detail: string;
  tone?: 'amber' | 'green' | 'violet' | 'cyan';
}) {
  return (
    <Card className={`opt-metric opt-metric--${tone}`}>
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{detail}</span>
    </Card>
  );
}

export function OptimizationLab() {
  const { input } = useSimulation();
  // Estado local: parte de los valores del Dashboard y nunca los modifica.
  const entry = { thresholdMs: input.thresholdMs, users: input.concurrentUsers };
  const [analysis, setAnalysis] = useState(entry);
  const [view, setView] = useState<ResponseScale>('focus');
  /** Cambia cuando el umbral llega por otra vía y descarta el borrador del campo. */
  const [revision, setRevision] = useState(0);
  const { thresholdMs, users: load } = analysis;
  const { baseResponseMs: base, referenceCapacityUsers: capacity } = mathModelConfig.response;
  const lastUser = capacity - 1;

  function setThreshold(next: number) {
    setAnalysis((current) => ({ ...current, thresholdMs: next }));
    setRevision((current) => current + 1);
  }

  function reset() {
    setAnalysis(entry);
    setRevision((current) => current + 1);
  }

  const solved = solveThreshold(thresholdMs);
  const response = buildResponseFigure(thresholdMs, load);
  const verification = buildVerificationFigure(thresholdMs);
  const capacityFigure = buildCapacityFigure(thresholdMs);
  const highest = responseTime(lastUser);

  if (!solved.ok || !response.ok || !verification.ok || !capacityFigure.ok || !highest.ok)
    return <p role="alert">No fue posible resolver la optimización.</p>;

  const solution = solved.value;
  const feasible = solution.kind === 'feasible' ? solution : null;
  const figure = response.value;
  const currentMs = figure.currentResponseMs;
  const meets = currentMs <= thresholdMs;
  const threshold = formatters.milliseconds(thresholdMs);
  const maximum = feasible?.maximumIntegerUsers;
  const userMargin = maximum === undefined ? null : maximum - load;
  const timeMargin = thresholdMs - currentMs;
  const ceiling = responseCeiling(figure, view, highest.value);

  const status = !feasible
    ? 'No hay solución factible'
    : meets
      ? 'La carga cumple el umbral'
      : 'La carga supera el umbral';

  const outside = [
    currentMs > ceiling
      ? `La carga de análisis (R(${load}) = ${formatters.milliseconds(currentMs)}) queda fuera de la vista.`
      : '',
    highest.value > ceiling
      ? `La curva continúa por encima de ${formatters.milliseconds(ceiling)}; llega a R(${lastUser}) = ${formatters.milliseconds(highest.value)}.`
      : '',
  ]
    .filter(Boolean)
    .join(' ');

  const region =
    feasible?.continuousIntersectionUsers === 0
      ? 'la única carga factible es n = 0, donde R(0) = L'
      : `la región factible va de n = 0 a la frontera continua n* ${equation(feasible?.continuousIntersectionUsers ?? 0)}`;

  const summary = feasible
    ? `Con L = ${threshold}, ${region}. El máximo entero es ${users(feasible.maximumIntegerUsers)}. La carga de ${users(load)} tiene R(n) = ${formatters.milliseconds(currentMs)} y ${meets ? 'cumple' : 'supera'} el umbral.`
    : `Con L = ${threshold}, menor que el tiempo base de ${formatters.milliseconds(base)}, ninguna carga es factible: todo el dominio queda en la región no factible y no existe frontera.`;

  return (
    <div className="optimization-lab" aria-label="Laboratorio de optimización">
      <header className="limits-lab__intro">
        <div>
          <p className="eyebrow">Optimización con restricción · modelo provisional</p>
          <h1>Laboratorio de optimización</h1>
          <p>
            Determina cuántos usuarios concurrentes puede atender un servidor web hipotético sin
            superar un tiempo de respuesta.
          </p>
        </div>
        <div className="limits-lab__nav">
          <Link to="/">Ir al Dashboard</Link>
          <Link to="/integrales">
            Volver a Integrales <ChevronRight aria-hidden="true" size={16} />
          </Link>
        </div>
      </header>

      <Card className="formula-card opt-problem">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Planteamiento</p>
            <h2>Maximizar la carga bajo un objetivo de respuesta</h2>
          </div>
          <Target aria-hidden="true" />
        </div>
        <div className="opt-problem__grid">
          <div>
            <Formula expression={responseTex} label="función de respuesta" />
            <p>Tiempo de respuesta en ms, con 0 ≤ n &lt; {capacity}.</p>
          </div>
          <div>
            <Formula
              expression="\begin{gathered} \max\; n \\ R(n) \le L,\; n \in \mathbb{Z} \end{gathered}"
              label="problema de optimización"
            />
            <p>L es el tiempo máximo permitido; n va de 0 a {lastUser}.</p>
          </div>
          <div>
            <Formula expression={generalBoundTex} label="cota general" />
            <p>Válida cuando L ≥ B, con B = {formatters.milliseconds(base)}.</p>
          </div>
        </div>
      </Card>

      <section className="opt-metrics" aria-label="Indicadores principales">
        <Metric label="Umbral máximo permitido" value={threshold} detail="L, objetivo local" />
        <Metric
          label="Máximo entero de usuarios"
          value={maximum === undefined ? 'Sin solución' : users(maximum)}
          detail={
            maximum === undefined ? 'Ninguna carga cumple R(n) ≤ L' : 'Mayor n que cumple R(n) ≤ L'
          }
          tone="green"
        />
        <Metric
          label="Carga de análisis"
          value={users(load)}
          detail="n elegido en este laboratorio"
          tone="violet"
        />
        <Metric
          label="Tiempo de respuesta actual"
          value={formatters.milliseconds(currentMs)}
          detail={`R(${load}) ${meets ? 'cumple' : 'supera'} el umbral`}
          tone="cyan"
        />
      </section>

      <Card className="opt-solution">
        <div
          className={`opt-status ${feasible && meets ? 'is-good' : 'is-bad'}`}
          role="status"
          aria-label="Estado de factibilidad"
        >
          {feasible && meets ? <CircleCheck aria-hidden="true" /> : <CircleX aria-hidden="true" />}
          <strong>{status}</strong>
        </div>
        <dl aria-label="Detalle de la solución">
          <div>
            <dt>Frontera continua n*</dt>
            <dd>{feasible ? approx(feasible.continuousIntersectionUsers) : 'No existe'}</dd>
          </div>
          <div>
            <dt>Respuesta en el máximo R(m)</dt>
            <dd>{feasible ? approx(feasible.responseAtMaximumMs, 'ms') : 'No aplica'}</dd>
          </div>
          <div>
            <dt>Margen temporal en el máximo L − R(m)</dt>
            <dd>{feasible ? approx(feasible.marginMs, 'ms') : 'No aplica'}</dd>
          </div>
          <div>
            <dt>{timeMargin >= 0 ? 'Holgura de tiempo actual' : 'Exceso de tiempo actual'}</dt>
            <dd>{formatters.milliseconds(Math.abs(timeMargin))}</dd>
          </div>
          <div>
            <dt>
              {userMargin !== null && userMargin < 0 ? 'Exceso de carga' : 'Margen de usuarios'}
            </dt>
            <dd>{userMargin === null ? 'No aplica' : users(Math.abs(userMargin))}</dd>
          </div>
        </dl>
      </Card>

      <section className="opt-grid opt-grid--chart">
        <Card className="opt-chart-card">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Figura O-01</p>
              <h2>{figure.title}</h2>
            </div>
            <div className="segmented" role="group" aria-label="Escala vertical">
              {(
                [
                  ['focus', 'Vista enfocada'],
                  ['full', 'Dominio completo'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={view === id}
                  className={view === id ? 'selected' : ''}
                  onClick={() => setView(id)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <figure
            data-figure-id={figure.id}
            data-model-id={figure.model.id}
            data-model-version={figure.model.version}
            data-parameters={`${thresholdMs},${load}`}
            aria-label={figure.title}
            aria-describedby="opt-response-summary"
          >
            <ResponseRegionChart figure={figure} ceiling={ceiling} />
            <FigureLegend items={figure.legend} />
            <figcaption className="chart-note">
              <span id="opt-response-summary">{summary}</span>{' '}
              <span data-testid="opt-outside">{outside}</span> Escala lineal; R(n) no se evalúa en n
              = {capacity}. Modelo {figure.model.id}, versión {figure.model.version}.
            </figcaption>
          </figure>
          <ExportButton
            figureId={figure.id}
            values={{ threshold: thresholdMs, users: load, view }}
            label="Exportar gráfica principal"
          />
        </Card>

        <Card className="opt-controls">
          <p className="eyebrow">Controles locales</p>
          <h2>Umbral y carga</h2>
          <div className="opt-control">
            <div className="opt-control__heading">
              <label htmlFor="opt-threshold">Umbral de respuesta</label>
              <output htmlFor="opt-threshold">{threshold}</output>
            </div>
            <input
              id="opt-threshold"
              type="range"
              min={thresholdRange.sliderMinMs}
              max={thresholdRange.sliderMaxMs}
              step={Number.isInteger(thresholdMs) ? 1 : 'any'}
              value={thresholdMs}
              aria-valuetext={threshold}
              aria-describedby="opt-threshold-range"
              onKeyDown={(event) => {
                // Desde un valor decimal, las flechas van al entero contiguo.
                if (Number.isInteger(thresholdMs)) return;
                const down = event.key === 'ArrowLeft' || event.key === 'ArrowDown';
                const up = event.key === 'ArrowRight' || event.key === 'ArrowUp';
                if (!down && !up) return;
                event.preventDefault();
                setThreshold(down ? Math.floor(thresholdMs) : Math.ceil(thresholdMs));
              }}
              onChange={(event) => setThreshold(Math.round(Number(event.target.value)))}
            />
            <p id="opt-threshold-range">
              Control deslizante: {thresholdRange.sliderMinMs} a{' '}
              {formatters.milliseconds(thresholdRange.sliderMaxMs)}.
              {(thresholdMs < thresholdRange.sliderMinMs ||
                thresholdMs > thresholdRange.sliderMaxMs) &&
                ' El valor actual está fuera de ese rango.'}
            </p>
          </div>
          <div className="opt-presets" role="group" aria-label="Umbrales predefinidos">
            {scenarioThresholdsMs.map((preset) => (
              <button
                key={preset}
                type="button"
                aria-pressed={thresholdMs === preset}
                onClick={() => setThreshold(preset)}
              >
                {formatters.milliseconds(preset)}
              </button>
            ))}
            <button
              type="button"
              aria-pressed={thresholdMs === highest.value}
              onClick={() => setThreshold(highest.value)}
            >
              Último usuario: R({lastUser})
            </button>
          </div>
          <ThresholdField key={revision} value={thresholdMs} onCommit={setThreshold} />
          <div className="opt-control">
            <div className="opt-control__heading">
              <label htmlFor="opt-users">Usuarios de análisis</label>
              <output htmlFor="opt-users">{users(load)}</output>
            </div>
            <input
              id="opt-users"
              type="range"
              min="0"
              max={lastUser}
              step="1"
              value={load}
              aria-valuetext={users(load)}
              onChange={(event) => {
                const next = Number(event.target.value);
                setAnalysis((current) => ({ ...current, users: next }));
              }}
            />
          </div>
          <Button variant="secondary" onClick={reset}>
            <RotateCcw aria-hidden="true" size={16} /> Reiniciar laboratorio
          </Button>
          <p>
            Reiniciar recupera los valores del Dashboard (
            {formatters.milliseconds(entry.thresholdMs)} y {users(entry.users)}). Estos cambios no
            modifican el Dashboard.
          </p>
        </Card>
      </section>

      <section className="opt-grid opt-grid--halves">
        <Card className="opt-chart-card opt-verification">
          <p className="eyebrow">Figura O-02 · solución entera</p>
          <h2>Verificación del máximo entero</h2>
          {feasible && verification.value ? (
            <>
              <ul className="opt-checks">
                <li className="is-good">
                  <CircleCheck aria-hidden="true" />
                  <span>
                    <strong>
                      R({feasible.maximumIntegerUsers}){' '}
                      {equation(feasible.responseAtMaximumMs, 'ms')}
                    </strong>
                    Cumple R(m) ≤ {threshold}
                  </span>
                </li>
                {feasible.responseAtNextUserMs === undefined ? (
                  <li>
                    <CircleX aria-hidden="true" />
                    <span>
                      <strong>m = {lastUser} es el último usuario operativo</strong>
                      El siguiente usuario está fuera del dominio y no se evalúa.
                    </span>
                  </li>
                ) : (
                  <li className="is-bad">
                    <CircleX aria-hidden="true" />
                    <span>
                      <strong>
                        R({feasible.maximumIntegerUsers + 1}){' '}
                        {equation(feasible.responseAtNextUserMs, 'ms')}
                      </strong>
                      Incumple: R(m + 1) &gt; {threshold}
                    </span>
                  </li>
                )}
              </ul>
              <figure
                data-figure-id={verification.value.id}
                aria-label={verification.value.title}
                aria-describedby="opt-verification-summary"
              >
                <VerificationChart figure={verification.value} />
                <FigureLegend items={verification.value.legend} />
                <figcaption className="chart-note" id="opt-verification-summary">
                  Frontera continua n* {equation(feasible.continuousIntersectionUsers)}; máximo
                  entero m = {feasible.maximumIntegerUsers}.{' '}
                  {feasible.responseAtNextUserMs === undefined
                    ? 'No existe un siguiente usuario dentro del dominio.'
                    : `Como R(n) es creciente y R(${feasible.maximumIntegerUsers + 1}) supera L, ningún entero mayor es factible.`}{' '}
                  Ampliación local: la escala vertical se ajusta a la ventana mostrada y puede no
                  comenzar en cero.
                </figcaption>
              </figure>
            </>
          ) : (
            <p className="opt-empty">
              No hay solución que verificar: incluso R(0) = {formatters.milliseconds(base)} supera
              el umbral de {threshold}.
            </p>
          )}
          <ExportButton
            figureId="optimization-integer-verification"
            values={{ threshold: thresholdMs }}
            label="Exportar verificación entera"
          />
        </Card>

        <Card className="opt-chart-card">
          <p className="eyebrow">Figura O-03 · sensibilidad</p>
          <h2>{capacityFigure.value.title}</h2>
          <figure
            data-figure-id={capacityFigure.value.id}
            aria-label={capacityFigure.value.title}
            aria-describedby="opt-capacity-summary"
          >
            <CapacityChart figure={capacityFigure.value} />
            <FigureLegend items={capacityFigure.value.legend} />
            <figcaption className="chart-note" id="opt-capacity-summary">
              La solución entera sube un usuario cada vez que L alcanza R(m).{' '}
              {feasible
                ? `En L = ${threshold} permite ${users(feasible.maximumIntegerUsers)}.`
                : `En L = ${threshold} no hay solución; no equivale a cero usuarios.`}{' '}
              Por debajo de {formatters.milliseconds(base)} no se dibuja ningún valor.
              {thresholdMs < thresholdRange.sliderMinMs &&
                ' El umbral seleccionado queda a la izquierda de la vista.'}
            </figcaption>
          </figure>
          <ExportButton
            figureId={capacityFigure.value.id}
            values={{ threshold: thresholdMs }}
            label="Exportar sensibilidad"
          />
        </Card>
      </section>

      <Card className="table-card opt-table">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Escenarios calculados</p>
            <h2>Tabla comparativa</h2>
          </div>
        </div>
        <div className="table-scroll" role="region" aria-label="Tabla de escenarios" tabIndex={0}>
          <table>
            <caption>Use «Cargar» para analizar un escenario en el laboratorio.</caption>
            <thead>
              <tr>
                <th scope="col">Umbral</th>
                <th scope="col">Frontera continua</th>
                <th scope="col">Máximo entero</th>
                <th scope="col">R(m)</th>
                <th scope="col">Factibilidad</th>
                <th scope="col">Acción</th>
              </tr>
            </thead>
            <tbody>
              {scenarioThresholdsMs.map((scenario) => {
                const result = solveThreshold(scenario);
                const row = result.ok && result.value.kind === 'feasible' ? result.value : null;
                const selected = scenario === thresholdMs;
                return (
                  <tr key={scenario} className={selected ? 'is-selected' : ''}>
                    <th scope="row">{formatters.milliseconds(scenario)}</th>
                    <td data-label="Frontera continua">
                      {row ? formatNumber(row.continuousIntersectionUsers, 2) : 'No existe'}
                    </td>
                    <td data-label="Máximo entero">
                      {row ? row.maximumIntegerUsers : 'Sin solución'}
                    </td>
                    <td data-label="R(m)">
                      {row ? formatters.milliseconds(row.responseAtMaximumMs) : 'No aplica'}
                    </td>
                    <td data-label="Factibilidad">
                      <span>
                        {row ? 'Factible' : 'No factible'}
                        {selected && <small> (seleccionado)</small>}
                      </span>
                    </td>
                    <td data-label="Acción">
                      <button
                        type="button"
                        aria-label={`Cargar escenario de ${scenario} ms`}
                        onClick={() => setThreshold(scenario)}
                      >
                        Cargar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <section className="opt-grid opt-grid--halves" aria-label="Aplicaciones académicas">
        {optimizationScenarios.map((scenario, index) => (
          <ScenarioApplication
            key={scenario.id}
            number={index + 1}
            figureId={scenario.id}
            thresholdMs={scenario.thresholdMs}
            compareWithMs={index === 0 ? undefined : optimizationScenarios[0].thresholdMs}
            load={load}
            isLoaded={thresholdMs === scenario.thresholdMs}
            onLoad={() => setThreshold(scenario.thresholdMs)}
          />
        ))}
      </section>

      <Card className="procedure-card opt-procedure">
        <p className="eyebrow">Procedimiento dinámico</p>
        <h2>Resolución para L = {threshold}</h2>
        <OptimizationProcedure thresholdMs={thresholdMs} solution={solution} />
      </Card>

      <section className="opt-grid opt-grid--halves">
        <Card className="interpretation-card">
          <ServerCog aria-hidden="true" />
          <div>
            <p className="eyebrow">Interpretación profesional</p>
            <h2>Cuatro conceptos distintos</h2>
            <ul>
              <li>
                <strong>Capacidad de referencia (C = {capacity}):</strong> parámetro del modelo
                donde R no está definida.
              </li>
              <li>
                <strong>Máximo operativo:</strong>{' '}
                {maximum === undefined ? 'no existe' : users(maximum)} con L = {threshold}.
              </li>
              <li>
                <strong>Carga actual:</strong> {users(load)}, elegida para el análisis.
              </li>
              <li>
                <strong>Región factible:</strong> cargas que cumplen R(n) ≤ L.
              </li>
            </ul>
          </div>
        </Card>
        <Card className="systems-card">
          <p className="eyebrow">Ingeniería en Sistemas</p>
          <h2>Decisiones que apoya</h2>
          <ul>
            <li>Establecer objetivos de rendimiento y comparar escenarios.</li>
            <li>Determinar capacidades operativas bajo una restricción.</li>
            <li>Identificar márgenes o excesos de usuarios.</li>
            <li>Razonar sobre el compromiso entre carga, respuesta y escalabilidad.</li>
          </ul>
          <p>
            Superar el umbral significa incumplir un objetivo, no que el servidor caiga. Este
            análisis no optimiza infraestructura física ni estima costos, hardware, CPU o RAM.
          </p>
        </Card>
      </section>

      <nav className="opt-modules" aria-label="Otros módulos">
        <Link to="/limites">Repasar Límites</Link>
        <Link to="/derivadas">Repasar Derivadas</Link>
        <Link to="/integrales">Repasar Integrales</Link>
        <Link to="/acerca">Acerca del proyecto</Link>
      </nav>

      <Card className="model-note">
        <strong>Supuesto académico:</strong> {mathModelConfig.assumptions}
      </Card>
    </div>
  );
}
