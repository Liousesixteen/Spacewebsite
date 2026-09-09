'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Satellite } from 'lucide-react';
import { getSpacecraftList } from '@/lib/api/spacecraft';
import { SpacecraftCard } from '@/components/spacecraft/spacecraft-card';
import { SpacecraftTableRow } from '@/components/spacecraft/spacecraft-table-row';
import {
  SpacecraftFilters,
  type SpacecraftFilterValues,
} from '@/components/spacecraft/spacecraft-filters';
import { ViewToggle, Pagination, AnimateIn, Breadcrumbs, PageHeader } from '@/components/ui';
import type { ViewMode } from '@/components/ui/view-toggle';

export default function SpacecraftPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = useTranslations('spacecraft');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<SpacecraftFilterValues>({});
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const { data, isLoading, error } = useQuery({
    queryKey: ['spacecraft', page, filters],
    queryFn: () => getSpacecraftList({ page, limit: 12, ...filters }),
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
        icon={Satellite}
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

      <SpacecraftFilters
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
              {data.data.map((spacecraft, index) => (
                <AnimateIn key={spacecraft.id} delay={index * 50}>
                  <SpacecraftCard spacecraft={spacecraft} locale={locale} />
                </AnimateIn>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2 mt-8">
              {data.data.map((spacecraft, index) => (
                <AnimateIn key={spacecraft.id} delay={index * 30}>
                  <SpacecraftTableRow spacecraft={spacecraft} locale={locale} />
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
