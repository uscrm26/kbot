import { getCurrentUser } from '~/lib/server/auth';
import { systemSettingsOperations, auditOperations } from '~/lib/server/database';
import type { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router';

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
  return Response.json({ settings: systemSettingsOperations.getAll() });
}

export async function action({ request }: ActionFunctionArgs) {
  const admin = requireAdmin(request);
  if (!admin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body: any = await request.json();
  const raw = body && typeof body === 'object' && body.settings && typeof body.settings === 'object' ? body.settings : body;

  const allowed = ['guest_access', 'maintenance_mode', 'free_storage_bytes', 'free_compute'];
  const updates: Record<string, any> = {};
  for (const key of allowed) {
    if (key in raw) updates[key] = raw[key];
  }
  if (typeof updates.free_storage_bytes === 'string') updates.free_storage_bytes = Number(updates.free_storage_bytes);
  if (typeof updates.free_compute === 'string') updates.free_compute = Number(updates.free_compute);

  const settings = systemSettingsOperations.update(updates);

  auditOperations.log({
    actor_id: admin.id,
    action: 'update_system_settings',
    category: 'system',
    detail: JSON.stringify(updates),
    ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
  });

  return Response.json({ success: true, settings });
}
