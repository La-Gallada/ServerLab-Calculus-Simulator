import { describe, expect, it } from 'vitest';
import { formatters } from '../../math';
import { editableText, parseDecimal } from './numberInput';

describe('lectura regional de números', () => {
  it.each([
    ['0', 0],
    ['-0', 0],
    ['1000', 1000],
    ['1 000', 1000],
    ['1\u00a0000', 1000],
    ['1\u202f000,25', 1000.25],
    ['25 000.5', 25000.5],
    ['1 234 567', 1234567],
    ['1000,5', 1000.5],
    ['1000.50', 1000.5],
    ['  -7,25 ', -7.25],
  ])('acepta «%s»', (text, value) => {
    expect(parseDecimal(text)).toEqual({ ok: true, value });
  });

  it.each(['1.000', '1,000', '10.000,5', '1,000.5', '1.000.000', '12,345'])(
    'rechaza como ambiguo «%s»',
    (text) => {
      const result = parseDecimal(text);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.message).toContain('ambiguo');
    },
  );

  it.each([
    '',
    ' ',
    'abc',
    '1 00',
    '10 0000',
    '1 000 00',
    '5,',
    ',5',
    '1e3',
    '0x10',
    'NaN',
    'Infinity',
    '1,2345',
    '--1',
    '9'.repeat(400),
  ])('rechaza «%s»', (text) => expect(parseDecimal(text).ok).toBe(false));

  it('acepta lo que la propia interfaz muestra', () => {
    for (const value of [0, 66.67, 1000, 19900, 25000]) {
      const shown = formatters.milliseconds(value).replace(/\s?ms$/, '');
      expect(parseDecimal(shown)).toEqual({ ok: true, value });
      expect(parseDecimal(editableText(value))).toEqual({ ok: true, value });
    }
  });
});
