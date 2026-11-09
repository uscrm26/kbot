import { websiteOperations } from '~/lib/server/database';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { LoaderFunctionArgs } from 'react-router';

// 基於當前模塊位置定位項目根目錄
// 當前文件位於 app/routes/，項目根目錄是往上兩層
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

// 網站保存目錄
const WEBSITES_DIR = process.env.WEBSITES_DIR || path.join(PROJECT_ROOT, 'data', 'websites');

// 網站預覽路由
export async function loader({ request, params }: LoaderFunctionArgs) {
  const websiteId = params.id;

  if (!websiteId) {
    return new Response('Website not found', { status: 404 });
  }

  // 查詢網站
  const website = websiteOperations.findById(Number(websiteId));

  if (!website || website.status === 'disabled') {
    return new Response('Website not found', { status: 404 });
  }

  // 獲取請求路徑
  const url = new URL(request.url);
  let filePath = url.pathname.replace(`/preview/${websiteId}`, '');
  
  if (filePath === '/' || filePath === '') {
    filePath = '/index.html';
  }

  // 構建文件路徑
  const fullPath = path.join(WEBSITES_DIR, websiteId, filePath);

  // 檢查文件是否存在
  if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
    // 如果是目錄，嘗試加載 index.html
    const indexPath = path.join(fullPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      return serveFile(indexPath);
    }
    return new Response('File not found', { status: 404 });
  }

  return serveFile(fullPath);
}

// 服務文件
function serveFile(filePath: string) {
  const content = fs.readFileSync(filePath);
  
  // 根據文件擴展名設置 Content-Type
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
  };

  const contentType = mimeTypes[ext] || 'application/octet-stream';

  return new Response(content, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
