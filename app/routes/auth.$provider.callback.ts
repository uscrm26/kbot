import { createUserSession, getCurrentUser } from '~/lib/server/auth';
import { db } from '~/lib/server/database';
import type { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router';

// 第三方登錄啟動 API
export async function loader({ request, params }: LoaderFunctionArgs) {
  const { provider } = params; // google, apple, github

  if (!['google', 'apple', 'github'].includes(provider)) {
    return Response.json({ error: 'Invalid provider' }, { status: 400 });
  }

  // 獲取環境變量中的 Client ID
  const clientId = process.env[`OAUTH_${provider.toUpperCase()}_CLIENT_ID`];

  if (!clientId) {
    return Response.json({ 
      error: `${provider} login not configured. Please set OAUTH_${provider.toUpperCase()}_CLIENT_ID environment variable.` 
    }, { status: 501 });
  }

  // 構建 OAuth 授權 URL
  const redirectUri = `${new URL(request.url).origin}/auth/${provider}/callback`;
  
  const authUrls: Record<string, string> = {
    google: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=email%20profile`,
    github: `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user%20user:email`,
    apple: `https://appleid.apple.com/auth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=name%20email`,
  };

  return Response.redirect(authUrls[provider]);
}

// 第三方登錄回調 API
export async function action({ request, params }: ActionFunctionArgs) {
  const { provider } = params;
  const body = await request.json();
  const { code } = body;

  if (!code) {
    return Response.json({ error: 'Code is required' }, { status: 400 });
  }

  const clientId = process.env[`OAUTH_${provider.toUpperCase()}_CLIENT_ID`];
  const clientSecret = process.env[`OAUTH_${provider.toUpperCase()}_CLIENT_SECRET`];

  if (!clientId || !clientSecret) {
    return Response.json({ error: 'OAuth not configured' }, { status: 501 });
  }

  // 這裡應該用 code 換取 access token，然後獲取用戶信息
  // 為了簡單起見，我們先創建一個框架，實際實現需要根據各平台的 API 來寫

  // TODO: 實現真正的 OAuth 流程
  // 1. 用 code 換取 access token
  // 2. 用 access token 獲取用戶信息
  // 3. 查找或創建用戶
  // 4. 返回 session

  // 示例：假設我們獲取到了用戶信息
  const mockUserInfo = {
    email: `user_${Date.now()}@${provider}.com`,
    name: `${provider} User`,
    id: `${provider}_${Date.now()}`,
  };

  // 查找用戶
  let user = db.prepare(`SELECT * FROM users WHERE ${provider}_id = ?`).get(mockUserInfo.id) as any;

  if (!user) {
    // 如果是已登入用戶綁定賬號
    const currentUser = getCurrentUser(request);
    if (currentUser) {
      // 綁定到當前用戶
      db.prepare(`UPDATE users SET ${provider}_id = ? WHERE id = ?`).run(mockUserInfo.id, currentUser.id);
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(currentUser.id);
    } else {
      // 創建新用戶
      const result = db.prepare(`
        INSERT INTO users (email, name, ${provider}_id, avatar_url, role)
        VALUES (?, ?, ?, ?, 'user')
      `).run(mockUserInfo.email, mockUserInfo.name, mockUserInfo.id, '');

      const userId = result.lastInsertRowid;

      // 創建默認配額
      db.prepare(`
        INSERT INTO user_quotas (user_id, max_generations, max_modifications, max_websites)
        VALUES (?, 10, 50, 5)
      `).run(userId);

      user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    }
  }

  // 創建 session
  const session = createUserSession(user.id);

  // 返回用戶信息（不包含密碼）
  const { password_hash, ...userWithoutPassword } = user;

  return Response.json({
    user: userWithoutPassword,
    session,
  });
}
