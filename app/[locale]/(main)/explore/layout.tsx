import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const tSite = await getTranslations({ locale, namespace: 'site' });
  const t = await getTranslations({ locale, namespace: 'explore' });

  const title = `${t('title')} | ${tSite('title')}`;
  return {
    title,
    description: t('subtitle'),
    openGraph: { title, description: t('subtitle'), type: 'website', locale },
    twitter: { card: 'summary_large_image', title, description: t('subtitle') },
  };
}

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
