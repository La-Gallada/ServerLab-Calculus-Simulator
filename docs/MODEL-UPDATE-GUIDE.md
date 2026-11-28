# Guía de actualización del modelo matemático

Para adaptar ServerLab cuando el grupo entregue las funciones definitivas. No cambiar el modelo sin su confirmación y autorización.

## Antes de tocar código

1. Recibir por escrito: expresiones, parámetros, dominios (continuo y operativo), unidades, supuestos y valores de ejemplo.
2. Clasificar el cambio: **A** (mismas expresiones, otros números) o **B** (otras expresiones, dominios o tipos de función). Ante la duda, es B.
3. Comprobar las propiedades que el código y los textos dan por ciertas (tabla siguiente).
4. Calcular a mano o con otra herramienta algunos valores de referencia **antes** de implementar.

| Supuesto actual                                               | Dónde se aprovecha                                                       |
| ------------------------------------------------------------- | ------------------------------------------------------------------------ |
| R es estrictamente creciente en 0 ≤ n < C                     | Búsqueda binaria de `optimization.ts`, regiones y textos de Optimización |
| R′ > 0 y R″ > 0 (convexa)                                     | Escalas logarítmicas, textos de Derivadas, `audit.test.ts`               |
| Asíntota vertical en C con límite +∞                          | `limits.ts` (resultado fijo), Límites, validaciones, gráficas            |
| R(0) = B es el tiempo base                                    | Casos «sin solución» y «L = B»                                           |
| T es lineal y A es su antiderivada con A(0) = 0               | `transfer.ts`, `integralTex.ts`, figuras de integrales                   |
| Usuarios enteros de 0 a C − 1; tiempo continuo en [0, máximo] | `domain.ts`, `validation.ts`, controles                                  |

Si alguno deja de cumplirse, es escenario B.

## Mapa del modelo

| Capa                    | Archivos                                                                                                                                                                  |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Parámetros y versión    | `src/config/model.ts` (incluye valores iniciales, umbrales y unidades)                                                                                                    |
| Valores derivados       | `src/config/domain.ts`                                                                                                                                                    |
| Respuesta               | `src/math/response.ts`                                                                                                                                                    |
| Derivadas y tangente    | `src/math/derivatives.ts`                                                                                                                                                 |
| Límites                 | `src/math/limits.ts`                                                                                                                                                      |
| Transferencia           | `src/math/transfer.ts`                                                                                                                                                    |
| Optimización            | `src/math/optimization.ts` (la frontera continua tiene **fórmula cerrada propia**)                                                                                        |
| Validación y tipos      | `src/math/validation.ts`, `types.ts`, `snapshot.ts`, `formatters.ts`                                                                                                      |
| Expresiones KaTeX       | `features/optimization/optimizationTex.ts`, `features/integrals/integralTex.ts`; en línea en `LimitsLab.tsx` y `DerivativesLab.tsx`                                       |
| Textos y procedimientos | `LimitsLab.tsx`, `DerivativesLab.tsx`, `IntegralsLab.tsx`, `ExampleApplication.tsx`, `OptimizationProcedure.tsx`, `ScenarioApplication.tsx`, `Dashboard.tsx`, `About.tsx` |
| Tablas y muestreo       | `limitCases.ts`, `derivativeWindow.ts`, `responseViews.ts`; tablas en cada laboratorio                                                                                    |
| Ejemplos fijos          | `integralFigures.ts` (`exampleApplications`), `optimizationFigures.ts` (`optimizationScenarios`), `exampleLoads` en Derivadas, `limitDistances`                           |
| Gráficas                | Componentes de cada `features/*`                                                                                                                                          |
| Figuras exportables     | `export/figures/*.ts` (fórmulas, notas, títulos, ejes, escalas, nombres), `export/registry.ts`                                                                            |
| Metadatos y autoría     | `export/metadata.ts`, `config/authorship.ts`                                                                                                                              |
| Documentos              | `MATHEMATICAL-MODEL.md`, `MATH-API.md`, `MATHEMATICAL-VALIDATION.md`, guías académicas y catálogo                                                                         |

Los estados iniciales salen de `mathModelConfig.controls`; los rangos de Optimización se derivan en `optimizationInput.ts`.

## Escenario A: cambian sólo parámetros

1. Editar `model.ts`: valores, `version` y, si cambia, `id`. Mantener `status: 'provisional'` hasta la confirmación.
2. Revisar `controls` (valores iniciales y umbrales) dentro de los nuevos dominios; `validateModelConfig` sólo comprueba condiciones básicas.
3. Revisar ejemplos fijos: [0,30] y [10,20] s, escenarios de 300 y 500 ms, 65 usuarios. La interfaz declara los que dejen de ser válidos, pero hay que decidir cuáles los sustituyen.
4. Revisar decisiones de presentación que dependen de la forma numérica: distancias y ventana de los límites, ventana de la tangente, rangos de ejes y escalas logarítmicas.
5. Ejecutar `npm run test:run`. **Es esperable que fallen** pruebas con valores literales.
6. Actualizar los valores esperados sólo tras verificarlos de forma independiente.

## Escenario B: cambian expresiones, dominios o tipos de función

1. Actualizar primero `MATHEMATICAL-MODEL.md` y registrar la decisión en `DECISIONS.md`.
2. Ampliar la configuración (nuevos parámetros) y `validation.ts`.
3. Reimplementar las funciones del motor manteniendo la forma de `MathResult` para no tocar consumidores sin necesidad.
4. Optimización: si R deja de ser creciente, la búsqueda binaria **deja de ser válida**; reformular el algoritmo, la región factible (puede no ser un intervalo) y la figura. Sustituir la fórmula de la frontera.
5. Límites: revisar el tipo `LimitResult`, la asíntota y los casos de aproximación.
6. Integrales: nueva antiderivada comprobada numéricamente; revisar `integralTex.ts` y su coeficiente k/2.
7. Reescribir procedimientos, interpretaciones y afirmaciones (signos, monotonía, convexidad).
8. Revisar cada gráfica interactiva y cada definición exportable: dominios, ticks, escalas, regiones y rótulos.
9. Sustituir pruebas matemáticas y de interfaz; conservar los casos de entradas inválidas.

## Pruebas que dependen del modelo

| Archivo                                                                              | Contenido dependiente                        |
| ------------------------------------------------------------------------------------ | -------------------------------------------- |
| `math/math.test.ts`, `audit.test.ts`, `optimization.test.ts`, `presentation.test.ts` | valores y expresiones                        |
| `export/export.test.ts`, `features/**/*.test.ts(x)`, `app/*.test.tsx`                | resultados mostrados y nombres de archivo    |
| `config/alternateModel.test.tsx`                                                     | comportamiento ante otra configuración       |
| `tests/e2e/*.spec.ts`                                                                | valores, textos y contraste CSV con el motor |

## Después de implementar

1. `npm run typecheck`, `lint`, `format:check`, `test:run`, `build`, `test:e2e`.
2. Revisar visualmente las 15 figuras y cada laboratorio.
3. Regenerar el paquete académico (`ACADEMIC_PACKAGE=1`) y revisar su selección e interpretaciones en `tests/e2e/academic-package.spec.ts`.
4. Actualizar el guion de exposición y las guías.
5. Cambiar `status` y quitar «provisional» **sólo** con la confirmación del grupo; los textos que lo declaran están en la interfaz, las figuras y las fichas.
6. Reemplazar las figuras ya insertadas en el documento: las anteriores quedan obsoletas. Las capturas de `docs/evidence/` son históricas y no se modifican.
