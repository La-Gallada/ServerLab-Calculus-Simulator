# Sistema de diseño

## Dirección

Dashboard tecnológico oscuro, sobrio y legible, basado en la composición de la opción 1. Interfaz en español con el nombre `ServerLab`, subtítulo `Calculus Simulator` y eslogan `Analiza · Calcula · Optimiza`.

## Tokens iniciales

| Token      | Valor     | Uso                                  |
| ---------- | --------- | ------------------------------------ |
| Fondo      | `#0B1220` | lienzo principal                     |
| Superficie | `#162134` | tarjetas y paneles                   |
| Cian       | `#38BDF8` | serie principal y acciones primarias |
| Violeta    | `#8B5CF6` | derivadas y acciones secundarias     |
| Verde      | `#22C55E` | estado válido y acumulados           |
| Ámbar      | `#F59E0B` | umbrales y alertas moderadas         |
| Rojo       | `#EF4444` | errores o fuera de dominio           |
| Texto      | `#F1F5F9` | contenido de alto contraste          |

Tipografía objetivo: Inter con una pila sans-serif local de respaldo. Se verificará su estrategia offline en M01.

## Componentes y accesibilidad

- `AppShell`, `Sidebar`, `PageHeader`, `MetricCard`, `Panel`, `ChartCard`, `FormulaBlock`, `SimulationControls`, `ExportMenu` y `Empty/Error/DomainState`.
- Usar HTML semántico, etiqueta visible para cada control, foco visible, navegación por teclado, objetivos táctiles adecuados y contraste verificable.
- Todo botón tendrá estados `hover`, `focus-visible`, `active` y `disabled`; los PNG jamás serán el único control funcional.
- Gráficas con título, descripción textual alternativa, leyenda, ejes y unidades; el color no será el único transmisor de significado.

## Aplicación en M03

El Dashboard implementa tarjetas de métricas, paneles de curvas y controles nativos con una cuadrícula de cuatro columnas en escritorio, dos en formatos intermedios y una en móvil. El sidebar existente se conserva como navegación principal. Los estados de cumplimiento usan texto además de color (`Dentro del objetivo` o `Umbral excedido`).

La composición adopta del mockup de opción 1 la barra lateral oscura, los paneles de borde sutil, la jerarquía de cuatro métricas y el azul/cian como serie principal. Se desvía deliberadamente de sus números y curvas ilustrativas: cada cifra y serie viene del motor M02. Las gráficas no animan, respetando `prefers-reduced-motion` y evitando distracciones en un contexto académico.

## Reglas de gráfica y exportación

- Mantener las asíntotas separadas de la serie y excluir `n=100` de los puntos.
- Para exportación: fondo blanco, texto oscuro, título, leyenda, unidades, ejes completos y pie de figura generado desde los parámetros actuales.
- La vista de app conserva el tema oscuro. Validar que etiquetas y leyendas no se recorten a 320 px y en escritorio.

## Temas de exportación (M08)

`src/export/themes.ts` centraliza los tokens. Académico: fondo blanco, azul oscuro para la función, violeta para derivadas, verde oscuro para integrales, ámbar oscuro para umbrales, rojo moderado para lo no factible y gris para referencias. ServerLab reutiliza la paleta oscura. Trazos, formas y tramas son comunes y no dependen del color. Tipografía Arial/Helvetica sobre un lienzo de 1200 × 800.
