// K-bot 營銷頁面內容，六語言結構化數據
export type MarketingLang = 'zh-Hant' | 'zh-Hans' | 'en' | 'en-GB' | 'ja' | 'ko';

interface Feature {
  icon: string;
  title: string;
  desc: string;
}
interface CardItem {
  title: string;
  desc: string;
  tag: string;
}
interface FaqItem {
  q: string;
  a: string;
}
interface MarketingContent {
  brand: string;
  heroTitle: string;
  heroSub: string;
  ctaPrimary: string;
  ctaSecondary: string;
  stats: Array<{ value: string; label: string }>;
  featuresTitle: string;
  featuresSub: string;
  features: Feature[];
  personasTitle: string;
  personas: CardItem[];
  templatesTitle: string;
  templatesSub: string;
  templates: CardItem[];
  casesTitle: string;
  cases: CardItem[];
  articlesTitle: string;
  articles: CardItem[];
  faqTitle: string;
  faq: FaqItem[];
  footerNote: string;
}

const zhHant: MarketingContent = {
  brand: 'K-bot',
  heroTitle: '從建站到獲客的 AI 工作台',
  heroSub: '輸入一句話，生成帶支付、登入和後台的可上線系統，也能完成建站和獲客。',
  ctaPrimary: '免費開始',
  ctaSecondary: '查看定價',
  stats: [
    { value: '179+', label: '可用 AI 模型' },
    { value: '6', label: '支援語言' },
    { value: '1', label: '算力等於一元' },
    { value: '24/7', label: '線上服務' },
  ],
  featuresTitle: '一站式 AI 建站能力',
  featuresSub: '從構思到上線，每一步都由 AI 協助完成',
  features: [
    { icon: 'i-ph:code', title: '全端程式碼生成', desc: '自動生成前端與後端完整程式碼，結構清晰，可直接維護。' },
    { icon: 'i-ph:users-three', title: '多 Agent 協作', desc: '規劃、編輯、測試由不同 Agent 分工，流程更穩定。' },
    { icon: 'i-ph:database', title: 'CMS 後台', desc: '內建內容管理與用戶管理，無需另行搭建。' },
    { icon: 'i-ph:palette', title: '多風格設計', desc: '配色、字體與設計特性自由組合，品牌風格一致。' },
    { icon: 'i-ph:globe-hemisphere-east', title: '網域部署', desc: '支援子域名與自定義網域，DNS 驗證後直接上線。' },
    { icon: 'i-ph:magnifying-glass', title: 'SEO 與 GEO 優化', desc: '生成符合搜尋與 AI 推薦邏輯的語義化內容。' },
    { icon: 'i-ph:eye', title: '線上預覽', desc: '生成過程即時預覽，所見即所得。' },
    { icon: 'i-ph:canvas', title: '可編輯設計畫布', desc: '在畫布中微調檔案與介面，改動即時生效。' },
    { icon: 'i-ph:shopping-cart', title: '電商獨立站', desc: '商品、訂單與支付框架一應俱全。' },
    { icon: 'i-ph:figma-logo', title: 'Figma 與 Sketch 還原', desc: '依設計稿還原介面，保留設計細節。' },
  ],
  personasTitle: '適合誰用',
  personas: [
    { title: '中小企店主', desc: '沒有技術團隊也能快速建立官方網站與網店。', tag: '創業者' },
    { title: '自由工作者', desc: '接案時快速交付高質網站，提升產出效率。', tag: '設計師' },
    { title: '市場營銷人員', desc: '快速落地活動頁與落地頁，及時配合推廣。', tag: '營銷' },
    { title: '開發者', desc: '用 AI 處理重複性工作，專注核心邏輯。', tag: '工程' },
  ],
  templatesTitle: '精選範本',
  templatesSub: '從熱門場景快速開始，再依需求自由調整',
  templates: [
    { title: '咖啡廳官網', desc: '含品牌故事、菜單與門市資訊。', tag: '餐飲' },
    { title: '律師事務所', desc: '專業形象、服務領域與預約諮詢。', tag: '專業服務' },
    { title: '電商獨立站', desc: '商品陳列、購物車與結帳流程。', tag: '零售' },
    { title: '企業形象頁', desc: '公司介紹、團隊與新聞動態。', tag: '企業' },
    { title: '活動落地頁', desc: '聚焦轉換，含報名與倒數功能。', tag: '營銷' },
    { title: '作品集網站', desc: '展示項目與經歷，突出個人品牌。', tag: '創意' },
  ],
  casesTitle: '真實案例',
  cases: [
    { title: '暖木咖啡', desc: '由 AI 生成多頁餐飲網站，線上預覽流暢。', tag: '餐飲' },
    { title: '城市律所', desc: '快速建立專業服務網站，導航與表單完整。', tag: '法律' },
    { title: '品牌電商', desc: '從零到上線，商品與支付框架一應俱全。', tag: '電商' },
  ],
  articlesTitle: '最新文章',
  articles: [
    { title: 'AI 建站如何縮短上線時間', desc: '解析傳統開發與 AI 生成的差異。', tag: '指南' },
    { title: '算力計費與人民幣換算說明', desc: '一算力等於一元，用量透明可查。', tag: '計費' },
    { title: '自定義網域綁定完整教學', desc: '從 DNS 設定到驗證一次跑通。', tag: '教學' },
  ],
  faqTitle: '常見問題',
  faq: [
    { q: '需要技術背景才能使用嗎？', a: '不需要，輸入你的需求，AI 會生成完整網站並引導上線。' },
    { q: '算力如何計費？', a: '生成一次消耗 1.5 算力，修改一次消耗 0.3 算力，一算力等於一元人民幣。' },
    { q: '可以使用自己的網域嗎？', a: '可以，透過 DNS TXT 驗證後即可綁定自定義網域。' },
    { q: '數據會存放在哪裡？', a: '所有數據存放於 K-bot 自有服務器，不依賴第三方雲平台。' },
  ],
  footerNote: 'K-bot 讓每個人都能用 AI 建立屬於自己的網站。',
};

