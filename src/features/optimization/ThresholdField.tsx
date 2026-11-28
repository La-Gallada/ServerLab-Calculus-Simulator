import { useState } from 'react';
import { formatters } from '../../math';
import { parseThreshold, thresholdRange } from './optimizationInput';

interface ThresholdFieldProps {
  value: number;
  onCommit: (value: number) => void;
}

const asText = (value: number) => String(value).replace('.', ',');

/**
 * El texto en edición es un borrador independiente del valor confirmado: sólo se
 * aplica con Enter o al salir del campo. El componente padre lo remonta cuando el
 * umbral cambia por otra vía.
 */
export function ThresholdField({ value, onCommit }: ThresholdFieldProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function discard() {
    setDraft(null);
    setError(null);
  }

  function confirm() {
    if (draft === null) return;
    const result = parseThreshold(draft);
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    discard();
    onCommit(result.value);
  }

  return (
    <div className="opt-field">
      <div className="opt-field__row">
        <label htmlFor="opt-threshold-number">Valor exacto de L (ms)</label>
        <input
          id="opt-threshold-number"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={draft ?? asText(value)}
          aria-invalid={Boolean(error)}
          aria-describedby="opt-threshold-help"
          onChange={(event) => {
            setDraft(event.target.value);
            setError(null);
          }}
          onBlur={confirm}
          onKeyDown={(event) => {
            if (event.key === 'Enter') confirm();
            if (event.key === 'Escape') discard();
          }}
        />
      </div>
      <div className="opt-field__message" id="opt-threshold-help">
        {error ? (
          <p className="opt-field__error" role="alert">
            {error} Se conserva L = {formatters.milliseconds(value)}.
          </p>
        ) : (
          <p>
            {draft !== null && draft !== asText(value)
              ? 'Sin aplicar: presione Enter o salga del campo. Escape cancela.'
              : `De ${thresholdRange.fieldMinMs} a ${formatters.milliseconds(thresholdRange.fieldMaxMs)}. Enter aplica.`}
          </p>
        )}
      </div>
    </div>
  );
}
