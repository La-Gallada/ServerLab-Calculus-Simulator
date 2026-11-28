import { useMemo, useState } from 'react';
import { ChevronRight, RotateCcw, ServerCog, Sigma } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Formula } from '../../components/ui/Formula';
import { mathModelConfig } from '../../config/model';
import { accumulatedData, formatters, transferRate, transferredData } from '../../math';
import { useSimulation } from '../../state/useSimulation';
import { ExampleApplication } from './ExampleApplication';
import { IntegralChart } from './IntegralChart';
import { buildIntegralFigure, exampleApplications, type FigureKind } from './integralFigures';
import {
  accumulationTex,
  definiteIntegralTex,
  differenceTex,
  evaluationTex,
  fundamentalTheoremTex,
  integrandStepTex,
  rateTex,
  resultTex,
} from './integralTex';
import { LimitControl } from './LimitControl';

const referenceTimes = [0, 5, 10, 15, 20, 25, 30] as const;

const modes: { id: FigureKind; label: string; code: string }[] = [
  { id: 'rate', label: 'Tasa y área', code: 'I-01' },
  { id: 'accumulated', label: 'Datos acumulados', code: 'I-02' },
];

function Metric({
  label,
  value,
  detail,
  tone = 'green',
}: {
  label: string;
  value: string;
  detail: string;
  tone?: 'green' | 'cyan' | 'violet' | 'amber';
}) {
  return (
    <Card className={`integral-metric integral-metric--${tone}`}>
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{detail}</span>
    </Card>
  );
}

