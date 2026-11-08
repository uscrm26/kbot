import { getCurrentUser } from '~/lib/server/auth';
import { checkQuota, deductQuota } from '~/lib/server/quota';
import { db } from '~/lib/server/database';
import fs from 'fs';
import path from 'path';
import type { ActionFunctionArgs } from 'react-router';

// 網站保存目錄
const WEBSITES_DIR = process.env.WEBSITES_DIR || path.join(process.cwd(), 'data', 'websites');

// 確保目錄存在
if (!fs.existsSync(WEBSITES_DIR)) {
  fs.mkdirSync(WEBSITES_DIR, { recursive: true });
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
    website = db.prepare('SELECT * FROM websites WHERE id = ?').get(websiteId) as any;
    if (!website) {
      return Response.json({ error: 'Website not found' }, { status: 404 });
    }

    db.prepare(`
      UPDATE websites 
      SET name = ?, description = ?, files = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, description, JSON.stringify(files), websiteId);

    website = db.prepare('SELECT * FROM websites WHERE id = ?').get(websiteId);
  } else {
    // 創建新網站
    const result = db.prepare(`
      INSERT INTO websites (user_id, name, description, files, status)
      VALUES (?, ?, ?, ?, 'published')
    `).run(userId, name, description, JSON.stringify(files));

    const newWebsiteId = result.lastInsertRowid;

    // 生成預覽 URL
    const previewUrl = `/preview/${newWebsiteId}`;
    db.prepare('UPDATE websites SET preview_url = ? WHERE id = ?').run(previewUrl, newWebsiteId);

    // 扣減配額
    if (userId > 0) {
      deductQuota(userId, 'website');
    }

    website = db.prepare('SELECT * FROM websites WHERE id = ?').get(newWebsiteId);
  }

  // 保存文件到服務器
  const websiteDir = path.join(WEBSITES_DIR, website.id.toString());
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
    previewUrl: website.preview_url,
  });
}
