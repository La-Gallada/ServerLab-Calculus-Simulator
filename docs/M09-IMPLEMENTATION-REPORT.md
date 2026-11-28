# M09 — Auditoría integral, optimización y refinamiento

**Fecha:** 27 de noviembre de 2026  
**Estado:** completado; veredicto **GO** para M10 (requiere autorización explícita).

## Estado inicial

`main` en `fda80eb`, árbol limpio. Línea base medida antes de cambiar código: `typecheck` aprobado, 221 pruebas unitarias, JavaScript principal 316,30 kB gzip, CSS 17,51 kB, `npm audit` sin vulnerabilidades y 112 archivos de evidencia con hash.

## Contexto incorporado durante el milestone

1. Se confirmó que `main` ya estaba publicado y el repositorio es público: M08 es la primera versión publicada. El propietario informó el sitio en Cloudflare Pages.
2. Una revisión independiente aportó el defecto de precisión del optimizador (17 casos), reproducido aquí contra el motor.
3. El propietario pidió incorporar el favicon oficial.

## Cambios

- **Motor:** máximo entero por búsqueda binaria, frontera coherente y sin desbordamiento, umbral negativo inválido y concordancia «1 usuario».
- **Configuración:** `src/config/domain.ts` deriva capacidad, último usuario y duración; los ejemplos académicos fijos se conservan y declaran cuándo dejan de ser válidos.
- **Campos:** borrador común (`useDraftNumber`) y lectura regional (`parseDecimal`).
- **Carga:** seis pantallas diferidas, estado de carga, recuperación ante fallos y logotipo derivado.
- **Interfaz:** numeración, gráficas corregidas, «Acerca de», página 404, título y foco por ruta, menú móvil y enlace de salto.
- **Iconos:** `favicon.ico` (16, 32, 48), PNG de 16, 32, 180, 192 y 512 px, derivados de `assets/branding/serverlab-logo-mark.png`, sin modificar el original. Se recortó el margen transparente conservando proporción, color y transparencia.
- **Reproducibilidad:** versiones exactas, rango de Node real, `.node-version` y `.gitattributes`.
- **Dependencia nueva:** `@axe-core/playwright` 4.14.1, sólo de desarrollo (MPL-2.0), para auditar accesibilidad.

Modelo, coeficientes y dominios sin cambios.

## Cambios de comportamiento reflejados en pruebas previas

Los campos de Integrales aplican con Enter o al salir; el menú móvil cerrado queda oculto; cambiaron nombres accesibles de botones de tabla; un mensaje de formato es distinto; las pruebas que montan la aplicación precargan las rutas. No se eliminó cobertura.

## Validación

| Comprobación           | Resultado                                      |
| ---------------------- | ---------------------------------------------- |
| `npm ci`               | PASS — 287 paquetes; 0 vulnerabilidades        |
| `npm run typecheck`    | PASS                                           |
| `npm run lint`         | PASS                                           |
| `npm run format:check` | PASS                                           |
| `npm run test:run`     | PASS — 613 pruebas en 16 archivos (392 nuevas) |
| `npm run build`        | PASS, con el aviso de fragmento > 500 kB       |
| `npm run test:e2e`     | PASS — 22 pruebas en Chromium 159 (10 nuevas)  |
| Microsoft Edge 158     | PASS — las 22 pruebas                          |
| Firefox y WebKit       | No ejecutados                                  |
| `npm audit`            | 0 vulnerabilidades                             |
| Compilación repetida   | Archivos JS y CSS idénticos                    |

La mayoría de las pruebas unitarias nuevas son casos parametrizados de frontera y de lectura de números. Las pruebas comprueban consola, solicitudes fallidas y externas, desbordamiento en cinco tamaños, fuentes, assets y las exportaciones reales.

## Evidencias

`docs/evidence/M09/` con capturas y la vista simulada de pestañas. Los 112 archivos previos conservan su hash; una ejecución sin `EVIDENCE` no modificó M09.

