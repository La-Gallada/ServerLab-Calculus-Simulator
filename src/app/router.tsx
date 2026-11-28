import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import { SectionPlaceholder } from '../components/ui/SectionPlaceholder';
import { pages } from '../config/pages';
import { Dashboard } from '../features/dashboard/Dashboard';
import { LimitsLab } from '../features/limits/LimitsLab';
import { DerivativesLab } from '../features/derivatives/DerivativesLab';
import { IntegralsLab } from '../features/integrals/IntegralsLab';
import { OptimizationLab } from '../features/optimization/OptimizationLab';

// El generador de figuras se carga sólo al visitar el centro o al exportar.
const ExportCenter = lazy(() =>
  import('../features/exports/ExportCenter').then((module) => ({ default: module.ExportCenter })),
);

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/limites" element={<LimitsLab />} />
      <Route path="/derivadas" element={<DerivativesLab />} />
      <Route path="/integrales" element={<IntegralsLab />} />
      <Route path="/optimizacion" element={<OptimizationLab />} />
      <Route
        path="/exportaciones"
        element={
          <Suspense fallback={<p role="status">Cargando el centro de exportaciones…</p>}>
            <ExportCenter />
          </Suspense>
        }
      />
      {pages.map((page) =>
        ['/', '/limites', '/derivadas', '/integrales', '/optimizacion', '/exportaciones'].includes(
          page.path,
        ) ? null : (
          <Route key={page.path} path={page.path} element={<SectionPlaceholder page={page} />} />
        ),
      )}
      <Route path="*" element={<SectionPlaceholder variant="not-found" />} />
    </Routes>
  );
}
