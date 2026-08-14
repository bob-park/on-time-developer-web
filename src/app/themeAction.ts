'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

import { Theme } from '@/shared/providers/theme/ThemeProvider';

const COOKIE_NAME_THEME = 'theme';

export async function setTheme(theme: Theme) {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME_THEME, theme, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });

  revalidatePath('/', 'layout');
}
