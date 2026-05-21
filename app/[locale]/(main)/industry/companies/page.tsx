'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
          { label: 'Industry', href: `/${locale}/industry` },
          { label: 'Companies' },
        ]}
      />

      <PageHeader
        icon={Building2}
        title="Companies"
        description="Aerospace companies across the full industry supply chain."
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 p-4 mb-8 bg-space-800/60 backdrop-blur-xl rounded-xl border border-space-600/50">
        <select
          value={filters.country || ''}
          onChange={(e) => {
            setFilters({ ...filters, country: e.target.value || undefined });
            setPage(1);
          }}
          className="bg-space-700/80 border border-space-500/50 rounded-lg px-3 py-2 text-sm text-star-white focus:outline-none focus:border-cosmic-blue/50"
        >
          <option value="">All Countries</option>
          <option value="China">China</option>
          <option value="USA">USA</option>
          <option value="Russia">Russia</option>
          <option value="Europe">Europe</option>
          <option value="Japan">Japan</option>
          <option value="India">India</option>
        </select>

        <select
          value={filters.type || ''}
          onChange={(e) => {
            setFilters({ ...filters, type: e.target.value || undefined });
            setPage(1);
          }}
          className="bg-space-700/80 border border-space-500/50 rounded-lg px-3 py-2 text-sm text-star-white focus:outline-none focus:border-cosmic-blue/50"
        >
          <option value="">All Types</option>
          <option value="STATE_OWNED">State-Owned</option>
          <option value="PRIVATE">Private</option>
          <option value="PUBLIC">Public</option>
          <option value="STARTUP">Startup</option>
        </select>

        {filters.segmentId && (
          <span className="px-3 py-2 text-sm text-cosmic-blue bg-cosmic-blue/10 rounded-lg border border-cosmic-blue/20">
            Segment filter active
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
          Reset
        </Button>
      </div>

      {isLoading && (
        <div className="text-center py-12 text-star-dim">Loading...</div>
      )}

      {error && (
        <div className="text-center py-12 text-red-400">Failed to load</div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.data.map((company) => (
              <CompanyCard key={company.id} company={company} locale={locale} />
            ))}
          </div>

          {data.data.length === 0 && (
            <div className="text-center py-12 text-star-dim">No data</div>
          )}

          {data.pagination.totalPages > 1 && (
            <div className="flex justify-center gap-3 mt-8">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="px-4 py-2 text-star-dim text-sm">
                {page} / {data.pagination.totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page === data.pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
