import type { MetaFunction } from 'react-router';
import { CardGridPage } from '~/components/marketing/CardGridPage';
import { getLanguage } from '~/lib/i18n';
import { getMarketingContent } from '~/lib/marketing-content';

export const meta: MetaFunction = () => [{ title: 'K-bot 範本' }];

export default function TemplatesRoute() {
  const c = getMarketingContent(getLanguage());
  return <CardGridPage active="templates" title={c.templatesTitle} sub={c.templatesSub} items={c.templates} />;
}
