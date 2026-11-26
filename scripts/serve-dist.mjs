import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.pdf': 'application/pdf',
  '.webm': 'video/webm',
  '.mp4': 'video/mp4',
  '.woff2': 'font/woff2',
};

export function createDistServer(distDir, basePath = process.env.BASE_PATH ?? '/personal-website') {
  const normBase = !basePath || basePath === '/' ? '' : `/${basePath.replace(/^\/+|\/+$/g, '')}`;

  return http.createServer((req, res) => {
    const rawUrl = (req.url || '/').split('?')[0];
    let relPath = decodeURIComponent(rawUrl);
    if (normBase && relPath.startsWith(normBase)) {
      relPath = relPath.slice(normBase.length) || '/';
    }

    let filePath = path.join(distDir, relPath);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    } else if (!fs.existsSync(filePath) && !path.extname(filePath)) {
      const idxPath = path.join(filePath, 'index.html');
      if (fs.existsSync(idxPath)) filePath = idxPath;
    }

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      const notFound = path.join(distDir, '404.html');
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(fs.existsSync(notFound) ? fs.readFileSync(notFound) : 'Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  });
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}` || process.argv[1]?.endsWith('serve-dist.mjs')) {
  const port = Number(process.argv[2] || 4322);
  const distDir = path.resolve(process.cwd(), 'dist');
  const server = createDistServer(distDir);
  server.listen(port, '127.0.0.1', () => {
    console.log(`Serving ${distDir} on http://127.0.0.1:${port}`);
  });
}
