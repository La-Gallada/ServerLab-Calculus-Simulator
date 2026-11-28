/** Entrega un archivo generado localmente; no envía datos a ningún servicio. */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  // Se revoca después de que el navegador haya iniciado la descarga.
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
