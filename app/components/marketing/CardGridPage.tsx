import React from 'react';
import { MarketingLayout } from './MarketingLayout';
import { getLanguage } from '~/lib/i18n';
import { getMarketingContent, type CardItem } from '~/lib/marketing-content';

interface CardGridPageProps {
  active: string;
  title: string;
  sub: string;
  items: CardItem[];
}

export const CardGridPage: React.FC<CardGridPageProps> = ({ active, title, sub, items }) => {
  const lang = getLanguage();
  const c = getMarketingContent(lang);

  return (
    <MarketingLayout active={active}>
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900">{title}</h1>
          <p className="mt-4 text-lg text-slate-600">{sub}</p>
        </div>
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <button
              key={item.title}
              type="button"
              onClick={() => {
                window.location.href = '/';
              }}
              className="text-left rounded-2xl border border-slate-200 bg-white p-7 hover:border-blue-300 hover:shadow-lg transition-all"
            >
              <span className="inline-block text-xs font-medium text-blue-700 bg-blue-50 rounded-full px-3 py-1">
                {item.tag}
              </span>
              <h2 className="mt-4 text-lg font-semibold text-slate-900">{item.title}</h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-600">
                {c.ctaPrimary}
                <span className="i-ph:arrow-right" />
              </span>
            </button>
          ))}
        </div>
      </section>
    </MarketingLayout>
  );
};
