import { useState, type KeyboardEvent } from 'react';
import type { MathResult } from '../../math';
import { editableText } from './numberInput';

interface Options {
  value: number | string;
  /** Interpreta y valida el texto completo. */
  validate: (text: string) => MathResult<number | string>;
  onCommit: (value: number) => void;
  /** Cambia cuando algo externo debe descartar el borrador. */
  context?: string;
}

/**
 * Borrador de texto separado del valor confirmado: sólo se aplica con Enter o al
 * salir del campo, y Escape lo descarta. Un borrador inválido se conserva para
 * poder corregirlo y no modifica el valor.
 */
export function useDraftNumber({ value, validate, onCommit, context = '' }: Options) {
  const key = `${value}|${context}`;
  const [draft, setDraft] = useState<{ text: string; error: string | null; key: string } | null>(
    null,
  );
  const current = draft?.key === key ? draft : null;
  const confirmed = editableText(value);

  function confirm() {
    if (!current) return;
    const result = validate(current.text);
    if (!result.ok) {
      setDraft({ ...current, error: result.error.message });
      return;
    }
    setDraft(null);
    onCommit(Number(result.value));
  }

  return {
    error: current?.error ?? null,
    pending: current !== null && current.text !== confirmed,
    inputProps: {
      type: 'text' as const,
      inputMode: 'decimal' as const,
      autoComplete: 'off',
      value: current?.text ?? confirmed,
      'aria-invalid': Boolean(current?.error),
      onChange: (event: { target: { value: string } }) =>
        setDraft({ text: event.target.value, error: null, key }),
      onBlur: confirm,
      onKeyDown: (event: KeyboardEvent) => {
        if (event.key === 'Enter') confirm();
        if (event.key === 'Escape') setDraft(null);
      },
    },
  };
}
