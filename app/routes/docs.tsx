import { useState } from 'react';
import type { MetaFunction } from 'react-router';
import { MarketingLayout } from '~/components/marketing/MarketingLayout';
import { getLanguage } from '~/lib/i18n';
import { getDocContent, type DocBlock } from '~/lib/docs-content';

export const meta: MetaFunction = () => [{ title: 'K-bot 幫助文檔' }];

function Block({ block }: { block: DocBlock }) {
  if (block.type === 'p') {
    return (
      <>
        {block.items.map((text) => (
          <p key={text} className="text-slate-600 leading-7">
            {text}
          </p>
        ))}
      </>
    );
  }

  const ListTag = block.type === 'steps' ? 'ol' : 'ul';

  return (
    <ListTag
      className={
        block.type === 'steps'
          ? 'list-decimal space-y-2.5 pl-5 text-slate-600 leading-7'
          : 'list-disc space-y-2.5 pl-5 text-slate-600 leading-7'
      }
    >
      {block.items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ListTag>
  );
}

export default function DocsPage() {
  const lang = getLanguage();
  const doc = getDocContent(lang);
  const [activeId, setActiveId] = useState(doc.sections[0].id);

  const activeSection = doc.sections.find((s) => s.id === activeId) || doc.sections[0];

  return (
    <MarketingLayout active="docs">
      <div className="max-w-7xl mx-auto px-6 py-12 flex gap-8">
        <aside className="w-64 shrink-0 hidden md:block">
          <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-sm font-semibold text-slate-900 mb-3">{doc.pageTitle}</div>
            <nav className="space-y-1">
              {doc.sections.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setActiveId(s.id);
                    document.getElementById(`doc-${s.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeId === s.id
                      ? 'text-blue-700 bg-blue-50 font-medium'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {s.title}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        <article className="flex-1 min-w-0 max-w-3xl space-y-12">
          {doc.sections.map((section) => (
            <section key={section.id} id={`doc-${section.id}`}>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-5">{section.title}</h1>
              <div className="space-y-4">
                {section.blocks.map((block, i) => (
                  <Block key={i} block={block} />
                ))}
              </div>
            </section>
          ))}
        </article>
      </div>
    </MarketingLayout>
  );
}
