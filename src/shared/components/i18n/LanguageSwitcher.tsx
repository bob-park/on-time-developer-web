'use client';

import { useTransition } from 'react';

import { DEFAULT_LOCALE, LOCALE_META, Locale, SUPPORTED_LOCALES, isSupportedLocale } from '@/shared/i18n/config';
import { setLocale } from '@/shared/i18n/localeAction';

import cx from 'classnames';
import { useLocale } from 'next-intl';

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
    <div
      role="radiogroup"
      className={cx(
        'flex items-center gap-[2px] rounded-lg border border-white/10 bg-white/5 p-[3px]',
        isPending && 'pointer-events-none opacity-60',
      )}
    >
      {SUPPORTED_LOCALES.map((locale) => {
        const active = locale === currentLocale;
        return (
          <button
            key={locale}
            type="button"
            role="radio"
            aria-checked={active}
            data-lang={locale}
            onClick={() => handleChange(locale)}
            className={cx(
              'btn px-2 py-1 text-[11.5px] font-bold tracking-[0.3px] transition-colors',
              active ? '' : 'text-gray-300 hover:text-white/70',
            )}
          >
            {LOCALE_META[locale].label}
          </button>
        );
      })}
    </div>
  );
}
