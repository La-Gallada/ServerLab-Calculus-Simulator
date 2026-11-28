# Evidencia reproducible M02

Esta tabla procede de los mismos casos ejecutados en `src/math/math.test.ts`; se calcula desde el motor, no desde el mockup.

| Muestra continua cerca de C=100 | R(n) ms |
|---:|---:|
| 90 | 1900 |
| 95 | 3900 |
| 99 | 19900 |
| 99.5 | 39900 |
| 99.9 | 199900 |
| 99.99 | 1999900 |

La tabla es de análisis continuo. No equivale a cargas operativas fraccionarias y no incluye n=100, que es una singularidad con límite positivo infinito.

