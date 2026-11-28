import type { CsvVariant } from '../../export/csv';
import type { ExportFormat } from '../../export/filenames';
import { defaultResolution, type ResolutionId } from '../../export/png';
import type { ThemeId } from '../../export/types';

export interface ExportOptions {
  theme: ThemeId;
  format: ExportFormat;
  resolution: ResolutionId;
  csvVariant: CsvVariant;
}

export const initialExportOptions: ExportOptions = {
  theme: 'academic',
  format: 'png',
  resolution: defaultResolution,
  csvVariant: 'standard',
};
