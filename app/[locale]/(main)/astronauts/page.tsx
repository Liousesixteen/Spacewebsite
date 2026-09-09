'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Users } from 'lucide-react';
import { getAstronauts } from '@/lib/api/astronauts';
import { AstronautCard } from '@/components/astronauts/astronaut-card';
import { AstronautTableRow } from '@/components/astronauts/astronaut-table-row';
import {
  AstronautFilters,
  type AstronautFilterValues,
} from '@/components/astronauts/astronaut-filters';
import { ViewToggle, Pagination, AnimateIn, Breadcrumbs, PageHeader } from '@/components/ui';
import type { ViewMode } from '@/components/ui/view-toggle';

export default function AstronautsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = useTranslations('astronauts');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<AstronautFilterValues>({});
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const { data, isLoading, error } = useQuery({
    queryKey: ['astronauts', page, filters],
    queryFn: () => getAstronauts({ page, limit: 12, ...filters }),
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
        icon={Users}
        title={t('title')}
        description={t('description')}
        actions={
          <ViewToggle
            mode={viewMode}
            onChange={setViewMode}
            labels={{ grid: t('grid'), table: t('table') }}
          />
        }
      />

      <AstronautFilters
        filters={filters}
        onFilterChange={(next) => {
          setFilters(next);
          setPage(1);
        }}
      />

      {isLoading && (
        <div className="py-12 text-center text-star-dim">{t('loading')}</div>
      )}

      {error && (
        <div className="py-12 text-center text-red-400">{t('failed')}</div>
      )}

      {data && (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
              {data.data.map((astronaut, index) => (
                <AnimateIn key={astronaut.id} delay={index * 50}>
                  <AstronautCard astronaut={astronaut} locale={locale} />
                </AnimateIn>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2 mt-8">
              {data.data.map((astronaut, index) => (
                <AnimateIn key={astronaut.id} delay={index * 30}>
                  <AstronautTableRow astronaut={astronaut} locale={locale} />
                </AnimateIn>
              ))}
            </div>
          )}

          {data.data.length === 0 && (
            <div className="py-12 text-center text-star-dim">{t('empty')}</div>
          )}

          <Pagination
            page={page}
            totalPages={data.pagination.totalPages}
            total={data.pagination.total}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
