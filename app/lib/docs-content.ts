// K-bot 完整幫助文檔內容，六語言
export type DocLang = 'zh-Hant' | 'zh-Hans' | 'en' | 'en-GB' | 'ja' | 'ko';

export interface DocBlock {
  type: 'p' | 'list' | 'steps';
  items: string[];
}
export interface DocSection {
  id: string;
  title: string;
  blocks: DocBlock[];
}

interface DocContent {
  pageTitle: string;
  sections: DocSection[];
}

function p(text: string): DocBlock {
  return { type: 'p', items: [text] };
}
function list(items: string[]): DocBlock {
  return { type: 'list', items };
}
function steps(items: string[]): DocBlock {
  return { type: 'steps', items };
}

const zhHant: DocContent = {
  pageTitle: 'K-bot 幫助文檔',
  sections: [
    {
      id: 'welcome',
      title: '歡迎使用 K-bot',
      blocks: [
        p('K-bot 是一個 AI 建站工作台，只需要輸入自然語言需求，就能生成帶有前端、後台、登入與支付框架的完整網站，並在線上預覽與發布。'),
        p('本文檔涵蓋快速開始、帳戶管理、算力計費、網站發布、網域綁定與故障排除，幫助你從零開始把網站做到上線。'),
      ],
    },
    {
      id: 'quickstart',
      title: '快速開始',
      blocks: [
        steps([
          '打開 K-bot 首頁，在輸入框描述你想建立的網站，例如咖啡廳官網或公司形象頁。',
          '點擊發送，AI 會自動規劃、生成檔案、安裝依賴並啟動預覽。',
          '在右側工作台查看即時預覽，需要調整時直接在對話中說明修改需求。',
        ]),
        p('生成過程中可在左側看到每個工具的執行狀態，包含讀取檔案、編輯、安裝與啟動伺服器。'),
      ],
    },
    {
      id: 'account',
      title: '帳戶與認證',
      blocks: [
        p('點擊頂部登入按鈕，可以註冊新帳戶或使用已有帳戶登入，目前支援 Email 註冊與登入。'),
        list([
          '註冊需填寫使用者名稱、Email 與密碼。',
          '登入狀態會保存在本機，重新打開網頁仍保持登入。',
          '可在用戶下拉選單中查看我的網站、K 算力與升級方案，也能登出。',
        ]),
      ],
    },
    {
      id: 'compute',
      title: 'K 算力與計費',
      blocks: [
        p('K-bot 以 K 算力計量使用量，生成一次網站消耗 1.5 算力，修改一次消耗 0.3 算力。'),
        list([
          '一算力等於一元人民幣，所有金額換算透明可查。',
          '免費方案每月 10 算力，入門 100，專業 500，企業 2000。',
          '可在儀表板與頂部用戶選單查看當前餘額與已用算力。',
          '訪客可先行體驗，登入後正式計費，管理員帳戶不扣算力。',
        ]),
      ],
    },
    {
      id: 'save-publish',
      title: '保存與發布網站',
      blocks: [
        steps([
          '點擊頂部保存按鈕，把目前檔案存入你的帳戶。',
          '打開儀表板，選擇網站並點擊發布，系統會生成唯一的公開網址。',
          '發布後可透過 /site/ 加上你的網址名稱訪問公開頁面。',
        ]),
      ],
    },
    {
      id: 'domain',
      title: '自定義網域與 DNS 驗證',
      blocks: [
        p('在儀表板選擇網站並綁定自定義網域，系統會返回一條 TXT 驗證記錄。'),
        steps([
          '在 DNS 管理面板加入指定的 TXT 記錄，主機為 _kbot-verify。',
          '等待 DNS 生效後點擊驗證網域，系統會真實查詢 TXT 記錄。',
          '驗證通過後網域即可正式指向你的網站。',
        ]),
        p('若暫時沒有真實網域，可使用 demo 開頭的示範網域，系統會模擬 DNS 驗證直接跑通整個流程。'),
      ],
    },
    {
      id: 'voice',
      title: '語音輸入',
      blocks: [
        p('K-bot 支援語音輸入，可在輸入框工具列切換瀏覽器原生識別或豆包流式識別。'),
        list([
          '豆包識別經由後端代理連接，即時返回識別文字。',
          '語音服務與主網站同端口，無需額外設定。',
          '首次使用需允許瀏覽器存取麥克風。',
        ]),
      ],
    },
    {
      id: 'troubleshooting',
      title: '故障排除',
      blocks: [
        list([
          '若提示 AI 提供者請求失敗，多為服務間歇性故障，重新發送即可恢復。',
          '預覽無法顯示時，可重新加載頁面，系統會自動重新安裝依賴。',
          '網域驗證失敗請確認 TXT 記錄已生效，DNS 生效可能需要數分鐘。',
          '算力不足時可升級方案或等待下月配額重置。',
        ]),
      ],
    },
  ],
};

