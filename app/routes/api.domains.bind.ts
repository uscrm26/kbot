import { getCurrentUser } from '~/lib/server/auth';
import { db } from '~/lib/server/database';
import type { ActionFunctionArgs } from 'react-router';

// 綁定自定義網域 API
export async function action({ request }: ActionFunctionArgs) {
  const user = getCurrentUser(request);

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const body = await request.json();
  const { websiteId, customDomain } = body;

  if (!websiteId || !customDomain) {
    return Response.json({ error: 'Website ID and custom domain are required' }, { status: 400 });
  }

  // 簡單的網域格式驗證
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
  if (!domainRegex.test(customDomain)) {
    return Response.json({ error: 'Invalid domain format' }, { status: 400 });
  }

  // 檢查網站是否存在且屬於當前用戶
  const website = db.prepare('SELECT * FROM websites WHERE id = ? AND user_id = ?').get(websiteId, user.id);
  if (!website) {
    return Response.json({ error: 'Website not found' }, { status: 404 });
  }

  // 檢查網域是否已被其他用戶綁定
  const existingDomain = db.prepare('SELECT id FROM websites WHERE custom_domain = ? AND id != ?').get(customDomain, websiteId);
  if (existingDomain) {
    return Response.json({ error: 'Domain already in use' }, { status: 409 });
  }

  // 更新網域
  db.prepare('UPDATE websites SET custom_domain = ? WHERE id = ?').run(customDomain, websiteId);

  // 生成驗證記錄
  const verificationToken = `kbot-verify-${Math.random().toString(36).substring(2, 15)}`;

  return Response.json({
    success: true,
    customDomain,
    verification: {
      type: 'TXT',
      name: '_kbot-verify',
      value: verificationToken,
    },
    instruction: `請在你的 DNS 管理面板添加一條 TXT 記錄：\n主機記錄：_kbot-verify\n值：${verificationToken}\n\n添加完成後，請點擊「驗證網域」按鈕。`,
  });
}

// 獲取網域列表 API
export async function loader({ request }: LoaderFunctionArgs) {
  const user = getCurrentUser(request);

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const websites = db.prepare(`
    SELECT id, name, custom_domain, preview_url, status 
    FROM websites 
    WHERE user_id = ?
    ORDER BY created_at DESC
  `).all(user.id);

  return Response.json({ websites });
}
