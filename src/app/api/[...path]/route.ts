import { NextRequest, NextResponse } from 'next/server';

import { getAccessToken } from '@/shared/auth/serverAction';

const { API_HOST } = process.env;

async function proxy(req: NextRequest) {
  let accessToken: string;

  try {
    accessToken = await getAccessToken();
  } catch {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { pathname, search } = req.nextUrl;

  const url = new URL(`${API_HOST}${pathname}`);
  url.search = search;

  const res = await fetch(url, {
    method: req.method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': req.headers.get('Content-Type') ?? 'application/json',
    },
    body: ['GET', 'HEAD'].includes(req.method) ? undefined : req.body,
    duplex: 'half',
  } as RequestInit & { duplex: 'half' });

  return new NextResponse(res.body, {
    status: res.status,
    headers: { 'Content-Type': res.headers.get('Content-Type') ?? 'application/json' },
  });
}

export { proxy as POST, proxy as GET, proxy as PUT, proxy as DELETE };
