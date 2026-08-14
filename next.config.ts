import type { NextConfig } from 'next';

import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: false,
  experimental: {
    authInterrupts: true,
  },
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  images: {
    remotePatterns: [
      {
        hostname: '**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NEXT_PUBLIC_APP_URL ?? '',
          },
        ],
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin('./src/shared/i18n/request.ts');
export default withNextIntl(nextConfig);