const zhHans: DocContent = {
  pageTitle: 'K-bot 帮助文档',
  sections: [
    {
      id: 'welcome',
      title: '欢迎使用 K-bot',
      blocks: [
        p('K-bot 是一个 AI 建站工作台，只需输入自然语言需求，就能生成带有前端、后端、登录与支付框架的完整网站，并在线预览和发布。'),
        p('本文档涵盖快速开始、账户管理、算力计费、网站发布、域名绑定与故障排除，帮助你从零开始把网站做到上线。'),
      ],
    },
    {
      id: 'quickstart',
      title: '快速开始',
      blocks: [
        steps([
          '打开 K-bot 首页，在输入框描述你想建立的网站，例如咖啡厅官网或公司形象页。',
          '点击发送，AI 会自动规划、生成文件、安装依赖并启动预览。',
          '在右侧工作台查看即时预览，需要调整时直接在对话中说明修改需求。',
        ]),
      ],
    },
    {
      id: 'account',
      title: '账户与认证',
      blocks: [
        p('点击顶部登录按钮，可以注册新账户或使用已有账户登录，目前支持 Email 注册与登录。'),
        list(['注册需填写用户名、Email 与密码。', '登录状态会保存在本机，重新打开网页仍保持登录。', '可在用户下拉菜单查看我的网站、K 算力与升级方案，也能登出。']),
      ],
    },
    {
      id: 'compute',
      title: 'K 算力与计费',
      blocks: [
        p('K-bot 以 K 算力计量使用量，生成一次网站消耗 1.5 算力，修改一次消耗 0.3 算力。'),
        list(['一算力等于一元人民币，所有金额换算透明可查。', '免费方案每月 10 算力，入门 100，专业 500，企业 2000。', '可在仪表板与顶部用户菜单查看当前余额与已用算力。', '访客可先行体验，登录后正式计费，管理员账户不扣算力。']),
      ],
    },
    {
      id: 'save-publish',
      title: '保存与发布网站',
      blocks: [
        steps(['点击顶部保存按钮，把当前文件存入你的账户。', '打开仪表板，选择网站并点击发布，系统会生成唯一的公开网址。', '发布后可通过 /site/ 加上网址名称访问公开页面。']),
      ],
    },
    {
      id: 'domain',
      title: '自定义域名与 DNS 验证',
      blocks: [
        p('在仪表板选择网站并绑定自定义域名，系统会返回一条 TXT 验证记录。'),
        steps(['在 DNS 管理面板加入指定的 TXT 记录，主机为 _kbot-verify。', '等待 DNS 生效后点击验证域名，系统会真实查询 TXT 记录。', '验证通过后域名即可正式指向你的网站。']),
        p('若暂时没有真实域名，可使用 demo 开头的示范域名，系统会模拟 DNS 验证直接跑通整个流程。'),
      ],
    },
    {
      id: 'voice',
      title: '语音输入',
      blocks: [
        p('K-bot 支持语音输入，可在输入框工具栏切换浏览器原生识别或豆包流式识别。'),
        list(['豆包识别经由后端代理连接，即时返回识别文字。', '语音服务与主网站同端口，无需额外设置。', '首次使用需允许浏览器存取麦克风。']),
      ],
    },
    {
      id: 'troubleshooting',
      title: '故障排除',
      blocks: [
        list(['若提示 AI 提供者请求失败，多为服务间歇性故障，重新发送即可恢复。', '预览无法显示时可重新加载页面，系统会自动重新安装依赖。', '域名验证失败请确认 TXT 记录已生效，DNS 生效可能需要数分钟。', '算力不足时可升级方案或等待下月配额重置。']),
      ],
    },
  ],
};

