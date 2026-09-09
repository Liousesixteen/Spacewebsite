import Link from 'next/link';
import { TrendingUp, Building2, Cpu, Beaker, Wrench, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui';

interface MarketStatsProps {
  totalSegments: number;
  totalCompanies: number;
  totalTechnologies: number;
  totalMaterials: number;
  totalEquipment: number;
  marketSize: number;
  averageGrowthRate: number;
  locale: string;
  methodologyHref: string;
  labels: {
    segments: string;
    companies: string;
    technologies: string;
    materials: string;
    equipment: string;
    items: string;
    companiesUnit: string;
    technologiesUnit: string;
    materialsUnit: string;
    equipmentUnit: string;
    marketSize: string;
    marketUnit: string;
    averageGrowthRate: string;
    estimateNotice: string;
    methodology: string;
  };
}

export function MarketStats({
  totalSegments,
  totalCompanies,
  totalTechnologies,
  totalMaterials,
  totalEquipment,
  marketSize,
  averageGrowthRate,
  locale,
  methodologyHref,
  labels,
}: MarketStatsProps) {
  const marketSizeBillions = marketSize / 10;
  const stats = [
    {
      label: labels.segments,
      value: totalSegments,
      suffix: labels.items,
      icon: TrendingUp,
      variant: 'cosmic-blue',
    },
    {
      label: labels.companies,
      value: totalCompanies,
      suffix: labels.companiesUnit,
      icon: Building2,
      variant: 'cosmic-blue',
    },
    {
      label: labels.technologies,
      value: totalTechnologies,
      suffix: labels.technologiesUnit,
      icon: Cpu,
      variant: 'cosmic-blue',
    },
    {
      label: labels.materials,
      value: totalMaterials,
      suffix: labels.materialsUnit,
      icon: Beaker,
      variant: 'cosmic-blue',
    },
    {
      label: labels.equipment,
      value: totalEquipment,
      suffix: labels.equipmentUnit,
      icon: Wrench,
      variant: 'cosmic-blue',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} variant="glow">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-2">
                  <Icon className="w-5 h-5 text-cosmic-blue" />
                  <span className="text-sm text-star-dim">{stat.label}</span>
                </div>
                <div className="text-2xl font-bold text-star-white">
                  {stat.value.toLocaleString()}
                  <span className="text-sm text-star-dim ml-1">
                    {stat.suffix}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {(marketSize > 0 || averageGrowthRate > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {marketSize > 0 && (
            <Card variant="glow">
              <CardContent className="p-6">
                <div className="text-sm text-star-dim mb-2">{labels.marketSize}</div>
                <div className="text-3xl font-bold text-star-white">
                  {new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(marketSizeBillions)}
                  <span className="text-base text-star-dim ml-2">{labels.marketUnit}</span>
                </div>
              </CardContent>
            </Card>
          )}
          {averageGrowthRate > 0 && (
            <Card variant="glow">
              <CardContent className="p-6">
                <div className="text-sm text-star-dim mb-2">{labels.averageGrowthRate}</div>
                <div className="text-3xl font-bold text-green-400">
                  {averageGrowthRate.toFixed(1)}%
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {(marketSize > 0 || averageGrowthRate > 0) && (
        <div className="flex items-start gap-2 rounded-md border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-xs leading-5 text-star-dim">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <span>
            {labels.estimateNotice}{' '}
            <Link href={methodologyHref} className="text-cosmic-cyan hover:underline">
              {labels.methodology}
            </Link>
          </span>
        </div>
      )}
    </div>
  );
}
