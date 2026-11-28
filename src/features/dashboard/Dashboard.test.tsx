import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { HashRouter } from 'react-router';
import { SimulationProvider } from '../../state/simulation';
import { Dashboard } from './Dashboard';

function renderDashboard() {
  return render(
    <HashRouter>
      <SimulationProvider>
        <Dashboard />
      </SimulationProvider>
    </HashRouter>,
  );
}

it('muestra las métricas iniciales calculadas por el motor', () => {
  renderDashboard();
  expect(screen.getByText('471,43 ms')).toBeInTheDocument();
  expect(screen.getByText('16,33 ms/usuario')).toBeInTheDocument();
  expect(screen.getAllByText('240 MB')).toHaveLength(2);
  expect(screen.getByText('66 usuarios')).toBeInTheDocument();
});

it('actualiza usuarios, umbral, transferencia y permite reiniciar', () => {
  renderDashboard();
  fireEvent.change(screen.getByRole('slider', { name: 'Usuarios concurrentes' }), {
    target: { value: '67' },
  });
  expect(screen.getAllByText('Umbral excedido')).toHaveLength(2);
  fireEvent.click(screen.getByRole('button', { name: '300 ms' }));
  expect(screen.getByText('50 usuarios')).toBeInTheDocument();
  fireEvent.change(screen.getByRole('slider', { name: 'Duración de transferencia' }), {
    target: { value: '10' },
  });
  expect(screen.getAllByText('60 MB')).toHaveLength(2);
  fireEvent.click(screen.getByRole('button', { name: 'Reiniciar' }));
  expect(screen.getByRole('slider', { name: 'Usuarios concurrentes' })).toHaveValue('65');
  expect(screen.getByRole('slider', { name: 'Duración de transferencia' })).toHaveValue('30');
  expect(screen.getByRole('button', { name: '500 ms' })).toHaveClass('selected');
  expect(screen.getAllByText('Dentro del objetivo')).toHaveLength(2);
});

it('mantiene métricas finitas cerca de la capacidad y enlaza módulos especializados', () => {
  renderDashboard();
  fireEvent.change(screen.getByRole('slider', { name: 'Usuarios concurrentes' }), {
    target: { value: '99' },
  });
  expect(document.body).not.toHaveTextContent('Infinity');
  expect(document.body).not.toHaveTextContent('NaN');
  expect(screen.getByRole('link', { name: 'Ver Derivadas' })).toHaveAttribute(
    'href',
    '#/derivadas',
  );
  expect(screen.getByRole('link', { name: 'Ver Integrales' })).toHaveAttribute(
    'href',
    '#/integrales',
  );
  expect(screen.getByRole('link', { name: 'Ver Optimización' })).toHaveAttribute(
    'href',
    '#/optimizacion',
  );
});
