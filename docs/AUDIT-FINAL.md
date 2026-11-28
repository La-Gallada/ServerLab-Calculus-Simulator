# Auditoría final (M09)

**Fecha:** 27 de noviembre de 2026. **Base auditada:** `fda80eb` (M08), publicada en GitHub y servida por Cloudflare Pages.

Estados: RESOLVED, ACCEPTED LIMITATION, PENDING, BLOCKER. No quedan hallazgos BLOCKER.

«Confirmado» indica que se reprodujo o midió; «Preventivo», que es una recomendación o un riesgo no reproducido.

## Matemática

| ID  | Severidad | Hallazgo y evidencia                                                                                                                                                                               | Corrección                                                                         | Validación                                                              | Estado   |
| --- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | -------- |
| M-1 | Alta      | Confirmado (revisión independiente y reproducción): `floor(n*)` devolvía un usuario menos en 17 de los 100 umbrales L = R(n): n = 2, 4, 13, 14, 17, 19, 21, 26, 29, 38, 44, 47, 49, 51, 56, 57, 87 | Búsqueda binaria entera sobre `R`, sin tolerancias; frontera mantenida en [m, m+1) | 100 umbrales exactos y sus vecinos en coma flotante; figuras y snapshot | RESOLVED |
| M-2 | Media     | Confirmado: con umbrales enormes la frontera era infinita o igual a 100 (singularidad). La interfaz limitaba L a 25 000                                                                            | Cálculo sin desbordamiento y tope por debajo de C                                  | L hasta `Number.MAX_VALUE`                                              | RESOLVED |
| M-3 | Baja      | Confirmado: un umbral negativo se informaba como «sin solución»                                                                                                                                    | `invalid-threshold` con código `negative-value`, como el resto de validaciones     | Pruebas de 0, −0, negativos y no finitos                                | RESOLVED |
| M-4 | Media     | Confirmado: el eje logarítmico de R″ rotulaba 0,1 como «0»                                                                                                                                         | Decimales en marcas menores que 1                                                  | Revisión visual                                                         | RESOLVED |
| M-5 | Baja      | Confirmado: «1 usuarios»                                                                                                                                                                           | Concordancia en el formateador                                                     | Prueba unitaria                                                         | RESOLVED |

El informe de M07 afirmaba una verificación exhaustiva: sólo cubrió umbrales con hasta dos decimales y por eso no detectó M-1.

Sin discrepancias en R, R′, R″, T, A y D: contraste con las expresiones del enunciado, diferencias finitas e integración numérica (`src/math/audit.test.ts`). Coeficientes, funciones y dominios no cambiaron.

## Interfaz, visual y accesibilidad

| ID  | Severidad | Hallazgo y evidencia                                                                                                                                        | Corrección                                                                           | Estado              |
| --- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------- |
| U-1 | Media     | Confirmado (M06): el campo de Integrales aplicaba prefijos al escribir                                                                                      | Borrador confirmado con Enter o al salir, común a los tres campos                    | RESOLVED            |
| U-2 | Media     | Confirmado (M07): se rechazaba «1 000», que la propia interfaz muestra                                                                                      | Se admite agrupación con espacio; punto o coma de millares se rechazan como ambiguos | RESOLVED            |
| U-3 | Baja      | Confirmado: sin numeración en Límites y Derivadas; listas sin viñetas                                                                                       | Numeración común y subtítulos en Derivadas                                           | RESOLVED            |
| U-4 | Media     | Por inspección: al cambiar de ruta no se restauraba la posición superior, ni cambiaban título o foco                                                        | Gestión en `AppLayout`                                                               | RESOLVED            |
| U-5 | Media     | Confirmado: «Acerca de» mostraba un marcador de M01; la ruta inexistente mostraba «Planificado»                                                             | Pantalla completa y página 404 propia                                                | RESOLVED            |
| V-1 | Media     | Confirmado (capturas): títulos de eje recortados, «C=100» cortado, leyenda sobre el título y marcas logarítmicas partidas en Dashboard, Límites y Derivadas | Márgenes, alineación, leyenda superior y unidades en el título                       | RESOLVED            |
| V-2 | Media     | Confirmado: marcas de ejes en gris `#666` sobre fondo oscuro                                                                                                | Color atenuado del sistema de diseño                                                 | RESOLVED            |
| A-1 | Media     | axe: `aria-label` en elementos sin rol (barra de carga, estado de cabecera, fórmulas de Límites y Derivadas)                                                | Roles y componente `Formula` común                                                   | RESOLVED            |
| A-2 | Media     | axe: nombre accesible distinto del texto visible en botones de tablas                                                                                       | Nombres que comienzan con el texto visible                                           | RESOLVED            |
| A-3 | Media     | Confirmado: el menú móvil cerrado recibía foco y no cerraba con Escape                                                                                      | Oculto al cerrar, Escape y retorno del foco; enlace «Saltar al contenido»            | RESOLVED            |
| A-4 | Media     | Sin lector de pantalla, revisión manual completa ni auditoría WCAG; axe sólo detecta una parte                                                              | —                                                                                    | ACCEPTED LIMITATION |

