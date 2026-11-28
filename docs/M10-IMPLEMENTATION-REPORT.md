# M10 — Preparación de producción y cierre académico

**Fecha:** 27 de noviembre de 2026. **Base:** `f644acf` (M09). Desarrollado por el Grupo #4.

Evidencia: [evidence/M10](evidence/M10/README.md).

## 1. Resumen ejecutivo

ServerLab queda como versión candidata `1.0.0-rc.1`: encabezados de seguridad, `dist` 76,6 % menor, metadatos públicos, autoría «Grupo #4», guías, paquete académico provisional y checklist de publicación. El modelo matemático no cambió y sigue siendo provisional. No hubo push ni despliegue.

| Veredicto                       | Resultado   |
| ------------------------------- | ----------- |
| A. Publicación técnica          | **GO**      |
| B. Entrega académica definitiva | **PENDING** |

## 2. Estado inicial

- `main` y producción en `f644acf`; producción servía los mismos archivos que su compilación local.
- Verificación previa a los cambios: tipos correctos, 613 pruebas unitarias, compilación correcta.
- `dist`: 101 archivos, 12 524 808 bytes.
- Producción enviaba `referrer-policy`, `x-content-type-options` y valores por defecto de Cloudflare; sin política de contenido.

## 3. Configuración de producción

Cloudflare Pages: React + Vite, rama `main`, `npm run build`, salida `dist`, raíz del repositorio; sin backend, Workers, Pages Functions ni Wrangler. El primer despliegue falló por configurarse como Next.js (`npx next build`); ver [DEPLOYMENT-CLOUDFLARE.md](DEPLOYMENT-CLOUDFLARE.md). `.node-version` 24.19.0, `engines` y documentación coinciden. La versión de Node usada por Cloudflare no se verificó. No se modificó el servicio.

## 4. Encabezados

`public/_headers`: política de contenido (`default-src 'none'`, scripts, fuentes y conexiones sólo propios, `frame-ancestors 'none'`), `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy` y `Permissions-Policy`.

- Concesiones: `style-src 'unsafe-inline'` (atributos de estilo) e `img-src data: blob:` (exportación).
- La primera ejecución bajo la política detectó una fuente de KaTeX incrustada como `data:`; se corrigió en la compilación en lugar de ampliar `font-src`.
- `scripts/serve-dist.mjs` aplica las reglas y sirve toda la suite E2E. Se comprobó que bloquea un script en línea, una imagen externa y un marco, y que PNG, SVG, CSV y ZIP funcionan sin bloqueos.
- **No están activos en producción.** Verificación pendiente tras publicar.

## 5. Optimización de assets

Se retiraron 10 copias PNG de `public/` sin referencias e idénticas a sus originales en `assets/`, que se conservan sin cambios (11 huellas verificadas).

| `dist`   | Antes      | Después   |
| -------- | ---------- | --------- |
| Bytes    | 12 524 808 | 2 930 880 |
| Archivos | 101        | 94        |

Son bytes que ya no se publican; las copias no se descargaban al navegar. El fragmento principal sigue en 734 kB (217 kB comprimido), limitación aceptada en M09.

## 6. Identidad visual y metadatos

- Iconos ICO, 16, 32, 180, 192 y 512 px: referencias y dimensiones cubiertas por las pruebas, sin solicitudes fallidas. La pestaña real del navegador sigue sin verificar.
- `index.html`: idioma, título, descripción, autor, URL canónica, Open Graph y `twitter:card`, con la URL oficial.
- `og-image.png` (1200 × 630) compuesta con el isotipo propio y texto; sin logotipo universitario ni afirmación de aval. La vista previa social no se ha comprobado.
- Con HashRouter, las rutas internas no son páginas distintas para los rastreadores.

### Autoría

El nombre personal se sustituyó por «Grupo #4» en los archivos actuales donde figuraba, y la autoría se añadió a «Acerca de», pie, barra lateral, README, metadatos, figuras, fichas, guías y paquete. Aviso: proyecto estudiantil, no oficial ni avalado. Nota de figuras: «Nota. Elaboración propia del Grupo #4 mediante ServerLab, a partir del modelo matemático hipotético del proyecto de investigación». No se añadieron nombres de otros integrantes. La identidad de Git y el historial no se modificaron.

