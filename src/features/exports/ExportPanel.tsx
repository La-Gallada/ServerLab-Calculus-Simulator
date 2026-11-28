import { useMemo, useRef, useState } from 'react';
import { Copy, Download } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { csvVariants, toCsv, type CsvVariant } from '../../export/csv';
import { downloadBlob } from '../../export/download';
import { exportFileName, type ExportFormat } from '../../export/filenames';
import { formatValue } from '../../export/format';
import { academicRecord } from '../../export/metadata';
import { resolutionById, resolutions, svgToPng, type ResolutionId } from '../../export/png';
import { resolveFigure } from '../../export/registry';
import { renderSvg } from '../../export/svg/renderSvg';
import { themes } from '../../export/themes';
import type { ParameterValues, ThemeId } from '../../export/types';
import type { ExportOptions } from './exportOptions';

interface ExportPanelProps {
  figureId: string;
  values: ParameterValues;
  options: ExportOptions;
  onOptionsChange: (options: ExportOptions) => void;
}

interface Status {
  /** Selección a la que corresponde el mensaje. */
  key: string;
  kind: 'busy' | 'done' | 'error';
  message: string;
}

const formats: { id: ExportFormat; name: string; hint: string }[] = [
  { id: 'png', name: 'PNG', hint: 'recomendado para Google Docs y Word' },
  { id: 'svg', name: 'SVG', hint: 'vectorial, para editores compatibles' },
  { id: 'csv', name: 'CSV', hint: 'datos sin redondear' },
];

const pixels = (width: number, height: number) => `${width} × ${height} px`;

