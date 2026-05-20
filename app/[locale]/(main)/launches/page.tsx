'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Rocket, List, Calendar as CalendarIcon } from 'lucide-react';
import { getLaunches } from '@/lib/api/launches';
import { LaunchCard } from '@/components/launches/launch-card';
import {
  LaunchFilters,
  type LaunchFilterValues,
} from '@/components/launches/launch-filters';
import { LaunchCalendar } from '@/components/launches/launch-calendar';
import { Button, Breadcrumbs } from '@/components/ui';
import { cn } from '@/lib/utils';

type ViewMode = '列表' | '日历';

export default function LaunchesPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<LaunchFilterValues>({});
  const [viewMode, setViewMode] = useState<ViewMode>('列表');

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
          <h1 className="text-3xl font-bold text-white">发射数据</h1>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-space-800 rounded-lg border border-space-600 p-1">
          <button
            onClick={() => setViewMode('列表')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              viewMode === '列表'
                ? 'bg-cosmic-blue/20 text-cosmic-blue'
                : 'text-star-dim hover:text-white'
            )}
          >
            <List className="w-4 h-4" />
            列表
          </button>
          <button
            onClick={() => setViewMode('日历')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              viewMode === '日历'
                ? 'bg-cosmic-blue/20 text-cosmic-blue'
                : 'text-star-dim hover:text-white'
            )}
          >
            <CalendarIcon className="w-4 h-4" />
            日历
          </button>
        </div>
      </div>

      {viewMode === '日历' ? (
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {data.data.map((launch) => (
                  <LaunchCard key={launch.id} launch={launch} locale={locale} />
                ))}
              </div>

              {data.data.length === 0 && (
                <div className="text-center py-12 text-star-dim">暂无数据</div>
              )}

              {data.pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    上一页
                  </Button>
                  <span className="px-4 py-2 text-star-dim">
                    {page} / {data.pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={page === data.pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    下一页
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