## 7. Privacidad

Detalle y alternativas en [PRE-PUSH-REVIEW.md](PRE-PUSH-REVIEW.md), separados en seguridad técnica, privacidad personal, derechos de distribución y transparencia académica. Sin secretos detectados en los archivos de M10. Pendientes de decisión: correo y nombre en el historial de Git, mockup con logotipo universitario, ausencia de licencia, publicación del paquete académico (conviene decidirla antes del push) y declaración del uso de IA. Ningún archivo servido conserva ya el manifiesto C2PA; los originales sí. No se eliminaron metadatos ni originales.

## 8. Compatibilidad

| Entorno                              | Resultado                             |
| ------------------------------------ | ------------------------------------- |
| Chromium 159.0.8154.6 (Playwright)   | 28 de 28                              |
| Microsoft Edge 158.0.4370.45         | 28 de 28                              |
| Tamaños móviles emulados             | Incluidos en la suite                 |
| Firefox, WebKit/Safari               | PENDING: no instalados ni descargados |
| Google Chrome estable, teléfono real | PENDING                               |
| Word, Excel, Google Docs             | No probados                           |

## 9. Documentación académica

[ACADEMIC-DELIVERY-GUIDE.md](ACADEMIC-DELIVERY-GUIDE.md): propósito, módulos, modelo, limitaciones, exportación, inserción en el documento, selección de figuras (esenciales, complementarias y redundantes) y confirmaciones pendientes. Las 15 figuras siguen disponibles.

## 10. Paquete académico

[academic-delivery/](academic-delivery/README.md): 12 figuras en PNG 2400 × 1600, SVG, CSV estándar y regional, 12 fichas, índice con interpretaciones y QR. Rotulado como provisional. No entra en `dist`.

- ZIP local, no versionado: `docs/academic-delivery/serverlab-grupo4-paquete-academico-provisional.zip` (3,7 MB).
- Una generación nueva en la suite final produjo 61 archivos idénticos a los versionados, sin diferencias.
- El QR se decodificó con una biblioteca independiente a 1200 y 240 px; no se probó con teléfono.
- Para el QR se usaron `qrcode` 1.5.4 (MIT) y `jsqr` 1.4.0 (Apache-2.0) fuera del proyecto; no son dependencias.

## 11. Guía de exposición

[PRESENTATION-GUIDE.md](PRESENTATION-GUIDE.md): guion propuesto de unos 5 minutos, valores esperados, preguntas y respuestas, y plan sin conexión. Los valores están fijados por pruebas. No se ensayó con la red desconectada y la duración no es oficial.

## 12. Estrategia de actualización matemática

[MODEL-UPDATE-GUIDE.md](MODEL-UPDATE-GUIDE.md): supuestos que el código aprovecha, mapa de archivos y dos escenarios (sólo parámetros; expresiones, dominios o tipos). Si R deja de ser creciente, la búsqueda binaria deja de ser válida.

## 13. Pruebas

| Comprobación                          | Resultado                                                   |
| ------------------------------------- | ----------------------------------------------------------- |
| `npm ci`                              | Correcto                                                    |
| `typecheck`, `lint`, `format:check`   | Correctos                                                   |
| `test:run`                            | 625 aprobadas en 18 archivos (+12)                          |
| `test:e2e`                            | 28 aprobadas (+6)                                           |
| `npm audit`                           | 0 vulnerabilidades                                          |
| Copia limpia con `core.autocrlf=true` | Instalación, comprobaciones, compilación y 28 E2E correctos |

Pruebas nuevas: autoría y versión, valores del guion, encabezados y política, metadatos, activos no publicados, evidencia candidata e integridad del paquete. Se ajustaron las aserciones de autoría existentes; no se retiraron pruebas matemáticas. La copia limpia se probó antes de redactar este informe.

