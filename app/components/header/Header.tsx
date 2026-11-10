import { useStore } from '@nanostores/react';
import { ClientOnly } from 'remix-utils/client-only';
import { HeaderActionButtons } from './HeaderActionButtons.client';
import { TopNav } from './TopNav';
import { ChatDescription } from '~/lib/persistence/ChatDescription.client';
import { chatStore } from '~/lib/stores/chat';

export function Header() {
  const chat = useStore(chatStore);

  return (
    <header className="px-4 sm:px-6 pt-3 sm:pt-4 shrink-0">
      <div className="flex items-center gap-3 sm:gap-5 h-[var(--header-height)] rounded-2xl border border-white/70 bg-white/70 backdrop-blur-xl shadow-[0_10px_40px_rgba(15,23,42,0.12)] px-3 sm:px-4">
        <div className="flex items-center gap-2 z-logo text-slate-900 cursor-pointer shrink-0">
          <a href="/" className="flex items-center gap-2">
            <img
              src="/logo/kbot-gradient.png"
              alt="K-bot"
              className="w-8 h-8 rounded-lg inline-block"
              style={{ animation: 'kbot-float 3s ease-in-out infinite' }}
            />
            <span className="text-base font-bold text-slate-900 tracking-tight">K-bot</span>
          </a>
        </div>
        {chat.started ? (
          <>
            <span className="flex-1 px-2 truncate text-center text-slate-900 text-sm">
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
      </div>
    </header>
  );
}
