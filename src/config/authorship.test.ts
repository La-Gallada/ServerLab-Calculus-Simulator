import { describe, expect, it } from 'vitest';
import { academicRecord, authorshipNote } from '../export/metadata';
import { resolveFigure } from '../export/registry';
import { renderSvg } from '../export/svg/renderSvg';
import packageText from '../../package.json?raw';
import { appVersion, authorshipLines, teamName } from './authorship';

const pkg = JSON.parse(packageText) as {
  version: string;
  author: string;
};

describe('autoría colectiva y versión', () => {
  it('mantiene la versión candidata y la autoría de package.json', () => {
    expect(pkg.version).toBe(appVersion);
    expect(appVersion).toMatch(/-rc\.\d+$/);
    expect(pkg.author).toBe(teamName);
  });

  it('usa la nota autorizada en fichas y la identificación en las figuras', () => {
    expect(authorshipNote).toBe(
      'Nota. Elaboración propia del Grupo #4 mediante ServerLab, a partir del modelo matemático hipotético del proyecto de investigación.',
    );
    const figure = resolveFigure('integrals-rate-area');
    if (!figure.ok) throw new Error(figure.error.message);
    const record = academicRecord(figure.value);
    expect(record).toContain(authorshipNote);
    for (const line of authorshipLines) expect(record).toContain(line);
    expect(renderSvg(figure.value)).toContain('ServerLab · Grupo #4 ·');
  });
});
