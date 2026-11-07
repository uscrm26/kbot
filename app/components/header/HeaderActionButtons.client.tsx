import { useStore } from '@nanostores/react';
import { useState } from 'react';
import { DeployButton } from '~/components/deploy/DeployButton';
import { ReportBugPanel } from '~/components/header/ReportBugPanel';
import { workbenchStore } from '~/lib/stores/workbench';
import { t, setLanguage, getLanguage, getAvailableLanguages } from '~/lib/i18n';

interface HeaderActionButtonsProps {
  chatStarted: boolean;
}

export function HeaderActionButtons({ chatStarted: _chatStarted }: HeaderActionButtonsProps) {
  const [activePreviewIndex] = useState(0);
  const [isReportBugOpen, setIsReportBugOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const previews = useStore(workbenchStore.previews);
  const activePreview = previews[activePreviewIndex];

  const shouldShowButtons = activePreview;
  const currentLang = getLanguage();
  const languages = getAvailableLanguages();

  return (
    <div className="flex items-center gap-1">
      {/* Language Switcher */}
      <div className="relative">
        <button
          onClick={() => setIsLangOpen(!isLangOpen)}
          className="rounded-md items-center justify-center px-3 py-1.5 text-xs bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor text-bolt-elements-textPrimary flex gap-1.5 hover:bg-bolt-elements-background-depth-3"
          title={t('language.select')}
        >
          <div className="i-ph:globe" />
          <span className="text-sm">{languages.find(l => l.code === currentLang)?.flag || '🇭🇰'}</span>
          <span>{languages.find(l => l.code === currentLang)?.name || '中文'}</span>
        </button>
        {isLangOpen && (
          <div className="absolute right-0 top-full mt-1 bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor rounded-md shadow-lg z-50 min-w-120">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setIsLangOpen(false);
                }}
                className={`flex items-center gap-2 w-full text-left px-3 py-2 text-xs hover:bg-bolt-elements-background-depth-3 ${lang.code === currentLang ? 'text-accent-500 font-medium' : 'text-bolt-elements-textPrimary'}`}
              >
                <span className="text-base">{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Deploy Button */}
      {shouldShowButtons && <DeployButton />}

      {/* Project Actions */}
      {shouldShowButtons && (
        <div className="flex border border-bolt-elements-borderColor rounded-md overflow-hidden text-sm">
          <button
            onClick={() => setIsReportBugOpen(true)}
            className="rounded-md items-center justify-center [&:is(:disabled,.disabled)]:cursor-not-allowed [&:is(:disabled,.disabled)]:opacity-60 px-3 py-1.5 text-xs bg-accent-500 text-white hover:text-bolt-elements-item-contentAccent [&:not(:disabled,.disabled)]:hover:bg-bolt-elements-button-primary-backgroundHover outline-accent-500 flex gap-1.5"
            title={t('report.bug')}
          >
            <div className="i-ph:bug" />
            <span>{t('report.bug')}</span>
          </button>
        </div>
      )}
      <ReportBugPanel open={isReportBugOpen} onClose={() => setIsReportBugOpen(false)} />
    </div>
  );
}
