import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { HashRouter } from 'react-router';
import { LimitsLab } from './LimitsLab';

function renderLab() {
  return render(
    <HashRouter>
      <LimitsLab />
    </HashRouter>,
  );
}

it('presenta el caso inicial calculado desde el motor', () => {
  renderLab();
  expect(screen.getByRole('heading', { name: 'Laboratorio de límites' })).toBeInTheDocument();
  expect(screen.getByText('100 ms')).toBeInTheDocument();
  expect(screen.getByText('100,020002 ms')).toBeInTheDocument();
  expect(screen.getByRole('radio', { name: /Carga inicial/ })).toHaveAttribute(
    'aria-checked',
    'true',
  );
});

it('actualiza el límite, tabla y muestra al aproximarse a la capacidad', () => {
  renderLab();
  fireEvent.click(screen.getByRole('radio', { name: /Capacidad/ }));
  expect(screen.getByText('+∞')).toBeInTheDocument();
  expect(screen.getByRole('row', { name: /99,99/ })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Seleccionar distancia 0.01' }));
  expect(screen.getByText('n = 99,99')).toBeInTheDocument();
  expect(screen.getAllByText(/R\(n\) = 1/)).toHaveLength(2);
});

it('mantiene el análisis continuo separado de la simulación operativa y ofrece navegación', () => {
  renderLab();
  fireEvent.click(screen.getByRole('button', { name: '0,01' }));
  expect(screen.getByText('n = 0,01')).toBeInTheDocument();
  expect(document.body).not.toHaveTextContent('NaN');
  expect(document.body).not.toHaveTextContent('Infinity');
  expect(screen.getByRole('link', { name: 'Ir al Dashboard' })).toHaveAttribute('href', '#/');
  expect(screen.getByRole('link', { name: 'Continuar a Derivadas' })).toHaveAttribute(
    'href',
    '#/derivadas',
  );
});
