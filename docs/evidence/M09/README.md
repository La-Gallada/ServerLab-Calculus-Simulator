# Evidencia M09 — Auditoría

Capturas de `tests/e2e/audit.spec.ts` con Chromium sobre el build local (`127.0.0.1:4173`):

```powershell
npm run build; $env:EVIDENCE='M09'; npx playwright test audit; Remove-Item Env:EVIDENCE
```

| Archivo                                                                                                  | Contenido                             |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `audit-dashboard-desktop.png`, `audit-dashboard-mobile.png`                                              | Dashboard                             |
| `audit-limits-desktop.png`, `audit-derivatives-desktop.png`                                              | Límites y Derivadas                   |
| `audit-integrals-desktop.png`, `audit-optimization-desktop.png`                                          | Integrales y Optimización             |
| `audit-exports-desktop.png`, `audit-exports-mobile.png`, `audit-academic-preview.png`                    | Exportaciones                         |
| `audit-about-desktop.png`, `audit-about-full.png`, `audit-not-found.png`                                 | Acerca de y ruta inexistente          |
| `audit-mobile-navigation.png`                                                                            | Menú móvil                            |
| `audit-numeric-validation.png`, `audit-optimization-ambiguous.png`                                       | Validación de campos                  |
| `audit-limits-numbering.png`, `audit-derivatives-numbering.png`                                          | Numeración de procedimientos          |
| `favicon-tab-preview.png`                                                                                | **Vista simulada** de pestañas claras y oscuras con los iconos generados a 16 y 32 px; no es la interfaz real del navegador |

Las capturas de M01 a M08 muestran el estado de cada hito y no se actualizan.
