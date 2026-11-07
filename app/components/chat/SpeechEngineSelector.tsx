import { useState } from 'react';
import { t } from '~/lib/i18n';
import type { SpeechEngine } from '~/lib/i18n';

interface SpeechEngineSelectorProps {
  engine: SpeechEngine;
  onChange: (engine: SpeechEngine) => void;
}

export function SpeechEngineSelector({ engine, onChange }: SpeechEngineSelectorProps) {
  const [open, setOpen] = useState(false);

  const label = engine === 'doubao' ? t('speech.engine.doubao') : t('speech.engine.browser');

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        title={t('speech.engine')}
        className="transition-all flex items-center gap-1 rounded-md px-1.5 py-1 text-xs bg-bolt-elements-item-backgroundDefault text-bolt-elements-item-contentDefault hover:bg-bolt-elements-item-backgroundActive"
      >
        <div className="i-ph:gear text-lg" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-0 mb-1 bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor rounded-md shadow-lg z-50 w-max">
            <div className="px-2.5 py-1 text-xs text-bolt-elements-textSecondary border-b border-bolt-elements-borderColor whitespace-nowrap">
              {t('speech.engine')}
            </div>
            <button
              type="button"
              onClick={() => {
                onChange('browser');
                setOpen(false);
              }}
              className={`flex items-center gap-1.5 w-full text-left px-2.5 py-1.5 text-xs whitespace-nowrap hover:bg-bolt-elements-background-depth-3 ${
                engine === 'browser' ? 'text-accent-500 font-medium' : 'text-bolt-elements-textPrimary'
              }`}
            >
              <div className="i-ph:globe text-sm" />
              <span>{t('speech.engine.browser')}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onChange('doubao');
                setOpen(false);
              }}
              className={`flex items-center gap-1.5 w-full text-left px-2.5 py-1.5 text-xs whitespace-nowrap hover:bg-bolt-elements-background-depth-3 ${
                engine === 'doubao' ? 'text-accent-500 font-medium' : 'text-bolt-elements-textPrimary'
              }`}
            >
              <div className="i-ph:brain text-sm" />
              <span>{t('speech.engine.doubao')}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
