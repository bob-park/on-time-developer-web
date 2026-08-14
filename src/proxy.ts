import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/shared/auth';

const IGNORE_PATH_PATTERNS = [/^\/login/, /^\/logout/];

export async function proxy(req: NextRequest) {
  const { pathname, search, origin } = req.nextUrl;

  if (IGNORE_PATH_PATTERNS.some((p) => p.test(pathname))) {
    return NextResponse.next();
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    const loginUrl = new URL('/login', origin);
    loginUrl.searchParams.set('callback', `${pathname}${search}`);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
