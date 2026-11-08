import { createUserSession, verifyPassword } from '~/lib/server/auth';
import { userOperations } from '~/lib/server/database';
import type { ActionFunctionArgs } from 'react-router';

// 登入 API
export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return Response.json({ error: 'Email and password are required' }, { status: 400 });
  }

  // 查找用戶
  const user = userOperations.findByEmail(email);

  if (!user || !user.password_hash || !user.is_active) {
    return Response.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  // 驗證密碼
  const isValid = verifyPassword(password, user.password_hash);

  if (!isValid) {
    return Response.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  // 更新最後登錄時間
  userOperations.updateUser(user.id, {
    last_login_at: new Date().toISOString(),
  });

  // 創建 session
  const session = createUserSession(user.id);

  // 返回用戶信息（不包含密碼）
  const { password_hash, ...userWithoutPassword } = user;

  return Response.json({
    user: userWithoutPassword,
    session,
  });
}
