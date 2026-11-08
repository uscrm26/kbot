import { createUserSession, hashPassword } from '~/lib/server/auth';
import { db } from '~/lib/server/database';
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
  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existingUser) {
    return Response.json({ error: 'Email already registered' }, { status: 409 });
  }

  // 哈希密碼
  const passwordHash = hashPassword(password);

  // 創建用戶
  const result = db.prepare(`
    INSERT INTO users (email, password_hash, name, role)
    VALUES (?, ?, ?, 'user')
  `).run(email, passwordHash, name || email.split('@')[0]);

  const userId = result.lastInsertRowid;

  // 創建默認配額
  db.prepare(`
    INSERT INTO user_quotas (user_id, max_generations, max_modifications, max_websites)
    VALUES (?, 10, 50, 5)
  `).run(userId);

  // 創建 session
  const session = createUserSession(userId);

  // 返回用戶信息
  const user = db.prepare('SELECT id, email, name, role, created_at FROM users WHERE id = ?').get(userId);

  return Response.json({
    user,
    session,
  });
}
