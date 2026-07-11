import {
  Building2,
  CalendarClock,
  Flag,
  Rocket,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/db';
import {
  Badge,
  Breadcrumbs,
  Card,
  CardContent,
  PageHeader,
  StatusBadge,
} from '@/components/ui';

type AgencyRow = {
  id: string;
  name: string;
  abbrev: string | null;
  type: string | null;
  country: string;
  source: string | null;
  _count: { launches: number };
  launches: Array<{
    id: string;
    name: string;
    date: Date;
    status: string;
    rocket: { country: string } | null;
    launchSite: { country: string } | null;
  }>;
};

async function loadAgencies(): Promise<AgencyRow[]> {
  return prisma.agency.findMany({
    where: { launches: { some: {} } },
    select: {
      id: true,
      name: true,
      abbrev: true,
      type: true,
      country: true,
      source: true,
      _count: { select: { launches: true } },
      launches: {
        orderBy: { date: 'desc' },
        take: 1,
        select: {
          id: true,
          name: true,
          date: true,
          status: true,
          rocket: { select: { country: true } },
          launchSite: { select: { country: true } },
        },
      },
    },
    take: 150,
  });
}

export default async function AgenciesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'agencies' });

  let agencies: AgencyRow[] = [];
  let dbUnavailable = false;

  try {
    agencies = await loadAgencies();
  } catch (error) {
    console.error('[agencies] Failed to load agencies:', error);
    dbUnavailable = true;
  }

  const sortedAgencies = [...agencies].sort(
    (a, b) => b._count.launches - a._count.launches || a.name.localeCompare(b.name)
  );
  const countries = new Set(
    sortedAgencies
      .map((agency) => getAgencyCountry(agency, t('unknown')))
      .filter((country) => country !== t('unknown'))
  );
  const launchTotal = sortedAgencies.reduce(
    (total, agency) => total + agency._count.launches,
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs
        className="mb-4"
        items={[
          { label: 'SpaceData', href: `/${locale}` },
          { label: t('breadcrumb') },
        ]}
      />

      <PageHeader
        icon={Building2}
        title={t('title')}
        description={dbUnavailable ? t('dbUnavailable') : t('description')}
      />

      {dbUnavailable ? (
        <div className="py-20 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10">
            <Building2 className="h-8 w-8 text-amber-400/70" />
          </div>
          <h2 className="mb-2 text-lg font-semibold text-star-white">
            {t('dbUnavailable')}
          </h2>
          <p className="text-sm text-star-dim">{t('dbUnavailableHint')}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-8">
            <SummaryCard icon={Building2} label={t('coveredAgencies')} value={sortedAgencies.length} />
            <SummaryCard icon={Flag} label={t('coveredCountries')} value={countries.size} />
            <SummaryCard icon={Rocket} label={t('linkedLaunches')} value={launchTotal} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {sortedAgencies.map((agency) => {
              const latestLaunch = agency.launches[0];
              const country = getAgencyCountry(agency, t('unknown'));

              return (
                <Link
                  key={agency.id}
                  href={`/${locale}/agencies/${agency.id}`}
                  className="group block"
                >
                  <Card variant="glow" className="h-full">
                    <CardContent className="p-5">
                      <div className="mb-3 flex items-center gap-3">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-cosmic-blue/25 bg-cosmic-blue/10 text-sm font-bold text-cosmic-blue">
                          {agency.abbrev?.slice(0, 3) || agency.name.slice(0, 3).toUpperCase()}
                        </span>
                        <div className="min-w-0 flex-1">
                          <h2 className="truncate text-lg font-semibold text-star-white group-hover:text-cosmic-blue transition-colors">
                            {agency.name}
                          </h2>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-star-dim">{country}</span>
                            {agency.type && (
                              <span className="text-xs text-star-dim/60">{agency.type}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="info">
                          {agency._count.launches} {t('launches')}
                        </Badge>
                        {agency.source && (
                          <Badge variant="hud">{agency.source}</Badge>
                        )}
                      </div>
                      {latestLaunch && (
                        <div className="rounded-xl border border-space-600/40 bg-space-700/35 p-3">
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <span className="inline-flex items-center gap-2 text-xs font-medium text-star-dim">
                              <CalendarClock className="h-3.5 w-3.5 text-cosmic-blue/70" />
                              {t('latestLaunch')}
                            </span>
                            <StatusBadge status={latestLaunch.status} className="text-[10px]" />
                          </div>
                          <div className="truncate text-sm font-medium text-star-white">
                            {latestLaunch.name}
                          </div>
                          <div className="mt-1 text-xs text-star-dim">
                            {new Intl.DateTimeFormat(locale, {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                            }).format(new Date(latestLaunch.date))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {sortedAgencies.length === 0 && (
            <div className="py-16 text-center text-star-dim">{t('empty')}</div>
          )}
        </>
      )}
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
}) {
  return (
    <Card variant="elevated">
      <CardContent className="flex items-center justify-between gap-4 p-5">
        <div>
          <div className="text-sm text-star-dim">{label}</div>
          <div className="mt-2 text-3xl font-bold text-star-white">{value}</div>
        </div>
        <div className="rounded-lg border border-cosmic-blue/25 bg-cosmic-blue/10 p-3 text-cosmic-blue">
          <Icon className="h-6 w-6" />
        </div>
      </CardContent>
    </Card>
  );
}

function getAgencyCountry(
  agency: AgencyRow,
  fallback: string
): string {
  return (
    formatOptionalValue(agency.country) ||
    formatOptionalValue(agency.launches?.[0]?.rocket?.country) ||
    formatOptionalValue(agency.launches?.[0]?.launchSite?.country) ||
    fallback
  );
}

function formatOptionalValue(value: string | null | undefined): string | undefined {
  if (!value || value === 'UNK' || value === 'Unknown') return undefined;
  return value;
}
