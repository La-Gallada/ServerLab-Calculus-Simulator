import { maximumTransferSeconds } from '../../config/domain';
import { formatters, type MathResult } from '../../math';
import { parseDecimal } from '../shared/numberInput';
import { useDraftNumber } from '../shared/useDraftNumber';

interface LimitControlProps {
  symbol: 'a' | 'b';
  label: string;
  value: number;
  /** Rango que respeta 0 ≤ a ≤ b ≤ máximo. */
  allowed: { min: number; max: number };
  /** Valida un candidato mediante el motor matemático. */
  validate: (candidate: number) => MathResult<number>;
  onCommit: (value: number) => void;
  /** Cambia cuando el intervalo se modifica por otra vía. */
  context: string;
}

export function LimitControl({
  symbol,
  label,
  value,
  allowed,
  validate,
  onCommit,
  context,
}: LimitControlProps) {
  const id = `integral-limit-${symbol}`;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const { error, pending, inputProps } = useDraftNumber({
    value,
    context,
    onCommit,
    validate: (text) => {
      const parsed = parseDecimal(text);
      if (!parsed.ok) return parsed;
      const checked = validate(parsed.value);
      return checked.ok ? parsed : checked;
    },
  });

  function changeSlider(raw: number) {
    // Desde un valor decimal, las flechas avanzan al entero contiguo en su dirección.
    const whole = Number.isInteger(value)
      ? Math.round(raw)
      : raw < value
        ? Math.floor(raw)
        : Math.ceil(raw);
    onCommit(Math.min(allowed.max, Math.max(allowed.min, whole)));
  }

  return (
    <div className="limit-control">
      <div className="limit-control__heading">
        <label htmlFor={id}>
          {label} ({symbol})
        </label>
        <output htmlFor={id}>{formatters.seconds(value)}</output>
      </div>
      <input
        id={id}
        type="range"
        min="0"
        max={maximumTransferSeconds}
        step={Number.isInteger(value) ? 1 : 'any'}
        value={value}
        aria-describedby={hintId}
        aria-valuetext={formatters.seconds(value)}
        onChange={(event) => changeSlider(Number(event.target.value))}
      />
      <div className="limit-control__field">
        <label htmlFor={`${id}-number`}>Valor exacto de {symbol} (s)</label>
        <input
          id={`${id}-number`}
          aria-describedby={error ? `${errorId} ${hintId}` : hintId}
          {...inputProps}
        />
      </div>
      <p className="limit-control__hint" id={hintId}>
        Permitido: de {formatters.seconds(allowed.min)} a {formatters.seconds(allowed.max)}.{' '}
        {pending && !error
          ? 'Sin aplicar: presione Enter o salga del campo. Escape cancela.'
          : 'Enter aplica.'}
      </p>
      {/* Espacio reservado para que el aviso no desplace los controles siguientes. */}
      <div className="limit-control__message">
        {error && (
          <p className="limit-control__error" id={errorId} role="alert">
            {error} Se conserva {symbol} = {formatters.seconds(value)}.
          </p>
        )}
      </div>
    </div>
  );
}
