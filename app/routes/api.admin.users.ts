import { getCurrentUser } from '~/lib/server/auth';
import { db } from '~/lib/server/database';
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

  // 獲取用戶列表，包含配額信息
  const users = db.prepare(`
    SELECT u.id, u.email, u.name, u.role, u.is_active, u.created_at, u.last_login_at,
           q.max_generations, q.max_modifications, q.max_websites,
           q.used_generations, q.used_modifications, q.used_websites
    FROM users u
    LEFT JOIN user_quotas q ON u.id = q.user_id
    ORDER BY u.created_at DESC
  `).all();

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

  const body = await request.json();
  const { userId, max_generations, max_modifications, max_websites, is_active } = body;

  if (!userId) {
    return Response.json({ error: 'User ID is required' }, { status: 400 });
  }

  // 更新用戶狀態
  if (is_active !== undefined) {
    db.prepare('UPDATE users SET is_active = ? WHERE id = ?').run(is_active ? 1 : 0, userId);
  }

  // 更新配額
  if (max_generations !== undefined || max_modifications !== undefined || max_websites !== undefined) {
    db.prepare(`
      UPDATE user_quotas 
      SET max_generations = COALESCE(?, max_generations),
          max_modifications = COALESCE(?, max_modifications),
          max_websites = COALESCE(?, max_websites)
      WHERE user_id = ?
    `).run(max_generations, max_modifications, max_websites, userId);
  }

  return Response.json({ success: true });
}
