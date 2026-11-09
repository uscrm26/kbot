import { createUserSession } from '~/lib/server/auth';
import { userOperations } from '~/lib/server/database';
import type { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router';

// 第三方登錄啟動 API
export async function loader({ request, params }: LoaderFunctionArgs) {
  const { provider } = params;

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

  // TODO: 實現真正的 OAuth 流程
  // 1. 用 code 換取 access token
  // 2. 用 access token 獲取用戶信息
  // 3. 查找或創建用戶
  // 4. 返回 session

  // 暫時返回未實現提示
  return Response.json({
    error: 'OAuth flow not fully implemented yet. Please use email login.'
  }, { status: 501 });
}
