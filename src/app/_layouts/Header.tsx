import { cookies } from 'next/headers';
import Link from 'next/link';

import DrawerToggle from '@/app/_layouts/DrawerToggle';
import HeaderNav from '@/app/_layouts/HeaderNav';
import UserAvatar from '@/domain/users/components/UserAvatar';
import { getUserinfo } from '@/shared/auth/serverAction';
import LanguageSwitcher from '@/shared/components/i18n/LanguageSwitcher';
import ThemeSwitcher from '@/shared/components/theme/ThemeSwitcher';
import { Theme } from '@/shared/providers/theme/ThemeProvider';

import { getTranslations } from 'next-intl/server';

const COOKIE_NAME_THEME = 'theme';

export default async function Header() {
  const cookieStore = await cookies();
  const theme = (cookieStore.get(COOKIE_NAME_THEME)?.value ?? 'light') as Theme;

  const userinfo = await getUserinfo();
  const t = await getTranslations('nav');

  return (
    <header className="navbar bg-base-200 sticky top-0 z-20 shadow-md">
      <div className="flex flex-1 flex-row items-center gap-2">
        <DrawerToggle />
        <Link href="/" className="flex flex-row items-center gap-2 px-2">
          <span className="bg-primary size-6 rounded-full" aria-hidden />
          <span className="text-lg font-bold">OnTime Developer</span>
        </Link>
        <HeaderNav />
      </div>

      <div className="flex flex-row items-center gap-2">
        <LanguageSwitcher />
        <ThemeSwitcher current={theme} />
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost h-auto min-h-0 gap-2 rounded-full py-1.5 pr-5 pl-1.5"
          >
            <UserAvatar src={userinfo && `/api/v1/users/${userinfo.sub}/avatar`} username={userinfo?.name ?? '?'} />
            <span className="text-base font-bold">{userinfo?.name}</span>
          </div>
          <ul tabIndex={0} className="menu dropdown-content rounded-box bg-base-200 z-30 mt-2 w-60 p-2 shadow-lg">
            <li className="pointer-events-none">
              <div className="flex flex-col items-start gap-0 py-2">
                <span className="font-bold">{userinfo?.name}</span>
                <span className="text-xs opacity-60">@{userinfo?.email?.split('@')[0]}</span>
              </div>
            </li>
            <li className="border-base-300 mt-1 border-t pt-1">
              <a href="/logout" className="text-red-500 hover:bg-red-200">
                <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
                  />
                </svg>
                {t('logout')}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
