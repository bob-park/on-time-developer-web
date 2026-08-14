import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { genericOAuth } from 'better-auth/plugins';

const { KEYFLOW_AUTH_HOST, KEYFLOW_AUTH_CLIENT_ID, KEYFLOW_AUTH_CLIENT_SECRET } = process.env;

export type Session = typeof auth.$Infer.Session;
export type SessionUser = Session['user'];
export const DEFAULT_PROVIDER_ID = 'keyflow-auth';

export const auth = betterAuth({
  user: {
    additionalFields: {
      sub: {
        type: 'string',
        required: true,
      },
      userId: {
        type: 'string',
        required: true,
      },
      role: {
        type: 'string',
        required: true,
      },
    },
  },
  plugins: [
    genericOAuth({
      config: [
        {
          providerId: 'keyflow-auth',
          clientId: KEYFLOW_AUTH_CLIENT_ID || '',
          clientSecret: KEYFLOW_AUTH_CLIENT_SECRET,
          pkce: true,
          discoveryUrl: `${KEYFLOW_AUTH_HOST}/.well-known/openid-configuration`,
          scopes: ['openid', 'profile', 'users:read:summary'],
          overrideUserInfo: true,
        },
      ],
    }),
    nextCookies(),
  ],
});
