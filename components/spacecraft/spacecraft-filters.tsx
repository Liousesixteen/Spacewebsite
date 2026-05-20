'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui';

export interface SpacecraftFilterValues {
  type?: string;
  status?: string;
  operator?: string;
  orbitType?: string;
  name?: string;
}

interface SpacecraftFiltersProps {
  filters: SpacecraftFilterValues;
  onFilterChange: (filters: SpacecraftFilterValues) => void;
}

export function SpacecraftFilters({
  filters,
  onFilterChange,
}: SpacecraftFiltersProps) {
  const [expanded, setExpanded] = useState(false);

  const update = (patch: Partial<SpacecraftFilterValues>) =>
    onFilterChange({ ...filters, ...patch });

  return (
    <div className="p-4 bg-space-800 rounded-xl border border-space-600">
      {/* Always visible core filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={filters.type || ''}
          onChange={(e) => update({ type: e.target.value || undefined })}
          className="bg-space-700 border border-space-500 rounded-lg px-3 py-2 text-star-white"
        >
          <option value="">全部类型</option>
          <option value="SPACE_STATION">空间站</option>
          <option value="SATELLITE">卫星</option>
          <option value="PROBE">探测器</option>
          <option value="CREWED_SPACECRAFT">载人飞船</option>
          <option value="CARGO_SPACECRAFT">货运飞船</option>
        </select>

        <select
          value={filters.status || ''}
          onChange={(e) => update({ status: e.target.value || undefined })}
          className="bg-space-700 border border-space-500 rounded-lg px-3 py-2 text-star-white"
        >
          <option value="">全部状态</option>
          <option value="OPERATIONAL">运行中</option>
          <option value="RETIRED">已退役</option>
          <option value="LOST">已失联</option>
        </select>

        <Button variant="ghost" onClick={() => onFilterChange({})}>
          重置
        </Button>

        <Button variant="ghost" onClick={() => setExpanded(!expanded)}>
          {expanded ? (
            <ChevronUp className="w-4 h-4 mr-1" />
          ) : (
            <ChevronDown className="w-4 h-4 mr-1" />
          )}
          更多筛选
        </Button>
      </div>

      {/* Expandable advanced filters */}
      {expanded && (
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-space-600">
          <input
            type="text"
            value={filters.name || ''}
            onChange={(e) => update({ name: e.target.value || undefined })}
            placeholder="搜索航天器名称..."
            className="bg-space-700 border border-space-500 rounded-lg px-3 py-2 text-star-white placeholder:text-star-dim focus:outline-none focus:border-cosmic-blue min-w-[200px]"
          />

          <input
            type="text"
            value={filters.operator || ''}
            onChange={(e) => update({ operator: e.target.value || undefined })}
            placeholder="搜索运营机构..."
            className="bg-space-700 border border-space-500 rounded-lg px-3 py-2 text-star-white placeholder:text-star-dim focus:outline-none focus:border-cosmic-blue min-w-[200px]"
          />

          <select
            value={filters.orbitType || ''}
            onChange={(e) => update({ orbitType: e.target.value || undefined })}
            className="bg-space-700 border border-space-500 rounded-lg px-3 py-2 text-star-white"
          >
            <option value="">全部轨道</option>
            <option value="LEO">LEO - 低地球轨道</option>
            <option value="MEO">MEO - 中地球轨道</option>
            <option value="GEO">GEO - 地球同步轨道</option>
            <option value="HEO">HEO - 高椭圆轨道</option>
            <option value="SSO">SSO - 太阳同步轨道</option>
            <option value="Unknown">未知</option>
          </select>
        </div>
      )}
    </div>
  );
}
