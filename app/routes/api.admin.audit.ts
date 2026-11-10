import { getCurrentUser } from '~/lib/server/auth';
import { auditOperations } from '~/lib/server/database';
import type { LoaderFunctionArgs } from 'react-router';

function requireAdmin(request: Request): any | null {
  const user = getCurrentUser(request);
  if (!user || user.role !== 'admin') return null;
  return user;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const admin = requireAdmin(request);
  if (!admin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const category = url.searchParams.get('category');
  const limit = Number(url.searchParams.get('limit') || 200);

  const logs = category
    ? auditOperations.findByCategory(category, limit)
    : auditOperations.getAll(limit);

  return Response.json({ logs });
}
