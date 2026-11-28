# ServerLab — reglas permanentes para agentes

## Alcance y seguridad

- Este repositorio es la fuente oficial. Inspeccionar estado de Git antes de cambios relevantes.
- No hacer cambios de visibilidad, ramas remotas ni modificaciones al documento académico sin autorización explícita.
- No eliminar recursos gráficos originales ni sobrescribir el README del asset pack sin conservar una copia.
- No instalar dependencias, inicializar stack o implementar fuera del hito autorizado.

## Control de versiones

| Operación                                                                                                         | Estado                |
| ----------------------------------------------------------------------------------------------------------------- | --------------------- |
| Commits locales al finalizar milestones                                                                           | AUTORIZADOS           |
| Push al repositorio remoto                                                                                        | REQUIERE AUTORIZACIÓN |
| Merge                                                                                                             | REQUIERE AUTORIZACIÓN |
| Despliegue                                                                                                        | REQUIERE AUTORIZACIÓN |
| Operaciones destructivas de Git (reset --hard, clean, rebase o amend de historial, force push, descartar cambios) | NO AUTORIZADAS        |

- Cada milestone termina con un commit local independiente, sólo después de: completar la implementación, ejecutar las validaciones obligatorias, corregir errores bloqueantes, generar evidencias, actualizar documentación, obtener veredicto GO y revisar los archivos preparados.
- Usar Conventional Commits en inglés, con el identificador del milestone, funcionalidades, decisiones, correcciones, documentación, resultados reales de pruebas y limitaciones. Sin mensajes genéricos. Documentación académica e interfaz en español.
- Previstos: `feat(exports): implement academic figure export system (M08)`, `perf(serverlab): optimize performance and resolve audit findings (M09)`, `chore(release): prepare ServerLab for production deployment (M10)`. Adaptarlos al trabajo realmente realizado; en correcciones usar fix, perf, refactor, test, docs o chore.
- Antes de confirmar: verificar rama, remoto, identidad configurada (no inventarla), `.gitignore`, y que no haya secretos, archivos de entorno, cachés, resultados temporales ni rutas personales.
- Después de confirmar: comprobar hash, mensaje, archivos, working tree, rama, historial y remoto con comandos no destructivos.
- Si un milestone se interrumpe: conservar los archivos, documentar el estado parcial, no declararlo completado ni crear su commit. Un commit parcial de recuperación requiere autorización específica.
- Cada informe de milestone incluye la sección «Git and Version Control»: hash, título, resumen, número de archivos, rama, working tree, estado de push y confirmación de que no hubo despliegue.

## Rigor académico y matemático

- ServerLab es una simulación hipotética: nunca afirmar que son mediciones reales.
- El modelo vigente está en `docs/MATHEMATICAL-MODEL.md`; centralizar su implementación en un motor puro. No repetir fórmulas ni resultados codificados en componentes.
- Validar dominio: usuarios discretos 0–99; `n=100` está fuera de dominio y la extensión continua sólo se usa para análisis.
- Diferenciar derivada instantánea de incremento discreto, y tasa MB/s de cantidad acumulada MB.
- No añadir CPU/RAM ni otras métricas sin modelos aprobados. Tratar cualquier función nueva como provisional hasta confirmación del grupo.

## UI, activos y calidad

- Seguir el mockup de opción 1 como referencia visual, nunca como imagen de fondo ni fuente de valores.
- Mantener PNG de botones como referencia o decoración; implementar controles con HTML semántico, etiquetas y estados hover/focus-visible/active/disabled.
- Generar gráficas dinámicamente; incluir título, ejes, leyenda, unidades y alternativa textual. No trazar `n=100` como punto finito.
- Conservar tema oscuro en la app y fondo blanco en exportaciones académicas. No publicar `references/`.
- Antes de declarar completitud, ejecutar las verificaciones pertinentes (tests, lint, build y/o UI) y comunicar evidencia y limitaciones.

## Forma de trabajo

- Mantener cambios pequeños y documentados; preservar modificaciones no relacionadas del usuario.
- Actualizar `docs/DECISIONS.md` ante decisiones técnicas relevantes y `docs/MATHEMATICAL-MODEL.md` cuando el grupo confirme un modelo.
- Usar español en UI y documentación académica; mantener TypeScript estricto y dependencias compatibles.
