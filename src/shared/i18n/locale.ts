import { cookies, headers } from 'next/headers';

import 'server-only';

import { COOKIE_NAME_LOCALE, DEFAULT_LOCALE, Locale, SUPPORTED_LOCALES, isSupportedLocale } from './config';

export async function getUserLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(COOKIE_NAME_LOCALE)?.value;

  if (isSupportedLocale(fromCookie)) {
    return fromCookie;
  }

  const headerList = await headers();
  const accept = (headerList.get('accept-language') ?? '').toLowerCase();

  const matched = SUPPORTED_LOCALES.find((locale) => accept.startsWith(locale));

  return matched ?? DEFAULT_LOCALE;
}
