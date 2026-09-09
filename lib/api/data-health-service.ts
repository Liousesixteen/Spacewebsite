import { prisma } from '@/lib/db';
import {
  buildHealthSnapshot,
  type HealthDomainKey,
  type HealthDomainSample,
  type HealthSnapshot,
  type HealthSyncRun,
} from '@/lib/api/data-health';

export const HEALTH_DOMAINS: Array<{
  key: HealthDomainKey;
  source: string;
  syncSource: string;
  expectedRefreshHours: number;
}> = [
  { key: 'launches', source: 'Launch Library 2', syncSource: 'Launch Library 2: Launches', expectedRefreshHours: 6 },
  { key: 'agencies', source: 'Launch Library 2', syncSource: 'Launch Library 2: Agencies', expectedRefreshHours: 24 },
  { key: 'rockets', source: 'Launch Library 2', syncSource: 'Launch Library 2: Rockets', expectedRefreshHours: 24 },
  { key: 'launchSites', source: 'Launch Library 2', syncSource: 'Launch Library 2: Launch Sites', expectedRefreshHours: 168 },
  { key: 'astronauts', source: 'Launch Library 2', syncSource: 'Launch Library 2: Astronauts', expectedRefreshHours: 168 },
  { key: 'spacecraft', source: 'Launch Library 2', syncSource: 'Launch Library 2: Spacecraft', expectedRefreshHours: 168 },
];

async function getLatestRun(source: string): Promise<HealthSyncRun | null> {
  return prisma.syncRun.findFirst({
    where: { source },
    orderBy: { startedAt: 'desc' },
    select: {
      status: true, startedAt: true, completedAt: true, recordsAdded: true,
      recordsUpdated: true, recordsSkipped: true, error: true,
    },
  }).catch(() => null);
}

async function queryDomain(key: HealthDomainKey): Promise<Omit<HealthDomainSample, 'key' | 'source' | 'expectedRefreshHours'>> {
  switch (key) {
    case 'launches': {
      const [count, latest] = await Promise.all([
        prisma.launch.count(),
        prisma.launch.findFirst({
          select: { updatedAt: true, lastSyncedAt: true },
          orderBy: { updatedAt: 'desc' },
        }),
      ]);
      return {
        count,
        latestUpdatedAt: latest?.updatedAt ?? null,
        latestSyncedAt: latest?.lastSyncedAt ?? null,
      };
    }
    case 'agencies': {
      const [count, latest] = await Promise.all([
        prisma.agency.count(),
        prisma.agency.findFirst({ select: { updatedAt: true, lastSyncedAt: true }, orderBy: { updatedAt: 'desc' } }),
      ]);
      return { count, latestUpdatedAt: latest?.updatedAt ?? null, latestSyncedAt: latest?.lastSyncedAt ?? null };
    }
    case 'rockets': {
      const [count, latest] = await Promise.all([
        prisma.rocket.count(),
        prisma.rocket.findFirst({ select: { updatedAt: true }, orderBy: { updatedAt: 'desc' } }),
      ]);
      return { count, latestUpdatedAt: latest?.updatedAt ?? null, latestSyncedAt: null };
    }
    case 'launchSites': {
      const [count, latest] = await Promise.all([
        prisma.launchSite.count(),
        prisma.launchSite.findFirst({ select: { updatedAt: true }, orderBy: { updatedAt: 'desc' } }),
      ]);
      return { count, latestUpdatedAt: latest?.updatedAt ?? null, latestSyncedAt: null };
    }
    case 'astronauts': {
      const [count, latest] = await Promise.all([
        prisma.astronaut.count(),
        prisma.astronaut.findFirst({ select: { updatedAt: true }, orderBy: { updatedAt: 'desc' } }),
      ]);
      return { count, latestUpdatedAt: latest?.updatedAt ?? null, latestSyncedAt: null };
    }
    case 'spacecraft': {
      const [count, latest] = await Promise.all([
        prisma.spacecraft.count(),
        prisma.spacecraft.findFirst({ select: { updatedAt: true }, orderBy: { updatedAt: 'desc' } }),
      ]);
      return { count, latestUpdatedAt: latest?.updatedAt ?? null, latestSyncedAt: null };
    }
  }
}

export async function loadDataHealthSnapshot(): Promise<HealthSnapshot> {
  const samples: HealthDomainSample[] = await Promise.all(
    HEALTH_DOMAINS.map(async ({ key, source, syncSource, expectedRefreshHours }) => {
      try {
        const [domain, lastRun] = await Promise.all([queryDomain(key), getLatestRun(syncSource)]);
        return { key, source, expectedRefreshHours, lastRun, ...domain };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[data-health] Failed to query ${key}:`, message);
        return {
          key, source, expectedRefreshHours, count: 0,
          latestUpdatedAt: null, latestSyncedAt: null, error: message,
        };
      }
    })
  );

  return buildHealthSnapshot(samples);
}
