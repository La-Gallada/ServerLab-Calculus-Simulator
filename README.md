# ServerLab | Calculus Simulator

Aplicación web educativa para el Proyecto de Investigación #4 de **Cálculo I**, III Cuatrimestre 2026, Universidad Latina de Costa Rica. ServerLab permite visualizar y explicar un modelo **hipotético** de rendimiento de un servidor web mediante límites, derivadas, integrales y optimización.

> Los resultados de la aplicación no son mediciones de un servidor real. El modelo matemático es provisional y está pendiente de confirmación por el grupo.

## Estado

Hasta M07 están completos el Dashboard y los laboratorios de Límites, Derivadas, Integrales y Optimización. La exportación sigue planificada; el motor matemático central continúa siendo provisional e hipotético.

## Versionado

Cada milestone finaliza con un commit local en formato Conventional Commits. El propietario gestiona push y publicación. Las reglas completas están en [AGENTS.md](AGENTS.md).

## Requisitos

- Node.js 20.19 o superior (M01 se verificó con Node 24.19.0).
- npm 10 o superior (M01 se verificó con npm 11.17.0).

## Instalación y uso

```bash
npm ci
npm run dev
```

Para generar el sitio estático:

```bash
npm run build
npm run preview
```

## Calidad

```bash
npm run typecheck
npm run lint
npm run test:run
npm run test:e2e
npm run format:check
```

`test:e2e` requiere que Chromium de Playwright esté instalado: `npx playwright install chromium`. Las capturas versionadas de `docs/evidence` sólo se actualizan si la variable `EVIDENCE` nombra el hito (por ejemplo, `M07`).

## Modelo provisional

El documento fuente es [docs/MATHEMATICAL-MODEL.md](docs/MATHEMATICAL-MODEL.md). Sus funciones y parámetros no deben duplicarse en componentes visuales. Los parámetros y la versión viven en `src/config/model.ts` y los cálculos en `src/math/`.

## Estructura

```text
src/app/           composición y rutas
src/components/    layout y componentes UI reutilizables
src/config/        metadatos de páginas y del modelo
src/features/      Dashboard y laboratorios por módulo
src/math/          motor central de fórmulas
src/styles/        tokens y estilos globales
src/test/          configuración de pruebas unitarias
tests/e2e/         navegación Playwright
assets/            fuente original del Asset Pack (no editar)
public/assets/     copias publicables de los PNG empleados
references/        mockup de opción 1 (no se publica)
docs/              arquitectura, decisiones e informes
```

La estrategia de exportación académica está documentada en [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) y se implementará en M08.
