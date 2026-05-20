'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui';

export interface LaunchFilterValues {
  status?: string;
  country?: string;
  year?: string;
  rocketName?: string;
  launchSite?: string;
}

interface LaunchFiltersProps {
  filters: LaunchFilterValues;
  onFilterChange: (filters: LaunchFilterValues) => void;
}

export function LaunchFilters({ filters, onFilterChange }: LaunchFiltersProps) {
  const [expanded, setExpanded] = useState(false);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - i);

  const launchSites = [
    { value: '', label: '全部发射场' },
    { value: 'Kennedy', label: '肯尼迪航天中心' },
    { value: 'Cape Canaveral', label: '卡纳维拉尔角' },
    { value: 'Vandenberg', label: '范登堡空军基地' },
    { value: 'Jiuquan', label: '酒泉卫星发射中心' },
    { value: 'Wenchang', label: '文昌航天发射场' },
    { value: 'Baikonur', label: '拜科努尔航天发射场' },
    { value: 'Plesetsk', label: '普列谢茨克航天发射场' },
    { value: 'Kourou', label: '库鲁航天中心' },
    { value: 'Tanegashima', label: '种子岛宇宙中心' },
    { value: 'Satish Dhawan', label: '萨蒂什·达万航天中心' },
  ];

  const update = (patch: Partial<LaunchFilterValues>) =>
    onFilterChange({ ...filters, ...patch });

  return (
    <div className="p-4 bg-space-800 rounded-xl border border-space-600">
      {/* Always visible core filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={filters.status || ''}
          onChange={(e) => update({ status: e.target.value || undefined })}
          className="bg-space-700 border border-space-500 rounded-lg px-3 py-2 text-star-white"
        >
          <option value="">全部状态</option>
          <option value="SUCCESS">成功</option>
          <option value="FAILURE">失败</option>
          <option value="PLANNED">计划中</option>
          <option value="POSTPONED">推迟</option>
        </select>

        <select
          value={filters.country || ''}
          onChange={(e) => update({ country: e.target.value || undefined })}
          className="bg-space-700 border border-space-500 rounded-lg px-3 py-2 text-star-white"
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
          onChange={(e) => update({ year: e.target.value || undefined })}
          className="bg-space-700 border border-space-500 rounded-lg px-3 py-2 text-star-white"
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
            value={filters.rocketName || ''}
            onChange={(e) => update({ rocketName: e.target.value || undefined })}
            placeholder="搜索火箭名称..."
            className="bg-space-700 border border-space-500 rounded-lg px-3 py-2 text-star-white placeholder:text-star-dim focus:outline-none focus:border-cosmic-blue min-w-[200px]"
          />

          <select
            value={filters.launchSite || ''}
            onChange={(e) => update({ launchSite: e.target.value || undefined })}
            className="bg-space-700 border border-space-500 rounded-lg px-3 py-2 text-star-white"
          >
            {launchSites.map((site) => (
              <option key={site.value} value={site.value}>
                {site.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
