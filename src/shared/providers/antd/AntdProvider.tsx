'use client';

import { Locale } from '@/shared/i18n/config';
import { Theme } from '@/shared/providers/theme/ThemeProvider';

import { ConfigProvider, theme as antdTheme } from 'antd';
import enUS from 'antd/locale/en_US';
import koKR from 'antd/locale/ko_KR';

export default function AntdProvider({
  current,
  locale,
  children,
}: Readonly<{ current: Theme; locale: Locale; children: React.ReactNode }>) {
  const isDark = current === 'dark';

  return (
    <ConfigProvider
      locale={locale === 'ko' ? koKR : enUS}
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: isDark ? '#1ed760' : '#169c46',
          borderRadius: 8,
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
