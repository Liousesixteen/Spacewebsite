import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import {
  BarChart3,
  Building2,
  CalendarClock,
  CheckCircle2,
  ExternalLink,
  Flag,
  Globe2,
  MapPin,
  Rocket,
  type LucideIcon,
} from 'lucide-react';
import { prisma } from '@/lib/db';
import {
  Badge,
  Breadcrumbs,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  StatusBadge,
} from '@/components/ui';
import { buildAgencyStats } from '@/lib/api/agency-stats';
import { normalizeCountryName } from '@/lib/api/country-stats';
import { computeQualityScore, inferSourceTier } from '@/lib/api/data-quality';
import { JsonLd, buildOrganizationSchema } from '@/components/seo/json-ld';
import { SourceBadge } from '@/components/ui/source-badge';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const agency = await prisma.agency.findUnique({
    where: { id },
    select: { name: true, description: true },
  });

  if (!agency) return { title: 'Agency Not Found - SpaceData' };

  return {
    title: `${agency.name} - SpaceData`,
    description:
      agency.description?.slice(0, 160) ??
      `${agency.name} launch activity, rockets, mission types, and launch sites.`,
  };
}

export default async function AgencyDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: 'agencies' });

  const agency = await prisma.agency.findUnique({
    where: { id },
    include: {
      launches: {
        include: {
          rocket: { select: { id: true, name: true, country: true } },
          launchSite: { select: { id: true, name: true, country: true, region: true } },
          launchPad: { select: { id: true, name: true, country: true } },
        },
        orderBy: { date: 'desc' },
        take: 600,
      },
    },
  });

  if (!agency) notFound();

  const stats = buildAgencyStats(agency.launches);
  const recentLaunches = stats.recentLaunches.slice(0, 8);
  const upcomingLaunches = stats.upcomingLaunches.slice(0, 8);
  const lastSyncedAt = agency.lastSyncedAt
    ? formatDateTime(agency.lastSyncedAt)
    : t('unknown');
  const displayCountry =
    formatOptionalValue(agency.country) ||
    inferCountryFromLaunches(agency.launches) ||
    t('unknown');
  const displayCountrySlug = normalizeCountryName(displayCountry)?.slug;

  const sourceTier = inferSourceTier(agency.source);
  const quality = computeQualityScore({
    sourceTier,
    lastSyncedAt: agency.lastSyncedAt,
    coreFieldsTotal: 6,
    coreFieldsPopulated: [
      agency.name,
      agency.country,
      agency.type,
      agency.description,
      agency.website,
      agency.logo,
    ].filter(Boolean).length,
    distinctSources: agency.source ? 1 : 0,
    maxSources: 3,
    hasEditorialReview: false,
    hasVerifiedRelationships: agency.launches?.length > 0,
  });

  const agencyUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/${locale}/agencies/${agency.id}`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <JsonLd
        data={buildOrganizationSchema({
          name: agency.name,
          description: agency.description,
          url: agencyUrl,
          logo: agency.logo ?? null,
          country: agency.country,
        })}
      />

      <Breadcrumbs
        className="mb-4"
        items={[
          { label: 'SpaceData', href: `/${locale}` },
          { label: t('breadcrumb'), href: `/${locale}/agencies` },
          { label: agency.name },
        ]}
      />

      <div className="mb-8 rounded-2xl border border-cosmic-blue/25 bg-space-800/55 p-6 shadow-[0_0_35px_rgba(59,130,246,0.08)] backdrop-blur-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-cosmic-blue/30 bg-cosmic-blue/10 text-lg font-bold text-cosmic-blue">
              {getInitials(agency.abbrev || agency.name)}
            </div>
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {displayCountrySlug ? (
                  <Link href={`/${locale}/countries/${displayCountrySlug}`}>
                    <Badge variant="info">{displayCountry}</Badge>
                  </Link>
                ) : (
                  <Badge variant="info">{displayCountry}</Badge>
                )}
                {formatOptionalValue(agency.type) && (
                  <Badge variant="default">
                    {formatOptionalValue(agency.type, t('unknown'))}
                  </Badge>
                )}
                {agency.abbrev && <Badge variant="hud">{agency.abbrev}</Badge>}
              </div>
              <h1 className="break-words text-3xl font-bold text-star-white md:text-4xl">
                {agency.name}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-star-dim">
                {agency.description || t('descriptionFallback')}
              </p>
            </div>
          </div>

          <div className="grid min-w-[260px] gap-2 text-sm text-star-dim">
            <InfoPill icon={Flag} label={t('country')} value={displayCountry} />
            <InfoPill
              icon={Building2}
              label={t('type')}
              value={formatOptionalValue(agency.type, t('unknown'))}
            />
            <InfoPill icon={Globe2} label={t('source')} value={agency.source || t('unknown')} />
            <InfoPill icon={CalendarClock} label={t('lastSynced')} value={lastSyncedAt} />
            {agency.website && (
              <a
                href={agency.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-cosmic-blue/30 bg-cosmic-blue/10 px-3 py-2 font-medium text-cosmic-blue transition-colors hover:text-cosmic-cyan"
              >
                <ExternalLink className="h-4 w-4" />
                {t('website')}
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5 mb-8">
        <MetricCard icon={Rocket} label={t('totalLaunches')} value={stats.totalLaunches} />
        <MetricCard icon={CheckCircle2} label={t('successRate')} value={`${stats.successRate}%`} />
        <MetricCard icon={CalendarClock} label={t('plannedLaunches')} value={stats.plannedLaunches} />
        <MetricCard icon={Rocket} label={t('rockets')} value={stats.uniqueRocketCount} />
        <MetricCard icon={MapPin} label={t('launchSites')} value={stats.uniqueLaunchSiteCount} />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 mb-8">
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

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <CountPanel title={t('rocketUsage')} items={stats.rocketCounts.slice(0, 8)} />
        <CountPanel title={t('missionTypes')} items={stats.missionTypeCounts.slice(0, 8)} />
        <CountPanel title={t('launchSiteUsage')} items={stats.siteCounts.slice(0, 8)} />
      </div>

      {/* Data Quality Score */}
      <div className="mt-8">
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="text-lg text-star-white">数据质量评分</CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-4">
              <div className="flex-1">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-star-dim">综合评分</span>
                  <span className="text-2xl font-bold text-cosmic-blue">{quality.total}/{quality.maxTotal}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-space-700/50">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-cosmic-blue to-cosmic-purple transition-all"
                    style={{ width: `${(quality.total / quality.maxTotal) * 100}%` }}
                  />
                </div>
              </div>
              <SourceBadge tier={sourceTier} factType="OBSERVED" lastSyncedAt={agency.lastSyncedAt} />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {quality.dimensions.map((dim) => (
                <div
                  key={dim.label}
                  className="rounded-lg border border-space-600/30 bg-space-700/30 p-3"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs text-star-dim">{dim.label}</span>
                    <span className="text-xs font-mono font-semibold text-star-white">
                      {dim.score}/{dim.maxScore}
                    </span>
                  </div>
                  <div className="mb-2 h-1.5 w-full rounded-full bg-space-600/30">
                    <div
                      className="h-1.5 rounded-full bg-cosmic-blue/60"
                      style={{ width: `${(dim.score / dim.maxScore) * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-star-dim/70">{dim.detail}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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

function InfoPill({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-space-600/40 bg-space-700/35 px-3 py-2">
      <span className="inline-flex items-center gap-2">
        <Icon className="h-4 w-4 text-cosmic-blue/70" />
        {label}
      </span>
      <span className="min-w-0 truncate text-star-white">{value}</span>
    </div>
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
              {launch.rocket?.name && <Badge variant="default">{launch.rocket.name}</Badge>}
              {launch.missionType && <Badge variant="info">{launch.missionType}</Badge>}
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

function CountPanel({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; count: number }>;
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
        {items.map((item) => (
          <div key={item.label}>
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
          </div>
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

function formatOptionalValue(value?: string | null, fallback = ''): string {
  if (!value || value.toLowerCase() === 'unknown') return fallback;
  return value;
}

function formatLaunchName(name: string, unknownPayload: string): string {
  return name.replace(/\bUnknown Payload\b/g, unknownPayload);
}

function inferCountryFromLaunches(
  launches: Array<{
    rocket?: { country?: string | null } | null;
    launchSite?: { country?: string | null } | null;
  }>
): string {
  const counts = new Map<string, number>();

  for (const launch of launches) {
    const country =
      formatOptionalValue(launch.rocket?.country) ||
      formatOptionalValue(launch.launchSite?.country);
    if (!country) continue;
    counts.set(country, (counts.get(country) ?? 0) + 1);
  }

  return (
    Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? ''
  );
}
