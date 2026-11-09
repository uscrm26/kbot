import { getCurrentUser } from '~/lib/server/auth';
import { setUserTier, TIER_DEFAULTS } from '~/lib/server/kcompute';
import { capturePayPalOrder } from '~/lib/server/paypal';
import type { ActionFunctionArgs } from 'react-router';

// 付款確認後捕獲訂單並升級方案
export async function action({ request }: ActionFunctionArgs) {
  const user = getCurrentUser(request);

  if (!user) {
    return Response.json({ error: 'Please login first' }, { status: 401 });
  }

  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const body = await request.json();
  const { orderId } = body;

  if (!orderId) {
    return Response.json({ error: 'Order ID is required' }, { status: 400 });
  }

  try {
    const captured: any = await capturePayPalOrder(orderId);

    if (captured.status !== 'COMPLETED') {
      return Response.json({ error: 'Payment not completed' }, { status: 400 });
    }

    const unit = captured.purchase_units?.[0];
    const customId: string = unit?.custom_id || '';
    const [, tier] = customId.split('_');

    if (tier && TIER_DEFAULTS[tier as keyof typeof TIER_DEFAULTS]) {
      setUserTier(user.id, tier);
    }

    return Response.json({ success: true, tier });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 502 });
  }
}
