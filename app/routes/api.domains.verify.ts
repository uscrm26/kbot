import { getCurrentUser } from '~/lib/server/auth';
import { websiteOperations } from '~/lib/server/database';
import { resolveTxt } from 'node:dns/promises';
import type { ActionFunctionArgs } from 'react-router';

// 驗證自定義網域 API
export async function action({ request }: ActionFunctionArgs) {
  const user = getCurrentUser(request);

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const body = await request.json();
  const { websiteId } = body;

  if (!websiteId) {
    return Response.json({ error: 'Website ID is required' }, { status: 400 });
  }

  const website = websiteOperations.findById(websiteId);

  if (!website || website.user_id !== user.id || !website.custom_domain) {
    return Response.json({ error: 'Website or custom domain not found' }, { status: 404 });
  }

  // 解析網域的 TXT 記錄
  let txtRecords: string[] = [];

  try {
    const records = await resolveTxt(website.custom_domain);
    txtRecords = records.map((parts) => parts.join(''));
  } catch {
    return Response.json(
      {
        verified: false,
        error: '無法解析該網域的 DNS 記錄，請確認網域設定正確後再試。',
      },
      { status: 200 },
    );
  }

  // 檢查是否包含 K-bot 驗證標記
  const hasVerifyRecord = txtRecords.some((record) => record.startsWith('kbot-verify'));

  if (hasVerifyRecord) {
    websiteOperations.updateWebsite(websiteId, { status: 'published' });

    return Response.json({
      verified: true,
      customDomain: website.custom_domain,
    });
  }

  return Response.json({
    verified: false,
    error: '尚未找到正確的 TXT 驗證記錄，請完成 DNS 設定後稍候再試。',
  });
}
