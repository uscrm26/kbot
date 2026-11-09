import { useEffect, useState } from 'react';
import { AuthPage } from '~/components/auth/AuthPage';
import { useAuthStore } from '~/lib/stores/auth';
import { t } from '~/lib/i18n';

interface WebsiteItem {
  id: number;
  name: string;
  description?: string;
  status: string;
  slug?: string;
  custom_domain?: string;
  preview_url?: string;
  updated_at: string;
}

export default function DashboardPage() {
  const authUser = useAuthStore((state) => state.user);
  const setAuth = useAuthStore((state) => state.setAuth);
  const [loading, setLoading] = useState(true);
  const [websites, setWebsites] = useState<WebsiteItem[]>([]);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [domainTarget, setDomainTarget] = useState<WebsiteItem | null>(null);
  const [domainInput, setDomainInput] = useState('');
  const [domainResult, setDomainResult] = useState<string>('');
  const [notice, setNotice] = useState('');

  async function loadWebsites() {
    const session = useAuthStore.getState().session;
    const response = await fetch('/api/websites/list', {
      headers: session ? { Authorization: `Bearer ${session}` } : {},
    });

    if (response.ok) {
      const data = await response.json();
      setWebsites(data.websites || []);
    }
  }

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      const session = useAuthStore.getState().session;

      if (!session) {
        if (active) {
          setLoading(false);
        }

        return;
      }

      try {
        const meResponse = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${session}` },
        });
        const meData = await meResponse.json();

        if (meData.user) {
          setAuth(meData.user, session);
        }

        if (active) {
          await loadWebsites();
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    bootstrap();

    return () => {
      active = false;
    };
  }, []);

  async function handlePublish(website: WebsiteItem) {
    const session = useAuthStore.getState().session;
    setBusyId(website.id);

    const response = await fetch('/api/websites/publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session}`,
      },
      body: JSON.stringify({ websiteId: website.id }),
    });

    if (response.ok) {
      setNotice(t('dashboard.publish.success'));
      await loadWebsites();
    } else {
      setNotice(t('dashboard.publish.failed'));
    }

    setBusyId(null);
    setTimeout(() => setNotice(''), 4000);
  }

  async function handleBindDomain() {
    const session = useAuthStore.getState().session;
    setDomainResult('');

    const response = await fetch('/api/domains/bind', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session}`,
      },
      body: JSON.stringify({ websiteId: domainTarget?.id, customDomain: domainInput.trim() }),
    });

    const data = await response.json();

    if (response.ok) {
      setDomainResult(data.instruction || t('dashboard.domain.bound'));
      await loadWebsites();
    } else {
      setDomainResult(data.error || t('dashboard.domain.failed'));
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        {t('auth.loading')}
      </div>
    );
  }

  if (!authUser) {
    return (
      <AuthPage
        onSuccess={(user, session) => {
          setAuth(user, session);
          window.location.reload();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('dashboard.title')}</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">{t('kcompute.tier')}</div>
            <div className="text-lg font-semibold text-gray-900">
              {t(`kcompute.tier.${authUser.tier}`)}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">{t('kcompute.balance')}</div>
            <div className="text-lg font-semibold text-blue-600">
              {Math.round(authUser.k_compute_balance)}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">{t('kcompute.used')}</div>
            <div className="text-lg font-semibold text-gray-900">
              {Math.round(authUser.k_compute_used)}
            </div>
          </div>
        </div>

        {notice && (
          <div className="mb-4 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
            {notice}
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{t('dashboard.my.websites')}</h2>
          <button
            type="button"
            onClick={() => {
              window.location.href = '/';
            }}
            className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            {t('dashboard.create')}
          </button>
        </div>

        {websites.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
            {t('dashboard.empty')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {websites.map((website) => (
              <div
                key={website.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{website.name}</h3>
                    {website.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {website.description}
                      </p>
                    )}
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      website.status === 'published'
                        ? 'bg-green-50 text-green-600'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {website.status === 'published' ? t('admin.active') : t('dashboard.draft')}
                  </span>
                </div>

                {website.slug && (
                  <a
                    href={`/site/${website.slug}`}
                    className="text-sm text-blue-600 hover:underline break-all"
                  >
                    {`/site/${website.slug}`}
                  </a>
                )}

                {website.custom_domain && (
                  <div className="text-sm text-gray-500 mt-1 break-all">
                    {website.custom_domain}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mt-4">
                  {website.status !== 'published' && (
                    <button
                      type="button"
                      disabled={busyId === website.id}
                      onClick={() => handlePublish(website)}
                      className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {busyId === website.id ? t('auth.loading') : t('dashboard.publish')}
                    </button>
                  )}
                  {website.slug && (
                    <button
                      type="button"
                      onClick={() => {
                        window.open(`/site/${website.slug}`, '_blank');
                      }}
                      className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                    >
                      {t('dashboard.open')}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setDomainTarget(website);
                      setDomainInput(website.custom_domain || '');
                      setDomainResult('');
                    }}
                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    {t('dashboard.domain')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {domainTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setDomainTarget(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-7 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{t('dashboard.domain.title')}</h3>
              <button
                type="button"
                onClick={() => setDomainTarget(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <div className="i-ph:x text-xl" />
              </button>
            </div>
            <input
              type="text"
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              placeholder="www.example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
            />
            <button
              type="button"
              onClick={handleBindDomain}
              className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {t('dashboard.domain.bind')}
            </button>
            {domainResult && (
              <pre className="mt-4 whitespace-pre-wrap text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                {domainResult}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
