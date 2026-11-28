/**
 * Las capturas versionadas de `docs/evidence` sólo se escriben cuando se pide
 * expresamente el hito (por ejemplo `EVIDENCE=M07`). En cualquier otra ejecución
 * van a `test-results/`, que Git ignora, y la evidencia histórica no cambia.
 */
export function evidenceDirectory(milestone: string): string {
  const root = process.env.EVIDENCE === milestone ? 'docs/evidence' : 'test-results/evidence';
  return `${root}/${milestone}`;
}
