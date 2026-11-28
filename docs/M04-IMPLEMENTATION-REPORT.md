# M04 — Laboratorio de límites

**Fecha:** 27 de noviembre de 2026  
**Estado:** completado; veredicto **GO** para M05.

## Resultado

La ruta `/limites` dejó de ser un placeholder y ahora presenta un laboratorio interactivo para los dos límites laterales del modelo de tiempo de respuesta. La interfaz conserva el tema oscuro, el Application Shell y el lenguaje visual de M03; los cálculos continúan siendo hipotéticos y provisionales.

## Funcionalidades implementadas

- Función R(n), dominio y expresiones de límite renderizados con KaTeX.
- Selector accesible por radio para carga inicial (`n → 0⁺`) y capacidad (`n → 100⁻`).
- Resultado tipado: 100 ms para el primer caso y `+∞` matemático para el segundo, sin evaluar `R(100)`.
- Tabla calculada por el motor y selección de cada muestra para destacar su punto en la gráfica.
- Curva lineal para la aproximación inicial y escala Y logarítmica identificada para visualizar valores cercanos a la asíntota.
- Desarrollo paso a paso, interpretación académica, dos aplicaciones para Ingeniería en Sistemas y enlaces hacia Dashboard y Derivadas.

## Integración matemática

`LimitsLab` usa `responseTime`, `responseCurve`, `limitAtZeroFromRight`, `limitAtCapacityFromLeft` y `verticalAsymptote` desde `src/math`. La configuración central suministra B, k y C a las expresiones visibles. No se agregaron fórmulas operativas a React y el laboratorio no modifica `SimulationProvider`.

| Caso       | Resultado | Referencias verificadas                                                                 |
| ---------- | --------- | --------------------------------------------------------------------------------------- |
| `n → 0⁺`   | 100 ms    | R(10)=122,222222; R(5)=110,526316; R(1)=102,020202; R(0,01)=100,020002 ms               |
| `n → 100⁻` | +∞        | R(90)=1900; R(95)=3900; R(99)=19900; R(99,5)=39900; R(99,9)=199900; R(99,99)=1999900 ms |

Los datos se mantienen sin redondeo mientras circulan por el motor. La capa de presentación elimina únicamente un error de coma flotante menor que `0,00001` respecto a un entero, para que la tabla no muestre artefactos de JavaScript.

## Pruebas y build

| Comando                | Resultado                                                     |
| ---------------------- | ------------------------------------------------------------- |
| `npm ci`               | PASS — 285 paquetes instalados, 0 vulnerabilidades reportadas |
| `npm run typecheck`    | PASS                                                          |
| `npm run lint`         | PASS                                                          |
| `npm run test:run`     | PASS — 45 pruebas en 4 archivos                               |
| `npm run build`        | PASS — `dist/` contiene aplicación, assets y fuentes KaTeX    |
| `npm run format:check` | PASS                                                          |
| `npm run test:e2e`     | PASS — 3 pruebas Chromium                                     |

El bundle principal pasó de 214,28 kB gzip en M03 a 295,51 kB gzip; KaTeX además publica sus fuentes locales en `dist/assets`. El incremento es esperable por el renderizador de fórmulas y no bloquea M04; revisar división de código durante M09, sin reestructuración prematura ahora.

## Evidencia y revisión visual

Las ocho capturas reales y sus resoluciones están inventariadas en `docs/evidence/M04/README.md`. La revisión incluyó desktop y móvil: no se observó desbordamiento horizontal; las fórmulas se adaptan mediante un contenedor desplazable sólo si una expresión excede el ancho. Las diferencias intencionales frente al mockup son el énfasis académico, el uso de resultados correctos del motor y una asíntota como referencia, nunca como punto finito.

## Criterios de aceptación

| Criterio                                 | Estado |
| ---------------------------------------- | ------ |
| Ruta de Límites funcional                | PASS   |
| Dos casos matemáticos implementados      | PASS   |
| Fórmulas KaTeX correctas                 | PASS   |
| Procedimientos correctos                 | PASS   |
| Gráficas desde el motor M02              | PASS   |
| Tabla dinámica                           | PASS   |
| Controles de aproximación                | PASS   |
| Singularidad correcta                    | PASS   |
| Interpretaciones académicas coherentes   | PASS   |
| Continuo separado de usuarios operativos | PASS   |
| Coherencia visual con Dashboard          | PASS   |
| Pruebas existentes y nuevas              | PASS   |
| Build funcional                          | PASS   |
| Evidencia visual real                    | PASS   |
| Sin regresiones de M03                   | PASS   |
| Sin commits, push ni despliegue          | PASS   |

## Pendientes y siguiente paso

El modelo sigue sujeto a validación académica del grupo. La revisión visual independiente de M03 permanece pendiente según la autorización, pero no bloqueó M04. M05 puede consumir los muestreadores y el estado actual para desarrollar Derivadas; no se inició M05.
