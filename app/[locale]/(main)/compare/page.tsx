import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ComparePanel } from '@/components/compare';
import { Breadcrumbs } from '@/components/ui';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'site' });
  return {
    title: `${locale === 'zh-CN' ? '对比工具' : 'Comparison Tool'} - ${t('title')}`,
    description:
      locale === 'zh-CN'
        ? '并排对比火箭与航天器规格参数'
        : 'Side-by-side comparison of rockets and spacecraft specifications',
  };
}

export default function ComparePage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const isZh = locale === 'zh-CN';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs
        className="mb-6"
        items={[
          { label: isZh ? '首页' : 'Home', href: `/${locale}` },
          { label: isZh ? '对比工具' : 'Comparison Tool' },
        ]}
      />
      <ComparePanel locale={locale} />
    </div>
  );
}
