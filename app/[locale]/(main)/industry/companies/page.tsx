'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Building2 } from 'lucide-react';
import { getCompanies } from '@/lib/api/industry';
import { CompanyCard } from '@/components/industry/company-card';
import { Button, Breadcrumbs, PageHeader } from '@/components/ui';

interface CompanyFilters {
  country?: string;
  type?: string;
  segmentId?: string;
}

export default function CompaniesPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = useTranslations('industry.companyList');
  const commonT = useTranslations('common');
  const searchParams = useSearchParams();
  const segmentId = searchParams.get('segmentId') || undefined;

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<CompanyFilters>({ segmentId });

  const { data, isLoading, error } = useQuery({
    queryKey: ['companies', page, filters],
    queryFn: () => getCompanies({ page, limit: 12, ...filters }),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs
        className="mb-4"
        items={[
          { label: 'SpaceData', href: `/${locale}` },
          { label: t('industry'), href: `/${locale}/industry` },
          { label: t('title') },
        ]}
      />

      <PageHeader
        icon={Building2}
        title={t('title')}
        description={t('description')}
      />

      {/* Filters */}
      <div className="mb-8 flex flex-wrap gap-3 rounded-lg border border-space-600/50 bg-space-800/60 p-4 backdrop-blur-xl">
        <select
          value={filters.country || ''}
          onChange={(e) => {
            setFilters({ ...filters, country: e.target.value || undefined });
            setPage(1);
          }}
          className="bg-space-700/80 border border-space-500/50 rounded-lg px-3 py-2 text-sm text-star-white focus:outline-none focus:border-cosmic-blue/50"
        >
          <option value="">{t('allCountries')}</option>
          <option value="China">{t('countries.China')}</option>
          <option value="USA">{t('countries.USA')}</option>
          <option value="Russia">{t('countries.Russia')}</option>
          <option value="Europe">{t('countries.Europe')}</option>
          <option value="Japan">{t('countries.Japan')}</option>
          <option value="India">{t('countries.India')}</option>
        </select>

        <select
          value={filters.type || ''}
          onChange={(e) => {
            setFilters({ ...filters, type: e.target.value || undefined });
            setPage(1);
          }}
          className="bg-space-700/80 border border-space-500/50 rounded-lg px-3 py-2 text-sm text-star-white focus:outline-none focus:border-cosmic-blue/50"
        >
          <option value="">{t('allTypes')}</option>
          <option value="STATE_OWNED">{t('types.STATE_OWNED')}</option>
          <option value="PRIVATE">{t('types.PRIVATE')}</option>
          <option value="PUBLIC">{t('types.PUBLIC')}</option>
          <option value="STARTUP">{t('types.STARTUP')}</option>
        </select>

        {filters.segmentId && (
          <span className="px-3 py-2 text-sm text-cosmic-blue bg-cosmic-blue/10 rounded-lg border border-cosmic-blue/20">
            {t('segmentActive')}
          </span>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setFilters({});
            setPage(1);
          }}
        >
          {commonT('reset')}
        </Button>
      </div>

      {isLoading && (
        <div className="py-12 text-center text-star-dim">{commonT('loading')}</div>
      )}

      {error && (
        <div className="py-12 text-center text-red-400">{commonT('error')}</div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.data.map((company) => (
              <CompanyCard key={company.id} company={company} locale={locale} />
            ))}
          </div>

          {data.data.length === 0 && (
            <div className="py-12 text-center text-star-dim">{commonT('noData')}</div>
          )}

          {data.pagination.totalPages > 1 && (
            <div className="flex justify-center gap-3 mt-8">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                {commonT('previous')}
              </Button>
              <span className="px-4 py-2 text-star-dim text-sm">
                {page} / {data.pagination.totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page === data.pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                {commonT('next')}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
