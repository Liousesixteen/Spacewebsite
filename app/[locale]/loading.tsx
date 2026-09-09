'use client';

import { useTranslations } from 'next-intl';

export default function Loading() {
  const t = useTranslations('common');

  return (
    <div className="mx-auto min-h-[72vh] max-w-7xl px-4 py-10">
      <div className="mb-8 h-24 animate-pulse rounded-lg border border-space-600/40 bg-space-800/55" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-lg border border-space-600/35 bg-space-800/45"
          />
        ))}
      </div>
      <span className="sr-only">{t('loading')}</span>
    </div>
  );
}
