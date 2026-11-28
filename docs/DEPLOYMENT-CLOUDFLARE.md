# Despliegue en Cloudflare Pages

El propietario publica y administra el servicio; este documento no configura ni publica nada.

Sitio informado por el propietario: <https://serverlab-calculus-simulator.pages.dev/#/>.

## Configuración

1. Repositorio oficial de GitHub, rama `main`, directorio raíz.
2. Comando de compilación `npm run build`; salida `dist`.
3. Node: `.node-version` indica 24.19.0. Según la documentación de Cloudflare, el sistema de compilación v3 respeta ese archivo o la variable `NODE_VERSION`; no usa `engines`.

Con despliegue automático, un push a `main` actualiza el sitio público. Conviene revisar antes una vista previa.

## Verificación previa

```bash
npm ci
npm run typecheck
npm run lint
npm run format:check
npm run test:run
npm run build
npm run test:e2e
```

## Después de publicar

Comprobar el Dashboard, cada ruta, una descarga y el icono de la pestaña. Las rutas inexistentes del servidor devuelven `index.html`; la aplicación usa HashRouter y no necesita reglas de reescritura. No se requiere Wrangler, backend ni variables secretas. La propuesta de encabezados está en [M09-IMPLEMENTATION-REPORT.md](M09-IMPLEMENTATION-REPORT.md).
