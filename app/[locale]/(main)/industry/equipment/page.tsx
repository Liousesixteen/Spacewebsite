'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Wrench, Tag, Factory } from 'lucide-react';
import { getEquipment } from '@/lib/api/industry';
import { Card, CardContent, Badge, Button, Input, Breadcrumbs } from '@/components/ui';

interface EquipmentFilters {
  category?: string;
  manufacturer?: string;
}

export default function EquipmentPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<EquipmentFilters>({});
  const [manufacturerInput, setManufacturerInput] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['equipment', page, filters],
    queryFn: () => getEquipment({ page, limit: 12, ...filters }),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs
        className="mb-4"
        items={[
          { label: '航天数据', href: `/${locale}` },
          { label: '产业链', href: `/${locale}/industry` },
          { label: '设备库' },
        ]}
      />
      <div className="flex items-center gap-3 mb-8">
        <Wrench className="w-8 h-8 text-cosmic-blue" />
        <h1 className="text-3xl font-bold text-white">设备库</h1>
      </div>

      <div className="flex flex-wrap gap-4 p-4 bg-space-800 rounded-xl border border-space-600">
        <select
          value={filters.category || ''}
          onChange={(e) => {
            setFilters({ ...filters, category: e.target.value || undefined });
            setPage(1);
          }}
          className="bg-space-700 border border-space-500 rounded-lg px-3 py-2 text-white"
        >
          <option value="">全部分类</option>
          <option value="发射设备">发射设备</option>
          <option value="测控设备">测控设备</option>
          <option value="测试设备">测试设备</option>
          <option value="生产设备">生产设备</option>
          <option value="地面设备">地面设备</option>
          <option value="光学设备">光学设备</option>
          <option value="通信设备">通信设备</option>
          <option value="动力设备">动力设备</option>
        </select>

        <Input
          type="text"
          placeholder="制造商搜索"
          value={manufacturerInput}
          onChange={(e) => setManufacturerInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setFilters({
                ...filters,
                manufacturer: manufacturerInput.trim() || undefined,
              });
              setPage(1);
            }
          }}
          className="w-48"
        />

        <Button
          variant="outline"
          onClick={() => {
            setFilters({
              ...filters,
              manufacturer: manufacturerInput.trim() || undefined,
            });
            setPage(1);
          }}
        >
          搜索
        </Button>

        <Button
          variant="ghost"
          onClick={() => {
            setFilters({});
            setManufacturerInput('');
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
            {data.data.map((item) => (
              <Link
                key={item.id}
                href={`/${locale}/industry/equipment/${item.id}`}
              >
                <Card variant="glow" className="h-full cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-2 mb-3">
                      <Wrench className="w-5 h-5 text-cosmic-blue mt-1 shrink-0" />
                      <h3 className="text-lg font-semibold text-white line-clamp-2">
                        {item.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <Tag className="w-4 h-4 text-star-dim" />
                      <Badge variant="default">{item.category}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-star-dim mb-3">
                      <Factory className="w-4 h-4" />
                      <span>{item.manufacturer}</span>
                    </div>
                    <p className="text-sm text-star-dim line-clamp-3">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
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
