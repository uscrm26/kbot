import { getLanguage } from './i18n';

export type TabId = 'create' | 'shop' | 'upgrade' | 'growth';
export type PurposeId = 'sell_products' | 'company_site' | 'service' | 'portfolio' | 'other';
export type BuildMode = 'speed' | 'design';

interface PurposeMeta {
  id: PurposeId;
  title: string;
  subtitle: string;
  icon: string;
}

interface LocaleContent {
  tabs: Record<TabId, string>;
  purposes: Record<PurposeId, { title: string; subtitle: string }>;
  templates: Record<PurposeId, string>;
  shopPrompt: string;
  shopInstallPrompt: string;
  modes: Record<BuildMode, { title: string; shortDesc: string; tooltip: string }>;
  intentLabel: string;
}

const CONTENT: Record<string, LocaleContent> = {
  'zh-Hant': {
    tabs: {
      create: '從零開始',
      shop: '我要做商城',
      upgrade: '升級官網',
      growth: '我要獲客',
    },
    purposes: {
      sell_products: { title: '推廣產品', subtitle: '外貿站、電商站等' },
      company_site: { title: '展示公司形象', subtitle: '官網、展示產品等' },
      service: { title: '接生意或服務', subtitle: '服務網站、活動頁等' },
      portfolio: { title: '展示作品', subtitle: '博客網站、作品集站等' },
      other: { title: '其他', subtitle: '其他類型' },
    },
    templates: {
      sell_products:
        '我的商品屬於 [品類，例如：功能飲料/暢銷書/美妝]，產品叫 [產品名稱]，獨特優勢係 [核心賣點]。主要面向 [目標人群]。我希望用戶撳「購買」之後，主要跳轉到 [平台名稱，例如：Amazon/淘寶/京東]。',
      company_site:
        '我的公司名稱係 [公司名稱]，我哋主要提供 [行業服務]，希望展現 [專業/創新] 嘅企業形象，用一句話介紹我哋公司係 [ ]。',
      service:
        '我係 [名字]，專注 [法律/財務服務]，主要幫 [個人/企業] 解決 [法律服務/財務及會計/稅務與合規/管理與策略顧問/教育與培訓]，服務地區係 [中國內地/日本/美國]。本網站會展示我的 [執業資格、合作機構/客戶、過往案例與專業文章]。',
      portfolio: '我的攝影風格係 [例如人像/風景/產品]，主要作品係 [相片/影片]，我的名字係 [品牌名稱/個人名字]。',
      other:
        '我想做一個[網站類型]嘅網站，網站/項目名稱係[項目名稱]，主要服務[目標用戶]，核心價值係[核心價值]，希望網站重點展示[核心內容/模組]，整體風格偏向[品牌氣質/視覺感覺]。',
    },
    shopPrompt: '幫我建立一個咖啡 H5 點餐網站，並包含咖啡品牌的周邊商品商城。',
    shopInstallPrompt: '請先閱讀 shop-install 技能，按照技能完成商城接入。',
    modes: {
      speed: {
        title: '極速模式',
        shortDesc: '跳過設計稿，直接生成網站',
        tooltip: '適合小遊戲、小工具、互動原型及快速驗證想法。跳過靜態設計稿，直接生成可運行的項目。',
      },
      design: {
        title: '設計模式',
        shortDesc: '先出設計稿，再生成網站',
        tooltip: '適合企業官網、品牌展示、產品介紹等注重視覺呈現的網站。先生成靜態設計稿，確認設計後再生成網站。',
      },
    },
    intentLabel: '意圖識別',
  },
  'zh-Hans': {
    tabs: {
      create: '从零开始',
      shop: '我要做商城',
      upgrade: '升级官网',
      growth: '我要获客',
    },
    purposes: {
      sell_products: { title: '推广产品', subtitle: '外贸站、电商站等' },
      company_site: { title: '展示公司形象', subtitle: '官网、展示产品等' },
      service: { title: '接生意或服务', subtitle: '服务网站、活动页等' },
      portfolio: { title: '展示作品', subtitle: '博客网站、作品集站等' },
      other: { title: '其他', subtitle: '其他类型' },
    },
    templates: {
      sell_products:
        '我的商品属于 [品类，例如：功能饮料/畅销书/美妆]，产品叫 [产品名称]，独特优势是 [核心卖点]。主要面向 [目标人群]。我希望用户点击「购买」之后，主要跳转到 [平台名称，例如：Amazon/淘宝/京东]。',
      company_site:
        '我的公司名称是 [公司名称]，我们主要提供 [行业服务]，希望展现 [专业/创新] 的企业形象，用一句话介绍我们公司是 [ ]。',
      service:
        '我是 [名字]，专注 [法律/财务服务]，主要帮 [个人/企业] 解决 [法律服务/财务及会计/税务与合规/管理与策略顾问/教育与培训]，服务地区是 [中国内地/日本/美国]。本网站会展示我的 [执业资格、合作机构/客户、过往案例与专业文章]。',
      portfolio: '我的摄影风格是 [例如人像/风景/产品]，主要作品是 [照片/视频]，我的名字是 [品牌名称/个人名字]。',
      other:
        '我想做一个[网站类型]的网站，网站/项目名称是[项目名称]，主要服务[目标用户]，核心价值是[核心价值]，希望网站重点展示[核心内容/模块]，整体风格偏向[品牌气质/视觉感觉]。',
    },
    shopPrompt: '帮我建立一个咖啡 H5 点餐网站，并包含咖啡品牌的周边商品商城。',
    shopInstallPrompt: '请先阅读 shop-install 技能，按照技能完成商城接入。',
    modes: {
      speed: {
        title: '极速模式',
        shortDesc: '跳过设计稿，直接生成网站',
        tooltip: '适合小游戏、小工具、互动原型及快速验证想法。跳过静态设计稿，直接生成可运行的项目。',
      },
      design: {
        title: '设计模式',
        shortDesc: '先出设计稿，再生成网站',
        tooltip: '适合企业官网、品牌展示、产品介绍等注重视觉呈现的网站。先生成静态设计稿，确认设计后再生成网站。',
      },
    },
    intentLabel: '意图识别',
  },
  en: {
    tabs: {
      create: 'Start from Scratch',
      shop: 'Build a Store',
      upgrade: 'Upgrade Website',
      growth: 'Get Customers',
    },
    purposes: {
      sell_products: { title: 'Sell Products', subtitle: 'Export sites, ecommerce, etc.' },
      company_site: { title: 'Company Site', subtitle: 'Official sites, product showcases' },
      service: { title: 'Services', subtitle: 'Service sites, landing pages' },
      portfolio: { title: 'Portfolio', subtitle: 'Blogs, portfolio sites' },
      other: { title: 'Other', subtitle: 'Other types' },
    },
    templates: {
      sell_products:
        'My product belongs to the [category, e.g. energy drinks/bestsellers/beauty] category, it is called [product name], and its unique advantage is [core selling point]. It mainly targets [target audience]. After users click "Buy", I want them redirected mainly to [platform, e.g. Amazon/Taobao/JD].',
      company_site:
        'My company is called [company name], we mainly provide [industry service], and we want to present a [professional/innovative] corporate image. In one sentence, introduce our company as [ ].',
      service:
        'I am [name], specializing in [legal/financial services], mainly helping [individuals/companies] with [legal services/finance and accounting/tax and compliance/management and strategy consulting/education and training], serving [mainland China/Japan/United States]. This website will showcase my [qualifications, partner organizations/clients, past cases and professional articles].',
      portfolio:
        'My photography style is [e.g. portrait/landscape/product], my main works are [photos/videos], and my name is [brand/personal name].',
      other:
        'I want to build a [website type] website, the website/project name is [project name], it mainly serves [target users], its core value is [core value], I want the website to focus on [core content/modules], and the overall style should lean toward [brand tone/visual feel].',
    },
    shopPrompt: 'Help me build a coffee H5 ordering website that also includes a merchandise store for the coffee brand.',
    shopInstallPrompt: 'Please first read the shop-install skill and follow that skill to complete the store integration.',
    modes: {
      speed: {
        title: 'Speed Mode',
        shortDesc: 'Skip design draft, build directly',
        tooltip:
          'Best for mini games, small tools, interactive prototypes and quick idea validation. Skip static design drafts and generate a working project directly.',
      },
      design: {
        title: 'Design Mode',
        shortDesc: 'Design first, then build',
        tooltip:
          'Best for corporate sites, brand showcases and product pages where visual presentation matters. Generate a static design draft first, confirm it, then build the website.',
      },
    },
    intentLabel: 'Intent',
  },
  'en-GB': {
    tabs: {
      create: 'Start from Scratch',
      shop: 'Build a Shop',
      upgrade: 'Upgrade Website',
      growth: 'Get Customers',
    },
    purposes: {
      sell_products: { title: 'Sell Products', subtitle: 'Export sites, ecommerce, etc.' },
      company_site: { title: 'Company Site', subtitle: 'Official sites, product showcases' },
      service: { title: 'Services', subtitle: 'Service sites, landing pages' },
      portfolio: { title: 'Portfolio', subtitle: 'Blogs, portfolio sites' },
      other: { title: 'Other', subtitle: 'Other types' },
    },
    templates: {
      sell_products:
        'My product belongs to the [category, e.g. energy drinks/bestsellers/beauty] category, it is called [product name], and its unique advantage is [core selling point]. It mainly targets [target audience]. After users click "Buy", I want them redirected mainly to [platform, e.g. Amazon/Taobao/JD].',
      company_site:
        'My company is called [company name], we mainly provide [industry service], and we want to present a [professional/innovative] corporate image. In one sentence, introduce our company as [ ].',
      service:
        'I am [name], specialising in [legal/financial services], mainly helping [individuals/companies] with [legal services/finance and accounting/tax and compliance/management and strategy consulting/education and training], serving [mainland China/Japan/United Kingdom]. This website will showcase my [qualifications, partner organisations/clients, past cases and professional articles].',
      portfolio:
        'My photography style is [e.g. portrait/landscape/product], my main works are [photos/videos], and my name is [brand/personal name].',
      other:
        'I want to build a [website type] website, the website/project name is [project name], it mainly serves [target users], its core value is [core value], I want the website to focus on [core content/modules], and the overall style should lean towards [brand tone/visual feel].',
    },
    shopPrompt: 'Help me build a coffee H5 ordering website that also includes a merchandise shop for the coffee brand.',
    shopInstallPrompt: 'Please first read the shop-install skill and follow that skill to complete the shop integration.',
    modes: {
      speed: {
        title: 'Speed Mode',
        shortDesc: 'Skip design draft, build directly',
        tooltip:
          'Best for mini games, small tools, interactive prototypes and quick idea validation. Skip static design drafts and generate a working project directly.',
      },
      design: {
        title: 'Design Mode',
        shortDesc: 'Design first, then build',
        tooltip:
          'Best for corporate sites, brand showcases and product pages where visual presentation matters. Generate a static design draft first, confirm it, then build the website.',
      },
    },
    intentLabel: 'Intent',
  },
  ja: {
    tabs: {
      create: '新規作成',
      shop: 'ショップを作る',
      upgrade: 'サイトを改善',
      growth: '集客する',
    },
    purposes: {
      sell_products: { title: '商品販売', subtitle: '越境サイト、EC サイトなど' },
      company_site: { title: '会社紹介', subtitle: '公式サイト、商品紹介など' },
      service: { title: 'サービス受注', subtitle: 'サービスサイト、LP など' },
      portfolio: { title: 'ポートフォリオ', subtitle: 'ブログ、作品集サイト' },
      other: { title: 'その他', subtitle: 'その他のタイプ' },
    },
    templates: {
      sell_products:
        '私の商品は [カテゴリ、例：機能性飲料/ベストセラー/美容] に属し、商品名は [商品名]、独自の強みは [コアセリングポイント] です。主な対象は [ターゲット層] です。ユーザーが「購入」をクリックした後、主に [プラットフォーム名、例：Amazon/タオバオ/JD] に遷移させたいです。',
      company_site:
        '私の会社名は [会社名] で、主に [業種サービス] を提供し、[専門的/革新的] な企業イメージを表現したいです。一文で会社を紹介すると [ ] です。',
      service:
        '私は [名前] で、[法律/財務サービス] を専門とし、主に [個人/企業] の [法律サービス/財務・会計/税務・コンプライアンス/経営・戦略コンサル/教育・研修] を支援し、対応地域は [中国本土/日本/アメリカ] です。このサイトには [資格、提携機関/顧客、過去の事例と専門記事] を掲載します。',
      portfolio:
        '私の写真スタイルは [例：ポートレート/風景/商品] で、主な作品は [写真/動画]、名前は [ブランド名/個人名] です。',
      other:
        '[サイトタイプ] のウェブサイトを作りたいです。サイト/プロジェクト名は [プロジェクト名]、主に [対象ユーザー] にサービスを提供し、コアバリューは [コアバリュー] です。サイトでは [コアコンテンツ/モジュール] を重点的に見せ、全体のスタイルは [ブランドの雰囲気/視覚的な印象] に寄せたいです。',
    },
    shopPrompt: 'コーヒーブランドの H5 注文サイトを作り、コーヒーブランドのグッズショップも含めてください。',
    shopInstallPrompt: 'まず shop-install スキルを読み、そのスキルに従ってショップ連携を完了してください。',
    modes: {
      speed: {
        title: '高速モード',
        shortDesc: 'デザイン稿をスキップして直接生成',
        tooltip:
          'ミニゲーム、ツール、インタラクティブな試作、アイデアの素早い検証に最適。静的なデザイン稿をスキップして、動作するプロジェクトを直接生成します。',
      },
      design: {
        title: 'デザインモード',
        shortDesc: '先にデザイン稿を作成',
        tooltip:
          '企業サイト、ブランド展示、製品紹介などビジュアル重視のサイトに最適。静的なデザイン稿を先に生成し、確認してからサイトを構築します。',
      },
    },
    intentLabel: 'インテント',
  },
  ko: {
    tabs: {
      create: '처음부터 만들기',
      shop: '쇼핑몰 만들기',
      upgrade: '사이트 업그레이드',
      growth: '고객 확보',
    },
    purposes: {
      sell_products: { title: '제품 판매', subtitle: '수출 사이트, 이커머스 등' },
      company_site: { title: '회사 소개', subtitle: '공식 사이트, 제품 소개 등' },
      service: { title: '서비스 수주', subtitle: '서비스 사이트, 랜딩 페이지' },
      portfolio: { title: '포트폴리오', subtitle: '블로그, 포트폴리오 사이트' },
      other: { title: '기타', subtitle: '기타 유형' },
    },
    templates: {
      sell_products:
        '내 상품은 [카테고리, 예: 기능성 음료/베스트셀러/뷰티]에 속하고, 상품명은 [상품명], 차별화 강점은 [핵심 셀링 포인트]입니다. 주요 대상은 [타겟층]입니다. 사용자가 "구매"를 클릭한 후 주로 [플랫폼명, 예: Amazon/타오바오/JD]로 이동시키고 싶습니다.',
      company_site:
        '내 회사명은 [회사명]이고, 주로 [업종 서비스]를 제공하며, [전문적/혁신적] 기업 이미지를 보여주고 싶습니다. 한 문장으로 회사를 소개하면 [ ]입니다.',
      service:
        '저는 [이름]이고, [법률/재무 서비스]를 전문으로 하며, 주로 [개인/기업]의 [법률 서비스/재무 및 회계/세무 및 컴플라이언스/경영 및 전략 컨설팅/교육 및 훈련]을 해결하고, 서비스 지역은 [중국 본토/일본/미국]입니다. 이 사이트에는 [자격, 협력 기관/고객, 과거 사례와 전문 글]을 보여줄 것입니다.',
      portfolio:
        '내 사진 스타일은 [예: 인물/풍경/제품]이고, 주요 작품은 [사진/영상], 이름은 [브랜드명/개인명]입니다.',
      other:
        '[웹사이트 유형] 웹사이트를 만들고 싶습니다. 웹사이트/프로젝트명은 [프로젝트명], 주로 [타겟 사용자]에게 서비스하고, 핵심 가치는 [핵심 가치]입니다. 웹사이트는 [핵심 콘텐츠/모듈]을 중점으로 보여주고, 전체 스타일은 [브랜드 분위기/시각적 느낌] 쪽으로 하고 싶습니다.',
    },
    shopPrompt: '커피 브랜드의 H5 주문 사이트를 만들고, 커피 브랜드 굿즈 쇼핑몰도 포함해 주세요.',
    shopInstallPrompt: '먼저 shop-install 스킬을 읽고 해당 스킬에 따라 쇼핑몰 연동을 완성해 주세요.',
    modes: {
      speed: {
        title: '스피드 모드',
        shortDesc: '디자인 초안 건너뛰고 바로 생성',
        tooltip:
          '미니 게임, 도구, 인터랙티브 프로토타입, 아이디어 빠른 검증에 적합합니다. 정적 디자인 초안을 건너뛰고 실행 가능한 프로젝트를 바로 생성합니다.',
      },
      design: {
        title: '디자인 모드',
        shortDesc: '먼저 디자인 초안 생성',
        tooltip:
          '기업 사이트, 브랜드 소개, 제품 소개 등 시각이 중요한 사이트에 적합합니다. 먼저 정적 디자인 초안을 생성하고 확인한 뒤 사이트를 구축합니다.',
      },
    },
    intentLabel: '인텐트',
  },
};

