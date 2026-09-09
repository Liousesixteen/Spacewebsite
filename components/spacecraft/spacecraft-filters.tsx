'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('spacecraft');
  const [expanded, setExpanded] = useState(false);

  const update = (patch: Partial<SpacecraftFilterValues>) =>
    onFilterChange({ ...filters, ...patch });

  return (
    <div className="rounded-lg border border-space-600 bg-space-800 p-4">
      {/* Always visible core filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={filters.type || ''}
          onChange={(e) => update({ type: e.target.value || undefined })}
          className="bg-space-700 border border-space-500 rounded-lg px-3 py-2 text-star-white"
        >
          <option value="">{t('filters.allTypes')}</option>
          <option value="SPACE_STATION">{t('types.SPACE_STATION')}</option>
          <option value="SATELLITE">{t('types.SATELLITE')}</option>
          <option value="PROBE">{t('types.PROBE')}</option>
          <option value="CREWED_SPACECRAFT">{t('types.CREWED_SPACECRAFT')}</option>
          <option value="CARGO_SPACECRAFT">{t('types.CARGO_SPACECRAFT')}</option>
        </select>

        <select
          value={filters.status || ''}
          onChange={(e) => update({ status: e.target.value || undefined })}
          className="bg-space-700 border border-space-500 rounded-lg px-3 py-2 text-star-white"
        >
          <option value="">{t('filters.allStatuses')}</option>
          <option value="OPERATIONAL">{t('statuses.OPERATIONAL')}</option>
          <option value="RETIRED">{t('statuses.RETIRED')}</option>
          <option value="LOST">{t('statuses.LOST')}</option>
        </select>

        <Button variant="ghost" onClick={() => onFilterChange({})}>
          {t('filters.reset')}
        </Button>

        <Button variant="ghost" onClick={() => setExpanded(!expanded)}>
          {expanded ? (
            <ChevronUp className="w-4 h-4 mr-1" />
          ) : (
            <ChevronDown className="w-4 h-4 mr-1" />
          )}
          {expanded ? t('filters.less') : t('filters.more')}
        </Button>
      </div>

      {/* Expandable advanced filters */}
      {expanded && (
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-space-600">
          <input
            type="text"
            value={filters.name || ''}
            onChange={(e) => update({ name: e.target.value || undefined })}
            placeholder={t('filters.namePlaceholder')}
            className="bg-space-700 border border-space-500 rounded-lg px-3 py-2 text-star-white placeholder:text-star-dim focus:outline-none focus:border-cosmic-blue min-w-[200px]"
          />

          <input
            type="text"
            value={filters.operator || ''}
            onChange={(e) => update({ operator: e.target.value || undefined })}
            placeholder={t('filters.operatorPlaceholder')}
            className="bg-space-700 border border-space-500 rounded-lg px-3 py-2 text-star-white placeholder:text-star-dim focus:outline-none focus:border-cosmic-blue min-w-[200px]"
          />

          <select
            value={filters.orbitType || ''}
            onChange={(e) => update({ orbitType: e.target.value || undefined })}
            className="bg-space-700 border border-space-500 rounded-lg px-3 py-2 text-star-white"
          >
            <option value="">{t('filters.allOrbits')}</option>
            <option value="LEO">{t('orbits.LEO')}</option>
            <option value="MEO">{t('orbits.MEO')}</option>
            <option value="GEO">{t('orbits.GEO')}</option>
            <option value="HEO">{t('orbits.HEO')}</option>
            <option value="SSO">{t('orbits.SSO')}</option>
            <option value="Unknown">{t('orbits.Unknown')}</option>
          </select>
        </div>
      )}
    </div>
  );
}
