'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ChevronDown, ChevronUp, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui';
import { displaySiteName } from '@/lib/display-names';

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
  const locale = useLocale();
  const [expanded, setExpanded] = useState(false);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - i);

  const launchSites = [
    { value: '', name: '' },
    { value: 'Kennedy', name: 'Kennedy Space Center' },
    { value: 'Cape Canaveral', name: 'Cape Canaveral' },
    { value: 'Vandenberg', name: 'Vandenberg SFB' },
    { value: 'Jiuquan', name: 'Jiuquan Satellite Launch Center' },
    { value: 'Wenchang', name: 'Wenchang Space Launch Site' },
    { value: 'Baikonur', name: 'Baikonur Cosmodrome' },
    { value: 'Plesetsk', name: 'Plesetsk Cosmodrome' },
    { value: 'Kourou', name: 'Guiana Space Centre' },
    { value: 'Tanegashima', name: 'Tanegashima Space Center' },
    { value: 'Satish Dhawan', name: 'Satish Dhawan Space Centre' },
  ];
  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const controlClass =
    'h-10 min-w-0 rounded-md border border-space-500/80 bg-space-700/75 px-3 text-sm text-star-white outline-none transition-colors focus:border-cosmic-blue';

  const update = (patch: Partial<LaunchFilterValues>) =>
    onFilterChange({ ...filters, ...patch });

  return (
    <div className="rounded-lg border border-space-600/60 bg-space-800/70 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-star-white">
          <SlidersHorizontal className="h-4 w-4 text-cosmic-cyan" />
          {t('title')}
          {activeFilterCount > 0 && (
            <span className="rounded bg-cosmic-blue/15 px-2 py-0.5 font-mono text-xs text-cosmic-blue">
              {activeFilterCount}
            </span>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,.8fr)_auto_auto]">
        <select
          aria-label={t('allStatus')}
          value={filters.status || ''}
          onChange={(e) => update({ status: e.target.value || undefined })}
          className={controlClass}
        >
          <option value="">{t('allStatus')}</option>
          <option value="SUCCESS">{statusT('SUCCESS')}</option>
          <option value="FAILURE">{statusT('FAILURE')}</option>
          <option value="PLANNED">{statusT('PLANNED')}</option>
          <option value="POSTPONED">{statusT('POSTPONED')}</option>
        </select>

        <select
          aria-label={t('allCountries')}
          value={filters.country || ''}
          onChange={(e) => update({ country: e.target.value || undefined })}
          className={controlClass}
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
          aria-label={t('allYears')}
          value={filters.year || ''}
          onChange={(e) => update({ year: e.target.value || undefined })}
          className={controlClass}
        >
          <option value="">{t('allYears')}</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <Button
          variant="ghost"
          onClick={() => onFilterChange({})}
          disabled={activeFilterCount === 0}
          className="h-10"
        >
          <RotateCcw className="mr-1.5 h-4 w-4" />
          {t('reset')}
        </Button>

        <Button
          variant="ghost"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          className="h-10"
        >
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
        <div className="mt-4 grid grid-cols-1 gap-3 border-t border-space-600/60 pt-4 sm:grid-cols-2 lg:grid-cols-4">
          <input
            type="text"
            value={filters.rocketName || ''}
            onChange={(e) => update({ rocketName: e.target.value || undefined })}
            placeholder={t('rocketPlaceholder')}
            className={controlClass}
          />

          <input
            type="text"
            value={filters.provider || ''}
            onChange={(e) => update({ provider: e.target.value || undefined })}
            placeholder={t('providerPlaceholder')}
            className={controlClass}
          />

          <input
            type="text"
            value={filters.missionType || ''}
            onChange={(e) => update({ missionType: e.target.value || undefined })}
            placeholder={t('allMissionTypes')}
            className={controlClass}
          />

          <input
            type="text"
            value={filters.orbit || ''}
            onChange={(e) => update({ orbit: e.target.value || undefined })}
            placeholder={t('allOrbits')}
            className={controlClass}
          />

          <select
            value={filters.launchSite || ''}
            onChange={(e) => update({ launchSite: e.target.value || undefined })}
            className={controlClass}
          >
            {launchSites.map((site) => (
              <option key={site.value} value={site.value}>
                {site.value ? displaySiteName(site.name, locale) : t('allLaunchSites')}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={filters.launchPad || ''}
            onChange={(e) => update({ launchPad: e.target.value || undefined })}
            placeholder={t('launchPadPlaceholder')}
            className={controlClass}
          />

          <label className="grid gap-1.5 text-xs text-star-dim">
            <span>{t('fromDate')}</span>
            <input
              type="date"
              value={filters.from || ''}
              onChange={(e) => update({ from: e.target.value || undefined })}
              className={controlClass}
            />
          </label>

          <label className="grid gap-1.5 text-xs text-star-dim">
            <span>{t('toDate')}</span>
            <input
              type="date"
              value={filters.to || ''}
              onChange={(e) => update({ to: e.target.value || undefined })}
              className={controlClass}
            />
          </label>
        </div>
      )}
    </div>
  );
}
