import { useState } from 'react';
import { mathModelConfig } from '../../config/model';
import { formatters, type MathResult } from '../../math';

interface LimitControlProps {
  symbol: 'a' | 'b';
  label: string;
  value: number;
  /** Rango que respeta 0 ≤ a ≤ b ≤ máximo. */
  allowed: { min: number; max: number };
  /** Valida un candidato mediante el motor matemático. */
  validate: (candidate: number) => MathResult<number>;
  onCommit: (value: number) => void;
}

interface Draft {
  text: string;
  error: string | null;
  /** Valor vigente al escribir; si cambia por otra vía, el borrador se descarta. */
  basedOn: number;
  editing: boolean;
}

const decimalPattern = /^-?\d+([.,]\d{1,2})?$/;
const asText = (value: number) => String(value).replace('.', ',');

export function LimitControl({
  symbol,
  label,
  value,
  allowed,
  validate,
  onCommit,
}: LimitControlProps) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const current = draft && draft.basedOn === value ? draft : null;
  const maximum = mathModelConfig.transfer.maximumTimeSeconds;
  const id = `integral-limit-${symbol}`;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  function changeSlider(raw: number) {
    // Desde un valor decimal, las flechas avanzan al entero contiguo en su dirección.
    const whole = Number.isInteger(value)
      ? Math.round(raw)
      : raw < value
        ? Math.floor(raw)
        : Math.ceil(raw);
    setDraft(null);
    onCommit(Math.min(allowed.max, Math.max(allowed.min, whole)));
  }

  function changeText(text: string) {
    const trimmed = text.trim();
    if (!decimalPattern.test(trimmed)) {
      setDraft({
        text,
        error: 'Escriba un número con un máximo de dos decimales.',
        basedOn: value,
        editing: true,
      });
      return;
    }
    // La suma normaliza -0.
    const candidate = Number(trimmed.replace(',', '.')) + 0;
    const result = validate(candidate);
    if (!result.ok) {
      setDraft({ text, error: result.error.message, basedOn: value, editing: true });
      return;
    }
    setDraft({ text, error: null, basedOn: candidate, editing: true });
    onCommit(candidate);
  }

  function leaveField() {
    // La entrada inválida se descarta, pero el aviso permanece visible.
    setDraft(current?.error ? { ...current, editing: false } : null);
  }

  const error = current?.error;

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
        max={maximum}
        step={Number.isInteger(value) ? 1 : 'any'}
        value={value}
        aria-describedby={hintId}
        aria-valuetext={`${formatters.seconds(value)}`}
        onChange={(event) => changeSlider(Number(event.target.value))}
      />
      <div className="limit-control__field">
        <label htmlFor={`${id}-number`}>Valor exacto de {symbol} (s)</label>
        <input
          id={`${id}-number`}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={current?.editing ? current.text : asText(value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${errorId} ${hintId}` : hintId}
          onChange={(event) => changeText(event.target.value)}
          onBlur={leaveField}
        />
      </div>
      <p className="limit-control__hint" id={hintId}>
        Permitido: de {formatters.seconds(allowed.min)} a {formatters.seconds(allowed.max)}.
      </p>
      {error && (
        <p className="limit-control__error" id={errorId} role="alert">
          {error} Se conserva {symbol} = {formatters.seconds(value)}.
        </p>
      )}
    </div>
  );
}
