# Roadmap y criterios de aceptación

| Hito | Resultado                     | Criterios verificables                                                                                                                                                   |
| ---- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| M00  | Contexto y auditoría          | Los siete documentos existen; assets, PDF, mockup, Git y modelo están auditados; no hay stack ni componentes.                                                            |
| M01  | Inicialización y arquitectura | Completado y validado en M01.1: base, shell, rutas, build, calidad, E2E Chromium y evidencia responsive.                                                                 |
| M02  | Motor y pruebas               | Completado: configuración inmutable, motor puro, muestreo, formateadores y 39 pruebas aprobadas.                                                                         |
| M03  | Dashboard                     | Completado: controles accesibles actualizan tarjetas, gráficas R(n), R′(n) y T(t), umbral, máximo y acumulado; no usa cifras del mockup.                                 |
| M04  | Límites                       | Completado: laboratorio con KaTeX, límites laterales, tabla y curvas continuas, asíntota y explicación; jamás evalúa 100 como valor finito.                              |
| M05  | Derivadas                     | Completado: R, R′, R″, recta tangente, incremento discreto, tabla y procedimientos KaTeX.                                                                                |
| M06  | Integrales                    | Completado: selecciona `[a,b]`, sombrea el área, calcula D(a,b), distingue MB/s de MB, muestra A(t) y desarrolla dos ejemplos.                                           |
| M07  | Optimización                  | Completado: resuelve la desigualdad, muestra regiones, intersección y máximo entero, trata L<100, L=100 y m=99, y compara con la carga actual.                           |
| M08  | Exportación                   | Completado: 15 figuras en PNG, SVG y CSV con ficha académica, dos temas, centro de exportaciones, botones en los laboratorios y paquete ZIP opcional.                    |
| M09  | Auditoría                     | Completado: auditoría con hallazgos clasificados, optimizador corregido, carga diferida, accesibilidad, reproducibilidad, iconos y revisiones de seguridad y privacidad. |
| M10  | Cierre técnico                | README técnico, guía de ejecución/despliegue estático y evidencia de validación; sin despliegue ni push sin autorización.                                                |

Secuencia obligatoria: no iniciar un hito hasta cumplir el criterio del anterior, salvo autorización explícita del usuario.

Publicación: M08 es la primera versión publicada (GitHub público y Cloudflare Pages), anterior a la auditoría M09.

Versionado: M00–M07 quedaron consolidados en un commit; desde M08 cada hito termina con su propio commit local tras un veredicto GO. Push, merge y despliegue requieren autorización (ver `AGENTS.md`).
