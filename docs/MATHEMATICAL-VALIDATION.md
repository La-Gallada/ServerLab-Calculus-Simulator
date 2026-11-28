# Validación matemática M02

Los resultados se verifican en `src/math/math.test.ts` contra el motor, usando tolerancias de punto flotante únicamente en afirmaciones decimales.

| Cálculo                          |                                    Resultado |
| -------------------------------- | -------------------------------------------: |
| R(0), R(25), R(50), R(65), R(99) | 100; 166.6666667; 300; 471.4285714; 19900 ms |
| R'(0), R'(60), R'(65), R'(99)    |        2; 12.5; 16.3265306; 20000 ms/usuario |
| R''(0), R''(50), R''(90)         |                   0.04; 0.32; 40 ms/usuario² |
| ΔR(50)                           |                                 8.1632653 ms |
| T(0), T(10), T(20), T(30)        |                             5; 7; 9; 11 MB/s |
| A(0), A(10), A(20), A(30)        |                           0; 60; 140; 240 MB |
| D(0,30), D(10,20), D(15,15)      |                                240; 80; 0 MB |
| Optimización 300, 500, 1000 ms   |                          50, 66, 81 usuarios |

Para 500 ms, la intersección continua es 66.6666667 usuarios; la solución operativa es 66, con R(66)=488.2352941 ms, mientras R(67)=506.0606061 ms. Un usuario es discreto; 66.6666667 sólo representa la intersección continua del modelo.

Propiedades probadas: crecimiento de R, positividad y crecimiento de R', positividad de R'', coincidencia de tangente en el punto, A'(t)≈T(t), aditividad de integrales, vecinos de optimización y ausencia de puntos no finitos en curvas.
