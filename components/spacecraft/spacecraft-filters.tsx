'use client';

import { Button } from '@/components/ui';

export interface SpacecraftFilterValues {
  type?: string;
  status?: string;
  operator?: string;
}

interface SpacecraftFiltersProps {
  filters: SpacecraftFilterValues;
  onFilterChange: (filters: SpacecraftFilterValues) => void;
}

export function SpacecraftFilters({
  filters,
  onFilterChange,
}: SpacecraftFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4 p-4 bg-space-800 rounded-xl border border-space-600">
      <select
        value={filters.type || ''}
        onChange={(e) =>
          onFilterChange({ ...filters, type: e.target.value || undefined })
        }
        className="bg-space-700 border border-space-500 rounded-lg px-3 py-2 text-white"
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
        onChange={(e) =>
          onFilterChange({ ...filters, status: e.target.value || undefined })
        }
        className="bg-space-700 border border-space-500 rounded-lg px-3 py-2 text-white"
      >
        <option value="">全部状态</option>
        <option value="OPERATIONAL">运行中</option>
        <option value="RETIRED">已退役</option>
        <option value="LOST">已失联</option>
      </select>

      <Button variant="ghost" onClick={() => onFilterChange({})}>
        重置
      </Button>
    </div>
  );
}
