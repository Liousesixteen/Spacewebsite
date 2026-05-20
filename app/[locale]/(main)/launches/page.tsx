'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Rocket } from 'lucide-react';
import { getLaunches } from '@/lib/api/launches';
import { LaunchCard } from '@/components/launches/launch-card';
import { LaunchTableRow } from '@/components/launches/launch-table-row';
import {
  LaunchFilters,
  type LaunchFilterValues,
} from '@/components/launches/launch-filters';
import { LaunchCalendar } from '@/components/launches/launch-calendar';
import { ViewToggle, Pagination, AnimateIn, Breadcrumbs } from '@/components/ui';
import type { ViewMode } from '@/components/ui/view-toggle';

type PageViewMode = 'list' | 'calendar';

export default function LaunchesPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
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
          { label: '航天数据', href: `/${locale}` },
          { label: '发射数据' },
        ]}
      />
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Rocket className="w-8 h-8 text-cosmic-blue" />
          <h1 className="text-3xl font-bold text-star-white">发射数据</h1>
        </div>

        <div className="flex items-center gap-4">
          {/* View mode toggle between page modes */}
          <div className="flex items-center gap-1 bg-space-800 rounded-lg border border-space-600 p-1">
            <button
              onClick={() => setPageMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                pageMode === 'list'
                  ? 'bg-cosmic-blue/20 text-cosmic-blue'
                  : 'text-star-dim hover:text-star-white'
              }`}
            >
              列表
            </button>
            <button
              onClick={() => setPageMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                pageMode === 'calendar'
                  ? 'bg-cosmic-blue/20 text-cosmic-blue'
                  : 'text-star-dim hover:text-star-white'
              }`}
            >
              日历
            </button>
          </div>

          {pageMode === 'list' && (
            <ViewToggle mode={viewMode} onChange={setViewMode} />
          )}
        </div>
      </div>

      {pageMode === 'calendar' ? (
        <LaunchCalendar locale={locale} />
      ) : (
        <>
          <LaunchFilters
            filters={filters}
            onFilterChange={(next) => {
              setFilters(next);
              setPage(1);
            }}
          />

          {isLoading && (
            <div className="text-center py-12 text-star-dim">加载中...</div>
          )}

          {error && (
            <div className="text-center py-12 text-red-400">加载失败</div>
          )}

          {data && (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
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
                <div className="text-center py-12 text-star-dim">暂无数据</div>
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
