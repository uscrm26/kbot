import { useEffect, useState } from 'react';
import { useAuthStore } from '~/lib/stores/auth';
import { t } from '~/lib/i18n';

export default function SettingsPage() {
  const authUser = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const [name, setName] = useState(authUser?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(authUser?.avatar_url || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState<any>(authUser);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setProfile(d.user);
          setName(d.user.name || '');
          setAvatarUrl(d.user.avatar_url || '');
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, avatar_url: avatarUrl }),
      });
      const data = await res.json();
      if (data.user) {
        setProfile(data.user);
        setAuth({ ...authUser, ...data.user }, useAuthStore.getState().session!);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {} finally {
      setSaving(false);
    }
  };

  const boundMethods = [
    { key: 'email', label: '電子郵件', value: profile?.email, icon: 'i-ph:envelope', bound: true },
    { key: 'google', label: 'Google', value: profile?.google_id ? '已綁定' : '未綁定', icon: 'i-ph:google-logo', bound: !!profile?.google_id },
    { key: 'github', label: 'GitHub', value: profile?.github_id ? '已綁定' : '未綁定', icon: 'i-ph:github-logo', bound: !!profile?.github_id },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">個人設置</h1>
          <p className="text-gray-500 text-sm mb-8">管理你的個人資料與登入方式</p>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-blue-600">{name.slice(0, 1).toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">頭像 URL</label>
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">顯示名稱</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="你的名字"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">電子郵件</label>
              <input
                type="email"
                value={profile?.email || ''}
                disabled
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-400 mt-1">電子郵件為登入帳號，不可修改</p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
            >
              {saving ? '儲存中...' : saved ? '已儲存' : '儲存變更'}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">已綁定的登入方式</h2>
            <div className="space-y-3">
              {boundMethods.map((m) => (
                <div key={m.key} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200">
                  <div className={`${m.icon} text-xl ${m.bound ? 'text-green-600' : 'text-gray-400'}`} />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{m.label}</div>
                    <div className="text-xs text-gray-500">{m.value}</div>
                  </div>
                  {m.bound && (
                    <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-full">已綁定</span>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3">使用 Google 或 GitHub 登入時，若郵件與現有帳號相同，會自動綁定。</p>
          </div>
        </div>
      </div>
    </div>
  );
}
