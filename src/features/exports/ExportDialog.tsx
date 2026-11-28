import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { findDefinition } from '../../export/registry';
import type { ParameterValues } from '../../export/types';
import { initialExportOptions } from './exportOptions';
import { ExportPanel } from './ExportPanel';

export interface ExportDialogProps {
  figureId: string;
  /** Parámetros actuales del laboratorio; se muestran, no se editan aquí. */
  values: ParameterValues;
  onClose: () => void;
}

export default function ExportDialog({ figureId, values, onClose }: ExportDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [options, setOptions] = useState(initialExportOptions);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || dialog.open) return;
    // `showModal` atrapa el foco y habilita Escape; el atributo es sólo respaldo.
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }, []);

  function close() {
    // Cerrar de forma nativa devuelve el foco al botón que abrió el diálogo.
    if (typeof ref.current?.close === 'function') ref.current.close();
    else onClose();
  }

  return (
    <dialog
      ref={ref}
      className="export-dialog"
      aria-labelledby="export-dialog-title"
      onClose={onClose}
    >
      <div className="export-dialog__header">
        <div>
          <p className="eyebrow">Exportar figura</p>
          <h2 id="export-dialog-title">{findDefinition(figureId)?.name}</h2>
        </div>
        <Button variant="ghost" aria-label="Cerrar exportación" onClick={close}>
          <X aria-hidden="true" />
        </Button>
      </div>
      <p className="export-dialog__note">
        Usa los parámetros actuales de esta pantalla. Para cambiarlos, ciérrela y ajuste los
        controles.
      </p>
      <ExportPanel
        figureId={figureId}
        values={values}
        options={options}
        onOptionsChange={setOptions}
      />
    </dialog>
  );
}
