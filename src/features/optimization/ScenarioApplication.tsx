import { Check, Play } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Formula } from '../../components/ui/Formula';
import { formatters } from '../../math';
import { users } from './optimizationFormat';
import { solveThreshold } from './optimizationFigures';
import {
  boundTex,
  checkTex,
  constraintTex,
  frontierTex,
  integerTex,
  reorganizeTex,
} from './optimizationTex';
import { ExportButton } from '../exports/ExportButton';

interface ScenarioApplicationProps {
  number: number;
  figureId: string;
  thresholdMs: number;
  /** Escenario de referencia para la comparación. */
  compareWithMs?: number;
  /** Carga de análisis actual, usada al exportar. */
  load: number;
  isLoaded: boolean;
  onLoad: () => void;
}

export function ScenarioApplication({
  number,
  figureId,
  thresholdMs,
  compareWithMs,
  load,
  isLoaded,
  onLoad,
}: ScenarioApplicationProps) {
  const result = solveThreshold(thresholdMs);
  const reference = compareWithMs === undefined ? null : solveThreshold(compareWithMs);
  if (!result.ok || result.value.kind !== 'feasible')
    return <p role="alert">No fue posible resolver la aplicación académica {number}.</p>;
  const solution = result.value;
  const { maximumIntegerUsers: maximum, responseAtNextUserMs: next } = solution;
  const comparison = reference?.ok && reference.value.kind === 'feasible' ? reference.value : null;
  const threshold = formatters.milliseconds(thresholdMs);

  return (
    <Card className="procedure-card opt-example" data-figure-id={figureId}>
      <p className="eyebrow">Aplicación académica {number}</p>
      <h2>Objetivo de {threshold}</h2>
      <p>
        ¿Cuál es la mayor cantidad de usuarios que puede atender el servidor hipotético sin exceder{' '}
        {threshold}?
      </p>
      <ol>
        <li>
          Plantear la restricción.
          <Formula expression={constraintTex(thresholdMs)} label="restricción" />
        </li>
        <li>
          Restar el tiempo base, multiplicar por el denominador positivo y reunir n.
          <Formula expression={reorganizeTex(thresholdMs)} label="reorganización" />
        </li>
        <li>
          Despejar la frontera continua.
          <Formula expression={boundTex(thresholdMs)} label="cota" />
          <Formula
            expression={frontierTex(solution.continuousIntersectionUsers)}
            label="frontera"
          />
        </li>
        <li>
          Elegir el máximo entero.
          <Formula expression={integerTex(maximum)} label="máximo entero" />
        </li>
        <li>
          Verificar el máximo.
          <Formula
            expression={checkTex(maximum, solution.responseAtMaximumMs, thresholdMs)}
            label="verificación del máximo"
          />
        </li>
        {next !== undefined && (
          <li>
            Verificar el siguiente usuario.
            <Formula
              expression={checkTex(maximum + 1, next, thresholdMs)}
              label="verificación del siguiente usuario"
            />
          </li>
        )}
        <li>
          Interpretar: el máximo operativo es {users(maximum)}.
          {comparison &&
            ` Al exigir ${threshold} en lugar de ${formatters.milliseconds(comparison.thresholdMs)}, la capacidad permitida baja de ${users(comparison.maximumIntegerUsers)} a ${users(maximum)}: ${users(comparison.maximumIntegerUsers - maximum)} menos. Un objetivo de respuesta más estricto reduce la carga admisible.`}{' '}
          Es un resultado del modelo hipotético, no de una prueba real de rendimiento.
        </li>
      </ol>
      <div className="opt-example__actions">
        <Button variant="secondary" onClick={onLoad}>
          {isLoaded ? (
            <Check aria-hidden="true" size={16} />
          ) : (
            <Play aria-hidden="true" size={16} />
          )}
          Cargar ejemplo de {threshold}
        </Button>
        <span role="status">{isLoaded ? 'Umbral cargado en el laboratorio' : ''}</span>
        <ExportButton
          figureId={figureId}
          values={{ users: load, view: 'focus' }}
          label={`Exportar escenario ${number}`}
        />
      </div>
    </Card>
  );
}
