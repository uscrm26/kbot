import { websiteOperations } from '~/lib/server/database';
import type { LoaderFunctionArgs } from 'react-router';

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
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
  '.txt': 'text/plain; charset=utf-8',
};

function getExtension(filePath: string): string {
  const clean = filePath.split('?')[0].split('#')[0];
  const dot = clean.lastIndexOf('.');
  return dot >= 0 ? clean.slice(dot).toLowerCase() : '';
}

function normalizeKey(filePath: string): string {
  return filePath.replace(/^\/+/, '').replace(/\/+$/, '');
}

// 公開網站托管路由，直接從網站記錄中的檔案提供內容
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
  let requestedPath = decodeURIComponent(url.pathname.replace(`/site/${slug}`, ''));

  if (requestedPath === '' || requestedPath === '/') {
    requestedPath = '/index.html';
  }

  const files = website.files || {};
  let key = normalizeKey(requestedPath);
  let content = files[key];

  // 支援無結尾斜線或省略 index.html 的路徑
  if (content === undefined) {
    const fallbackKey = normalizeKey(`${requestedPath}/index.html`);
    content = files[fallbackKey];

    if (content !== undefined) {
      key = fallbackKey;
    }
  }

  if (content === undefined) {
    return new Response('File not found', { status: 404 });
  }

  const contentType = MIME_TYPES[getExtension(key)] || 'application/octet-stream';

  return new Response(content, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
