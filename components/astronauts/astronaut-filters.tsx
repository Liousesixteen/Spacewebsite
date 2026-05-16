'use client';

import { Button } from '@/components/ui';

export interface AstronautFilterValues {
  nationality?: string;
  agency?: string;
  status?: string;
}

interface AstronautFiltersProps {
  filters: AstronautFilterValues;
  onFilterChange: (filters: AstronautFilterValues) => void;
}

export function AstronautFilters({
  filters,
  onFilterChange,
}: AstronautFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4 p-4 bg-space-800 rounded-xl border border-space-600">
      <select
        value={filters.nationality || ''}
        onChange={(e) =>
          onFilterChange({
            ...filters,
            nationality: e.target.value || undefined,
          })
        }
        className="bg-space-700 border border-space-500 rounded-lg px-3 py-2 text-white"
      >
        <option value="">全部国家</option>
        <option value="USA">美国</option>
        <option value="China">中国</option>
        <option value="Russia">俄罗斯</option>
        <option value="Japan">日本</option>
        <option value="India">印度</option>
        <option value="Germany">德国</option>
        <option value="France">法国</option>
        <option value="UK">英国</option>
      </select>

      <select
        value={filters.agency || ''}
        onChange={(e) =>
          onFilterChange({ ...filters, agency: e.target.value || undefined })
        }
        className="bg-space-700 border border-space-500 rounded-lg px-3 py-2 text-white"
      >
        <option value="">全部机构</option>
        <option value="NASA">NASA</option>
        <option value="CNSA">CNSA</option>
        <option value="Roscosmos">Roscosmos</option>
        <option value="ESA">ESA</option>
        <option value="JAXA">JAXA</option>
        <option value="ISRO">ISRO</option>
      </select>

      <select
        value={filters.status || ''}
        onChange={(e) =>
          onFilterChange({ ...filters, status: e.target.value || undefined })
        }
        className="bg-space-700 border border-space-500 rounded-lg px-3 py-2 text-white"
      >
        <option value="">全部状态</option>
        <option value="ACTIVE">现役</option>
        <option value="RETIRED">已退役</option>
        <option value="DECEASED">已故</option>
      </select>

      <Button variant="ghost" onClick={() => onFilterChange({})}>
        重置
      </Button>
    </div>
  );
}
