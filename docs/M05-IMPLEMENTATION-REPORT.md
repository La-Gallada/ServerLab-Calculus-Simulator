# M05 — Laboratorio de derivadas

**Fecha:** 27 de noviembre de 2026  
**Estado:** completado; veredicto **GO** para M06.

## Recuperación e implementación

M05 se recuperó tras una interrupción por límite de uso, no por un fallo confirmado. Se conservaron la ruta, componente y estilos parciales; la auditoría detectó una incompatibilidad de tipos entre series de Recharts, corregida normalizando las series de visualización.

La ruta `/derivadas` ahora contiene cuatro métricas dinámicas, control local entero inicializado desde Dashboard, tres modos de gráfica, recta tangente, comparación explícita entre R′(n), R′(n)×1 usuario y ΔR(n), tabla seleccionable y procedimientos KaTeX. El control local no modifica la carga compartida del Dashboard.

## Validación matemática y gráfica

El componente consume exclusivamente el motor M02. Se verifican R(65)=471,4285714 ms, R′(65)=16,3265306 ms/usuario, R″(65)=0,9329446 ms/usuario² y ΔR(65)=16,8067227 ms. En n=99, ΔR se declara no definido porque el siguiente usuario cae fuera del dominio; R(100) no se evalúa.

La función y su tangente usan escala lineal. R′ y R″ usan escala logarítmica explícita, sin modificar los datos, para mostrar su crecimiento en todo el dominio.

## Validación técnica

| Comando                | Resultado                                          |
| ---------------------- | -------------------------------------------------- |
| `npm ci`               | PASS — 285 paquetes; 0 vulnerabilidades reportadas |
| `npm run typecheck`    | PASS                                               |
| `npm run lint`         | PASS                                               |
| `npm run format:check` | PASS                                               |
| `npm run test:run`     | PASS — 48 pruebas en 5 archivos                    |
| `npm run build`        | PASS                                               |
| `npm run test:e2e`     | PASS — 4 pruebas Chromium                          |

El bundle principal quedó en 297,94 kB gzip. No se añadieron dependencias; KaTeX continúa incluyendo sus fuentes locales en `dist/assets`.

## Criterios de aceptación

| Criterio                                        | Estado |
| ----------------------------------------------- | ------ |
| Ruta, métricas, tangente, R′ y R″ funcionales   | PASS   |
| Tres modos gráficos y tabla dinámica            | PASS   |
| Diferencia instantánea/discreta y frontera n=99 | PASS   |
| Motor M02 como única fuente                     | PASS   |
| Diseño accesible y adaptable                    | PASS   |
| Pruebas, build y evidencia reales               | PASS   |
| Sin regresiones en Dashboard y Límites          | PASS   |
| Sin commits, push ni despliegue                 | PASS   |

No se inició M06. El modelo sigue siendo hipotético y provisional.
