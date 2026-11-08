import crypto from 'crypto';
import { userOperations, sessionOperations } from './database';

// 密碼哈希
export function hashPassword(password: string): string {
  // 使用 SHA256 + salt（簡單實現，生產環境應該用 bcrypt）
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

// 驗證密碼
export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(':');
  
  // 兼容舊的簡單 SHA256 格式（沒有 salt）
  if (!hash) {
    const oldHash = crypto.createHash('sha256').update(password).digest('hex');
    return oldHash === storedHash;
  }
  
  const verifyHash = crypto.scryptSync(password, salt, 64).toString('hex');
  return verifyHash === hash;
}

// Session 密鑰（生產環境應該用環境變量）
const SESSION_SECRET = process.env.SESSION_SECRET || 'kbot-secret-key-change-in-production';

// 創建用戶 session
export function createUserSession(userId: number): string {
  // 生成一個簡單的 session token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 天過期
  
  // 存儲到數據庫
  sessionOperations.createSession(token, userId, expiresAt);
  
  return token;
}

// 從 session token 獲取用戶
export function getUserFromSession(token: string): any | null {
  if (!token) return null;
  
  try {
    // 先清理過期 session
    sessionOperations.deleteExpiredSessions();
    
    // 查找 session
    const session = sessionOperations.findByToken(token);
    if (!session) return null;
    
    // 查找用戶
    const user = userOperations.findById(session.user_id);
    if (!user) return null;
    
    // 返回用戶信息（不包含密碼）
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    return null;
  }
}

// 從請求中獲取當前用戶
export function getCurrentUser(request: Request): any | null {
  // 從 Authorization header 或 cookie 中獲取 token
  const authHeader = request.headers.get('Authorization');
  let token = null;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else {
    // 從 cookie 中獲取
    const cookies = request.headers.get('cookie') || '';
    const sessionCookie = cookies.split(';').find(c => c.trim().startsWith('kbot_session='));
    if (sessionCookie) {
      token = sessionCookie.split('=')[1];
    }
  }
  
  if (!token) return null;
  
  return getUserFromSession(token);
}
