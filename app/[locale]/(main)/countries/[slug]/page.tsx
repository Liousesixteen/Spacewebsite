import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import {
  BarChart3,
  Building2,
  CalendarClock,
  CheckCircle2,
  Factory,
  Flag,
  MapPin,
  Rocket,
  type LucideIcon,
} from 'lucide-react';
import {
  Badge,
  Breadcrumbs,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  StatusBadge,
} from '@/components/ui';
import { ValueChainMap } from '@/components/countries/value-chain-map';
import { getCountryProfile } from '@/lib/api/country-profile';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${slug} Space Capability - SpaceData`,
    description:
      'Country-level space launch capability profile, agencies, rockets, launch sites, and mission timeline.',
  };
}

export default async function CountryDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'countries' });

  const profile = await getCountryProfile(slug);
  if (!profile) notFound();

  const { country, industry, valueChainLanes } = profile;
  const displayLabel = getCountryDisplayLabel(country.slug, country.label, locale);
  const upcomingLaunches = country.upcomingLaunches.slice(0, 10);
  const recentLaunches = country.recentLaunches.slice(0, 10);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs
        className="mb-4"
        items={[
          { label: 'SpaceData', href: `/${locale}` },
          { label: t('breadcrumb'), href: `/${locale}/countries` },
          { label: displayLabel },
        ]}
      />

      <div className="mb-8 rounded-2xl border border-cosmic-blue/25 bg-space-800/55 p-6 shadow-[0_0_35px_rgba(59,130,246,0.08)] backdrop-blur-xl">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-cosmic-blue/30 bg-cosmic-blue/10 text-lg font-bold text-cosmic-blue">
              {getInitials(country.label)}
            </div>
            <div className="min-w-0">
              <Badge variant="info" className="mb-3">
                {t('capabilityProfile')}
              </Badge>
              <h1 className="break-words text-3xl font-bold text-star-white md:text-4xl">
                {displayLabel}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-star-dim">
                {t('detailDescription')}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 lg:min-w-[360px]">
            <MiniMetric label={t('successRate')} value={`${country.successRate}%`} />
            <MiniMetric label={t('planned')} value={country.plannedLaunches} />
            <MiniMetric label={t('inFlight')} value={country.inFlightLaunches} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5 mb-8">
        <MetricCard icon={Rocket} label={t('totalLaunches')} value={country.totalLaunches} />
        <MetricCard icon={Building2} label={t('agencies')} value={country.agencyCount} />
        <MetricCard icon={Rocket} label={t('rockets')} value={country.rocketCount} />
        <MetricCard icon={MapPin} label={t('sites')} value={country.launchSiteCount} />
        <MetricCard icon={CheckCircle2} label={t('successful')} value={country.successfulLaunches} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-4 mb-8">
        <CountPanel
          title={t('topAgencies')}
          items={country.topAgencies.slice(0, 8)}
          locale={locale}
          hrefBase="agencies"
        />
        <CountPanel title={t('topRockets')} items={country.topRockets.slice(0, 8)} />
        <CountPanel title={t('missionTypes')} items={country.topMissionTypes.slice(0, 8)} />
        <CountPanel title={t('launchSites')} items={country.topLaunchSites.slice(0, 8)} />
      </div>

      <section className="mb-8">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-semibold text-star-white">
              <Factory className="h-6 w-6 text-cosmic-blue" />
              {t('industryProfile')}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-star-dim">
              {t('industryProfileDescription')}
            </p>
          </div>
          <Link
            href={`/${locale}/industry`}
            className="text-sm font-medium text-cosmic-blue transition-colors hover:text-cosmic-cyan"
          >
            {t('viewIndustryChain')} →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-5">
          <MetricCard icon={Building2} label={t('industryCompanies')} value={industry.companyCount} />
          <MetricCard
            icon={BarChart3}
            label={t('industryRevenue')}
            value={formatCompactNumber(industry.totalRevenue)}
          />
          <MetricCard
            icon={Factory}
            label={t('industryEmployees')}
            value={formatCompactNumber(industry.totalEmployees)}
          />
          <MetricCard
            icon={MapPin}
            label={t('industrySegments')}
            value={industry.topSegments.length}
          />
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <CountPanel
            title={t('valueChainLevels')}
            items={industry.levelCounts.map((item) => ({
              ...item,
              label: t(`levels.${item.label}`),
            }))}
          />
          <CountPanel
            title={t('companyTypeTitle')}
            items={industry.companyTypeCounts.map((item) => ({
              ...item,
              label: t(`companyTypeLabels.${item.label}`),
            }))}
          />
          <CountPanel title={t('keySegments')} items={industry.topSegments.slice(0, 8)} />
        </div>

        <div className="mt-5">
          <ValueChainMap
            lanes={valueChainLanes}
            locale={locale}
            labels={{
              title: t('valueChainMapTitle'),
              description: t('valueChainMapDescription'),
              companyUnit: t('companyUnit'),
              noCompanies: t('noIndustryCompanies'),
              levelLabels: {
                UPSTREAM: t('levels.UPSTREAM'),
                MIDSTREAM: t('levels.MIDSTREAM'),
                DOWNSTREAM: t('levels.DOWNSTREAM'),
              },
              companyTypeLabels: {
                STATE_OWNED: t('companyTypeLabels.STATE_OWNED'),
                PRIVATE: t('companyTypeLabels.PRIVATE'),
                PUBLIC: t('companyTypeLabels.PUBLIC'),
                STARTUP: t('companyTypeLabels.STARTUP'),
              },
            }}
          />
        </div>

        <div className="mt-5">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-cosmic-blue" />
                {t('featuredCompanies')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {industry.featuredCompanies.length === 0 ? (
                <div className="rounded-xl border border-space-600/40 bg-space-700/30 p-4 text-sm text-star-dim">
                  {t('noIndustryCompanies')}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {industry.featuredCompanies.slice(0, 6).map((company) => (
                    <Link
                      key={company.id}
                      href={`/${locale}/industry/companies/${company.id}`}
                      className="rounded-xl border border-space-600/40 bg-space-700/35 p-4 transition-colors hover:border-cosmic-blue/35 hover:bg-space-700/55"
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-star-white">
                            {company.name}
                          </h3>
                          <p className="mt-1 text-xs text-star-dim">
                            {company.products?.slice(0, 2).join(' / ') || t('unknown')}
                          </p>
                        </div>
                        <Badge variant="info">{t(`companyTypeLabels.${company.type}`)}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {company.segments?.slice(0, 3).map((ref) => (
                          <Badge key={ref.segment.id} variant="default">
                            {ref.segment.name}
                          </Badge>
                        ))}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <LaunchPanel
          title={t('upcomingLaunches')}
          empty={t('noUpcoming')}
          launches={upcomingLaunches}
          locale={locale}
          unknownPayload={t('unknownPayload')}
        />
        <LaunchPanel
          title={t('recentLaunches')}
          empty={t('noRecent')}
          launches={recentLaunches}
          locale={locale}
          unknownPayload={t('unknownPayload')}
        />
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: number | string;
}) {
  return (
    <Card variant="elevated">
      <CardContent className="p-4">
        <Icon className="mb-4 h-5 w-5 text-cosmic-blue" />
        <div className="text-2xl font-bold text-star-white">{value}</div>
        <div className="mt-1 text-xs text-star-dim">{label}</div>
      </CardContent>
    </Card>
  );
}

function MiniMetric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-space-600/40 bg-space-700/35 px-3 py-2 text-center">
      <div className="text-xl font-semibold text-star-white">{value}</div>
      <div className="mt-1 text-[11px] text-star-dim">{label}</div>
    </div>
  );
}

function CountPanel({
  title,
  items,
  locale,
  hrefBase,
}: {
  title: string;
  items: Array<{ id?: string; label: string; count: number }>;
  locale?: string;
  hrefBase?: string;
}) {
  const max = Math.max(...items.map((item) => item.count), 1);

  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-cosmic-blue" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => {
          const content = (
            <>
              <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0 truncate text-star-white">{item.label}</span>
                <span className="text-star-dim">{item.count}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-space-700">
                <div
                  className="h-full rounded-full bg-cosmic-blue"
                  style={{ width: `${Math.max(8, (item.count / max) * 100)}%` }}
                />
              </div>
            </>
          );

          return hrefBase && locale && item.id ? (
            <Link
              key={item.id}
              href={`/${locale}/${hrefBase}/${item.id}`}
              className="block rounded-lg p-1 transition-colors hover:bg-space-700/45"
            >
              {content}
            </Link>
          ) : (
            <div key={item.id || item.label}>{content}</div>
          );
        })}
        {items.length === 0 && <div className="text-sm text-star-dim">-</div>}
      </CardContent>
    </Card>
  );
}

function LaunchPanel({
  title,
  empty,
  launches,
  locale,
  unknownPayload,
}: {
  title: string;
  empty: string;
  launches: Array<{
    id: string;
    name: string;
    date: Date | string;
    status: string;
    missionType?: string | null;
    agency?: { id: string; name: string } | null;
    rocket?: { id: string; name: string } | null;
    launchPad?: { id: string; name: string } | null;
    launchSite?: { id: string; name: string } | null;
  }>;
  locale: string;
  unknownPayload: string;
}) {
  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-cosmic-blue" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {launches.length === 0 && (
          <div className="rounded-xl border border-space-600/40 bg-space-700/30 p-4 text-sm text-star-dim">
            {empty}
          </div>
        )}
        {launches.map((launch) => (
          <Link
            key={launch.id}
            href={`/${locale}/launches/${launch.id}`}
            className="block rounded-xl border border-space-600/40 bg-space-700/35 p-3 transition-colors hover:border-cosmic-blue/35 hover:bg-space-700/55"
          >
            <div className="mb-2 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-star-white">
                  {formatLaunchName(launch.name, unknownPayload)}
                </div>
                <div className="mt-1 text-xs text-star-dim">
                  {formatDateTime(launch.date)}
                </div>
              </div>
              <StatusBadge status={launch.status} className="text-[10px]" />
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-star-dim">
              {launch.agency?.name && <Badge variant="info">{launch.agency.name}</Badge>}
              {launch.rocket?.name && <Badge variant="default">{launch.rocket.name}</Badge>}
              {(launch.launchPad?.name || launch.launchSite?.name) && (
                <Badge variant="hud">
                  {launch.launchPad?.name || launch.launchSite?.name}
                </Badge>
              )}
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
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

function formatDateTime(value: Date | string): string {
  return new Intl.DateTimeFormat('en-CA', {
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

function formatCompactNumber(value: number): string {
  if (!value) return '0';
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
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
