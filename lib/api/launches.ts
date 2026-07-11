export interface LaunchPayload {
  name: string;
  type: string;
  [key: string]: unknown;
}

export interface Launch {
  id: string;
  name: string;
  date: string;
  windowStart?: string | null;
  windowEnd?: string | null;
  status: string;
  missionDescription: string;
  missionName?: string | null;
  missionType?: string | null;
  orbitName?: string | null;
  orbitAbbrev?: string | null;
  payloads: LaunchPayload[] | unknown;
  videoUrl?: string | null;
  webcastUrl?: string | null;
  articleUrl?: string | null;
  wikiUrl?: string | null;
  images: string[];
  source?: string | null;
  sourceUrl?: string | null;
  lastSyncedAt?: string | null;
  rawStatus?: string | null;
  rocket: { id: string; name: string; country: string };
  launchSite: { id: string; name: string };
  agency?: { id: string; name: string; country: string } | null;
  launchPad?: { id: string; name: string } | null;
  payloadRecords?: Array<{
    id: string;
    name: string;
    type?: string | null;
    orbit?: string | null;
    owner?: string | null;
    operator?: string | null;
    noradId?: number | null;
    internationalDesignator?: string | null;
  }>;
}

export interface LaunchListResponse {
  data: Launch[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LaunchStats {
  byYear: { year: number; count: number }[];
  byCountry: { country: string; count: number }[];
  byStatus: { status: string; count: number }[];
  total: number;
}

export interface LaunchOverview {
  generatedAt: string;
  sourceStatus: 'ok' | 'unavailable';
  sourceMessage?: string;
  nextLaunch: Launch | null;
  inFlight: Launch[];
  next24Hours: Launch[];
  upcoming7Days: Launch[];
  upcoming30Days: Launch[];
  datePending: Launch[];
  recentCompleted: Launch[];
  attention: Launch[];
  statusCounts: { status: string; count: number }[];
  countryCounts: { country: string; count: number }[];
  providerCounts: { provider: string; count: number }[];
  missionTypeCounts: { missionType: string; count: number }[];
  freshness: {
    latestSyncedAt: string | null;
    status: 'fresh' | 'stale' | 'unknown';
    ageHours: number | null;
    sources: { source: string; latestSyncedAt: string | null; count: number }[];
  };
}

export async function getLaunches(params?: {
  page?: number;
  limit?: number;
  status?: string;
  country?: string;
  year?: string;
  rocketName?: string;
  launchSite?: string;
  provider?: string;
  missionType?: string;
  orbit?: string;
  launchPad?: string;
  from?: string;
  to?: string;
}): Promise<LaunchListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.status) searchParams.set('status', params.status);
  if (params?.country) searchParams.set('country', params.country);
  if (params?.year) searchParams.set('year', params.year);
  if (params?.rocketName) searchParams.set('rocketName', params.rocketName);
  if (params?.launchSite) searchParams.set('launchSite', params.launchSite);
  if (params?.provider) searchParams.set('provider', params.provider);
  if (params?.missionType) searchParams.set('missionType', params.missionType);
  if (params?.orbit) searchParams.set('orbit', params.orbit);
  if (params?.launchPad) searchParams.set('launchPad', params.launchPad);
  if (params?.from) searchParams.set('from', params.from);
  if (params?.to) searchParams.set('to', params.to);

  const res = await fetch(`/api/launches?${searchParams}`);
  if (!res.ok) throw new Error('Failed to fetch launches');
  return res.json();
}

export async function getLaunch(id: string): Promise<Launch> {
  const res = await fetch(`/api/launches/${id}`);
  if (!res.ok) throw new Error('Failed to fetch launch');
  return res.json();
}

export async function getLaunchStats(): Promise<LaunchStats> {
  const res = await fetch('/api/launches/stats');
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function getLaunchOverview(): Promise<LaunchOverview> {
  const res = await fetch('/api/launches/overview');
  if (!res.ok) throw new Error('Failed to fetch launch overview');
  return res.json();
}
