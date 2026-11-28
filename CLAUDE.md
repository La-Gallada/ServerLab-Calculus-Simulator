# ServerLab — guía para Claude

- Leer [AGENTS.md](AGENTS.md) antes de trabajar: contiene las reglas permanentes del proyecto y es la referencia común para todos los agentes.
- Consultar la documentación técnica en `docs/` (arquitectura, diseño, modelo matemático, decisiones, roadmap e informes por hito).
- Implementar únicamente el hito autorizado de `docs/ROADMAP.md`.
- El motor de `src/math/` y la configuración de `src/config/model.ts` son la única fuente de verdad matemática.
- Versionado según la sección «Control de versiones» de AGENTS.md: commit local al cerrar cada milestone autorizado; push, merge y despliegue requieren autorización; sin operaciones destructivas de Git.
- Mantener la compatibilidad con otros agentes: no duplicar ni contradecir aquí las reglas de AGENTS.md.
