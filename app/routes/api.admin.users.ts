import { getCurrentUser } from '~/lib/server/auth';
import { userOperations } from '~/lib/server/database';
import { kComputeToCNY } from '~/lib/server/kcompute';
import type { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router';

// 檢查是否是管理員
function requireAdmin(request: Request): any | null {
  const user = getCurrentUser(request);
  if (!user || user.role !== 'admin') {
    return null;
  }
  return user;
}

// 獲取用戶列表 API（管理員）
export async function loader({ request }: LoaderFunctionArgs) {
  const admin = requireAdmin(request);
  if (!admin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 獲取用戶列表，並附加算力與人民幣金額換算
  const users = userOperations.getAllUsers().map((u) => {
    const { password_hash, ...rest } = u;

    return {
      ...rest,
      used_cny: kComputeToCNY(u.k_compute_used),
      balance_cny: kComputeToCNY(u.k_compute_balance),
    };
  });

  return Response.json({ users });
}

// 修改用戶配額 API（管理員）
export async function action({ request }: ActionFunctionArgs) {
  const admin = requireAdmin(request);
  if (!admin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const body: any = await request.json();
  const { userId, k_compute_balance, is_active, tier } = body;

  if (!userId) {
    return Response.json({ error: 'User ID is required' }, { status: 400 });
  }

  // 更新用戶信息
  const updates: any = {};
  if (is_active !== undefined) {
    updates.is_active = is_active;
  }
  if (k_compute_balance !== undefined) {
    updates.k_compute_balance = k_compute_balance;
  }
  if (tier !== undefined) {
    updates.tier = tier;
  }

  userOperations.updateUser(userId, updates);

  return Response.json({ success: true });
}
