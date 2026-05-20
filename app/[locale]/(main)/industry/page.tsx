import Link from 'next/link';
import { Network, Building2, Cpu, Beaker, Wrench } from 'lucide-react';
import { prisma } from '@/lib/db';
import { Card, CardContent, Breadcrumbs } from '@/components/ui';
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
      label: '企业库',
      description: '航天产业链上下游企业',
      icon: Building2,
    },
    {
      href: `/${locale}/industry/technologies`,
      label: '技术库',
      description: '关键技术与发展现状',
      icon: Cpu,
    },
    {
      href: `/${locale}/industry/materials`,
      label: '材料库',
      description: '航天材料与性能参数',
      icon: Beaker,
    },
    {
      href: `/${locale}/industry/equipment`,
      label: '设备库',
      description: '航天装备与关键设备',
      icon: Wrench,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs
        className="mb-4"
        items={[
          { label: '航天数据', href: `/${locale}` },
          { label: '产业链' },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <Network className="w-8 h-8 text-cosmic-blue" />
        <h1 className="text-3xl font-bold text-white">航天产业链</h1>
      </div>
      <p className="text-star-dim mb-8">
        从原材料到航天应用的完整产业生态全景
      </p>

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
        <h2 className="text-2xl font-semibold text-white mb-6">产业链全景</h2>
        <IndustryChainDiagram segments={segments} locale={locale} />
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-white mb-6">快速导航</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <Card variant="glow" className="h-full cursor-pointer">
                  <CardContent className="p-6">
                    <Icon className="w-8 h-8 text-cosmic-blue mb-3" />
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {link.label}
                    </h3>
                    <p className="text-sm text-star-dim">{link.description}</p>
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
