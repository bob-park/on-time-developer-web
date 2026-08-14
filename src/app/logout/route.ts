import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/shared/auth';

const { KEYFLOW_AUTH_HOST, BETTER_AUTH_URL } = process.env;

export async function GET(request: NextRequest) {
  const nextHeaders = await headers();

  let idToken: string | undefined;

  try {
    const token = await auth.api.getAccessToken({
      body: { providerId: 'keyflow-auth' },
      headers: nextHeaders,
    });
    idToken = token.idToken;
  } catch {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const res = await auth.api.signOut({
    headers: request.headers,
    asResponse: true,
  });

  const endSession = new URL(`${KEYFLOW_AUTH_HOST}/connect/logout`);

  if (idToken) {
    endSession.searchParams.set('id_token_hint', idToken);
    endSession.searchParams.set('post_logout_redirect_uri', BETTER_AUTH_URL ?? '/');
  }

  const redirect = NextResponse.redirect(endSession);

  res.headers.getSetCookie().forEach((cookie) => redirect.headers.append('Set-Cookie', cookie));

  return redirect;
}
