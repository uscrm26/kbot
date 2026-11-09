import { getCurrentUser } from '~/lib/server/auth';
import { websiteOperations } from '~/lib/server/database';
import type { ActionFunctionArgs } from 'react-router';

function slugify(input: string): string {
  const base = input
    .toLowerCase()
 .trim()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '');

  // 中文名稱無法直接轉拼音時，使用通用前綴
  if (!base || /^-*$/.test(base)) {
    return 'site';
  }

  return base;
}

// 發布網站 API
export async function action({ request }: ActionFunctionArgs) {
  const user = getCurrentUser(request);

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const body = await request.json();
  const { websiteId } = body;

  if (!websiteId) {
    return Response.json({ error: 'Website ID is required' }, { status: 400 });
  }

  const website = websiteOperations.findById(websiteId);

  if (!website || website.user_id !== user.id) {
    return Response.json({ error: 'Website not found' }, { status: 404 });
  }

  // 生成唯一 slug
  let slug = website.slug || slugify(website.name);
  let candidate = slug;
  let counter = 1;

  while (websiteOperations.findBySlug(candidate)) {
    candidate = `${slug}-${counter}`;
    counter += 1;
  }

  slug = candidate;

  const publicUrl = `/site/${slug}`;

  const updated = websiteOperations.updateWebsite(websiteId, {
    slug,
    status: 'published',
    preview_url: publicUrl,
  });

  return Response.json({
    success: true,
    website: updated,
    publicUrl,
  });
}
