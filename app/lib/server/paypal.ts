const PAYPAL_BASE =
  process.env.PAYPAL_ENVIRONMENT === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured');
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const response = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error('PayPal authentication failed');
  }

  const data: any = await response.json();

  return data.access_token;
}

export interface CreatedOrder {
  id: string;
  approveUrl: string;
}

export async function createPayPalOrder(
  amount: number,
  customId: string,
  currency = 'USD',
): Promise<CreatedOrder> {
  const accessToken = await getAccessToken();
  const response = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          custom_id: customId,
          amount: {
            currency_code: currency,
            value: amount.toFixed(2),
          },
        },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`PayPal create order failed: ${detail}`);
  }

  const data: any = await response.json();
  const approveLink = data.links.find((link: any) => link.rel === 'approve');

  return {
    id: data.id,
    approveUrl: approveLink ? approveLink.href : '',
  };
}

export async function capturePayPalOrder(orderId: string): Promise<any> {
  const accessToken = await getAccessToken();
  const response = await fetch(
    `${PAYPAL_BASE}/v2/checkout/orders/${orderId}/capture`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    },
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`PayPal capture failed: ${detail}`);
  }

  return response.json();
}
