import { getCurrentUser } from '~/lib/server/auth';
import { userOperations, websiteOperations, historyOperations, auditOperations, db } from '~/lib/server/database';
import { kComputeToCNY } from '~/lib/server/kcompute';
import type { LoaderFunctionArgs } from 'react-router';

function requireAdmin(request: Request): any | null {
  const user = getCurrentUser(request);
  if (!user || user.role !== 'admin') return null;
  return user;
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const admin = requireAdmin(request);
  if (!admin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const userId = Number(url.searchParams.get('userId') || params.userId);
  if (!userId) {
    return Response.json({ error: 'User ID required' }, { status: 400 });
  }

  const user = userOperations.findById(userId);
  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  const websites = websiteOperations.findByUserId(userId).map(w => ({
    id: w.id,
    name: w.name,
    slug: w.slug,
    custom_domain: w.custom_domain,
    status: w.status,
    storage_bytes: w.storage_bytes,
    created_at: w.created_at,
    updated_at: w.updated_at,
  }));

  const history = historyOperations.findByUserId(userId).slice(-50).reverse();
  const audit = auditOperations.findByUserId(userId).slice(-50);

  const totalStorage = websites.reduce((sum, w) => sum + (w.storage_bytes || 0), 0);
  const { password_hash, ...safeUser } = user;

  return Response.json({
    user: {
      ...safeUser,
      used_cny: kComputeToCNY(user.k_compute_used),
      balance_cny: kComputeToCNY(user.k_compute_balance),
      storage_used_bytes: totalStorage,
      storage_percent: user.storage_quota_bytes > 0
        ? Math.round((totalStorage / user.storage_quota_bytes) * 100)
        : 0,
    },
    websites,
    history,
    audit,
  });
}
