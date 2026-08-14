'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import cx from 'classnames';
import { useTranslations } from 'next-intl';

const MENUS = [
  { key: 'dashboard', href: '/dashboard' },
  { key: 'commits', href: '/commits' },
  { key: 'dailyReport', href: '/reports/daily' },
  { key: 'weeklyReport', href: '/reports/weekly' },
] as const;

export default function HeaderNav() {
  // hooks
  const pathname = usePathname();
  const t = useTranslations('nav');

  return (
    <>
      {/* desktop */}
      <nav className="hidden flex-row items-center gap-1 md:flex">
        {MENUS.map((menu) => (
          <Link
            key={menu.key}
            href={menu.href}
            className={cx(
              'btn btn-ghost btn-sm',
              pathname.startsWith(menu.href) ? 'font-bold' : 'font-normal opacity-70',
            )}
          >
            {t(menu.key)}
          </Link>
        ))}
      </nav>

      {/* mobile - hamburger */}
      <div className="dropdown md:hidden">
        <div tabIndex={0} role="button" className="btn btn-ghost btn-square" aria-label="menu">
          <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>
        <ul tabIndex={0} className="menu dropdown-content rounded-box bg-base-200 z-10 mt-2 w-52 p-2 shadow-lg">
          {MENUS.map((menu) => (
            <li key={menu.key}>
              <Link href={menu.href} className={cx(pathname.startsWith(menu.href) && 'font-bold')}>
                {t(menu.key)}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
