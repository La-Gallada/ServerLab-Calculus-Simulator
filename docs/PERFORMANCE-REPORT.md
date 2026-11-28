# Rendimiento: M08 frente a M09

## Método

Dos compilaciones (`fda80eb` y M09) servidas por el mismo servidor estático local con gzip nivel 9, en Chromium de Playwright, el mismo equipo y la misma sesión. «Transferido» es gzip para HTML, JS y CSS y tamaño real para imágenes y fuentes. Tiempos: mediana de 7 cargas con CPU ×4, 150 ms de latencia y 1,6 Mbps. Son comparaciones de laboratorio, no mediciones de usuarios ni de Cloudflare.

## Carga inicial del Dashboard

| Recurso             | M08 sin comprimir | M09 sin comprimir | M08 transferido | M09 transferido | Cambio transferido |
| ------------------- | ----------------: | ----------------: | --------------: | --------------: | -----------------: |
| JavaScript          |         1 079 861 |           733 705 |         312 690 |         214 364 |        **−31,4 %** |
| CSS                 |            77 415 |            48 517 |          17 367 |           9 616 |            −44,6 % |
| Imágenes (logotipo) |         1 082 993 |            39 184 |       1 082 993 |          39 184 |            −96,4 % |
| Fuentes             |                 0 |                 0 |               0 |               0 |                  — |
| Total (con HTML)    |         2 240 843 |           822 864 |       1 413 412 |         263 735 |        **−81,3 %** |
| Solicitudes         |                 4 |                 4 |                 |                 |                    |

Bytes. El navegador de pruebas no solicita el favicon; un navegador real descargará además un icono. Según Vite, el JavaScript inicial pasa de 316,30 a 217,01 kB gzip. El objetivo orientativo de 20–35 % en JavaScript se alcanzó.

| Tiempo con red y CPU limitadas        |      M08 |      M09 |
| ------------------------------------- | -------: | -------: |
| Gráfica principal dibujada            | 3 140 ms | 2 547 ms |
| Todas las imágenes de la vista listas | 8 005 ms | 2 585 ms |

## Recursos al visitar otras rutas

En orden de visita, sólo lo no descargado antes (transferido, bytes).

| Ruta          | M08 solicitudes / bytes | M09 solicitudes / bytes |
| ------------- | ----------------------- | ----------------------- |
| Límites       | 2 / 42 712              | 8 / 131 736             |
| Derivadas     | 0 / 0                   | 2 / 4 001               |
| Integrales    | 2 / 10 676              | 8 / 20 823              |
| Optimización  | 1 / 28 076              | 4 / 41 285              |
| Exportaciones | 2 / 19 219              | 3 / 19 370              |
| Acerca de     | 0 / 0                   | 1 / 1 519               |

La primera pantalla con fórmulas descarga KaTeX, su hoja de estilos y fuentes. Es el compromiso principal: la navegación inicial a un laboratorio requiere solicitudes que antes ya estaban cargadas.

## Compilación completa

| Métrica                     |                 M08 |                  M09 |
| --------------------------- | ------------------: | -------------------: |
| JavaScript total            | 1 135 592 (4 arch.) | 1 142 900 (22 arch.) |
| JavaScript total gzip       |             332 517 |              344 370 |
| CSS total / gzip            |     77 415 / 17 367 |      78 319 / 17 487 |
| Fuentes (59, sin cambios)   |           1 072 948 |            1 072 948 |
| Imágenes en `dist`          |           9 861 526 |           10 220 832 |
| `dist` total                |          12 148 055 |           12 524 808 |
| Aviso de fragmento > 500 kB |                  sí |                   sí |

Fragmentos de M09 (Vite, gzip): principal 217,01 kB; KaTeX con `Formula` 77,73; `ExportPanel` 15,65; Optimización 10,24; Integrales 6,17; Derivadas 3,83; Límites 3,80; `ExportCenter` 3,32; Acerca de 1,52; el resto son módulos compartidos menores de 2,3 kB. Estilos: 9,66 kB iniciales y 7,97 kB diferidos.

`dist` crece por los iconos y el logotipo derivado; unos 9,8 MB son copias originales no referenciadas.

## Interacción y exportación

| Medida                                  | M08              | M09              |
| --------------------------------------- | ---------------- | ---------------- |
| Deslizador del Dashboard, mediana / p95 | 16 / 22 ms       | 16 / 25 ms       |
| Deslizador de Integrales                | 20 / 25 ms       | 21 / 24 ms       |
| Deslizador del umbral                   | 49 / 54 ms       | 49 / 56 ms       |
| PNG 3600 × 2400, mediana de 12          | 195 ms           | 200 ms           |
| Paquete ZIP, tres veces                 | 558, 535, 483 ms | 560, 499, 498 ms |
| Memoria JS tras exportaciones repetidas | 11,1 → 11,8 MB   | 11,6 → 12,2 MB   |

Las diferencias de interacción están dentro de la variación entre ejecuciones; no se afirma mejora ni empeoramiento. No se añadió memoización. La memoria medida (montículo de JavaScript tras recolección) no incluye memoria gráfica; una prueba confirma que no quedan Object URLs abiertas.

## Repositorio

`.git` 44 MB; `docs/evidence` 36 MB; `assets` 9,5 MB; `public` 9,8 MB; `references` 1,6 MB; código y pruebas menos de 1 MB. Nada de `docs/`, `references/` ni evidencias llega a `dist`: un visitante no lo recibe.
