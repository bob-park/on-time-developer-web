import type { Metadata } from 'next';

import { cookies } from 'next/headers';

import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';

import Contents from '@/app/_layouts/Contents';
import Footer from '@/app/_layouts/Footer';
import Header from '@/app/_layouts/Header';
import Chatbot from '@/shared/components/chatbot/Chatbot';
import QueryErrorToast from '@/shared/components/queries/QueryErrorToast';
import RQProvider from '@/shared/components/queries/RQProvider';
import ToastProvider from '@/shared/components/toast/ToastProvider';
import { LOCALE_META } from '@/shared/i18n/config';
import { getUserLocale } from '@/shared/i18n/locale';
import AntdProvider from '@/shared/providers/antd/AntdProvider';
import { Theme } from '@/shared/providers/theme/ThemeProvider';

import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { OverlayProvider } from 'overlay-kit';

import './globals.css';

const COOKIE_NAME_THEME = 'theme';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();

  const theme = (cookieStore.get(COOKIE_NAME_THEME)?.value ?? 'light') as Theme;

  const locale = await getUserLocale();
  const messages = await getMessages();
  const htmlLang = LOCALE_META[locale].htmlLang;

  const queryClient = new QueryClient();

  const dehydratedState = dehydrate(queryClient);

  return (
    <html lang={htmlLang} data-theme={theme}>
      <body className="relative size-full">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <RQProvider>
            <HydrationBoundary state={dehydratedState}>
              <AntdProvider current={theme}>
                <OverlayProvider>
                  <ToastProvider limit={5} timeout={5}>
                    <QueryErrorToast />
                    <Header />
                    <Contents>{children}</Contents>
                    <Footer />
                    <Chatbot />
                  </ToastProvider>
                </OverlayProvider>
              </AntdProvider>
            </HydrationBoundary>
          </RQProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
