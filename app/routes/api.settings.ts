import { getCurrentUser, createUserSession } from '~/lib/server/auth';
import { userOperations } from '~/lib/server/database';
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';

export async function loader({ request }: LoaderFunctionArgs) {
  const user = getCurrentUser(request);
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { password_hash, ...safe } = user;
  return Response.json({ user: safe });
}

export async function action({ request }: ActionFunctionArgs) {
  const user = getCurrentUser(request);
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const body: any = await request.json();
  const updates: any = {};

  if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (name.length < 2 || name.length > 30) {
      return Response.json({ error: 'Name must be 2-30 characters' }, { status: 400 });
    }
    updates.name = name;
  }

  if (body.avatar_url !== undefined) {
    updates.avatar_url = String(body.avatar_url);
  }

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: 'Nothing to update' }, { status: 400 });
  }

  const updated = userOperations.updateUser(user.id, updates);
  const { password_hash, ...safe } = updated!;
  return Response.json({ user: safe });
}
