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

  const body: any = await request.json();
  const { websiteId } = body;

  if (!websiteId) {
    return Response.json({ error: 'Website ID is required' }, { status: 400 });
  }

  const website = websiteOperations.findById(websiteId);

  if (!website || website.user_id !== user.id || !website.custom_domain) {
    return Response.json({ error: 'Website or custom domain not found' }, { status: 404 });
  }

  // Demo 模式直接模擬 DNS 驗證成功，無需真實記錄
  if (website.verification_mode === 'demo') {
    websiteOperations.updateWebsite(websiteId, {
      domain_verified: true,
      status: 'published',
    });

    return Response.json({
      verified: true,
      mode: 'demo',
      customDomain: website.custom_domain,
      simulatedRecords: [website.verification_token],
    });
  }

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

  const expectedToken = website.verification_token;
  const hasVerifyRecord = expectedToken
    ? txtRecords.includes(expectedToken)
    : txtRecords.some((record) => record.startsWith('kbot-verify'));

  if (hasVerifyRecord) {
    websiteOperations.updateWebsite(websiteId, {
      domain_verified: true,
      status: 'published',
    });

    return Response.json({
      verified: true,
      mode: 'dns',
      customDomain: website.custom_domain,
    });
  }

  return Response.json({
    verified: false,
    error: '尚未找到正確的 TXT 驗證記錄，請完成 DNS 設定後稍候再試。',
  });
}
