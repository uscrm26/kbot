import { db } from './database';

// 檢查用戶是否有足夠的配額
export function checkQuota(
  userId: number,
  type: 'generate' | 'modify' | 'website'
): { allowed: boolean; reason?: string } {
  const quota = db.prepare('SELECT * FROM user_quotas WHERE user_id = ?').get(userId) as any;

  if (!quota) {
    return { allowed: false, reason: 'Quota not found' };
  }

  switch (type) {
    case 'generate':
      if (quota.used_generations >= quota.max_generations) {
        return { allowed: false, reason: 'Generation quota exceeded' };
      }
      break;
    case 'modify':
      if (quota.used_modifications >= quota.max_modifications) {
        return { allowed: false, reason: 'Modification quota exceeded' };
      }
      break;
    case 'website':
      if (quota.used_websites >= quota.max_websites) {
        return { allowed: false, reason: 'Website quota exceeded' };
      }
      break;
  }

  return { allowed: true };
}

// 扣減配額
export function deductQuota(
  userId: number,
  type: 'generate' | 'modify' | 'website'
): void {
  switch (type) {
    case 'generate':
      db.prepare('UPDATE user_quotas SET used_generations = used_generations + 1 WHERE user_id = ?').run(userId);
      break;
    case 'modify':
      db.prepare('UPDATE user_quotas SET used_modifications = used_modifications + 1 WHERE user_id = ?').run(userId);
      break;
    case 'website':
      db.prepare('UPDATE user_quotas SET used_websites = used_websites + 1 WHERE user_id = ?').run(userId);
      break;
  }
}

// 獲取用戶配額信息
export function getUserQuota(userId: number): any {
  return db.prepare('SELECT * FROM user_quotas WHERE user_id = ?').get(userId);
}
