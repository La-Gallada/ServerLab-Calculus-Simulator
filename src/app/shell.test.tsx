import { fireEvent, render, screen, within } from '@testing-library/react';
import { HashRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authorshipLines } from '../config/authorship';
import { App } from './App';
import { lazyRoute } from './lazyRoute';
import { RouteBoundary } from './RouteBoundary';
import { deferredRoutes, preloadRoutes } from './routes';

function open(hash: string) {
  window.location.hash = hash;
  return render(<App />);
}

describe('carga diferida', () => {
  it('declara diferidas todas las pantallas salvo el Dashboard', () => {
    expect(deferredRoutes.map((route) => route.path)).toEqual([
      '/limites',
      '/derivadas',
      '/integrales',
      '/optimizacion',
      '/exportaciones',
      '/acerca',
    ]);
  });

  it('descarga una sola vez y muestra la pantalla precargada sin espera', async () => {
    const load = vi.fn(async () => () => <p>Pantalla lista</p>);
    const { Route, preload } = lazyRoute(load);
    await Promise.all([preload(), preload()]);
    render(<Route />);
    expect(screen.getByText('Pantalla lista')).toBeInTheDocument();
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('reintenta la descarga después de un fallo', async () => {
    const load = vi
      .fn()
      .mockRejectedValueOnce(new Error('sin red'))
      .mockResolvedValue(() => null);
    const { preload } = lazyRoute(load);
    await expect(preload()).rejects.toThrow('sin red');
    await expect(preload()).resolves.toBeTypeOf('function');
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('ofrece recuperación cuando una pantalla no puede mostrarse', () => {
    const silence = vi.spyOn(console, 'error').mockImplementation(() => {});
    const Broken = () => {
      throw new Error('fallo de carga');
    };
    render(
      <HashRouter>
        <RouteBoundary>
          <Broken />
        </RouteBoundary>
      </HashRouter>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('No fue posible mostrar esta sección');
    expect(screen.getByRole('button', { name: 'Recargar la página' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ir al Dashboard' })).toHaveAttribute('href', '#/');
    silence.mockRestore();
  });
});

describe('estructura de la aplicación', () => {
  beforeEach(async () => {
    await preloadRoutes();
    window.location.hash = '#/';
  });

  it('actualiza el título de la pestaña y el foco al cambiar de ruta', async () => {
    open('#/');
    expect(document.title).toBe('ServerLab | Calculus Simulator');
    fireEvent.click(screen.getByRole('link', { name: 'Integrales' }));
    await screen.findByRole('heading', { name: 'Laboratorio de integrales' });
    expect(document.title).toBe('Integrales · ServerLab');
    expect(screen.getByRole('main')).toHaveFocus();
  });

  it('permite saltar al contenido y cerrar el menú con Escape', () => {
    open('#/');
    fireEvent.click(screen.getByRole('button', { name: 'Saltar al contenido' }));
    expect(screen.getByRole('main')).toHaveFocus();
    const menu = screen.getByRole('button', { name: 'Abrir menú' });
    fireEvent.click(menu);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.getByRole('complementary')).not.toHaveClass('sidebar--open');
    expect(menu).toHaveFocus();
  });

  it('completa Acerca de con alcance, modelo y limitaciones', async () => {
    open('#/acerca');
    await screen.findByRole('heading', { name: 'Acerca de ServerLab', level: 1 });
    const main = within(screen.getByRole('main'));
    for (const name of [
      'Autoría y contexto académico',
      'Relación con Ingeniería en Sistemas',
      'Módulos disponibles',
      'Modelo hipotético y provisional',
      'Alcance y limitaciones',
      'Tecnologías utilizadas',
    ])
      expect(main.getByRole('heading', { name })).toBeInTheDocument();
    expect(main.getByRole('link', { name: 'Exportaciones' })).toHaveAttribute(
      'href',
      '#/exportaciones',
    );
    expect(main.getByText(/No mide, vigila ni administra/)).toBeInTheDocument();
    for (const line of authorshipLines) expect(main.getByText(line)).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toHaveTextContent('Desarrollado por el Grupo #4');
    expect(screen.getByRole('contentinfo')).toHaveTextContent('no es un producto oficial');
    expect(document.body).not.toHaveTextContent(/M01|planificado/i);
  });

  it.each(['#/limites', '#/derivadas', '#/integrales', '#/optimizacion'])(
    'usa listas ordenadas con un paso por elemento en %s',
    (hash) => {
      open(hash);
      const procedures = document.querySelectorAll('.procedure-card ol');
      expect(procedures.length).toBeGreaterThan(0);
      for (const list of procedures) {
        expect(list.children.length).toBeGreaterThan(1);
        expect([...list.children].every((child) => child.tagName === 'LI')).toBe(true);
      }
    },
  );
});
