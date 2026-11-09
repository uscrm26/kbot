import { getCurrentUser } from '~/lib/server/auth';
import { db } from '~/lib/server/database';
import { kComputeToCNY } from '~/lib/server/kcompute';
import type { LoaderFunctionArgs } from 'react-router';

// 平台整體統計
export async function loader({ request }: LoaderFunctionArgs) {
  const admin = getCurrentUser(request);

  if (!admin || admin.role !== 'admin') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const activeUsers = db.users.filter((u) => u.is_active).length;
  const publishedWebsites = db.websites.filter((w) => w.status === 'published').length;
  const totalComputeUsed = db.users.reduce((sum, u) => sum + u.k_compute_used, 0);
  const totalComputeBalance = db.users.reduce((sum, u) => sum + u.k_compute_balance, 0);

  const tierBreakdown = {
    free: db.users.filter((u) => u.tier === 'free').length,
    starter: db.users.filter((u) => u.tier === 'starter').length,
    pro: db.users.filter((u) => u.tier === 'pro').length,
    enterprise: db.users.filter((u) => u.tier === 'enterprise').length,
  };

  const roundedUsed = Math.round(totalComputeUsed * 100) / 100;

  return Response.json({
    stats: {
      totalUsers: db.users.length,
      activeUsers,
      totalWebsites: db.websites.length,
      publishedWebsites,
      totalGenerations: db.generation_history.length,
      totalComputeUsed: roundedUsed,
      totalComputeUsedCny: kComputeToCNY(roundedUsed),
      totalComputeBalanceCny: kComputeToCNY(Math.round(totalComputeBalance * 100) / 100),
      cnyPerKCompute: 1,
      tierBreakdown,
    },
  });
}
