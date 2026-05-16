import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/lib/i18n/config';
import { Navbar, Starfield } from '@/components/layout';
import { QueryProvider } from '@/components/providers/query-provider';
import '../globals.css';

export const metadata: Metadata = {
  title: 'SpaceData - 航天数据网站',
  description: '全面的航天数据平台，包含发射数据、航天器、宇航员和产业链信息',
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function RootLayout({
  children,
  params,
}: Props) {
  const { locale } = await params;

  if (!locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="min-h-screen bg-space-900">
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            <Starfield />
            <Navbar locale={locale} />
            <main className="pt-16">
              {children}
            </main>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
