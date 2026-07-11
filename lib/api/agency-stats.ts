export interface AgencyLaunchInput {
  id: string;
  name: string;
  date: string | Date;
  status: string;
  missionType?: string | null;
  rocket?: {
    id: string;
    name: string;
  } | null;
  launchSite?: {
    id: string;
    name: string;
  } | null;
  launchPad?: {
    id: string;
    name: string;
  } | null;
}

export interface AgencyCountItem {
  id?: string;
  label: string;
  count: number;
}

export interface AgencyStats {
  totalLaunches: number;
  successfulLaunches: number;
  failedLaunches: number;
  plannedLaunches: number;
  inFlightLaunches: number;
  successRate: number;
  uniqueRocketCount: number;
  uniqueLaunchSiteCount: number;
  missionTypeCounts: AgencyCountItem[];
  rocketCounts: AgencyCountItem[];
  siteCounts: AgencyCountItem[];
  upcomingLaunches: AgencyLaunchInput[];
  recentLaunches: AgencyLaunchInput[];
}

const RECENT_STATUSES = new Set(['SUCCESS', 'FAILURE']);
const UPCOMING_STATUSES = new Set(['PLANNED', 'POSTPONED', 'IN_FLIGHT']);

export function buildAgencyStats(
  launches: AgencyLaunchInput[],
  now: Date = new Date()
): AgencyStats {
  const successfulLaunches = launches.filter(
    (launch) => launch.status === 'SUCCESS'
  ).length;
  const failedLaunches = launches.filter(
    (launch) => launch.status === 'FAILURE'
  ).length;
  const plannedLaunches = launches.filter(
    (launch) => launch.status === 'PLANNED'
  ).length;
  const inFlightLaunches = launches.filter(
    (launch) => launch.status === 'IN_FLIGHT'
  ).length;
  const completedLaunches = successfulLaunches + failedLaunches;

  return {
    totalLaunches: launches.length,
    successfulLaunches,
    failedLaunches,
    plannedLaunches,
    inFlightLaunches,
    successRate:
      completedLaunches > 0
        ? Math.round((successfulLaunches / completedLaunches) * 100)
        : 0,
    uniqueRocketCount: countUnique(launches, (launch) => launch.rocket?.id),
    uniqueLaunchSiteCount: countUnique(
      launches,
      (launch) => launch.launchPad?.id ?? launch.launchSite?.id
    ),
    missionTypeCounts: countBy(
      launches,
      (launch) => launch.missionType || undefined
    ),
    rocketCounts: countBy(
      launches,
      (launch) => launch.rocket?.name,
      (launch) => launch.rocket?.id
    ),
    siteCounts: countBy(
      launches,
      (launch) => launch.launchPad?.name ?? launch.launchSite?.name,
      (launch) => launch.launchPad?.id ?? launch.launchSite?.id
    ),
    upcomingLaunches: launches
      .filter(
        (launch) =>
          UPCOMING_STATUSES.has(launch.status) &&
          new Date(launch.date).getTime() >= now.getTime()
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    recentLaunches: launches
      .filter(
        (launch) =>
          RECENT_STATUSES.has(launch.status) &&
          new Date(launch.date).getTime() <= now.getTime()
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  };
}

function countUnique<T>(
  items: T[],
  getKey: (item: T) => string | undefined | null
): number {
  const keys = new Set<string>();
  for (const item of items) {
    const key = getKey(item);
    if (key) keys.add(key);
  }
  return keys.size;
}

function countBy<T>(
  items: T[],
  getLabel: (item: T) => string | undefined | null,
  getId?: (item: T) => string | undefined | null
): AgencyCountItem[] {
  const counts = new Map<string, AgencyCountItem>();

  for (const item of items) {
    const label = getLabel(item);
    if (!label) continue;

    const id = getId?.(item) ?? label;
    const key = id || label;
    const current = counts.get(key);

    if (current) {
      current.count += 1;
    } else {
      const item: AgencyCountItem = { label, count: 1 };
      if (getId && id) item.id = id;
      counts.set(key, item);
    }
  }

  return Array.from(counts.values()).sort((a, b) => b.count - a.count);
}
