import { formatters } from '../../math';
import { useDraftNumber } from '../shared/useDraftNumber';
import { parseThreshold, thresholdRange } from './optimizationInput';

interface ThresholdFieldProps {
  value: number;
  onCommit: (value: number) => void;
}

/** El componente padre lo remonta cuando el umbral cambia por otra vía. */
export function ThresholdField({ value, onCommit }: ThresholdFieldProps) {
  const { error, pending, inputProps } = useDraftNumber({
    value,
    validate: parseThreshold,
    onCommit,
  });

  return (
    <div className="opt-field">
      <div className="opt-field__row">
        <label htmlFor="opt-threshold-number">Valor exacto de L (ms)</label>
        <input id="opt-threshold-number" aria-describedby="opt-threshold-help" {...inputProps} />
      </div>
      <div className="opt-field__message" id="opt-threshold-help">
        {error ? (
          <p className="opt-field__error" role="alert">
            {error} Se conserva L = {formatters.milliseconds(value)}.
          </p>
        ) : (
          <p>
            {pending
              ? 'Sin aplicar: presione Enter o salga del campo. Escape cancela.'
              : `De ${thresholdRange.fieldMinMs} a ${formatters.milliseconds(thresholdRange.fieldMaxMs)}. Miles sin separador o con espacio. Enter aplica.`}
          </p>
        )}
      </div>
    </div>
  );
}
