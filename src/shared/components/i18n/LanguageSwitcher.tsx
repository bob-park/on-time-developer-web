'use client';

import { useTransition } from 'react';

import { DEFAULT_LOCALE, Locale, SUPPORTED_LOCALES, isSupportedLocale } from '@/shared/i18n/config';
import { setLocale } from '@/shared/i18n/localeAction';

import cx from 'classnames';
import { useLocale } from 'next-intl';

const DISPLAY_LABEL: Record<Locale, string> = { ko: '한국어', en: 'English' };

export default function LanguageSwitcher() {
  // hooks
  const rawLocale = useLocale();
  const [isPending, startTransition] = useTransition();

  const currentLocale: Locale = isSupportedLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

  // handle
  const handleChange = (target: Locale) => {
    if (target === currentLocale) return;

    startTransition(async () => {
      await setLocale(target);
    });
  };

  return (
    <div className={cx('dropdown dropdown-end', isPending && 'pointer-events-none opacity-60')}>
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle" aria-label="change language">
        <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" />
          <path strokeLinecap="round" d="M3 12h18M12 3c2.5 2.5 2.5 15.5 0 18M12 3c-2.5 2.5-2.5 15.5 0 18" />
        </svg>
      </div>
      <ul tabIndex={0} className="menu dropdown-content rounded-box bg-base-200 z-30 mt-2 w-36 p-2 shadow-lg">
        {SUPPORTED_LOCALES.map((locale) => (
          <li key={locale}>
            <button type="button" className="flex justify-between" onClick={() => handleChange(locale)}>
              {DISPLAY_LABEL[locale]}
              {locale === currentLocale && (
                <svg
                  className="text-primary size-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
