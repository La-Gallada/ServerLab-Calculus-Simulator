# Revisión previa al próximo push

**Fecha:** 27 de noviembre de 2026.

## Estado publicado

- El propietario publicó `main` en `fda80eb`. El repositorio de GitHub es **público**; sin licencia y sin bifurcaciones al revisarlo.
- Sitio: <https://serverlab-calculus-simulator.pages.dev/#/>. Al revisarlo servía los mismos archivos que la compilación de `fda80eb` (`index-CJi71Ogf.js`).
- No se observaron comprobaciones ni despliegues de Cloudflare en GitHub, así que no se verificó cómo está conectado. Si usa despliegue automático, **un push a `main` actualizará el sitio público**.
- Rutas como `/docs/…` o `/references/…` responden el `index.html`: esos archivos no se publican en el sitio.
- No se modificó el remoto ni la configuración de Cloudflare.

## Historial local y publicado

Se revisaron todos los commits: sin credenciales, tokens, claves privadas, archivos `.env`, rutas del equipo, PDF, documentos de terceros ni archivos temporales. Los PNG de evidencia no tienen metadatos. Los correos presentes en metadatos de imágenes pertenecen a la entidad de certificación (`trufo.ai`).

| ID   | Severidad | Hallazgo (ya publicado)                                                                                                                      | Estado                |
| ---- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| PR-1 | Media     | Los commits registran el correo personal configurado en Git                                                                                  | PENDING (propietario) |
| PR-2 | Baja      | `docs/SDD-00-PROJECT-CONTEXT.md` y la autoría de Git identifican al responsable por su nombre completo                                       | PENDING (propietario) |
| PR-3 | Media     | `references/mockup-option-01.png` muestra el logotipo de la Universidad Latina; no consta autorización para distribuirlo                     | PENDING (propietario) |
| PR-4 | Baja      | No hay licencia: el contenido es público sin condiciones de reutilización explícitas                                                         | PENDING (propietario) |
| PR-5 | Baja      | Los recursos gráficos incluyen manifiestos C2PA que indican generación con IA (ChatGPT, `gpt-image`). Conviene revisar la política del curso | PENDING (propietario) |
| PR-6 | —         | Las rutas locales de `AUDIT-00` se retiraron antes del primer commit                                                                         | RESOLVED              |

Opciones, ninguna ejecutada: usar el correo `noreply` de GitHub en commits futuros; sustituir el mockup en un commit nuevo (seguiría en el historial); pasar el repositorio a privado (no revierte copias ya hechas); reescribir el historial, sólo con autorización expresa.

## Contenido del commit de M09

Código, pruebas, documentación, iconos derivados del isotipo y capturas de `docs/evidence/M09/`. Sin secretos ni rutas personales.

## Veredicto

**Sin bloqueo técnico ni de secretos para un próximo push.** Ningún hallazgo exige reescribir el historial; PR-1 a PR-5 son decisiones del propietario, sobre contenido ya público.

Antes de publicar:

1. M09 añade `.node-version` (24.19.0): Cloudflare usará esa versión en lugar de su predeterminada (22.23.4 según su documentación). No pudo probarse en Cloudflare.
2. Si es posible, publicar primero en una rama para obtener una vista previa (requiere autorización).
3. Tras publicar: comprobar carga, laboratorios, una descarga y el icono de la pestaña. Una pestaña abierta con la versión anterior puede pedir recargar.