export function IntegralsLab() {
  const { input } = useSimulation();
  // El intervalo es local: parte de la duración del Dashboard y nunca la modifica.
  const initialInterval: { a: number; b: number } = {
    a: mathModelConfig.controls.initialIntegrationStartSeconds,
    b: input.transferTimeSeconds,
  };
  const [{ a, b }, setInterval] = useState(initialInterval);
  const [mode, setMode] = useState<FigureKind>('rate');
  const maximum = mathModelConfig.transfer.maximumTimeSeconds;

  const total = transferredData(a, b);
  const startRate = transferRate(a);
  const endRate = transferRate(b);
  const startTotal = accumulatedData(a);
  const endTotal = accumulatedData(b);
  const figure = useMemo(() => buildIntegralFigure(mode, a, b), [mode, a, b]);

  if (!total.ok || !startRate.ok || !endRate.ok || !startTotal.ok || !endTotal.ok || !figure.ok)
    return <p role="alert">No fue posible calcular el análisis integral.</p>;

  const data = formatters.megabytes(total.value);
  const duration = formatters.seconds(b - a);
  const from = formatters.seconds(a);
  const to = formatters.seconds(b);
  const zeroInterval = a === b;
  const isRate = mode === 'rate';
  const activeMode = modes.find((item) => item.id === mode) ?? modes[0];
  const summary = zeroInterval
    ? `El intervalo tiene longitud cero (a = b = ${from}): no hay área y D(a,b) = ${data}.`
    : isRate
      ? `Entre ${from} y ${to} la tasa pasa de ${formatters.megabytesPerSecond(startRate.value)} a ${formatters.megabytesPerSecond(endRate.value)}. El área sombreada bajo T(t) equivale a ${data} transferidos.`
      : `A(${to}) = ${formatters.megabytes(endTotal.value)} y A(${from}) = ${formatters.megabytes(startTotal.value)}. La diferencia vertical A(b) − A(a) = ${data} es lo transferido en el intervalo.`;

  return (
    <div className="integrals-lab" aria-label="Laboratorio de integrales">
      <header className="limits-lab__intro">
        <div>
          <p className="eyebrow">Cálculo integral · modelo provisional</p>
          <h1>Laboratorio de integrales</h1>
          <p>
            Calcula cuántos datos transfiere un servidor web hipotético cuando su tasa de
            transferencia varía con el tiempo.
          </p>
        </div>
        <div className="limits-lab__nav">
          <Link to="/">Ir al Dashboard</Link>
          <Link to="/derivadas">
            Volver a Derivadas <ChevronRight aria-hidden="true" size={16} />
          </Link>
        </div>
      </header>

      <Card className="formula-card integrals-formula">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Modelo de transferencia</p>
            <h2>Función de tasa y acumulación</h2>
          </div>
          <Sigma aria-hidden="true" />
        </div>
        <div className="integrals-formula__grid">
          <div>
            <Formula expression={rateTex} label="función de tasa de transferencia" />
            <p>Tasa instantánea en MB/s.</p>
          </div>
          <div>
            <Formula expression={accumulationTex} label="función de datos acumulados" />
            <p>Cantidad acumulada desde t = 0, en MB.</p>
          </div>
          <div>
            <Formula expression="D(a,b) = A(b) - A(a)" label="datos transferidos" />
            <p>
              Datos transferidos en [a,b], con 0 ≤ a ≤ b ≤{' '}
              {formatters.seconds(maximum).replace(' ', ' ')}. Modelo hipotético y provisional.
            </p>
          </div>
        </div>
      </Card>

      <section className="integral-metrics" aria-label="Indicadores del intervalo">
        <Metric label="Datos transferidos" value={data} detail="D(a,b), cantidad acumulada" />
        <Metric
          label="Duración del intervalo"
          value={duration}
          detail={`b − a, de ${from} a ${to}`}
          tone="cyan"
        />
        <Metric
          label="Tasa inicial"
          value={formatters.megabytesPerSecond(startRate.value)}
          detail="T(a), tasa instantánea"
          tone="violet"
        />
        <Metric
          label="Tasa final"
          value={formatters.megabytesPerSecond(endRate.value)}
          detail="T(b), tasa instantánea"
          tone="amber"
        />
      </section>

      <section className="integrals-grid integrals-grid--chart">
        <Card className="integral-chart-card">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Figura {activeMode.code}</p>
              <h2>{figure.value.title}</h2>
            </div>
            <div className="segmented" role="group" aria-label="Representación gráfica">
              {modes.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={mode === item.id}
                  className={mode === item.id ? 'selected' : ''}
                  onClick={() => setMode(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <figure
            id={figure.value.id}
            data-figure-id={figure.value.id}
            data-model-id={figure.value.model.id}
            data-model-version={figure.value.model.version}
            data-interval={`${a},${b}`}
            aria-label={figure.value.title}
            aria-describedby="integral-chart-summary"
          >
            <p className="integral-total">
              {isRate ? 'Área' : 'Diferencia'} en [{from}; {to}]: <strong>{data}</strong>
            </p>
            <IntegralChart figure={figure.value} />
            <ul className="integral-legend" aria-label="Leyenda">
              {figure.value.legend.map((item) => (
                <li key={item.label}>
                  <span
                    aria-hidden="true"
                    className={`integral-legend__marker integral-legend__marker--${item.marker} integral-legend__marker--${mode}`}
                  />
                  {item.label}
                </li>
              ))}
            </ul>
            <figcaption className="chart-note">
              <span id="integral-chart-summary">{summary}</span>{' '}
              {isRate
                ? 'El área se mide respecto a cero: (MB/s) · s = MB.'
                : 'A(t) acumula desde cero hasta t; aquí la cantidad transferida es una diferencia de alturas, no un área bajo A(t).'}{' '}
              Modelo {figure.value.model.id}, versión {figure.value.model.version}.
            </figcaption>
          </figure>
        </Card>

        <Card className="interval-card">
          <p className="eyebrow">Límites de integración</p>
          <h2 aria-live="polite">
            Intervalo [{from}; {to}]
          </h2>
          <LimitControl
            symbol="a"
            label="Límite inferior"
            value={a}
            allowed={{ min: 0, max: b }}
            validate={(candidate) => transferredData(candidate, b)}
            onCommit={(next) => setInterval((current) => ({ ...current, a: next }))}
          />
          <LimitControl
            symbol="b"
            label="Límite superior"
            value={b}
            allowed={{ min: a, max: maximum }}
            validate={(candidate) => transferredData(a, candidate)}
            onCommit={(next) => setInterval((current) => ({ ...current, b: next }))}
          />
          <Button variant="secondary" onClick={() => setInterval(initialInterval)}>
            <RotateCcw aria-hidden="true" size={16} /> Reiniciar intervalo
          </Button>
          <p>
            Cada control se detiene en el otro límite para mantener a ≤ b. Reiniciar restaura [
            {formatters.seconds(initialInterval.a)}; {formatters.seconds(initialInterval.b)}], según
            la duración elegida en el Dashboard. Estos cambios no modifican el Dashboard.
          </p>
        </Card>
      </section>

      <section className="integrals-grid integrals-grid--halves" aria-label="Ejemplos académicos">
        {exampleApplications.map((example, index) => (
          <ExampleApplication
            key={example.id}
            number={index + 1}
            figureId={example.id}
            startSeconds={example.startSeconds}
            endSeconds={example.endSeconds}
            isLoaded={a === example.startSeconds && b === example.endSeconds}
            onLoad={() => setInterval({ a: example.startSeconds, b: example.endSeconds })}
          />
        ))}
      </section>

      <section className="integrals-grid integrals-grid--learning">
        <Card className="table-card">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Valores calculados</p>
              <h2>Tabla de referencia</h2>
            </div>
          </div>
          <div className="table-scroll" role="region" aria-label="Tabla desplazable" tabIndex={0}>
            <table>
              <caption>
                Use «Fijar a» o «Fijar b» para convertir un tiempo en límite del intervalo.
              </caption>
              <thead>
                <tr>
                  <th scope="col">t (s)</th>
                  <th scope="col">T(t) (MB/s)</th>
                  <th scope="col">A(t) (MB)</th>
                  <th scope="col">Intervalo</th>
                  <th scope="col">Fijar límite</th>
                </tr>
              </thead>
              <tbody>
                {referenceTimes.map((seconds) => {
                  const rate = transferRate(seconds);
                  const accumulated = accumulatedData(seconds);
                  const inside = seconds >= a && seconds <= b;
                  const role =
                    seconds === a && seconds === b
                      ? 'Límites a y b'
                      : seconds === a
                        ? 'Límite a'
                        : seconds === b
                          ? 'Límite b'
                          : inside
                            ? 'Dentro'
                            : 'Fuera';
                  return (
                    <tr key={seconds} className={inside ? 'is-selected' : ''}>
                      <th scope="row">{seconds}</th>
                      <td>{rate.ok ? formatters.megabytesPerSecond(rate.value) : '—'}</td>
                      <td>{accumulated.ok ? formatters.megabytes(accumulated.value) : '—'}</td>
                      <td>{role}</td>
                      <td>
                        <button
                          type="button"
                          aria-label={`Fijar ${seconds} s como límite inferior a`}
                          disabled={seconds > b}
                          onClick={() => setInterval({ a: seconds, b })}
                        >
                          Fijar a
                        </button>{' '}
                        <button
                          type="button"
                          aria-label={`Fijar ${seconds} s como límite superior b`}
                          disabled={seconds < a}
                          onClick={() => setInterval({ a, b: seconds })}
                        >
                          Fijar b
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="procedure-card dynamic-procedure">
          <p className="eyebrow">Procedimiento dinámico</p>
          <h2>Teorema fundamental del cálculo</h2>
          <ol>
            <li>
              Integral definida con los límites seleccionados.
              <Formula expression={definiteIntegralTex(a, b)} label="integral seleccionada" />
            </li>
            <li>
              Función integrando.
              <Formula expression={integrandStepTex(a, b)} label="integrando" />
            </li>
            <li>
              Antiderivada.
              <Formula expression={accumulationTex} label="antiderivada de la tasa" />
            </li>
            <li>
              Evaluación mediante el teorema fundamental.
              <Formula
                expression={fundamentalTheoremTex(a, b)}
                label="teorema fundamental del cálculo"
              />
            </li>
            <li>
              Sustitución del límite superior.
              <Formula
                expression={evaluationTex(b, endTotal.value)}
                label="sustitución del límite superior"
              />
            </li>
            <li>
              Sustitución del límite inferior.
              <Formula
                expression={evaluationTex(a, startTotal.value)}
                label="sustitución del límite inferior"
              />
            </li>
            <li>
              Diferencia.
              <Formula
                expression={differenceTex(startTotal.value, endTotal.value, total.value)}
                label="diferencia"
              />
            </li>
            <li>
              Resultado final con unidades.
              <Formula expression={resultTex(a, b, total.value)} label="resultado final" />
            </li>
          </ol>
        </Card>
      </section>

      <section className="integrals-grid integrals-grid--halves">
        <Card className="interpretation-card">
          <ServerCog aria-hidden="true" />
          <div>
            <p className="eyebrow">Interpretación académica</p>
            <h2>De la tasa a la cantidad</h2>
            <p>
              T(t) indica la rapidez de transferencia en un instante (MB/s). La integral suma esa
              rapidez variable a lo largo del tiempo y entrega un volumen de datos (MB). En [{from};{' '}
              {to}] el resultado es {data}.
            </p>
          </div>
        </Card>
        <Card className="systems-card">
          <p className="eyebrow">Ingeniería en Sistemas</p>
          <h2>Aplicaciones de la integral</h2>
          <ul>
            <li>Determinar el volumen de datos transferidos durante un periodo.</li>
            <li>Analizar tasas de transferencia que cambian con el tiempo.</li>
            <li>Estimar necesidades de transferencia dentro de un escenario hipotético.</li>
          </ul>
          <p>
            Los datos transferidos no equivalen a memoria RAM utilizada, uso de CPU ni
            almacenamiento requerido. No son mediciones de un servidor real.
          </p>
        </Card>
      </section>

      <nav className="integrals-modules" aria-label="Otros módulos">
        <Link to="/limites">Repasar Límites</Link>
        <Link to="/derivadas">Repasar Derivadas</Link>
        <Link to="/optimizacion">Ver Optimización</Link>
      </nav>

      <Card className="model-note">
        <strong>Supuesto académico:</strong> {mathModelConfig.assumptions}
      </Card>
    </div>
  );
}
