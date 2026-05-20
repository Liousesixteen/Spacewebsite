'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { Building2 } from 'lucide-react';
import { getCompanies } from '@/lib/api/industry';
import { CompanyCard } from '@/components/industry/company-card';
import { Button, Breadcrumbs } from '@/components/ui';

interface CompanyFilters {
  country?: string;
  type?: string;
  segmentId?: string;
}

export default function CompaniesPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const searchParams = useSearchParams();
  const segmentId = searchParams.get('segmentId') || undefined;

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<CompanyFilters>({ segmentId });

  const { data, isLoading, error } = useQuery({
    queryKey: ['companies', page, filters],
    queryFn: () => getCompanies({ page, limit: 12, ...filters }),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs
        className="mb-4"
        items={[
          { label: '航天数据', href: `/${locale}` },
          { label: '产业链', href: `/${locale}/industry` },
          { label: '企业库' },
        ]}
      />
      <div className="flex items-center gap-3 mb-8">
        <Building2 className="w-8 h-8 text-cosmic-blue" />
        <h1 className="text-3xl font-bold text-star-white">企业库</h1>
      </div>

      <div className="flex flex-wrap gap-4 p-4 bg-space-800 rounded-xl border border-space-600">
        <select
          value={filters.country || ''}
          onChange={(e) => {
            setFilters({ ...filters, country: e.target.value || undefined });
            setPage(1);
          }}
          className="bg-space-700 border border-space-500 rounded-lg px-3 py-2 text-star-white"
        >
          <option value="">全部国家</option>
          <option value="China">中国</option>
          <option value="USA">美国</option>
          <option value="Russia">俄罗斯</option>
          <option value="Europe">欧洲</option>
          <option value="Japan">日本</option>
          <option value="India">印度</option>
        </select>

        <select
          value={filters.type || ''}
          onChange={(e) => {
            setFilters({ ...filters, type: e.target.value || undefined });
            setPage(1);
          }}
          className="bg-space-700 border border-space-500 rounded-lg px-3 py-2 text-star-white"
        >
          <option value="">全部类型</option>
          <option value="STATE_OWNED">国企</option>
          <option value="PRIVATE">民营</option>
          <option value="PUBLIC">上市</option>
          <option value="STARTUP">初创</option>
        </select>

        {filters.segmentId && (
          <span className="px-3 py-2 text-sm text-cosmic-blue bg-cosmic-blue/10 rounded-lg">
            产业环节筛选已启用
          </span>
        )}

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
            {data.data.map((company) => (
              <CompanyCard key={company.id} company={company} locale={locale} />
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
