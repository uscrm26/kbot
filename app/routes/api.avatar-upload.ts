import fs from 'node:fs';
import path from 'node:path';
import type { ActionFunctionArgs } from 'react-router';
import { getCurrentUser } from '~/lib/server/auth';
import { readJsonBody } from '~/lib/.server/api/read-body';

const ALLOWED_MIME: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export async function action({ request }: ActionFunctionArgs) {
  const user = getCurrentUser(request);

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  // base64 會膨脹，請求體上限放寬到 4MB
  const body = await readJsonBody<{ image?: string }>(request, { maxBytes: 4 * 1024 * 1024 });

  const dataUrl = String(body.image || '');
  const match = /^data:([a-zA-Z0-9/+.-]+);base64,(.+)$/.exec(dataUrl);

  if (!match) {
    return Response.json({ error: 'Invalid image data' }, { status: 400 });
  }

  const mime = match[1];
  const ext = ALLOWED_MIME[mime];

  if (!ext) {
    return Response.json({ error: 'Unsupported image type' }, { status: 400 });
  }

  const buffer = Buffer.from(match[2], 'base64');

  if (buffer.length === 0) {
    return Response.json({ error: 'Empty image' }, { status: 400 });
  }

  if (buffer.length > MAX_IMAGE_BYTES) {
    return Response.json({ error: 'Image exceeds 2MB limit' }, { status: 400 });
  }

  const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
  const uploadDir = path.join(dataDir, 'uploads', 'avatars');
  fs.mkdirSync(uploadDir, { recursive: true });

  const random = globalThis.crypto.randomUUID().slice(0, 12);
  const filename = `avatar-${user.id}-${Date.now()}-${random}.${ext}`;
  fs.writeFileSync(path.join(uploadDir, filename), buffer);

  return Response.json({ url: `/uploads/avatars/${filename}` });
}
