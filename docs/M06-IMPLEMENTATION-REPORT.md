# M06 — Laboratorio de integrales

**Fecha:** 27 de noviembre de 2026  
**Estado:** completado; veredicto **GO** para M07 (requiere autorización explícita).

## Transferencia de contexto y estado recuperado

M00–M05 se planificaron con ChatGPT y se implementaron con OpenAI Codex; M06 lo implementó Claude Sonnet a partir de `AGENTS.md` y `docs/`. Se añadió `CLAUDE.md` como puntero breve, sin duplicar reglas.

Antes de modificar archivos se confirmó: rama `main` sin commits y todo sin seguimiento; `typecheck` aprobado; 48 pruebas unitarias aprobadas. Las 4 pruebas E2E previas no se ejecutaron como línea base; se ejecutaron al final junto con las nuevas. No se consultó el Google Doc colaborativo ni el PDF de avance.

## Implementación

`/integrales` reemplaza al marcador de posición: tarjeta de función, cuatro métricas (D(a,b), b − a, T(a), T(b)), dos representaciones, controles de límites, dos aplicaciones académicas de diez pasos, tabla de referencia, procedimiento KaTeX dinámico de ocho pasos, interpretación, relación con Ingeniería en Sistemas y navegación.

| Archivo en `src/features/integrals/` | Responsabilidad                                         |
| ------------------------------------ | ------------------------------------------------------- |
| `IntegralsLab.tsx`                   | Composición y estado local                              |
| `LimitControl.tsx`                   | Slider entero y campo decimal validado                  |
| `IntegralChart.tsx`                  | Gráficas Recharts de T(t) y A(t)                        |
| `ExampleApplication.tsx`             | Aplicaciones [0,30] y [10,20]                           |
| `integralFigures.ts`                 | Series, identificadores y metadatos de figuras          |
| `integralTex.ts`                     | Expresiones KaTeX compartidas por ejemplos y desarrollo |

Reutilizado: motor M02, `SimulationProvider`, `Card`, `Button`, formateadores es-CR y los estilos de encabezado, paneles, selector, tabla y procedimiento. Nuevo componente compartido: `components/ui/Formula.tsx`; Límites y Derivadas conservan sus copias locales para no tocar hitos validados. Sin dependencias nuevas.

## Estado local

El laboratorio guarda sólo `{a, b}` y el modo gráfico. Al montar usa `a = 0` y `b = input.transferTimeSeconds` del Dashboard; nunca llama a `update`. **Reiniciar intervalo** restaura `[0, duración actual del Dashboard]` y conserva el modo gráfico. Al salir y volver se parte de nuevo del intervalo inicial.

## Integración matemática y casos especiales

`transferRate`, `accumulatedData`, `transferredData` y `transferCurve` producen todos los resultados. La interfaz sólo calcula la duración `b − a`. Las expresiones KaTeX toman T₀ y k de `mathModelConfig`; el coeficiente k/2 se deriva únicamente para mostrar la antiderivada.

- Intervalo invertido: cada slider se detiene en el otro límite; el campo numérico muestra el error del motor y conserva el último valor válido. Nunca se intercambian a y b.
- Intervalo de longitud cero: D = 0 MB, sin área ni segmento de diferencia, con una sola etiqueta `a = b`.
- Decimales: hasta dos, con coma o punto. Desde un valor decimal, las flechas del slider avanzan al entero contiguo.
- Se rechazan vacío, texto, `NaN`, `Infinity`, más de dos decimales, negativos, valores mayores que 30 y números que desbordan a infinito.
- Duración 0 en el Dashboard: el laboratorio abre en [0,0].
- El procedimiento muestra `≈` si algún valor requiere redondeo a seis decimales.

## Estrategia gráfica

La serie combina el dominio completo (paso de 0,5 s) con los extremos exactos a y b obtenidos de `transferCurve`. El área existe sólo donde `a ≤ t ≤ b`, se apoya en cero (eje Y de 0 a 12 MB/s) y no se dibuja si `a = b`. En A(t) se muestran la curva, el tramo seleccionado, los puntos A(a) y A(b) y un segmento vertical con la diferencia; no hay área bajo A(t).

Cada figura (`integrals-rate-area`, `integrals-accumulated-data`, `integrals-example-0-30`, `integrals-example-10-20`) se describe con título, ejes, unidades, leyenda, modelo y versión, intervalo y datos numéricos. Las dos primeras se renderizan; las de los ejemplos existen como definición (`buildIntegralFigure`) e identificador en su tarjeta, y comparten la gráfica principal al cargarlos. No hay exportación ni botones de exportación (M08).

## Valores verificados

