'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('astronauts');
  const [expanded, setExpanded] = useState(false);

  const update = (patch: Partial<AstronautFilterValues>) =>
    onFilterChange({ ...filters, ...patch });

  return (
    <div className="rounded-lg border border-space-600 bg-space-800 p-4">
      {/* Always visible core filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={filters.nationality || ''}
          onChange={(e) => update({ nationality: e.target.value || undefined })}
          className="bg-space-700 border border-space-500 rounded-lg px-3 py-2 text-star-white"
        >
          <option value="">{t('filters.allCountries')}</option>
          <option value="USA">{t('countries.USA')}</option>
          <option value="China">{t('countries.China')}</option>
          <option value="Russia">{t('countries.Russia')}</option>
          <option value="Japan">{t('countries.Japan')}</option>
          <option value="India">{t('countries.India')}</option>
          <option value="Germany">{t('countries.Germany')}</option>
          <option value="France">{t('countries.France')}</option>
          <option value="UK">{t('countries.UK')}</option>
        </select>

        <select
          value={filters.agency || ''}
          onChange={(e) => update({ agency: e.target.value || undefined })}
          className="bg-space-700 border border-space-500 rounded-lg px-3 py-2 text-star-white"
        >
          <option value="">{t('filters.allAgencies')}</option>
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
          <option value="">{t('filters.allStatuses')}</option>
          <option value="ACTIVE">{t('statuses.ACTIVE')}</option>
          <option value="RETIRED">{t('statuses.RETIRED')}</option>
          <option value="DECEASED">{t('statuses.DECEASED')}</option>
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

          <div className="flex items-center gap-2">
            <span className="text-sm text-star-dim">{t('filters.flightCount')}</span>
            <input
              type="number"
              min={0}
              value={filters.flightsMin || ''}
              onChange={(e) => update({ flightsMin: e.target.value || undefined })}
              placeholder={t('filters.minimum')}
              className="w-20 px-3 py-2 rounded-lg bg-space-700 border border-space-500 text-star-white placeholder:text-star-dim focus:outline-none focus:border-cosmic-blue text-sm"
            />
            <span className="text-star-dim">-</span>
            <input
              type="number"
              min={0}
              value={filters.flightsMax || ''}
              onChange={(e) => update({ flightsMax: e.target.value || undefined })}
              placeholder={t('filters.maximum')}
              className="w-20 px-3 py-2 rounded-lg bg-space-700 border border-space-500 text-star-white placeholder:text-star-dim focus:outline-none focus:border-cosmic-blue text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}
