# Paquete académico provisional de ServerLab

**No es la entrega académica definitiva.** Las figuras y los datos corresponden a un modelo matemático **hipotético y provisional**, pendiente de confirmación por el grupo. No son mediciones de un servidor real.

Desarrollado por el Grupo #4. Proyecto de Investigación de Cálculo I. Ingeniería en Sistemas. Universidad Latina de Costa Rica. III Cuatrimestre, 2026.

Simulador: <https://serverlab-calculus-simulator.pages.dev/>

![Código QR del simulador](qr/serverlab-sitio-qr.png)

La numeración de este índice es provisional; la definitiva se decide en el documento. Cada ficha incluye la nota de elaboración propia. Para el documento se recomienda el PNG.

## Figuras que no se incluyen

- `integrals-rate-area`: Con sus parámetros iniciales coincide con la integral de 0 a 30 s. Sigue disponible en la aplicación.
- `optimization-scenario-500`: Con sus parámetros iniciales coincide con la región factible de 500 ms. Sigue disponible en la aplicación.
- `optimization-scenario-300`: No es duplicada, pero repite el formato de la región factible; útil si se comparan objetivos. Sigue disponible en la aplicación.

## 1. Tiempo de respuesta del servidor según la cantidad de usuarios concurrentes

- Categoría: **Esencial** · recomendada para la exposición
- Archivos: [PNG](png/serverlab-provisional-tiempo-respuesta-n65.png) · [SVG](svg/serverlab-provisional-tiempo-respuesta-n65.svg) · [CSV](csv/serverlab-provisional-tiempo-respuesta-n65.csv) · [CSV regional](csv/serverlab-provisional-tiempo-respuesta-n65-regional.csv) · [ficha](fichas/serverlab-provisional-tiempo-respuesta-n65.txt)
- Descripción: Curva del tiempo de respuesta del modelo con la carga seleccionada, el umbral y el máximo entero que lo cumple.
- Resultado calculado: R(n) crece de 100 a 900 ms entre 0 y 80 usuarios. Con 65 usuarios vale 471,43 ms.
- Interpretación: Presenta la función central del proyecto: el tiempo de respuesta crece con la carga y lo hace cada vez más rápido. Sirve para introducir el umbral y la capacidad de referencia.

## 2. Límite del tiempo de respuesta cuando la carga se aproxima a cero por la derecha

- Categoría: **Complementaria**
- Archivos: [PNG](png/serverlab-provisional-limite-carga-inicial.png) · [SVG](svg/serverlab-provisional-limite-carga-inicial.svg) · [CSV](csv/serverlab-provisional-limite-carga-inicial.csv) · [CSV regional](csv/serverlab-provisional-limite-carga-inicial-regional.csv) · [ficha](fichas/serverlab-provisional-limite-carga-inicial.txt)
- Descripción: Comportamiento de R(n) cuando la carga se aproxima a cero con valores positivos.
- Resultado calculado: Al acercarse n a cero por la derecha, R(n) se aproxima a 100 ms.
- Interpretación: El límite lateral en cero coincide con el tiempo base del modelo: describe la respuesta esperada con carga casi nula, no una medición.

## 3. Límite del tiempo de respuesta cuando la carga se aproxima a la capacidad por la izquierda

- Categoría: **Esencial** · recomendada para la exposición
- Archivos: [PNG](png/serverlab-provisional-limite-capacidad.png) · [SVG](svg/serverlab-provisional-limite-capacidad.svg) · [CSV](csv/serverlab-provisional-limite-capacidad.csv) · [CSV regional](csv/serverlab-provisional-limite-capacidad-regional.csv) · [ficha](fichas/serverlab-provisional-limite-capacidad.txt)
- Descripción: Crecimiento sin cota de R(n) cuando la carga se aproxima a la capacidad con valores menores.
- Resultado calculado: Entre n = 80 y n = 99,99, R(n) pasa de 900 a 1 999 900 ms y crece sin cota. El usuario 100 no se evalúa.
- Interpretación: Al acercarse a la capacidad por la izquierda la respuesta crece sin cota. La asíntota representa una saturación idealizada y justifica operar con margen.

