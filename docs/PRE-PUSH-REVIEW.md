# Revisión previa al próximo push

**Fecha:** 27 de noviembre de 2026 (actualizada en M10).

## Estado publicado

- `origin/main` y el sitio corresponden a `f644acf` (M09). Producción servía `index-6EYfUdMZ.js`, igual que la compilación local de ese commit.
- El repositorio de GitHub es **público** y no tiene licencia.
- Sitio: <https://serverlab-calculus-simulator.pages.dev/>. Un push a `main` puede actualizarlo.
- Producción envía hoy sólo `referrer-policy`, `x-content-type-options` y valores por defecto de Cloudflare; la política de M10 aún no está activa.
- No se modificaron el remoto ni la configuración de Cloudflare.

## 1. Seguridad técnica

Revisados el historial (al preparar M09) y los archivos de M09 y M10: sin credenciales, tokens, claves privadas, archivos `.env`, rutas del equipo, PDF ni documentos de terceros. M10 añade `public/_headers` y un servidor local de comprobación (`scripts/serve-dist.mjs`) que no se publica en el sitio.

## 2. Privacidad personal

| ID   | Hallazgo                                                                                                                      | Estado en M10                                                                                | Alternativas (decide el propietario)                                                              |
| ---- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| PR-1 | Todos los commits, incluido el de M10, registran el correo personal configurado en Git                                        | PENDING. No se cambió la identidad                                                           | Correo `noreply` de GitHub en commits futuros; reescribir historial sólo con autorización expresa |
| PR-2 | El nombre completo del propietario aparece en la autoría de Git y en versiones anteriores de `docs/SDD-00-PROJECT-CONTEXT.md` | Retirado de los archivos actuales, que identifican al **Grupo #4**. El historial lo conserva | Cambiar el nombre en commits futuros; el historial publicado no cambia sin reescritura            |
| PR-7 | La cuenta u organización de GitHub y el dominio del sitio son visibles                                                        | Sin cambios                                                                                  | Revisar la visibilidad del perfil                                                                 |

No se incorporaron nombres de otros integrantes.

## 3. Derechos de distribución

| ID   | Hallazgo                                                                                         | Archivos                          | Estado  | Alternativas                                                                                     |
| ---- | ------------------------------------------------------------------------------------------------ | --------------------------------- | ------- | ------------------------------------------------------------------------------------------------ |
| PR-3 | El mockup muestra el logotipo de la Universidad Latina; no consta autorización para distribuirlo | `references/mockup-option-01.png` | PENDING | Pedir autorización; retirarlo en un commit nuevo (seguiría en el historial); repositorio privado |
| PR-4 | No hay licencia: el contenido es público sin condiciones de reutilización explícitas             | repositorio                       | PENDING | Mantener sin licencia (derechos reservados) o elegir una con acuerdo del grupo                   |
| PR-8 | El push publicaría el paquete académico (figuras, CSV, fichas y QR)                              | `docs/academic-delivery/`         | PENDING | Publicarlo, o excluirlo antes del push y compartirlo por otro medio                              |

Las dependencias de producción declaran licencias MIT, ISC y BSD-3-Clause. M10 no incorporó el logotipo universitario a ningún recurso nuevo. La tarjeta social (`public/og-image.png`) se compone con el isotipo propio y texto.

## 4. Transparencia académica

| ID    | Hallazgo                                                                                                                                                                                              | Estado  |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| PR-5  | Los gráficos originales de `assets/` incluyen manifiestos C2PA que declaran generación con IA (ChatGPT, `gpt-image`)                                                                                  | PENDING |
| PR-9  | Los derivados publicados (logotipo WebP, iconos y tarjeta social) no llevan manifiesto C2PA. Al retirar en M10 las copias sin uso de `public/`, ningún archivo servido lo conserva; los originales sí | PENDING |
| PR-10 | El repositorio documenta apoyo de agentes de programación (`AGENTS.md`, `CLAUDE.md`, líneas `Co-Authored-By`)                                                                                         | PENDING |

La retirada de las copias fue por tamaño, no para ocultar su origen: no se eliminaron originales ni metadatos. Conviene confirmar la política del curso y declarar el uso de IA como corresponda.

## Resueltos

- PR-6: las rutas locales de `AUDIT-00` se retiraron antes del primer commit.

## Veredicto

**Sin bloqueo técnico ni de secretos.** Ningún hallazgo exige reescribir el historial. PR-1 a PR-5 y PR-7 a PR-10 son decisiones del propietario o del grupo, varias sobre contenido ya público; **PR-8 conviene decidirlo antes del push**.

Pasos de publicación y comprobación: [RELEASE-CHECKLIST.md](RELEASE-CHECKLIST.md).
