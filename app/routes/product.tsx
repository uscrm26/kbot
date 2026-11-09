import type { MetaFunction } from 'react-router';
import { MarketingLayout } from '~/components/marketing/MarketingLayout';
import { getLanguage } from '~/lib/i18n';
import { getMarketingContent } from '~/lib/marketing-content';

export const meta: MetaFunction = () => [{ title: 'K-bot 產品總覽' }];

export default function ProductPage() {
  const lang = getLanguage();
  const c = getMarketingContent(lang);

  return (
    <MarketingLayout active="product">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-white to-white" />
        <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 leading-tight">
            {c.heroTitle}
          </h1>
          <p className="mt-6 text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">{c.heroSub}</p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => {
                window.location.href = '/';
              }}
              className="px-7 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-medium text-lg transition-colors"
            >
              {c.ctaPrimary}
            </button>
            <button
              type="button"
              onClick={() => {
                window.location.href = '/pricing';
              }}
              className="px-7 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-lg transition-colors"
            >
              {c.ctaSecondary}
            </button>
          </div>

          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
            {c.stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="text-3xl font-bold text-blue-600">{s.value}</div>
                <div className="mt-2 text-sm text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">{c.featuresTitle}</h2>
          <p className="mt-4 text-slate-600 text-lg">{c.featuresSub}</p>
        </div>
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {c.features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-slate-200 p-7 hover:border-blue-300 hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <span className={`${f.icon} text-2xl text-blue-600`} />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-center">{c.personasTitle}</h2>
          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {c.personas.map((p) => (
              <div key={p.title} className="rounded-2xl bg-white border border-slate-200 p-7">
                <span className="inline-block text-xs font-medium text-blue-700 bg-blue-50 rounded-full px-3 py-1">
                  {p.tag}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{p.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-center">{c.faqTitle}</h2>
        <div className="mt-12 space-y-4">
          {c.faq.map((item) => (
            <details key={item.q} className="group rounded-2xl border border-slate-200 bg-white p-6">
              <summary className="flex cursor-pointer items-center justify-between text-base font-medium text-slate-900 list-none">
                {item.q}
                <span className="i-ph:plus text-xl text-slate-400 group-open:rotate-45 transition-transform" />
              </summary>
              <p className="mt-4 text-sm text-slate-600 leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </MarketingLayout>
  );
}
