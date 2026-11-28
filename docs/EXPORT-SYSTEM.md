# Sistema de exportación

Genera en el navegador las figuras académicas de ServerLab. No usa servidor ni servicios externos.

## Arquitectura

```text
src/export/                  núcleo sin React
  types.ts                   figura, gráfica, tabla y parámetros
  registry.ts                catálogo, validación y resolución de figuras
  figures/                   definiciones por módulo (datos del motor)
  svg/renderSvg.ts           renderizador SVG único para ambos temas
  svg/text.ts                escape XML y ajuste de líneas
  themes.ts                  tokens de color, trazo y trama
  png.ts · csv.ts            rasterización y serialización
  metadata.ts · filenames.ts ficha académica y nombres
  download.ts                descarga mediante Blob y Object URL
  zip.ts · package.ts        paquete opcional
src/features/exports/        centro, panel, diálogo, botón y campos
```

Flujo: `resolveFigure(id, parámetros)` valida, pide los datos al motor M02 y devuelve una `ExportFigure`; de ese único objeto salen la vista previa, el SVG, el PNG, el CSV y la ficha.

Las definiciones reutilizan `buildIntegralFigure`, `buildResponseFigure`, `buildVerificationFigure`, `buildCapacityFigure` y los rangos compartidos con los laboratorios (`responseViews`, `limitWindow`, `tangentWindow`). No hay un segundo motor: la capa de exportación sólo elige muestras, ejes y textos. Las expresiones escritas en las fichas toman sus parámetros de `mathModelConfig`.

## Registro de figuras

Cada `FigureDefinition` declara identificador estable, categoría, nombre, descripción, variables, fórmulas, parámetros y una función `build`. El identificador no es un número de figura. Para añadir una figura: crear la definición en `figures/`, incluirla en `figureRegistry` y cubrirla en `export.test.ts`.

El catálogo completo está en [ACADEMIC-FIGURES-CATALOG.md](ACADEMIC-FIGURES-CATALOG.md).

## Parámetros

- Numéricos: punto o coma, hasta dos decimales, sin separador de miles. Se aplican con Enter o al salir; si son inválidos se conserva el valor anterior.
- Selectores: sólo las opciones declaradas.
- El motor rechaza, entre otros casos, intervalos invertidos y usuarios fuera del dominio.
- Los coeficientes del modelo no son configurables.
- En el centro, los parámetros se guardan por figura y no leen ni modifican el Dashboard. En los laboratorios, el diálogo usa los valores visibles al abrirlo.

## Temas y resoluciones

| Tema                       | Fondo     | Uso                      |
| -------------------------- | --------- | ------------------------ |
| Académico (predeterminado) | `#FFFFFF` | documentos e impresión   |
| ServerLab                  | `#0B1220` | presentaciones digitales |

Ambos usan los mismos datos, trazos y tramas. La información se distingue también por trazo (continuo, discontinuo, punteado, punto y raya), forma del marcador y trama rayada.

| PNG                   | Píxeles     |
| --------------------- | ----------- |
| Estándar              | 1200 × 800  |
| Alta (predeterminada) | 2400 × 1600 |
| Máxima                | 3600 × 2400 |

No se declara ninguna densidad en DPI: los PNG no la fijan en sus metadatos. Como referencia, 2400 px de ancho impresos a 16 cm equivalen a unos 380 píxeles por pulgada.

## SVG

Lienzo lógico `viewBox="0 0 1200 800"` con `width` y `height` explícitos. Incluye fondo, estilos como atributos, `<title>`, `<desc>`, recortes y patrones con identificadores prefijados por figura y tema. No contiene scripts, `foreignObject`, imágenes ni referencias externas. El texto se escapa y usa `Arial, Helvetica, sans-serif`: las fuentes no se incrustan, así que en un equipo sin ellas puede variar ligeramente la composición.

Se optó por un renderizador propio en lugar de copiar el SVG de Recharts: las leyendas de los laboratorios son HTML, los estilos dependen de la hoja CSS y la disposición depende del tamaño en pantalla.

## PNG

El SVG se genera con el tamaño final, se carga como imagen desde un Object URL y se dibuja en un `canvas` de las mismas dimensiones; por tanto el trazado vectorial se calcula a la resolución elegida. La URL se revoca y el lienzo se libera siempre. Si la conversión falla o resulta vacía, se muestra el error y no se descarga nada.

## CSV

| Variante | Separador | Decimal |
| -------- | --------- | ------- |
| Estándar | `,`       | `.`     |
| Regional | `;`       | `,`     |

UTF-8 con BOM (para que Excel reconozca los acentos), líneas CRLF y campos entrecomillados cuando contienen separador, comillas o saltos. Los encabezados incluyen unidades. Los números se escriben sin redondeo. La ausencia de valor es un campo vacío, con una columna de estado cuando corresponde. Un valor no finito detiene la exportación. La singularidad n = 100 no aparece como dato.

## Ficha académica y nombres

La ficha de texto reúne título, descripción, variables, parámetros, dominio, modelo, versión, escala, resumen, nota de elaboración propia y aclaración hipotética. No numera figuras ni cita fuentes externas.

Los archivos se llaman `serverlab-<descripción>[-tema-oscuro|-regional].<ext>`, en minúsculas ASCII; los decimales usan `p` (`7p25`).

## Paquete de figuras (opcional)

El centro genera un ZIP sin compresión con PNG, SVG, CSV estándar y ficha de las 15 figuras (60 archivos), con parámetros iniciales y el tema y resolución elegidos. Se implementó un escritor «store» propio para no añadir dependencias.

## Compatibilidad

- Google Docs: insertar PNG.
- Word y presentaciones: PNG; SVG sólo en versiones que lo admitan.
- PDF: exportar desde el editor tras insertar la imagen.
- Excel: CSV regional o estándar según la configuración. GeoGebra: CSV estándar.

Sólo se verificó en Chromium. No se probó la inserción en Google Docs, Word, Excel ni GeoGebra.

## Procedimiento para el documento

1. Abrir `/#/exportaciones` (o el botón **Exportar** de un laboratorio).
2. Elegir figura y parámetros; mantener tema Académico, PNG y alta resolución.
3. Descargar la imagen y copiar la ficha.
4. Insertar la imagen, asignar la numeración del documento y añadir la nota.

## Cambios de M09

Los campos del centro comparten la lectura regional de los laboratorios (miles con espacio; punto o coma de millares, ambiguos). El centro y el panel siguen siendo diferidos. La optimización exportada usa el máximo entero corregido.