## Informes

[AUDIT-FINAL.md](AUDIT-FINAL.md) · [PERFORMANCE-REPORT.md](PERFORMANCE-REPORT.md) · [PRE-PUSH-REVIEW.md](PRE-PUSH-REVIEW.md)

## Riesgos y limitaciones

- No verificado en Cloudflare con Node 24.19.0 ni la pestaña real del navegador.
- Firefox, WebKit, lector de pantalla, dispositivos físicos y editores de documentos sin probar.
- Fragmento principal grande; copias PNG no usadas en `dist`; sin CSP.
- Decisiones de privacidad pendientes sobre contenido ya público.
- Modelo provisional, pendiente de confirmación.

## Recomendaciones para M10

1. Publicar en una vista previa antes de `main` y verificar Node, iconos, caché y descargas.
2. Resolver las decisiones PR-1 a PR-5.
3. Evaluar `public/_headers`, primero en modo de sólo informe. Propuesta sin probar:

```text
/*
  X-Frame-Options: DENY
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Content-Security-Policy-Report-Only: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'
```

Debe probarse con Recharts, KaTeX, fuentes, vista previa `data:` y exportación con Blob y Canvas. Una caché `immutable` sólo es apropiada para archivos con hash; `/assets/branding/` no lo tiene.

4. Autorizar la instalación de Firefox y WebKit de Playwright.
5. Decidir si se retiran de `public/` los PNG no referenciados.
6. Confirmar el modelo matemático y la declaración de apoyo de IA que exija el curso.

## Criterios de aceptación

| Criterio                                         | Estado                                 |
| ------------------------------------------------ | -------------------------------------- |
| Funcionalidades existentes operativas            | PASS                                   |
| Sin regresiones matemáticas                      | PASS                                   |
| Hallazgos críticos y altos resueltos             | PASS                                   |
| Campos numéricos corregidos                      | PASS                                   |
| Numeración coherente                             | PASS                                   |
| Parámetros del modelo centralizados              | PASS                                   |
| Dependencias reproducibles                       | PASS                                   |
| Finales de línea coherentes                      | PASS                                   |
| Carga inicial optimizada                         | PASS                                   |
| Todas las rutas funcionales                      | PASS                                   |
| «Acerca de» completa                             | PASS                                   |
| Exportaciones funcionales                        | PASS                                   |
| Interfaz adaptable                               | PASS                                   |
| Accesibilidad auditada (con el alcance indicado) | PASS                                   |
| Seguridad auditada                               | PASS                                   |
| Privacidad previa al push revisada               | PASS                                   |
| Sin secretos conocidos                           | PASS                                   |
| Pruebas existentes y nuevas                      | PASS                                   |
| Build funcional                                  | PASS                                   |
| Evidencias históricas intactas                   | PASS                                   |
| Informes completos                               | PASS                                   |
| Favicon oficial incorporado y servido localmente | PASS                                   |
| Favicon visible en la pestaña publicada          | PENDING                                |
| Commit local de M09                              | PASS (es el que contiene este informe) |
| Sin push ni despliegue                           | PASS                                   |

## Git and Version Control

| Dato         | Valor                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------- |
| Hash         | Se obtiene con `git log -1 --grep "(M09)" --format=%H`; un commit no puede contener el suyo |
| Título       | `perf(serverlab): optimize performance and resolve audit findings (M09)`                    |
| Resumen      | Corrección del optimizador, carga diferida, iconos, interfaz, reproducibilidad y auditorías |
| Archivos     | 95                                                                                          |
| Rama         | `main`                                                                                      |
| Working tree | Limpio tras el commit                                                                       |
| Push         | No realizado por el agente; `origin/main` permanece en `fda80eb`                            |
| Despliegue   | Ninguno. Sin merge, cambios en Cloudflare ni operaciones destructivas                       |

No se inició M10.
