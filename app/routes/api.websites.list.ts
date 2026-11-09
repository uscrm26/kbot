import { getCurrentUser } from '~/lib/server/auth';
import { websiteOperations } from '~/lib/server/database';
import type { LoaderFunctionArgs } from 'react-router';

// 獲取當前用戶的網站列表
export async function loader({ request }: LoaderFunctionArgs) {
  const user = getCurrentUser(request);

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const websites = websiteOperations.findByUserId(user.id).map((w) => ({
    id: w.id,
    name: w.name,
    description: w.description,
    status: w.status,
    custom_domain: w.custom_domain,
    preview_url: w.preview_url,
    created_at: w.created_at,
    updated_at: w.updated_at,
  }));

  return Response.json({ websites });
}
