/**
 * Simula una configuración futura (capacidad 120 y 18 s) para comprobar que la
 * interfaz deriva sus valores y declara los ejemplos fijos que dejan de ser válidos.
 */
import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { App } from '../app/App';
import { preloadRoutes } from '../app/routes';

vi.mock('./model', async (original) => {
  const actual = await original<typeof import('./model')>();
  const base = actual.mathModelConfig;
  return {
    ...actual,
    mathModelConfig: {
      ...base,
      response: { ...base.response, referenceCapacityUsers: 120 },
      transfer: { ...base.transfer, maximumTimeSeconds: 18 },
      controls: {
        ...base.controls,
        initialTransferTimeSeconds: 18,
        initialIntegrationEndSeconds: 18,
      },
    },
  };
});

function open(hash: string) {
  window.location.hash = hash;
  return render(<App />);
}

describe('configuración alternativa del modelo', () => {
  beforeAll(preloadRoutes);

  it('deriva los rangos del Dashboard', () => {
    open('#/');
    expect(screen.getByRole('slider', { name: 'Usuarios concurrentes' })).toHaveAttribute(
      'max',
      '119',
    );
    expect(screen.getByRole('slider', { name: 'Duración de transferencia' })).toHaveAttribute(
      'max',
      '18',
    );
  });

  it('deriva la tabla de integrales y declara los ejemplos no válidos', () => {
    open('#/integrales');
    expect(screen.getByRole('row', { name: /^18 / })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /^3 / })).toBeInTheDocument();
    expect(screen.queryByRole('row', { name: /^30 / })).not.toBeInTheDocument();
    const notes = screen.getAllByRole('note');
    expect(notes).toHaveLength(2);
    for (const note of notes)
      expect(note).toHaveTextContent('no es válido con la configuración actual');
    expect(document.body).not.toHaveTextContent(/NaN|undefined/);
  });

  it('usa el último usuario configurado en derivadas y optimización', () => {
    const derivatives = open('#/derivadas');
    expect(screen.getByRole('slider', { name: 'Usuarios del punto de análisis' })).toHaveAttribute(
      'max',
      '119',
    );
    expect(screen.getByRole('button', { name: 'Seleccionar 119 usuarios' })).toBeInTheDocument();
    derivatives.unmount();
    open('#/optimizacion');
    expect(screen.getByRole('slider', { name: 'Usuarios de análisis' })).toHaveAttribute(
      'max',
      '119',
    );
    expect(screen.getByRole('button', { name: 'Último usuario: R(119)' })).toBeInTheDocument();
  });
});
