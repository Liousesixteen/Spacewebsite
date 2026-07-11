import Link from 'next/link';
import { ArrowRight, Building2, Layers3 } from 'lucide-react';
import { Badge, Card, CardContent } from '@/components/ui';
import type { CountryValueChainLane } from '@/lib/api/country-industry';

interface ValueChainMapLabels {
  title: string;
  description: string;
  companyUnit: string;
  noCompanies: string;
  levelLabels: Record<string, string>;
  companyTypeLabels: Record<string, string>;
}

interface ValueChainMapProps {
  lanes: CountryValueChainLane[];
  locale: string;
  labels: ValueChainMapLabels;
}

export function ValueChainMap({ lanes, locale, labels }: ValueChainMapProps) {
  return (
    <Card variant="elevated" className="overflow-hidden">
      <CardContent className="p-5">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-xl font-semibold text-star-white">
              <Layers3 className="h-5 w-5 text-cosmic-blue" />
              {labels.title}
            </h3>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-star-dim">
              {labels.description}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-stretch">
          {lanes.map((lane, index) => (
            <LaneColumn
              key={lane.level}
              lane={lane}
              locale={locale}
              labels={labels}
              showArrow={index < lanes.length - 1}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function LaneColumn({
  lane,
  locale,
  labels,
  showArrow,
}: {
  lane: CountryValueChainLane;
  locale: string;
  labels: ValueChainMapLabels;
  showArrow: boolean;
}) {
  return (
    <>
      <div className="rounded-2xl border border-space-600/50 bg-space-700/35 p-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-star-white">
              {labels.levelLabels[lane.level] ?? lane.level}
            </div>
            <div className="mt-1 text-xs text-star-dim">
              {lane.companyCount} {labels.companyUnit}
            </div>
          </div>
          <div className="rounded-lg border border-cosmic-blue/25 bg-cosmic-blue/10 p-2 text-cosmic-blue">
            <Building2 className="h-4 w-4" />
          </div>
        </div>

        <div className="space-y-2">
          {lane.segments.slice(0, 4).map((segment) => (
            <div
              key={segment.id || segment.label}
              className="rounded-lg border border-space-600/40 bg-space-800/40 p-2"
            >
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="min-w-0 truncate text-star-white">{segment.label}</span>
                <span className="text-star-dim">{segment.count}</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-space-700">
                <div
                  className="h-full rounded-full bg-cosmic-blue"
                  style={{
                    width: `${Math.max(
                      10,
                      (segment.count / Math.max(lane.companyCount, 1)) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-2">
          {lane.companies.length === 0 && (
            <div className="rounded-lg border border-space-600/40 bg-space-800/35 p-3 text-sm text-star-dim">
              {labels.noCompanies}
            </div>
          )}
          {lane.companies.map((company) => (
            <Link
              key={company.id}
              href={`/${locale}/industry/companies/${company.id}`}
              className="block rounded-lg border border-space-600/40 bg-space-800/35 p-3 transition-colors hover:border-cosmic-blue/35 hover:bg-space-700/60"
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="min-w-0 truncate text-sm font-medium text-star-white">
                  {company.name}
                </span>
                <Badge variant="info" className="shrink-0">
                  {labels.companyTypeLabels[company.type] ?? company.type}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {company.segmentNames.slice(0, 2).map((name) => (
                  <Badge key={name} variant="default" className="normal-case">
                    {name}
                  </Badge>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {showArrow && (
        <div className="hidden items-center justify-center px-1 text-cosmic-blue/70 lg:flex">
          <ArrowRight className="h-6 w-6" />
        </div>
      )}
    </>
  );
}
