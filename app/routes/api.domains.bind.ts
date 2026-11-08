import { getCurrentUser } from '~/lib/server/auth';
import { websiteOperations } from '~/lib/server/database';
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';

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
  const website = websiteOperations.findById(websiteId);
  if (!website || website.user_id !== user.id) {
    return Response.json({ error: 'Website not found' }, { status: 404 });
  }

  // 更新網域
  websiteOperations.updateWebsite(websiteId, {
    custom_domain: customDomain,
  });

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

  const websites = websiteOperations.findByUserId(user.id);

  return Response.json({ websites });
}
