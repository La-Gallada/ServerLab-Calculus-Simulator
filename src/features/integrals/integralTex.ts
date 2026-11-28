import { mathModelConfig } from '../../config/model';

const digits = 6;

export const formatExact = (value: number) =>
  new Intl.NumberFormat('es-CR', { maximumFractionDigits: digits }).format(value);

/** Número en LaTeX con coma decimal sin espacio adicional. */
export const tex = (value: number) => formatExact(value).replace(',', '{,}');

const isRounded = (value: number) => Math.abs(value - Number(value.toFixed(digits))) > 1e-9;

/** `=` cuando todos los valores mostrados son exactos; `≈` si alguno se redondeó. */
export const relation = (...values: number[]) => (values.some(isRounded) ? '\\approx' : '=');

const { initialRateMbps: initialRate, rateIncreaseMbpsPerSecond: increase } =
  mathModelConfig.transfer;
/** Coeficiente que se muestra en la antiderivada; los resultados provienen del motor. */
const halfIncrease = increase / 2;

export const integrandTex = `${tex(initialRate)} + ${tex(increase)}t`;

export const rateTex = `T(t) = ${integrandTex}`;

export const accumulationTex = `A(t) = ${tex(initialRate)}t + ${tex(halfIncrease)}t^{2}`;

export const definiteIntegralTex = (a: number, b: number) =>
  `D(${tex(a)};\\,${tex(b)}) = \\int_{${tex(a)}}^{${tex(b)}} T(t)\\,dt`;

export const integrandStepTex = (a: number, b: number) =>
  `\\int_{${tex(a)}}^{${tex(b)}} \\left(${integrandTex}\\right) dt`;

export const separatedTermsTex = (a: number, b: number) =>
  `\\int_{${tex(a)}}^{${tex(b)}} ${tex(initialRate)}\\,dt + \\int_{${tex(a)}}^{${tex(b)}} ${tex(increase)}t\\,dt`;

export const rulesTex = `\\int c\\,dt = ct, \\quad \\int kt\\,dt = \\frac{k}{2}t^{2}`;

export const fundamentalTheoremTex = (a: number, b: number) =>
  `\\Big[A(t)\\Big]_{${tex(a)}}^{${tex(b)}} = A(${tex(b)}) - A(${tex(a)})`;

export const evaluationTex = (seconds: number, accumulated: number) =>
  `\\begin{aligned} A(${tex(seconds)}) &= ${tex(initialRate)}(${tex(seconds)}) + ${tex(halfIncrease)}(${tex(seconds)})^{2} \\\\ &${relation(accumulated)} ${tex(accumulated)}\\ \\mathrm{MB} \\end{aligned}`;

export const differenceTex = (fromStart: number, toEnd: number, total: number) =>
  `A(b) - A(a) ${relation(fromStart, toEnd, total)} ${tex(toEnd)} - ${tex(fromStart)}`;

export const resultTex = (a: number, b: number, total: number) =>
  `D(${tex(a)};\\,${tex(b)}) ${relation(total)} ${tex(total)}\\ \\mathrm{MB}`;
