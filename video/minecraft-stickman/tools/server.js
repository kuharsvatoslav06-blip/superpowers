// Tiny zero-dependency static file server used by the preview player and the renderer.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript',
  '.json': 'application/json', '.css': 'text/css', '.woff2': 'font/woff2', '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg', '.png': 'image/png', '.jpg': 'image/jpeg', '.mp4': 'video/mp4',
};

export function startServer(port = 0) {
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p === '/' || p === '/index.html') { res.writeHead(302, { Location: '/src/index.html' + (req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '') }).end(); return; }
    const file = path.join(ROOT, path.normalize(p));
    if (!file.startsWith(ROOT)) { res.writeHead(403).end(); return; }
    fs.stat(file, (err, st) => {
      if (err || !st.isFile()) { res.writeHead(404).end('not found'); return; }
      const type = TYPES[path.extname(file)] || 'application/octet-stream';
      const range = req.headers.range;
      if (range) { // needed so <audio> can seek in the preview player
        const [a, b] = range.replace('bytes=', '').split('-');
        const start = +a, end = b ? +b : st.size - 1;
        res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${st.size}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1 });
        fs.createReadStream(file, { start, end }).pipe(res);
      } else {
        res.writeHead(200, { 'Content-Type': type, 'Content-Length': st.size, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-cache' });
        fs.createReadStream(file).pipe(res);
      }
    });
  });
  return new Promise(resolve => server.listen(port, '127.0.0.1', () => resolve(server)));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = +(process.argv[2] || 8080);
  startServer(port).then(() => console.log(`Preview: http://localhost:${port}/  (Ctrl+C to stop)`));
}
