import { lazy, Suspense, useState } from 'react';
import { Download } from 'lucide-react';
import type { ParameterValues } from '../../export/types';
import type { ExportDialogProps } from './ExportDialog';

function LoadError({ onClose }: ExportDialogProps) {
  return (
    <span role="alert">
      No fue posible cargar la exportación. Recargue la página.{' '}
      <button type="button" onClick={onClose}>
        Cerrar
      </button>
    </span>
  );
}

// El generador se descarga sólo cuando alguien exporta.
const ExportDialog = lazy(() => import('./ExportDialog').catch(() => ({ default: LoadError })));

interface ExportButtonProps {
  figureId: string;
  values?: ParameterValues;
  /** Nombre accesible; debe comenzar con «Exportar». */
  label: string;
}

export function ExportButton({ figureId, values = {}, label }: ExportButtonProps) {
  // Se fotografían los parámetros al abrir para que el diálogo sea estable.
  const [snapshot, setSnapshot] = useState<ParameterValues | null>(null);
  return (
    <div className="export-row">
      <button
        type="button"
        className="export-trigger"
        aria-label={label}
        aria-haspopup="dialog"
        onClick={() => setSnapshot({ ...values })}
      >
        <Download aria-hidden="true" size={15} /> Exportar
      </button>
      {snapshot && (
        <Suspense fallback={<span role="status">Preparando exportación…</span>}>
          <ExportDialog figureId={figureId} values={snapshot} onClose={() => setSnapshot(null)} />
        </Suspense>
      )}
    </div>
  );
}
