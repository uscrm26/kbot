import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { t } from '~/lib/i18n';

interface DocumentationPanelProps {
  open: boolean;
  onClose: () => void;
}

export function DocumentationPanel({ open, onClose }: DocumentationPanelProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-md transition-opacity data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-[1001] flex w-full flex-col border-l border-bolt-elements-borderColor bg-bolt-elements-background-depth-1 text-bolt-elements-textPrimary shadow-2xl outline-none sm:inset-y-3 sm:right-3 sm:w-[min(1100px,75vw)] sm:rounded-xl sm:border">
          <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-bolt-elements-borderColor px-5 sm:px-7">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bolt-elements-background-depth-3 text-bolt-elements-item-contentAccent">
                <div className="i-ph:book-open-text h-5 w-5" />
              </div>
              <div className="min-w-0">
                <Dialog.Title className="truncate text-sm font-semibold">{t('docs.title')}</Dialog.Title>
                <Dialog.Description className="truncate text-xs text-bolt-elements-textSecondary">
                  {t('docs.subtitle')}
                </Dialog.Description>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Dialog.Close asChild>
                <button
                  type="button"
                  aria-label="Close documentation"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-bolt-elements-textSecondary transition-colors hover:bg-bolt-elements-background-depth-2 hover:text-bolt-elements-textPrimary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </Dialog.Close>
            </div>
          </header>

          <div className="min-h-0 w-full flex-1 overflow-auto flex">
            {/* 左邊目錄 */}
            <div className="w-64 shrink-0 border-r border-bolt-elements-borderColor p-4 overflow-y-auto">
              <div className="space-y-1 text-sm">
                <div className="font-semibold text-bolt-elements-textPrimary mb-2">{t('docs.toc')}</div>
                
                <div className="font-medium text-bolt-elements-textPrimary">{t('docs.toc.welcome')}</div>
                
                <div className="font-medium text-bolt-elements-textPrimary mt-3">{t('docs.toc.features')}</div>
                
                <div className="font-medium text-bolt-elements-textPrimary mt-3">{t('docs.toc.quickstart')}</div>
                <div className="pl-3 text-bolt-elements-textSecondary">
                  <div>{t('docs.toc.step1')}</div>
                  <div>{t('docs.toc.step2')}</div>
                  <div>{t('docs.toc.step3')}</div>
                </div>
                
                <div className="font-medium text-bolt-elements-textPrimary mt-3">{t('docs.toc.accounts')}</div>
                <div className="pl-3 text-bolt-elements-textSecondary">
                  <div>{t('docs.toc.login')}</div>
                  <div>{t('docs.toc.quota')}</div>
                </div>
                
                <div className="font-medium text-bolt-elements-textPrimary mt-3">{t('docs.toc.deploy')}</div>
                <div className="pl-3 text-bolt-elements-textSecondary">
                  <div>{t('docs.toc.hosting')}</div>
                  <div>{t('docs.toc.custom.domain')}</div>
                </div>
                
                <div className="font-medium text-bolt-elements-textPrimary mt-3">{t('docs.toc.billing')}</div>
                <div className="pl-3 text-bolt-elements-textSecondary">
                  <div>{t('docs.toc.pricing')}</div>
                  <div>{t('docs.toc.paypal')}</div>
                </div>
              </div>
            </div>

            {/* 右邊內容 */}
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-3xl space-y-6">
                {/* 歡迎區塊 */}
                <div>
                  <h1 className="text-3xl font-bold mb-4">{t('docs.welcome')}</h1>
                  <p className="text-bolt-elements-textSecondary leading-relaxed">{t('docs.welcome.description')}</p>
                </div>

                {/* 主要功能區塊 */}
                <div>
                  <h2 className="text-xl font-semibold mb-3">{t('docs.features')}</h2>
                  <ul className="space-y-2 text-sm leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="text-accent-600 mt-1">•</span>
                      <span>{t('docs.feature.1')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent-600 mt-1">•</span>
                      <span>{t('docs.feature.2')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent-600 mt-1">•</span>
                      <span>{t('docs.feature.3')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent-600 mt-1">•</span>
                      <span>{t('docs.feature.4')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent-600 mt-1">•</span>
                      <span>{t('docs.feature.5')}</span>
                    </li>
                  </ul>
                </div>

                {/* 快速開始區塊 */}
                <div>
                  <h2 className="text-xl font-semibold mb-3">{t('docs.quickstart')}</h2>
                  <ol className="space-y-3 text-sm leading-relaxed list-decimal list-inside">
                    <li>{t('docs.quickstart.1')}</li>
                    <li>{t('docs.quickstart.2')}</li>
                    <li>{t('docs.quickstart.3')}</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
