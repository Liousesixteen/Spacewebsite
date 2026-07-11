'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Building2, ChevronRight, Filter, Network } from 'lucide-react';
import type { IndustryCoverage } from '@/lib/api/industry-coverage';
import { Badge } from '@/components/ui';

interface IndustryCoverageResponse extends IndustryCoverage {
  generatedAt: string;
  sourceStatus: 'ok' | 'unavailable';
}

export function IndustryChainBrowser({
  initialData,
  locale,
}: {
  initialData: IndustryCoverageResponse;
  locale: string;
}) {
  const t = useTranslations('industry');
  const [country, setCountry] = useState('');
  const { data = initialData, isFetching } = useQuery({
    queryKey: ['industry-overview', country],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (country) params.set('country', country);
      const response = await fetch(`/api/industry/overview?${params}`);
      if (!response.ok) throw new Error('Industry coverage unavailable');
      return response.json() as Promise<IndustryCoverageResponse>;
    },
    initialData: country ? undefined : initialData,
    retry: false,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 border-y border-space-600/70 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-star-dim">
          <Network className="h-4 w-4 text-cosmic-cyan" />
          <span>
            {t('coverageSummary', {
              segments: data.summary.totalSegments,
              companies: data.summary.totalCompanies,
            })}
          </span>
          {isFetching && <span className="text-cosmic-cyan">{t('updating')}</span>}
        </div>
        <label className="flex items-center gap-2 text-sm text-star-dim">
          <Filter className="h-4 w-4" />
          <span>{t('countryFilter')}</span>
          <select
            value={country}
            onChange={(event) => setCountry(event.target.value)}
            className="h-9 min-w-44 rounded border border-space-500 bg-space-800 px-3 text-sm text-star-white outline-none focus:border-cosmic-blue"
          >
            <option value="">{t('allCountries')}</option>
            {initialData.countries.map((item) => (
              <option key={item.country} value={item.country}>
                {item.country} ({item.count})
              </option>
            ))}
          </select>
        </label>
      </div>

      {data.sourceStatus === 'unavailable' && (
        <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {t('sourceUnavailable')}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {data.levels.map((level, index) => (
          <section
            key={level.level}
            className="min-w-0 border-t-2 border-cosmic-blue bg-space-800/35"
          >
            <div className="border-b border-space-600/70 px-4 py-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-cosmic-cyan">
                    0{index + 1}
                  </span>
                  <h3 className="text-lg font-semibold text-star-white">
                    {t(`levels.${level.level}`)}
                  </h3>
                </div>
                <Badge variant="default">
                  {t('companyCount', { count: level.companyCount })}
                </Badge>
              </div>
              <p className="text-sm leading-relaxed text-star-dim">
                {t(`levelDescriptions.${level.level}`)}
              </p>
            </div>

            <div className="divide-y divide-space-600/60">
              {level.segments.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-star-dim">
                  {t('noCoverage')}
                </div>
              ) : (
                level.segments.map((segment) => (
                  <div key={segment.id} className="px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="text-sm font-medium text-star-white">
                          {segment.name}
                        </h4>
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-star-dim">
                          {segment.description}
                        </p>
                      </div>
                      <Link
                        href={`/${locale}/industry/companies?segmentId=${segment.id}${country ? `&country=${encodeURIComponent(country)}` : ''}`}
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded border border-space-500 text-star-dim transition-colors hover:border-cosmic-blue hover:text-cosmic-cyan"
                        aria-label={segment.name}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                    {segment.companies.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {segment.companies.map((company) => (
                          <Link
                            key={company.id}
                            href={`/${locale}/industry/companies/${company.id}`}
                            className="inline-flex max-w-full items-center gap-1.5 rounded border border-space-600 bg-space-900/55 px-2 py-1 text-xs text-star-dim transition-colors hover:border-cosmic-blue hover:text-star-white"
                          >
                            <Building2 className="h-3 w-3 shrink-0" />
                            <span className="truncate">{company.name}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
