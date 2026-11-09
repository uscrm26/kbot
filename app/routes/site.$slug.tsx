import { websiteOperations } from '~/lib/server/database';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { LoaderFunctionArgs } from 'react-router';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const WEBSITES_DIR = process.env.WEBSITES_DIR || path.join(PROJECT_ROOT, 'data', 'websites');

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

// 公開網站托管路由
export async function loader({ request, params }: LoaderFunctionArgs) {
  const slug = params.slug;

  if (!slug) {
    return new Response('Site not found', { status: 404 });
  }

  const website = websiteOperations.findBySlug(slug);

  if (!website || website.status !== 'published') {
    return new Response('Site not found', { status: 404 });
  }

  const url = new URL(request.url);
  let filePath = url.pathname.replace(`/site/${slug}`, '');

  if (filePath === '/' || filePath === '') {
    filePath = '/index.html';
  }

  const baseDir = path.join(WEBSITES_DIR, website.id.toString());
  let fullPath = path.join(baseDir, filePath);

  if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
    const indexPath = path.join(fullPath, 'index.html');

    if (fs.existsSync(indexPath)) {
      fullPath = indexPath;
    } else {
      return new Response('File not found', { status: 404 });
    }
  }

  const content = fs.readFileSync(fullPath);
  const ext = path.extname(fullPath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  return new Response(content, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
