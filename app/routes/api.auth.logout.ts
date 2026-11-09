import { sessionOperations } from '~/lib/server/database';
import type { ActionFunctionArgs } from 'react-router';

// 登出 API
export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const authHeader = request.headers.get('Authorization');
  let token: string | null = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else {
    const cookies = request.headers.get('cookie') || '';
    const sessionCookie = cookies.split(';').find((c) => c.trim().startsWith('kbot_session='));

    if (sessionCookie) {
      token = sessionCookie.split('=')[1];
    }
  }

  if (token) {
    sessionOperations.deleteByToken(token);
  }

  return Response.json({ success: true });
}
