import type { ReactNode } from 'react';
import { Formula } from '../../components/ui/Formula';
import { mathModelConfig } from '../../config/model';
import { formatters } from '../../math';
import { approx, users } from './optimizationFormat';
import type { SolvedOptimization } from './optimizationFigures';
import {
  boundTex,
  checkTex,
  constraintTex,
  derivativeTex,
  domainTex,
  frontierTex,
  generalBoundTex,
  integerTex,
  multiplyTex,
  objectiveTex,
  reorganizeTex,
  responseTex,
  subtractBaseTex,
} from './optimizationTex';

interface Step {
  text: ReactNode;
  formulas: [expression: string, label: string][];
}

/** Procedimiento completo para el umbral seleccionado. */
export function OptimizationProcedure({
  thresholdMs,
  solution,
}: {
  thresholdMs: number;
  solution: SolvedOptimization;
}) {
  const { baseResponseMs: base, referenceCapacityUsers: capacity } = mathModelConfig.response;
  const threshold = formatters.milliseconds(thresholdMs);
  const steps: Step[] = [
    {
      text: 'Identificar la función y la restricción.',
      formulas: [
        [responseTex, 'función de respuesta'],
        [constraintTex(thresholdMs), 'restricción de respuesta'],
      ],
    },
    {
      text: 'Establecer el objetivo: la mayor cantidad entera de usuarios.',
      formulas: [[objectiveTex(thresholdMs), 'objetivo de optimización']],
    },
    {
      text: 'Verificar el dominio: el denominador es positivo.',
      formulas: [[domainTex, 'dominio operativo']],
    },
    {
      text: `Justificar el crecimiento. R′(n) nunca es cero: no hay máximo interior y la solución está en la frontera de la región factible.`,
      formulas: [[derivativeTex, 'primera derivada positiva']],
    },
    {
      text: 'Restar el tiempo base en ambos lados.',
      formulas: [[subtractBaseTex(thresholdMs), 'resta del tiempo base']],
    },
  ];

  if (solution.kind === 'feasible') {
    const { maximumIntegerUsers: maximum, continuousIntersectionUsers: frontier } = solution;
    const next = solution.responseAtNextUserMs;
    steps.push(
      {
        text: `Multiplicar por ${capacity} − n, que es positivo: el sentido de la desigualdad se conserva.`,
        formulas: [[multiplyTex(thresholdMs), 'multiplicación por el denominador']],
      },
      {
        text: 'Reunir los términos que contienen n.',
        formulas: [[reorganizeTex(thresholdMs), 'reorganización']],
      },
      {
        text: 'Despejar n dividiendo entre un factor positivo.',
        formulas: [
          [generalBoundTex, 'forma general de la cota'],
          [boundTex(thresholdMs), 'cota sustituida'],
        ],
      },
      {
        text: 'Obtener la frontera continua, donde R(n*) = L.',
        formulas: [[frontierTex(frontier), 'frontera continua']],
      },
      {
        text: 'Tomar el mayor entero que no la supera, dentro del dominio operativo.',
        formulas: [[integerTex(maximum), 'máximo entero']],
      },
      {
        text: 'Verificar la solución en R.',
        formulas: [
          [checkTex(maximum, solution.responseAtMaximumMs, thresholdMs), 'verificación del máximo'],
        ],
      },
      next === undefined
        ? {
            text: `El siguiente usuario (n = ${maximum + 1}) está fuera del dominio y no se evalúa.`,
            formulas: [],
          }
        : {
            text: 'Verificar que el siguiente usuario incumple la restricción.',
            formulas: [[checkTex(maximum + 1, next, thresholdMs), 'verificación del siguiente']],
          },
      {
        text: `Interpretar: con un objetivo de ${threshold}, el modelo admite como máximo ${users(maximum)}; la frontera continua ${approx(frontier)} no es una cantidad de usuarios.`,
        formulas: [],
      },
    );
  } else {
    steps.push({
      text: `Concluir: L es menor que el tiempo base de ${formatters.milliseconds(base)}, así que el lado derecho es negativo, mientras el izquierdo nunca lo es en el dominio. No existe solución factible, ni frontera, ni máximo (tampoco cero usuarios). Los pasos restantes no aplican.`,
      formulas: [],
    });
  }

  return (
    <ol>
      {steps.map((step, index) => (
        <li key={index}>
          {step.text}
          {step.formulas.map(([expression, label]) => (
            <Formula key={label} expression={expression} label={label} />
          ))}
        </li>
      ))}
    </ol>
  );
}
