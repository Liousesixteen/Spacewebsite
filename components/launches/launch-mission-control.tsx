'use client';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import {
  Building2,
  CalendarClock,
  CheckCircle2,
  CircleDot,
  Clock3,
  Database,
  Globe2,
  RadioTower,
  Rocket,
  Video,
  type LucideIcon,
} from 'lucide-react';
import { Badge, Card, CardContent, StatusBadge } from '@/components/ui';
import { getLaunchOverview, type Launch } from '@/lib/api/launches';
import {
  formatLaunchDateTime,
  formatLaunchWindow,
  isTentativeLaunchTime,
} from '@/lib/launch-time';
import { cn } from '@/lib/utils';
import {
  displayRocketName,
  displayAgencyName,
  displaySiteName,
  displayMissionType,
} from '@/lib/display-names';

interface LaunchMissionControlProps {
  locale: string;
}

export function LaunchMissionControl({ locale }: LaunchMissionControlProps) {
  const t = useTranslations('launches.overview');
  const statusT = useTranslations('launches.status');
  const [timeMode, setTimeMode] = useState<'local' | 'utc'>('local');
  const timeZone = timeMode === 'utc' ? 'UTC' : undefined;
  const { data, isLoading, error } = useQuery({
    queryKey: ['launch-overview'],
    queryFn: getLaunchOverview,
    refetchInterval: 60_000,
  });

  if (error) {
    return (
      <div className="mt-8 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
        {t('loadFailed')}
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <section className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="h-44 animate-pulse rounded-lg border border-space-600/70 bg-space-800/60" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-20 animate-pulse rounded-lg border border-space-600/70 bg-space-800/60"
            />
          ))}
        </div>
      </section>
    );
  }

  // Prioritize China launches for the hero display
  const heroLaunch = data.chinaNextLaunch ?? data.nextLaunch;
  const isChinaHero = data.chinaNextLaunch !== null;
  const sourceUnavailable = data.sourceStatus === 'unavailable';
  const headline = getHeadline(heroLaunch, sourceUnavailable, t);
  const summary = getSummary(heroLaunch, sourceUnavailable, t);

  return (
    <section className="mt-8 space-y-4">
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card variant="elevated" className="overflow-hidden">
          <CardContent className="p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.15em] text-cosmic-cyan">
                  <RadioTower className="h-4 w-4" />
                  {t('control')}
                </div>
                <div className="mb-2 flex items-center gap-2">
                  {isChinaHero && (
                    <span className="inline-flex items-center gap-1 rounded-md border border-red-400/30 bg-red-400/10 px-2 py-0.5 text-xs font-semibold text-red-400">
                      🇨🇳 中国发射
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-semibold text-star-white sm:text-2xl">
                  {headline}
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-star-dim">
                  {summary}
                </p>
              </div>

              {sourceUnavailable ? (
                <Badge variant="warning" className="shrink-0">
                  {t('dataOffline')}
                </Badge>
              ) : (
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Badge
                    variant={
                      data.freshness.status === 'fresh'
                        ? 'success'
                        : data.freshness.status === 'stale'
                          ? 'warning'
                          : 'default'
                    }
                  >
                    {data.freshness.status === 'stale' &&
                    data.freshness.ageHours !== null
                      ? t('freshnessStaleHours', {
                          hours: data.freshness.ageHours,
                        })
                      : t(`freshness.${data.freshness.status}`)}
                  </Badge>
                  {heroLaunch && (
                    <>
                      <StatusBadge
                        status={heroLaunch.status}
                        label={statusT(heroLaunch.status)}
                      />
                      <Badge variant="hud">{timeToLaunch(heroLaunch.date)}</Badge>
                    </>
                  )}
                </div>
              )}
            </div>

            {heroLaunch && (
              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <MetricLine
                  icon={CalendarClock}
                  label={t('launchTime')}
                  value={formatLaunchDateTime(heroLaunch.date, locale, timeZone)}
                />
                <MetricLine
                  icon={Building2}
                  label={t('provider')}
                  value={heroLaunch.agency?.name ? displayAgencyName(heroLaunch.agency.name, locale) : t('unknown')}
                />
                <MetricLine
                  icon={Rocket}
                  label={t('rocket')}
                  value={displayRocketName(heroLaunch.rocket.name, locale)}
                />
                <MetricLine
                  icon={CircleDot}
                  label={t('missionType')}
                  value={displayMissionType(heroLaunch.missionType, locale) || t('unknown')}
                />
                <MetricLine
                  icon={Globe2}
                  label={t('orbit')}
                  value={heroLaunch.orbitName || heroLaunch.orbitAbbrev || t('unknown')}
                />
                <MetricLine
                  icon={Database}
                  label={t('lastSynced')}
                  value={
                    data.freshness.latestSyncedAt
                      ? formatLaunchDateTime(
                          data.freshness.latestSyncedAt,
                          locale,
                          timeZone
                        )
                      : t('unknown')
                  }
                />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <StatTile
            icon={Clock3}
            label={t('next7Days')}
            value={data.upcoming7Days.length}
            tone="blue"
          />
          <StatTile
            icon={CalendarClock}
            label={t('next30Days')}
            value={data.upcoming30Days.length}
            tone="cyan"
          />
          <StatTile
            icon={RadioTower}
            label={t('inFlight')}
            value={data.inFlight.length}
            tone="green"
          />
          <StatTile
            icon={CheckCircle2}
            label={t('recentCompleted')}
            value={data.recentCompleted.length}
            tone="amber"
          />
        </div>
      </div>

      <ScheduleBoard
        locale={locale}
        timeMode={timeMode}
        timeZone={timeZone}
        onTimeModeChange={setTimeMode}
        groups={[
          { key: 'next24Hours', launches: data.next24Hours },
          { key: 'next7Days', launches: data.upcoming7Days },
          { key: 'next30Days', launches: data.upcoming30Days },
          { key: 'datePending', launches: data.datePending },
          { key: 'recentResults', launches: data.recentCompleted },
          { key: 'attentionTitle', launches: data.attention },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <OverviewPanel title={t('countryCoverage')} icon={Globe2}>
          {data.countryCounts.length > 0 ? (
            <CountList
              items={data.countryCounts.slice(0, 7).map((item) => ({
                label: item.country,
                count: item.count,
              }))}
            />
          ) : (
            <EmptyLine text={t('noCountryStats')} />
          )}
        </OverviewPanel>

        <OverviewPanel title={t('providerCoverage')} icon={Building2}>
          {data.providerCounts.length > 0 ? (
            <CountList
              items={data.providerCounts.slice(0, 7).map((item) => ({
                label: item.provider,
                count: item.count,
              }))}
            />
          ) : (
            <EmptyLine text={t('noProviderStats')} />
          )}
        </OverviewPanel>

        <OverviewPanel title={t('missionTypeCoverage')} icon={CircleDot}>
          {data.missionTypeCounts.length > 0 ? (
            <CountList
              items={data.missionTypeCounts.slice(0, 7).map((item) => ({
                label: item.missionType,
                count: item.count,
              }))}
            />
          ) : (
            <EmptyLine text={t('noMissionTypeStats')} />
          )}
        </OverviewPanel>
      </div>
    </section>
  );
}

type ScheduleGroupKey =
  | 'next24Hours'
  | 'next7Days'
  | 'next30Days'
  | 'datePending'
  | 'recentResults'
  | 'attentionTitle';

function ScheduleBoard({
  locale,
  groups,
  timeMode,
  timeZone,
  onTimeModeChange,
}: {
  locale: string;
  groups: Array<{ key: ScheduleGroupKey; launches: Launch[] }>;
  timeMode: 'local' | 'utc';
  timeZone?: string;
  onTimeModeChange: (mode: 'local' | 'utc') => void;
}) {
  const t = useTranslations('launches.overview');
  const statusT = useTranslations('launches.status');
  const initialKey =
    groups.find((group) => group.launches.length > 0)?.key ?? groups[0].key;
  const [activeKey, setActiveKey] = useState<ScheduleGroupKey>(initialKey);
  const activeGroup =
    groups.find((group) => group.key === activeKey) ?? groups[0];

  return (
    <Card>
      <CardContent className="p-4 sm:p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-base font-semibold text-star-white">
            <CalendarClock className="h-5 w-5 text-cosmic-cyan" />
            {t('scheduleBoard')}
          </div>
          <div
            className="inline-flex h-9 w-fit rounded-md border border-space-600 bg-space-900/55 p-1"
            aria-label={t('timeZone')}
          >
            {(['local', 'utc'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onTimeModeChange(mode)}
                className={cn(
                  'h-7 rounded px-3 text-xs transition-colors',
                  timeMode === mode
                    ? 'bg-space-600 text-star-white'
                    : 'text-star-dim hover:text-star-white'
                )}
              >
                {t(mode === 'local' ? 'localTime' : 'utcTime')}
              </button>
            ))}
          </div>
        </div>

        <div
          role="tablist"
          aria-label={t('scheduleBoard')}
          className="mb-4 flex max-w-full gap-1 overflow-x-auto rounded-md border border-space-600/70 bg-space-900/45 p-1"
        >
          {groups.map((group) => {
            const active = group.key === activeKey;
            return (
              <button
                key={group.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveKey(group.key)}
                className={cn(
                  'flex h-9 shrink-0 items-center gap-2 rounded px-3 text-sm transition-colors',
                  active
                    ? 'bg-cosmic-blue text-white'
                    : 'text-star-dim hover:bg-space-700 hover:text-star-white'
                )}
              >
                {t(group.key)}
                <span
                  className={cn(
                    'min-w-5 rounded px-1.5 py-0.5 font-mono text-xs',
                    active ? 'bg-white/15' : 'bg-space-700 text-star-white'
                  )}
                >
                  {group.launches.length}
                </span>
              </button>
            );
          })}
        </div>

        <div role="tabpanel" className="min-h-56">
          {activeGroup.launches.length === 0 ? (
            <EmptyLine text={t('noScheduleItems')} />
          ) : (
            <div className="divide-y divide-space-600/60 overflow-hidden rounded-md border border-space-600/60">
              {activeGroup.launches.slice(0, 8).map((launch) => {
                const launchWindow = formatLaunchWindow(
                  launch.windowStart || launch.date,
                  launch.windowEnd,
                  locale,
                  timeZone
                );
                const tentative = isTentativeLaunchTime(launch.rawStatus);

                return (
                  <div
                    key={launch.id}
                    className="grid min-h-20 gap-3 bg-space-800/40 px-3 py-3 transition-colors hover:bg-space-700/55 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                  >
                  <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-2">
                      <StatusBadge
                        status={launch.status}
                        label={statusT(launch.status)}
                        className="shrink-0"
                      />
                      <Link
                        href={`/${locale}/launches/${launch.id}`}
                        className="truncate text-sm font-semibold text-star-white hover:text-cosmic-cyan"
                      >
                        {launch.name}
                      </Link>
                      {tentative && (
                        <Badge variant="warning" className="shrink-0">
                          {t('tentativeTime')}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-star-dim">
                      <span>
                        {formatLaunchDateTime(launch.date, locale, timeZone)}
                      </span>
                      {launchWindow && (
                        <span>{t('launchWindow', { window: launchWindow })}</span>
                      )}
                      <span>{launch.agency?.name ? displayAgencyName(launch.agency.name, locale) : t('unknown')}</span>
                      <span>{displayRocketName(launch.rocket.name, locale)}</span>
                      <span>{displaySiteName(launch.launchSite.name, locale)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:justify-end">
                    {launch.webcastUrl && (
                      <a
                        href={launch.webcastUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-9 items-center gap-2 rounded border border-space-500 px-3 text-xs text-star-white transition-colors hover:border-cosmic-cyan hover:text-cosmic-cyan"
                      >
                        <Video className="h-4 w-4" />
                        {t('watchLive')}
                      </a>
                    )}
                    <Link
                      href={`/${locale}/launches/${launch.id}`}
                      className="inline-flex h-9 items-center rounded bg-cosmic-blue px-3 text-xs font-medium text-white transition-colors hover:bg-cosmic-blue/80"
                    >
                      {t('viewMission')}
                    </Link>
                  </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function getHeadline(
  nextLaunch: Launch | null,
  sourceUnavailable: boolean,
  t: ReturnType<typeof useTranslations>
) {
  if (nextLaunch) return nextLaunch.name;
  if (sourceUnavailable) return t('offline');
  return t('noUpcoming');
}

function getSummary(
  nextLaunch: Launch | null,
  sourceUnavailable: boolean,
  t: ReturnType<typeof useTranslations>
) {
  if (nextLaunch) return nextLaunch.missionDescription || t('waitingDetails');
  if (sourceUnavailable) return t('offlineSummary');
  return t('noUpcomingSummary');
}

function MetricLine({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-lg border border-space-600/60 bg-space-800/55 px-3 py-3">
      <div className="mb-1 flex items-center gap-2 text-xs text-star-dim">
        <Icon className="h-3.5 w-3.5 text-cosmic-blue" />
        {label}
      </div>
      <div className="truncate text-sm font-medium text-star-white">{value}</div>
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  tone: 'blue' | 'cyan' | 'green' | 'amber';
}) {
  return (
    <div className="rounded-lg border border-space-600/70 bg-space-800/65 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-star-dim">{label}</span>
        <Icon
          className={cn(
            'h-4 w-4',
            tone === 'blue' && 'text-cosmic-blue',
            tone === 'cyan' && 'text-cosmic-cyan',
            tone === 'green' && 'text-emerald-400',
            tone === 'amber' && 'text-amber-400'
          )}
        />
      </div>
      <div className="mt-3 font-mono text-3xl font-semibold text-star-white">
        {value}
      </div>
    </div>
  );
}

function OverviewPanel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-star-white">
          <Icon className="h-4 w-4 text-cosmic-cyan" />
          {title}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

function EmptyLine({ text }: { text: string }) {
  return (
    <div className="rounded-md border border-space-600/60 bg-space-800/35 px-3 py-4 text-center text-sm text-star-dim">
      {text}
    </div>
  );
}

function CountList({ items }: { items: Array<{ label: string; count: number }> }) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center justify-between gap-3 rounded-md border border-space-600/60 bg-space-800/45 px-3 py-2"
        >
          <span className="min-w-0 truncate text-sm text-star-dim">
            {item.label}
          </span>
          <span className="shrink-0 font-mono text-sm text-star-white">
            {item.count}
          </span>
        </div>
      ))}
    </div>
  );
}

function timeToLaunch(date: string) {
  const diffMs = new Date(date).getTime() - Date.now();
  if (diffMs <= 0) return 'T+';

  const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diffMs / (60 * 60 * 1000)) % 24);

  if (days > 0) return `T-${days}d ${hours}h`;
  return `T-${Math.max(1, hours)}h`;
}
