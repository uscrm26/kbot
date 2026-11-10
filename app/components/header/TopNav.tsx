import { useState } from 'react';
import { getNav, type NavGroup } from '~/lib/nav-config';
import { setLanguage, getLanguage, getAvailableLanguages } from '~/lib/i18n';
import { ThemeSwitch } from '~/components/ui/ThemeSwitch';
import { classNames } from '~/utils/classNames';
import { AuthPage } from '~/components/auth/AuthPage';
import { useAuthStore } from '~/lib/stores/auth';

export function TopNav() {
  const nav = getNav();
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [langOpen, setLangOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const currentLang = getLanguage();
  const languages = getAvailableLanguages();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const setAuth = useAuthStore((state) => state.setAuth);

  return (
    <>
      <style>{`
        @keyframes kbot-dropdown-in {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .kbot-dropdown {
          animation: kbot-dropdown-in 0.16s ease-out;
          transform-origin: top center;
        }
      `}</style>
      <div className="flex items-center justify-between w-full gap-6">
        <div className="flex items-center gap-0.5 min-w-0">
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
                const hrefMap: Record<string, string> = {
                  tools: '/product',
                  templates: '/templates',
                  cases: '/cases',
                  pricing: '/pricing',
                  articles: '/articles',
                  docs: '/docs',
                };
                window.location.href = hrefMap[link.id] || '/product';
              }}
              className="px-3 py-2 text-sm rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-900/5 transition-colors whitespace-nowrap"
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <ThemeSwitch />

          <div className="relative" onMouseLeave={() => setLangOpen(false)}>
            <button
              type="button"
              onClick={() => setLangOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-900/5 transition-colors"
            >
              <div className="i-ph:globe text-base" />
              <span>{languages.find((l) => l.code === currentLang)?.flag || '🇭🇰'}</span>
              <span className="hidden lg:inline">{languages.find((l) => l.code === currentLang)?.name}</span>
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full pt-2 z-50">
                <div className="kbot-dropdown min-w-[150px] rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 p-1">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        setLanguage(lang.code);
                        setLangOpen(false);
                      }}
                      className={classNames(
                        'flex items-center gap-2 w-full text-left px-3 py-2 text-sm rounded-lg',
                        lang.code === currentLang
                          ? 'text-accent-600 bg-accent-50 font-medium'
                          : 'text-slate-700 hover:bg-slate-100',
                      )}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="w-px h-6 bg-slate-200 mx-1" />

          {user ? (
            <div className="relative" onMouseLeave={() => setUserMenuOpen(false)}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-slate-700 hover:text-slate-900 hover:bg-slate-900/5 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-accent-600 text-white flex items-center justify-center text-xs font-semibold">
                  {user.name.slice(0, 1)}
                </div>
                <span className="hidden sm:inline max-w-[120px] truncate">{user.name}</span>
                <div className="i-ph:caret-down text-xs text-slate-400" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full pt-2 z-50">
                  <div className="kbot-dropdown min-w-[220px] rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 p-1.5">
                    <div className="px-3 py-2.5 rounded-xl bg-slate-50 mb-1">
                      <div className="text-xs text-slate-500">{nav.compute}</div>
                      <div className="text-xl font-bold text-accent-600 leading-tight">
                        {Math.round(user.k_compute_balance)}
                      </div>
                    </div>
                  <MenuButton
                    icon="i-ph:user"
                    label={nav.settings || '個人設置'}
                    onClick={() => {
                      setUserMenuOpen(false);
                      window.location.href = '/settings';
                    }}
                  />
                  <MenuButton
                    icon="i-ph:globe"
                    label={nav.mySites}
                    onClick={() => {
                      setUserMenuOpen(false);
                      window.location.href = '/dashboard';
                    }}
                  />
                  {user.role === 'admin' && (
                    <MenuButton
                      icon="i-ph:shield"
                      label="後台設置"
                      onClick={() => {
                        setUserMenuOpen(false);
                        window.location.href = '/admin';
                      }}
                    />
                  )}
                  <MenuButton
                    icon="i-ph:currency-cny"
                    label={nav.upgrade}
                    onClick={() => {
                      setUserMenuOpen(false);
                      window.location.href = '/pricing';
                    }}
                  />
                  <MenuButton
                    icon="i-ph:sign-out"
                    label={nav.logout}
                    danger
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                    }}
                  />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAuthOpen(true)}
              className="px-3 py-2 text-sm rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-900/5 transition-colors"
            >
              {nav.login}
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              window.location.href = '/';
            }}
            className="ml-1 px-4 py-2 text-sm rounded-lg bg-accent-600 text-white hover:bg-accent-700 transition-colors font-medium whitespace-nowrap"
          >
            {nav.start}
          </button>
        </div>
      </div>

      {authOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setAuthOpen(false)}
        >
          <div
            className="relative bg-white rounded-2xl shadow-xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setAuthOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-10"
            >
              <div className="i-ph:x text-xl" />
            </button>
            <AuthPage
              onSuccess={(authUser, session) => {
                setAuth(authUser, session);
                setAuthOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}

function MenuButton({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        'flex items-center gap-2.5 w-full text-left px-3 py-2 text-sm rounded-lg transition-colors',
        danger ? 'text-rose-500 hover:bg-rose-50' : 'text-slate-700 hover:bg-slate-100',
      )}
    >
      <div className={classNames(icon, 'text-base')} />
      {label}
    </button>
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
          'flex items-center gap-1 px-3 py-2 text-sm rounded-lg transition-colors whitespace-nowrap',
          open ? 'text-slate-900 bg-slate-900/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-900/5',
        )}
      >
        {group.label}
        <div className={classNames('i-ph:caret-down text-xs transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute left-0 top-full pt-2 z-50">
          <div className="kbot-dropdown min-w-[230px] rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10">
            {group.children.map((child) => (
              <button
                key={child.id}
                type="button"
                onClick={() => {
                  window.location.href = '/product';
                }}
                className="flex w-full text-left px-3 py-2 text-sm rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                {child.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
