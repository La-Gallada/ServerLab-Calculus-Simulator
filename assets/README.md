# ServerLab — Asset pack v1

## Objetivo para Codex
Implementar localmente una aplicación web educativa de Cálculo I siguiendo el mockup de la opción 1. Interfaz en español, tema oscuro, navegación lateral, tarjetas de métricas, gráficas y controles interactivos. Los PNG son recursos originales generados por separado, no recortes del mockup.

## Inventario
| Archivo | Resolución | Modo |
|---|---|---|
| `assets/branding/serverlab-logo-full.png` | 1254 × 1254 | RGBA |
| `assets/branding/serverlab-logo-mark.png` | 1254 × 1254 | RGBA |
| `assets/buttons/button-start-simulation.png` | 2172 × 724 | RGBA |
| `assets/buttons/button-reset-simulation.png` | 2172 × 724 | RGBA |
| `assets/buttons/button-about-project.png` | 2172 × 724 | RGBA |
| `assets/icons/icon-dashboard.png` | 1254 × 1254 | RGBA |
| `assets/icons/icon-limits.png` | 1254 × 1254 | RGBA |
| `assets/icons/icon-derivatives.png` | 1254 × 1254 | RGBA |
| `assets/icons/icon-integrals.png` | 1254 × 1254 | RGBA |
| `assets/icons/icon-optimization.png` | 1254 × 1254 | RGBA |
| `references/mockup-option-01.png` | 1536 × 1024 | RGB |

## Implementación recomendada
- React + TypeScript + Vite; Tailwind CSS, Recharts y Lucide Icons.
- Copiar `assets/` a `public/assets/` y mantener `references/` fuera del sitio publicado.
- Usar logo completo en la barra lateral y marca compacta para navegación reducida. Mantener proporciones con `object-fit: contain`.
- Los PNG de botones son referencias visuales o recursos decorativos; preferir botones HTML reales con texto accesible, estados hover/focus/disabled y estilos CSS equivalentes. No usar imágenes como únicos controles.
- Usar iconos PNG donde sean legibles; completar iconos faltantes (usuarios, reloj, base de datos, configuración, información, alertas) con Lucide. No extraerlos del mockup.
- Paleta sugerida: fondo #0B1220, panel #162134, cian #38BDF8, violeta #8B5CF6, verde #22C55E, ámbar #F59E0B, rojo #EF4444, texto #F1F5F9.
- Gráficas reales mediante código; no usar el mockup como fondo ni fijar sus cifras. Diseño responsive y navegación por teclado.

## Motor matemático provisional
Centralizar en `src/lib/math.ts` y validar entradas. Capacidad de referencia C=100; usuarios enteros 0–99. El modelo continuo se utiliza para análisis de cálculo.
- R(n) = 100 + 200n/(100−n), en ms.
- R'(n) = 20000/(100−n)^2, en ms/usuario.
- Límite por la izquierda en n=100: +infinito; nunca evaluar n=100.
- T(t) = 5 + 0.2t, en MB/s, 0 ≤ t ≤ 30.
- A(t) = 5t + 0.1t², en MB.
- Para umbral L ≥ 100 ms: máximo entero = floor(100*(L−100)/(L+100)); si L < 100 no existe solución admisible.
- Casos de prueba: R(60)=400; R'(60)=12.5; A(30)=240; máximo para L=500: 66; R(66)≈488.235 y R(67)≈506.061.
- Los números del mockup son ilustrativos y algunos son incorrectos. Calcular todos los indicadores en tiempo real. No confundir superar un umbral de latencia con alcanzar la asíntota.

## Pantallas y alcance
Dashboard, Límites, Derivadas, Integrales, Optimización, Acerca de. Controles compartidos de usuarios, duración y umbral; reinicio; exportación de gráficas si es viable. Las funciones son hipotéticas y pendientes de confirmación por el grupo. No presentar resultados como mediciones reales.

## Validación antes de entregar
Ejecutar npm install, npm run dev, pruebas del motor y npm run build. Verificar que no haya errores de consola, que los controles actualicen las gráficas y que no haya desbordamientos. No publicar ni crear repositorios sin autorización. El paquete contiene diez assets y un mockup de referencia, no una aplicación implementada. No incluye logotipo institucional oficial.
