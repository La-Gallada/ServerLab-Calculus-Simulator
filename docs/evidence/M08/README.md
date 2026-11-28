# Evidencia M08 — Exportaciones

Generada por `tests/e2e/exports.spec.ts` con Chromium de Playwright sobre el build de producción (`127.0.0.1:4173`). Los archivos de `generated/` son las descargas reales de la interfaz; las fichas son el texto copiado al portapapeles.

```powershell
npm run build; $env:EVIDENCE='M08'; npx playwright test exports; Remove-Item Env:EVIDENCE
```

## Capturas

| Archivo                         | Contenido                             |
| ------------------------------- | ------------------------------------- |
| `exports-desktop-1440x900.png`  | Centro, escritorio                    |
| `exports-laptop-1280x720.png`   | Centro, portátil                      |
| `exports-tablet-768x1024.png`   | Centro, tableta                       |
| `exports-mobile-390x844.png`    | Centro, móvil                         |
| `exports-academic-preview.png`  | Vista previa académica                |
| `exports-dark-preview.png`      | Vista previa con tema ServerLab       |
| `exports-figure-selection.png`  | Filtro y selección                    |
| `exports-parameters.png`        | Intervalo inválido rechazado          |
| `exports-download-controls.png` | Controles de descarga y ficha         |
| `exports-from-laboratory.png`   | Diálogo abierto desde Optimización    |

## Muestras

| Carpeta             | Contenido                                                    |
| ------------------- | ------------------------------------------------------------ |
| `generated/png/`    | 15 figuras, tema Académico, 2400 × 1600 px                   |
| `generated/svg/`    | 5 muestras, una por categoría                                |
| `generated/csv/`    | 5 muestras por categoría y una variante regional             |
| `generated/fichas/` | 15 fichas académicas                                         |

Los datos provienen de un modelo hipotético y provisional.
