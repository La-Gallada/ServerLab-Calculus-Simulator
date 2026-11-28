# M03 — Dashboard principal e integración visual

**Fecha:** 27 de noviembre de 2026  
**Estado:** completado; veredicto **GO** para M04.

## Resultado

Se reemplazó el placeholder del Dashboard por una interfaz interactiva, responsive y accesible. La implementación presenta cuatro métricas calculadas, gráfica de respuesta, controles de simulación, resumen de derivadas, resumen de transferencia y panel de optimización. El modelo sigue identificado como hipotético y provisional.

## Componentes e integración

- `src/state/simulation.tsx`, `simulationContext.ts` y `useSimulation.ts`: estado tipado compartido, actualización parcial y reinicio a los valores M02.
- `src/features/dashboard/Dashboard.tsx`: composición del Dashboard; consume el motor M02 y Recharts.
- `src/styles/index.css`: cuadrícula, tarjetas, controles, gráficos y breakpoints de M03.
- `src/features/dashboard/Dashboard.test.tsx`: comportamientos iniciales y actualizaciones.
- `tests/e2e/dashboard.spec.ts`: validación real en Chromium y generación de evidencia.

Los componentes visuales no calculan fórmulas. `simulationSnapshot` produce las métricas, `optimizeResponseThreshold` el máximo entero, y los muestreadores del motor generan las tres series. La vista habitual de R(n) llega hasta 80 usuarios; la vista de dominio llega hasta 99. `C=100` se dibuja sólo como referencia visual.

## Valores iniciales verificados

| Indicador               | Resultado del motor |
| ----------------------- | ------------------- |
| Usuarios concurrentes   | 65 usuarios         |
| Tiempo de respuesta     | 471,43 ms           |
| Primera derivada        | 16,33 ms/usuario    |
| Datos acumulados a 30 s | 240 MB              |
| Umbral                  | 500 ms              |
| Máximo permitido        | 66 usuarios         |
| Margen                  | 1 usuario           |
| Estado                  | Dentro del objetivo |

## Validación ejecutada

| Comando                | Resultado                                                     |
| ---------------------- | ------------------------------------------------------------- |
| `npm ci`               | PASS — 285 paquetes instalados, 0 vulnerabilidades reportadas |
| `npm run typecheck`    | PASS                                                          |
| `npm run lint`         | PASS                                                          |
| `npm run test:run`     | PASS — 42 pruebas en 3 archivos                               |
| `npm run build`        | PASS — `dist/` generado                                       |
| `npm run format:check` | PASS                                                          |
| `npm run test:e2e`     | PASS — 2 pruebas Chromium                                     |

El build emite una advertencia de tamaño de bundle: el JavaScript principal es 727,62 kB sin comprimir (214,28 kB gzip), debido principalmente a las dependencias de gráficas. No bloquea M03; revisar división por rutas o carga diferida antes de una optimización final de M09.

## Revisión visual

Las capturas en `docs/evidence/M03/` se revisaron en escritorio y móvil. Conservan la estética oscura, sidebar, acentos cian/violeta/verde/ámbar y jerarquía de tarjetas de la opción 1. Las diferencias intencionales son usar los valores correctos del motor, controles HTML semánticos y no representar la asíntota como una medición finita.

No se observaron errores de consola de la aplicación, solicitudes fallidas de assets ni desbordamiento horizontal durante la prueba E2E. Las capturas de viewport muestran 1440×900, 1280×720, 768×1024 y 390×844; los paneles se apilan en móvil.

## Criterios de aceptación

| Criterio                              | Estado |
| ------------------------------------- | ------ |
| Dashboard funcional                   | PASS   |
| Fidelidad razonable al mockup oficial | PASS   |
| Cuatro métricas dinámicas             | PASS   |
| Gráfica de respuesta desde el motor   | PASS   |
| Controles actualizan inmediatamente   | PASS   |
| Gráfica de derivadas funcional        | PASS   |
| Área de integración dinámica          | PASS   |
| Optimización correcta                 | PASS   |
| Reinicio funcional                    | PASS   |
| Sin fórmulas duplicadas en vistas     | PASS   |
| Sin métricas ficticias                | PASS   |
| Diseño adaptable                      | PASS   |
| Pruebas existentes y nuevas           | PASS   |
| Build de producción                   | PASS   |
| Capturas reales solicitadas           | PASS   |
| Sin commits, push ni despliegue       | PASS   |

## Riesgos y siguiente paso

Las funciones siguen siendo provisionales y requieren confirmación académica antes de alterar parámetros. La siguiente fase puede implementar la pantalla especializada de Límites (M04), reutilizando las series y resultados tipados ya disponibles. No se inició M04.