const en: DocContent = {
  pageTitle: 'K-bot Documentation',
  sections: [
    {
      id: 'welcome',
      title: 'Welcome to K-bot',
      blocks: [
        p('K-bot is an AI website building workspace. Describe your needs in natural language and get a complete site with frontend, backend, login and payment scaffolding, ready to preview and publish.'),
        p('This guide covers quick start, account management, credit billing, publishing, domain binding and troubleshooting.'),
      ],
    },
    {
      id: 'quickstart',
      title: 'Quick start',
      blocks: [
        steps([
          'Open the K-bot home page and describe the site you want, such as a coffee shop or company page.',
          'Click send, and AI plans, generates files, installs dependencies and starts the preview automatically.',
          'Review the live preview in the right workspace and describe any changes in the conversation.',
        ]),
      ],
    },
    {
      id: 'account',
      title: 'Account and authentication',
      blocks: [
        p('Use the top login button to register a new account or sign in. Email registration and login are currently supported.'),
        list(['Registration requires a username, email and password.', 'The session stays on this device after you reopen the page.', 'Access my sites, K compute and plan upgrades from the user menu, or sign out.']),
      ],
    },
    {
      id: 'compute',
      title: 'K compute and billing',
      blocks: [
        p('K-bot measures usage in K credits. Generating a site costs 1.5 credits and a modification costs 0.3.'),
        list(['One credit equals one Chinese yuan, with transparent conversion.', 'Plans include free 10, starter 100, pro 500 and enterprise 2000 monthly credits.', 'Check balance and used credits in the dashboard or user menu.', 'Guests can try the product, logged-in users are billed, and admin accounts are not charged.']),
      ],
    },
    {
      id: 'save-publish',
      title: 'Save and publish',
      blocks: [
        steps(['Click the top save button to store current files in your account.', 'Open the dashboard, choose a site and click publish to generate a unique public URL.', 'After publishing, visit the public page under /site/ with your URL name.']),
      ],
    },
    {
      id: 'domain',
      title: 'Custom domain and DNS verification',
      blocks: [
        p('Bind a custom domain in the dashboard and the system returns a TXT verification record.'),
        steps(['Add the specified TXT record in your DNS panel with host _kbot-verify.', 'Once DNS propagates, click verify and the system queries the TXT record directly.', 'After verification the domain points to your site.']),
        p('Without a real domain, use a demo-prefixed domain and the system simulates DNS verification to run the full flow.'),
      ],
    },
    {
      id: 'voice',
      title: 'Voice input',
      blocks: [
        p('K-bot supports voice input. Switch between native browser recognition and Doubao streaming recognition in the toolbar.'),
        list(['Doubao recognition connects through the backend proxy and returns text instantly.', 'The voice service shares the same port as the main site.', 'Allow microphone access on first use.']),
      ],
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      blocks: [
        list(['If an AI provider request fails, it is usually an intermittent issue and resending recovers it.', 'Reload the page when the preview fails and dependencies reinstall automatically.', 'Confirm the TXT record has propagated if domain verification fails, which may take a few minutes.', 'Upgrade your plan or wait for the monthly reset when credits run low.']),
      ],
    },
  ],
};

const enGB: DocContent = { ...en };

const ja: DocContent = {
  pageTitle: 'K-bot ドキュメント',
  sections: [
    { id: 'welcome', title: 'K-bot へようこそ', blocks: [p('K-bot は AI 構築ワークスペースです。自然言語で要望を入力すると、フロント、バック、ログイン、決済の枠組みを備えた完全なサイトを生成し、プレビューと公開ができます。'), p('本ガイドではクイックスタート、アカウント、算力課金、公開、ドメイン設定、トラブルシューティングを説明します。')] },
    { id: 'quickstart', title: 'クイックスタート', blocks: [steps(['ホームで作りたいサイト、例えばカフェや会社ページを説明します。', '送信すると AI が計画、ファイル生成、依存インストール、プレビュー開始を自動実行します。', '右側のプレビューを確認し、変更は会話で伝えます。'])] },
    { id: 'account', title: 'アカウントと認証', blocks: [p('上部のログインボタンで登録またはログインします。現在はメール認証に対応します。'), list(['登録にはユーザー名、メール、パスワードが必要です。', 'ログイン状態は端末に保存され再開後も維持されます。', 'ユーザーメニューからサイト、算力、プラン変更、ログアウトにアクセスできます。'])] },
    { id: 'compute', title: 'K 算力と課金', blocks: [p('K-bot は K 算力で利用量を計測し、生成は 1.5、修改は 0.3 を消費します。'), list(['1 算力は 1 元で換算は透明です。', 'プランは無料 10、スターター 100、プロ 500、エンタープライズ 2000 です。', '残高と利用量はダッシュボードで確認できます。', 'ゲストは試用可能で、ログイン後に課金され、管理者は消費されません。'])] },
    { id: 'save-publish', title: '保存と公開', blocks: [steps(['上部の保存ボタンでファイルをアカウントに保存します。', 'ダッシュボードでサイトを選び公開すると固有 URL が生成されます。', '公開後は /site/ と URL 名でアクセスします。'])] },
    { id: 'domain', title: '独自ドメインと DNS 検証', blocks: [p('ダッシュボードで独自ドメインを設定すると TXT 検証レコードが表示されます。'), steps(['DNS パネルで _kbot-verify の TXT レコードを追加します。', '伝播後に検証を押すと実際に TXT を照会します。', '検証後ドメインがサイトを指します。']), p('実ドメインがない場合は demo 始まりのドメインで DNS 検証を模擬し全体を確認できます。')] },
    { id: 'voice', title: '音声入力', blocks: [p('ツールバーでブラウザ認識と豆包ストリーミング認識を切り替えられます。'), list(['豆包認識はバックエンドプロキシ経由で即時に文字化します。', '音声サービスは本サイトと同じポートです。', '初回はマイク許可が必要です。'])] },
    { id: 'troubleshooting', title: 'トラブルシューティング', blocks: [list(['プロバイダ失敗は再送信で回復することが多いです。', 'プレビュー失敗時は再読み込みすると依存を再インストールします。', 'ドメイン検証失敗は TXT の伝播を数分待ちます。', '算力不足はプラン変更か月次リセットを待ちます。'])] },
  ],
};

