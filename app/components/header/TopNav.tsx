import { useState } from 'react';
import { getNav, type NavGroup } from '~/lib/nav-config';
import { setLanguage, getLanguage, getAvailableLanguages } from '~/lib/i18n';
import { ThemeSwitch } from '~/components/ui/ThemeSwitch';
import { classNames } from '~/utils/classNames';
import { AuthPage } from '~/components/auth/AuthPage';

export function TopNav() {
  const nav = getNav();
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [langOpen, setLangOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const currentLang = getLanguage();
  const languages = getAvailableLanguages();

  return (
    <div className="flex items-center gap-1 w-full bg-white">
      <div className="flex items-center gap-0.5">
        {nav.groups.map((group) => (
          <GroupMenu
            key={group.id}
            group={group}
            open={openGroup === group.id}
            onOpenChange={(open) => setOpenGroup(open ? group.id : null)}
          />
        ))}
        {nav.links.map((link) => (
          <button
            key={link.id}
            type="button"
            onClick={() => {
              if (link.id === 'pricing') {
                window.location.href = '/pricing';
              }
            }}
            className="px-3 py-2 text-sm rounded-md text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary hover:bg-white transition-colors whitespace-nowrap"
          >
            {link.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1.5 ml-auto">
        <ThemeSwitch />

        <div className="relative" onMouseLeave={() => setLangOpen(false)}>
          <button
            type="button"
            onClick={() => setLangOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary hover:bg-bolt-elements-item-backgroundActive transition-colors"
          >
            <div className="i-ph:globe text-base" />
            <span>{languages.find((l) => l.code === currentLang)?.flag || '🇭🇰'}</span>
            <span className="hidden sm:inline">{languages.find((l) => l.code === currentLang)?.name}</span>
          </button>
          {langOpen && (
            <div className="absolute right-0 top-full mt-1 min-w-[140px] rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 shadow-lg z-50 p-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setLanguage(lang.code);
                    setLangOpen(false);
                  }}
                  className={classNames(
                    'flex items-center gap-2 w-full text-left px-2 py-1 text-xs rounded-md hover:bg-bolt-elements-item-backgroundActive',
                    lang.code === currentLang
                      ? 'text-accent-600 font-medium'
                      : 'text-bolt-elements-textPrimary',
                  )}
                >
                  <span className="text-sm">{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setAuthOpen(true)}
          className="px-3 py-1.5 text-sm rounded-md text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary hover:bg-bolt-elements-item-backgroundActive transition-colors"
        >
          {nav.login}
        </button>
        <button
          type="button"
          className="px-4 py-1.5 text-sm rounded-lg bg-accent-600 text-white hover:bg-accent-700 transition-colors font-medium"
        >
          {nav.start}
        </button>
      </div>

      {/* 登入模態框 */}
      {authOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setAuthOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setAuthOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <div className="i-ph:x text-xl" />
            </button>
            <AuthPage onSuccess={() => setAuthOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

function GroupMenu({
  group,
  open,
  onOpenChange,
}: {
  group: NavGroup;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <div className="relative" onMouseEnter={() => onOpenChange(true)} onMouseLeave={() => onOpenChange(false)}>
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className={classNames(
          'flex items-center gap-1 px-3 py-2 text-sm rounded-md transition-colors whitespace-nowrap',
          open
            ? 'text-bolt-elements-textPrimary bg-white'
            : 'text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary hover:bg-white',
        )}
      >
        {group.label}
        <div className={classNames('i-ph:caret-down text-xs transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 min-w-[220px] rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 shadow-lg z-50 p-1.5">
          {group.children.map((child) => (
            <button
              key={child.id}
              type="button"
              className="flex w-full text-left px-3 py-2 text-sm rounded-md text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary hover:bg-bolt-elements-item-backgroundActive transition-colors"
            >
              {child.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
