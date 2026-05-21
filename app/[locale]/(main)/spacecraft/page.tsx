'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
          { label: 'Spacecraft' },
        ]}
      />

      <PageHeader
        icon={Satellite}
        title="Spacecraft"
        description="Browse satellites, space stations, probes, and crewed spacecraft from space agencies worldwide."
        actions={
          <ViewToggle mode={viewMode} onChange={setViewMode} />
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
        <div className="text-center py-12 text-star-dim">Loading...</div>
      )}

      {error && (
        <div className="text-center py-12 text-red-400">Failed to load</div>
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
            <div className="text-center py-12 text-star-dim">No data</div>
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