const ko: DocContent = {
  pageTitle: 'K-bot 문서',
  sections: [
    { id: 'welcome', title: 'K-bot에 오신 것을 환영합니다', blocks: [p('K-bot은 AI 구축 워크스페이스입니다. 자연어로 요구사항을 입력하면 프론트, 백엔드, 로그인, 결제 프레임을 갖춘 완전한 사이트를 생성해 미리보기와 게시가 가능합니다.'), p('이 가이드는 빠른 시작, 계정, 컴퓨트 과금, 게시, 도메인 연결, 문제 해결을 다룹니다.')] },
    { id: 'quickstart', title: '빠른 시작', blocks: [steps(['홈에서 만들 사이트, 예를 들어 카페나 회사 페이지를 설명합니다.', '전송하면 AI가 기획, 파일 생성, 의존성 설치, 미리보기 시작을 자동으로 수행합니다.', '오른쪽 미리보기를 확인하고 변경은 대화로 전달합니다.'])] },
    { id: 'account', title: '계정과 인증', blocks: [p('상단 로그인 버튼으로 가입하거나 로그인합니다. 현재 이메일 인증을 지원합니다.'), list(['가입에는 사용자 이름, 이메일, 비밀번호가 필요합니다.', '로그인 상태는 기기에 저장되어 다시 열어도 유지됩니다.', '사용자 메뉴에서 내 사이트, 컴퓨트, 요금제 업그레이드, 로그아웃에 접근합니다.'])] },
    { id: 'compute', title: 'K 컴퓨트와 과금', blocks: [p('K-bot은 K 컴퓨트로 사용량을 측정하며 생성은 1.5, 수정은 0.3을 소비합니다.'), list(['1 컴퓨트는 1 위안이며 환산은 투명합니다.', '요금제는 무료 10, 스타터 100, 프로 500, 엔터프라이즈 2000입니다.', '잔액과 사용량은 대시보드에서 확인합니다.', '방문자는 체험 가능하고 로그인 후 과금되며 관리자는 차감되지 않습니다.'])] },
    { id: 'save-publish', title: '저장과 게시', blocks: [steps(['상단 저장 버튼으로 현재 파일을 계정에 저장합니다.', '대시보드에서 사이트를 선택해 게시하면 고유 URL이 생성됩니다.', '게시 후 /site/와 URL 이름으로 접속합니다.'])] },
    { id: 'domain', title: '사용자 도메인과 DNS 검증', blocks: [p('대시보드에서 사용자 도메인을 연결하면 TXT 검증 레코드가 표시됩니다.'), steps(['DNS 패널에서 _kbot-verify 호스트의 TXT 레코드를 추가합니다.', '전파 후 검증을 누르면 실제 TXT를 조회합니다.', '검증 후 도메인이 사이트를 가리킵니다.']), p('실제 도메인이 없으면 demo로 시작하는 도메인으로 DNS 검증을 모의해 전체 흐름을 확인할 수 있습니다.')] },
    { id: 'voice', title: '음성 입력', blocks: [p('도구 모음에서 브라우저 인식과 더우바오 스트리밍 인식을 전환할 수 있습니다.'), list(['더우바오 인식은 백엔드 프록시를 통해 즉시 텍스트를 반환합니다.', '음성 서비스는 메인 사이트와 같은 포트를 사용합니다.', '처음 사용 시 마이크 접근을 허용합니다.'])] },
    { id: 'troubleshooting', title: '문제 해결', blocks: [list(['제공자 요청 실패는 다시 보내면 복구되는 경우가 많습니다.', '미리보기 실패 시 페이지를 다시 로드하면 의존성을 재설치합니다.', '도메인 검증 실패는 TXT 전파를 몇 분 기다립니다.', '컴퓨트 부족은 요금제 업그레이드 또는 월간 재설정을 기다립니다.'])] },
  ],
};

const ALL: Record<DocLang, DocContent> = {
  'zh-Hant': zhHant,
  'zh-Hans': zhHans,
  en,
  'en-GB': enGB,
  ja,
  ko,
};

export function getDocContent(lang: string): DocContent {
  const key = (lang in ALL ? lang : 'zh-Hant') as DocLang;
  return ALL[key];
}
