import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { SpaceTimeline } from '@/components/home/space-timeline';
import { Breadcrumbs } from '@/components/ui';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'site' });
  return {
    title: `${locale === 'zh-CN' ? '航天史时间线' : 'Space History Timeline'} - ${t('title')}`,
    description:
      locale === 'zh-CN'
        ? '从1957年至今的航天探索里程碑时间线'
        : 'A visual timeline of space exploration milestones from 1957 to today',
  };
}

export default async function TimelinePage({ params }: PageProps) {
  const { locale } = await params;
  const isZh = locale === 'zh-CN';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs
        className="mb-6"
        items={[
          { label: isZh ? '首页' : 'Home', href: `/${locale}` },
          { label: isZh ? '航天史时间线' : 'Space History Timeline' },
        ]}
      />
      <SpaceTimeline />
    </div>
  );
}
