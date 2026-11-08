import { useEffect, useState } from 'react';
import { AuthPage } from '~/components/auth/AuthPage';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  is_active: number;
  created_at: string;
  last_login_at: string;
  max_generations: number;
  max_modifications: number;
  max_websites: number;
  used_generations: number;
  used_modifications: number;
  used_websites: number;
}

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 檢查用戶是否已登入
    const session = document.cookie
      .split('; ')
      .find(row => row.startsWith('kbot_session='))
      ?.split('=')[1];

    if (!session) {
      setLoading(false);
      return;
    }

    // 獲取用戶信息
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user && data.user.role === 'admin') {
          setUser(data.user);
          // 獲取用戶列表
          return fetch('/api/admin/users');
        }
        throw new Error('Not admin');
      })
      .then(res => res.json())
      .then(data => {
        setUsers(data.users || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <AuthPage onSuccess={() => window.location.reload()} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">管理後台</h1>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">用戶管理</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">用戶</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">角色</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">生成次數</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">修改次數</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">網站數</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">狀態</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(u => (
                  <tr key={u.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{u.name}</div>
                      <div className="text-sm text-gray-500">{u.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {u.role === 'admin' ? '管理員' : '用戶'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {u.used_generations} / {u.max_generations}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {u.used_modifications} / {u.max_modifications}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {u.used_websites} / {u.max_websites}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={u.is_active ? 'text-green-600' : 'text-red-600'}>
                        {u.is_active ? '啟用' : '禁用'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
