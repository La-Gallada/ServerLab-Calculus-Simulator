import { lazyRoute } from './lazyRoute';

/*
 * El Dashboard se incluye en la carga inicial; las demás pantallas, y con ellas
 * KaTeX y el generador de figuras, se descargan al visitarlas.
 */
export const deferredRoutes = [
  {
    path: '/limites',
    ...lazyRoute(() => import('../features/limits/LimitsLab').then((m) => m.LimitsLab)),
  },
  {
    path: '/derivadas',
    ...lazyRoute(() =>
      import('../features/derivatives/DerivativesLab').then((m) => m.DerivativesLab),
    ),
  },
  {
    path: '/integrales',
    ...lazyRoute(() => import('../features/integrals/IntegralsLab').then((m) => m.IntegralsLab)),
  },
  {
    path: '/optimizacion',
    ...lazyRoute(() =>
      import('../features/optimization/OptimizationLab').then((m) => m.OptimizationLab),
    ),
  },
  {
    path: '/exportaciones',
    ...lazyRoute(() => import('../features/exports/ExportCenter').then((m) => m.ExportCenter)),
  },
  {
    path: '/acerca',
    ...lazyRoute(() => import('../features/about/About').then((m) => m.About)),
  },
];

export const preloadRoutes = () => Promise.all(deferredRoutes.map((route) => route.preload()));
