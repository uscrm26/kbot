import { getLanguage } from './i18n';

export interface NavLeaf {
  id: string;
  label: string;
}
export interface NavGroup {
  id: string;
  label: string;
  children: NavLeaf[];
}
export interface NavTopLink {
  id: string;
  label: string;
}
export interface NavStructure {
  groups: NavGroup[];
  links: NavTopLink[];
  login: string;
  logout: string;
  start: string;
  mySites: string;
  compute: string;
  upgrade: string;
}

type Dict = Record<string, string>;

const STRUCTURE_IDS = {
  groups: [
    {
      id: 'product',
      children: ['overview', 'generator', 'who'],
    },
    {
      id: 'capability',
      children: [
        'fullstack',
        'multiagent',
        'cms',
        'styles',
        'domain',
        'seo',
        'preview',
        'canvas',
        'ecommerce',
        'figma',
      ],
    },
  ],
  links: ['tools', 'templates', 'cases', 'pricing', 'articles', 'docs'],
};

const LABELS: Record<string, Dict> = {
  'zh-Hant': {
    product: '產品',
    overview: '功能總覽',
    generator: 'AI 網站生成器',
    who: '適合誰用',
    capability: '能力',
    fullstack: '全端程式碼生成',
    multiagent: '多 Agent 協作',
    cms: 'CMS 後台',
    styles: '多風格設計',
    domain: '網域部署',
    seo: 'SEO 與 GEO 優化',
    preview: '線上預覽',
    canvas: '可編輯設計畫布',
    ecommerce: '電商獨立站',
    figma: 'Figma 與 Sketch 還原',
    tools: '工具',
    templates: '範本',
    cases: '案例',
    pricing: '定價',
    articles: '文章',
    docs: '文件',
    login: '登入',
    logout: '登出',
    start: '開始',
    mySites: '我的網站',
    compute: 'K 算力',
    upgrade: '升級方案',
  },
  'zh-Hans': {
    product: '产品',
    overview: '功能总览',
    generator: 'AI 网站生成器',
    who: '适合谁用',
    capability: '能力',
    fullstack: '全端代码生成',
    multiagent: '多 Agent 协作',
    cms: 'CMS 后台',
    styles: '多风格设计',
    domain: '域名部署',
    seo: 'SEO 与 GEO 优化',
    preview: '在线预览',
    canvas: '可编辑设计画布',
    ecommerce: '电商独立站',
    figma: 'Figma 与 Sketch 还原',
    tools: '工具',
    templates: '范本',
    cases: '案例',
    pricing: '定价',
    articles: '文章',
    docs: '文件',
    login: '登录',
    logout: '退出',
    start: '开始',
    mySites: '我的网站',
    compute: 'K 算力',
    upgrade: '升级套餐',
  },
  en: {
    product: 'Product',
    overview: 'Features Overview',
    generator: 'AI Website Generator',
    who: "Who It's For",
    capability: 'Capabilities',
    fullstack: 'Full-Stack Code Generation',
    multiagent: 'Multi-Agent Collaboration',
    cms: 'CMS Backend',
    styles: 'Multi-Style Design',
    domain: 'Domain Deployment',
    seo: 'SEO & GEO Optimization',
    preview: 'Live Preview',
    canvas: 'Editable Design Canvas',
    ecommerce: 'Ecommerce Store',
    figma: 'Figma & Sketch Restoration',
    tools: 'Tools',
    templates: 'Templates',
    cases: 'Cases',
    pricing: 'Pricing',
    articles: 'Articles',
    docs: 'Docs',
    login: 'Log in',
    logout: 'Log out',
    start: 'Get Started',
    mySites: 'My Sites',
    compute: 'K Compute',
    upgrade: 'Upgrade Plan',
  },
  ja: {
    product: '製品',
    overview: '機能概要',
    generator: 'AI サイト生成',
    who: '対象者',
    capability: '機能',
    fullstack: 'フルスタックコード生成',
    multiagent: 'マルチ Agent 連携',
    cms: 'CMS バックエンド',
    styles: 'マルチスタイルデザイン',
    domain: 'ドメインデプロイ',
    seo: 'SEO・GEO 最適化',
    preview: 'ライブプレビュー',
    canvas: '編集可能なデザインキャンバス',
    ecommerce: 'EC ストア',
    figma: 'Figma・Sketch 復元',
    tools: 'ツール',
    templates: 'テンプレート',
    cases: '事例',
    pricing: '料金',
    articles: '記事',
    docs: 'ドキュメント',
    login: 'ログイン',
    logout: 'ログアウト',
    start: '始める',
    mySites: 'マイサイト',
    compute: 'K 算力',
    upgrade: 'プラン変更',
  },
  ko: {
    product: '제품',
    overview: '기능 개요',
    generator: 'AI 웹사이트 생성기',
    who: '대상 사용자',
    capability: '역량',
    fullstack: '풀스택 코드 생성',
    multiagent: '멀티 Agent 협업',
    cms: 'CMS 백엔드',
    styles: '멀티 스타일 디자인',
    domain: '도메인 배포',
    seo: 'SEO·GEO 최적화',
    preview: '라이브 미리보기',
    canvas: '편집 가능한 디자인 캔버스',
    ecommerce: '이커머스 스토어',
    figma: 'Figma·Sketch 복원',
    tools: '도구',
    templates: '템플릿',
    cases: '사례',
    pricing: '요금',
    articles: '아티클',
    docs: '문서',
    login: '로그인',
    logout: '로그아웃',
    start: '시작하기',
    mySites: '내 사이트',
    compute: 'K 컴퓨트',
    upgrade: '요금제 업그레이드',
  },
};

export function getNav(): NavStructure {
  const lang = getLanguage();
  const dict = LABELS[lang] || LABELS.en;
  const label = (id: string) => dict[id] || LABELS.en[id];

  const groups: NavGroup[] = STRUCTURE_IDS.groups.map((g) => ({
    id: g.id,
    label: label(g.id),
    children: g.children.map((id) => ({ id, label: label(id) })),
  }));

  const links: NavTopLink[] = STRUCTURE_IDS.links.map((id) => ({ id, label: label(id) }));

  return {
    groups,
    links,
    login: label('login'),
    logout: label('logout'),
    start: label('start'),
    mySites: label('mySites'),
    compute: label('compute'),
    upgrade: label('upgrade'),
  };
}
