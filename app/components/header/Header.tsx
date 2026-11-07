import { useStore } from '@nanostores/react';
import { ClientOnly } from 'remix-utils/client-only';
import { HeaderActionButtons } from './HeaderActionButtons.client';
import { TopNav } from './TopNav';
import { ChatDescription } from '~/lib/persistence/ChatDescription.client';
import { chatStore } from '~/lib/stores/chat';
import { classNames } from '~/utils/classNames';

export function Header() {
  const chat = useStore(chatStore);

  return (
    <header
      className={classNames('flex items-center px-4 border-b h-[var(--header-height)] gap-4 bg-white', {
        'border-transparent': !chat.started,
        'border-bolt-elements-borderColor': chat.started,
      })}
    >
      <div className="flex items-center gap-2 z-logo text-bolt-elements-textPrimary cursor-pointer shrink-0">
        <a href="/" className="flex items-center gap-2">
          <img
            src="/logo/kbot-gradient.png"
            alt="K-bot"
            className="w-9 h-9 rounded-xl inline-block"
            style={{ animation: 'kbot-float 3s ease-in-out infinite' }}
          />
          <span className="text-lg font-bold text-bolt-elements-textPrimary tracking-tight">K-bot</span>
        </a>
      </div>
      {chat.started ? (
        <>
          <span className="flex-1 px-4 truncate text-center text-bolt-elements-textPrimary">
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
