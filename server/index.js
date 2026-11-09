// K-bot 自定義 Node 服務器
// 同端口同時提供靜態資產、React Router SSR/API 與豆包 ASR WebSocket
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequestListener } from '@react-router/node';
import { attachASRProxy } from './asr-proxy.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BUILD_PATH = path.join(ROOT, 'build', 'server', 'index.js');
const CLIENT_DIR = path.join(ROOT, 'build', 'client');
const PORT = Number(process.env.PORT || 8080);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.wasm': 'application/wasm',
};

function serveStatic(req, res, next) {
  const url = new URL(req.url, 'http://localhost');
  const pathname = decodeURIComponent(url.pathname);
  const resolved = path.normalize(path.join(CLIENT_DIR, pathname));

  // 防止目錄穿越
  if (!resolved.startsWith(CLIENT_DIR)) {
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  }

  fs.stat(resolved, (err, stat) => {
    if (err || !stat.isFile()) {
      next();
      return;
    }
    const ext = path.extname(resolved).toLowerCase();
    res.statusCode = 200;
    res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
    res.setHeader('Content-Length', stat.size);
    fs.createReadStream(resolved).pipe(res);
  });
}

async function start() {
  const build = await import(BUILD_PATH);

  const requestHandler = createRequestListener({
    build,
    mode: process.env.NODE_ENV || 'production',
  });

  const server = http.createServer((req, res) => {
    res.setHeader('X-Kbot-Server', 'custom-node-0d12f6a');
    // 兜底：部分代理層不會觸發 upgrade 事件，在 request 層直接處理 WebSocket 握手
    if (asrInfo.isASRPath(req.url)) {
      console.error('[asr-headers]', JSON.stringify(req.headers));
    }
    if (req.headers.upgrade && asrInfo.isASRPath(req.url)) {
      asrInfo.handleUpgrade(req, req.socket, Buffer.alloc(0));
      return;
    }

    serveStatic(req, res, () => {
      requestHandler(req, res);
    });
  });

  const asrInfo = attachASRProxy(server);

  server.listen(PORT, () => {
    console.error(`K-bot server listening on ${PORT}, ASR mode: ${asrInfo.mode}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server:', err);
  process.exit(1);
});
