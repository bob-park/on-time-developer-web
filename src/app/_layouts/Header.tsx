import { cookies } from 'next/headers';
import Link from 'next/link';

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
        <div className="md:hidden">
          <HeaderNav />
        </div>
        <Link href="/" className="flex flex-row items-center gap-2 px-2">
          <span className="bg-primary size-6 rounded-full" aria-hidden />
          <span className="text-lg font-bold">OnTime Developer</span>
        </Link>
        <div className="hidden md:block">
          <HeaderNav />
        </div>
      </div>

      <div className="flex flex-row items-center gap-2">
        <LanguageSwitcher />
        <ThemeSwitcher current={theme} />
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-circle btn-ghost">
            <UserAvatar src={userinfo && `/api/v1/users/${userinfo.sub}/avatar`} username={userinfo?.name ?? '?'} />
          </div>
          <ul tabIndex={0} className="menu dropdown-content rounded-box bg-base-200 z-10 mt-2 w-40 p-2 shadow-lg">
            <li className="menu-title">{userinfo?.name}</li>
            <li>
              <a href="/logout">{t('logout')}</a>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
