import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { HashRouter } from 'react-router';
import { SimulationProvider } from '../../state/simulation';
import { DerivativesLab } from './DerivativesLab';

function renderLab() {
  return render(
    <HashRouter>
      <SimulationProvider>
        <DerivativesLab />
      </SimulationProvider>
    </HashRouter>,
  );
}

it('inicializa el análisis desde la carga compartida sin modificarla', () => {
  renderLab();
  expect(screen.getByText('n = 65 usuarios')).toBeInTheDocument();
  expect(screen.getByText('471,428571 ms')).toBeInTheDocument();
  expect(screen.getAllByText('16,326531 ms/usuario')).toHaveLength(2);
});

it('actualiza métricas y gráfica al cambiar el punto', () => {
  renderLab();
  fireEvent.change(screen.getByRole('slider', { name: 'Usuarios del punto de análisis' }), {
    target: { value: '50' },
  });
  expect(screen.getAllByText('300 ms')).toHaveLength(2);
  expect(screen.getAllByText('8 ms/usuario')).toHaveLength(2);
  expect(screen.getByText('8,163265 ms')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('radio', { name: 'R′(n)' }));
  expect(screen.getByRole('heading', { name: 'Primera derivada' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('radio', { name: 'R″(n)' }));
  expect(screen.getByRole('heading', { name: 'Segunda derivada' })).toBeInTheDocument();
});

it('maneja 99 y permite reiniciar el análisis', () => {
  renderLab();
  const slider = screen.getByRole('slider', { name: 'Usuarios del punto de análisis' });
  fireEvent.change(slider, { target: { value: '99' } });
  expect(screen.getAllByText('No definido').length).toBeGreaterThan(0);
  expect(document.body).not.toHaveTextContent('NaN');
  expect(document.body).not.toHaveTextContent('Infinity');
  fireEvent.click(screen.getByRole('button', { name: 'Reiniciar análisis' }));
  expect(slider).toHaveValue('65');
});
