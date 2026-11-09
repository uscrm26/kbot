import { getCurrentUser } from '~/lib/server/auth';
import { db } from '~/lib/server/database';
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

  const tierBreakdown = {
    free: db.users.filter((u) => u.tier === 'free').length,
    starter: db.users.filter((u) => u.tier === 'starter').length,
    pro: db.users.filter((u) => u.tier === 'pro').length,
    enterprise: db.users.filter((u) => u.tier === 'enterprise').length,
  };

  return Response.json({
    stats: {
      totalUsers: db.users.length,
      activeUsers,
      totalWebsites: db.websites.length,
      publishedWebsites,
      totalGenerations: db.generation_history.length,
      totalComputeUsed: Math.round(totalComputeUsed * 100) / 100,
      tierBreakdown,
    },
  });
}
