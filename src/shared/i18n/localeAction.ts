'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

import { COOKIE_NAME_LOCALE, LOCALE_COOKIE_MAX_AGE, Locale, isSupportedLocale } from './config';

export async function setLocale(locale: Locale) {
  if (!isSupportedLocale(locale)) {
    throw new Error(`Unsupported locale: ${locale}`);
  }

  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME_LOCALE, locale, {
    path: '/',
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: 'lax',
  });

  revalidatePath('/', 'layout');
}
