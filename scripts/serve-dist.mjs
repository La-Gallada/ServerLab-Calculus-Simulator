/**
 * Servidor estático local para las pruebas E2E. Sirve `dist/` aplicando
 * `dist/_headers` e imita dos comportamientos de Cloudflare Pages: no publica ese
 * archivo y responde `index.html` ante rutas desconocidas. No es una réplica
 * completa de Cloudflare ni se usa en producción.
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { gzipSync } from 'node:zlib';
import { parseArgs } from 'node:util';

const { values } = parseArgs({
  options: {
    host: { type: 'string', default: '127.0.0.1' },
    port: { type: 'string', default: '4173' },
    root: { type: 'string', default: 'dist' },
  },
});

const root = resolve(values.root);
if (!existsSync(join(root, 'index.html'))) {
  console.error(`No existe ${values.root}/index.html. Ejecute antes «npm run build».`);
  process.exit(1);
}

/** Reglas «patrón + encabezados indentados»; `*` coincide con cualquier texto. */
function parseHeaders(text) {
  const rules = [];
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    if (!/^\s/.test(line)) {
      const pattern = line.trim().replace(/[.+?^${}()|[\]\\]/g, '\\$&');
      rules.push({ match: new RegExp(`^${pattern.replace(/\*/g, '.*')}$`), headers: [] });
      continue;
    }
    const separator = line.indexOf(':');
    if (!rules.length || separator < 0) throw new Error(`Línea no válida en _headers: ${line}`);
    rules.at(-1).headers.push([line.slice(0, separator).trim(), line.slice(separator + 1).trim()]);
  }
  return rules;
}

const headersFile = join(root, '_headers');
const rules = existsSync(headersFile) ? parseHeaders(readFileSync(headersFile, 'utf8')) : [];

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.ico': 'image/vnd.microsoft.icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
};

createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    let file = normalize(join(root, pathname));
    const inside = file === root || file.startsWith(root + sep);
    const isFile = inside && file !== headersFile && (await stat(file).catch(() => null))?.isFile();
    if (!isFile) file = join(root, 'index.html');
    let body = await readFile(file);
    const type = types[extname(file)] ?? 'application/octet-stream';
    response.setHeader('Content-Type', type);
    response.setHeader('Cache-Control', 'no-store');
    for (const rule of rules)
      if (rule.match.test(pathname))
        for (const [name, value] of rule.headers) response.setHeader(name, value);
    if (/^text\//.test(type) && /\bgzip\b/.test(request.headers['accept-encoding'] ?? '')) {
      body = gzipSync(body);
      response.setHeader('Content-Encoding', 'gzip');
    }
    response.setHeader('Content-Length', body.length);
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch {
    response.statusCode = 400;
    response.end('Solicitud no válida');
  }
}).listen(Number(values.port), values.host, () =>
  console.log(`dist con _headers en http://${values.host}:${values.port}`),
);
