const DAY_MS = 24 * 60 * 60 * 1000;
const UPCOMING_DAY_HOURS = 24;
const UPCOMING_WEEK_DAYS = 7;
const UPCOMING_MONTH_DAYS = 30;
const RECENT_DAYS = 14;
const FRESHNESS_HOURS = 6;

const UPCOMING_STATUSES = new Set(['PLANNED', 'POSTPONED']);
const COMPLETED_STATUSES = new Set(['SUCCESS', 'FAILURE']);

export interface LaunchOverviewInput {
  id: string;
  name: string;
  date: string | Date;
  windowStart?: string | Date | null;
  windowEnd?: string | Date | null;
  status: string;
  rawStatus?: string | null;
  missionDescription?: string | null;
  missionType?: string | null;
  orbitName?: string | null;
  orbitAbbrev?: string | null;
  videoUrl?: string | null;
  webcastUrl?: string | null;
  images?: string[];
  source?: string | null;
  lastSyncedAt?: string | Date | null;
  rocket: { id: string; name: string; country: string };
  launchSite: { id: string; name: string };
  agency?: { id: string; name: string; country?: string | null } | null;
  launchPad?: { id: string; name: string } | null;
}

export interface LaunchOverviewCount {
  status?: string;
  country?: string;
  count: number;
}

function isChinaLaunch(l: LaunchOverviewInput): boolean {
  const ac = l.agency?.country ?? '';
  const rc = l.rocket?.country ?? '';
  return ac === 'China' || ac === 'CHN' || rc === 'China' || rc === 'CHN';
}

export interface LaunchOverview {
  generatedAt: string;
  sourceStatus: 'ok' | 'unavailable';
  sourceMessage?: string;
  nextLaunch: LaunchOverviewInput | null;
  chinaNextLaunch: LaunchOverviewInput | null;
  inFlight: LaunchOverviewInput[];
  next24Hours: LaunchOverviewInput[];
  upcoming7Days: LaunchOverviewInput[];
  upcoming30Days: LaunchOverviewInput[];
  datePending: LaunchOverviewInput[];
  recentCompleted: LaunchOverviewInput[];
  attention: LaunchOverviewInput[];
  statusCounts: Array<{ status: string; count: number }>;
  countryCounts: Array<{ country: string; count: number }>;
  providerCounts: Array<{ provider: string; count: number }>;
  missionTypeCounts: Array<{ missionType: string; count: number }>;
  freshness: {
    latestSyncedAt: string | null;
    status: 'fresh' | 'stale' | 'unknown';
    ageHours: number | null;
    sources: Array<{ source: string; latestSyncedAt: string | null; count: number }>;
  };
}

export function buildLaunchOverview(
  launches: LaunchOverviewInput[],
  now = new Date()
): LaunchOverview {
  const nowMs = now.getTime();
  const dayEndMs = nowMs + UPCOMING_DAY_HOURS * 60 * 60 * 1000;
  const weekEndMs = nowMs + UPCOMING_WEEK_DAYS * DAY_MS;
  const monthEndMs = nowMs + UPCOMING_MONTH_DAYS * DAY_MS;
  const recentStartMs = nowMs - RECENT_DAYS * DAY_MS;

  const sortedAsc = [...launches].sort((a, b) => getTime(a) - getTime(b));
  const sortedRecent = [...launches].sort((a, b) => getTime(b) - getTime(a));

  const upcoming30Days = sortedAsc.filter((launch) => {
    const launchMs = getTime(launch);
    return (
      UPCOMING_STATUSES.has(launch.status) &&
      launchMs >= nowMs &&
      launchMs <= monthEndMs
    );
  });

  const upcoming7Days = upcoming30Days.filter(
    (launch) => getTime(launch) <= weekEndMs
  );
  const next24Hours = upcoming30Days.filter(
    (launch) => getTime(launch) <= dayEndMs
  );
  const datePending = upcoming30Days.filter(isDatePending);
  const nextLaunch =
    sortedAsc.find(
      (launch) =>
        launch.status === 'PLANNED' &&
        getTime(launch) >= nowMs
    ) ?? null;

  const chinaNextLaunch =
    sortedAsc.find(
      (launch) =>
        launch.status === 'PLANNED' &&
        getTime(launch) >= nowMs &&
        isChinaLaunch(launch)
    ) ?? null;

  const inFlight = sortedAsc.filter((launch) => launch.status === 'IN_FLIGHT');

  const recentCompleted = sortedRecent.filter((launch) => {
    const launchMs = getTime(launch);
    return (
      COMPLETED_STATUSES.has(launch.status) &&
      launchMs < nowMs &&
      launchMs >= recentStartMs
    );
  });

  const attention = sortedRecent
    .filter((launch) => {
      const launchMs = getTime(launch);
      const isRecentFailure =
        launch.status === 'FAILURE' &&
        launchMs < nowMs &&
        launchMs >= recentStartMs;
      const isUpcomingDelay =
        launch.status === 'POSTPONED' &&
        launchMs >= nowMs &&
        launchMs <= monthEndMs;

      return isRecentFailure || isUpcomingDelay;
    })
    .sort((a, b) => {
      if (a.status === b.status) return getTime(a) - getTime(b);
      if (a.status === 'FAILURE') return -1;
      if (b.status === 'FAILURE') return 1;
      return getTime(a) - getTime(b);
    });

  return {
    generatedAt: now.toISOString(),
    sourceStatus: 'ok',
    nextLaunch,
    chinaNextLaunch,
    inFlight,
    next24Hours,
    upcoming7Days,
    upcoming30Days,
    datePending,
    recentCompleted,
    attention,
    statusCounts: countBy(launches, (launch) => launch.status).map(
      ([status, count]) => ({ status, count })
    ),
    countryCounts: countBy(launches, (launch) => launch.rocket.country || 'Unknown').map(
      ([country, count]) => ({ country, count })
    ),
    providerCounts: countBy(
      launches,
      (launch) => launch.agency?.name || 'Unknown'
    ).map(([provider, count]) => ({ provider, count })),
    missionTypeCounts: countBy(
      launches,
      (launch) => launch.missionType || 'Unknown'
    ).map(([missionType, count]) => ({ missionType, count })),
    freshness: buildFreshness(launches, now),
  };
}

