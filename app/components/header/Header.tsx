import { useStore } from '@nanostores/react';
import { ClientOnly } from 'remix-utils/client-only';
import { HeaderActionButtons } from './HeaderActionButtons.client';
import { TopNav } from './TopNav';
import { ChatDescription } from '~/lib/persistence/ChatDescription.client';
import { chatStore } from '~/lib/stores/chat';

export function Header() {
  const chat = useStore(chatStore);

  return (
    <header className="flex items-center px-6 border-b border-slate-200 h-[var(--header-height)] gap-4 bg-white">
      <div className="flex items-center gap-2 z-logo text-slate-900 cursor-pointer shrink-0">
        <a href="/" className="flex items-center gap-2">
          <img
            src="/logo/kbot-gradient.png"
            alt="K-bot"
            className="w-9 h-9 rounded-xl inline-block"
            style={{ animation: 'kbot-float 3s ease-in-out infinite' }}
          />
          <span className="text-lg font-bold text-slate-900 tracking-tight">K-bot</span>
        </a>
      </div>
      {chat.started ? (
        <>
          <span className="flex-1 px-4 truncate text-center text-slate-900">
            <ClientOnly>{() => <ChatDescription />}</ClientOnly>
          </span>
          <div className="shrink-0">
            <ClientOnly>
              {() => (
                <HeaderActionButtons chatStarted={chat.started} />
              )}
            </ClientOnly>
          </div>
        </>
      ) : (
        <div className="flex-1 min-w-0">
          <ClientOnly>{() => <TopNav />}</ClientOnly>
        </div>
      )}
    </header>
  );
}
