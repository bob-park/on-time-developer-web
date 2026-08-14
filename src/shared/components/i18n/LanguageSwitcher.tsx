'use client';

import { useTransition } from 'react';

import { DEFAULT_LOCALE, Locale, SUPPORTED_LOCALES, isSupportedLocale } from '@/shared/i18n/config';
import { setLocale } from '@/shared/i18n/localeAction';

import cx from 'classnames';
import { useLocale } from 'next-intl';

const DISPLAY_LABEL: Record<Locale, string> = { ko: '한국어', en: 'English' };
const FLAG: Record<Locale, string> = { ko: '🇰🇷', en: '🇺🇸' };

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
      <div
        tabIndex={0}
        role="button"
        className="btn btn-ghost h-auto min-h-0 rounded-full px-3 py-1.5"
        aria-label="change language"
      >
        <span aria-hidden>{FLAG[currentLocale]}</span>
        <span className="text-sm font-bold">{DISPLAY_LABEL[currentLocale]}</span>
      </div>
      <ul tabIndex={0} className="menu dropdown-content rounded-box bg-base-200 z-30 mt-2 w-36 p-2 shadow-lg">
        {SUPPORTED_LOCALES.map((locale) => (
          <li key={locale}>
            <button type="button" className="flex justify-between" onClick={() => handleChange(locale)}>
              <span>
                <span aria-hidden>{FLAG[locale]}</span> {DISPLAY_LABEL[locale]}
              </span>
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
