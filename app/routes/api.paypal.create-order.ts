import { getCurrentUser } from '~/lib/server/auth';
import { TIER_DEFAULTS } from '~/lib/server/kcompute';
import type { ActionFunctionArgs } from 'react-router';

// PayPal 創建訂單 API
export async function action({ request }: ActionFunctionArgs) {
  const user = getCurrentUser(request);

  if (!user) {
    return Response.json({ error: 'Please login first' }, { status: 401 });
  }

  const body = await request.json();
  const { tier } = body; // starter, pro, enterprise

  // 檢查 tier 是否有效
  const tierInfo = TIER_DEFAULTS[tier as keyof typeof TIER_DEFAULTS];
  if (!tierInfo) {
    return Response.json({ error: 'Invalid tier' }, { status: 400 });
  }

  // 價格表（美元）
  const PRICES: Record<string, number> = {
    starter: 9,
    pro: 29,
    enterprise: 99,
  };

  const price = PRICES[tier];
  if (!price) {
    return Response.json({ error: 'Price not found' }, { status: 400 });
  }

  // 檢查是否配置了 PayPal
  const paypalClientId = process.env.PAYPAL_CLIENT_ID;
  if (!paypalClientId) {
    // 如果沒有配置 PayPal，返回模擬訂單
    return Response.json({
      mock: true,
      message: 'PayPal not configured. This is a demo.',
      orderId: 'MOCK-' + Date.now(),
      approveUrl: '#',
    });
  }

  // 這裡應該調用 PayPal API 創建訂單
  // 為了簡單起見，我們先返回一個框架，實際實現需要根據 PayPal SDK 來寫

  const baseUrl = new URL(request.url).origin;
  const returnUrl = `${baseUrl}/pricing/success?userId=${user.id}&tier=${tier}`;
  const cancelUrl = `${baseUrl}/pricing/cancel`;

  // 構建 PayPal 授權 URL
  // 實際上需要先調用 PayPal API 獲取 orderId，然後跳轉到 approve URL
  const paypalApproveUrl = `https://www.paypal.com/checkoutnow?token=EXAMPLE_ORDER_ID`;

  return Response.json({
    orderId: 'EXAMPLE_ORDER_ID',
    approveUrl: paypalApproveUrl,
    returnUrl,
    cancelUrl,
  });
}
