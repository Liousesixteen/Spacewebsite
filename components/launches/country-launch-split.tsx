'use client';

import { useTranslations } from 'next-intl';
import { LaunchCard } from './launch-card';
import { LaunchTableRow } from './launch-table-row';
import { AnimateIn } from '@/components/ui';
import type { Launch } from '@/lib/api/launches';

export function CountryLaunchSplit({
  launches,
  locale,
  viewMode,
}: {
  launches: Launch[];
  locale: string;
  viewMode: 'grid' | 'table';
}) {
  const t = useTranslations('launches.page');

  return (
    <div className="mt-6">
      {launches.length > 0 && (
        <div className="mb-4 text-xs text-star-dim">
          {t('resultCount', { count: launches.length })}
        </div>
      )}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {launches.map((launch, index) => (
            <AnimateIn key={launch.id} delay={index * 40}>
              <LaunchCard launch={launch} locale={locale} />
            </AnimateIn>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {launches.map((launch, index) => (
            <AnimateIn key={launch.id} delay={index * 25}>
              <LaunchTableRow launch={launch} locale={locale} />
            </AnimateIn>
          ))}
        </div>
      )}

      {launches.length === 0 && (
        <div className="py-12 text-center text-star-dim">{t('empty')}</div>
      )}
    </div>
  );
}
