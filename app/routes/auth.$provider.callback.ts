import { createUserSession } from '~/lib/server/auth';
import { userOperations } from '~/lib/server/database';
import type { LoaderFunctionArgs } from 'react-router';

interface OAuthProfile {
  email: string;
  name: string;
  avatar_url?: string;
  provider: 'google' | 'github' | 'apple';
  provider_id: string;
}

async function exchangeGoogleCode(code: string, clientId: string, clientSecret: string, redirectUri: string): Promise<OAuthProfile> {
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    throw new Error(`Google token exchange failed: ${JSON.stringify(tokenData)}`);
  }

  const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const user = await userRes.json();
  return {
    email: user.email,
    name: user.name || user.email.split('@')[0],
    avatar_url: user.picture,
    provider: 'google',
    provider_id: user.id,
  };
}

async function exchangeGithubCode(code: string, clientId: string, clientSecret: string, redirectUri: string): Promise<OAuthProfile> {
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    }),
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    throw new Error(`GitHub token exchange failed: ${JSON.stringify(tokenData)}`);
  }

  const userRes = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${tokenData.access_token}`, 'User-Agent': 'kbot-app' },
  });
  const user = await userRes.json();

  let email = user.email;
  if (!email) {
    const emailsRes = await fetch('https://api.github.com/user/emails', {
      headers: { Authorization: `Bearer ${tokenData.access_token}`, 'User-Agent': 'kbot-app' },
    });
    const emails = await emailsRes.json();
    const primary = Array.isArray(emails) ? emails.find((e: any) => e.primary && e.verified) : null;
    email = primary?.email || `${user.login}@users.noreply.github.com`;
  }

  return {
    email,
    name: user.name || user.login,
    avatar_url: user.avatar_url,
    provider: 'github',
    provider_id: String(user.id),
  };
}

async function handleCallback(request: Request, provider: string): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) {
    return Response.redirect(`/?oauth_error=${encodeURIComponent(error)}`);
  }
  if (!code) {
    return Response.redirect('/?oauth_error=no_code');
  }

  const clientId = process.env[`OAUTH_${provider.toUpperCase()}_CLIENT_ID`];
  const clientSecret = process.env[`OAUTH_${provider.toUpperCase()}_CLIENT_SECRET`];
  if (!clientId || !clientSecret) {
    return Response.redirect('/?oauth_error=not_configured');
  }

  const host = request.headers.get('host') || url.host;
  const origin = process.env.APP_URL || `https://${host}`;
  const redirectUri = `${origin}/auth/${provider}/callback`;

  try {
    let profile: OAuthProfile;
    if (provider === 'google') {
      profile = await exchangeGoogleCode(code, clientId, clientSecret, redirectUri);
    } else if (provider === 'github') {
      profile = await exchangeGithubCode(code, clientId, clientSecret, redirectUri);
    } else {
      return Response.redirect('/?oauth_error=unsupported_provider');
    }

    // 查找或創建用戶
    let user = userOperations.findByEmail(profile.email);
    if (!user) {
      user = userOperations.createUser({
        email: profile.email,
        password_hash: '',
        name: profile.name,
        avatar_url: profile.avatar_url,
        google_id: profile.provider === 'google' ? profile.provider_id : undefined,
        github_id: profile.provider === 'github' ? profile.provider_id : undefined,
      } as any);
    } else if (profile.provider === 'google' && !user.google_id) {
      userOperations.updateUser(user.id, { google_id: profile.provider_id } as any);
    } else if (profile.provider === 'github' && !user.github_id) {
      userOperations.updateUser(user.id, { github_id: profile.provider_id } as any);
    }

    // 創建 session
    const token = createUserSession(user.id);

    // 設置 cookie 並重定向回首頁
    const redirectUrl = new URL('/', origin);
    redirectUrl.searchParams.set('oauth_success', provider);
    const response = Response.redirect(redirectUrl.toString());
    response.headers.set(
      'Set-Cookie',
      `kbot_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}; Secure=true`,
    );
    return response;
  } catch (err: any) {
    console.error('OAuth callback error:', err);
    return Response.redirect(`/?oauth_error=${encodeURIComponent(err.message || 'unknown')}`);
  }
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { provider } = params;

  if (!['google', 'github', 'apple'].includes(provider || '')) {
    return Response.json({ error: 'Invalid provider' }, { status: 400 });
  }

  const url = new URL(request.url);
  // 從 Host 頭讀取公開域名，強制 https（Railway 內部 request.url 是 http://0.0.0.0）
  const host = request.headers.get('host') || url.host;
  const origin = process.env.APP_URL || `https://${host}`;

  // 如果 URL 帶 code，說明是 OAuth 回調
  if (url.searchParams.get('code')) {
    return handleCallback(request, provider!);
  }

  // 否則是啟動 OAuth 流程
  const clientId = process.env[`OAUTH_${provider!.toUpperCase()}_CLIENT_ID`];
  if (!clientId) {
    return Response.json({
      error: `${provider} login not configured. Please set OAUTH_${provider!.toUpperCase()}_CLIENT_ID environment variable.`,
    }, { status: 501 });
  }

  const redirectUri = `${origin}/auth/${provider}/callback`;

  const authUrls: Record<string, string> = {
    google: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent('email profile')}&access_type=online&prompt=select_account`,
    github: `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent('read:user user:email')}`,
    apple: `https://appleid.apple.com/auth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent('name email')}`,
  };

  return Response.redirect(authUrls[provider!]);
}
