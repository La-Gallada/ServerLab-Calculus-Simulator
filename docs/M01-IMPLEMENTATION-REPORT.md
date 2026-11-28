# M01 — Informe de implementación

Fecha: 27 de noviembre de 2026.

## Resultado

Se inicializó una aplicación Vite + React con TypeScript estricto, navegación HashRouter, shell responsive en español, rutas de estado explícito, pruebas unitarias y configuración de calidad. La aplicación es una base visual; no implementa el motor matemático ni gráficas.

## Entorno verificado

| Herramienta     |          Versión |
| --------------- | ---------------: |
| Node.js         |         v24.19.0 |
| npm             |          11.17.0 |
| Git             | 2.55.0.windows.5 |
| Vite resuelto   |            8.4.0 |
| Vitest resuelto |            5.1.2 |

`origin` se verificó mediante `git ls-remote --heads origin main`: no devolvió una rama `main`, consistente con el repositorio aún vacío. No se cambió la configuración Git.

## Implementación

- Activos originales extraídos en `assets/`; README preservado como `assets/README.md`.
- PNGs copiados de forma no destructiva a `public/assets/` para su uso local; mockup preservado sólo en `references/`.
- Shell con Sidebar, Header, footer académico, foco visible, enlaces semánticos y menú móvil.
- Seis rutas previstas más manejo de rutas inexistentes. Cada una comunica si está preparada o planificada.
- Tokens de diseño centralizados en CSS; sin fuentes, APIs ni imágenes externas.
- `src/config/model.ts` declara la versión `provisional-2026-11`; no contiene fórmulas.

## Pruebas ejecutadas

| Comando                      | Resultado                                                                               |
| ---------------------------- | --------------------------------------------------------------------------------------- |
| `npm run typecheck`          | PASS                                                                                    |
| `npm run lint`               | PASS                                                                                    |
| `npm run test:run`           | PASS: 4 pruebas                                                                         |
| `npm run build`              | PASS                                                                                    |
| `npm run format:check`       | PASS                                                                                    |
| `npm ci`                     | PASS tras ejecutar fuera del sandbox por una limitación de permisos Windows del sandbox |
| `npm run dev`                | PASS: Vite inició correctamente en 444 ms                                               |
| `npx playwright test --list` | PASS: 1 flujo detectado                                                                 |
| `npm run test:e2e`           | PASS en M01.1: 1 prueba Chromium aprobada; ver `docs/M01.1-VALIDATION-REPORT.md`.       |

## Evidencia visual

M01.1 generó e inspeccionó cinco capturas reales con Chromium en `docs/evidence/M01/`.

## Criterios de aceptación

| Criterio                                     | Estado                                  |
| -------------------------------------------- | --------------------------------------- |
| `npm ci` reproducible                        | PASS                                    |
| `npm run dev`                                | PASS: Vite inició correctamente         |
| Build, TypeScript, ESLint, formato           | PASS                                    |
| Unitarias iniciales                          | PASS                                    |
| Navegación E2E                               | PASS                                    |
| Seis pantallas accesibles y fallback         | PASS por pruebas unitarias y build      |
| Recursos conservados y rutas configuradas    | PASS por inventario de archivos y build |
| Adaptabilidad visual y capturas 4 viewports  | PASS                                    |
| Sin errores de consola/solicitudes de assets | PASS                                    |
| Sin commits, push ni despliegue              | PASS                                    |

## Riesgos y próximos pasos

1. Ejecutar pruebas E2E y capturas en un entorno con acceso de Chromium al servidor Vite antes de cerrar la evidencia visual.
2. Confirmar con el grupo las fórmulas definitivas antes de implementar M02.
3. Cuando se autorice M02, crear funciones puras y pruebas matemáticas desde `docs/MATHEMATICAL-MODEL.md`; no mover la lógica a componentes.
