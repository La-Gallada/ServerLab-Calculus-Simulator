import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from '../../app/App';

function renderLab(hash = '#/integrales') {
  window.location.hash = hash;
  return render(<App />);
}

const slider = (name: 'inferior (a)' | 'superior (b)') =>
  screen.getByRole('slider', { name: `Límite ${name}` });
const field = (symbol: 'a' | 'b') =>
  screen.getByRole('textbox', { name: `Valor exacto de ${symbol} (s)` });
const change = (element: HTMLElement, value: string) =>
  fireEvent.change(element, { target: { value } });
const click = (name: string | RegExp) => fireEvent.click(screen.getByRole('button', { name }));

/** Verifica en orden D(a,b), b − a, T(a) y T(b). */
function expectMetrics(...expected: [string, string, string, string]) {
  const region = screen.getByRole('region', { name: 'Indicadores del intervalo' });
  expect([...region.querySelectorAll('strong')].map((node) => node.textContent)).toEqual(expected);
}

const figure = () => document.querySelector('figure') as HTMLElement;

describe('laboratorio de integrales', () => {
  beforeEach(() => {
    window.location.hash = '#/';
  });

  it('renderiza el intervalo inicial [0,30] con cuatro métricas del motor', () => {
    renderLab();
    expect(screen.getByRole('heading', { name: 'Laboratorio de integrales' })).toBeInTheDocument();
    expect(slider('inferior (a)')).toHaveValue('0');
    expect(slider('superior (b)')).toHaveValue('30');
    expectMetrics('240 MB', '30 s', '5 MB/s', '11 MB/s');
    expect(figure()).toHaveAttribute('data-figure-id', 'integrals-rate-area');
    expect(figure()).toHaveAttribute('data-interval', '0,30');
  });

  it('actualiza métricas, procedimiento y figura al cambiar ambos límites', () => {
    renderLab();
    change(slider('inferior (a)'), '5');
    expectMetrics('212,5 MB', '25 s', '6 MB/s', '11 MB/s');
    change(slider('superior (b)'), '15');
    expectMetrics('70 MB', '10 s', '6 MB/s', '8 MB/s');
    expect(figure()).toHaveAttribute('data-interval', '5,15');
    expect(
      screen.getByRole('math', { name: 'resultado final' }).querySelector('annotation'),
    ).toHaveTextContent('D(5;\\,15) = 70\\ \\mathrm{MB}');
  });

  it('impide intervalos invertidos con el slider sin intercambiar los límites', () => {
    renderLab();
    change(slider('superior (b)'), '10');
    change(slider('inferior (a)'), '25');
    expect(slider('inferior (a)')).toHaveValue('10');
    expect(slider('superior (b)')).toHaveValue('10');
    change(slider('superior (b)'), '2');
    expect(slider('superior (b)')).toHaveValue('10');
  });

  it('admite decimales con coma o punto en el campo numérico', () => {
    renderLab();
    change(field('a'), '10,5');
    change(field('b'), '20.5');
    expectMetrics('81 MB', '10 s', '7,1 MB/s', '9,1 MB/s');
    expect(slider('inferior (a)')).toHaveAttribute('step', 'any');
  });

  it.each([
    ['', 'máximo de dos decimales'],
    ['abc', 'máximo de dos decimales'],
    ['Infinity', 'máximo de dos decimales'],
    ['NaN', 'máximo de dos decimales'],
    ['1,234', 'máximo de dos decimales'],
    ['31', 'excede el intervalo'],
    ['-1', 'no puede ser negativo'],
    ['9'.repeat(400), 'número finito'],
    ['5', 'no puede ser menor'],
  ])('no propaga la entrada inválida «%s»', (text, message) => {
    renderLab();
    change(field('a'), '10');
    const upper = field('b');
    change(upper, text);
    expect(screen.getByRole('alert')).toHaveTextContent(message);
    expect(upper).toHaveAttribute('aria-invalid', 'true');
    expect(slider('superior (b)')).toHaveValue('30');
    expectMetrics('180 MB', '20 s', '7 MB/s', '11 MB/s');
    fireEvent.blur(upper);
    expect(upper).toHaveValue('30');
    expect(screen.getByRole('alert')).toHaveTextContent('Se conserva b = 30 s');
  });

  it('retira el aviso cuando el límite cambia por otra vía', () => {
    renderLab();
    change(field('b'), '99');
    click('Reiniciar intervalo');
    change(slider('superior (b)'), '20');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(field('b')).toHaveValue('20');
  });

  it('alterna la representación conservando el intervalo', () => {
    renderLab();
    change(slider('inferior (a)'), '10');
    change(slider('superior (b)'), '20');
    click('Datos acumulados');
    expect(screen.getByRole('heading', { name: 'Datos acumulados' })).toBeInTheDocument();
    expect(figure()).toHaveAttribute('data-figure-id', 'integrals-accumulated-data');
    expect(figure()).toHaveAttribute('data-interval', '10,20');
    expect(figure()).toHaveTextContent('A(20 s) = 140 MB y A(10 s) = 60 MB');
    expect(figure()).toHaveTextContent('no un área bajo A(t)');
    expect(screen.getByRole('button', { name: 'Datos acumulados' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    click('Tasa y área');
    expect(
      screen.getByRole('heading', { name: 'Tasa de transferencia y área bajo la curva' }),
    ).toBeInTheDocument();
    expectMetrics('80 MB', '10 s', '7 MB/s', '9 MB/s');
  });

  it('carga los dos ejemplos académicos', () => {
    renderLab();
    click('Cargar ejemplo [10, 20]');
    expectMetrics('80 MB', '10 s', '7 MB/s', '9 MB/s');
    expect(screen.getByText(/exclusivamente durante el intervalo/)).toHaveTextContent(
      'A(20) = 140 MB',
    );
    click('Cargar ejemplo [0, 30]');
    expectMetrics('240 MB', '30 s', '5 MB/s', '11 MB/s');
  });

  it('maneja un intervalo de longitud cero', () => {
    renderLab();
    change(slider('inferior (a)'), '15');
    change(slider('superior (b)'), '15');
    expectMetrics('0 MB', '0 s', '8 MB/s', '8 MB/s');
    expect(figure()).toHaveTextContent('no hay área');
    expect(screen.getByRole('row', { name: /^15 / })).toHaveTextContent('Límites a y b');
  });

  it('genera la tabla con el motor y permite fijar límites sin invertirlos', () => {
    renderLab();
    expect(screen.getAllByRole('row')).toHaveLength(8);
    expect(screen.getByRole('row', { name: /^25 / })).toHaveTextContent('10 MB/s187,5 MB');
    click('Fijar 10 s como límite inferior a');
    click('Fijar 20 s como límite superior b');
    expectMetrics('80 MB', '10 s', '7 MB/s', '9 MB/s');
    expect(
      screen.getByRole('button', { name: 'Fijar 25 s como límite inferior a' }),
    ).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Fijar 5 s como límite superior b' })).toBeDisabled();
    expect(screen.getByRole('row', { name: /^15 / })).toHaveTextContent('Dentro');
    expect(screen.getByRole('row', { name: /^25 / })).toHaveTextContent('Fuera');
  });

  it('inicia b con la duración del Dashboard, reinicia a ese valor y no lo modifica', () => {
    renderLab('#/');
    change(screen.getByRole('slider', { name: 'Duración de transferencia' }), '20');
    fireEvent.click(screen.getByRole('link', { name: 'Integrales' }));
    expect(slider('superior (b)')).toHaveValue('20');
    expectMetrics('140 MB', '20 s', '5 MB/s', '9 MB/s');
    click('Cargar ejemplo [0, 30]');
    change(slider('inferior (a)'), '12');
    click('Reiniciar intervalo');
    expect(slider('inferior (a)')).toHaveValue('0');
    expect(slider('superior (b)')).toHaveValue('20');
    change(slider('superior (b)'), '7');
    fireEvent.click(screen.getByRole('link', { name: 'Ir al Dashboard' }));
    expect(screen.getByRole('slider', { name: 'Duración de transferencia' })).toHaveValue('20');
    expect(screen.getByRole('slider', { name: 'Usuarios concurrentes' })).toHaveValue('65');
  });

  it('admite una duración inicial de cero segundos', () => {
    renderLab('#/');
    change(screen.getByRole('slider', { name: 'Duración de transferencia' }), '0');
    fireEvent.click(screen.getByRole('link', { name: 'Integrales' }));
    expectMetrics('0 MB', '0 s', '5 MB/s', '5 MB/s');
  });

  it('ofrece navegación, nombres accesibles y ningún resultado no finito', () => {
    renderLab();
    const modules = within(screen.getByRole('navigation', { name: 'Otros módulos' }));
    expect(modules.getByRole('link', { name: 'Repasar Límites' })).toHaveAttribute(
      'href',
      '#/limites',
    );
    expect(modules.getByRole('link', { name: /Optimización/ })).toHaveAttribute(
      'href',
      '#/optimizacion',
    );
    expect(screen.getByRole('link', { name: 'Volver a Derivadas' })).toHaveAttribute(
      'href',
      '#/derivadas',
    );
    for (const control of [...screen.getAllByRole('button'), ...screen.getAllByRole('link')])
      expect(control).toHaveAccessibleName();
    expect(figure()).toHaveAccessibleDescription(/área sombreada/i);
    for (const [a, b] of [
      ['0', '0'],
      ['30', '30'],
      ['0', '30'],
    ]) {
      change(field('a'), '0');
      change(field('b'), b);
      change(field('a'), a);
      expect(document.body).not.toHaveTextContent('NaN');
      expect(document.body).not.toHaveTextContent('Infinity');
    }
    fireEvent.click(modules.getByRole('link', { name: 'Repasar Derivadas' }));
    expect(screen.getByRole('heading', { name: 'Laboratorio de derivadas' })).toBeInTheDocument();
  });
});
