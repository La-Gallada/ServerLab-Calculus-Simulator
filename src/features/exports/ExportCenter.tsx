import { useRef, useState } from 'react';
import { Package, RotateCcw } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { downloadBlob } from '../../export/download';
import { buildFigurePackage, packageName } from '../../export/package';
import { resolutionById } from '../../export/png';
import { categoryNames, defaultValues, figureRegistry, resolveFigure } from '../../export/registry';
import { themes } from '../../export/themes';
import type { FigureCategory, ParameterValues } from '../../export/types';
import { initialExportOptions } from './exportOptions';
import { ExportPanel } from './ExportPanel';
import { ParameterField } from './ParameterField';

type Filter = FigureCategory | 'all';

const filters: Filter[] = ['all', ...(Object.keys(categoryNames) as FigureCategory[])];
const filterName = (filter: Filter) => (filter === 'all' ? 'Todas' : categoryNames[filter]);

export function ExportCenter() {
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedId, setSelectedId] = useState(figureRegistry[0].id);
  // Parámetros propios del centro: no leen ni modifican la simulación del Dashboard.
  const [valuesById, setValuesById] = useState<Record<string, ParameterValues>>(() =>
    Object.fromEntries(figureRegistry.map((item) => [item.id, defaultValues(item)])),
  );
  const [options, setOptions] = useState(initialExportOptions);
  const [revision, setRevision] = useState(0);
  const [packageStatus, setPackageStatus] = useState('');
  const [packageError, setPackageError] = useState('');
  const [packaging, setPackaging] = useState(false);
  const packagingRef = useRef(false);

  const visible = figureRegistry.filter((item) => filter === 'all' || item.category === filter);
  const definition = figureRegistry.find((item) => item.id === selectedId) ?? figureRegistry[0];
  const values = valuesById[definition.id];
  const size = resolutionById(options.resolution);

  const commit = (key: string, value: number | string) =>
    setValuesById((current) => ({
      ...current,
      [definition.id]: { ...current[definition.id], [key]: value },
    }));

  function choose(next: Filter) {
    setFilter(next);
    const first = figureRegistry.find((item) => next === 'all' || item.category === next);
    if (next !== 'all' && definition.category !== next && first) setSelectedId(first.id);
  }

  async function downloadPackage() {
    if (packagingRef.current) return;
    packagingRef.current = true;
    setPackaging(true);
    setPackageError('');
    try {
      const blob = await buildFigurePackage(options.theme, options.resolution, (done, total) =>
        setPackageStatus(`Generando figura ${Math.min(done + 1, total)} de ${total}…`),
      );
      downloadBlob(blob, packageName);
      setPackageStatus(
        `Paquete generado y enviado a descargas: ${packageName} (${(blob.size / 1048576).toFixed(1)} MB).`,
      );
    } catch (error) {
      setPackageStatus('');
      setPackageError(
        `No se generó el paquete. ${error instanceof Error ? error.message : ''}`.trim(),
      );
    } finally {
      packagingRef.current = false;
      setPackaging(false);
    }
  }

  return (
    <div className="export-center" aria-label="Centro de exportaciones">
      <header className="limits-lab__intro">
        <div>
          <p className="eyebrow">Material académico · modelo provisional</p>
          <h1>Centro de exportaciones</h1>
          <p>
            Descarga las figuras de ServerLab como imágenes o datos para el documento del proyecto.
            Todo se genera en este navegador.
          </p>
        </div>
        <div className="limits-lab__nav">
          <Link to="/">Ir al Dashboard</Link>
          <Link to="/optimizacion">Volver a Optimización</Link>
        </div>
      </header>

      <div className="export-layout">
        <Card className="export-catalog">
          <p className="eyebrow">Catálogo</p>
          <h2>{figureRegistry.length} figuras</h2>
          <div className="export-filters" role="group" aria-label="Filtrar por módulo">
            {filters.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={filter === item}
                onClick={() => choose(item)}
              >
                {filterName(item)}
              </button>
            ))}
          </div>
          <ul aria-label="Figuras disponibles">
            {visible.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  data-figure={item.id}
                  aria-pressed={item.id === definition.id}
                  onClick={() => setSelectedId(item.id)}
                >
                  <small>{categoryNames[item.category]}</small>
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <div className="export-workspace">
          <Card className="export-parameters">
            <p className="eyebrow">Figura seleccionada · {categoryNames[definition.category]}</p>
            <h2>{definition.name}</h2>
            <p>{definition.description}</p>
            {definition.parameters.length ? (
              <>
                <div className="export-fields" key={`${definition.id}-${revision}`}>
                  {definition.parameters.map((spec) => (
                    <ParameterField
                      key={spec.key}
                      spec={spec}
                      value={values[spec.key]}
                      validate={(candidate) =>
                        resolveFigure(definition.id, { ...values, [spec.key]: candidate })
                      }
                      onCommit={(value) => commit(spec.key, value)}
                    />
                  ))}
                </div>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setValuesById((current) => ({
                      ...current,
                      [definition.id]: defaultValues(definition),
                    }));
                    setRevision((current) => current + 1);
                  }}
                >
                  <RotateCcw aria-hidden="true" size={16} /> Restablecer parámetros
                </Button>
              </>
            ) : (
              <p>Esta figura usa parámetros fijos del ejemplo académico.</p>
            )}
          </Card>

          <Card className="export-output">
            <ExportPanel
              figureId={definition.id}
              values={values}
              options={options}
              onOptionsChange={setOptions}
            />
          </Card>

          <Card className="export-package">
            <p className="eyebrow">Opcional</p>
            <h2>Paquete de figuras</h2>
            <p>
              Un archivo ZIP con PNG, SVG, CSV estándar y ficha de las {figureRegistry.length}{' '}
              figuras, con sus parámetros iniciales, tema {themes[options.theme].name} y PNG de{' '}
              {size.width} × {size.height} px.
            </p>
            <div className="export-actions">
              <Button variant="secondary" onClick={downloadPackage} disabled={packaging}>
                <Package aria-hidden="true" size={16} /> Descargar paquete
              </Button>
              <p className="export-status" role="status">
                {packageStatus}
              </p>
              {packageError && (
                <p className="export-error" role="alert">
                  {packageError}
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>

      <Card className="model-note">
        <strong>Antes de insertar una figura:</strong> copie su ficha y asigne la numeración en el
        documento. Las figuras representan un modelo hipotético y provisional, no mediciones reales.
      </Card>
    </div>
  );
}
