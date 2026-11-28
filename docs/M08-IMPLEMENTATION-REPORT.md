# M08 — Sistema de exportación de figuras académicas

**Fecha:** 27 de noviembre de 2026  
**Estado:** completado; veredicto **GO** para M09 (requiere autorización explícita).

## Estado recuperado

M00–M07 completos, sin commits. Antes de modificar código: `typecheck` aprobado y 142 pruebas unitarias aprobadas. `docs/evidence` contenía 60 archivos (53 PNG y 7 Markdown); la cifra de 59 usada anteriormente omitía el README de M07.

## Implementación

- Núcleo en `src/export/`: registro tipado, 15 definiciones, renderizador SVG, PNG, CSV, ficha, nombres, descargas y ZIP.
- Centro en `/#/exportaciones` con filtros, parámetros, temas, formatos, resoluciones, vista previa, ficha y paquete.
- Botón **Exportar** en Dashboard (3), Límites (1), Derivadas (1), Integrales (3) y Optimización (5).
- Entrada «Exportaciones» en el menú.

Arquitectura, formatos y limitaciones técnicas: [EXPORT-SYSTEM.md](EXPORT-SYSTEM.md). Índice: [ACADEMIC-FIGURES-CATALOG.md](ACADEMIC-FIGURES-CATALOG.md).

Cambios en código previo, sin alterar su comportamiento: rangos de muestreo de Dashboard, Límites y Derivadas extraídos a archivos compartidos, y escalas de Optimización movidas a `optimizationFigures.ts`. Sin dependencias nuevas; el motor y el modelo no cambiaron.

## Problemas encontrados y corregidos

| Detectado por   | Problema                                                | Corrección                      |
| --------------- | ------------------------------------------------------- | ------------------------------- |
| E2E             | Título del eje Y encimado con marcas de siete cifras    | Margen según la marca más ancha |
| Revisión visual | Rótulo del límite sobre la curva en la aproximación a 0 | Alineado a la derecha           |
| Revisión visual | El máximo entero quedaba tapado por otros puntos        | Se dibuja al final              |
| Revisión visual | Botón «Restablecer» con icono apilado y unidad repetida | Estilo y etiqueta               |
| Revisión        | La leyenda incluía la carga aun fuera de vista          | Se omite en ese caso            |

## Validación técnica

| Comando                | Resultado                                          |
| ---------------------- | -------------------------------------------------- |
| `npm ci`               | PASS — 285 paquetes; 0 vulnerabilidades reportadas |
| `npm run typecheck`    | PASS                                               |
| `npm run lint`         | PASS                                               |
| `npm run format:check` | PASS                                               |
| `npm run test:run`     | PASS — 221 pruebas en 11 archivos (79 nuevas)      |
| `npm run build`        | PASS — persiste el aviso de chunk > 500 kB         |
| `npm run test:e2e`     | PASS — 12 pruebas Chromium (4 nuevas)              |

## Verificación de archivos descargados

- **PNG:** firma, dimensiones leídas de IHDR, opacidad total, color de fondo, proporción de contenido y variedad de colores; las tres resoluciones; tema oscuro.
- **SVG:** XML válido, series presentes, sin scripts ni referencias externas, y sin textos recortados o encimados en las 15 figuras con ambos temas; además, con tema Académico, en cada opción de los selectores y en parámetros extremos.
- **CSV:** BOM, columnas consistentes, valores contrastados con el motor y variante regional.
- **Ficha:** copiada y leída del portapapeles en las 15 figuras.
- **ZIP:** 60 entradas, CRC y firmas.
- Un fallo simulado de `canvas.toBlob` muestra error, sin descarga ni mensaje de éxito.
- Sin errores ni avisos de consola, solicitudes fallidas o externas en las pruebas de exportación.

## Inspección de las 15 figuras

Revisadas en color como hojas de contacto y, en escala de grises, la hoja de optimización generada con el mismo procedimiento. Títulos y leyendas completos, ejes con unidades, anotaciones visibles, sin controles de la aplicación y con 2400 × 1600 px verificados por prueba. Observaciones no bloqueantes en el catálogo: dos pares visualmente idénticos y puntos próximos en las figuras de región factible.

## Evidencias

`docs/evidence/M08/`: 10 capturas, 15 PNG, 5 SVG, 6 CSV, 15 fichas y un README. Los 60 archivos de M01–M07 conservan los hashes previos. Una ejecución sin `EVIDENCE` no modificó M08.

## Tamaño del build

| Recurso                   |      gzip | Antes     |
| ------------------------- | --------: | --------- |
| JavaScript principal      | 316,30 kB | 314,30 kB |
| `ExportPanel` (diferido)  |  15,93 kB | —         |
| `ExportCenter` (diferido) |   3,40 kB | —         |
| `ExportDialog` (diferido) |   0,60 kB | —         |
| CSS                       |  17,51 kB | 16,28 kB  |

