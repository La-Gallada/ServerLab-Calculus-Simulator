import { mathModelConfig } from '../../config/model';
import { isRounded } from './optimizationFormat';

/*
 * Expresiones educativas. Toman los parámetros de la configuración activa y los
 * resultados del motor; no calculan soluciones.
 */
const {
  baseResponseMs: base,
  growthCoefficientMs: k,
  referenceCapacityUsers: c,
} = mathModelConfig.response;

/** Número en LaTeX: coma decimal, sin separador de miles. */
export const tex = (value: number) =>
  new Intl.NumberFormat('es-CR', { maximumFractionDigits: 7, useGrouping: false })
    .format(value)
    .replace(',', '{,}');

export const relation = (value: number) => (isRounded(value) ? '\\approx' : '=');

const subtract = (value: number) => `${tex(value)} - ${tex(base)}`;

export const responseTex = `R(n) = ${tex(base)} + \\frac{${tex(k)}n}{${tex(c)} - n}`;

export const constraintTex = (threshold: number) =>
  `${tex(base)} + \\frac{${tex(k)}n}{${tex(c)} - n} \\le ${tex(threshold)}`;

export const objectiveTex = (threshold: number) =>
  `\\max\\; n \\quad \\text{sujeto a} \\quad R(n) \\le ${tex(threshold)}`;

export const domainTex = `0 \\le n < ${tex(c)},\\; n \\in \\mathbb{Z} \\;\\Rightarrow\\; ${tex(c)} - n > 0`;

export const derivativeTex = `R'(n) = \\frac{kC}{(C-n)^{2}} = \\frac{${tex(k)}\\cdot ${tex(c)}}{(${tex(c)}-n)^{2}} > 0`;

export const subtractBaseTex = (threshold: number) =>
  `\\frac{${tex(k)}n}{${tex(c)} - n} \\le ${subtract(threshold)}`;

export const multiplyTex = (threshold: number) =>
  `${tex(k)}n \\le (${subtract(threshold)})(${tex(c)} - n)`;

export const reorganizeTex = (threshold: number) =>
  `(${subtract(threshold)} + ${tex(k)})\\,n \\le ${tex(c)}(${subtract(threshold)})`;

export const generalBoundTex = 'n \\le \\frac{C(L-B)}{L-B+k}';

export const boundTex = (threshold: number) =>
  `n \\le \\frac{${tex(c)}(${subtract(threshold)})}{${subtract(threshold)} + ${tex(k)}}`;

export const frontierTex = (frontier: number) => `n^{*} ${relation(frontier)} ${tex(frontier)}`;

export const integerTex = (maximum: number) =>
  `m = \\min\\left(\\lfloor n^{*} \\rfloor,\\; ${tex(c - 1)}\\right) = ${tex(maximum)}`;

export const checkTex = (count: number, response: number, threshold: number) =>
  `\\begin{aligned} R(${tex(count)}) &= ${tex(base)} + \\frac{${tex(k)}(${tex(count)})}{${tex(c)} - ${tex(count)}} \\\\ &${relation(response)} ${tex(response)} ${response <= threshold ? '\\le' : '>'} ${tex(threshold)} \\end{aligned}`;
