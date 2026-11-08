import { createUserSession, hashPassword } from '~/lib/server/auth';
import { userOperations } from '~/lib/server/database';
import type { ActionFunctionArgs } from 'react-router';

// 註冊 API
export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const body = await request.json();
  const { email, password, name } = body;

  if (!email || !password) {
    return Response.json({ error: 'Email and password are required' }, { status: 400 });
  }

  // 簡單的郵箱格式驗證
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return Response.json({ error: 'Invalid email format' }, { status: 400 });
  }

  // 密碼長度驗證
  if (password.length < 6) {
    return Response.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
  }

  // 檢查郵箱是否已存在
  const existingUser = userOperations.findByEmail(email);
  if (existingUser) {
    return Response.json({ error: 'Email already registered' }, { status: 409 });
  }

  // 哈希密碼
  const passwordHash = hashPassword(password);

  // 創建用戶
  const user = userOperations.createUser({
    email,
    password_hash: passwordHash,
    name: name || email.split('@')[0],
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
