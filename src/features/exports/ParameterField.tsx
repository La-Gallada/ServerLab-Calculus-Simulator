import { useState } from 'react';
import { parseParameter } from '../../export/registry';
import type { ParameterSpec } from '../../export/types';
import type { MathResult } from '../../math';

interface ParameterFieldProps {
  spec: ParameterSpec;
  value: number | string;
  /** Comprueba el candidato junto con los demás parámetros mediante el motor. */
  validate: (candidate: number | string) => MathResult<unknown>;
  onCommit: (value: number | string) => void;
}

const asText = (value: number | string) => String(value).replace('.', ',');

/** El texto es un borrador: sólo se aplica con Enter o al salir del campo. */
export function ParameterField({ spec, value, validate, onCommit }: ParameterFieldProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const id = `export-parameter-${spec.key}`;

  if (spec.kind === 'select')
    return (
      <div className="export-field">
        <label htmlFor={id}>{spec.label}</label>
        <select
          id={id}
          value={String(value)}
          onChange={(event) => {
            const option = spec.options.find((o) => String(o.value) === event.target.value);
            if (option) onCommit(option.value);
          }}
        >
          {spec.options.map((option) => (
            <option key={option.value} value={String(option.value)}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );

  function confirm() {
    if (draft === null) return;
    const parsed = parseParameter(spec, draft);
    const checked = parsed.ok ? validate(parsed.value) : parsed;
    if (!parsed.ok || !checked.ok) {
      setError(checked.ok ? '' : checked.error.message);
      return;
    }
    setDraft(null);
    setError(null);
    onCommit(parsed.value);
  }

  return (
    <div className="export-field">
      <label htmlFor={id}>
        {spec.label}
        {spec.unit && !spec.label.includes('(') ? ` (${spec.unit})` : ''}
      </label>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={draft ?? asText(value)}
        aria-invalid={error !== null}
        aria-describedby={`${id}-help`}
        onChange={(event) => {
          setDraft(event.target.value);
          setError(null);
        }}
        onBlur={confirm}
        onKeyDown={(event) => {
          if (event.key === 'Enter') confirm();
          if (event.key === 'Escape') {
            setDraft(null);
            setError(null);
          }
        }}
      />
      <div className="export-field__message" id={`${id}-help`}>
        {error !== null ? (
          <p role="alert">
            {error} Se conserva {asText(value)}.
          </p>
        ) : (
          <p>
            {draft !== null && draft !== asText(value)
              ? 'Sin aplicar: presione Enter o salga del campo.'
              : `De ${spec.min} a ${spec.max}.`}
          </p>
        )}
      </div>
    </div>
  );
}
