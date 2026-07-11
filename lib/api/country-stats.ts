export interface CountryCapabilityLaunchInput {
  id: string;
  name: string;
  date: string | Date;
  status: string;
  missionType?: string | null;
  agency?: {
    id: string;
    name: string;
    country?: string | null;
  } | null;
  rocket?: {
    id: string;
    name: string;
    country?: string | null;
  } | null;
  launchSite?: {
    id: string;
    name: string;
    country?: string | null;
  } | null;
  launchPad?: {
    id: string;
    name: string;
    country?: string | null;
  } | null;
}

export interface NormalizedCountry {
  slug: string;
  label: string;
}

export interface CountryCountItem {
  id?: string;
  label: string;
  count: number;
}

export interface CountryCapabilityStats extends NormalizedCountry {
  totalLaunches: number;
  successfulLaunches: number;
  failedLaunches: number;
  plannedLaunches: number;
  inFlightLaunches: number;
  successRate: number;
  agencyCount: number;
  rocketCount: number;
  launchSiteCount: number;
  topAgencies: CountryCountItem[];
  topRockets: CountryCountItem[];
  topMissionTypes: CountryCountItem[];
  topLaunchSites: CountryCountItem[];
  upcomingLaunches: CountryCapabilityLaunchInput[];
  recentLaunches: CountryCapabilityLaunchInput[];
}

const RECENT_STATUSES = new Set(['SUCCESS', 'FAILURE']);
const UPCOMING_STATUSES = new Set(['PLANNED', 'POSTPONED', 'IN_FLIGHT']);

const COUNTRY_ALIASES: Record<string, NormalizedCountry> = {
  usa: { slug: 'usa', label: 'USA' },
  us: { slug: 'usa', label: 'USA' },
  'united states': { slug: 'usa', label: 'USA' },
  'united states of america': { slug: 'usa', label: 'USA' },
  chn: { slug: 'china', label: 'China' },
  china: { slug: 'china', label: 'China' },
  cn: { slug: 'china', label: 'China' },
  rus: { slug: 'russia', label: 'Russia' },
  russia: { slug: 'russia', label: 'Russia' },
  'russian federation': { slug: 'russia', label: 'Russia' },
  ind: { slug: 'india', label: 'India' },
  india: { slug: 'india', label: 'India' },
  jpn: { slug: 'japan', label: 'Japan' },
  japan: { slug: 'japan', label: 'Japan' },
  gbr: { slug: 'united-kingdom', label: 'United Kingdom' },
  uk: { slug: 'united-kingdom', label: 'United Kingdom' },
  'united kingdom': { slug: 'united-kingdom', label: 'United Kingdom' },
  deu: { slug: 'germany', label: 'Germany' },
  germany: { slug: 'germany', label: 'Germany' },
  fra: { slug: 'france', label: 'France' },
  france: { slug: 'france', label: 'France' },
  ita: { slug: 'italy', label: 'Italy' },
  italy: { slug: 'italy', label: 'Italy' },
  can: { slug: 'canada', label: 'Canada' },
  canada: { slug: 'canada', label: 'Canada' },
  aus: { slug: 'australia', label: 'Australia' },
  australia: { slug: 'australia', label: 'Australia' },
  europe: { slug: 'europe', label: 'Europe' },
  nzl: { slug: 'new-zealand', label: 'New Zealand' },
  'new zealand': { slug: 'new-zealand', label: 'New Zealand' },
  'south korea': { slug: 'south-korea', label: 'South Korea' },
  kor: { slug: 'south-korea', label: 'South Korea' },
  iran: { slug: 'iran', label: 'Iran' },
  irn: { slug: 'iran', label: 'Iran' },
  israel: { slug: 'israel', label: 'Israel' },
  isr: { slug: 'israel', label: 'Israel' },
};

export function normalizeCountryName(
  value?: string | null
): NormalizedCountry | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (
    !trimmed ||
    trimmed.toLowerCase() === 'unknown' ||
    trimmed === '???'
  ) {
    return null;
  }

  const key = trimmed.toLowerCase();
  const alias = COUNTRY_ALIASES[key];
  if (alias) return alias;

  return {
    slug: key.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    label: trimmed,
  };
}

export function buildCountryStats(
  launches: CountryCapabilityLaunchInput[],
  now: Date = new Date()
): CountryCapabilityStats[] {
  const groups = new Map<
    string,
    { country: NormalizedCountry; launches: CountryCapabilityLaunchInput[] }
  >();

  for (const launch of launches) {
    const country = inferLaunchCountry(launch);
    if (!country) continue;

    const group = groups.get(country.slug);
    if (group) {
      group.launches.push(launch);
    } else {
      groups.set(country.slug, { country, launches: [launch] });
    }
  }

  return Array.from(groups.values())
    .map(({ country, launches: countryLaunches }) =>
      buildSingleCountryStats(country, countryLaunches, now)
    )
    .sort(
      (a, b) => b.totalLaunches - a.totalLaunches || a.label.localeCompare(b.label)
    );
}

function inferLaunchCountry(
  launch: CountryCapabilityLaunchInput
): NormalizedCountry | null {
  return (
    normalizeCountryName(launch.agency?.country) ||
    normalizeCountryName(launch.rocket?.country) ||
    normalizeCountryName(launch.launchPad?.country) ||
    normalizeCountryName(launch.launchSite?.country)
  );
}

function buildSingleCountryStats(
  country: NormalizedCountry,
  launches: CountryCapabilityLaunchInput[],
  now: Date
): CountryCapabilityStats {
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
    ...country,
    totalLaunches: launches.length,
    successfulLaunches,
    failedLaunches,
    plannedLaunches,
    inFlightLaunches,
    successRate:
      completedLaunches > 0
        ? Math.round((successfulLaunches / completedLaunches) * 100)
        : 0,
    agencyCount: countUnique(launches, (launch) => launch.agency?.id),
    rocketCount: countUnique(launches, (launch) => launch.rocket?.id),
    launchSiteCount: countUnique(
      launches,
      (launch) => launch.launchPad?.id ?? launch.launchSite?.id
    ),
    topAgencies: countBy(
      launches,
      (launch) => launch.agency?.name,
      (launch) => launch.agency?.id
    ),
    topRockets: countBy(
      launches,
      (launch) => launch.rocket?.name,
      (launch) => launch.rocket?.id
    ),
    topMissionTypes: countBy(
      launches,
      (launch) => launch.missionType || undefined
    ),
    topLaunchSites: countBy(
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
): CountryCountItem[] {
  const counts = new Map<string, CountryCountItem>();

  for (const item of items) {
    const label = getLabel(item);
    if (!label) continue;

    const id = getId?.(item) ?? label;
    const key = id || label;
    const current = counts.get(key);
    if (current) {
      current.count += 1;
    } else {
      const countItem: CountryCountItem = { label, count: 1 };
      if (getId && id) countItem.id = id;
      counts.set(key, countItem);
    }
  }

  return Array.from(counts.values()).sort((a, b) => b.count - a.count);
}
