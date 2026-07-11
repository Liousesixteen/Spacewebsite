import {
  Building2,
  CalendarClock,
  Flag,
  MapPin,
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
import { buildCountryStats, type CountryCapabilityStats } from '@/lib/api/country-stats';

async function loadCountryLaunches(): Promise<
  Array<{
    id: string;
    name: string;
    date: Date;
    status: string;
    missionType: string | null;
    agency: { id: string; name: string; country: string } | null;
    rocket: { id: string; name: string; country: string } | null;
    launchSite: { id: string; name: string; country: string } | null;
    launchPad: { id: string; name: string; country: string } | null;
  }>
> {
  return prisma.launch.findMany({
    include: {
      agency: { select: { id: true, name: true, country: true } },
      rocket: { select: { id: true, name: true, country: true } },
      launchSite: { select: { id: true, name: true, country: true } },
      launchPad: { select: { id: true, name: true, country: true } },
    },
    orderBy: { date: 'desc' },
    take: 2000,
  });
}

export default async function CountriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'countries' });

  let countries: CountryCapabilityStats[] = [];
  let dbUnavailable = false;

  try {
    const launches = await loadCountryLaunches();
    countries = buildCountryStats(launches);
  } catch (error) {
    console.error('[countries] Failed to load launches:', error);
    dbUnavailable = true;
  }

  const launchTotal = countries.reduce(
    (total, country) => total + country.totalLaunches,
    0
  );
  const agencyTotal = countries.reduce(
    (total, country) => total + country.agencyCount,
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
        icon={Flag}
        title={t('title')}
        description={dbUnavailable ? t('dbUnavailable') : t('description')}
      />

      {dbUnavailable ? (
        <div className="py-20 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10">
            <Flag className="h-8 w-8 text-amber-400/70" />
          </div>
          <h2 className="mb-2 text-lg font-semibold text-star-white">
            {t('dbUnavailable')}
          </h2>
          <p className="text-sm text-star-dim">{t('dbUnavailableHint')}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4 mb-8">
            <SummaryCard icon={Flag} label={t('coveredCountries')} value={countries.length} />
            <SummaryCard icon={Rocket} label={t('linkedLaunches')} value={launchTotal} />
            <SummaryCard icon={Building2} label={t('agencyFootprint')} value={agencyTotal} />
            <SummaryCard
              icon={MapPin}
              label={t('launchSiteFootprint')}
              value={countries.reduce((total, country) => total + country.launchSiteCount, 0)}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {countries.map((country) => {
              const nextLaunch = country.upcomingLaunches[0];
              const displayLabel = getCountryDisplayLabel(
                country.slug,
                country.label,
                locale
              );

              return (
                <Link
                  key={country.slug}
                  href={`/${locale}/countries/${country.slug}`}
                  className="group block"
                >
                  <Card variant="glow" className="h-full">
                    <CardContent className="p-5">
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="mb-3 flex items-center gap-3">
                            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-cosmic-blue/25 bg-cosmic-blue/10 text-sm font-bold text-cosmic-blue">
                              {getInitials(country.label)}
                            </span>
                            <div className="min-w-0">
                              <h2 className="truncate text-xl font-semibold text-star-white group-hover:text-cosmic-blue transition-colors">
                                {displayLabel}
                              </h2>
                              <p className="text-sm text-star-dim">
                                {t('capabilityProfile')}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="info">
                              {country.totalLaunches} {t('launches')}
                            </Badge>
                            <Badge variant="default">
                              {country.agencyCount} {t('agencies')}
                            </Badge>
                            <Badge variant="hud">
                              {country.rocketCount} {t('rockets')}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-center sm:min-w-[240px]">
                          <MiniMetric label={t('successRate')} value={`${country.successRate}%`} />
                          <MiniMetric label={t('planned')} value={country.plannedLaunches} />
                          <MiniMetric label={t('sites')} value={country.launchSiteCount} />
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                        <TopList
                          title={t('topAgencies')}
                          items={country.topAgencies.slice(0, 3)}
                        />
                        <TopList
                          title={t('topRockets')}
                          items={country.topRockets.slice(0, 3)}
                        />
                      </div>

                      {nextLaunch && (
                        <div className="mt-5 rounded-xl border border-space-600/40 bg-space-700/35 p-3">
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <span className="inline-flex items-center gap-2 text-xs font-medium text-star-dim">
                              <CalendarClock className="h-3.5 w-3.5 text-cosmic-blue/70" />
                              {t('nextLaunch')}
                            </span>
                            <StatusBadge status={nextLaunch.status} className="text-[10px]" />
                          </div>
                          <div className="truncate text-sm font-medium text-star-white">
                            {formatLaunchName(nextLaunch.name, t('unknownPayload'))}
                          </div>
                          <div className="mt-1 text-xs text-star-dim">
                            {formatDateTime(nextLaunch.date, locale)}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {countries.length === 0 && (
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

function MiniMetric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-space-600/40 bg-space-700/35 px-3 py-2">
      <div className="text-lg font-semibold text-star-white">{value}</div>
      <div className="mt-1 text-[11px] text-star-dim">{label}</div>
    </div>
  );
}

function TopList({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; count: number }>;
}) {
  return (
    <div className="rounded-xl border border-space-600/40 bg-space-700/30 p-3">
      <div className="mb-2 text-xs font-medium text-star-dim">{title}</div>
      <div className="space-y-1">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="min-w-0 truncate text-star-white">{item.label}</span>
            <span className="text-star-dim">{item.count}</span>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-sm text-star-dim">-</div>
        )}
      </div>
    </div>
  );
}

function getInitials(value: string): string {
  return value
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();
}

function formatDateTime(value: Date | string, locale = 'zh-CN'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value));
}

function formatLaunchName(name: string, unknownPayload: string): string {
  return name.replace(/\bUnknown Payload\b/g, unknownPayload);
}

function getCountryDisplayLabel(
  slug: string,
  label: string,
  locale: string
): string {
  if (locale !== 'zh-CN') return label;
  const zh: Record<string, string> = {
    usa: '美国',
    china: '中国',
    russia: '俄罗斯',
    india: '印度',
    japan: '日本',
    france: '法国',
    'new-zealand': '新西兰',
    'south-korea': '韩国',
    iran: '伊朗',
    israel: '以色列',
  };
  return zh[slug] ?? label;
}
