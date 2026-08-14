'use server';

import { cache } from 'react';

import { headers } from 'next/headers';

import { DEFAULT_PROVIDER_ID, auth } from '@/shared/auth/index';

const getSession = cache(async () =>
  auth.api.getSession({
    headers: await headers(),
  }),
);

export async function getAccessToken() {
  const accessToken = await auth.api.getAccessToken({
    body: {
      providerId: DEFAULT_PROVIDER_ID,
    },
    headers: await headers(),
  });

  return accessToken.accessToken;
}

export async function getUserinfo() {
  const session = await getSession();

  return session?.user;
}
