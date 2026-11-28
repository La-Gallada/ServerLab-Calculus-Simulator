export const resolutions = [
  { id: 'standard', name: 'Estándar', width: 1200, height: 800 },
  { id: 'high', name: 'Alta resolución', width: 2400, height: 1600 },
  { id: 'max', name: 'Máxima resolución', width: 3600, height: 2400 },
] as const;

export type ResolutionId = (typeof resolutions)[number]['id'];
export const defaultResolution: ResolutionId = 'high';

export const resolutionById = (id: ResolutionId) =>
  resolutions.find((resolution) => resolution.id === id) ?? resolutions[1];

/**
 * Rasteriza un SVG autónomo en el navegador. El SVG debe declarar ya el tamaño
 * final para que el trazado vectorial se calcule a esa resolución.
 */
export async function svgToPng(
  svg: string,
  size: { width: number; height: number },
): Promise<Blob> {
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
  const canvas = document.createElement('canvas');
  try {
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('El navegador no pudo interpretar el SVG.'));
      image.src = url;
    });
    canvas.width = size.width;
    canvas.height = size.height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('El navegador no permite generar la imagen (canvas).');
    context.drawImage(image, 0, 0, size.width, size.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob || blob.size === 0)
      throw new Error('La imagen resultó vacía; pruebe una resolución menor.');
    return blob;
  } finally {
    URL.revokeObjectURL(url);
    // Libera la memoria del lienzo sin esperar al recolector.
    canvas.width = 0;
    canvas.height = 0;
  }
}