Los valores de T y A en t = 0, 5, …, 30 y las integrales D(0,30) = 240, D(10,20) = 80, D(0,10) = 60, D(20,30) = 100, D(5,15) = 70 y D(15,15) = 0 MB se comprobaron por integración numérica independiente (regla del punto medio) y en pruebas unitarias. También: aditividad, A′ = T, tasa positiva, acumulación creciente y rechazo de entradas inválidas.

## Problemas encontrados y corregidos

| Problema detectado                                                  | Corrección                           |
| ------------------------------------------------------------------- | ------------------------------------ |
| Recharts conservaba un trazo de área con intervalo cero             | El componente de área no se monta    |
| Un tooltip oculto ensanchaba la página al reducir el viewport (E2E) | `overflow: hidden` en la gráfica     |
| Etiqueta `a = 0 s` encimada con la marca superior del eje Y         | Mayor margen y separación            |
| Tailwind quitaba la numeración de los procedimientos                | Numeración restaurada en Integrales  |
| La tabla requería desplazamiento interno en móvil                   | Diseño compacto con botones apilados |

## Validación técnica

| Comando                | Resultado                                          |
| ---------------------- | -------------------------------------------------- |
| `npm ci`               | PASS — 285 paquetes; 0 vulnerabilidades reportadas |
| `npm run typecheck`    | PASS                                               |
| `npm run lint`         | PASS                                               |
| `npm run format:check` | PASS                                               |
| `npm run test:run`     | PASS — 89 pruebas en 7 archivos (48 previas)       |
| `npm run build`        | PASS — con el aviso de Vite por chunk > 500 kB     |
| `npm run test:e2e`     | PASS — 6 pruebas Chromium (4 previas)              |

Bundle principal: **304,14 kB gzip** (antes 297,94); CSS 14,80 kB gzip. KaTeX y sus fuentes se sirven desde `dist/assets`.

La prueba E2E de Integrales comprueba en píxeles que el área coincide con las líneas a y b y parte de cero; teclado; cuatro viewports (y 320 px sin desbordamiento); fórmulas sin recorte; fuentes KaTeX cargadas; sin errores ni avisos de consola, solicitudes fallidas o externas; e independencia del Dashboard.

Único cambio en pruebas previas: `navigation.spec.ts` espera ahora el encabezado «Laboratorio de integrales». Las suites E2E anteriores sobrescriben sus capturas al ejecutarse; las carpetas M01–M05 se restauraron desde una copia previa y sus hashes coinciden.

## Limitaciones y riesgos

- El campo numérico aplica cada valor válido mientras se escribe: al teclear `35` en b, `3` puede aplicarse antes de que `35` se rechace. El aviso indica el valor conservado.
- Accesibilidad verificada con etiquetas, roles, teclado y revisión visual; no se midió contraste con herramienta ni se probó un lector de pantalla.
- Sólo Chromium; sin Firefox, Safari ni dispositivos físicos.
- Límites y Derivadas siguen sin numeración visible en sus listas de procedimiento (preexistente, no modificado).
- Los marcadores de 5 s de la tabla y las gráficas suponen el dominio actual de 30 s; cambiarlo exige revisar la tabla y los ejemplos.
- `package.json` declara versiones `latest`; la reproducibilidad depende de `package-lock.json`.
- Carga diferida pendiente para M09. El modelo sigue siendo hipotético y provisional.

## Criterios de aceptación

| Criterio                                           | Estado |
| -------------------------------------------------- | ------ |
| Ruta `/integrales` funcional                       | PASS   |
| Cuatro métricas dinámicas                          | PASS   |
| Límites de integración interactivos                | PASS   |
| Área sombreada correspondiente al intervalo        | PASS   |
| Gráfica de acumulación matemáticamente correcta    | PASS   |
| Ambos modos gráficos funcionan                     | PASS   |
| Dos aplicaciones académicas desarrolladas          | PASS   |
| Procedimiento KaTeX correcto                       | PASS   |
| Intervalos de longitud cero                        | PASS   |
| Intervalos invertidos impedidos                    | PASS   |
| Tabla con datos del motor                          | PASS   |
| Estado local sin alterar el Dashboard              | PASS   |
| Sin fórmulas operativas duplicadas                 | PASS   |
| Identidad visual mantenida                         | PASS   |
| Interfaz adaptable                                 | PASS   |
| Pruebas nuevas y anteriores aprobadas              | PASS   |
| Build de producción funcional                      | PASS   |
| Evidencias visuales reales                         | PASS   |
| Sin regresiones detectadas por las pruebas M03–M05 | PASS   |
| Sin commits, push ni despliegues                   | PASS   |

No se inició M07.