const zhHans: MarketingContent = {
  brand: 'K-bot',
  heroTitle: '从建站到获客的 AI 工作台',
  heroSub: '输入一句话，生成带支付、登录和后台的可上线系统，也能完成建站和获客。',
  ctaPrimary: '免费开始',
  ctaSecondary: '查看定价',
  stats: [
    { value: '179+', label: '可用 AI 模型' },
    { value: '6', label: '支持语言' },
    { value: '1', label: '算力等于一元' },
    { value: '24/7', label: '在线服务' },
  ],
  featuresTitle: '一站式 AI 建站能力',
  featuresSub: '从构思到上线，每一步都由 AI 协助完成',
  features: [
    { icon: 'i-ph:code', title: '全端代码生成', desc: '自动生成前端与后端完整代码，结构清晰，可直接维护。' },
    { icon: 'i-ph:users-three', title: '多 Agent 协作', desc: '规划、编辑、测试由不同 Agent 分工，流程更稳定。' },
    { icon: 'i-ph:database', title: 'CMS 后台', desc: '内置内容管理与用户管理，无需另行搭建。' },
    { icon: 'i-ph:palette', title: '多风格设计', desc: '配色、字体与设计特性自由组合，品牌风格一致。' },
    { icon: 'i-ph:globe-hemisphere-east', title: '网域部署', desc: '支持子域名与自定义网域，DNS 验证后直接上线。' },
    { icon: 'i-ph:magnifying-glass', title: 'SEO 与 GEO 优化', desc: '生成符合搜索与 AI 推荐逻辑的语义化内容。' },
    { icon: 'i-ph:eye', title: '在线预览', desc: '生成过程即时预览，所见即所得。' },
    { icon: 'i-ph:canvas', title: '可编辑设计画布', desc: '在画布中微调文件与界面，改动即时生效。' },
    { icon: 'i-ph:shopping-cart', title: '电商独立站', desc: '商品、订单与支付框架一应俱全。' },
    { icon: 'i-ph:figma-logo', title: 'Figma 与 Sketch 还原', desc: '依设计稿还原界面，保留设计细节。' },
  ],
  personasTitle: '适合谁用',
  personas: [
    { title: '中小企业主', desc: '没有技术团队也能快速建立官方网站与网店。', tag: '创业者' },
    { title: '自由工作者', desc: '接案时快速交付高质网站，提升产出效率。', tag: '设计师' },
    { title: '市场营销人员', desc: '快速落地活动页与落地页，及时配合推广。', tag: '营销' },
    { title: '开发者', desc: '用 AI 处理重复性工作，专注核心逻辑。', tag: '工程' },
  ],
  templatesTitle: '精选范本',
  templatesSub: '从热门场景快速开始，再依需求自由调整',
  templates: [
    { title: '咖啡厅官网', desc: '含品牌故事、菜单与门市信息。', tag: '餐饮' },
    { title: '律师事务所', desc: '专业形象、服务领域与预约咨询。', tag: '专业服务' },
    { title: '电商独立站', desc: '商品陈列、购物车与结账流程。', tag: '零售' },
    { title: '企业形象页', desc: '公司介绍、团队与新闻动态。', tag: '企业' },
    { title: '活动落地页', desc: '聚焦转换，含报名与倒数功能。', tag: '营销' },
    { title: '作品集网站', desc: '展示项目与经历，突出个人品牌。', tag: '创意' },
  ],
  casesTitle: '真实案例',
  cases: [
    { title: '暖木咖啡', desc: '由 AI 生成多页餐饮网站，在线预览流畅。', tag: '餐饮' },
    { title: '城市律所', desc: '快速建立专业服务网站，导航与表单完整。', tag: '法律' },
    { title: '品牌电商', desc: '从零到上线，商品与支付框架一应俱全。', tag: '电商' },
  ],
  articlesTitle: '最新文章',
  articles: [
    { title: 'AI 建站如何缩短上线时间', desc: '解析传统开发与 AI 生成的差异。', tag: '指南' },
    { title: '算力计费与人民币换算说明', desc: '一算力等于一元，用量透明可查。', tag: '计费' },
    { title: '自定义网域绑定完整教学', desc: '从 DNS 设置到验证一次跑通。', tag: '教学' },
  ],
  faqTitle: '常见问题',
  faq: [
    { q: '需要技术背景才能使用吗？', a: '不需要，输入你的需求，AI 会生成完整网站并引导上线。' },
    { q: '算力如何计费？', a: '生成一次消耗 1.5 算力，修改一次消耗 0.3 算力，一算力等于一元人民币。' },
    { q: '可以使用自己的网域吗？', a: '可以，通过 DNS TXT 验证后即可绑定自定义网域。' },
    { q: '数据会存放在哪里？', a: '所有数据存放于 K-bot 自有服务器，不依赖第三方云平台。' },
  ],
  footerNote: 'K-bot 让每个人都能用 AI 建立属于自己的网站。',
};

