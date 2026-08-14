'use client';

import { useEffect } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import UserAvatar from '@/domain/users/components/UserAvatar';

import cx from 'classnames';
import { useTranslations } from 'next-intl';

const MENUS = [
  { key: 'dashboard', href: '/dashboard' },
  { key: 'commits', href: '/commits' },
  { key: 'dailyReport', href: '/reports/daily' },
  { key: 'weeklyReport', href: '/reports/weekly' },
] as const;

export default function MobileDrawerSide({
  username,
  avatarSrc,
}: Readonly<{ username: string; avatarSrc?: string | false }>) {
  // hooks
  const pathname = usePathname();
  const t = useTranslations('nav');

  // useEffect
  useEffect(() => {
    const toggle = document.getElementById('mobile-drawer') as HTMLInputElement | null;

    if (toggle) {
      toggle.checked = false;
    }
  }, [pathname]);

  return (
    <div className="drawer-side z-40">
      <label htmlFor="mobile-drawer" aria-label="close menu" className="drawer-overlay" />
      <aside className="bg-base-200 flex min-h-full w-72 flex-col">
        <div className="flex flex-row items-center gap-2 p-4">
          <span className="bg-primary size-6 rounded-full" aria-hidden />
          <span className="text-lg font-bold">OnTime Developer</span>
        </div>

        <nav className="flex flex-col gap-1 px-3">
          {MENUS.map((menu) => (
            <Link
              key={menu.key}
              href={menu.href}
              className={cx(
                'rounded-lg px-4 py-3 text-sm font-bold',
                pathname.startsWith(menu.href) ? 'bg-primary text-primary-content' : 'opacity-70',
              )}
            >
              {t(menu.key)}
            </Link>
          ))}
        </nav>

        <div className="border-base-300 mt-auto flex flex-row items-center gap-3 border-t p-4">
          <UserAvatar src={avatarSrc} username={username} />
          <div className="flex flex-col">
            <span className="text-sm font-bold">{username}</span>
            <a href="/logout" className="link text-xs opacity-60">
              {t('logout')}
            </a>
          </div>
        </div>
      </aside>
    </div>
  );
}
