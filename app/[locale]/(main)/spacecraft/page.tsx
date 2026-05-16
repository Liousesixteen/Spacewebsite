'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Satellite } from 'lucide-react';
import { getSpacecraftList } from '@/lib/api/spacecraft';
import { SpacecraftCard } from '@/components/spacecraft/spacecraft-card';
import {
  SpacecraftFilters,
  type SpacecraftFilterValues,
} from '@/components/spacecraft/spacecraft-filters';
import { Button } from '@/components/ui';

export default function SpacecraftPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<SpacecraftFilterValues>({});

  const { data, isLoading, error } = useQuery({
    queryKey: ['spacecraft', page, filters],
    queryFn: () => getSpacecraftList({ page, limit: 12, ...filters }),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Satellite className="w-8 h-8 text-cosmic-blue" />
        <h1 className="text-3xl font-bold text-white">航天器</h1>
      </div>

      <SpacecraftFilters
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
            {data.data.map((spacecraft) => (
              <SpacecraftCard
                key={spacecraft.id}
                spacecraft={spacecraft}
                locale={locale}
              />
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
    </div>
  );
}
