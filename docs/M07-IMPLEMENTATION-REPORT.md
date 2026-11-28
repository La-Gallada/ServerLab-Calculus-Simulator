# M07 — Laboratorio de optimización

**Fecha:** 27 de noviembre de 2026  
**Estado:** completado; veredicto **GO** para M08 (requiere autorización explícita).

## Estado inicial

M00–M06 completos, rama `main` sin commits y todo sin seguimiento. Antes de modificar código: `typecheck` aprobado y 89 pruebas unitarias aprobadas.

## Formulación matemática

Maximizar n sujeto a R(n) ≤ L, 0 ≤ n < C, n entero, con R(n) = B + kn/(C − n).

R′(n) = kC/(C − n)² > 0, así que R es estrictamente creciente. No existe un máximo interior obtenido con R′(n) = 0: la solución está en la frontera de la región factible. Si L ≥ B, la cota es n ≤ C(L − B)/(L − B + k) y el máximo entero m = min(⌊n*⌋, C − 1).

| Caso             | Tratamiento                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------ |
| L < B            | «Sin solución»: sin frontera, región factible ni verificación; el procedimiento se detiene |
| L = B            | Sólo n = 0; frontera 0 y región factible reducida a un punto                               |
| L > B            | Frontera continua, máximo entero, R(m) y R(m + 1)                                          |
| m = C − 1 = 99   | El siguiente usuario se declara fuera del dominio; R(100) no se evalúa                     |
| Entrada inválida | Mensaje explícito y se conserva el último valor válido; nunca se convierte en cero         |

## Implementación

`/optimizacion` reemplaza al marcador de posición: planteamiento, cuatro métricas, detalle de la solución, tres figuras, controles, tabla de cinco escenarios, dos aplicaciones académicas (500 y 300 ms), procedimiento dinámico de trece pasos, interpretación, relación con Ingeniería en Sistemas y navegación.

| Archivo en `src/features/optimization/`                | Responsabilidad                             |
| ------------------------------------------------------ | ------------------------------------------- |
| `OptimizationLab.tsx`                                  | Composición y estado local                  |
| `ThresholdField.tsx`                                   | Borrador de texto confirmado con Enter/blur |
| `optimizationInput.ts`                                 | Rangos de interacción, escenarios y lectura |
| `optimizationFigures.ts`                               | Definiciones y datos de las figuras         |
| `ResponseRegionChart.tsx`                              | O-01: R(n), umbral y regiones               |
| `VerificationChart.tsx`                                | O-02: ampliación en torno a m               |
| `CapacityChart.tsx`                                    | O-03: umbral frente a capacidad             |
| `OptimizationProcedure.tsx`, `ScenarioApplication.tsx` | Procedimiento y aplicaciones                |
| `optimizationTex.ts`, `optimizationFormat.ts`          | Expresiones KaTeX y formato es-CR           |
| `chartMarks.tsx`, `chartTheme.ts`, `FigureLegend.tsx`  | Formas, trama, ejes y leyenda               |

Reutilizado: `optimizeResponseThreshold`, `responseTime`, `responseCurve`, `SimulationProvider`, `Card`, `Button`, `Formula` y estilos de encabezado, paneles, selector y procedimiento. Sin dependencias nuevas. El motor y el modelo no se modificaron.

La interfaz sólo calcula restas de presentación (L − R(n) y m − n). La cota, el máximo, R(m), R(m + 1) y el margen en m provienen del motor.

## Estado local

`{L, n}` y la escala vertical son estado local. Al entrar, L y n toman `thresholdMs` y `concurrentUsers` del Dashboard. **Reiniciar laboratorio** recupera esos valores y descarta el borrador del campo. El laboratorio nunca llama a `update`.

## Controles

