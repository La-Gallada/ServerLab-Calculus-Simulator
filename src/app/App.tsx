import { HashRouter } from 'react-router';
import { AppLayout } from '../components/layout/AppLayout';
import { SimulationProvider } from '../state/simulation';
import { AppRouter } from './router';

export function App() {
  return (
    <HashRouter>
      <SimulationProvider>
        <AppLayout>
          <AppRouter />
        </AppLayout>
      </SimulationProvider>
    </HashRouter>
  );
}
