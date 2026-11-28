# Checklist de publicación

Versión candidata: `1.0.0-rc.1`. No hay etiquetas ni releases creados.

| Estado                       | Significado                                                   |
| ---------------------------- | ------------------------------------------------------------- |
| Aplicación funcional         | Pasa las validaciones locales                                 |
| Candidato de producción      | Además, publicado y verificado según «Después del push»       |
| Modelo provisional           | Pendiente de confirmación del grupo                           |
| Entrega académica definitiva | Modelo confirmado, figuras regeneradas y requisitos cumplidos |

## Antes del push

- [ ] `git status` limpio y commit de M10 presente (`git log -1`).
- [ ] `npm ci`, `typecheck`, `lint`, `format:check`, `test:run`, `build`, `test:e2e`, `npm audit`.
- [ ] Dependencias exactas y `package-lock.json` sin cambios pendientes.
- [ ] Revisar [PRE-PUSH-REVIEW.md](PRE-PUSH-REVIEW.md) (privacidad, derechos y transparencia).
- [ ] `dist` contiene `_headers`, iconos y `og-image.png`; no contiene `docs/` ni `references/`.
- [ ] Cloudflare: preset **React (Vite)** o ninguno, comando `npm run build`, salida `dist`, rama `main`.
- [ ] Recomendado: publicar primero en una rama para tener vista previa.

## Después del push

- [ ] Compilación correcta en Cloudflare.
- [ ] El commit desplegado es el esperado; el pie muestra `v1.0.0-rc.1`.
- [ ] HTTPS funciona.
- [ ] Dashboard y las rutas `limites`, `derivadas`, `integrales`, `optimizacion`, `exportaciones`, `acerca`.
- [ ] Icono visible en la pestaña real.
- [ ] Descargas PNG, SVG, CSV y ZIP.
- [ ] Consola sin errores ni bloqueos «Content Security Policy».
- [ ] Teléfono real: menú, laboratorios y una descarga.
- [ ] Encabezados efectivos:

```powershell
curl.exe -sI https://serverlab-calculus-simulator.pages.dev/
```

Deben aparecer `content-security-policy`, `x-frame-options: DENY`, `permissions-policy`, `x-content-type-options` y `referrer-policy`.

- [ ] Vista previa social al compartir el enlace (los servicios guardan caché; las rutas con `#` no son páginas distintas para ellos).

Si la política bloquea algo (por ejemplo, una función de Cloudflare que inyecte scripts, como Web Analytics o Rocket Loader), desactivar esa función o retirar sólo la línea `Content-Security-Policy` de `public/_headers` en un commit nuevo.

## Antes de la entrega universitaria

- [ ] El grupo confirma el modelo.
- [ ] Funciones del documento y de ServerLab coinciden.
- [ ] Figuras regeneradas si cambió algo ([MODEL-UPDATE-GUIDE.md](MODEL-UPDATE-GUIDE.md)).
- [ ] Selección final de representaciones, con numeración y notas.
- [ ] Enlace y código QR incluidos y probados con un teléfono.
- [ ] Requisitos académicos y declaración de herramientas verificados.
- [ ] Ensayo de la exposición, incluido el plan sin conexión.

## Plan de recuperación

### Identificar versiones

```powershell
git log --oneline
```

| Commit    | Contenido                                      |
| --------- | ---------------------------------------------- |
| `5e41c7f` | M00–M07                                        |
| `d1ef124` | Política de versionado                         |
| `fda80eb` | M08, exportaciones (primera versión publicada) |
| `f644acf` | M09, auditoría (publicado al iniciar M10)      |
| M10       | `git log -1 --grep "(M10)" --format=%h`        |

### Revisar una versión anterior sin alterar la actual

```powershell
git worktree add ../serverlab-revision f644acf
```

En esa carpeta: `npm ci` y `npm run build`.

### Volver atrás en la rama publicada

Crear un commit que deshaga el defectuoso, probarlo y que el propietario lo publique:

```powershell
git revert <hash>
```

No usar `reset --hard`, `push --force` ni reescribir el historial.

### Cloudflare

En el panel, la lista de despliegues del proyecto permite restaurar uno anterior que haya sido correcto, si la opción está disponible. Es inmediato y no modifica Git; el siguiente push volverá a desplegar `main`.

### Compilación fallida

1. Leer el registro y localizar el primer error.
2. Comando ejecutado: si aparece `next build`, el preset es incorrecto (ocurrió en el primer intento); usar `npm run build` y salida `dist`.
3. Versión de Node en el registro: debe cumplir `^22.22.2`, `^24.15.0` o `>=26`.
4. Error de `npm ci`: `package.json` y el lockfile no coinciden.
5. Reproducir en local desde una copia limpia con los mismos comandos.
