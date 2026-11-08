import { getCurrentUser } from '~/lib/server/auth';
import { db } from '~/lib/server/database';
import type { LoaderFunctionArgs } from 'react-router';

// 獲取當前用戶信息 API
export async function loader({ request }: LoaderFunctionArgs) {
  const user = getCurrentUser(request);

  if (!user) {
    return Response.json({ user: null }, { status: 401 });
  }

  // 獲取用戶配額
  const quota = db.prepare('SELECT * FROM user_quotas WHERE user_id = ?').get(user.id);

  return Response.json({
    user,
    quota,
  });
}
