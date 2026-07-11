'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui';

export interface LaunchFilterValues {
  status?: string;
  country?: string;
  year?: string;
  rocketName?: string;
  launchSite?: string;
  provider?: string;
  missionType?: string;
  orbit?: string;
  launchPad?: string;
  from?: string;
  to?: string;
}

interface LaunchFiltersProps {
  filters: LaunchFilterValues;
  onFilterChange: (filters: LaunchFilterValues) => void;
}

export function LaunchFilters({ filters, onFilterChange }: LaunchFiltersProps) {
  const t = useTranslations('launches.filters');
  const statusT = useTranslations('launches.status');
  const [expanded, setExpanded] = useState(false);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - i);

  const launchSites = [
    { value: '', label: t('allLaunchSites') },
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
          <option value="">{t('allStatus')}</option>
          <option value="SUCCESS">{statusT('SUCCESS')}</option>
          <option value="FAILURE">{statusT('FAILURE')}</option>
          <option value="PLANNED">{statusT('PLANNED')}</option>
          <option value="POSTPONED">{statusT('POSTPONED')}</option>
        </select>

        <select
          value={filters.country || ''}
          onChange={(e) => update({ country: e.target.value || undefined })}
          className="bg-space-700 border border-space-500 rounded-lg px-3 py-2 text-star-white"
        >
          <option value="">{t('allCountries')}</option>
          <option value="USA">{t('countries.USA')}</option>
          <option value="China">{t('countries.China')}</option>
          <option value="Russia">{t('countries.Russia')}</option>
          <option value="Europe">{t('countries.Europe')}</option>
          <option value="Japan">{t('countries.Japan')}</option>
          <option value="India">{t('countries.India')}</option>
        </select>

        <select
          value={filters.year || ''}
          onChange={(e) => update({ year: e.target.value || undefined })}
          className="bg-space-700 border border-space-500 rounded-lg px-3 py-2 text-star-white"
        >
          <option value="">{t('allYears')}</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <Button variant="ghost" onClick={() => onFilterChange({})}>
          {t('reset')}
        </Button>

        <Button variant="ghost" onClick={() => setExpanded(!expanded)}>
          {expanded ? (
            <ChevronUp className="w-4 h-4 mr-1" />
          ) : (
            <ChevronDown className="w-4 h-4 mr-1" />
          )}
          {expanded ? t('less') : t('more')}
        </Button>
      </div>

      {/* Expandable advanced filters */}
      {expanded && (
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-space-600">
          <input
            type="text"
            value={filters.rocketName || ''}
            onChange={(e) => update({ rocketName: e.target.value || undefined })}
            placeholder={t('rocketPlaceholder')}
            className="bg-space-700 border border-space-500 rounded-lg px-3 py-2 text-star-white placeholder:text-star-dim focus:outline-none focus:border-cosmic-blue min-w-[200px]"
          />

          <input
            type="text"
            value={filters.provider || ''}
            onChange={(e) => update({ provider: e.target.value || undefined })}
            placeholder={t('providerPlaceholder')}
            className="bg-space-700 border border-space-500 rounded-lg px-3 py-2 text-star-white placeholder:text-star-dim focus:outline-none focus:border-cosmic-blue min-w-[200px]"
          />

          <input
            type="text"
            value={filters.missionType || ''}
            onChange={(e) => update({ missionType: e.target.value || undefined })}
            placeholder={t('allMissionTypes')}
            className="bg-space-700 border border-space-500 rounded-lg px-3 py-2 text-star-white placeholder:text-star-dim focus:outline-none focus:border-cosmic-blue min-w-[190px]"
          />

          <input
            type="text"
            value={filters.orbit || ''}
            onChange={(e) => update({ orbit: e.target.value || undefined })}
            placeholder={t('allOrbits')}
            className="bg-space-700 border border-space-500 rounded-lg px-3 py-2 text-star-white placeholder:text-star-dim focus:outline-none focus:border-cosmic-blue min-w-[160px]"
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

          <input
            type="text"
            value={filters.launchPad || ''}
            onChange={(e) => update({ launchPad: e.target.value || undefined })}
            placeholder={t('launchPadPlaceholder')}
            className="bg-space-700 border border-space-500 rounded-lg px-3 py-2 text-star-white placeholder:text-star-dim focus:outline-none focus:border-cosmic-blue min-w-[180px]"
          />

          <label className="flex items-center gap-2 text-sm text-star-dim">
            <span>{t('fromDate')}</span>
            <input
              type="date"
              value={filters.from || ''}
              onChange={(e) => update({ from: e.target.value || undefined })}
              className="bg-space-700 border border-space-500 rounded-lg px-3 py-2 text-star-white focus:outline-none focus:border-cosmic-blue"
            />
          </label>

          <label className="flex items-center gap-2 text-sm text-star-dim">
            <span>{t('toDate')}</span>
            <input
              type="date"
              value={filters.to || ''}
              onChange={(e) => update({ to: e.target.value || undefined })}
              className="bg-space-700 border border-space-500 rounded-lg px-3 py-2 text-star-white focus:outline-none focus:border-cosmic-blue"
            />
          </label>
        </div>
      )}
    </div>
  );
}
