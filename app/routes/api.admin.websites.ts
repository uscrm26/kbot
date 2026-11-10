import { getCurrentUser } from '~/lib/server/auth';
import { websiteOperations, db, auditOperations } from '~/lib/server/database';
import type { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router';

function requireAdmin(request: Request): any | null {
  const user = getCurrentUser(request);

  if (!user || user.role !== 'admin') {
    return null;
  }

  return user;
}

// 獲取全部網站
export async function loader({ request }: LoaderFunctionArgs) {
  const admin = requireAdmin(request);

  if (!admin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const websites = db.websites.map((w) => ({
    id: w.id,
    user_id: w.user_id,
    name: w.name,
    slug: w.slug,
    custom_domain: w.custom_domain,
    status: w.status,
    storage_bytes: w.storage_bytes,
    created_at: w.created_at,
    updated_at: w.updated_at,
  }));

  return Response.json({ websites });
}

// 管理員調整網站狀態
export async function action({ request }: ActionFunctionArgs) {
  const admin = requireAdmin(request);

  if (!admin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const body: any = await request.json();
  const { websiteId, status, action: op } = body;

  if (op === 'delete') {
    if (!websiteId) {
      return Response.json({ error: 'Website ID required' }, { status: 400 });
    }
    const website = websiteOperations.findById(websiteId);
    if (!website) {
      return Response.json({ error: 'Website not found' }, { status: 404 });
    }
    websiteOperations.deleteWebsite(websiteId);
    auditOperations.log({
      actor_id: admin.id, user_id: website.user_id, action: 'delete_website',
      category: 'website', detail: `Deleted ${website.name}`,
      ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
    });
    return Response.json({ success: true });
  }

  if (!websiteId || !status) {
    return Response.json({ error: 'Website ID and status are required' }, { status: 400 });
  }

  const website = websiteOperations.findById(websiteId);

  if (!website) {
    return Response.json({ error: 'Website not found' }, { status: 404 });
  }

  websiteOperations.updateWebsite(websiteId, { status });

  auditOperations.log({
    actor_id: admin.id, user_id: website.user_id, action: 'update_website_status',
    category: 'website', detail: `Status set to ${status}`,
    ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
  });

  return Response.json({ success: true });
}