- Deslizador de umbral: 50 a 2 000 ms, paso 1. Desde un valor decimal, las flechas van al entero contiguo.
- Campo exacto: 0 a 25 000 ms, hasta dos decimales, sin separador de miles. El texto es un borrador: sólo se aplica con Enter o al salir; Escape lo descarta.
- Predefinidos: 50, 100, 300, 500 y 1 000 ms, más «Último usuario: R(99)», calculado por el motor.
- Estos rangos son de interacción; el motor admite cualquier umbral finito.

## Estrategia gráfica

- **O-01:** eje lineal. La vista enfocada ajusta el máximo del eje Y e indica qué queda fuera; «Dominio completo» incluye R(99). La curva se muestrea cada 0,25 usuarios hasta 99 y sólo se prolonga hasta n* cuando n* > 99. La región factible es [0, n*]; la no factible (rayada), [n*, 100]. Intersección, máximo, siguiente usuario y carga usan formas distintas.
- **O-02:** como en O-01 esos puntos quedan muy juntos, se amplía de m − 3 a m + 4.
- **O-03:** la escalera usa los saltos exactos L = R(m) (`stepAfter`); la frontera continua aparece discontinua. Por debajo de B no hay datos y la zona se rotula «sin solución».

Identificadores: `optimization-response-region`, `optimization-integer-verification`, `optimization-threshold-capacity`, `optimization-scenario-500` y `optimization-scenario-300`. Cada definición guarda título, unidades, leyenda, modelo y versión, parámetros y datos. Las dos de escenario existen como definición e identificador en su tarjeta; no tienen gráfica propia. No hay exportación (M08).

## Validación de soluciones

| L (ms) | n*         | m            |        R(m) |      R(m + 1) |
| -----: | ---------- | ------------ | ----------: | ------------: |
|     50 | —          | sin solución |           — |             — |
|    100 | 0          | 0            |         100 |   102,0202020 |
|    300 | 50         | 50           |         300 |   308,1632653 |
|    500 | 66,6666667 | 66           | 488,2352941 |   506,0606061 |
|  1 000 | 81,8181818 | 81           | 952,6315789 | 1 011,1111111 |
| 19 900 | 99         | 99           |      19 900 |     no existe |

Se verificaron por búsqueda exhaustiva independiente antes de programar. Antes de implementar se contrastaron además todos los umbrales de dos decimales entre 100 y 25 000 ms con la fórmula del motor, sin discrepancias; la prueba unitaria repite una muestra de uno de cada siete céntimos y los umbrales exactos R(m).

## Protección de evidencias

`tests/e2e/evidence.ts` dirige las capturas a `test-results/evidence/` (ignorado por Git) salvo que `EVIDENCE` nombre el hito. Se cambiaron únicamente las rutas de captura de las cinco suites anteriores.

```powershell
$env:EVIDENCE='M07'; npx playwright test optimization; Remove-Item Env:EVIDENCE
```

Tras la suite completa sin `EVIDENCE`, los hashes de los 47 archivos de M01–M06 y de las 12 capturas de M07 fueron idénticos a los previos.

## Problemas encontrados y corregidos

| Detectado por   | Problema                                                   | Corrección                        |
| --------------- | ---------------------------------------------------------- | --------------------------------- |
| E2E             | Títulos del eje Y recortados                               | Mayor margen izquierdo            |
| E2E             | Flechas desde un umbral decimal saltaban cerca de 20 ms    | Entero contiguo                   |
| E2E             | Etiquetas encimadas o recortadas con L = 50, 100 y 19 900  | Posición según cercanía a bordes  |
| Revisión visual | Rótulo «No factible» sobre la curva                        | Alineado arriba a la derecha      |
| Revisión visual | Marcas irregulares y nota inexacta sobre el origen en O-02 | Marcas redondas y texto corregido |
| Revisión visual | Fórmula del planteamiento partida a 1280 px                | Dos líneas explícitas             |

## Validación técnica