const ICONS: Record<PurposeId, string> = {
  sell_products: 'i-ph:shopping-cart',
  company_site: 'i-ph:building',
  service: 'i-ph:briefcase',
  portfolio: 'i-ph:image',
  other: 'i-ph:dots-three-horizontal',
};

function resolve(): LocaleContent {
  const lang = getLanguage();
  return CONTENT[lang] || CONTENT.en;
}

export function getTabs(): Array<{ id: TabId; label: string }> {
  const c = resolve();
  return (Object.keys(c.tabs) as TabId[]).map((id) => ({ id, label: c.tabs[id] }));
}

export function getPurposeOptions(): PurposeMeta[] {
  const c = resolve();
  return (Object.keys(c.purposes) as PurposeId[]).map((id) => ({
    id,
    title: c.purposes[id].title,
    subtitle: c.purposes[id].subtitle,
    icon: ICONS[id],
  }));
}

export function getPurposeTemplate(id: PurposeId): string {
  return resolve().templates[id];
}

export function getShopPrompt(): string {
  return resolve().shopPrompt;
}

export function getShopInstallPrompt(): string {
  return resolve().shopInstallPrompt;
}

export function getModeMeta(mode: BuildMode): { title: string; shortDesc: string; tooltip: string } {
  return resolve().modes[mode];
}

export function getIntentLabel(): string {
  return resolve().intentLabel;
}
