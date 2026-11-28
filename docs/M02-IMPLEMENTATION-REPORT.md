# M02 — Implementación del motor matemático

## Resultado

Se implementó un motor TypeScript puro en `src/math/`, sin dependencias de React, DOM, Recharts o estado visual. La única fuente de parámetros es `src/config/model.ts`, congelada con `Object.freeze`.

## Arquitectura

- `validation.ts`: resultados tipados y validación de dominio.
- `response.ts`, `limits.ts`, `derivatives.ts`, `transfer.ts`, `optimization.ts`: funciones matemáticas por responsabilidad.
- `snapshot.ts`: entrada inicial y métricas consistentes para el futuro estado de React.
- `formatters.ts`: presentación `es-CR` separada de los cálculos.
- `index.ts`: API pública.

Las funciones continuas aceptan decimales; las operativas exigen usuarios enteros. `n=100` devuelve un error de singularidad y los límites representan infinito con un tipo explícito.

## Pruebas y estado

`npm run test:run` aprobó 39 pruebas: 35 matemáticas nuevas y 4 existentes de interfaz. No se modificaron pantallas ni se implementaron gráficas, dashboard, commits, push o despliegue. El modelo permanece provisional e hipotético.

Ver `docs/MATHEMATICAL-VALIDATION.md`, `docs/MATH-API.md` y `docs/evidence/M02/calculated-results.md`.

## Validación final

| Comprobación           | Resultado                           |
| ---------------------- | ----------------------------------- |
| `npm run typecheck`    | PASS                                |
| `npm run lint`         | PASS                                |
| `npm run test:run`     | PASS: 39 pruebas, 0 fallidas        |
| `npm run build`        | PASS: build estático generado       |
| `npm run format:check` | PASS                                |
| `npm run test:e2e`     | PASS: 1 prueba Chromium, 0 fallidas |

## Criterios de aceptación

| Criterio                                                       | Estado |
| -------------------------------------------------------------- | ------ |
| Fuente única de configuración y fórmulas centralizadas         | PASS   |
| Casos de referencia, límites y singularidades                  | PASS   |
| Derivadas, incremento discreto y tangente diferenciados        | PASS   |
| Integrales, unidades y dominio                                 | PASS   |
| Optimización entera verificada por vecinos                     | PASS   |
| Datos para gráficas sin NaN/Infinity                           | PASS   |
| Entradas inválidas tipadas explícitamente                      | PASS   |
| Pruebas nuevas, regresión E2E y build                          | PASS   |
| Pantallas sin cambios innecesarios; sin commit/push/despliegue | PASS   |

## Veredicto

**GO para M03**, sujeto a autorización explícita. Para integrar el motor, el Dashboard deberá consumir `simulationSnapshot` y las series de `src/math`, sin volver a implementar fórmulas ni formatear números antes de tiempo.
