import { LocaleMeta } from './locale.type';

export const SUPPORTED_LOCALES = ['ko', 'en'] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_META: Record<Locale, LocaleMeta> = {
  ko: { code: 'ko', label: '한국어', htmlLang: 'ko' },
  en: { code: 'en', label: 'EN', htmlLang: 'en' },
};

export const DEFAULT_LOCALE: Locale = 'ko';
export const COOKIE_NAME_LOCALE = 'locale';
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isSupportedLocale(value: string | undefined): value is Locale {
  return value !== undefined && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}
