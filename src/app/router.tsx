import { Suspense } from 'react';
import { Route, Routes, useLocation } from 'react-router';
import { NotFound } from '../components/ui/NotFound';
import { Dashboard } from '../features/dashboard/Dashboard';
import { RouteBoundary } from './RouteBoundary';
import { deferredRoutes } from './routes';

const loading = (
  <p className="route-loading" role="status">
    Cargando la sección…
  </p>
);

export function AppRouter() {
  const { pathname } = useLocation();
  return (
    // La clave reinicia el estado de error al cambiar de ruta.
    <RouteBoundary key={pathname}>
      <Suspense fallback={loading}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          {deferredRoutes.map(({ path, Route: Screen }) => (
            <Route key={path} path={path} element={<Screen />} />
          ))}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </RouteBoundary>
  );
}
