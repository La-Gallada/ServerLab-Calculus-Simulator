# Modelo matemático provisional

**Estado:** provisional; resultados hipotéticos, no mediciones de servidores reales.

**Implementación M02:** las fórmulas están centralizadas en `src/math/` y sus parámetros inmutables en `src/config/model.ts`. Ningún componente React calcula ni redondea resultados matemáticos.

## Tiempo de respuesta

\[
R(n)=100+\frac{200n}{100-n}, \quad 0\le n<100
\]

`n` representa usuarios concurrentes y `R(n)` milisegundos. Para controles del simulador, `n` es entero en `[0, 99]`; para límites y derivadas se usa la extensión continua del mismo dominio. `C=100` es la capacidad de referencia. En `n=100` la función no está definida.

\[
R'(n)=\frac{20000}{(100-n)^2}\quad\text{ms/usuario},\qquad
R''(n)=\frac{40000}{(100-n)^3}
\]

Interpretación: `R'(n)` es una tasa instantánea, no el incremento discreto `R(n+1)-R(n)`. Como `R'` y `R''` son positivas dentro del dominio, el tiempo aumenta y su crecimiento se acelera. Los límites son `lim n→0 R(n)=100` ms y `lim n→100⁻ R(n)=+∞`; la segunda es una saturación idealizada.

## Transferencia

\[
T(t)=5+0.2t\quad\text{MB/s},\quad 0\le t\le30
\]

\[
A(t)=\int_0^tT(x)\,dx=5t+0.1t^2\quad\text{MB}
\]

Para `[a,b]`, `D(a,b)=A(b)-A(a)`. Nunca mezclar unidades: `T` es tasa (MB/s) y `A`, `D` son cantidades (MB).

## Optimización

Para un umbral `L` en ms, se resuelve `R(n)≤L`:

\[
n\le\frac{100(L-100)}{L+100}
\]

Para usuarios enteros: si `L < 100`, no hay carga factible; si `L = 100`, sólo `n=0`; en otro caso se usa el piso de la expresión y se limita a 99.

## Validación independiente

| Caso                           |         Resultado calculado | Estado                      |
| ------------------------------ | --------------------------: | --------------------------- |
| R(0), R(50), R(60)             |            100, 300, 400 ms | coincide                    |
| R(65), R(90), R(99)            |    471.4286, 1900, 19900 ms | coincide                    |
| R'(50), R'(60), R'(65)         | 8, 12.5, 16.3265 ms/usuario | coincide                    |
| T(0), T(30), A(30)             |          5, 11 MB/s; 240 MB | coincide                    |
| D(10,20)                       |                       80 MB | coincide                    |
| máximos para 300, 500, 1000 ms |         50, 66, 81 usuarios | coincide                    |
| R(66), R(67)                   |       488.2353, 506.0606 ms | confirma el corte de 500 ms |
