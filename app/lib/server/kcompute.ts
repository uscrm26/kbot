import { userOperations } from './database';

// K算力價格表
export const K_COMPUTE_PRICES = {
  generate: 1.5, // 生成一個網站消耗 1.5 K算力
  modify: 0.3, // 修改一次網站消耗 0.3 K算力
};

// 算力與人民幣兌換比例，1 K算力 = 1 元人民幣
export const CNY_PER_K_COMPUTE = 1;

// 將 K 算力換算為人民幣金額
export function kComputeToCNY(kCompute: number): number {
  return Math.round(kCompute * CNY_PER_K_COMPUTE * 100) / 100;
}

// 格式化人民幣金額
export function formatCNY(kCompute: number): string {
  return `¥${kComputeToCNY(kCompute).toFixed(2)}`;
}

// 用戶級別默認算力
export const TIER_DEFAULTS = {
  free: { monthly_k_compute: 10, name: '免費版' },
  starter: { monthly_k_compute: 100, name: '入門版' },
  pro: { monthly_k_compute: 500, name: '專業版' },
  enterprise: { monthly_k_compute: 2000, name: '企業版' },
};

// 檢查用戶是否有足夠的 K算力
export function checkKCompute(
  userId: number,
  type: 'generate' | 'modify'
): { allowed: boolean; reason?: string; required?: number } {
  const user = userOperations.findById(userId);

  if (!user) {
    return { allowed: false, reason: 'User not found' };
  }

  // 管理員無限算力
  if (user.role === 'admin') {
    return { allowed: true };
  }

  const required = K_COMPUTE_PRICES[type];

  if (user.k_compute_balance < required) {
    return { 
      allowed: false, 
      reason: 'K compute balance insufficient',
      required,
    };
  }

  return { allowed: true };
}

// 扣除 K算力
export function deductKCompute(
  userId: number,
  type: 'generate' | 'modify'
): void {
  const cost = K_COMPUTE_PRICES[type];
  
  const user = userOperations.findById(userId);
  if (user) {
    userOperations.updateUser(userId, {
      k_compute_balance: user.k_compute_balance - cost,
      k_compute_used: user.k_compute_used + cost,
    });
  }
}

// 獲取用戶 K算力信息
export function getUserKCompute(userId: number): any {
  const user = userOperations.findById(userId);
  if (!user) return null;

  const tierInfo = TIER_DEFAULTS[user.tier] || TIER_DEFAULTS.free;

  return {
    tier: user.tier,
    k_compute_balance: user.k_compute_balance,
    k_compute_used: user.k_compute_used,
    balance_cny: kComputeToCNY(user.k_compute_balance),
    used_cny: kComputeToCNY(user.k_compute_used),
    tier_name: tierInfo.name,
    monthly_limit: tierInfo.monthly_k_compute,
  };
}

// 充值 K算力
export function rechargeKCompute(userId: number, amount: number): void {
  const user = userOperations.findById(userId);
  if (user) {
    userOperations.updateUser(userId, {
      k_compute_balance: user.k_compute_balance + amount,
    });
  }
}

// 設置用戶級別
export function setUserTier(userId: number, tier: string): void {
  const tierInfo = TIER_DEFAULTS[tier as keyof typeof TIER_DEFAULTS];
  if (!tierInfo) return;
  
  userOperations.updateUser(userId, {
    tier: tier as any,
    k_compute_balance: tierInfo.monthly_k_compute,
  });
}