## 4. Tiempo de respuesta y recta tangente en n = 65

- Categoría: **Esencial** · recomendada para la exposición
- Archivos: [PNG](png/serverlab-provisional-recta-tangente-n65.png) · [SVG](svg/serverlab-provisional-recta-tangente-n65.svg) · [CSV](csv/serverlab-provisional-recta-tangente-n65.csv) · [CSV regional](csv/serverlab-provisional-recta-tangente-n65-regional.csv) · [ficha](fichas/serverlab-provisional-recta-tangente-n65.txt)
- Descripción: Tiempo de respuesta y su recta tangente en el punto seleccionado, cuya pendiente es la primera derivada.
- Resultado calculado: La recta tangente toca R(n) en n = 65 con pendiente 16,3265 ms/usuario.
- Interpretación: La pendiente de la tangente es la sensibilidad instantánea de la respuesta ante la carga. Aproxima el cambio local, distinto del incremento discreto de un usuario.

## 5. Primera derivada del tiempo de respuesta, R′(n)

- Categoría: **Complementaria**
- Archivos: [PNG](png/serverlab-provisional-primera-derivada.png) · [SVG](svg/serverlab-provisional-primera-derivada.svg) · [CSV](csv/serverlab-provisional-primera-derivada.csv) · [CSV regional](csv/serverlab-provisional-primera-derivada-regional.csv) · [ficha](fichas/serverlab-provisional-primera-derivada.txt)
- Descripción: Tasa instantánea de cambio del tiempo de respuesta respecto a la carga.
- Resultado calculado: R′(n) crece de 2 a 20 000 ms/usuario entre 0 y 99 usuarios.
- Interpretación: La primera derivada es positiva y creciente: cada usuario adicional cuesta más cuanto mayor es la carga.

## 6. Segunda derivada del tiempo de respuesta, R″(n)

- Categoría: **Complementaria**
- Archivos: [PNG](png/serverlab-provisional-segunda-derivada.png) · [SVG](svg/serverlab-provisional-segunda-derivada.svg) · [CSV](csv/serverlab-provisional-segunda-derivada.csv) · [CSV regional](csv/serverlab-provisional-segunda-derivada-regional.csv) · [ficha](fichas/serverlab-provisional-segunda-derivada.txt)
- Descripción: Variación de la tasa instantánea; su signo positivo indica convexidad.
- Resultado calculado: R″(n) crece de 0,04 a 40 000 ms/usuario² entre 0 y 99 usuarios.
- Interpretación: La segunda derivada positiva indica convexidad: la tasa de deterioro se acelera y no hay punto de inflexión en el dominio.

## 7. Tasa de transferencia y área bajo la curva en [0 s; 30 s]

- Categoría: **Complementaria**
- Archivos: [PNG](png/serverlab-provisional-integral-0-30s.png) · [SVG](svg/serverlab-provisional-integral-0-30s.svg) · [CSV](csv/serverlab-provisional-integral-0-30s.csv) · [CSV regional](csv/serverlab-provisional-integral-0-30s-regional.csv) · [ficha](fichas/serverlab-provisional-integral-0-30s.txt)
- Descripción: Aplicación académica: datos transferidos entre t = 0 s y t = 30 s.
- Resultado calculado: La tasa pasa de 5 a 11 MB/s; el área bajo T(t) en [0 s; 30 s] equivale a 240 MB.
- Interpretación: El área bajo la tasa en todo el intervalo es el volumen total de datos transferidos. Las unidades pasan de MB/s a MB.

## 8. Tasa de transferencia y área bajo la curva en [10 s; 20 s]

- Categoría: **Esencial** · recomendada para la exposición
- Archivos: [PNG](png/serverlab-provisional-integral-10-20s.png) · [SVG](svg/serverlab-provisional-integral-10-20s.svg) · [CSV](csv/serverlab-provisional-integral-10-20s.csv) · [CSV regional](csv/serverlab-provisional-integral-10-20s-regional.csv) · [ficha](fichas/serverlab-provisional-integral-10-20s.txt)
- Descripción: Aplicación académica: datos transferidos entre t = 10 s y t = 20 s.
- Resultado calculado: La tasa pasa de 7 a 9 MB/s; el área bajo T(t) en [10 s; 20 s] equivale a 80 MB.
- Interpretación: La integral definida en un intervalo parcial separa lo transferido en ese periodo de lo acumulado desde el inicio.

