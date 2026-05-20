'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui';

export interface AstronautFilterValues {
  nationality?: string;
  agency?: string;
  status?: string;
  name?: string;
  flightsMin?: string;
  flightsMax?: string;
}

interface AstronautFiltersProps {
  filters: AstronautFilterValues;
  onFilterChange: (filters: AstronautFilterValues) => void;
}

export function AstronautFilters({
  filters,
  onFilterChange,
}: AstronautFiltersProps) {
  const [expanded, setExpanded] = useState(false);

  const update = (patch: Partial<AstronautFilterValues>) =>
    onFilterChange({ ...filters, ...patch });

  return (
    <div className="p-4 bg-space-800 rounded-xl border border-space-600">
      {/* Always visible core filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={filters.nationality || ''}
          onChange={(e) => update({ nationality: e.target.value || undefined })}
          className="bg-space-700 border border-space-500 rounded-lg px-3 py-2 text-star-white"
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
          onChange={(e) => update({ agency: e.target.value || undefined })}
          className="bg-space-700 border border-space-500 rounded-lg px-3 py-2 text-star-white"
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
          onChange={(e) => update({ status: e.target.value || undefined })}
          className="bg-space-700 border border-space-500 rounded-lg px-3 py-2 text-star-white"
        >
          <option value="">全部状态</option>
          <option value="ACTIVE">现役</option>
          <option value="RETIRED">已退役</option>
          <option value="DECEASED">已故</option>
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
            placeholder="搜索宇航员姓名..."
            className="bg-space-700 border border-space-500 rounded-lg px-3 py-2 text-star-white placeholder:text-star-dim focus:outline-none focus:border-cosmic-blue min-w-[200px]"
          />

          <div className="flex items-center gap-2">
            <span className="text-sm text-star-dim">飞行次数:</span>
            <input
              type="number"
              min={0}
              value={filters.flightsMin || ''}
              onChange={(e) => update({ flightsMin: e.target.value || undefined })}
              placeholder="最小"
              className="w-20 px-3 py-2 rounded-lg bg-space-700 border border-space-500 text-star-white placeholder:text-star-dim focus:outline-none focus:border-cosmic-blue text-sm"
            />
            <span className="text-star-dim">-</span>
            <input
              type="number"
              min={0}
              value={filters.flightsMax || ''}
              onChange={(e) => update({ flightsMax: e.target.value || undefined })}
              placeholder="最大"
              className="w-20 px-3 py-2 rounded-lg bg-space-700 border border-space-500 text-star-white placeholder:text-star-dim focus:outline-none focus:border-cosmic-blue text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}
