import { userOperations } from './database';
import { K_COMPUTE_PRICES } from './kcompute';

// 檢查用戶是否有足夠的配額（基於 K算力）
export function checkQuota(
  userId: number,
  type: 'generate' | 'modify' | 'website'
): { allowed: boolean; reason?: string; required?: number } {
  const user = userOperations.findById(userId);

  if (!user) {
    return { allowed: false, reason: 'User not found' };
  }

  // 管理員無限配額
  if (user.role === 'admin') {
    return { allowed: true };
  }

  let required = 0;
  switch (type) {
    case 'generate':
      required = K_COMPUTE_PRICES.generate;
      break;
    case 'modify':
      required = K_COMPUTE_PRICES.modify;
      break;
    case 'website':
      required = 0; // 網站數量暫不限制
      break;
  }

  if (required > 0 && user.k_compute_balance < required) {
    return { 
      allowed: false, 
      reason: 'Insufficient K compute balance',
      required,
    };
  }

  return { allowed: true };
}

// 扣減配額（基於 K算力）
export function deductQuota(
  userId: number,
  type: 'generate' | 'modify' | 'website'
): void {
  const user = userOperations.findById(userId);
  if (!user) return;

  let cost = 0;
  switch (type) {
    case 'generate':
      cost = K_COMPUTE_PRICES.generate;
      break;
    case 'modify':
      cost = K_COMPUTE_PRICES.modify;
      break;
  }

  if (cost > 0) {
    userOperations.updateUser(userId, {
      k_compute_balance: user.k_compute_balance - cost,
      k_compute_used: user.k_compute_used + cost,
    });
  }
}

// 獲取用戶配額信息
export function getUserQuota(userId: number): any {
  const user = userOperations.findById(userId);
  if (!user) return null;

  return {
    k_compute_balance: user.k_compute_balance,
    k_compute_used: user.k_compute_used,
    tier: user.tier,
  };
}
