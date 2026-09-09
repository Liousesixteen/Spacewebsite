'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { CalendarDays, Download, LayoutGrid, List, Rocket } from 'lucide-react';
import { getLaunches } from '@/lib/api/launches';
import { CountryLaunchSplit } from '@/components/launches/country-launch-split';
import {
  LaunchFilters,
  type LaunchFilterValues,
} from '@/components/launches/launch-filters';
import { LaunchCalendar } from '@/components/launches/launch-calendar';
import { LaunchMissionControl } from '@/components/launches/launch-mission-control';
import { Pagination, Breadcrumbs, PageHeader } from '@/components/ui';
import { cn } from '@/lib/utils';

type LaunchViewMode = 'grid' | 'table' | 'calendar';

export default function LaunchesPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = useTranslations('launches.page');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<LaunchFilterValues>({});
  const [viewMode, setViewMode] = useState<LaunchViewMode>('grid');

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
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            <div className="inline-flex items-center gap-1 rounded-md border border-space-600/60 bg-space-800/70 p-1">
              {([
                { mode: 'grid', label: t('grid'), icon: LayoutGrid },
                { mode: 'table', label: t('table'), icon: List },
                { mode: 'calendar', label: t('calendar'), icon: CalendarDays },
              ] as const).map(({ mode, label, icon: Icon }) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  aria-pressed={viewMode === mode}
                  className={cn(
                    'inline-flex h-9 items-center gap-2 rounded px-3 text-sm font-medium transition-colors',
                    viewMode === mode
                      ? 'bg-cosmic-blue text-white'
                      : 'text-star-dim hover:bg-space-700 hover:text-star-white'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
            <a
              href="/api/launches/export?limit=500"
              className="inline-flex h-11 items-center gap-2 rounded-md border border-space-600/50 bg-space-800/60 px-3 text-xs font-medium text-star-dim transition-colors hover:border-cosmic-blue/50 hover:text-star-white"
              download
            >
              <Download className="h-3.5 w-3.5" />
              CSV
            </a>
          </div>
        }
      />

      <LaunchMissionControl locale={locale} />

      {viewMode === 'calendar' ? (
        <section className="mt-8" aria-label={t('calendar')}>
          <LaunchCalendar locale={locale} />
        </section>
      ) : (
        <>
          <section className="mt-10 border-t border-space-600/35 pt-7">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-star-white">{t('archiveTitle')}</h2>
              <p className="mt-1 text-sm text-star-dim">{t('archiveDescription')}</p>
            </div>
            <LaunchFilters
              filters={filters}
              onFilterChange={(next) => {
                setFilters(next);
                setPage(1);
              }}
            />
          </section>

          {isLoading && (
            <div className="text-center py-12 text-star-dim">{t('loading')}</div>
          )}

          {error && (
            <div className="text-center py-12 text-red-400">{t('failed')}</div>
          )}

          {data && (
            <>
              <CountryLaunchSplit
                launches={data.data}
                locale={locale}
                viewMode={viewMode === 'table' ? 'table' : 'grid'}
              />

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
