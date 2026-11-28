# Evidencia M07 — Optimización

Capturas generadas por `tests/e2e/optimization.spec.ts` con Chromium de Playwright sobre el build de producción servido por Vite Preview (`127.0.0.1:4173`).

Para regenerarlas, en PowerShell:

```powershell
npm run build; $env:EVIDENCE='M07'; npx playwright test optimization; Remove-Item Env:EVIDENCE
```

Sin la variable `EVIDENCE`, las pruebas escriben en `test-results/evidence/` y no modifican esta carpeta ni las de hitos anteriores.

| Archivo                                   | Contenido                                  |
| ----------------------------------------- | ------------------------------------------ |
| `optimization-desktop-1440x900.png`       | Vista inicial, escritorio                  |
| `optimization-laptop-1280x720.png`        | Vista inicial, portátil                    |
| `optimization-tablet-768x1024.png`        | Vista inicial, tableta                     |
| `optimization-mobile-390x844.png`         | Vista inicial, móvil                       |
| `optimization-threshold-300.png`          | L = 300 ms: máximo 50                      |
| `optimization-threshold-500.png`          | L = 500 ms: máximo 66                      |
| `optimization-threshold-1000.png`         | L = 1 000 ms: máximo 81                    |
| `optimization-no-feasible-solution.png`   | L = 50 ms: sin solución                    |
| `optimization-base-threshold.png`         | L = 100 ms: sólo n = 0                     |
| `optimization-integer-verification.png`   | R(66) y R(67) frente a 500 ms              |
| `optimization-mathematical-procedure.png` | Procedimiento dinámico para 500 ms         |
| `optimization-threshold-capacity.png`     | Umbral frente a capacidad operativa        |

Las capturas por viewport muestran la primera pantalla, no la página completa. Los datos provienen de un modelo hipotético, no de mediciones.
