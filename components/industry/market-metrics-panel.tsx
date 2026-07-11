'use client';

/**
 * Market metrics display panel.
 *
 * Shows market metrics with transparent methodology, source, currency,
 * base year, and estimation notes (per execution plan §4.2 and §8.1).
 */

import { TrendingUp, Info, DollarSign, Calendar, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface MarketMetricItem {
  id: string;
  metricName: string;
  metricValue: number;
  unit?: string | null;
  currency?: string | null;
  baseYear?: number | null;
  region?: string | null;
  source?: string | null;
  sourceUrl?: string | null;
  methodology?: string | null;
  factType: string;
}

export function MarketMetricsPanel({
  metrics,
  className,
}: {
  metrics: MarketMetricItem[];
  className?: string;
}) {
  if (metrics.length === 0) {
    return (
      <Card variant="elevated" className={className}>
        <CardContent className="p-6 text-center text-sm text-star-dim">
          暂无市场数据
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="elevated" className={cn(className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg text-star-white">
          <TrendingUp className="h-5 w-5 text-cosmic-blue" />
          市场参考数据
        </CardTitle>
        <p className="text-xs text-star-dim/70">
          以下数据来自公开来源，包含估算口径说明。不构成投资建议。
        </p>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {metrics.map((metric) => (
            <div
              key={metric.id}
              className="rounded-xl border border-space-600/30 bg-space-700/30 p-4"
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <h3 className="font-medium text-star-white">
                  {formatMetricName(metric.metricName)}
                </h3>
                <Badge
                  variant={metric.factType === 'ESTIMATED' ? 'hud' : 'info'}
                  className="text-[10px]"
                >
                  {metric.factType === 'OBSERVED'
                    ? '观测'
                    : metric.factType === 'ESTIMATED'
                      ? '估算'
                      : metric.factType}
                </Badge>
              </div>

              <div className="mb-3 text-2xl font-bold text-cosmic-blue">
                {formatValue(metric.metricValue, metric.currency, metric.unit)}
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-star-dim/70">
                {metric.baseYear && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    基准年: {metric.baseYear}
                  </span>
                )}
                {metric.region && (
                  <span className="inline-flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    {metric.region}
                  </span>
                )}
                {metric.source && (
                  <span className="inline-flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    来源: {metric.source}
                  </span>
                )}
              </div>

              {metric.methodology && (
                <div className="mt-2 rounded-lg border border-space-600/20 bg-space-800/40 p-2.5">
                  <div className="flex items-start gap-2">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-star-dim/50" />
                    <p className="text-xs text-star-dim/60 leading-relaxed">
                      {metric.methodology}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function formatMetricName(name: string): string {
  const labels: Record<string, string> = {
    market_size: '航天产业市场规模',
    government_budget: '政府航天预算',
    private_investment: '私营航天投资',
    launch_revenue: '发射服务收入',
    satellite_manufacturing: '卫星制造产值',
    ground_equipment: '地面设备产值',
    downstream_services: '下游应用服务产值',
    employment: '航天产业就业人数',
    rd_spending: '研发支出',
    export_value: '航天出口额',
  };
  return labels[name] ?? name;
}

function formatValue(
  value: number,
  currency?: string | null,
  unit?: string | null
): string {
  const currencySymbol: Record<string, string> = {
    USD: '$',
    EUR: '€',
    CNY: '¥',
    JPY: '¥',
    GBP: '£',
  };

  const prefix = currency ? (currencySymbol[currency] ?? `${currency} `) : '';

  if (unit === 'billion') {
    return `${prefix}${value.toFixed(1)} 十亿`;
  }
  if (unit === 'million') {
    return `${prefix}${value.toFixed(0)} 百万`;
  }
  if (unit === 'trillion') {
    return `${prefix}${value.toFixed(2)} 万亿`;
  }
  if (unit === 'people') {
    return `${value.toLocaleString()} 人`;
  }
  if (unit === 'percent') {
    return `${value.toFixed(1)}%`;
  }

  if (value >= 1e12) return `${prefix}${(value / 1e12).toFixed(2)} 万亿`;
  if (value >= 1e9) return `${prefix}${(value / 1e9).toFixed(1)} 十亿`;
  if (value >= 1e6) return `${prefix}${(value / 1e6).toFixed(0)} 百万`;
  return `${prefix}${value.toLocaleString()}`;
}
