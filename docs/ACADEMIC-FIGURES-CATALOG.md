# Catálogo de figuras académicas

Quince representaciones disponibles en `/#/exportaciones`. El orden y la columna «#» sirven sólo como índice; la numeración del documento se decide aparte. Los archivos mostrados corresponden a los parámetros iniciales.

| #   | Módulo       | Identificador                       | Representación                 | Parámetros        | Archivo base                             |
| --- | ------------ | ----------------------------------- | ------------------------------ | ----------------- | ---------------------------------------- |
| 1   | Dashboard    | `dashboard-response-time`           | Respuesta según usuarios       | n, umbral, escala | `serverlab-tiempo-respuesta-n65`         |
| 2   | Límites      | `limits-zero-approach`              | Aproximación a 0⁺              | distancia         | `serverlab-limite-carga-inicial`         |
| 3   | Límites      | `limits-capacity-approach`          | Aproximación a 100⁻ (log.)     | distancia         | `serverlab-limite-capacidad`             |
| 4   | Derivadas    | `derivatives-tangent`               | R(n) y recta tangente          | punto             | `serverlab-recta-tangente-n65`           |
| 5   | Derivadas    | `derivatives-first`                 | R′(n), ms/usuario              | punto, escala     | `serverlab-primera-derivada`             |
| 6   | Derivadas    | `derivatives-second`                | R″(n), ms/usuario²             | punto, escala     | `serverlab-segunda-derivada`             |
| 7   | Integrales   | `integrals-rate-area`               | T(t) y área                    | a, b              | `serverlab-tasa-transferencia-0-30s`     |
| 8   | Integrales   | `integrals-accumulated-data`        | A(t) y diferencia              | a, b              | `serverlab-datos-acumulados-0-30s`       |
| 9   | Integrales   | `integrals-example-0-30`            | Integral de 0 a 30 s           | fijos             | `serverlab-integral-0-30s`               |
| 10  | Integrales   | `integrals-example-10-20`           | Integral de 10 a 20 s          | fijos             | `serverlab-integral-10-20s`              |
| 11  | Optimización | `optimization-response-region`      | Región factible                | L, n, escala      | `serverlab-optimizacion-500ms`           |
| 12  | Optimización | `optimization-integer-verification` | Verificación del máximo entero | L                 | `serverlab-verificacion-entera-500ms`    |
| 13  | Optimización | `optimization-threshold-capacity`   | Umbral frente a capacidad      | L                 | `serverlab-capacidad-segun-umbral`       |
| 14  | Optimización | `optimization-scenario-300`         | Escenario de 300 ms            | n, escala         | `serverlab-optimizacion-escenario-300ms` |
| 15  | Optimización | `optimization-scenario-500`         | Escenario de 500 ms            | n, escala         | `serverlab-optimizacion-escenario-500ms` |

## Observaciones de uso

- Con los parámetros iniciales, la gráfica 9 coincide visualmente con la 7, y la 15 con la 11. No conviene incluir ambas de cada par en el documento.
- En la 11, 14 y 15 la intersección, el máximo entero y el usuario siguiente quedan muy próximos; la 12 los muestra separados.
- En la 13, la escalera entera y la frontera continua casi se superponen para umbrales bajos.
- En la 3, el eje vertical es logarítmico; en la 2 y la 12 el eje vertical no comienza en cero.
- La 1 en vista habitual muestra de 0 a 80 usuarios; una carga mayor se anota como fuera de vista.

Muestras reales: [evidence/M08/generated](evidence/M08/generated).

La selección recomendada para el documento está en la [guía de entrega académica](ACADEMIC-DELIVERY-GUIDE.md); las figuras actuales, con la nota de autoría del Grupo #4, en [academic-delivery](academic-delivery/README.md). Las muestras de M08 son históricas y conservan el texto anterior.
