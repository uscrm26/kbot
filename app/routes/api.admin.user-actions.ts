import crypto from 'crypto';
import { getCurrentUser, createUserSession } from '~/lib/server/auth';
import { userOperations, auditOperations, websiteOperations } from '~/lib/server/database';
import type { ActionFunctionArgs } from 'react-router';

function requireAdmin(request: Request): any | null {
  const user = getCurrentUser(request);
  if (!user || user.role !== 'admin') return null;
  return user;
}

function getClientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
}

export async function action({ request }: ActionFunctionArgs) {
  const admin = requireAdmin(request);
  if (!admin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body: any = await request.json();
  const { action: op, userId } = body;
  const ip = getClientIp(request);

  if (!userId) {
    return Response.json({ error: 'User ID required' }, { status: 400 });
  }

  const target = userOperations.findById(userId);
  if (!target) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  switch (op) {
    case 'reset_email': {
      const newEmail = String(body.email || '').trim().toLowerCase();
      if (!newEmail || !newEmail.includes('@')) {
        return Response.json({ error: 'Invalid email' }, { status: 400 });
      }
      if (userOperations.findByEmail(newEmail)) {
        return Response.json({ error: 'Email already in use' }, { status: 409 });
      }
      userOperations.updateUser(userId, { email: newEmail });
      auditOperations.log({
        actor_id: admin.id, user_id: userId, action: 'reset_email',
        category: 'admin', detail: `Email changed to ${newEmail}`, ip,
      });
      return Response.json({ success: true });
    }

    case 'reset_password': {
      const newPassword = String(body.password || '');
      if (newPassword.length < 6) {
        return Response.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
      }
      const hash = crypto.createHash('sha256').update(newPassword).digest('hex');
      userOperations.updateUser(userId, { password_hash: hash });
      auditOperations.log({
        actor_id: admin.id, user_id: userId, action: 'reset_password',
        category: 'admin', detail: 'Password reset', ip,
      });
      return Response.json({ success: true });
    }

    case 'impersonate': {
      const token = createUserSession(userId);
      auditOperations.log({
        actor_id: admin.id, user_id: userId, action: 'impersonate',
        category: 'admin', detail: `Admin impersonated ${target.email}`, ip,
      });
      return Response.json({ success: true, session: token, user: target });
    }

    case 'adjust_compute': {
      const amount = Number(body.amount);
      if (Number.isNaN(amount)) {
        return Response.json({ error: 'Invalid amount' }, { status: 400 });
      }
      const newBalance = Math.max(0, Math.round((target.k_compute_balance + amount) * 100) / 100);
      userOperations.updateUser(userId, { k_compute_balance: newBalance });
      auditOperations.log({
        actor_id: admin.id, user_id: userId, action: 'adjust_compute',
        category: 'billing', detail: `Adjusted by ${amount}, new balance ${newBalance}`, ip,
      });
      return Response.json({ success: true, newBalance });
    }

    case 'set_compute': {
      const value = Number(body.value);
      if (Number.isNaN(value) || value < 0) {
        return Response.json({ error: 'Invalid value' }, { status: 400 });
      }
      userOperations.updateUser(userId, { k_compute_balance: value });
      auditOperations.log({
        actor_id: admin.id, user_id: userId, action: 'set_compute',
        category: 'billing', detail: `Set to ${value}`, ip,
      });
      return Response.json({ success: true });
    }

    case 'set_storage_quota': {
      const bytes = Number(body.bytes);
      if (Number.isNaN(bytes) || bytes < 0) {
        return Response.json({ error: 'Invalid bytes' }, { status: 400 });
      }
      userOperations.updateUser(userId, { storage_quota_bytes: bytes });
      auditOperations.log({
        actor_id: admin.id, user_id: userId, action: 'set_storage_quota',
        category: 'admin', detail: `Storage quota set to ${bytes}`, ip,
      });
      return Response.json({ success: true });
    }

    case 'set_active': {
      const is_active = body.is_active !== undefined ? !!body.is_active : !target.is_active;
      userOperations.updateUser(userId, { is_active });
      auditOperations.log({
        actor_id: admin.id, user_id: userId, action: is_active ? 'enable_user' : 'disable_user',
        category: 'admin', detail: `User ${is_active ? 'enabled' : 'disabled'}`, ip,
      });
      return Response.json({ success: true, is_active });
    }

    case 'set_role': {
      const role = body.role === 'admin' ? 'admin' : 'user';
      userOperations.updateUser(userId, { role });
      auditOperations.log({
        actor_id: admin.id, user_id: userId, action: 'set_role',
        category: 'admin', detail: `Role set to ${role}`, ip,
      });
      return Response.json({ success: true });
    }

    case 'delete_user': {
      if (userId === admin.id) {
        return Response.json({ error: 'Cannot delete yourself' }, { status: 400 });
      }
      userOperations.deleteUser(userId);
      auditOperations.log({
        actor_id: admin.id, user_id: userId, action: 'delete_user',
        category: 'admin', detail: `User ${target.email} deleted`, ip,
      });
      return Response.json({ success: true });
    }

    default:
      return Response.json({ error: 'Unknown action' }, { status: 400 });
  }
}
