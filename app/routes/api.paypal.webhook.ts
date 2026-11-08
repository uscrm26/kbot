import { setUserTier, rechargeKCompute, TIER_DEFAULTS } from '~/lib/server/kcompute';
import type { ActionFunctionArgs } from 'react-router';

// PayPal Webhook API（接收付款通知）
export async function action({ request }: ActionFunctionArgs) {
  // 驗證 Webhook 來自 PayPal（這裡簡化處理，實際需要驗證簽名）
  const body = await request.json();

  // 處理付款成功事件
  if (body.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
    const resource = body.resource;
    const customId = resource.custom_id; // 格式：userId_tier
    const [userId, tier] = customId.split('_');

    if (userId && tier && TIER_DEFAULTS[tier as keyof typeof TIER_DEFAULTS]) {
      // 升級用戶級別
      setUserTier(parseInt(userId), tier);
      
      // 可以選擇額外贈送一些 K算力
      // rechargeKCompute(parseInt(userId), 10);
    }
  }

  // 返回 200 告訴 PayPal 我們收到了
  return Response.json({ received: true });
}

// 付款成功頁面（用戶付款後跳轉到這裡）
export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');
  const tier = url.searchParams.get('tier');

  // 這裡可以顯示一個「付款成功」的頁面
  // 實際上我們依賴 Webhook 來真正更新用戶級別

  return Response.json({
    success: true,
    message: 'Payment successful! Your account will be upgraded shortly.',
    userId,
    tier,
  });
}
