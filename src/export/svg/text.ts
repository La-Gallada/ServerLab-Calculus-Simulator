/** Elimina caracteres que XML 1.0 no admite y escapa los reservados. */
export function escapeXml(value: string): string {
  return (
    value
      // eslint-disable-next-line no-control-regex
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g, '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  );
}

/**
 * Anchura aproximada (en unidades del lienzo) de un texto en Arial/Helvetica.
 * Se estima por exceso para reservar espacio sin medir en el DOM.
 */
export function textWidth(text: string, fontSize: number, bold = false): number {
  let em = 0;
  for (const char of text) {
    if (/[ .,:;'|!il·′]/.test(char)) em += 0.3;
    else if (/[fjrt()[\]-]/.test(char)) em += 0.38;
    else if (/[mwMW%@]/.test(char)) em += 0.9;
    else if (/[A-ZÁÉÍÓÚÑ]/.test(char)) em += 0.72;
    else if (/[→≤≥≈=+−∞∫]/.test(char)) em += 0.65;
    else em += 0.57;
  }
  return em * fontSize * (bold ? 1.07 : 1);
}

/** Divide por palabras para que cada línea quepa en `maxWidth`. */
export function wrapText(text: string, fontSize: number, maxWidth: number, bold = false) {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && textWidth(candidate, fontSize, bold) > maxWidth) {
      lines.push(line);
      line = word;
    } else line = candidate;
  }
  if (line) lines.push(line);
  return lines;
}
