/** Escritor ZIP mínimo sin compresión (método «store»), suficiente para el paquete. */
export interface ZipEntry {
  path: string;
  data: Uint8Array;
}

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  return value >>> 0;
});

export function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of data) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

/** Cabecera binaria a partir de pares [bytes, valor] en orden little-endian. */
function header(fields: [2 | 4, number][]) {
  const bytes = new Uint8Array(fields.reduce((sum, [length]) => sum + length, 0));
  const view = new DataView(bytes.buffer);
  let offset = 0;
  for (const [length, value] of fields) {
    if (length === 2) view.setUint16(offset, value, true);
    else view.setUint32(offset, value, true);
    offset += length;
  }
  return bytes;
}

export function createZip(entries: ZipEntry[], date: Date = new Date()): Uint8Array<ArrayBuffer> {
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1);
  const day =
    ((Math.max(1980, date.getFullYear()) - 1980) << 9) |
    ((date.getMonth() + 1) << 5) |
    date.getDate();
  const utf8Names = 0x0800;
  const parts: Uint8Array[] = [];
  const directory: Uint8Array[] = [];
  let offset = 0;
  for (const entry of entries) {
    const name = new TextEncoder().encode(entry.path);
    const crc = crc32(entry.data);
    const size = entry.data.length;
    const local = header([
      [4, 0x04034b50],
      [2, 20],
      [2, utf8Names],
      [2, 0],
      [2, time],
      [2, day],
      [4, crc],
      [4, size],
      [4, size],
      [2, name.length],
      [2, 0],
    ]);
    directory.push(
      header([
        [4, 0x02014b50],
        [2, 20],
        [2, 20],
        [2, utf8Names],
        [2, 0],
        [2, time],
        [2, day],
        [4, crc],
        [4, size],
        [4, size],
        [2, name.length],
        [2, 0],
        [2, 0],
        [2, 0],
        [2, 0],
        [4, 0],
        [4, offset],
      ]),
      name,
    );
    parts.push(local, name, entry.data);
    offset += local.length + name.length + size;
  }
  const directorySize = directory.reduce((sum, part) => sum + part.length, 0);
  const end = header([
    [4, 0x06054b50],
    [2, 0],
    [2, 0],
    [2, entries.length],
    [2, entries.length],
    [4, directorySize],
    [4, offset],
    [2, 0],
  ]);
  const all = [...parts, ...directory, end];
  const output = new Uint8Array(all.reduce((sum, part) => sum + part.length, 0));
  let position = 0;
  for (const part of all) {
    output.set(part, position);
    position += part.length;
  }
  return output;
}
