import { TrendingUp, Building2, Cpu, Beaker, Wrench } from 'lucide-react';
import { Card, CardContent } from '@/components/ui';

interface MarketStatsProps {
  totalSegments: number;
  totalCompanies: number;
  totalTechnologies: number;
  totalMaterials: number;
  totalEquipment: number;
  marketSize: number;
  averageGrowthRate: number;
}

export function MarketStats({
  totalSegments,
  totalCompanies,
  totalTechnologies,
  totalMaterials,
  totalEquipment,
  marketSize,
  averageGrowthRate,
}: MarketStatsProps) {
  const stats = [
    {
      label: '产业环节',
      value: totalSegments,
      suffix: '个',
      icon: TrendingUp,
      variant: 'cosmic-blue',
    },
    {
      label: '企业总数',
      value: totalCompanies,
      suffix: '家',
      icon: Building2,
      variant: 'cosmic-blue',
    },
    {
      label: '关键技术',
      value: totalTechnologies,
      suffix: '项',
      icon: Cpu,
      variant: 'cosmic-blue',
    },
    {
      label: '材料种类',
      value: totalMaterials,
      suffix: '种',
      icon: Beaker,
      variant: 'cosmic-blue',
    },
    {
      label: '设备种类',
      value: totalEquipment,
      suffix: '种',
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
                <div className="text-sm text-star-dim mb-2">全球市场规模</div>
                <div className="text-3xl font-bold text-star-white">
                  ${marketSize.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                  <span className="text-base text-star-dim ml-2">亿美元</span>
                </div>
              </CardContent>
            </Card>
          )}
          {averageGrowthRate > 0 && (
            <Card variant="glow">
              <CardContent className="p-6">
                <div className="text-sm text-star-dim mb-2">平均年增长率</div>
                <div className="text-3xl font-bold text-green-400">
                  {averageGrowthRate.toFixed(1)}%
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
