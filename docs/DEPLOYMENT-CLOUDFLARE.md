# Despliegue en Cloudflare Pages

El propietario publica y administra el servicio; este documento no configura ni publica nada.

Sitio: <https://serverlab-calculus-simulator.pages.dev/>. Integración directa con GitHub.

## Configuración

| Opción                                      | Valor                         |
| ------------------------------------------- | ----------------------------- |
| Framework                                   | React + Vite (**no** Next.js) |
| Rama de producción                          | `main`                        |
| Comando de compilación                      | `npm run build`               |
| Directorio de salida                        | `dist`                        |
| Directorio raíz                             | raíz del repositorio          |
| Backend, Workers, Pages Functions, Wrangler | ninguno                       |

### Antecedente

El primer despliegue falló porque el proyecto se configuró como Next.js y Cloudflare ejecutó `npx next build`. Se corrigió el preset, el comando y la salida, y el sitio quedó publicado (informado por el propietario).

## Node.js

`.node-version` indica 24.19.0, versión verificada en local; `package.json` admite `^22.22.2`, `^24.15.0` o `>=26.0.0`. Según la documentación de Cloudflare, la compilación v3 respeta `.node-version` o `NODE_VERSION` y no lee `engines`.

Al iniciar M10 el sitio servía los mismos archivos que la compilación local de `f644acf`, que incluye `.node-version`: esa compilación tuvo éxito. No se consultó el registro, así que no se confirma qué versión usó.

## Encabezados

`public/_headers` se copia a `dist` y Cloudflare Pages lo interpreta; no se publica como archivo.

| Encabezado                                         | Efecto                                                                            |
| -------------------------------------------------- | --------------------------------------------------------------------------------- |
| `Content-Security-Policy`                          | Todo prohibido salvo recursos propios; sin scripts en línea ni `eval`             |
| `style-src 'unsafe-inline'`                        | Necesario para atributos de estilo de React, Recharts y KaTeX                     |
| `img-src data: blob:`                              | Vista previa SVG y conversión a PNG                                               |
| `X-Frame-Options: DENY` y `frame-ancestors 'none'` | Impide incrustar el sitio en marcos                                               |
| `X-Content-Type-Options`                           | `nosniff`                                                                         |
| `Referrer-Policy`                                  | `strict-origin-when-cross-origin`                                                 |
| `Permissions-Policy`                               | Desactiva cámara, micrófono, ubicación, sensores, pagos y USB; no el portapapeles |

`npm run test:e2e` sirve `dist` con `scripts/serve-dist.mjs`, que aplica estas reglas, y ejecuta toda la suite bajo ellas. No sustituye la comprobación en Cloudflare. **Los encabezados no están activos en producción hasta publicar M10 y verificarlos.**

Cloudflare añade por defecto `Access-Control-Allow-Origin: *` e informes NEL; no se modificaron. Si en el panel se activa una función que inyecte scripts, la política la bloqueará.

No se configuró caché inmutable: `/assets/branding/` no usa nombres con hash.

## Verificación

Ver [RELEASE-CHECKLIST.md](RELEASE-CHECKLIST.md). Un push a `main` actualiza el sitio público. Las rutas inexistentes del servidor devuelven `index.html`; la aplicación usa HashRouter.
