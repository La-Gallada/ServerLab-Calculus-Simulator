import type { ExportFigure } from './types';

export const authorshipNote =
  'Nota. Elaboración propia mediante ServerLab, a partir del modelo matemático hipotético utilizado en el Proyecto de Investigación #4 de Cálculo I.';

export const hypotheticalNotice =
  'Aclaración: los valores provienen de un modelo hipotético y provisional; no son mediciones de un servidor real.';

/** Ficha académica en texto plano. No asigna numeración de figura. */
export function academicRecord(figure: ExportFigure): string {
  return [
    `Título: ${figure.title}`,
    `Descripción: ${figure.description}`,
    'Variables y unidades:',
    ...figure.variables.map((v) => `- ${v.symbol}: ${v.meaning} (${v.unit})`),
    'Parámetros utilizados:',
    ...(figure.parameters.length
      ? figure.parameters.map((p) => `- ${p.label}: ${p.value}`)
      : ['- Sin parámetros ajustables.']),
    `Dominio: ${figure.domain}`,
    'Modelo matemático:',
    ...figure.formulas.map((formula) => `- ${formula}`),
    `Identificador del modelo: ${figure.model.id}`,
    `Versión del modelo: ${figure.model.version} (${figure.model.status === 'provisional' ? 'provisional' : figure.model.status})`,
    `Escala gráfica: ${figure.scale}`,
    `Resumen: ${figure.summary}`,
    '',
    authorshipNote,
    hypotheticalNotice,
  ].join('\n');
}