El generador se carga sólo al visitar el centro o al exportar.

## Limitaciones y riesgos

- Sólo Chromium. No se probó Firefox, Safari, dispositivos físicos ni la inserción en Google Docs, Word, Excel o GeoGebra.
- Sin lector de pantalla. El contraste de texto y series de los temas exportados se prueba (≥ 4,5:1); el de la interfaz no se midió.
- Las fuentes del SVG no se incrustan.
- Las figuras exportadas usan un renderizador propio: coinciden en datos con los laboratorios, no en aspecto.
- El paquete usa parámetros iniciales, no los ajustados.
- En un navegador no puede confirmarse que la persona haya guardado el archivo; el mensaje indica que se generó y se envió a descargas.
- Con `core.autocrlf=true`, una clonación nueva en Windows podría obtener CRLF y fallar `format:check`; conviene evaluar `.gitattributes` en M09.
- Las 15 muestras PNG añaden unos 5 MB al repositorio.

## Deuda técnica para M09

Campo numérico de Integrales; numeración de procedimientos de Límites y Derivadas; tablas y ejemplos dependientes del modelo provisional; separadores de miles en campos numéricos; chunk mayor de 500 kB; carga diferida general de pantallas; versiones `latest`; confirmación del modelo definitivo; finales de línea.

## Exportación múltiple (opcional)

Implementada como ZIP sin compresión, probada de extremo a extremo. No usa dependencias ni dispara múltiples descargas.

## Criterios de aceptación

| Criterio                                                          | Estado |
| ----------------------------------------------------------------- | ------ |
| Sistema centralizado                                              | PASS   |
| Ruta `/exportaciones`                                             | PASS   |
| 15 figuras funcionales                                            | PASS   |
| Datos del motor matemático                                        | PASS   |
| Previsualización                                                  | PASS   |
| Tema académico                                                    | PASS   |
| Tema ServerLab                                                    | PASS   |
| PNG reales                                                        | PASS   |
| Resoluciones correctas                                            | PASS   |
| SVG autónomos                                                     | PASS   |
| CSV con datos originales                                          | PASS   |
| Metadatos académicos                                              | PASS   |
| Nombres reconocibles                                              | PASS   |
| Exportación desde laboratorios                                    | PASS   |
| Parámetros conservados                                            | PASS   |
| Dashboard sin alteraciones                                        | PASS   |
| Singularidades correctas                                          | PASS   |
| Áreas de integración correctas                                    | PASS   |
| Soluciones de optimización correctas                              | PASS   |
| Figuras legibles e imprimibles (en pantalla; sin prueba en papel) | PASS   |
| Interfaz adaptable hasta 320 px                                   | PASS   |
| Pruebas existentes y nuevas                                       | PASS   |
| Build funcional                                                   | PASS   |
| Muestras reales                                                   | PASS   |
| Evidencias anteriores conservadas                                 | PASS   |
| Sin regresiones detectadas                                        | PASS   |
| Sin push ni despliegue                                            | PASS   |

El criterio original «sin commits» fue sustituido por la política de versionado autorizada durante este milestone.

## Git and Version Control

Durante M08 el propietario autorizó commits locales. Historial:

| Hash      | Título                                                                              | Archivos |
| --------- | ----------------------------------------------------------------------------------- | -------: |
| `5e41c7f` | `feat(serverlab): establish core simulator and mathematical laboratories (M00-M07)` |      186 |
| `d1ef124` | `docs(agents): adopt local commit policy for milestone versioning`                  |        5 |
| ver nota  | `feat(exports): implement academic figure export system (M08)`                      |      102 |

- **Nota sobre el hash de M08:** un commit no puede contener su propio hash; se obtiene con `git log -1 --grep "(M08)" --format=%H`.
- **Separación:** M00–M07 se confirmó desde una copia tomada antes de iniciar M08, verificada por SHA-256 y validada de forma aislada (142 unitarias y 8 E2E). Al preparar ese commit se retiraron rutas del equipo de `AUDIT-00` y se amplió `.gitignore`.
- **Resumen de M08:** núcleo de exportación, centro, botones, pruebas, evidencias y documentación.
- **Rama:** `main`.
- **Working tree:** limpio tras el commit de M08.
- **Push:** no realizado; el remoto no tenía referencias al comprobarlo.
- **Despliegue:** ninguno. Tampoco merge ni operaciones destructivas.

Antes de publicar: el repositorio versiona `references/` (por instrucción del propietario); `AGENTS.md` indica no publicarlo en la aplicación, y en un repositorio público sería visible tras un push.

No se inició M09.
