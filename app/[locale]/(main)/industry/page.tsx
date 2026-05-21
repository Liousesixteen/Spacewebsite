import Link from 'next/link';
import { Network, Building2, Cpu, Beaker, Wrench } from 'lucide-react';
import { prisma } from '@/lib/db';
import { Card, CardContent, Breadcrumbs, PageHeader } from '@/components/ui';
import { IndustryChainDiagram } from '@/components/industry/industry-chain-diagram';
import { MarketStats } from '@/components/industry/market-stats';
import type { IndustrySegment } from '@/lib/api/industry';

export default async function IndustryOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const [
    segmentsRaw,
    totalCompanies,
    totalTechnologies,
    totalMaterials,
    totalEquipment,
    aggregations,
  ] = await Promise.all([
    prisma.industrySegment.findMany({
      include: { _count: { select: { companies: true } } },
      orderBy: [{ level: 'asc' }, { category: 'asc' }],
    }),
    prisma.company.count(),
    prisma.technology.count(),
    prisma.material.count(),
    prisma.equipment.count(),
    prisma.industrySegment.aggregate({
      _sum: { marketSize: true },
      _avg: { growthRate: true },
    }),
  ]);

  const segments = segmentsRaw as unknown as IndustrySegment[];
  const totalSegments = segments.length;
  const marketSize = aggregations._sum.marketSize ?? 0;
  const averageGrowthRate = aggregations._avg.growthRate ?? 0;

  const quickLinks = [
    {
      href: `/${locale}/industry/companies`,
      label: 'Companies',
      description: 'Upstream and downstream companies across the space industry supply chain',
      icon: Building2,
    },
    {
      href: `/${locale}/industry/technologies`,
      label: 'Technologies',
      description: 'Key technologies and current development status',
      icon: Cpu,
    },
    {
      href: `/${locale}/industry/materials`,
      label: 'Materials',
      description: 'Aerospace materials and performance parameters',
      icon: Beaker,
    },
    {
      href: `/${locale}/industry/equipment`,
      label: 'Equipment',
      description: 'Space equipment and critical hardware',
      icon: Wrench,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs
        className="mb-4"
        items={[
          { label: 'SpaceData', href: `/${locale}` },
          { label: 'Industry' },
        ]}
      />

      <PageHeader
        icon={Network}
        title="Space Industry Chain"
        description="A complete overview of the space industry ecosystem -- from raw materials to space applications."
      />

      <section className="mb-10">
        <MarketStats
          totalSegments={totalSegments}
          totalCompanies={totalCompanies}
          totalTechnologies={totalTechnologies}
          totalMaterials={totalMaterials}
          totalEquipment={totalEquipment}
          marketSize={marketSize}
          averageGrowthRate={averageGrowthRate}
        />
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-star-white mb-6">Industry Chain Overview</h2>
        <IndustryChainDiagram segments={segments} locale={locale} />
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-star-white mb-6">Quick Navigation</h2>
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
