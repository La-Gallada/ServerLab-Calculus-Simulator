import { Check, Play } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Formula } from '../../components/ui/Formula';
import { accumulatedData, formatters, transferredData } from '../../math';
import {
  accumulationTex,
  definiteIntegralTex,
  evaluationTex,
  rateTex,
  resultTex,
  rulesTex,
  separatedTermsTex,
  differenceTex,
} from './integralTex';
import { ExportButton } from '../exports/ExportButton';

interface ExampleApplicationProps {
  number: number;
  figureId: string;
  startSeconds: number;
  endSeconds: number;
  isLoaded: boolean;
  onLoad: () => void;
}

export function ExampleApplication({
  number,
  figureId,
  startSeconds: a,
  endSeconds: b,
  isLoaded,
  onLoad,
}: ExampleApplicationProps) {
  const atA = accumulatedData(a);
  const atB = accumulatedData(b);
  const total = transferredData(a, b);
  if (!atA.ok || !atB.ok || !total.ok)
    return (
      <Card className="procedure-card example-card" data-figure-id={figureId}>
        <p className="eyebrow">Aplicación académica {number}</p>
        <h2>
          Ejemplo [{a}, {b}] no disponible
        </h2>
        <p role="note">
          Este ejemplo académico fijo no es válido con la configuración actual del modelo:{' '}
          {total.ok ? 'no fue posible evaluarlo.' : total.error.message}
        </p>
      </Card>
    );
  const interval = `[${a}, ${b}]`;
  const fromStart = a === 0;

  return (
    <Card className="procedure-card example-card" data-figure-id={figureId}>
      <p className="eyebrow">Aplicación académica {number}</p>
      <h2>
        {fromStart ? `Primeros ${b} segundos` : `Entre los segundos ${a} y ${b}`}{' '}
        <span className="example-card__interval">{interval}</span>
      </h2>
      <p>
        Escenario hipotético: ¿cuántos datos transfiere el servidor{' '}
        {fromStart ? `durante los primeros ${b} segundos` : `entre t = ${a} s y t = ${b} s`}?
      </p>
      <ol>
        <li>
          Identificar la tasa de transferencia, en MB/s.
          <Formula expression={rateTex} label="tasa de transferencia" />
        </li>
        <li>
          Establecer los límites de integración: a = {a} s y b = {b} s.
          <Formula expression={definiteIntegralTex(a, b)} label="integral definida" />
        </li>
        <li>
          Separar los términos.
          <Formula expression={separatedTermsTex(a, b)} label="términos separados" />
        </li>
        <li>
          Aplicar las reglas de la constante y de la potencia.
          <Formula expression={rulesTex} label="reglas básicas de integración" />
        </li>
        <li>
          Obtener la antiderivada que cumple A(0) = 0.
          <Formula expression={accumulationTex} label="antiderivada" />
        </li>
        <li>
          Evaluar el límite superior.
          <Formula expression={evaluationTex(b, atB.value)} label="evaluación en b" />
        </li>
        <li>
          Evaluar el límite inferior.
          <Formula expression={evaluationTex(a, atA.value)} label="evaluación en a" />
        </li>
        <li>
          Restar los resultados.
          <Formula
            expression={differenceTex(atA.value, atB.value, total.value)}
            label="diferencia de evaluaciones"
          />
        </li>
        <li>
          Expresar la respuesta en MB, porque (MB/s) · s = MB.
          <Formula expression={resultTex(a, b, total.value)} label="resultado con unidades" />
        </li>
        <li>
          Interpretar:{' '}
          {fromStart
            ? `en este escenario hipotético, el servidor transfiere ${formatters.megabytes(total.value)} desde el inicio hasta el segundo ${b}.`
            : `A(${b}) = ${formatters.megabytes(atB.value)} es lo acumulado desde el inicio, mientras que D(${a}, ${b}) = ${formatters.megabytes(total.value)} es lo transferido exclusivamente durante el intervalo. La diferencia son los ${formatters.megabytes(atA.value)} previos a t = ${a} s.`}
        </li>
      </ol>
      <div className="example-card__actions">
        <Button variant="secondary" onClick={onLoad}>
          {isLoaded ? (
            <Check aria-hidden="true" size={16} />
          ) : (
            <Play aria-hidden="true" size={16} />
          )}
          Cargar ejemplo {interval}
        </Button>
        <span role="status">{isLoaded ? 'Intervalo cargado en el laboratorio' : ''}</span>
        <ExportButton figureId={figureId} label={`Exportar ejemplo ${number}`} />
      </div>
    </Card>
  );
}
