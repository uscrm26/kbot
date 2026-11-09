import { useState } from 'react';
import { workbenchStore } from '~/lib/stores/workbench';
import { useAuthStore } from '~/lib/stores/auth';
import { t } from '~/lib/i18n';
import { WORK_DIR } from '~/utils/constants';

interface SaveResult {
  ok: boolean;
  previewUrl?: string;
  error?: string;
}

export function SaveWebsiteButton() {
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<SaveResult | null>(null);
  const session = useAuthStore((state) => state.session);

  async function handleSave() {
    setSaving(true);
    setResult(null);

    const fileMap = workbenchStore.files.get();
    const payload: Record<string, string> = {};

    Object.entries(fileMap).forEach(([filePath, dirent]) => {
      if (dirent && dirent.type === 'file' && !filePath.includes('node_modules')) {
        const relativePath = filePath.startsWith(WORK_DIR)
          ? filePath.slice(WORK_DIR.length).replace(/^\//, '')
          : filePath.replace(/^\//, '');

        payload[relativePath] = dirent.content;
      }
    });

    if (Object.keys(payload).length === 0) {
      setSaving(false);
      setResult({ ok: false, error: t('save.website.empty') });
      return;
    }

    const description = document.title || t('save.website.default.name');

    try {
      const response = await fetch('/api/websites/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session ? { Authorization: `Bearer ${session}` } : {}),
        },
        body: JSON.stringify({
          name: description,
          description,
          files: payload,
        }),
      });

      const data: any = await response.json();

      if (response.ok) {
        setResult({ ok: true, previewUrl: data.previewUrl });
      } else {
        setResult({ ok: false, error: data.error || t('save.website.failed') });
      }
    } catch {
      setResult({ ok: false, error: t('save.website.failed') });
    }

    setSaving(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="rounded-md items-center justify-center px-3 py-1.5 text-xs bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor text-bolt-elements-textPrimary flex gap-1.5 hover:bg-bolt-elements-background-depth-3 disabled:opacity-60"
        title={t('save.website')}
      >
        <div className="i-ph:floppy-disk" />
        <span>{saving ? t('auth.loading') : t('save.website')}</span>
      </button>

      {result && (
        <div className="absolute right-0 top-full mt-2 min-w-[240px] rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 shadow-lg z-50 p-3">
          {result.ok ? (
            <div className="text-sm">
              <div className="text-green-600 mb-2">{t('save.website.success')}</div>
              <button
                type="button"
                onClick={() => {
                  window.location.href = '/dashboard';
                }}
                className="text-blue-600 hover:underline"
              >
                {t('save.website.go')}
              </button>
            </div>
          ) : (
            <div className="text-sm text-red-500">{result.error}</div>
          )}
        </div>
      )}
    </div>
  );
}