const en: MarketingContent = {
  brand: 'K-bot',
  heroTitle: 'The AI workspace from website to growth',
  heroSub: 'Describe it in one sentence and get a deployable system with payments, login and backend.',
  ctaPrimary: 'Start free',
  ctaSecondary: 'View pricing',
  stats: [
    { value: '179+', label: 'AI models' },
    { value: '6', label: 'Languages' },
    { value: '1', label: 'Credit per yuan' },
    { value: '24/7', label: 'Online service' },
  ],
  featuresTitle: 'All-in-one AI website building',
  featuresSub: 'From idea to launch, AI assists at every step',
  features: [
    { icon: 'i-ph:code', title: 'Full-stack code generation', desc: 'Generates complete frontend and backend code with clean structure.' },
    { icon: 'i-ph:users-three', title: 'Multi-agent collaboration', desc: 'Planning, editing and testing handled by specialized agents.' },
    { icon: 'i-ph:database', title: 'CMS backend', desc: 'Built-in content and user management, no extra setup needed.' },
    { icon: 'i-ph:palette', title: 'Multi-style design', desc: 'Combine colors, fonts and features for consistent branding.' },
    { icon: 'i-ph:globe-hemisphere-east', title: 'Domain deployment', desc: 'Supports subdomains and custom domains after DNS verification.' },
    { icon: 'i-ph:magnifying-glass', title: 'SEO & GEO optimization', desc: 'Semantic content built for search and AI recommendation.' },
    { icon: 'i-ph:eye', title: 'Live preview', desc: 'Real-time preview while generating, what you see is what you get.' },
    { icon: 'i-ph:canvas', title: 'Editable design canvas', desc: 'Fine-tune files and UI on the canvas with instant updates.' },
    { icon: 'i-ph:shopping-cart', title: 'Ecommerce store', desc: 'Products, orders and payment scaffolding ready to use.' },
    { icon: 'i-ph:figma-logo', title: 'Figma & Sketch restoration', desc: 'Reconstruct interfaces from design files in detail.' },
  ],
  personasTitle: 'Who it is for',
  personas: [
    { title: 'Small business owners', desc: 'Build websites and stores without a technical team.', tag: 'Founders' },
    { title: 'Freelancers', desc: 'Deliver quality sites faster and take on more work.', tag: 'Designers' },
    { title: 'Marketers', desc: 'Launch landing pages quickly to support campaigns.', tag: 'Marketing' },
    { title: 'Developers', desc: 'Let AI handle repetitive work and focus on core logic.', tag: 'Engineering' },
  ],
  templatesTitle: 'Featured templates',
  templatesSub: 'Start from popular scenarios and customize freely',
  templates: [
    { title: 'Coffee shop site', desc: 'Brand story, menu and location info.', tag: 'Food' },
    { title: 'Law firm site', desc: 'Professional image, practice areas and booking.', tag: 'Services' },
    { title: 'Ecommerce store', desc: 'Product catalog, cart and checkout flow.', tag: 'Retail' },
    { title: 'Corporate page', desc: 'Company intro, team and news updates.', tag: 'Enterprise' },
    { title: 'Campaign landing page', desc: 'Conversion focused with signup and countdown.', tag: 'Marketing' },
    { title: 'Portfolio website', desc: 'Showcase projects and build a personal brand.', tag: 'Creative' },
  ],
  casesTitle: 'Real cases',
  cases: [
    { title: 'Warm Wood Coffee', desc: 'AI-generated multi-page restaurant site with smooth preview.', tag: 'Food' },
    { title: 'City Law Firm', desc: 'Professional services site with complete navigation and forms.', tag: 'Legal' },
    { title: 'Brand ecommerce', desc: 'From zero to launch with products and payments ready.', tag: 'Ecommerce' },
  ],
  articlesTitle: 'Latest articles',
  articles: [
    { title: 'How AI site building cuts time to launch', desc: 'Comparing traditional development with AI generation.', tag: 'Guide' },
    { title: 'Credit billing and CNY conversion', desc: 'One credit equals one yuan, with transparent usage.', tag: 'Billing' },
    { title: 'Custom domain binding walkthrough', desc: 'From DNS setup to verification in one flow.', tag: 'Tutorial' },
  ],
  faqTitle: 'Frequently asked questions',
  faq: [
    { q: 'Do I need a technical background?', a: 'No, describe what you need and AI builds the complete site and guides launch.' },
    { q: 'How are credits charged?', a: 'Generation costs 1.5 credits and modification 0.3, with one credit equal to one yuan.' },
    { q: 'Can I use my own domain?', a: 'Yes, bind a custom domain after DNS TXT verification.' },
    { q: 'Where is my data stored?', a: 'All data lives on K-bot own servers without relying on third-party clouds.' },
  ],
  footerNote: 'K-bot lets everyone build their own website with AI.',
};

