/**
 * Data Health — pure classifier and snapshot builder.
 *
 * Framework-agnostic: no Prisma, React, or Next.js imports.
 * Takes domain samples and produces a normalized health snapshot.
 */

export type HealthDomainKey =
  | 'launches'
  | 'agencies'
  | 'rockets'
  | 'launchSites'
  | 'astronauts'
  | 'spacecraft';

export type HealthStatus = 'healthy' | 'stale' | 'empty' | 'unavailable';

export type OverallStatus = 'healthy' | 'degraded' | 'unavailable';

export interface HealthDomainSample {
  key: HealthDomainKey;
  count: number;
  latestUpdatedAt: Date | null;
  latestSyncedAt: Date | null;
  source: string;
  expectedRefreshHours: number;
  lastRun?: HealthSyncRun | null;
  error?: string;
}

export interface HealthSyncRun {
  status: string;
  startedAt: Date;
  completedAt: Date | null;
  recordsAdded: number;
  recordsUpdated: number;
  recordsSkipped: number;
  error: string | null;
}

export interface HealthDomain {
  key: HealthDomainKey;
  status: HealthStatus;
  count: number;
  latestUpdate: string | null;
  latestSync: string | null;
  source: string;
  expectedRefreshHours: number;
  lastRun: {
    status: string;
    startedAt: string;
    completedAt: string | null;
    recordsAdded: number;
    recordsUpdated: number;
    recordsSkipped: number;
    error: string | null;
  } | null;
  message: string | null;
}

export interface HealthSnapshot {
  generatedAt: string;
  status: OverallStatus;
  summary: {
    totalRecords: number;
    healthyDomains: number;
    totalDomains: number;
  };
  domains: HealthDomain[];
}

/**
 * Classify a single domain sample into a health status.
 *
 * - `unavailable`: the domain query failed (error present).
 * - `empty`: the query succeeded but returned no records.
 * - `stale`: the latest usable timestamp is older than expectedRefreshHours.
 * - `healthy`: records exist and are within the expected refresh window.
 */
export function classifyHealth(
  sample: HealthDomainSample,
  now: Date = new Date()
): HealthStatus {
  if (sample.error) return 'unavailable';
  if (sample.count === 0) return 'empty';

  const referenceTime =
    sample.latestSyncedAt ?? sample.latestUpdatedAt;

  if (!referenceTime) return 'stale';

  const ageHours =
    (now.getTime() - referenceTime.getTime()) / (1000 * 60 * 60);

  if (ageHours > sample.expectedRefreshHours) return 'stale';

  return 'healthy';
}

/**
 * Compute overall status from domain statuses.
 *
 * - `healthy` when every non-empty domain is healthy and none are unavailable.
 * - `degraded` when at least one domain is stale, empty, or unavailable but
 *   at least one domain remains available.
 * - `unavailable` when all domain queries fail.
 */
export function computeOverallStatus(
  domains: HealthDomain[]
): OverallStatus {
  const nonEmpty = domains.filter((d) => d.status !== 'empty');
  const unavailable = nonEmpty.filter((d) => d.status === 'unavailable');

  if (nonEmpty.length === 0 || unavailable.length === nonEmpty.length) {
    return 'unavailable';
  }

  const degraded = nonEmpty.some((d) => d.status !== 'healthy');

  return degraded ? 'degraded' : 'healthy';
}

/**
 * Build a normalized health snapshot from domain samples.
 */
export function buildHealthSnapshot(
  samples: HealthDomainSample[],
  now: Date = new Date()
): HealthSnapshot {
  const domains: HealthDomain[] = samples.map((sample) => {
    const status = classifyHealth(sample, now);
    const message = buildDomainMessage(status, sample);

    return {
      key: sample.key,
      status,
      count: sample.count,
      latestUpdate: sample.latestUpdatedAt?.toISOString() ?? null,
      latestSync: sample.latestSyncedAt?.toISOString() ?? null,
      source: sample.source,
      expectedRefreshHours: sample.expectedRefreshHours,
      lastRun: sample.lastRun
        ? {
            status: sample.lastRun.status,
            startedAt: sample.lastRun.startedAt.toISOString(),
            completedAt: sample.lastRun.completedAt?.toISOString() ?? null,
            recordsAdded: sample.lastRun.recordsAdded,
            recordsUpdated: sample.lastRun.recordsUpdated,
            recordsSkipped: sample.lastRun.recordsSkipped,
            error: sample.lastRun.error,
          }
        : null,
      message,
    };
  });

  const totalRecords = domains.reduce((sum, d) => sum + d.count, 0);
  const healthyDomains = domains.filter((d) => d.status === 'healthy').length;
  const status = computeOverallStatus(domains);

  return {
    generatedAt: now.toISOString(),
    status,
    summary: {
      totalRecords,
      healthyDomains,
      totalDomains: domains.length,
    },
    domains,
  };
}

function buildDomainMessage(
  status: HealthStatus,
  sample: HealthDomainSample
): string | null {
  if (status === 'unavailable') return sample.error ?? 'Query failed';
  if (status === 'empty') return 'No records found';
  if (status === 'stale') {
    const ageHours = sample.latestSyncedAt ?? sample.latestUpdatedAt
      ? Math.round(
          (Date.now() -
            new Date(
              (sample.latestSyncedAt ?? sample.latestUpdatedAt)!
            ).getTime()) /
            (1000 * 60 * 60)
        )
      : null;
    return ageHours != null
      ? `Last update ${ageHours}h ago (expected within ${sample.expectedRefreshHours}h)`
      : 'No recent update timestamp';
  }
  return null;
}
