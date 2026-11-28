# Dependencias de M01

Las versiones exactas están bloqueadas en `package-lock.json`; se solicitaron las etiquetas estables `latest` y npm resolvió un árbol compatible con Node 24.19.0. No se usaron canales alpha, beta, canary ni experimentales.

| Dependencia                         | Uso                                                                                                            |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| React y React DOM                   | interfaz declarativa                                                                                           |
| Vite y plugin React                 | desarrollo y build estático                                                                                    |
| TypeScript                          | verificación estricta de tipos                                                                                 |
| Tailwind CSS y plugin Vite          | base de utilidades disponible; los tokens iniciales se expresan en CSS para conservar una fuente única y clara |
| React Router                        | HashRouter y rutas estáticas                                                                                   |
| Recharts                            | reservado para gráficas dinámicas posteriores                                                                  |
| Lucide React                        | iconografía complementaria accesible                                                                           |
| KaTeX                               | reservado para fórmulas de los módulos matemáticos                                                             |
| Vitest, Testing Library y jsdom     | pruebas unitarias de UI y comportamiento                                                                       |
| Playwright                          | flujo E2E y capturas de evidencia                                                                              |
| ESLint, typescript-eslint, Prettier | calidad, estilo y consistencia                                                                                 |

Las dependencias reservadas se instalaron en M01 para validar compatibilidad del stack, pero no se usan para simular cálculos ni dibujar gráficas antes de los hitos autorizados.
