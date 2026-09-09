import Link from 'next/link';
import { Network, Building2, Cpu, Beaker, Wrench } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/db';
import { Card, CardContent, Breadcrumbs, PageHeader } from '@/components/ui';
import { IndustryChainBrowser } from '@/components/industry/industry-chain-browser';
import { MarketStats } from '@/components/industry/market-stats';
import { buildIndustryCoverage } from '@/lib/api/industry-coverage';

export default async function IndustryOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'industry' });

  const industryData = await loadIndustryData();

  const quickLinks = [
    {
      href: `/${locale}/industry/companies`,
      label: t('companies'),
      description: t('companyDescription'),
      icon: Building2,
    },
    {
      href: `/${locale}/industry/technologies`,
      label: t('technologies'),
      description: t('technologyDescription'),
      icon: Cpu,
    },
    {
      href: `/${locale}/industry/materials`,
      label: t('materials'),
      description: t('materialDescription'),
      icon: Beaker,
    },
    {
      href: `/${locale}/industry/equipment`,
      label: t('equipment'),
      description: t('equipmentDescription'),
      icon: Wrench,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs
        className="mb-4"
        items={[
          { label: 'SpaceData', href: `/${locale}` },
          { label: t('breadcrumb') },
        ]}
      />

      <PageHeader
        icon={Network}
        title={t('overviewTitle')}
        description={t('overviewDescription')}
      />

      <section className="mb-10">
        <MarketStats
          totalSegments={industryData.coverage.summary.totalSegments}
          totalCompanies={industryData.coverage.summary.totalCompanies}
          totalTechnologies={industryData.totalTechnologies}
          totalMaterials={industryData.totalMaterials}
          totalEquipment={industryData.totalEquipment}
          marketSize={industryData.marketSize}
          averageGrowthRate={industryData.averageGrowthRate}
          locale={locale}
          methodologyHref={`/${locale}/data-sources`}
          labels={{
            segments: t('segments'),
            companies: t('totalCompanies'),
            technologies: t('totalTechnologies'),
            materials: t('totalMaterials'),
            equipment: t('totalEquipment'),
            items: t('items'),
            companiesUnit: t('companiesUnit'),
            technologiesUnit: t('technologiesUnit'),
            materialsUnit: t('materialsUnit'),
            equipmentUnit: t('equipmentUnit'),
            marketSize: t('marketSize'),
            marketUnit: t('marketUnit'),
            averageGrowthRate: t('averageGrowthRate'),
            estimateNotice: t('estimateNotice'),
            methodology: t('methodology'),
          }}
        />
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-star-white mb-6">{t('chainOverview')}</h2>
        <IndustryChainBrowser
          locale={locale}
          initialData={{
            generatedAt: industryData.generatedAt,
            sourceStatus: industryData.sourceStatus,
            ...industryData.coverage,
          }}
        />
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-star-white mb-6">{t('quickNavigation')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <Card variant="elevated" className="h-full cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="p-3 rounded-xl frosted-icon text-cosmic-blue mb-4 group-hover:shadow-glow-blue transition-shadow duration-300">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-star-white mb-2 group-hover:text-cosmic-blue transition-colors duration-300">
                      {link.label}
                    </h3>
                    <p className="text-sm text-star-dim leading-relaxed">
                      {link.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

async function loadIndustryData() {
  const generatedAt = new Date().toISOString();

  try {
    const [segments, totalTechnologies, totalMaterials, totalEquipment, aggregations] =
      await Promise.all([
        prisma.industrySegment.findMany({
          include: {
            companies: {
              include: {
                company: {
                  select: {
                    id: true,
                    name: true,
                    country: true,
                    type: true,
                  },
                },
              },
            },
          },
          orderBy: [{ level: 'asc' }, { category: 'asc' }],
        }),
        prisma.technology.count(),
        prisma.material.count(),
        prisma.equipment.count(),
        prisma.industrySegment.aggregate({
          _sum: { marketSize: true },
          _avg: { growthRate: true },
        }),
      ]);

    return {
      generatedAt,
      sourceStatus: 'ok' as const,
      coverage: buildIndustryCoverage(segments),
      totalTechnologies,
      totalMaterials,
      totalEquipment,
      marketSize: aggregations._sum.marketSize ?? 0,
      averageGrowthRate: aggregations._avg.growthRate ?? 0,
    };
  } catch (error) {
    console.error('[industry] failed to load overview:', error);
    return {
      generatedAt,
      sourceStatus: 'unavailable' as const,
      coverage: buildIndustryCoverage([]),
      totalTechnologies: 0,
      totalMaterials: 0,
      totalEquipment: 0,
      marketSize: 0,
      averageGrowthRate: 0,
    };
  }
}
