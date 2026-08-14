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
  );
}
