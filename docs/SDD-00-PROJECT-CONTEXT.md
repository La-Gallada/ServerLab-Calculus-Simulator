# SDD-00 — Contexto y diseño de alto nivel

## Propósito

ServerLab | Calculus Simulator será una aplicación web estática, en español, para explorar un **modelo hipotético** de rendimiento de un servidor web mediante límites, derivadas, integrales y optimización. Es un complemento visual del Proyecto de Investigación #4 de Cálculo I (III Cuatrimestre 2026), no una herramienta de monitoreo ni una fuente de mediciones reales.

Responsable de representaciones gráficas: Christopher Phillips Arroyo. La aplicación debe apoyar el apartado 13 del trabajo académico: mostrar funciones, unidades, comportamiento e interpretación.

## Alcance aprobado para el producto

- Dashboard, Límites, Derivadas, Integrales, Optimización y Acerca de.
- Controles locales de usuarios, duración y umbral; sin backend, autenticación, API ni telemetría real.
- Gráficas calculadas por código, exportables individualmente a PNG blanco de alta resolución y tablas a CSV.
- Modelo configurable y centralizado porque las funciones son provisionales.

## Arquitectura definitiva propuesta

```text
src/
  app/                 composición, rutas y estado de simulación
  config/              modelConfig.ts: parámetros, dominio y textos de hipótesis
  lib/                 math.ts, domain.ts, formatters.ts, export.ts
  features/
    dashboard/ limits/ derivatives/ integrals/ optimization/ about/
  components/
    ui/                controles accesibles y layout reutilizable
    charts/            adaptadores Recharts, ejes, leyendas y exportación
    math/              fórmulas KaTeX y procedimientos
  assets/              recursos importados que formen parte del bundle
  test/                pruebas de apoyo
public/assets/         PNG aprobados para publicación
tests/e2e/             flujos Playwright
```

Capas y reglas:

1. `config` declara parámetros; `lib/math.ts` implementa las fórmulas puras y validaciones.
2. Las funciones de datos de gráfica consumen el motor; ninguna pantalla recalcula fórmulas.
3. El estado conserva entradas del usuario, no resultados derivados; los resultados se derivan del motor.
4. Los componentes de gráfica reciben series, metadatos de ejes y un tema de exportación; no conocen reglas de dominio.
5. `export.ts` obtiene una representación completa con título, leyenda, ejes, unidades y pie de figura. La exportación académica usa fondo blanco sin cambiar el tema de la app.

## Stack de M01 (sujeto a verificación de compatibilidad)

React, TypeScript estricto, Vite, Tailwind CSS, Recharts, Lucide React, KaTeX, Vitest, Playwright, ESLint, Prettier y npm. Se elegirá un conjunto de versiones compatible en M01 antes de instalarlo.

## Supuestos y límites

- Los usuarios del simulador son enteros de 0 a 99; el análisis de cálculo admite extensión continua dentro del dominio indicado.
- Nunca se evalúa ni se dibuja como valor finito `n = 100`.
- CPU y RAM no se implementarán hasta recibir modelos matemáticos aprobados.
- El recurso visual guía es exclusivamente `mockup-option-01.png`; no se usa como fondo ni fuente numérica.
