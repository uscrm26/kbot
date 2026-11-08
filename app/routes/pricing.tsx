import { useState, useEffect } from 'react';
import { getCurrentUser } from '~/lib/server/auth';

const PRICING_PLANS = [
  {
    id: 'free',
    name: '免費版',
    price: '$0',
    period: '/月',
    kCompute: '10 K算力',
    features: [
      '生成 6 個網站',
      '基礎 AI 功能',
      '社區支持',
    ],
    cta: '當前方案',
    highlighted: false,
  },
  {
    id: 'starter',
    name: '入門版',
    price: '$9',
    period: '/月',
    kCompute: '100 K算力',
    features: [
      '生成 60 個網站',
      '無限修改',
      '自定義網域',
      '郵件支持',
    ],
    cta: '立即升級',
    highlighted: false,
  },
  {
    id: 'pro',
    name: '專業版',
    price: '$29',
    period: '/月',
    kCompute: '500 K算力',
    features: [
      '生成 300 個網站',
      '無限修改',
      '自定義網域',
      '優先支持',
      '高級 AI 模型',
    ],
    cta: '立即升級',
    highlighted: true,
  },
  {
    id: 'enterprise',
    name: '企業版',
    price: '$99',
    period: '/月',
    kCompute: '2000 K算力',
    features: [
      '生成 1200 個網站',
      '無限修改',
      '自定義網域',
      '專屬客戶經理',
      'API 訪問',
      'SLA 保障',
    ],
    cta: '聯繫我們',
    highlighted: false,
  },
];

export default function PricingPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    // 獲取用戶信息
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const handleUpgrade = async (tierId: string) => {
    if (!user) {
      window.location.href = '/auth';
      return;
    }

    setUpgrading(tierId);

    try {
      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: tierId }),
      });

      const data = await response.json();

      if (data.mock) {
        alert('PayPal 還沒配置，這是演示版本。配置 PAYPAL_CLIENT_ID 環境變量後就能用了。');
      } else if (data.approveUrl) {
        window.location.href = data.approveUrl;
      }
    } catch (error) {
      alert('創建訂單失敗，請稍後再試。');
    } finally {
      setUpgrading(null);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">選擇適合你的方案</h1>
          <p className="text-xl text-gray-600">隨時升級或降級，沒有隱藏費用</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl shadow-lg p-8 ${
                plan.highlighted ? 'ring-2 ring-blue-500 scale-105' : ''
              }`}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                <span className="text-gray-500">{plan.period}</span>
              </div>
              <div className="mb-6 text-blue-600 font-medium">{plan.kCompute}/月</div>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={upgrading === plan.id || plan.id === 'free'}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  plan.highlighted
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                } disabled:opacity-50`}
              >
                {upgrading === plan.id ? '處理中...' : plan.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center text-gray-500">
          <p>所有方案都包含：6 語言界面、深藍主題、網站預覽、GitHub 部署</p>
        </div>
      </div>
    </div>
  );
}
