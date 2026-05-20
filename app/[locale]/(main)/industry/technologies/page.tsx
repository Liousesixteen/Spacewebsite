'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Cpu } from 'lucide-react';
import { getTechnologies } from '@/lib/api/industry';
import { TechnologyCard } from '@/components/industry/technology-card';
import { Button, Breadcrumbs } from '@/components/ui';

interface TechnologyFilters {
  category?: string;
  maturity?: string;
}

export default function TechnologiesPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<TechnologyFilters>({});

  const { data, isLoading, error } = useQuery({
    queryKey: ['technologies', page, filters],
    queryFn: () => getTechnologies({ page, limit: 12, ...filters }),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs
        className="mb-4"
        items={[
          { label: '航天数据', href: `/${locale}` },
          { label: '产业链', href: `/${locale}/industry` },
          { label: '技术库' },
        ]}
      />
      <div className="flex items-center gap-3 mb-8">
        <Cpu className="w-8 h-8 text-cosmic-blue" />
        <h1 className="text-3xl font-bold text-star-white">技术库</h1>
      </div>

      <div className="flex flex-wrap gap-4 p-4 bg-space-800 rounded-xl border border-space-600">
        <select
          value={filters.category || ''}
          onChange={(e) => {
            setFilters({ ...filters, category: e.target.value || undefined });
            setPage(1);
          }}
          className="bg-space-700 border border-space-500 rounded-lg px-3 py-2 text-star-white"
        >
          <option value="">全部分类</option>
          <option value="推进技术">推进技术</option>
          <option value="制导导航">制导导航</option>
          <option value="结构材料">结构材料</option>
          <option value="电子系统">电子系统</option>
          <option value="通信技术">通信技术</option>
          <option value="遥感技术">遥感技术</option>
          <option value="生命保障">生命保障</option>
          <option value="再入返回">再入返回</option>
        </select>

        <select
          value={filters.maturity || ''}
          onChange={(e) => {
            setFilters({ ...filters, maturity: e.target.value || undefined });
            setPage(1);
          }}
          className="bg-space-700 border border-space-500 rounded-lg px-3 py-2 text-star-white"
        >
          <option value="">全部成熟度</option>
          <option value="RESEARCH">研究阶段</option>
          <option value="EXPERIMENTAL">试验阶段</option>
          <option value="APPLIED">应用阶段</option>
          <option value="MATURE">成熟阶段</option>
        </select>

        <Button
          variant="ghost"
          onClick={() => {
            setFilters({});
            setPage(1);
          }}
        >
          重置
        </Button>
      </div>

      {isLoading && (
        <div className="text-center py-12 text-star-dim">加载中...</div>
      )}

      {error && (
        <div className="text-center py-12 text-red-400">加载失败</div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {data.data.map((technology) => (
              <TechnologyCard
                key={technology.id}
                technology={technology}
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