| Comando                | Resultado                                          |
| ---------------------- | -------------------------------------------------- |
| `npm ci`               | PASS — 285 paquetes; 0 vulnerabilidades reportadas |
| `npm run typecheck`    | PASS                                               |
| `npm run lint`         | PASS                                               |
| `npm run format:check` | PASS                                               |
| `npm run test:run`     | PASS — 142 pruebas en 9 archivos (89 previas)      |
| `npm run build`        | PASS — con el aviso de Vite por chunk > 500 kB     |
| `npm run test:e2e`     | PASS — 8 pruebas Chromium (6 previas)              |

`npm ci` se ejecutó antes del último ajuste de presentación (una fórmula); los demás comandos se repitieron después. Las dependencias no cambiaron.

Bundle: JavaScript **314,30 kB gzip** (antes 304,14); CSS 16,28 kB gzip (antes 14,80).

La E2E de Optimización comprueba en píxeles que regiones, frontera, umbral e intersección coinciden; etiquetas SVG sin choques ni recortes; teclado; escritura tecla por tecla; cuatro viewports y 320 px sin desbordamiento; KaTeX; sin errores o avisos de consola, solicitudes fallidas o externas; e independencia del Dashboard.

Cambios en pruebas previas: `navigation.spec.ts` e `integrals.spec.ts` esperan el nuevo encabezado, y el enlace de Integrales pasó de «Ver Optimización (planificada)» a «Ver Optimización».

## Deuda técnica para M09

- El campo numérico de Integrales aplica valores válidos durante la escritura (`35` puede dejar `3`). El patrón de borrador de Optimización sirve de referencia.
- Las listas de procedimiento de Límites y Derivadas no muestran numeración.
- La tabla y los ejemplos de Integrales dependen del dominio provisional de 30 s. En Optimización, los escenarios, rangos de interacción y aplicaciones de 500 y 300 ms suponen el modelo actual.
- Chunk mayor de 500 kB; falta carga diferida de pantallas y dependencias.
- La separación de evidencias ya está resuelta para las capturas; falta decidir si se automatiza como script de npm.
- `package.json` declara versiones `latest`.

## Limitaciones

- No se midió contraste con herramienta ni se probó un lector de pantalla.
- Sólo Chromium; sin Firefox, Safari ni dispositivos físicos.
- En O-01 la región factible o no factible muy estrecha se identifica por la leyenda, sin rótulo interno.
- El campo exacto rechaza `1 000` o `1.000`, aunque la interfaz muestre miles separados; el mensaje lo indica.
- El modelo sigue siendo hipotético y provisional.

## Criterios de aceptación

| Criterio                                            | Estado |
| --------------------------------------------------- | ------ |
| Ruta `/optimizacion` funcional                      | PASS   |
| Controles interactivos                              | PASS   |
| Métricas provenientes del motor                     | PASS   |
| Región factible correcta                            | PASS   |
| Intersección continua correcta                      | PASS   |
| Máximo entero verificado                            | PASS   |
| Siguiente usuario verificado cuando existe          | PASS   |
| Casos sin solución                                  | PASS   |
| Umbral igual al tiempo base                         | PASS   |
| Último usuario operativo                            | PASS   |
| Procedimiento matemático correcto                   | PASS   |
| Relación con la primera derivada explicada          | PASS   |
| Ejemplos académicos desarrollados                   | PASS   |
| Tabla dinámica                                      | PASS   |
| Estado local sin alterar el Dashboard               | PASS   |
| Sin fórmulas operativas duplicadas                  | PASS   |
| Identidad visual consistente                        | PASS   |
| Interfaz adaptable y accesible (alcance verificado) | PASS   |
| Pruebas existentes y nuevas aprobadas               | PASS   |
| Build de producción funcional                       | PASS   |
| Evidencias visuales reales                          | PASS   |
| Evidencias anteriores conservadas                   | PASS   |
| Sin regresiones detectadas                          | PASS   |
| Sin commits, push ni despliegues                    | PASS   |

No se inició M08.
