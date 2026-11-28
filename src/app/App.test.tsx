import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from './App';

function renderAt(hash = '#/') {
  window.location.hash = hash;
  return render(<App />);
}

describe('ServerLab application shell', () => {
  beforeEach(() => {
    window.location.hash = '#/';
  });

  it('renders the accessible ServerLab logo and dashboard', () => {
    renderAt();
    expect(screen.getByRole('img', { name: /serverlab calculus simulator/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Dashboard de rendimiento' })).toBeInTheDocument();
  });

  it('navigates to a section and marks it as active', () => {
    renderAt();
    fireEvent.click(screen.getByRole('link', { name: 'Límites' }));
    expect(screen.getByRole('heading', { name: 'Laboratorio de límites' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Límites' })).toHaveAttribute('aria-current', 'page');
  });

  it('renders an understandable not-found route', () => {
    renderAt('#/no-existe');
    expect(screen.getByRole('heading', { name: 'Ruta no encontrada' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ir al dashboard/i })).toBeInTheDocument();
  });

  it('opens and closes the mobile navigation with buttons', () => {
    renderAt();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));
    expect(screen.getAllByRole('button', { name: 'Cerrar menú' })).toHaveLength(2);
    fireEvent.click(screen.getAllByRole('button', { name: 'Cerrar menú' })[0]);
    expect(screen.getByRole('complementary', { name: 'Navegación principal' })).not.toHaveClass(
      'sidebar--open',
    );
  });
});
