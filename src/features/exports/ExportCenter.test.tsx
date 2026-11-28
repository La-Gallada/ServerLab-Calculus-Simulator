import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from '../../app/App';

function open(hash = '#/exportaciones') {
  window.location.hash = hash;
  return render(<App />);
}

const heading = () => screen.findByRole('heading', { name: 'Centro de exportaciones' });
const catalog = () => within(screen.getByRole('list', { name: 'Figuras disponibles' }));
const select = (name: RegExp) => fireEvent.click(catalog().getByRole('button', { name }));
const preview = () => screen.getByRole('img', { name: /^Vista previa:/ });
const previewSvg = () => decodeURIComponent(preview().getAttribute('src')!.split(',')[1]);
const record = () =>
  screen.getByRole('textbox', { name: 'Ficha académica' }) as HTMLTextAreaElement;
const field = (name: RegExp) => screen.getByRole('textbox', { name });

describe('centro de exportaciones', () => {
  beforeEach(() => {
    window.location.hash = '#/';
  });

  it('se alcanza desde el menú y muestra las 15 figuras', async () => {
    open('#/');
    fireEvent.click(screen.getByRole('link', { name: 'Exportaciones' }));
    await heading();
    expect(catalog().getAllByRole('button')).toHaveLength(15);
    expect(screen.getByRole('radio', { name: /Académico/ })).toBeChecked();
    expect(screen.getByRole('radio', { name: /PNG/ })).toBeChecked();
    expect(screen.getByRole('combobox', { name: 'Resolución PNG' })).toHaveValue('high');
    expect(previewSvg()).toContain('data-theme="academic"');
  });

  it('filtra por módulo y selecciona la primera figura del filtro', async () => {
    open();
    await heading();
    fireEvent.click(screen.getByRole('button', { name: 'Integrales' }));
    expect(catalog().getAllByRole('button')).toHaveLength(4);
    expect(previewSvg()).toContain('data-figure-id="integrals-rate-area"');
    fireEvent.click(screen.getByRole('button', { name: 'Optimización' }));
    expect(catalog().getAllByRole('button')).toHaveLength(5);
    fireEvent.click(screen.getByRole('button', { name: 'Todas' }));
    expect(catalog().getAllByRole('button')).toHaveLength(15);
  });

  it('aplica parámetros al confirmar y rechaza intervalos invertidos', async () => {
    open();
    await heading();
    select(/^Integrales\s*Tasa de transferencia/);
    const upper = field(/Límite superior b/);
    fireEvent.change(upper, { target: { value: '2' } });
    expect(record().value).toContain('Límite superior b: 30 s');
    fireEvent.change(upper, { target: { value: '20' } });
    fireEvent.keyDown(upper, { key: 'Enter' });
    expect(record().value).toContain('Límite superior b: 20 s');
    const lower = field(/Límite inferior a/);
    fireEvent.change(lower, { target: { value: '25' } });
    fireEvent.blur(lower);
    expect(screen.getByRole('alert')).toHaveTextContent('no puede ser menor');
    expect(record().value).toContain('Límite inferior a: 0 s');
  });

  it('conserva los parámetros por figura y permite restablecerlos', async () => {
    open();
    await heading();
    fireEvent.change(field(/Carga operativa/), { target: { value: '40' } });
    fireEvent.blur(field(/Carga operativa/));
    select(/Primera derivada/);
    select(/Tiempo de respuesta según/);
    expect(field(/Carga operativa/)).toHaveValue('40');
    expect(screen.getByLabelText('Selección activa')).toHaveTextContent(
      'serverlab-tiempo-respuesta-n40.png',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Restablecer parámetros' }));
    expect(field(/Carga operativa/)).toHaveValue('65');
  });

  it('cambia tema, formato y variante CSV', async () => {
    open();
    await heading();
    fireEvent.click(screen.getByRole('radio', { name: /ServerLab/ }));
    expect(previewSvg()).toContain('data-theme="serverlab"');
    fireEvent.click(screen.getByRole('radio', { name: /CSV/ }));
    expect(screen.queryByRole('combobox', { name: 'Resolución PNG' })).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole('combobox', { name: 'Variante CSV' }), {
      target: { value: 'regional' },
    });
    expect(screen.getByLabelText('Selección activa')).toHaveTextContent(
      'serverlab-tiempo-respuesta-n65-regional.csv',
    );
    expect(screen.getByRole('button', { name: 'Descargar CSV' })).toBeEnabled();
  });

  it('informa cuando no puede copiar y no declara éxito', async () => {
    open();
    await heading();
    fireEvent.click(screen.getByRole('button', { name: 'Copiar ficha académica' }));
    expect(await screen.findByText(/No fue posible copiar/)).toBeInTheDocument();
    expect(screen.queryByText('Ficha copiada al portapapeles.')).not.toBeInTheDocument();
  });

  it('no modifica el Dashboard', async () => {
    open('#/');
    fireEvent.change(screen.getByRole('slider', { name: 'Usuarios concurrentes' }), {
      target: { value: '30' },
    });
    fireEvent.click(screen.getByRole('link', { name: 'Exportaciones' }));
    await heading();
    expect(field(/Carga operativa/)).toHaveValue('65');
    fireEvent.change(field(/Carga operativa/), { target: { value: '90' } });
    fireEvent.blur(field(/Carga operativa/));
    fireEvent.click(screen.getByRole('link', { name: 'Ir al Dashboard' }));
    expect(screen.getByRole('slider', { name: 'Usuarios concurrentes' })).toHaveValue('30');
  });
});

describe('exportación desde un laboratorio', () => {
  it('abre el diálogo con los parámetros actuales y lo cierra', async () => {
    open('#/integrales');
    fireEvent.change(screen.getByRole('slider', { name: 'Límite superior (b)' }), {
      target: { value: '12' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Exportar gráfica principal' }));
    const dialog = await screen.findByRole('dialog', { name: 'Tasa de transferencia' });
    expect(within(dialog).getByLabelText('Selección activa')).toHaveTextContent(
      'serverlab-tasa-transferencia-0-12s.png',
    );
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cerrar exportación' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it.each([
    ['#/', ['Exportar respuesta', 'Exportar derivada', 'Exportar transferencia']],
    ['#/limites', ['Exportar gráfica principal']],
    ['#/derivadas', ['Exportar gráfica principal']],
    ['#/integrales', ['Exportar gráfica principal', 'Exportar ejemplo 1', 'Exportar ejemplo 2']],
    [
      '#/optimizacion',
      [
        'Exportar gráfica principal',
        'Exportar verificación entera',
        'Exportar sensibilidad',
        'Exportar escenario 1',
        'Exportar escenario 2',
      ],
    ],
  ])('ofrece botones accesibles en %s', (hash, labels) => {
    open(hash);
    for (const name of labels)
      expect(screen.getByRole('button', { name })).toHaveAttribute('aria-haspopup', 'dialog');
  });
});
