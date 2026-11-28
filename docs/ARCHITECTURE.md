# Arquitectura de ServerLab

## Capas de M01

```text
src/
  app/            App, HashRouter y definición de rutas
  components/
    layout/       AppLayout, Header y Sidebar
    ui/           Button, Card, Badge, PageHeader, SectionPlaceholder
  config/         metadatos de páginas y versión del modelo
  features/dashboard/ Dashboard integrado con motor, tarjetas y gráficas Recharts
  math/           motor puro: validación, cálculo, muestreo y formato
  state/          SimulationProvider, contexto y hook de simulación compartida
  styles/         tokens CSS y comportamiento responsive
  test/           configuración de Testing Library
tests/e2e/         flujo de navegación Playwright
```

`src/config/model.ts` es la única fuente de parámetros y versión. M02 implementa `src/math/` con funciones puras, validación de dominio y tipos; las pantallas consumirán resultados tipados sin repetir fórmulas.

## Dashboard de M03

`SimulationProvider` conserva exclusivamente la entrada válida de simulación y expone `update` y `reset`. `Dashboard` obtiene una única instantánea con `simulationSnapshot(input)` para las métricas derivadas; las series se obtienen de `responseCurve`, `derivativeCurve` y `transferCurve`. Así, React sólo orquesta estado y presentación, sin fórmulas duplicadas.

La curva principal tiene dos resoluciones: `Carga habitual` muestrea hasta 80 usuarios para facilitar la lectura y `Dominio operativo` hasta 99. Ambos límites permanecen dentro del dominio: la capacidad `C=100` es una línea de referencia, jamás un dato evaluado. Recharts recibe puntos numéricos no formateados y los formateadores se aplican solamente en ejes, tooltips y textos.

## Laboratorio de límites de M04

`src/features/limits/LimitsLab.tsx` usa estado estrictamente local para el caso de límite y la distancia de aproximación. Este estado maneja números continuos y nunca escribe en `SimulationProvider`; por tanto, una aproximación como `99,99` no se confunde con los usuarios operativos enteros del Dashboard.

El módulo consume `responseTime`, `responseCurve`, `limitAtZeroFromRight`, `limitAtCapacityFromLeft` y `verticalAsymptote`. La curva y la tabla reciben valores numéricos del motor; sólo los adaptadores de presentación redondean ruido de punto flotante muy cercano a un entero. KaTeX recibe expresiones derivadas de `mathModelConfig`, no una segunda implementación operativa de la fórmula.

## Laboratorio de integrales de M06

`src/features/integrals/` mantiene como estado local sólo el intervalo `[a,b]` (inicial: 0 y la duración de transferencia del Dashboard) y el modo gráfico; nunca escribe en `SimulationProvider`. Los resultados provienen de `transferRate`, `accumulatedData`, `transferredData` y `transferCurve`; la validación de límites también usa el motor.

`integralFigures.ts` construye cada figura como datos (identificador estable, título, ejes, unidades, leyenda, modelo y versión, intervalo y serie). La serie une el muestreo del dominio con los extremos exactos a y b. M08 podrá reutilizar estas definiciones en la exportación. La leyenda es HTML, fuera del SVG, por lo que el exportador deberá incorporarla desde la definición.

## Laboratorio de optimización de M07

`src/features/optimization/` mantiene `{L, n}` como estado local inicializado desde el Dashboard. La solución proviene de `optimizeResponseThreshold`; la carga y las curvas, de `responseTime` y `responseCurve`. R(C) nunca se evalúa.

`optimizationFigures.ts` extiende el patrón de figuras como datos de M06 con parámetros, solución, regiones y puntos marcados. La escalera de capacidad se construye con los saltos exactos L = R(m). Las leyendas son HTML, fuera del SVG, y M08 deberá incorporarlas desde la definición.

## Evidencias E2E

`tests/e2e/evidence.ts` escribe en `docs/evidence/<hito>` sólo si `EVIDENCE=<hito>`; en otro caso usa `test-results/evidence/<hito>`.

## Navegación

Se usa `HashRouter` para que una futura publicación estática no dependa de reglas de reescritura del servidor. Rutas: `/`, `/limites`, `/derivadas`, `/integrales`, `/optimizacion`, `/exportaciones`, `/acerca` y un fallback para rutas inexistentes.

## Diseño y activos

Los tokens CSS viven en `src/styles/index.css`: color, radios, sombras, foco, transición y breakpoints. El `AppLayout` comparte sidebar, cabecera y footer; cada ruta obtiene un `SectionPlaceholder` que comunica su estado real.

`assets/` conserva la extracción original del paquete, incluido `assets/README.md`. `public/assets/` contiene copias deliberadas para que Vite las sirva sin transformar. `references/mockup-option-01.png` queda fuera de `public/` y no se publica.

## Laboratorio de derivadas de M05

`src/features/derivatives/DerivativesLab.tsx` toma la carga de `SimulationProvider` sólo al montar y la usa como valor inicial de un punto local entero. Cambiarlo no escribe en el estado del Dashboard. Consume `responseTime`, `firstDerivative`, `secondDerivative`, `discreteResponseIncrement`, `tangentLine`, `tangentCurve`, `responseCurve` y `derivativeCurve` desde el motor M02.

R(n) y la recta tangente usan escala lineal para preservar el significado de la pendiente. R′ y R″ usan una escala Y logarítmica identificada, porque ambas son positivas y crecen de forma extrema al acercarse a la capacidad. `n=100` nunca se evalúa ni se añade como punto finito.

## Exportación de M08

`src/export/` es un núcleo sin React: un registro de figuras obtiene datos del motor y un único renderizador produce SVG para ambos temas; PNG, CSV y ficha derivan del mismo objeto. `src/features/exports/` aporta el centro `/exportaciones`, el diálogo de los laboratorios y los campos de parámetros. El centro y el panel se cargan de forma diferida.

La estrategia prevista (clonar el SVG de Recharts) se sustituyó por un renderizador propio. Detalle en [EXPORT-SYSTEM.md](EXPORT-SYSTEM.md).
