import { useEffect, useState } from 'react';
import { AuthPage } from '~/components/auth/AuthPage';
import { useAuthStore } from '~/lib/stores/auth';

interface AdminUser {
  id: number;
  email: string;
  name: string;
  username?: string;
  role: string;
  tier: string;
  is_active: boolean;
  k_compute_balance: number;
  k_compute_used: number;
  storage_quota_bytes: number;
  used_cny: number;
  balance_cny: number;
  created_at: string;
  last_login_at?: string;
}

interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalWebsites: number;
  publishedWebsites: number;
  totalGenerations: number;
  totalComputeUsed: number;
  totalComputeUsedCny: number;
  totalComputeBalanceCny: number;
  cnyPerKCompute: number;
}

interface UserDetail {
  user: any;
  websites: any[];
  history: any[];
  audit: any[];
}

type Tab = 'overview' | 'users' | 'websites' | 'audit' | 'system';

function formatBytes(bytes: number): string {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let v = bytes;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

export default function AdminPage() {
  const authUser = useAuthStore((s) => s.user);
  const session = useAuthStore((s) => s.session);
  const [tab, setTab] = useState<Tab>('overview');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [allWebsites, setAllWebsites] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [systemSettings, setSystemSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [modal, setModal] = useState<{ type: string; target: any } | null>(null);
  const [modalValue, setModalValue] = useState('');

  function headers() {
    return {
      'Content-Type': 'application/json',
      ...(session ? { Authorization: `Bearer ${session}` } : {}),
    };
  }

  async function loadAll() {
    setLoading(true);
    try {
      const [uRes, sRes, wRes, aRes, sysRes] = await Promise.all([
        fetch('/api/admin/users', { headers: headers() }),
        fetch('/api/admin/stats', { headers: headers() }),
        fetch('/api/admin/websites', { headers: headers() }),
        fetch('/api/admin/audit', { headers: headers() }),
        fetch('/api/admin/system', { headers: headers() }),
      ]);
      if (uRes.ok) { const d = await uRes.json(); setUsers(d.users || []); }
      if (sRes.ok) { const d = await sRes.json(); setStats(d.stats); }
      if (wRes.ok) { const d = await wRes.json(); setAllWebsites(d.websites || []); }
      if (aRes.ok) { const d = await aRes.json(); setAuditLogs(d.logs || []); }
      if (sysRes.ok) { const d = await sysRes.json(); setSystemSettings(d.settings || {}); }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authUser?.role === 'admin') loadAll();
    else setLoading(false);
  }, [authUser]);

  async function openDetail(userId: number) {
    const res = await fetch(`/api/admin/user-detail?userId=${userId}`, { headers: headers() });
    if (res.ok) setDetail(await res.json());
  }

  async function userAction(action: string, userId: number, extra: any = {}) {
    await fetch('/api/admin/user-actions', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ action, userId, ...extra }),
    });
    setModal(null);
    setModalValue('');
    await loadAll();
    if (detail) openDetail(userId);
  }

  async function websiteAction(action: string, websiteId: number, extra: any = {}) {
    await fetch('/api/admin/websites', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ action, websiteId, ...extra }),
    });
    await loadAll();
  }

  async function saveSystemSettings() {
    await fetch('/api/admin/system', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(systemSettings),
    });
    await loadAll();
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">載入中...</div>;
  }

  if (!authUser || authUser.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
          <AuthPage onSuccess={() => window.location.reload()} />
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'overview', label: '概覽', icon: 'i-ph:squares-four' },
    { key: 'users', label: '用戶管理', icon: 'i-ph:users' },
    { key: 'websites', label: '網站管理', icon: 'i-ph:globe' },
    { key: 'audit', label: '審計記錄', icon: 'i-ph:list-magnifying-glass' },
    { key: 'system', label: '系統設置', icon: 'i-ph:gear' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">管理後台</h1>
          <p className="text-sm text-slate-500 mt-1">平台營運數據與用戶管理</p>
        </div>

        <div className="flex gap-1 mb-6 bg-white rounded-xl border border-slate-200 p-1.5 w-fit">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.key ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className={t.icon} />
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'overview' && stats && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <StatCard label="總用戶" value={String(stats.totalUsers)} icon="i-ph:users" />
              <StatCard label="活躍用戶" value={String(stats.activeUsers)} icon="i-ph:user-check" />
              <StatCard label="總網站" value={String(stats.totalWebsites)} icon="i-ph:globe" />
              <StatCard label="已發布" value={String(stats.publishedWebsites)} icon="i-ph:rocket-launch" />
              <StatCard label="生成次數" value={String(stats.totalGenerations)} icon="i-ph:lightning" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard label="已用算力" value={round2(stats.totalComputeUsed).toString()} icon="i-ph:cpu" accent />
              <StatCard label="已用金額" value={`¥${stats.totalComputeUsedCny.toFixed(2)}`} icon="i-ph:currency-cny" accent />
              <StatCard label="剩餘算力金額" value={`¥${stats.totalComputeBalanceCny.toFixed(2)}`} icon="i-ph:wallet" accent />
              <StatCard label="匯率" value={`1 = ¥${stats.cnyPerKCompute}`} icon="i-ph:arrows-left-right" accent />
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-slate-50 text-slate-500">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">用戶</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">角色</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">方案</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">算力</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">儲存</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">狀態</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-slate-900">{u.name}</div>
                        <div className="text-xs text-slate-500">{u.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${u.role === 'admin' ? 'bg-purple-50 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{u.tier}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{round2(u.k_compute_balance)}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{formatBytes(u.storage_quota_bytes)}</td>
                      <td className="px-4 py-3">
                        <span className={u.is_active ? 'text-emerald-600 text-sm' : 'text-rose-500 text-sm'}>
                          {u.is_active ? '啟用' : '停用'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1.5 flex-wrap">
                          <ActionBtn label="詳情" onClick={() => openDetail(u.id)} />
                          <ActionBtn label="算力" onClick={() => { setModal({ type: 'compute', target: u }); setModalValue(''); }} />
                          <ActionBtn label={u.is_active ? '停用' : '啟用'} onClick={() => userAction('set_active', u.id, { is_active: !u.is_active })} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'websites' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-slate-50 text-slate-50">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">網站</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">用戶 ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">大小</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">狀態</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allWebsites.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-slate-900">{w.name}</div>
                        {w.slug && <div className="text-xs text-slate-500">/{w.slug}</div>}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{w.user_id}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{formatBytes(w.storage_bytes)}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{w.status}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1.5">
                          <ActionBtn
                            label={w.status === 'disabled' ? '啟用' : '停用'}
                            onClick={() => websiteAction('set_status', w.id, { status: w.status === 'disabled' ? 'published' : 'disabled' })}
                          />
                          <ActionBtn label="刪除" danger onClick={() => websiteAction('delete', w.id)} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'audit' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="divide-y divide-slate-100">
              {auditLogs.map((l) => (
                <div key={l.id} className="px-4 py-3 flex items-start gap-3">
                  <div className={`mt-0.5 w-2 h-2 rounded-full mt-1.5 ${
                    l.category === 'auth' ? 'bg-blue-500' :
                    l.category === 'admin' ? 'bg-purple-500' :
                    l.category === 'website' ? 'bg-green-500' :
                    l.category === 'billing' ? 'bg-amber-500' : 'bg-slate-400'
                  }`} />
                  <div className="flex-1">
                    <div className="text-sm text-slate-900">{l.action}</div>
                    {l.detail && <div className="text-xs text-slate-500 mt-0.5">{l.detail}</div>}
                  </div>
                  <div className="text-xs text-slate-400 whitespace-nowrap">
                    {new Date(l.created_at).toLocaleString('zh-HK')}
                  </div>
                </div>
              ))}
              {auditLogs.length === 0 && (
                <div className="px-4 py-12 text-center text-sm text-slate-400">暫無審計記錄</div>
              )}
            </div>
          </div>
        )}

        {tab === 'system' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-2xl space-y-5">
            <h2 className="text-lg font-semibold text-slate-900">系統功能開關</h2>

            <ToggleRow
              label="訪客訪問"
              description="允許未登入用戶使用生成功能"
              checked={!!systemSettings.guest_access}
              onChange={(v) => setSystemSettings({ ...systemSettings, guest_access: v })}
            />
            <ToggleRow
              label="維護模式"
              description="開啟後所有用戶看到維護提示，管理員可正常訪問"
              checked={!!systemSettings.maintenance_mode}
              onChange={(v) => setSystemSettings({ ...systemSettings, maintenance_mode: v })}
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">免費用戶儲存配額（bytes）</label>
              <input
                type="number"
                value={systemSettings.free_storage_bytes || 0}
                onChange={(e) => setSystemSettings({ ...systemSettings, free_storage_bytes: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              />
              <p className="text-xs text-slate-400 mt-1">當前值：{formatBytes(systemSettings.free_storage_bytes || 0)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">免費用戶初始算力</label>
              <input
                type="number"
                value={systemSettings.free_compute || 0}
                onChange={(e) => setSystemSettings({ ...systemSettings, free_compute: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <button
              onClick={saveSystemSettings}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              儲存設置
            </button>
          </div>
        )}
      </div>

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setDetail(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{detail.user.name}</h3>
                <p className="text-xs text-slate-500">{detail.user.email}</p>
              </div>
              <button onClick={() => setDetail(null)} className="text-slate-400 hover:text-slate-600">
                <div className="i-ph:x text-xl" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <InfoBox label="角色" value={detail.user.role} />
                <InfoBox label="方案" value={detail.user.tier} />
                <InfoBox label="算力餘額" value={round2(detail.user.k_compute_balance).toString()} />
                <InfoBox label="已用算力" value={round2(detail.user.k_compute_used).toString()} />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-slate-600">儲存使用</span>
                  <span className="text-slate-500">
                    {formatBytes(detail.user.storage_used_bytes)} / {formatBytes(detail.user.storage_quota_bytes)}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${detail.user.storage_percent > 90 ? 'bg-rose-500' : 'bg-blue-500'}`}
                    style={{ width: `${Math.min(100, detail.user.storage_percent)}%` }}
                  />
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <ActionBtn label="重設電郵" onClick={() => setModal({ type: 'email', target: detail.user })} />
                <ActionBtn label="重設密碼" onClick={() => setModal({ type: 'password', target: detail.user })} />
                <ActionBtn label="調整算力" onClick={() => setModal({ type: 'compute', target: detail.user })} />
                <ActionBtn label="調整儲存" onClick={() => setModal({ type: 'storage', target: detail.user })} />
                <ActionBtn label="模擬登入" onClick={() => userAction('impersonate', detail.user.id)} />
                <ActionBtn label="刪除用戶" danger onClick={() => { if (confirm('確認刪除此用戶及其所有網站？')) userAction('delete_user', detail.user.id); }} />
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-2">用戶網站（{detail.websites.length}）</h4>
                <div className="space-y-2">
                  {detail.websites.map((w) => (
                    <div key={w.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                      <div>
                        <div className="text-sm font-medium text-slate-900">{w.name}</div>
                        <div className="text-xs text-slate-500">{w.status} · {formatBytes(w.storage_bytes)}</div>
                      </div>
                      <div className="flex gap-1.5">
                        <ActionBtn label="刪除" danger onClick={() => websiteAction('delete', w.id)} />
                      </div>
                    </div>
                  ))}
                  {detail.websites.length === 0 && <p className="text-sm text-slate-400">暫無網站</p>}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-2">生成歷史</h4>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {detail.history.map((h) => (
                    <div key={h.id} className="text-xs text-slate-600 flex gap-2">
                      <span className="text-slate-400">{new Date(h.created_at).toLocaleDateString('zh-HK')}</span>
                      <span className="truncate">{h.prompt}</span>
                    </div>
                  ))}
                  {detail.history.length === 0 && <p className="text-xs text-slate-400">暫無歷史</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-1">
              {modal.type === 'email' && '重設電郵'}
              {modal.type === 'password' && '重設密碼'}
              {modal.type === 'compute' && '調整算力'}
              {modal.type === 'storage' && '調整儲存配額'}
            </h3>
            <p className="text-sm text-slate-500 mb-4">{modal.target.name || modal.target.email}</p>

            {modal.type === 'email' && (
              <input type="email" value={modalValue} onChange={(e) => setModalValue(e.target.value)}
                placeholder="新電郵地址" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm mb-4" />
            )}
            {modal.type === 'password' && (
              <input type="text" value={modalValue} onChange={(e) => setModalValue(e.target.value)}
                placeholder="新密碼（至少 6 位）" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm mb-4" />
            )}
            {modal.type === 'compute' && (
              <input type="number" value={modalValue} onChange={(e) => setModalValue(e.target.value)}
                placeholder="正數增加，負數扣減" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm mb-4" />
            )}
            {modal.type === 'storage' && (
              <input type="number" value={modalValue} onChange={(e) => setModalValue(e.target.value)}
                placeholder="bytes，例如 10485760 = 10MB" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm mb-4" />
            )}

            <div className="flex justify-end gap-2">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-600">
                取消
              </button>
              <button
                onClick={() => {
                  const id = modal.target.id;
                  if (modal.type === 'email') userAction('reset_email', id, { email: modalValue });
                  else if (modal.type === 'password') userAction('reset_password', id, { password: modalValue });
                  else if (modal.type === 'compute') userAction('adjust_compute', id, { amount: Number(modalValue) });
                  else if (modal.type === 'storage') userAction('set_storage_quota', id, { bytes: Number(modalValue) });
                }}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                確認
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, accent }: { label: string; value: string; icon: string; accent?: boolean }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col gap-3">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${accent ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'}`}>
        <div className={icon} />
      </div>
      <div>
        <div className="text-lg font-bold text-slate-900">{value}</div>
        <div className="text-xs text-slate-500 mt-0.5">{label}</div>
      </div>
    </div>
  );
}

function ActionBtn({ label, onClick, danger }: { label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs rounded-md px-2.5 py-1.5 border transition-colors ${
        danger
          ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
          : 'border-slate-200 text-slate-600 hover:bg-slate-100'
      }`}
    >
      {label}
    </button>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg bg-slate-50">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-sm font-medium text-slate-900 mt-0.5">{value}</div>
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm font-medium text-slate-900">{label}</div>
        <div className="text-xs text-slate-500 mt-0.5">{description}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-slate-300'}`}
      >
        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}
