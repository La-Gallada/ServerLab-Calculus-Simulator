# Guía de entrega académica

**Estado: pendiente.** ServerLab es una versión candidata (`1.0.0-rc.1`). El modelo matemático es provisional hasta que el grupo confirme sus secciones; este material no es la entrega definitiva.

Desarrollado por el Grupo #4. Proyecto de Investigación de Cálculo I. Ingeniería en Sistemas. Universidad Latina de Costa Rica. III Cuatrimestre, 2026. Proyecto estudiantil: no es un producto oficial de la universidad.

Simulador: <https://serverlab-calculus-simulator.pages.dev/>

## Propósito

Mostrar de forma interactiva cómo los límites, las derivadas, las integrales y la optimización permiten analizar el rendimiento de un servidor web **hipotético**. Apoya el apartado 13, «Representaciones gráficas».

## Relación con Ingeniería en Sistemas

| Concepto     | Pregunta que ayuda a responder                                 |
| ------------ | -------------------------------------------------------------- |
| Límites      | ¿Qué ocurre al acercarse a la capacidad de referencia?         |
| Derivadas    | ¿Cuánto empeora la respuesta ante un pequeño aumento de carga? |
| Integrales   | ¿Cuántos datos se transfieren en un periodo con tasa variable? |
| Optimización | ¿Cuál es la mayor carga que cumple un objetivo de respuesta?   |

## Módulos

| Módulo        | Qué hace                                                                                 |
| ------------- | ---------------------------------------------------------------------------------------- |
| Dashboard     | Resume respuesta, pendiente, datos transferidos y carga máxima con controles compartidos |
| Límites       | Aproximación a 0⁺ y a 100⁻, tabla, asíntota y procedimiento                              |
| Derivadas     | R, R′, R″, recta tangente e incremento discreto                                          |
| Integrales    | Área bajo T(t), datos acumulados e integrales definidas                                  |
| Optimización  | Región factible, frontera continua, máximo entero y verificación                         |
| Exportaciones | 15 figuras en PNG, SVG y CSV con ficha académica                                         |
| Acerca de     | Autoría, alcance, modelo y limitaciones                                                  |

## Modelo vigente (provisional)

Fuente: [MATHEMATICAL-MODEL.md](MATHEMATICAL-MODEL.md). Identificador `serverlab-response-transfer-v1`, versión `provisional-2026-11`.

- Tiempo de respuesta: `R(n) = 100 + 200n/(100 − n)`, con `0 ≤ n < 100`.
- `R′(n) = 20 000/(100 − n)²` y `R″(n) = 40 000/(100 − n)³`.
- Tasa de transferencia: `T(t) = 5 + 0,2t`, con `0 ≤ t ≤ 30`.
- Datos acumulados: `A(t) = 5t + 0,1t²`; datos en un intervalo: `D(a,b) = A(b) − A(a)`.
- Máximo de usuarios: mayor entero con `R(n) ≤ L`; frontera continua `n* = 100(L − 100)/(L + 100)` si `L ≥ 100`.

| Símbolo | Significado                     | Unidad      |
| ------- | ------------------------------- | ----------- |
| n       | usuarios concurrentes           | usuarios    |
| R(n)    | tiempo de respuesta             | ms          |
| R′(n)   | tasa de cambio de la respuesta  | ms/usuario  |
| R″(n)   | cambio de esa tasa              | ms/usuario² |
| t       | tiempo transcurrido             | s           |
| T(t)    | tasa de transferencia           | MB/s        |
| A(t), D | datos acumulados o transferidos | MB          |
| L       | tiempo máximo permitido         | ms          |

## Limitaciones y diferencia con mediciones

- Las funciones se eligieron como hipótesis; no se ajustaron a datos de ningún servidor.
- Un resultado describe el modelo, no una prueba de carga ni monitoreo.
- La asíntota en 100 usuarios es una idealización: no predice una caída real.
- No se modelan CPU, memoria, red, costos ni almacenamiento.
- Superar un umbral significa incumplir un objetivo, no que el servidor falle.

## Exportar gráficas

1. Abrir «Exportaciones» (o el botón **Exportar** de un laboratorio).
2. Elegir figura y parámetros; tema **Académico**, formato **PNG**, 2400 × 1600.
3. Descargar y pulsar **Copiar ficha académica**.

## Incorporarlas al documento

- Insertar el PNG a todo el ancho del texto (unos 16 cm); las anotaciones pequeñas quedan cerca de 7 pt, así que no conviene reducirlo más.
- Asignar la numeración y el título según el formato del curso.
- Añadir la nota: «Nota. Elaboración propia del Grupo #4 mediante ServerLab, a partir del modelo matemático hipotético del proyecto de investigación.»
- Explicar cada figura en el texto; no insertar gráficas sin interpretación.

## Selección recomendada

El catálogo completo ([15 figuras](ACADEMIC-FIGURES-CATALOG.md)) sigue disponible. No es obligatorio usar todas.

| #   | Figura                        | Clasificación  | Exposición |
| --- | ----------------------------- | -------------- | ---------- |
| 1   | Respuesta según usuarios      | Esencial       | sí         |
| 2   | Límite de carga inicial       | Complementaria |            |
| 3   | Límite cercano a la capacidad | Esencial       | sí         |
| 4   | Función y recta tangente      | Esencial       | sí         |
| 5   | Primera derivada              | Complementaria |            |
| 6   | Segunda derivada              | Complementaria |            |
| 7   | Integral de 0 a 30 s          | Complementaria |            |
| 8   | Integral de 10 a 20 s         | Esencial       | sí         |
| 9   | Datos acumulados              | Complementaria |            |
| 10  | Región factible               | Esencial       | sí         |
| 11  | Verificación de la solución   | Esencial       | sí         |
| 12  | Umbral frente a capacidad     | Complementaria |            |

Redundantes con parámetros iniciales: «Tasa de transferencia» (igual a la 7) y «Escenario de 500 ms» (igual a la 10). «Escenario de 300 ms» sirve si se comparan objetivos.

## Paquete local

[academic-delivery/](academic-delivery/README.md) reúne las 12 figuras (PNG, SVG, CSV estándar y regional, ficha), un índice con interpretaciones y el código QR. El ZIP `docs/academic-delivery/serverlab-grupo4-paquete-academico-provisional.zip` se genera localmente y no se versiona:

```powershell
npm run build; $env:ACADEMIC_PACKAGE='1'; npx playwright test academic-package; Remove-Item Env:ACADEMIC_PACKAGE
```

## Pendiente de confirmar con el grupo

- [ ] Funciones, coeficientes y dominios definitivos.
- [ ] Unidades y supuestos redactados en el documento.
- [ ] Ejemplos académicos (65 usuarios, 300 y 500 ms, intervalos de 0–30 y 10–20 s).
- [ ] Figuras finales y su numeración.
- [ ] Requisitos de formato, citas y duración de la exposición.
- [ ] Política del curso sobre el apoyo de herramientas de IA y cómo declararlo.
- [ ] Autorización para el contenido señalado en [PRE-PUSH-REVIEW.md](PRE-PUSH-REVIEW.md).

Si cambia el modelo, seguir [MODEL-UPDATE-GUIDE.md](MODEL-UPDATE-GUIDE.md).
