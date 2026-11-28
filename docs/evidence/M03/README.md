# Evidencia visual M03

Las ocho imágenes fueron generadas por Playwright en Chromium sobre el build de producción servido por Vite Preview el 27 de noviembre de 2026. Son capturas reales del Dashboard, no mockups ni imágenes sintéticas.

| Archivo | Viewport / estado |
| --- | --- |
| `dashboard-desktop-1440x900.png` | Dashboard inicial, 1440 × 900 |
| `dashboard-laptop-1280x720.png` | Dashboard inicial, 1280 × 720 |
| `dashboard-tablet-768x1024.png` | Dashboard inicial, 768 × 1024 |
| `dashboard-mobile-390x844.png` | Dashboard inicial, 390 × 844 |
| `dashboard-initial-state.png` | Estado inicial: 65 usuarios, 500 ms y 30 s |
| `dashboard-threshold-exceeded.png` | 67 usuarios frente a umbral de 500 ms |
| `dashboard-near-capacity.png` | 99 usuarios sin métricas no finitas |
| `dashboard-transfer-adjusted.png` | Transferencia ajustada a 10 s (60 MB) |

La prueba comprueba además los errores de consola, solicitudes fallidas de `assets/`, desbordamiento horizontal, teclado en el slider de usuarios y navegación a Derivadas.