## 14. Build

`npm run build` correcto, con el aviso conocido de un fragmento mayor de 500 kB. La copia limpia produjo un `dist` del mismo tamaño total.

## 15. Evidencias

16 archivos en `docs/evidence/M10/`: capturas reales, registros, encabezados, tamaños, metadatos, paquete y QR. Las 131 evidencias de M01–M09 conservan sus huellas.

## 16. Riesgos pendientes

| Riesgo                                                                 | Acción                                       |
| ---------------------------------------------------------------------- | -------------------------------------------- |
| La política podría bloquear funciones que Cloudflare inyecte           | Checklist; revertir sólo esa línea si ocurre |
| Encabezados, icono de pestaña y vista social sin verificar en el sitio | Comprobar tras publicar                      |
| Firefox, WebKit y teléfono real sin probar                             | Autorizar navegadores o probar manualmente   |
| Modelo no confirmado                                                   | Confirmación del grupo                       |
| Privacidad, licencia, logotipo, IA y publicación del paquete           | Decisión del propietario y del grupo         |

## 17. Git and Version Control

| Dato         | Valor                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------- |
| Hash         | Se obtiene con `git log -1 --grep "(M10)" --format=%H`; un commit no puede contener el suyo |
| Título       | `chore(release): prepare production candidate and academic delivery (M10)`                  |
| Resumen      | Preparación de producción, autoría, documentación y paquete académico provisional           |
| Archivos     | 128                                                                                         |
| Rama         | `main`                                                                                      |
| Working tree | Limpio tras el commit (el ZIP local está ignorado)                                          |
| Push         | No realizado; `origin/main` permanece en `f644acf`                                          |
| Despliegue   | Ninguno. Sin merge, etiquetas, releases, cambios en Cloudflare ni operaciones destructivas  |

## 18. Criterios

| Criterio                                            | Estado  | Alcance                                |
| --------------------------------------------------- | ------- | -------------------------------------- |
| Configuración de despliegue documentada             | PASS    |                                        |
| Build reproducible                                  | PASS    | Windows, Node 24.19.0                  |
| Encabezados evaluados                               | PASS    | En local; producción pendiente         |
| Exportaciones compatibles con la seguridad aplicada | PASS    | Chromium y Edge, en local              |
| Assets públicos optimizados                         | PASS    |                                        |
| Favicon integrado                                   | PASS    | Pestaña real pendiente                 |
| Metadatos públicos completos                        | PASS    | Vista social pendiente                 |
| Privacidad revisada                                 | PASS    | Decisiones pendientes                  |
| Compatibilidad documentada                          | PASS    | Firefox y WebKit PENDING               |
| Guía académica completa                             | PASS    | Sobre el modelo provisional            |
| Guía de exposición completa                         | PASS    | Sin ensayo                             |
| Guía de actualización matemática completa           | PASS    |                                        |
| Paquete académico provisional generado              | PASS    |                                        |
| Checklist de publicación completo                   | PASS    | Casillas por ejecutar                  |
| Plan de recuperación documentado                    | PASS    | No ejecutado                           |
| Pruebas aprobadas                                   | PASS    |                                        |
| Build aprobado                                      | PASS    |                                        |
| Evidencias históricas preservadas                   | PASS    |                                        |
| Commit local realizado                              | PASS    | Es el commit que contiene este informe |
| Sin push ni despliegue no autorizado                | PASS    |                                        |
| Verificación en producción                          | PENDING | Requiere publicar                      |
| Modelo matemático confirmado                        | PENDING | Requiere al grupo                      |

## 19. Checklist de publicación

[RELEASE-CHECKLIST.md](RELEASE-CHECKLIST.md): antes del push, después del push, antes de la entrega universitaria y plan de recuperación.

**Publicación técnica: GO.** Sin bloqueo técnico ni de secretos; conviene decidir antes si el paquete académico se publica, y las comprobaciones en producción quedan por hacer.

**Entrega académica definitiva: PENDING.** Faltan la confirmación del modelo, la selección final de figuras y los requisitos del curso.
