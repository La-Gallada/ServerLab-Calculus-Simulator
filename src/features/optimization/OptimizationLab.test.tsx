import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { App } from '../../app/App';
import { preloadRoutes } from '../../app/routes';

beforeAll(preloadRoutes);

function renderLab(hash = '#/optimizacion') {
  window.location.hash = hash;
  return render(<App />);
}

/** Normaliza el separador de miles (espacio no separable) de es-CR. */
const text = (node: Element | null) => node?.textContent?.replace(/\s/g, ' ') ?? '';
const change = (element: HTMLElement, value: string) =>
  fireEvent.change(element, { target: { value } });
const click = (name: string | RegExp) => fireEvent.click(screen.getByRole('button', { name }));
const thresholdSlider = () => screen.getByRole('slider', { name: 'Umbral de respuesta' });
const loadSlider = () => screen.getByRole('slider', { name: 'Usuarios de análisis' });
const field = () => screen.getByRole('textbox', { name: 'Valor exacto de L (ms)' });
const status = () => screen.getByRole('status', { name: 'Estado de factibilidad' });
const preset = (name: string | RegExp) =>
  fireEvent.click(
    within(screen.getByRole('group', { name: 'Umbrales predefinidos' })).getByRole('button', {
      name,
    }),
  );

/** Orden: L, máximo entero, carga y R(n). */
function expectMetrics(...expected: [string, string, string, string]) {
  const region = screen.getByRole('region', { name: 'Indicadores principales' });
  expect([...region.querySelectorAll('strong')].map(text)).toEqual(expected);
}

/** Orden: n*, R(m), margen en m, tiempo actual y margen de usuarios. */
function expectSolution(...expected: [string, string, string, string, string]) {
  const list = screen.getByLabelText('Detalle de la solución');
  expect([...list.querySelectorAll('dd')].map(text)).toEqual(expected);
}

const resolution = () => text(document.querySelector('.opt-procedure'));
const verification = () => text(document.querySelector('.opt-verification'));