## 9. Datos acumulados y diferencia A(b) − A(a) en [0 s; 30 s]

- Categoría: **Complementaria**
- Archivos: [PNG](png/serverlab-provisional-datos-acumulados-0-30s.png) · [SVG](svg/serverlab-provisional-datos-acumulados-0-30s.svg) · [CSV](csv/serverlab-provisional-datos-acumulados-0-30s.csv) · [CSV regional](csv/serverlab-provisional-datos-acumulados-0-30s-regional.csv) · [ficha](fichas/serverlab-provisional-datos-acumulados-0-30s.txt)
- Descripción: Datos acumulados A(t) y la diferencia entre los extremos del intervalo.
- Resultado calculado: A(t) pasa de 0 a 240 MB; la diferencia, 240 MB, es lo transferido en [0 s; 30 s].
- Interpretación: La función acumulada muestra el teorema fundamental: la transferencia es la diferencia de alturas A(b) − A(a), no un área bajo A.

## 10. Tiempo de respuesta y región factible para un máximo de 500 ms

- Categoría: **Esencial** · recomendada para la exposición
- Archivos: [PNG](png/serverlab-provisional-optimizacion-500ms.png) · [SVG](svg/serverlab-provisional-optimizacion-500ms.svg) · [CSV](csv/serverlab-provisional-optimizacion-500ms.csv) · [CSV regional](csv/serverlab-provisional-optimizacion-500ms-regional.csv) · [ficha](fichas/serverlab-provisional-optimizacion-500ms.txt)
- Descripción: Región de cargas que cumplen el tiempo máximo y solución entera.
- Resultado calculado: Con un máximo de 500 ms, la región factible llega hasta n* = 66,6667 y el máximo entero es 66 usuarios.
- Interpretación: La región factible reúne las cargas que cumplen el tiempo máximo. Como la respuesta es creciente, el óptimo está en la frontera de esa región.

## 11. Verificación del máximo entero para un máximo de 500 ms

- Categoría: **Esencial** · recomendada para la exposición
- Archivos: [PNG](png/serverlab-provisional-verificacion-entera-500ms.png) · [SVG](svg/serverlab-provisional-verificacion-entera-500ms.svg) · [CSV](csv/serverlab-provisional-verificacion-entera-500ms.csv) · [CSV regional](csv/serverlab-provisional-verificacion-entera-500ms-regional.csv) · [ficha](fichas/serverlab-provisional-verificacion-entera-500ms.txt)
- Descripción: Ampliación en torno al máximo entero y al siguiente usuario.
- Resultado calculado: El máximo entero es 66; el usuario 67 supera el umbral.
- Interpretación: Comprueba que la solución entera cumple el umbral y que el siguiente usuario lo supera: la frontera continua no es una cantidad de usuarios.

## 12. Relación entre el umbral de respuesta y la capacidad operativa máxima

- Categoría: **Complementaria**
- Archivos: [PNG](png/serverlab-provisional-capacidad-segun-umbral.png) · [SVG](svg/serverlab-provisional-capacidad-segun-umbral.svg) · [CSV](csv/serverlab-provisional-capacidad-segun-umbral.csv) · [CSV regional](csv/serverlab-provisional-capacidad-segun-umbral-regional.csv) · [ficha](fichas/serverlab-provisional-capacidad-segun-umbral.txt)
- Descripción: Máximo entero de usuarios en función del tiempo de respuesta permitido.
- Resultado calculado: La capacidad entera crece de forma escalonada con el umbral; con 500 ms permite 66 usuarios.
- Interpretación: Relaciona la exigencia de respuesta con la capacidad admitida: relajar el umbral aporta cada vez menos usuarios adicionales.
