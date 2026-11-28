import { Route, Routes } from 'react-router';
import { SectionPlaceholder } from '../components/ui/SectionPlaceholder';
import { pages } from '../config/pages';
import { Dashboard } from '../features/dashboard/Dashboard';
import { LimitsLab } from '../features/limits/LimitsLab';
import { DerivativesLab } from '../features/derivatives/DerivativesLab';
import { IntegralsLab } from '../features/integrals/IntegralsLab';
import { OptimizationLab } from '../features/optimization/OptimizationLab';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/limites" element={<LimitsLab />} />
      <Route path="/derivadas" element={<DerivativesLab />} />
      <Route path="/integrales" element={<IntegralsLab />} />
      <Route path="/optimizacion" element={<OptimizationLab />} />
      {pages.map((page) =>
        ['/', '/limites', '/derivadas', '/integrales', '/optimizacion'].includes(
          page.path,
        ) ? null : (
          <Route key={page.path} path={page.path} element={<SectionPlaceholder page={page} />} />
        ),
      )}
      <Route path="*" element={<SectionPlaceholder variant="not-found" />} />
    </Routes>
  );
}
