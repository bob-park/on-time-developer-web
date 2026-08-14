'use client';

import { Theme } from '@/shared/providers/theme/ThemeProvider';

import { ConfigProvider, theme as antdTheme } from 'antd';

export default function AntdProvider({ current, children }: Readonly<{ current: Theme; children: React.ReactNode }>) {
  const isDark = current === 'dark';

  return (
    <ConfigProvider
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