function isDatePending(launch: LaunchOverviewInput) {
  if (launch.status === 'POSTPONED') return true;
  const rawStatus = launch.rawStatus?.trim().toLowerCase();
  if (!rawStatus) return false;

  return (
    rawStatus.includes('to be determined') ||
    rawStatus.includes('to be confirmed') ||
    /\btbd\b/.test(rawStatus) ||
    /\btbc\b/.test(rawStatus) ||
    rawStatus.includes('待定') ||
    rawStatus.includes('待确认')
  );
}

function getTime(launch: LaunchOverviewInput) {
  return new Date(launch.date).getTime();
}

function countBy<T>(items: T[], getKey: (item: T) => string) {
  const counts = new Map<string, number>();

  for (const item of items) {
    const key = getKey(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from(counts.entries()).sort(([keyA, countA], [keyB, countB]) => {
    if (countA !== countB) return countB - countA;
    return keyA.localeCompare(keyB);
  });
}

function buildFreshness(
  launches: LaunchOverviewInput[],
  now: Date
): LaunchOverview['freshness'] {
  const bySource = new Map<
    string,
    { source: string; latestSyncedAt: string | null; count: number }
  >();
  let latestSyncedAt: string | null = null;

  for (const launch of launches) {
    const source = launch.source || 'Unknown';
    const syncedAt = normalizeDate(launch.lastSyncedAt);
    const existing = bySource.get(source) ?? {
      source,
      latestSyncedAt: null,
      count: 0,
    };

    existing.count += 1;
    if (isAfter(syncedAt, existing.latestSyncedAt)) {
      existing.latestSyncedAt = syncedAt;
    }
    if (isAfter(syncedAt, latestSyncedAt)) {
      latestSyncedAt = syncedAt;
    }
    bySource.set(source, existing);
  }

  const ageMs = latestSyncedAt
    ? Math.max(0, now.getTime() - new Date(latestSyncedAt).getTime())
    : null;
  const ageHours = ageMs === null ? null : Math.floor(ageMs / (60 * 60 * 1000));

  return {
    latestSyncedAt,
    status:
      ageMs === null
        ? 'unknown'
        : ageMs <= FRESHNESS_HOURS * 60 * 60 * 1000
          ? 'fresh'
          : 'stale',
    ageHours,
    sources: Array.from(bySource.values()).sort((a, b) => {
      const byCount = b.count - a.count;
      if (byCount !== 0) return byCount;
      return (b.latestSyncedAt || '').localeCompare(a.latestSyncedAt || '');
    }),
  };
}

function normalizeDate(value: string | Date | null | undefined): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function isAfter(candidate: string | null, current: string | null) {
  if (!candidate) return false;
  if (!current) return true;
  return candidate > current;
}
