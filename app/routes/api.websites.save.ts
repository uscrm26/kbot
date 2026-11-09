import { getCurrentUser } from '~/lib/server/auth';
import { checkQuota, deductQuota } from '~/lib/server/quota';
import { websiteOperations } from '~/lib/server/database';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { ActionFunctionArgs } from 'react-router';

// 基於當前模塊位置定位項目根目錄
// 當前文件位於 app/routes/，項目根目錄是往上兩層
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

// 網站保存目錄
const WEBSITES_DIR = process.env.WEBSITES_DIR || path.join(PROJECT_ROOT, 'data', 'websites');

// 確保目錄存在
if (!fs.existsSync(WEBSITES_DIR)) {
  fs.mkdirSync(WEBSITES_DIR, { recursive: true });
}

// 由名稱生成 URL 友好的 slug，保留中文、字母與數字
function slugify(name: string): string {
  const base = name
    .normalize('NFKC')
    .trim()
    .replace(/[^\w\u3400-\u9fff\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || `site-${Date.now()}`;
}

// 確保 slug 在當前數據庫中唯一
function uniqueSlug(name: string): string {
  const base = slugify(name);
  let candidate = base;
  let counter = 2;
  while (websiteOperations.findBySlug(candidate)) {
    candidate = `${base}-${counter}`;
    counter += 1;
  }
  return candidate;
}

// 保存網站 API
export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  // 檢查用戶是否已登入（如果未登入，使用匿名用戶）
  const user = getCurrentUser(request);
  const userId = user?.id || 0; // 0 表示匿名用戶

  const body = await request.json();
  const { name, description, files, websiteId } = body;

  if (!name || !files) {
    return Response.json({ error: 'Name and files are required' }, { status: 400 });
  }

  // 檢查配額（如果是登入用戶）
  if (userId > 0) {
    const quotaCheck = checkQuota(userId, 'website');
    if (!quotaCheck.allowed) {
      return Response.json({ error: quotaCheck.reason }, { status: 403 });
    }
  }

  let website;

  if (websiteId) {
    // 更新現有網站
    website = websiteOperations.findById(websiteId);
    if (!website) {
      return Response.json({ error: 'Website not found' }, { status: 404 });
    }

    website = websiteOperations.updateWebsite(websiteId, {
      name,
      description,
      files,
    });
  } else {
    // 創建新網站
    const newWebsite = websiteOperations.createWebsite({
      user_id: userId,
      name,
      slug: uniqueSlug(name),
      description,
      files,
      status: 'published',
    });

    // 生成預覽 URL
    const previewUrl = `/preview/${newWebsite.id}`;
    website = websiteOperations.updateWebsite(newWebsite.id, {
      preview_url: previewUrl,
    });

    // 扣減配額
    if (userId > 0) {
      deductQuota(userId, 'website');
    }
  }

  // 保存文件到服務器
  const websiteDir = path.join(WEBSITES_DIR, website!.id.toString());
  if (!fs.existsSync(websiteDir)) {
    fs.mkdirSync(websiteDir, { recursive: true });
  }

  // 保存文件
  Object.entries(files).forEach(([filePath, content]) => {
    const fullPath = path.join(websiteDir, filePath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(fullPath, content as string);
  });

  return Response.json({
    website,
    previewUrl: website!.preview_url,
  });
}
