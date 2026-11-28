# Despliegue previsto en Cloudflare Pages

El propietario realizará el despliegue; este documento no configura ni publica ningún servicio.

## Configuración

1. Crear un proyecto en Cloudflare Pages y conectar el repositorio oficial de GitHub.
2. Seleccionar la rama `main`.
3. Establecer el directorio raíz como la raíz del repositorio.
4. Usar `npm run build` como comando de compilación.
5. Usar `dist` como directorio de salida.
6. Confirmar que la versión de Node configurada sea al menos 20.19; se recomienda una versión LTS compatible.

## Verificación previa

Ejecutar localmente:

```bash
npm ci
npm run typecheck
npm run lint
npm run test:run
npm run build
npm run test:e2e
```

La aplicación usa HashRouter, por lo que las rutas de la interfaz se conservan tras una publicación estática sin reglas de reescritura adicionales. No se requiere Wrangler, backend, variables secretas ni servicios adicionales.
