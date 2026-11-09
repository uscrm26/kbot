import type { MetaFunction } from 'react-router';
import { CardGridPage } from '~/components/marketing/CardGridPage';
import { getLanguage } from '~/lib/i18n';
import { getMarketingContent } from '~/lib/marketing-content';

export const meta: MetaFunction = () => [{ title: 'K-bot 文章' }];

export default function ArticlesRoute() {
  const c = getMarketingContent(getLanguage());
  return <CardGridPage active="articles" title={c.articlesTitle} sub={c.featuresSub} items={c.articles} />;
}
