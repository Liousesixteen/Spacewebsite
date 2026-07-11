'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Rocket } from 'lucide-react';
import { getLaunches } from '@/lib/api/launches';
import { LaunchCard } from '@/components/launches/launch-card';
import { LaunchTableRow } from '@/components/launches/launch-table-row';
import {
  LaunchFilters,
  type LaunchFilterValues,
} from '@/components/launches/launch-filters';
import { LaunchCalendar } from '@/components/launches/launch-calendar';
import { Download } from 'lucide-react';
import { LaunchMissionControl } from '@/components/launches/launch-mission-control';
import { ViewToggle, Pagination, AnimateIn, Breadcrumbs, PageHeader } from '@/components/ui';
import type { ViewMode } from '@/components/ui/view-toggle';

type PageViewMode = 'list' | 'calendar';

export default function LaunchesPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = useTranslations('launches.page');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<LaunchFilterValues>({});
  const [pageMode, setPageMode] = useState<PageViewMode>('list');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const { data, isLoading, error } = useQuery({
    queryKey: ['launches', page, filters],
    queryFn: () => getLaunches({ page, limit: 12, ...filters }),
  });

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
        icon={Rocket}
        title={t('title')}
        description={t('description')}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            {/* View mode toggle */}
            <div className="flex items-center gap-1 bg-space-800/60 backdrop-blur-md rounded-lg border border-space-600/50 p-1">
              <button
                onClick={() => setPageMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                  pageMode === 'list'
                    ? 'bg-cosmic-blue/20 text-cosmic-blue shadow-glow-blue'
                    : 'text-star-dim hover:text-star-white'
                }`}
              >
                {t('list')}
              </button>
              <button
                onClick={() => setPageMode('calendar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                  pageMode === 'calendar'
                    ? 'bg-cosmic-blue/20 text-cosmic-blue shadow-glow-blue'
                    : 'text-star-dim hover:text-star-white'
                }`}
              >
                {t('calendar')}
              </button>
            </div>

            {pageMode === 'list' && (
              <ViewToggle
                mode={viewMode}
                onChange={setViewMode}
                labels={{ grid: t('grid'), table: t('table') }}
              />
            )}
            <a
              href="/api/launches/export?limit=500"
              className="flex items-center gap-1.5 rounded-lg border border-space-600/40 bg-space-800/60 px-3 py-1.5 text-xs font-medium text-star-dim hover:text-star-white hover:border-cosmic-blue/50 transition-colors"
              download
            >
              <Download className="h-3.5 w-3.5" />
              CSV
            </a>
          </div>
        }
      />

      <LaunchMissionControl locale={locale} />

      {pageMode === 'calendar' ? (
        <div className="mt-8">
          <LaunchCalendar locale={locale} />
        </div>
      ) : (
        <>
          <div className="mt-8">
            <LaunchFilters
              filters={filters}
              onFilterChange={(next) => {
                setFilters(next);
                setPage(1);
              }}
            />
          </div>

          {isLoading && (
            <div className="text-center py-12 text-star-dim">{t('loading')}</div>
          )}

          {error && (
            <div className="text-center py-12 text-red-400">{t('failed')}</div>
          )}

          {data && (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
                  {data.data.map((launch, index) => (
                    <AnimateIn key={launch.id} delay={index * 50}>
                      <LaunchCard launch={launch} locale={locale} />
                    </AnimateIn>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-2 mt-8">
                  {data.data.map((launch, index) => (
                    <AnimateIn key={launch.id} delay={index * 30}>
                      <LaunchTableRow launch={launch} locale={locale} />
                    </AnimateIn>
                  ))}
                </div>
              )}

              {data.data.length === 0 && (
                <div className="text-center py-12 text-star-dim">{t('empty')}</div>
              )}

              <Pagination
                page={page}
                totalPages={data.pagination.totalPages}
                total={data.pagination.total}
                onPageChange={setPage}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
