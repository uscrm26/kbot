import { useEffect, useRef, useState } from 'react';
import { Header } from '~/components/header/Header';
import { useAuthStore } from '~/lib/stores/auth';
import { t } from '~/lib/i18n';

type TabKey = 'profile' | 'connections';

export default function SettingsPage() {
  const authUser = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const [tab, setTab] = useState<TabKey>('profile');
  const [name, setName] = useState(authUser?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(authUser?.avatar_url || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(authUser);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d: any) => {
        if (d.user) {
          setProfile(d.user);
          setName(d.user.name || '');
          setAvatarUrl(d.user.avatar_url || '');
        }
      })
      .catch(() => {});

    const params = new URLSearchParams(window.location.search);
    const bound = params.get('oauth_bound');

    if (bound) {
      const label = bound === 'google' ? 'Google' : 'GitHub';
      setMessage(`${label} · ${t('settings.bound')}`);
    }
  }, []);

  const persist = async (avatar = avatarUrl, displayName = name): Promise<any> => {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: displayName, avatar_url: avatar }),
    });
    const data: any = await res.json();

    if (data.user) {
      setProfile(data.user);
      setAuth({ ...authUser, ...data.user }, useAuthStore.getState().session!);
    }

    return data;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const data = await persist();

      if (data.user) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      setMessage(t('settings.upload.fail'));
    } finally {
      setSaving(false);
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage(t('settings.upload.fail'));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage(t('settings.upload.too_big'));
      return;
    }

    const reader = new FileReader();

    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setUploading(true);
      setMessage(null);

      try {
        const res = await fetch('/api/avatar-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: dataUrl }),
        });
        const data: any = await res.json();

        if (data.url) {
          setAvatarUrl(data.url);
          await persist(data.url, name);
          setMessage(t('settings.upload.success'));
        } else {
          setMessage(t('settings.upload.fail'));
        }
      } catch {
        setMessage(t('settings.upload.fail'));
      } finally {
        setUploading(false);
      }
    };

    reader.readAsDataURL(file);
  };

  const connections = [
    { key: 'email', label: t('settings.email'), icon: 'i-ph:envelope-simple', bound: true, value: profile?.email, href: null },
    { key: 'google', label: 'Google', icon: 'i-ph:google-logo', bound: !!profile?.google_id, value: null, href: '/auth/google/callback' },
    { key: 'github', label: 'GitHub', icon: 'i-ph:github-logo', bound: !!profile?.github_id, value: null, href: '/auth/github/callback' },
  ];

  const navItems = [
    { key: 'profile' as TabKey, label: t('settings.nav.profile'), icon: 'i-ph:user' },
    { key: 'connections' as TabKey, label: t('settings.nav.connections'), icon: 'i-ph:plugs-connected' },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-slate-100">
      <Header />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{t('settings.title')}</h1>
              <p className="text-sm text-slate-500 mt-1">{t('settings.subtitle')}</p>
            </div>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              <div className="i-ph:arrow-left text-base" />
              {t('settings.back')}
            </button>
          </div>

          <div className="flex gap-6 items-start">
            <aside className="w-60 shrink-0">
              <nav className="bg-white rounded-2xl border border-slate-200 p-2 sticky top-8">
                {navItems.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      setTab(item.key);
                      setMessage(null);
                    }}
                    className={`flex items-center gap-2.5 w-full text-left px-3.5 py-2.5 text-sm rounded-xl transition-colors ${
                      tab === item.key
                        ? 'bg-slate-900 text-white font-medium'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className={`${item.icon} text-base`} />
                    {item.label}
                  </button>
                ))}
              </nav>
            </aside>

            <main className="flex-1 min-w-0">
              <div className="bg-white rounded-2xl border border-slate-200 p-8">
                {message && (
                  <div className="mb-6 flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700">
                    <div className="i-ph:info text-base text-slate-400" />
                    {message}
                  </div>
                )}

                {tab === 'profile' && (
                  <form onSubmit={handleSave} className="space-y-7">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-3">{t('settings.avatar')}</label>
                      <div className="flex items-center gap-5">
                        <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 shrink-0">
                          {avatarUrl ? (
                            <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-3xl font-bold text-slate-400">
                              {name.slice(0, 1).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <button
                            type="button"
                            onClick={() => fileRef.current?.click()}
                            disabled={uploading}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors font-medium disabled:opacity-50"
                          >
                            <div className="i-ph:upload-simple text-base" />
                            {uploading ? t('settings.uploading') : t('settings.upload')}
                          </button>
                          <p className="text-xs text-slate-400 mt-2">{t('settings.upload.hint')}</p>
                          <input
                            ref={fileRef}
                            type="file"
                            accept="image/png,image/jpeg,image/gif,image/webp"
                            onChange={handleFile}
                            className="hidden"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        {t('settings.avatar.url')}
                      </label>
                      <input
                        type="text"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
                        placeholder="https://example.com/avatar.jpg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        {t('settings.name')}
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
                        placeholder={t('settings.name.placeholder')}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        {t('settings.email')}
                      </label>
                      <input
                        type="email"
                        value={profile?.email || ''}
                        disabled
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 text-sm"
                      />
                      <p className="text-xs text-slate-400 mt-1.5">{t('settings.email.hint')}</p>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium disabled:opacity-50"
                      >
                        {saving ? t('settings.saving') : saved ? t('settings.saved') : t('settings.save')}
                      </button>
                      <span className="text-xs text-slate-400">
                        {t('settings.userid')}: {profile?.id}
                      </span>
                    </div>
                  </form>
                )}

                {tab === 'connections' && (
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 mb-1">
                      {t('settings.connections.title')}
                    </h2>
                    <p className="text-sm text-slate-500 mb-6">{t('settings.connections.hint')}</p>
                    <div className="space-y-3">
                      {connections.map((m) => (
                        <div
                          key={m.key}
                          className="flex items-center gap-4 p-4 rounded-xl border border-slate-200"
                        >
                          <div className={`${m.icon} text-2xl text-slate-500`} />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-slate-900">{m.label}</div>
                            {m.value && <div className="text-xs text-slate-500 truncate">{m.value}</div>}
                          </div>
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full ${
                              m.bound
                                ? 'bg-slate-100 text-slate-700'
                                : 'bg-slate-50 text-slate-400 border border-slate-200'
                            }`}
                          >
                            {m.bound ? t('settings.bound') : t('settings.unbound')}
                          </span>
                          {m.href && (
                            <button
                              type="button"
                              onClick={() => {
                                window.location.href = m.href!;
                              }}
                              className="px-4 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors font-medium whitespace-nowrap"
                            >
                              {m.bound ? t('settings.rebind') : t('settings.bind')}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
