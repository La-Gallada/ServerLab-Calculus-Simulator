# API pública del motor matemático

Importar desde `src/math`. Todas las funciones son puras y devuelven `MathResult<T>` cuando una entrada puede ser inválida; no lanzan ni convierten silenciosamente valores inválidos.

| Área          | API principal                                                                                                        |
| ------------- | -------------------------------------------------------------------------------------------------------------------- |
| Respuesta     | `responseTime`, `operationalResponseTime`, `responseCurve`                                                           |
| Límites       | `limitAtZeroFromRight`, `limitAtCapacityFromLeft`, `verticalAsymptote`, `capacityApproximations`                     |
| Derivadas     | `firstDerivative`, `secondDerivative`, `discreteResponseIncrement`, `tangentLine`, `tangentCurve`, `derivativeCurve` |
| Transferencia | `transferRate`, `accumulatedData`, `transferredData`, `transferCurve`, `areaCurve`                                   |
| Optimización  | `optimizeResponseThreshold`                                                                                          |
| Simulación    | `initialSimulationInput`, `simulationSnapshot`                                                                       |
| Presentación  | `formatters`                                                                                                         |

`MathResult<T>` expresa éxito mediante `{ ok: true, value }` y un error explícito mediante `{ ok: false, error: { code, message } }`. Los límites usan `LimitResult`, con `kind: 'positive-infinity'` en vez de evaluar la singularidad.

`optimizeResponseThreshold` devuelve `invalid-threshold` para umbrales no finitos o negativos, `no-feasible-load` si 0 ≤ L < B y `feasible` en otro caso, con R(m) ≤ L, R(m+1) > L cuando existe, y una frontera en [m, m+1) menor que C. `src/config/domain.ts` deriva de la configuración la capacidad, el último usuario y la duración máxima.
