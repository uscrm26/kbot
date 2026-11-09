import { getCurrentUser } from '~/lib/server/auth';
import { getUserKCompute } from '~/lib/server/kcompute';
import type { LoaderFunctionArgs } from 'react-router';

// 獲取當前用戶 K 算力信息
export async function loader({ request }: LoaderFunctionArgs) {
  const user = getCurrentUser(request);

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const compute = getUserKCompute(user.id);

  return Response.json({ compute });
}
