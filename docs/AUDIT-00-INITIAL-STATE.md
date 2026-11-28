# AUDIT-00 — Estado inicial

Fecha de auditoría: 27 de noviembre de 2026 (America/Costa_Rica).

## Repositorio y Git

- Directorio de trabajo: raíz del repositorio.
- No había archivos de proyecto versionados ni no versionados antes de crear la documentación M00.
- Rama local: `main`; Git informa `No commits yet`.
- Remoto configurado: `origin` → `https://github.com/La-Gallada/ServerLab-Calculus-Simulator.git`.
- Seguimiento configurado: `main` → `origin/main`; el estado local lo reporta como `[gone]` (la referencia remota no está disponible en la clonación local).
- No se creó rama, commit, push, despliegue ni se modificó el remoto.

## Fuentes revisadas

1. `<Descargas>/ServerLab_Asset_Pack_v1.zip`, incluido su `README.md` completo.
2. `references/mockup-option-01.png`, inspeccionado visualmente.
3. `<Descargas>/Avance del Proyecto de Investigacion grupo #4.pdf`, 10 páginas, inspeccionado visualmente. Confirma el carácter hipotético, las variables `n`, `R`, `T`, `t`, `C` y que las funciones numéricas se definirían posteriormente.

El documento colaborativo de Google Docs no fue revisado: no hay una conexión autorizada de Google Docs disponible en esta sesión. Por tanto, no se atribuye contenido de sus apartados 8 o 13.

## Inventario del paquete gráfico

El paquete ZIP contiene 12 entradas: 10 PNG en `assets/`, un mockup y README. No se copió ningún asset al producto durante M00.

| Grupo      |                                                                                                       Archivos | Dimensiones y transparencia             |
| ---------- | -------------------------------------------------------------------------------------------------------------: | --------------------------------------- |
| Branding   |                                                           `serverlab-logo-full.png`, `serverlab-logo-mark.png` | 1254×1254, RGBA, transparencia presente |
| Botones    |                       `button-start-simulation.png`, `button-reset-simulation.png`, `button-about-project.png` | 2172×724, RGBA, transparencia presente  |
| Navegación | `icon-dashboard.png`, `icon-limits.png`, `icon-derivatives.png`, `icon-integrals.png`, `icon-optimization.png` | 1254×1254, RGBA, transparencia presente |
| Referencia |                                                                                         `mockup-option-01.png` | 1536×1024, RGB, sin transparencia       |

Organización recomendada por el README del paquete: en M01 copiar `assets/` a `public/assets/` y mantener `references/` fuera del sitio publicado. Los PNG de botones son referencia estética; los controles deben ser botones HTML accesibles.

## Hallazgos visuales

El mockup de opción 1 establece correctamente la dirección visual: barra lateral oscura, cabecera de estado, tarjetas, paneles con borde suave, cian/violeta/verde/ámbar y gráficas predominantes. Se adopta sólo como referencia de composición.

Inconsistencias que no deben copiarse:

- Para `n=65`, muestra 433.3 ms; el modelo vigente da 471.4286 ms.
- Para `n=65`, muestra 28.89 ms/usuario; el modelo vigente da 16.3265 ms/usuario.
- Para 30 s, muestra 247.5 MB; la integral vigente da 240 MB.
- La curva se presenta con un valor finito en 100 usuarios; el modelo no está definido allí y exige una asíntota vertical.

## Riesgos iniciales

- Las fórmulas siguen siendo provisionales; se requiere confirmación grupal antes de tratar resultados como definitivos.
- Las imágenes no incluyen logo institucional oficial, según el README del paquete.
- La referencia remota de Git está ausente localmente; validar acceso/sincronización antes de M01, sin hacer push.
- Debe decidirse el mecanismo técnico de PNG de alta resolución compatible con SVG/DOM de Recharts y el navegador objetivo.
