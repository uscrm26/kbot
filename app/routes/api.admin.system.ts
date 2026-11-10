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
  const settings = systemSettingsOperations.update(body);

  auditOperations.log({
    actor_id: admin.id,
    action: 'update_system_settings',
    category: 'system',
    detail: JSON.stringify(body),
    ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
  });

  return Response.json({ success: true, settings });
}
