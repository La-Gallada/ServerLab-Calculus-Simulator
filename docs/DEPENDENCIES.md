# Dependencias

Desde M09 las dependencias directas se declaran con **versión exacta** en `package.json`; `package-lock.json` fija el árbol completo. Actualizar es una decisión explícita: cambiar una versión, ejecutar la validación completa y registrar la razón.

## Requisitos

- Node.js `^22.22.2`, `^24.15.0` o `>=26.0.0` (lo exigen React Router y jsdom). `.node-version` fija 24.19.0, la versión verificada.
- npm 10 o superior (verificado con 11.17.0).

| Dependencia                              | Uso                                            |
| ---------------------------------------- | ---------------------------------------------- |
| React y React DOM                        | interfaz                                       |
| React Router                             | HashRouter y rutas diferidas                   |
| Recharts                                 | gráficas interactivas                          |
| KaTeX                                    | fórmulas                                       |
| Lucide React                             | iconografía                                    |
| Vite, plugin React, Tailwind y su plugin | compilación y estilos                          |
| TypeScript, ESLint, Prettier             | calidad                                        |
| Vitest, Testing Library, jsdom           | pruebas unitarias                              |
| Playwright y `@axe-core/playwright`      | pruebas E2E, evidencias y auditoría automática |

TypeScript permanece en 6.0: `typescript-eslint` 8.74 admite versiones anteriores a 6.1.