export function ExportPanel({ figureId, values, options, onOptionsChange }: ExportPanelProps) {
  const { theme, format, resolution, csvVariant } = options;
  const resolved = useMemo(() => resolveFigure(figureId, values), [figureId, values]);
  const figure = resolved.ok ? resolved.value : null;
  const svg = useMemo(() => (figure ? renderSvg(figure, theme) : ''), [figure, theme]);
  const record = useMemo(() => (figure ? academicRecord(figure) : ''), [figure]);
  const [status, setStatus] = useState<Status | null>(null);
  const [copy, setCopy] = useState<{ record: string; ok: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const running = useRef(false);
  const recordRef = useRef<HTMLTextAreaElement>(null);

  if (!resolved.ok || !figure)
    return (
      <p className="export-error" role="alert">
        {resolved.ok ? '' : resolved.error.message}
      </p>
    );

  const size = resolutionById(resolution);
  const fileName = exportFileName(figure.fileSlug, format, { theme, csvVariant });
  const selectionKey = `${fileName}|${size.id}|${record}`;
  const current = status?.key === selectionKey ? status : null;
  const set = (patch: Partial<ExportOptions>) => onOptionsChange({ ...options, ...patch });

  async function generate(): Promise<Blob> {
    if (format === 'png') return svgToPng(renderSvg(figure!, theme, size), size);
    if (format === 'svg') return new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const csv = toCsv(figure!.table, csvVariant);
    if (!csv.ok) throw new Error(csv.error.message);
    return new Blob([csv.value], { type: 'text/csv;charset=utf-8' });
  }

  async function download() {
    // Evita generaciones duplicadas mientras una está en curso.
    if (running.current) return;
    running.current = true;
    setBusy(true);
    setStatus({ key: selectionKey, kind: 'busy', message: `Generando ${fileName}…` });
    try {
      const blob = await generate();
      downloadBlob(blob, fileName);
      setStatus({
        key: selectionKey,
        kind: 'done',
        message: `Archivo generado y enviado a descargas: ${fileName} (${formatValue(blob.size / 1024, 1)} KB).`,
      });
    } catch (error) {
      setStatus({
        key: selectionKey,
        kind: 'error',
        message: `No se generó el archivo. ${error instanceof Error ? error.message : ''}`,
      });
    } finally {
      running.current = false;
      setBusy(false);
    }
  }

  async function copyRecord() {
    try {
      await navigator.clipboard.writeText(record);
      setCopy({ record, ok: true });
    } catch {
      recordRef.current?.select();
      setCopy({ record, ok: false });
    }
  }

  return (
    <div className="export-panel">
      <figure className="export-preview" data-figure-id={figure.id} data-theme={theme}>
        <img
          src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`}
          alt={`Vista previa: ${figure.title}. ${figure.summary}`}
          width={1200}
          height={800}
        />
        <figcaption>
          Vista previa del archivo con tema {themes[theme].name}. {figure.summary}
        </figcaption>
      </figure>

      <div className="export-options">
        <fieldset>
          <legend>Tema</legend>
          {(Object.keys(themes) as ThemeId[]).map((id) => (
            <label key={id}>
              <input
                type="radio"
                name={`theme-${figureId}`}
                checked={theme === id}
                onChange={() => set({ theme: id })}
              />
              {themes[id].name}
              <small>{id === 'academic' ? 'fondo blanco, impresión' : 'fondo oscuro'}</small>
            </label>
          ))}
        </fieldset>
        <fieldset>
          <legend>Formato</legend>
          {formats.map((item) => (
            <label key={item.id}>
              <input
                type="radio"
                name={`format-${figureId}`}
                checked={format === item.id}
                onChange={() => set({ format: item.id })}
              />
              {item.name}
              <small>{item.hint}</small>
            </label>
          ))}
        </fieldset>
        <div className="export-select">
          {format === 'png' && (
            <label>
              Resolución PNG
              <select
                value={resolution}
                onChange={(event) => set({ resolution: event.target.value as ResolutionId })}
              >
                {resolutions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}: {pixels(item.width, item.height)}
                  </option>
                ))}
              </select>
            </label>
          )}
          {format === 'csv' && (
            <label>
              Variante CSV
              <select
                value={csvVariant}
                onChange={(event) => set({ csvVariant: event.target.value as CsvVariant })}
              >
                {(Object.keys(csvVariants) as CsvVariant[]).map((id) => (
                  <option key={id} value={id}>
                    {csvVariants[id].name}
                  </option>
                ))}
              </select>
            </label>
          )}
          {format === 'svg' && <p>El SVG es vectorial: no depende de una resolución.</p>}
        </div>
      </div>

      <dl className="export-summary" aria-label="Selección activa">
        <div>
          <dt>Archivo</dt>
          <dd>{fileName}</dd>
        </div>
        <div>
          <dt>Tamaño</dt>
          <dd>
            {format === 'png'
              ? pixels(size.width, size.height)
              : format === 'svg'
                ? 'Vectorial 3:2'
                : `${figure.table.rows.length} filas`}
          </dd>
        </div>
        <div>
          <dt>Parámetros</dt>
          <dd>
            {figure.parameters.map((p) => `${p.label}: ${p.value}`).join(' · ') ||
              'Sin parámetros ajustables'}
          </dd>
        </div>
        <div>
          <dt>Unidades</dt>
          <dd>{[...new Set(figure.variables.map((v) => v.unit))].join(', ')}</dd>
        </div>
      </dl>

      <div className="export-actions">
        <Button onClick={download} disabled={busy}>
          <Download aria-hidden="true" size={16} /> Descargar {format.toUpperCase()}
        </Button>
        <p
          className={`export-status export-status--${current?.kind ?? 'idle'}`}
          role={current?.kind === 'error' ? 'alert' : 'status'}
        >
          {current?.message ?? ''}
        </p>
      </div>

      <div className="export-record">
        <label htmlFor={`record-${figureId}`}>Ficha académica</label>
        <textarea id={`record-${figureId}`} ref={recordRef} readOnly rows={10} value={record} />
        <div className="export-actions">
          <Button variant="secondary" onClick={copyRecord}>
            <Copy aria-hidden="true" size={16} /> Copiar ficha académica
          </Button>
          <p className="export-status" role="status">
            {copy?.record === record
              ? copy.ok
                ? 'Ficha copiada al portapapeles.'
                : 'No fue posible copiar. El texto quedó seleccionado para copiarlo manualmente.'
              : ''}
          </p>
        </div>
      </div>
    </div>
  );
}
