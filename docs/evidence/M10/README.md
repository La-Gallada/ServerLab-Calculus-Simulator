# Evidencia M10 — Preparación de producción

Generada en Windows sobre la compilación local de M10. **Nada de esta carpeta describe producción**, salvo `headers-production-before.txt`.

Capturas (Chromium de Playwright, `127.0.0.1:4173`, con los encabezados de `public/_headers`):

```powershell
npm run build; $env:EVIDENCE='M10'; npx playwright test production; Remove-Item Env:EVIDENCE
```

| Archivo                         | Contenido                                                                                         |
| ------------------------------- | ------------------------------------------------------------------------------------------------- |
| `candidate-dashboard.png`       | Dashboard de la versión candidata                                                                 |
| `candidate-exports.png`         | Centro de exportaciones                                                                           |
| `candidate-about.png`           | «Acerca de», autoría y pie                                                                        |
| `candidate-footer-mobile.png`   | Pie en un tamaño de 390 px emulado                                                                |
| `validation-summary.txt`        | Códigos de salida; `npm ci`, tipos, lint, formato, pruebas unitarias y auditoría                 |
| `build.txt`                     | Salida de la compilación (sin las líneas de fuentes)                                              |
| `e2e-chromium.txt`              | Suite E2E en Chromium 159.0.8154.6                                                                |
| `e2e-edge.txt`                  | La misma suite en Microsoft Edge 158.0.4370.45, con configuración temporal no versionada         |
| `headers-local.txt`             | Respuestas del servidor local con los encabezados                                                 |
| `headers-production-before.txt` | Producción antes de publicar M10: sin política de contenido (consulta de sólo lectura)           |
| `dist-files.txt`                | Tamaño de `dist` antes y después                                                                  |
| `removed-public-assets.txt`     | Copias retiradas de `public/`, original conservado y su huella                                    |
| `metadata.html.txt`             | `index.html` compilado con los metadatos                                                          |
| `academic-package.txt`          | Huellas del paquete académico y comparación con una generación nueva                              |
| `qr-decode.txt`                 | Lectura del código QR con una biblioteca distinta de la generadora (sin teléfono real)           |

Los registros `.txt` se limpiaron de códigos de color, espacios finales y la ruta local del proyecto.

No hay evidencia de Firefox, WebKit, un teléfono real, la pestaña real del navegador, la vista previa social ni los encabezados en Cloudflare: quedan pendientes.
