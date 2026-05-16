'use client';

import { Button } from '@/components/ui';

export interface LaunchFilterValues {
  status?: string;
  country?: string;
  year?: string;
}

interface LaunchFiltersProps {
  filters: LaunchFilterValues;
  onFilterChange: (filters: LaunchFilterValues) => void;
}

export function LaunchFilters({ filters, onFilterChange }: LaunchFiltersProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - i);

  return (
    <div className="flex flex-wrap gap-4 p-4 bg-space-800 rounded-xl border border-space-600">
      <select
        value={filters.status || ''}
        onChange={(e) =>
          onFilterChange({ ...filters, status: e.target.value || undefined })
        }
        className="bg-space-700 border border-space-500 rounded-lg px-3 py-2 text-white"
      >
        <option value="">全部状态</option>
        <option value="SUCCESS">成功</option>
        <option value="FAILURE">失败</option>
        <option value="PLANNED">计划中</option>
        <option value="POSTPONED">推迟</option>
      </select>

      <select
        value={filters.country || ''}
        onChange={(e) =>
          onFilterChange({ ...filters, country: e.target.value || undefined })
        }
        className="bg-space-700 border border-space-500 rounded-lg px-3 py-2 text-white"
      >
        <option value="">全部国家</option>
        <option value="USA">美国</option>
        <option value="China">中国</option>
        <option value="Russia">俄罗斯</option>
        <option value="Europe">欧洲</option>
        <option value="Japan">日本</option>
        <option value="India">印度</option>
      </select>

      <select
        value={filters.year || ''}
        onChange={(e) =>
          onFilterChange({ ...filters, year: e.target.value || undefined })
        }
        className="bg-space-700 border border-space-500 rounded-lg px-3 py-2 text-white"
      >
        <option value="">全部年份</option>
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>

      <Button variant="ghost" onClick={() => onFilterChange({})}>
        重置
      </Button>
    </div>
  );
}
