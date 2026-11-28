import { parseParameter } from '../../export/registry';
import type { ParameterSpec } from '../../export/types';
import type { MathResult } from '../../math';
import { editableText } from '../shared/numberInput';
import { useDraftNumber } from '../shared/useDraftNumber';

interface ParameterFieldProps {
  spec: ParameterSpec;
  value: number | string;
  /** Comprueba el candidato junto con los demás parámetros mediante el motor. */
  validate: (candidate: number | string) => MathResult<unknown>;
  onCommit: (value: number | string) => void;
}

/** El texto es un borrador: sólo se aplica con Enter o al salir del campo. */
export function ParameterField({ spec, value, validate, onCommit }: ParameterFieldProps) {
  const id = `export-parameter-${spec.key}`;
  const { error, pending, inputProps } = useDraftNumber({
    value,
    onCommit,
    validate: (text) => {
      const parsed = parseParameter(spec, text);
      if (!parsed.ok) return parsed;
      const checked = validate(parsed.value);
      return checked.ok ? parsed : checked;
    },
  });

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

  return (
    <div className="export-field">
      <label htmlFor={id}>
        {spec.label}
        {spec.unit && !spec.label.includes('(') ? ` (${spec.unit})` : ''}
      </label>
      <input id={id} aria-describedby={`${id}-help`} {...inputProps} />
      <div className="export-field__message" id={`${id}-help`}>
        {error ? (
          <p role="alert">
            {error} Se conserva {editableText(value)}.
          </p>
        ) : (
          <p>
            {pending
              ? 'Sin aplicar: presione Enter o salga del campo.'
              : `De ${spec.min} a ${spec.max}.`}
          </p>
        )}
      </div>
    </div>
  );
}