const enGB: MarketingContent = {
  ...en,
  ctaPrimary: 'Start free',
  ctaSecondary: 'View pricing',
};

const ja: MarketingContent = {
  brand: 'K-bot',
  heroTitle: '構築から集客までの AI ワークスペース',
  heroSub: '一言入力するだけで、決済、ログイン、管理画面を備えた公開可能なシステムを生成します。',
  ctaPrimary: '無料で始める',
  ctaSecondary: '料金を見る',
  stats: [
    { value: '179+', label: 'AI モデル' },
    { value: '6', label: '対応言語' },
    { value: '1', label: '1 算力 = 1 元' },
    { value: '24/7', label: 'オンライン' },
  ],
  featuresTitle: 'オールインワン AI 構築',
  featuresSub: 'アイデアから公開まで、すべての段階を AI が支援',
  features: [
    { icon: 'i-ph:code', title: 'フルスタックコード生成', desc: 'フロントとバックの完全なコードを明確な構造で生成。' },
    { icon: 'i-ph:users-three', title: 'マルチ Agent 連携', desc: '計画、編集、テストを専門 Agent が分担し安定稼働。' },
    { icon: 'i-ph:database', title: 'CMS 管理画面', desc: 'コンテンツとユーザー管理を内蔵し追加構築不要。' },
    { icon: 'i-ph:palette', title: 'マルチスタイル', desc: '配色、フォント、特性を組み合わせブランドを統一。' },
    { icon: 'i-ph:globe-hemisphere-east', title: 'ドメインデプロイ', desc: 'サブドメインと独自ドメインに対応、DNS 検証後に公開。' },
    { icon: 'i-ph:magnifying-glass', title: 'SEO・GEO 最適化', desc: '検索と AI 推薦に適した意味的コンテンツを生成。' },
    { icon: 'i-ph:eye', title: 'ライブプレビュー', desc: '生成中もリアルタイムで確認可能。' },
    { icon: 'i-ph:canvas', title: '編集可能なキャンバス', desc: 'ファイルと UI を微調整し即時反映。' },
    { icon: 'i-ph:shopping-cart', title: 'EC ストア', desc: '商品、注文、決済の枠組みを用意。' },
    { icon: 'i-ph:figma-logo', title: 'Figma・Sketch 復元', desc: 'デザインから画面を詳細に再現。' },
  ],
  personasTitle: '対象者',
  personas: [
    { title: '中小企業経営者', desc: '技術チームなしでサイトやネットショップを構築。', tag: '起業家' },
    { title: 'フリーランス', desc: '高品質なサイトを短時間で納品。', tag: 'デザイナー' },
    { title: 'マーケティング担当', desc: 'キャンペーン用 LP を迅速に公開。', tag: '営業' },
    { title: '開発者', desc: '繰り返し作業を AI に任せ本質に集中。', tag: 'エンジニア' },
  ],
  templatesTitle: '厳選テンプレート',
  templatesSub: '人気シーンから始めて自由にカスタマイズ',
  templates: [
    { title: 'カフェサイト', desc: 'ブランドストーリー、メニュー、店舗情報。', tag: '飲食' },
    { title: '法律事務所', desc: '専門イメージ、業務領域、予約相談。', tag: '専門サービス' },
    { title: 'EC ストア', desc: '商品陳列、カート、決済フロー。', tag: '小売' },
    { title: '企業ページ', desc: '会社紹介、チーム、ニュース。', tag: '企業' },
    { title: 'イベント LP', desc: '登録とカウントダウンで転換に集中。', tag: '営業' },
    { title: 'ポートフォリオ', desc: '実績を見せ個人ブランドを構築。', tag: 'クリエイティブ' },
  ],
  casesTitle: '導入事例',
  cases: [
    { title: 'Warm Wood Coffee', desc: 'AI 生成の複数ページ飲食サイト、滑らかなプレビュー。', tag: '飲食' },
    { title: 'City Law Firm', desc: '完全なナビとフォームを備えた専門サービスサイト。', tag: '法律' },
    { title: 'ブランド EC', desc: 'ゼロから公開まで商品と決済を用意。', tag: 'EC' },
  ],
  articlesTitle: '最新記事',
  articles: [
    { title: 'AI 構築が公開時間を短縮する理由', desc: '従来開発と AI 生成の違いを解説。', tag: 'ガイド' },
    { title: '算力課金と人民幣換算', desc: '1 算力 = 1 元、利用量は透明に確認。', tag: '課金' },
    { title: '独自ドメイン設定手順', desc: 'DNS 設定から検証まで一連の流れ。', tag: 'チュートリアル' },
  ],
  faqTitle: 'よくある質問',
  faq: [
    { q: '技術知識は必要ですか？', a: '不要です。要望を入力すると AI が完全なサイトを構築し公開を案内します。' },
    { q: '算力はどう課金されますか？', a: '生成は 1.5、修改は 0.3 算力を消費し、1 算力は 1 元です。' },
    { q: '独自ドメインは使えますか？', a: 'はい、DNS TXT 検証後に独自ドメインを設定できます。' },
    { q: 'データはどこに保存されますか？', a: 'すべて K-bot 自社サーバーに保存され第三者クラウドに依存しません。' },
  ],
  footerNote: 'K-bot は誰もが AI でウェブサイトを作れるようにします。',
};

