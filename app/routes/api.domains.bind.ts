import { getCurrentUser } from '~/lib/server/auth';
import { websiteOperations } from '~/lib/server/database';
import crypto from 'node:crypto';
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';

// 保留的 Demo 網域規則，無需真實 DNS 即可跑通流程
function isDemoDomain(domain: string): boolean {
  return /^demo\./i.test(domain) || /\.kbot-demo\.test$/i.test(domain) || /\.demo$/i.test(domain);
}

// 標準網域格式，額外允許本機與 Demo 保留尾綴
function isValidDomain(domain: string): boolean {
  const standard = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*\.[a-zA-Z]{2,}$/;
  return standard.test(domain) || isDemoDomain(domain);
}

// 綁定自定義網域 API
export async function action({ request }: ActionFunctionArgs) {
  const user = getCurrentUser(request);

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const body: any = await request.json();
  const { websiteId, customDomain } = body;

  if (!websiteId || !customDomain) {
    return Response.json({ error: 'Website ID and custom domain are required' }, { status: 400 });
  }

  const normalizedDomain = String(customDomain).trim().toLowerCase();

  if (!isValidDomain(normalizedDomain)) {
    return Response.json({ error: 'Invalid domain format' }, { status: 400 });
  }

  const website = websiteOperations.findById(websiteId);

  if (!website || website.user_id !== user.id) {
    return Response.json({ error: 'Website not found' }, { status: 404 });
  }

  const demo = isDemoDomain(normalizedDomain);
  const verificationToken = `kbot-verify-${crypto.randomBytes(12).toString('hex')}`;

  websiteOperations.updateWebsite(websiteId, {
    custom_domain: normalizedDomain,
    verification_token: verificationToken,
    verification_mode: demo ? 'demo' : 'dns',
    domain_verified: false,
  });

  return Response.json({
    success: true,
    customDomain: normalizedDomain,
    mode: demo ? 'demo' : 'dns',
    verification: {
      type: 'TXT',
      name: `_kbot-verify.${normalizedDomain}`,
      value: verificationToken,
    },
    instruction: demo
      ? `這是 Demo 網域，系統已自動模擬產生 TXT 記錄，直接點擊驗證即可跑通。`
      : `請在 DNS 管理面板加入 TXT 記錄，主機為 _kbot-verify，值為 ${verificationToken}，完成後再點擊驗證網域。`,
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
