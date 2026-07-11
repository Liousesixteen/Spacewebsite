import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Orbitron, Exo_2 } from 'next/font/google';
import { locales } from '@/lib/i18n/config';
import { Navbar, Starfield, Footer } from '@/components/layout';
import { QueryProvider } from '@/components/providers/query-provider';
import { AuthProvider } from '@/components/providers/auth-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { BackToTop } from '@/components/ui';
import '../globals.css';

const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-orbitron', display: 'swap' });
const exo2 = Exo_2({ subsets: ['latin'], variable: '--font-exo2', display: 'swap' });

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'site' });

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      type: 'website',
      locale,
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
    },
    alternates: {
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}`])),
      types: {
        'application/rss+xml': '/api/launches/rss',
      },
    },
    other: {
      'application/rss+xml': '/api/launches/rss',
    },
  };
}

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
    <html lang={locale} className={`${orbitron.variable} ${exo2.variable}`}>
      <body className="min-h-screen bg-space-900">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
          <AuthProvider>
            <QueryProvider>
              <Starfield />
              <Navbar locale={locale} />
              <main className="pt-16">
                {children}
              </main>
              <Footer locale={locale} />
              <BackToTop />
            </QueryProvider>
          </AuthProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
