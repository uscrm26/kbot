import { useEffect, useState } from 'react';
import { AuthPage } from '~/components/auth/AuthPage';
import { useAuthStore } from '~/lib/stores/auth';
import { t } from '~/lib/i18n';

interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: string;
  tier: string;
  is_active: boolean;
  k_compute_balance: number;
  k_compute_used: number;
  used_cny: number;
  balance_cny: number;
  created_at: string;
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

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export default function AdminPage() {
  const authUser = useAuthStore((state) => state.user);
  const session = useAuthStore((state) => state.session);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [rechargeTarget, setRechargeTarget] = useState<AdminUser | null>(null);
  const [rechargeAmount, setRechargeAmount] = useState('');

  function authHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(session ? { Authorization: `Bearer ${session}` } : {}),
    };
  }

  async function loadData() {
    setLoading(true);
    try {
      const [usersRes, statsRes] = await Promise.all([
        fetch('/api/admin/users', { headers: authHeaders() }),
        fetch('/api/admin/stats', { headers: authHeaders() }),
      ]);

      if (usersRes.ok && statsRes.ok) {
        const usersData: any = await usersRes.json();
        const statsData: any = await statsRes.json();
        setUsers(usersData.users || []);
        setStats(statsData.stats);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authUser && authUser.role === 'admin') {
      loadData();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser]);

  async function toggleActive(target: AdminUser) {
    await fetch('/api/admin/users', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ userId: target.id, is_active: !target.is_active }),
    });
    await loadData();
  }

  async function submitRecharge() {
    const amount = Number(rechargeAmount);

    if (!rechargeTarget || Number.isNaN(amount) || amount <= 0) {
      return;
    }

    const newBalance = round2(rechargeTarget.k_compute_balance + amount);

    await fetch('/api/admin/users', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ userId: rechargeTarget.id, k_compute_balance: newBalance }),
    });

    setRechargeTarget(null);
    setRechargeAmount('');
    await loadData();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">{t('admin.loading')}</div>
    );
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

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('admin.title')}</h1>
          <p className="text-sm text-slate-500 mt-1">{t('admin.subtitle')}</p>
        </div>

        {stats && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
              <StatCard label={t('admin.totalUsers')} value={String(stats.totalUsers)} icon="i-ph:users" />
              <StatCard label={t('admin.activeUsers')} value={String(stats.activeUsers)} icon="i-ph:user-check" />
              <StatCard label={t('admin.totalWebsites')} value={String(stats.totalWebsites)} icon="i-ph:globe" />
              <StatCard label={t('admin.published')} value={String(stats.publishedWebsites)} icon="i-ph:rocket-launch" />
              <StatCard label={t('admin.generations')} value={String(stats.totalGenerations)} icon="i-ph:lightning" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <StatCard
                label={t('admin.computeUsed')}
                value={`${round2(stats.totalComputeUsed)}`}
                icon="i-ph:cpu"
                accent
              />
              <StatCard
                label={t('admin.computeUsedCny')}
                value={`¥${stats.totalComputeUsedCny.toFixed(2)}`}
                icon="i-ph:currency-cny"
                accent
              />
              <StatCard
                label={t('admin.balanceCny')}
                value={`¥${stats.totalComputeBalanceCny.toFixed(2)}`}
                icon="i-ph:wallet"
                accent
              />
              <StatCard
                label={t('admin.rate')}
                value={`1 = ¥${stats.cnyPerKCompute}`}
                icon="i-ph:arrows-left-right"
                accent
              />
            </div>
          </>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">{t('admin.userManagement')}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-slate-50 text-slate-500">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide">{t('admin.user')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide">{t('admin.tier')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide">{t('admin.used')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide">{t('admin.usedCny')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide">{t('admin.balance')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide">{t('admin.balanceCny')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide">{t('admin.status')}</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide">{t('admin.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/70">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">{row.name}</div>
                      <div className="text-xs text-slate-500">{row.email}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 px-2.5 py-1 text-xs font-medium">
                        {row.tier}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700">{round2(row.k_compute_used)}</td>
                    <td className="px-4 py-4 text-sm font-medium text-slate-900">¥{row.used_cny.toFixed(2)}</td>
                    <td className="px-4 py-4 text-sm text-slate-700">{round2(row.k_compute_balance)}</td>
                    <td className="px-4 py-4 text-sm font-medium text-slate-900">¥{row.balance_cny.toFixed(2)}</td>
                    <td className="px-4 py-4">
                      <span className={row.is_active ? 'text-emerald-600 text-sm' : 'text-rose-500 text-sm'}>
                        {row.is_active ? t('admin.active') : t('admin.inactive')}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setRechargeTarget(row);
                            setRechargeAmount('');
                          }}
                          className="text-xs rounded-md px-2.5 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-100"
                        >
                          {t('admin.recharge')}
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleActive(row)}
                          className="text-xs rounded-md px-2.5 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-100"
                        >
                          {row.is_active ? t('admin.disable') : t('admin.enable')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {rechargeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-1">{t('admin.rechargeTitle')}</h3>
            <p className="text-sm text-slate-500 mb-4">{rechargeTarget.name}</p>
            <input
              type="number"
              min="0"
              value={rechargeAmount}
              onChange={(e) => setRechargeAmount(e.target.value)}
              placeholder={t('admin.enterAmount')}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRechargeTarget(null)}
                className="rounded-lg px-4 py-2 text-sm border border-slate-200 text-slate-600 hover:bg-slate-100"
              >
                {t('admin.cancel')}
              </button>
              <button
                type="button"
                onClick={submitRecharge}
                className="rounded-lg px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700"
              >
                {t('admin.confirm')}
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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col gap-3">
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${
          accent ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'
        }`}
      >
        <div className={icon} />
      </div>
      <div>
        <div className="text-lg font-bold text-slate-900 tracking-tight">{value}</div>
        <div className="text-xs text-slate-500 mt-0.5">{label}</div>
      </div>
    </div>
  );
}