axe-core 4.14.1 (reglas WCAG 2.0/2.1 A y AA y buenas prácticas) no informa infracciones en las ocho rutas a 1280 y 390 px, con un error de campo, el diálogo de exportación y el menú móvil abiertos. No equivale a conformidad WCAG.

## Rendimiento, reproducibilidad y recursos

| ID  | Severidad | Hallazgo                                                                                                    | Corrección o decisión                                              | Estado                           |
| --- | --------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | -------------------------------- |
| R-1 | Alta      | Todas las dependencias como `latest`; TypeScript 7 queda fuera del rango admitido por `typescript-eslint`   | Versiones exactas ya instaladas                                    | RESOLVED                         |
| R-2 | Media     | `engines` declaraba Node ≥ 20.19, pero React Router exige ≥ 22.22 y jsdom ≥ 22.22.2 o 24.15                 | Rango real y `.node-version` 24.19.0                               | RESOLVED                         |
| R-3 | Media     | `core.autocrlf=true` podía romper `format:check` al clonar                                                  | `.gitattributes` y `endOfLine: lf`                                 | RESOLVED                         |
| R-4 | Baja      | Los CSV de muestra de M08 quedaron en el repositorio con LF (el exportador genera CRLF)                     | No se alteran evidencias                                           | ACCEPTED LIMITATION              |
| P-1 | Alta      | 1,41 MB iniciales, de ellos 1,08 MB de un logotipo mostrado a 168 px                                        | Derivado WebP de 39 kB y carga diferida                            | RESOLVED                         |
| P-2 | Baja      | El fragmento principal supera 500 kB sin comprimir                                                          | Recharts es necesario en el Dashboard; no se fuerza `manualChunks` | ACCEPTED LIMITATION              |
| P-3 | Baja      | Mover el umbral actualiza tres gráficas en unos 49–56 ms (equipo de pruebas)                                | Sin evidencia de problema perceptible                              | ACCEPTED LIMITATION              |
| P-4 | Baja      | `dist` conserva unos 9,8 MB de PNG originales no referenciados; no se descargan                             | Retirarlos de `public/` requiere decisión                          | PENDING                          |
| F-1 | Media     | Confirmado en producción: sin favicon; `/favicon.ico` devolvía HTML                                         | Iconos oficiales derivados del isotipo                             | RESOLVED (se verá tras publicar) |
| F-2 | Baja      | No se comprobó visualmente la pestaña real del navegador; sólo solicitudes, decodificación y vista simulada | Revisar tras publicar                                              | PENDING                          |

## Exportaciones, compatibilidad y seguridad

| ID  | Severidad | Hallazgo                                                                                                                                                                                     | Estado              |
| --- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| E-1 | —         | Las 15 figuras, ambos temas, tres resoluciones, SVG, CSV, fichas y ZIP siguen verificados por las pruebas de M08                                                                             | RESOLVED            |
| E-2 | Baja      | A 16 cm de ancho las anotaciones quedan cerca de 7 pt y el pie cerca de 5 pt (vista de impresión en PDF)                                                                                     | ACCEPTED LIMITATION |
| C-1 | Media     | Firefox y WebKit no probados: no están instalados y descargarlos requiere autorización                                                                                                       | PENDING             |
| C-2 | Baja      | Word, Excel, Google Docs y GeoGebra no probados. CSV leído con `Import-Csv`, PNG con System.Drawing y SVG como XML                                                                           | ACCEPTED LIMITATION |
| C-3 | Baja      | En Edge la suite detectó una pausa de la propia prueba por una pestaña en segundo plano; corregida                                                                                           | RESOLVED            |
| S-1 | —         | `npm audit`: 0 vulnerabilidades. Licencias de producción MIT, ISC y BSD-3-Clause                                                                                                             | RESOLVED            |
| S-2 | —         | Un único `dangerouslySetInnerHTML` (KaTeX, sin `trust`, con expresiones generadas por la aplicación). Sin `eval`, almacenamiento local ni solicitudes propias; sin mapas de código en `dist` | RESOLVED            |
| S-3 | —         | SVG con escape probado; CSV sin texto de la persona usuaria; nombres de archivo saneados; Object URLs liberadas                                                                              | RESOLVED            |
| S-4 | Baja      | Sin CSP. Producción sólo envía `nosniff` y `referrer-policy`; Cloudflare añade informes NEL a `a.nel.cloudflare.com`                                                                         | PENDING (M10)       |

La privacidad se trata en [PRE-PUSH-REVIEW.md](PRE-PUSH-REVIEW.md).
