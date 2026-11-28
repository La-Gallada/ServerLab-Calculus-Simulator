# ServerLab | Calculus Simulator

Aplicación web educativa sobre un modelo **hipotético** de rendimiento de un servidor web, explicado mediante límites, derivadas, integrales y optimización.

Desarrollado por el Grupo #4.
Proyecto de Investigación de Cálculo I.
Ingeniería en Sistemas.
Universidad Latina de Costa Rica.
III Cuatrimestre, 2026.

Proyecto estudiantil: no es un producto oficial de la universidad ni cuenta con su aval.

> Los resultados de la aplicación no son mediciones de un servidor real. El modelo matemático es provisional y está pendiente de confirmación por el grupo.

## Estado

Sitio público: <https://serverlab-calculus-simulator.pages.dev/> (puede ir por detrás de la rama local).

Versión candidata `1.0.0-rc.1`: aplicación completa (Dashboard, laboratorios de Límites, Derivadas, Integrales y Optimización, exportación de 15 figuras en PNG, SVG y CSV) y preparada para publicación estática. **No es la entrega académica definitiva** y no hay etiquetas ni releases.

## Documentación

| Tema        | Documentos                                                                                                                                                     |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Entrega     | [Guía académica](docs/ACADEMIC-DELIVERY-GUIDE.md) · [exposición](docs/PRESENTATION-GUIDE.md) · [paquete de figuras](docs/academic-delivery/README.md)          |
| Modelo      | [Modelo matemático](docs/MATHEMATICAL-MODEL.md) · [cómo actualizarlo](docs/MODEL-UPDATE-GUIDE.md)                                                              |
| Publicación | [Cloudflare Pages](docs/DEPLOYMENT-CLOUDFLARE.md) · [checklist y recuperación](docs/RELEASE-CHECKLIST.md) · [revisión previa al push](docs/PRE-PUSH-REVIEW.md) |
| Exportación | [Sistema](docs/EXPORT-SYSTEM.md) · [catálogo](docs/ACADEMIC-FIGURES-CATALOG.md)                                                                                |
| Auditoría   | [Hallazgos](docs/AUDIT-FINAL.md) · [rendimiento](docs/PERFORMANCE-REPORT.md) · [informe M10](docs/M10-IMPLEMENTATION-REPORT.md)                                |

## Versionado

Cada milestone finaliza con un commit local en formato Conventional Commits. El propietario gestiona push y publicación. Las reglas completas están en [AGENTS.md](AGENTS.md).

## Requisitos

- Node.js `^22.22.2`, `^24.15.0` o `>=26.0.0`; `.node-version` indica 24.19.0, la versión verificada.
- npm 10 o superior (verificado con 11.17.0).

## Instalación y uso

```bash
npm ci
npm run dev
```

Para generar el sitio estático y revisarlo con los encabezados de producción (<http://127.0.0.1:4173>):

```bash
npm run build
node scripts/serve-dist.mjs
```

`npm run preview` también sirve `dist`, sin aplicar `public/_headers`.

## Calidad

```bash
npm run typecheck
npm run lint
npm run test:run
npm run build
npm run test:e2e
npm run format:check
```

`test:e2e` usa la compilación de `dist` y requiere Chromium de Playwright: `npx playwright install chromium`. Las capturas versionadas de `docs/evidence` sólo se actualizan si la variable `EVIDENCE` nombra el hito (por ejemplo, `M10`).

Comprobado en Chromium y Microsoft Edge. Firefox y WebKit (Safari) no se han probado.

## Modelo provisional

El documento fuente es [docs/MATHEMATICAL-MODEL.md](docs/MATHEMATICAL-MODEL.md). Sus funciones y parámetros no deben duplicarse en componentes visuales. Los parámetros y la versión viven en `src/config/model.ts` y los cálculos en `src/math/`.

## Estructura

```text
src/app/           composición y rutas
src/components/    layout y componentes UI reutilizables
src/config/        metadatos de páginas, autoría y modelo
src/export/        registro de figuras y generación de archivos
src/features/      Dashboard, laboratorios y centro de exportaciones
src/math/          motor central de fórmulas
src/styles/        tokens y estilos globales
src/test/          configuración de pruebas unitarias
scripts/           servidor local de dist con los encabezados
tests/e2e/         navegación Playwright
assets/            fuente original del Asset Pack (no editar)
public/            archivos publicados: encabezados, iconos, tarjeta social y logotipo
references/        mockup de opción 1 (no se publica en el sitio)
docs/              arquitectura, guías, decisiones, informes y evidencias
```