const ko: MarketingContent = {
  brand: 'K-bot',
  heroTitle: '구축부터 고객 확보까지의 AI 워크스페이스',
  heroSub: '한 문장 입력으로 결제, 로그인, 백엔드를 갖춘 배포 가능한 시스템을 생성합니다.',
  ctaPrimary: '무료로 시작',
  ctaSecondary: '요금 보기',
  stats: [
    { value: '179+', label: 'AI 모델' },
    { value: '6', label: '지원 언어' },
    { value: '1', label: '1 컴퓨트 = 1 위안' },
    { value: '24/7', label: '온라인' },
  ],
  featuresTitle: '올인원 AI 구축 역량',
  featuresSub: '아이디어부터 출시까지 모든 단계를 AI가 지원',
  features: [
    { icon: 'i-ph:code', title: '풀스택 코드 생성', desc: '프론트와 백엔드의 완전한 코드를 명확한 구조로 생성합니다.' },
    { icon: 'i-ph:users-three', title: '멀티 Agent 협업', desc: '기획, 편집, 테스트를 전문 Agent가 분담해 안정적입니다.' },
    { icon: 'i-ph:database', title: 'CMS 백엔드', desc: '콘텐츠와 사용자 관리가 내장되어 추가 구축이 불필요합니다.' },
    { icon: 'i-ph:palette', title: '멀티 스타일 디자인', desc: '색상, 글꼴, 특성을 조합해 브랜드를 일관되게 유지합니다.' },
    { icon: 'i-ph:globe-hemisphere-east', title: '도메인 배포', desc: '서브도메인과 사용자 도메인을 지원하며 DNS 검증 후 출시합니다.' },
    { icon: 'i-ph:magnifying-glass', title: 'SEO·GEO 최적화', desc: '검색과 AI 추천에 적합한 시맨틱 콘텐츠를 생성합니다.' },
    { icon: 'i-ph:eye', title: '라이브 미리보기', desc: '생성 중 실시간으로 확인할 수 있습니다.' },
    { icon: 'i-ph:canvas', title: '편집 가능한 캔버스', desc: '파일과 UI를 미세 조정하고 즉시 반영합니다.' },
    { icon: 'i-ph:shopping-cart', title: '이커머스 스토어', desc: '상품, 주문, 결제 프레임을 갖추고 있습니다.' },
    { icon: 'i-ph:figma-logo', title: 'Figma·Sketch 복원', desc: '디자인 파일에서 화면을 상세하게 재현합니다.' },
  ],
  personasTitle: '대상 사용자',
  personas: [
    { title: '중소기업 대표', desc: '기술 팀 없이도 웹사이트와 쇼핑몰을 구축합니다.', tag: '창업자' },
    { title: '프리랜서', desc: '고품질 사이트를 빠르게 납품해 효율을 높입니다.', tag: '디자이너' },
    { title: '마케터', desc: '캠페인에 맞춰 랜딩페이지를 신속하게 엽니다.', tag: '마케팅' },
    { title: '개발자', desc: '반복 작업은 AI에 맡기고 핵심 로직에 집중합니다.', tag: '엔지니어링' },
  ],
  templatesTitle: '추천 템플릿',
  templatesSub: '인기 시나리오에서 시작해 자유롭게 조정',
  templates: [
    { title: '카페 사이트', desc: '브랜드 스토리, 메뉴, 매장 정보.', tag: '외식' },
    { title: '법률 사무소', desc: '전문 이미지, 업무 분야, 상담 예약.', tag: '전문 서비스' },
    { title: '이커머스 스토어', desc: '상품 진열, 장바구니, 결제 흐름.', tag: '소매' },
    { title: '기업 페이지', desc: '회사 소개, 팀, 뉴스 동향.', tag: '기업' },
    { title: '이벤트 랜딩', desc: '전환에 집중, 신청과 카운트다운.', tag: '마케팅' },
    { title: '포트폴리오', desc: '프로젝트를 보여주고 개인 브랜드 구축.', tag: '크리에이티브' },
  ],
  casesTitle: '실제 사례',
  cases: [
    { title: 'Warm Wood Coffee', desc: 'AI 생성 다중 페이지 외식 사이트, 부드러운 미리보기.', tag: '외식' },
    { title: 'City Law Firm', desc: '완전한 내비게이션과 양식을 갖춘 전문 서비스 사이트.', tag: '법률' },
    { title: '브랜드 이커머스', desc: '처음부터 출시까지 상품과 결제를 완비.', tag: '이커머스' },
  ],
  articlesTitle: '최신 아티클',
  articles: [
    { title: 'AI 구축이 출시 시간을 줄이는 방법', desc: '전통 개발과 AI 생성의 차이를 분석합니다.', tag: '가이드' },
    { title: '컴퓨트 과금과 위안화 환산', desc: '1 컴퓨트는 1 위안, 사용량을 투명하게 확인.', tag: '과금' },
    { title: '사용자 도메인 연결 완전 가이드', desc: 'DNS 설정부터 검증까지 한 번에 진행.', tag: '튜토리얼' },
  ],
  faqTitle: '자주 묻는 질문',
  faq: [
    { q: '기술 배경이 필요한가요?', a: '필요 없습니다. 요구사항을 입력하면 AI가 완전한 사이트를 만들고 출시를 안내합니다.' },
    { q: '컴퓨트는 어떻게 과금되나요?', a: '생성은 1.5, 수정은 0.3 컴퓨트가 들며 1 컴퓨트는 1 위안입니다.' },
    { q: '자체 도메인을 사용할 수 있나요?', a: '네, DNS TXT 검증 후 사용자 도메인을 연결할 수 있습니다.' },
    { q: '데이터는 어디에 저장되나요?', a: '모든 데이터는 K-bot 자체 서버에 저장되며 제3자 클라우드에 의존하지 않습니다.' },
  ],
  footerNote: 'K-bot은 누구나 AI로 웹사이트를 만들 수 있게 합니다.',
};

const ALL: Record<MarketingLang, MarketingContent> = {
  'zh-Hant': zhHant,
  'zh-Hans': zhHans,
  en,
  'en-GB': enGB,
  ja,
  ko,
};

export function getMarketingContent(lang: string): MarketingContent {
  const key = (lang in ALL ? lang : 'zh-Hant') as MarketingLang;
  return ALL[key];
}
