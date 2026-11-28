# Guía de exposición

Propuesta de demostración de **unos 5 minutos** (ajustable entre 4 y 6). No es una duración oficial: confirmar el tiempo asignado.

Los valores corresponden al modelo provisional y están fijados en `src/math/presentation.test.ts`.

## Preparación

- Abrir <https://serverlab-calculus-simulator.pages.dev/> y recargar (cada recarga restablece los valores).
- Zoom del navegador al 100 % o 90 %; cerrar otras pestañas.
- Tener listo el plan sin conexión.

## Guion

| Tiempo    | Acción en pantalla                                               | Resultado esperado                                          | Qué decir                                                                                                   |
| --------- | ---------------------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 0:00–0:30 | Dashboard                                                        | 65 usuarios, 471,43 ms                                      | «ServerLab aplica Cálculo I a un servidor web hipotético. No mide un servidor real.»                        |
| 0:30–1:00 | Señalar las cuatro tarjetas                                      | 16,33 ms/usuario; 240 MB; máximo 66 usuarios para 500 ms    | «Cada indicador sale de una herramienta del cálculo.»                                                       |
| 1:00–1:20 | Mover usuarios a 80                                              | 900 ms; «Umbral excedido»                                   | «15 usuarios más casi duplican la respuesta.»                                                               |
| 1:20–2:00 | Límites → «Capacidad»; pulsar 1, 0,1 y 0,01                      | 19 900; 199 900; 1 999 900 ms                               | «Al acercarse a 100 por la izquierda, la respuesta crece sin cota. En 100 no está definida.»                |
| 2:00–2:50 | Derivadas; deslizar a 75                                         | R′(75) = 32 ms/usuario; ΔR(75) = 33,333333 ms               | «La derivada es la pendiente instantánea; el usuario siguiente cuesta algo más porque la curva es convexa.» |
| 2:50–3:30 | Integrales → «Cargar ejemplo [10, 20]»                           | 80 MB, área sombreada                                       | «La integral convierte una tasa en MB/s en una cantidad en MB.»                                             |
| 3:30–4:20 | Optimización → preset 500 ms, mostrar verificación; luego 300 ms | 66 usuarios; R(66) ≈ 488,24; R(67) ≈ 506,06; con 300 ms, 50 | «Como R es creciente, el máximo está en la frontera. Se redondea hacia el entero que todavía cumple.»       |
| 4:20–4:40 | Botón **Exportar** de la región factible                         | Vista previa con fondo blanco                               | «Las figuras del documento salen de los mismos datos.»                                                      |
| 4:40–5:00 | Acerca de                                                        | Limitaciones                                                | «El modelo es hipotético y está pendiente de confirmación.»                                                 |

## Preguntas posibles

**¿De dónde salen las funciones?** Son hipótesis para el proyecto; no se ajustaron a mediciones. El grupo debe confirmarlas.

**¿Por qué no se puede evaluar R(100)?** El denominador 100 − n se anula. El límite por la izquierda es +∞, que no es un valor de la función.

**¿Qué diferencia hay entre R′(75) y ΔR(75)?** R′ es la pendiente en el punto (32 ms por usuario); ΔR es el cambio real al sumar un usuario (≈ 33,33 ms). Como R″ > 0, ΔR es mayor que R′.

**¿Por qué no se resuelve la optimización con R′(n) = 0?** R′ nunca es cero: no hay máximo interior. La restricción R(n) ≤ L determina el máximo en la frontera.

_*¿Por qué 66 y no 67 si n* ≈ 66,67?_* Los usuarios son enteros y R(67) ≈ 506,06 ms supera 500.

**¿Qué representa el área bajo T(t)?** Los MB transferidos en el intervalo. En A(t) no es un área sino la diferencia A(b) − A(a).

**¿Se podría aplicar a un servidor real?** Habría que medirlo, ajustar un modelo y validar su error. Eso está fuera del alcance.

**¿Cómo se comprobaron los cálculos?** Con pruebas automatizadas: valores de referencia, diferencias finitas, integración numérica y las 100 fronteras de la optimización.

**¿Se usó inteligencia artificial?** Responder según la política del curso y lo ocurrido: el repositorio documenta apoyo de agentes de programación y los recursos gráficos originales declaran generación con IA.

## Si falla la conexión

1. **Copia local** (no necesita internet si las dependencias ya están instaladas). Preparar antes con `npm ci` y `npm run build`; en la exposición:

```powershell
node scripts/serve-dist.mjs
```

Abrir <http://127.0.0.1:4173>. Probar este paso con la red desconectada antes del día de la exposición.

2. **Sin equipo preparado:** mostrar las figuras de `docs/academic-delivery/png/` (copiarlas a una memoria junto con `README.md`).
