import { getCurrentUser } from '~/lib/server/auth';
import { TIER_DEFAULTS } from '~/lib/server/kcompute';
import { createPayPalOrder } from '~/lib/server/paypal';
import type { ActionFunctionArgs } from 'react-router';

const PRICES: Record<string, number> = {
  starter: 9,
  pro: 29,
  enterprise: 99,
};

// PayPal 創建訂單 API
export async function action({ request }: ActionFunctionArgs) {
  const user = getCurrentUser(request);

  if (!user) {
    return Response.json({ error: 'Please login first' }, { status: 401 });
  }

  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const body = await request.json();
  const { tier } = body;

  const tierInfo = TIER_DEFAULTS[tier as keyof typeof TIER_DEFAULTS];

  if (!tierInfo) {
    return Response.json({ error: 'Invalid tier' }, { status: 400 });
  }

  const price = PRICES[tier];

  if (!price) {
    return Response.json({ error: 'Price not found' }, { status: 400 });
  }

  // 未配置 PayPal 憑證時返回模擬訂單
  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    return Response.json({
      mock: true,
      message: 'PayPal not configured. This is a demo.',
      orderId: 'MOCK-' + Date.now(),
      approveUrl: '#',
    });
  }

  try {
    const customId = `${user.id}_${tier}`;
    const order = await createPayPalOrder(price, customId);

    return Response.json({
      orderId: order.id,
      approveUrl: order.approveUrl,
    });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 502 });
  }
}
