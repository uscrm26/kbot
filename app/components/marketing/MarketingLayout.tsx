import React from 'react';
import { getLanguage, setLanguage, getAvailableLanguages } from '~/lib/i18n';
import { getMarketingContent } from '~/lib/marketing-content';

interface MarketingLayoutProps {
  active: string;
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { id: 'product', href: '/product' },
  { id: 'templates', href: '/templates' },
  { id: 'cases', href: '/cases' },
  { id: 'pricing', href: '/pricing' },
  { id: 'articles', href: '/articles' },
  { id: 'docs', href: '/docs' },
];

export const MarketingLayout: React.FC<MarketingLayoutProps> = ({ active, children }) => {
  const lang = getLanguage();
  const content = getMarketingContent(lang);
  const languages = getAvailableLanguages();

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              window.location.href = '/';
            }}
            className="flex items-center gap-2.5"
          >
            <img src="/logo/kbot-gradient.png" alt="K-bot" className="w-8 h-8" />
            <span className="text-lg font-bold text-slate-900">{content.brand}</span>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  window.location.href = item.href;
                }}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  active === item.id
                    ? 'text-blue-700 bg-blue-50 font-medium'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {item.id === 'product'
                  ? content.featuresTitle.replace('AI ', '')
                  : item.id === 'templates'
                    ? content.templatesTitle
                    : item.id === 'cases'
                      ? content.casesTitle
                      : item.id === 'articles'
                        ? content.articlesTitle
                        : item.id === 'docs'
                          ? content.brand === 'K-bot'
                            ? lang.startsWith('zh')
                              ? '文件'
                              : 'Docs'
                            : 'Docs'
                          : content.ctaSecondary}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <select
              value={lang}
              onChange={(e) => setLanguage(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600 bg-white"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                window.location.href = '/';
              }}
              className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium transition-colors"
            >
              {content.ctaPrimary}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src="/logo/kbot-gradient.png" alt="K-bot" className="w-7 h-7" />
            <span className="text-sm text-slate-500">{content.footerNote}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <button type="button" onClick={() => { window.location.href = '/pricing'; }} className="hover:text-slate-900">
              {content.ctaSecondary}
            </button>
            <button type="button" onClick={() => { window.location.href = '/docs'; }} className="hover:text-slate-900">
              {lang.startsWith('zh') ? '文件' : 'Docs'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
