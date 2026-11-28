# ServerLab — reglas permanentes para agentes

## Alcance y seguridad

- Este repositorio es la fuente oficial. Inspeccionar estado de Git antes de cambios relevantes.
- No hacer commit, push, despliegue, cambios de visibilidad, ramas remotas ni modificaciones al documento académico sin autorización explícita.
- No eliminar recursos gráficos originales ni sobrescribir el README del asset pack sin conservar una copia.
- No instalar dependencias, inicializar stack o implementar fuera del hito autorizado.

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