describe('laboratorio de optimización', () => {
  beforeEach(() => {
    window.location.hash = '#/';
  });

  it('renderiza 65 usuarios y 500 ms con la solución calculada', () => {
    renderLab();
    expect(
      screen.getByRole('heading', { name: 'Laboratorio de optimización' }),
    ).toBeInTheDocument();
    expectMetrics('500 ms', '66 usuarios', '65 usuarios', '471,43 ms');
    expectSolution('≈ 66,6666667', '≈ 488,2352941 ms', '≈ 11,7647059 ms', '28,57 ms', '1 usuario');
    expect(status()).toHaveTextContent('La carga cumple el umbral');
    expect(verification()).toContain('R(66) ≈ 488,2352941 ms');
    expect(verification()).toContain('R(67) ≈ 506,0606061 ms');
    expect(verification()).toContain('Incumple: R(m + 1) > 500 ms');
    expect(document.querySelectorAll('.opt-procedure li')).toHaveLength(13);
    expect(resolution()).toContain('no hay máximo interior');
  });

  it('actualiza métricas al cambiar la carga y declara el exceso', () => {
    renderLab();
    change(loadSlider(), '75');
    expectMetrics('500 ms', '66 usuarios', '75 usuarios', '700 ms');
    expect(status()).toHaveTextContent('La carga supera el umbral');
    expect(screen.getByText('Exceso de carga').nextElementSibling).toHaveTextContent('9 usuarios');
    expect(screen.getByText('Exceso de tiempo actual').nextElementSibling).toHaveTextContent(
      '200 ms',
    );
  });

  it('actualiza la solución con el slider y los presets', () => {
    renderLab();
    change(thresholdSlider(), '301');
    expectMetrics('301 ms', '50 usuarios', '65 usuarios', '471,43 ms');
    preset(/^1.000 ms$/);
    expectMetrics('1 000 ms', '81 usuarios', '65 usuarios', '471,43 ms');
    expect(verification()).toContain('R(82) ≈ 1 011,1111111 ms');
  });

  it('presenta un umbral inferior al tiempo base como infactible, no como cero', () => {
    renderLab();
    preset('50 ms');
    expectMetrics('50 ms', 'Sin solución', '65 usuarios', '471,43 ms');
    expectSolution('No existe', 'No aplica', 'No aplica', '421,43 ms', 'No aplica');
    expect(status()).toHaveTextContent('No hay solución factible');
    expect(verification()).toContain('No hay solución que verificar');
    expect(document.querySelectorAll('.opt-procedure li')).toHaveLength(6);
    expect(resolution()).toContain('tampoco cero usuarios');
    expect(document.querySelector('[data-figure-id="optimization-integer-verification"]')).toBe(
      null,
    );
  });

  it('con L igual al tiempo base sólo admite cero usuarios', () => {
    renderLab();
    preset('100 ms');
    change(loadSlider(), '0');
    expectMetrics('100 ms', '0 usuarios', '0 usuarios', '100 ms');
    expectSolution('0', '100 ms', '0 ms', '0 ms', '0 usuarios');
    expect(status()).toHaveTextContent('La carga cumple el umbral');
    expect(verification()).toContain('R(1)');
  });

  it('en el último usuario no evalúa el siguiente', () => {
    renderLab();
    click('Último usuario: R(99)');
    change(loadSlider(), '99');
    expectMetrics('19 900 ms', '99 usuarios', '99 usuarios', '19 900 ms');
    expect(verification()).toContain('último usuario operativo');
    expect(verification()).toContain('fuera del dominio y no se evalúa');
    expect(verification()).not.toContain('R(100)');
    expect(resolution()).toContain('(n = 100) está fuera del dominio');
    expect(thresholdSlider()).toHaveValue('2000');
    expect(screen.getByText(/El valor actual está fuera de ese rango/)).toBeInTheDocument();
  });

  it('aplica el campo sólo al confirmar, sin estados intermedios', () => {
    renderLab();
    change(field(), '3');
    expectMetrics('500 ms', '66 usuarios', '65 usuarios', '471,43 ms');
    change(field(), '35');
    expect(screen.getByText(/Sin aplicar/)).toBeInTheDocument();
    change(field(), '350,5');
    expectMetrics('500 ms', '66 usuarios', '65 usuarios', '471,43 ms');
    fireEvent.keyDown(field(), { key: 'Enter' });
    expectMetrics('350,5 ms', '55 usuarios', '65 usuarios', '471,43 ms');
    change(field(), '1000');
    fireEvent.blur(field());
    expectMetrics('1 000 ms', '81 usuarios', '65 usuarios', '471,43 ms');
    change(field(), '200');
    fireEvent.keyDown(field(), { key: 'Escape' });
    expect(field()).toHaveValue('1000');
  });

  it.each([
    ['', 'Escriba un número válido'],
    ['abc', 'Escriba un número válido'],
    ['1.000', 'es ambiguo'],
    ['-5', 'no puede ser negativo'],
    ['30000', 'hasta 25000 ms'],
  ])('no propaga la entrada «%s»', (value, message) => {
    renderLab();
    change(field(), value);
    fireEvent.keyDown(field(), { key: 'Enter' });
    expect(screen.getByRole('alert')).toHaveTextContent(message);
    expect(screen.getByRole('alert')).toHaveTextContent('Se conserva L = 500 ms');
    expect(field()).toHaveAttribute('aria-invalid', 'true');
    expect(field()).toHaveValue(value);
    expectMetrics('500 ms', '66 usuarios', '65 usuarios', '471,43 ms');
    preset('500 ms');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(field()).toHaveValue('500');
  });

  it('carga escenarios desde la tabla y los ejemplos', () => {
    renderLab();
    const table = screen.getByRole('table');
    expect(within(table).getAllByRole('row')).toHaveLength(6);
    expect(text(within(table).getByRole('row', { name: /^50 ms/ }))).toContain('Sin solución');
    expect(text(within(table).getByRole('row', { name: /^1.000 ms/ }))).toContain('81,82');
    click('Cargar escenario de 100 ms');
    expectMetrics('100 ms', '0 usuarios', '65 usuarios', '471,43 ms');
    click('Cargar ejemplo de 300 ms');
    expectMetrics('300 ms', '50 usuarios', '65 usuarios', '471,43 ms');
    expect(screen.getByText(/16 usuarios menos/)).toBeInTheDocument();
    click('Cargar ejemplo de 500 ms');
    expectMetrics('500 ms', '66 usuarios', '65 usuarios', '471,43 ms');
  });

  it('inicia desde el Dashboard, reinicia a esos valores y no lo modifica', () => {
    renderLab('#/');
    change(screen.getByRole('slider', { name: 'Usuarios concurrentes' }), '80');
    click('1000 ms');
    fireEvent.click(screen.getByRole('link', { name: 'Optimización' }));
    expectMetrics('1 000 ms', '81 usuarios', '80 usuarios', '900 ms');
    preset('300 ms');
    change(loadSlider(), '10');
    change(field(), 'abc');
    fireEvent.blur(field());
    click('Reiniciar laboratorio');
    expectMetrics('1 000 ms', '81 usuarios', '80 usuarios', '900 ms');
    expect(field()).toHaveValue('1000');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    preset('50 ms');
    fireEvent.click(screen.getByRole('link', { name: 'Ir al Dashboard' }));
    expect(screen.getByRole('slider', { name: 'Usuarios concurrentes' })).toHaveValue('80');
    expect(screen.getByRole('button', { name: '1000 ms' })).toHaveClass('selected');
  });

  it('ofrece nombres accesibles, navegación y ningún resultado no finito', () => {
    renderLab();
    for (const control of [...screen.getAllByRole('button'), ...screen.getAllByRole('link')])
      expect(control).toHaveAccessibleName();
    for (const figure of document.querySelectorAll('figure'))
      expect(figure).toHaveAccessibleDescription();
    for (const name of ['50 ms', '100 ms', '300 ms', 'Último usuario: R(99)']) {
      preset(name);
      for (const value of ['0', '99']) {
        change(loadSlider(), value);
        expect(document.body).not.toHaveTextContent(/NaN|Infinity|undefined/);
      }
    }
    expect(screen.getByRole('link', { name: 'Volver a Integrales' })).toHaveAttribute(
      'href',
      '#/integrales',
    );
    fireEvent.click(screen.getByRole('link', { name: 'Repasar Integrales' }));
    expect(screen.getByRole('heading', { name: 'Laboratorio de integrales' })).toBeInTheDocument();
  });
});
