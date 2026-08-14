import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/shared/auth';

export async function GET(request: NextRequest) {
  const callback = request.nextUrl.searchParams.get('callback') ?? '/';

  const { url } = await auth.api.signInWithOAuth2({
    body: {
      providerId: 'keyflow-auth',
      callbackURL: callback,
    },
    headers: request.headers,
  });

  return NextResponse.redirect(url);
}
