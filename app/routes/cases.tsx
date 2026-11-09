import type { MetaFunction } from 'react-router';
import { CardGridPage } from '~/components/marketing/CardGridPage';
import { getLanguage } from '~/lib/i18n';
import { getMarketingContent } from '~/lib/marketing-content';

export const meta: MetaFunction = () => [{ title: 'K-bot 案例' }];

export default function CasesRoute() {
  const c = getMarketingContent(getLanguage());
  return <CardGridPage active="cases" title={c.casesTitle} sub={c.heroSub} items={c.cases} />;
}
