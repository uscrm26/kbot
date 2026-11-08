import type { MetaFunction } from 'react-router';
import { ClientOnly } from 'remix-utils/client-only';
import { BaseChat } from '~/components/chat/BaseChat';
import { Chat } from '~/components/chat/Chat.client';
import { Header } from '~/components/header/Header';
import { FirstRunOnboarding } from '~/components/onboarding/FirstRunOnboarding';
import BackgroundRays from '~/components/ui/BackgroundRays';

export const meta: MetaFunction = () => {
  return [{ title: 'K-bot - 從建站到獲客的 AI 工作檯' }, { name: 'description', content: '生成帶支付、登入和後台的可上線系統，也能完成建站和獲客。' }];
};

export const loader = () => Response.json({});

/**
 * Landing page component for Bolt
 * Note: Settings functionality should ONLY be accessed through the sidebar menu.
 * Do not add settings button/panel to this landing page as it was intentionally removed
 * to keep the UI clean and consistent with the design system.
 */
export default function Index() {
  return (
    <div className="flex flex-col h-full w-full bg-bolt-elements-background-depth-1">
      <BackgroundRays />
      <Header />
      <ClientOnly fallback={<BaseChat />}>{() => <Chat />}</ClientOnly>
      <FirstRunOnboarding />
    </div>
  );
}
