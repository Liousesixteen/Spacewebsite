import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  buildHealthSnapshot,
  type HealthDomainKey,
  type HealthDomainSample,
} from '@/lib/api/data-health';

export const dynamic = 'force-dynamic';

const DOMAINS: Array<{
  key: HealthDomainKey;
  source: string;
  expectedRefreshHours: number;
}> = [
  { key: 'launches', source: 'Launch Library 2', expectedRefreshHours: 6 },
  { key: 'agencies', source: 'Launch Library 2', expectedRefreshHours: 24 },
  { key: 'rockets', source: 'Launch Library 2', expectedRefreshHours: 24 },
  { key: 'launchSites', source: 'Launch Library 2', expectedRefreshHours: 168 },
  { key: 'astronauts', source: 'Launch Library 2', expectedRefreshHours: 168 },
  { key: 'spacecraft', source: 'Launch Library 2', expectedRefreshHours: 168 },
];

async function queryDomain(key: HealthDomainKey): Promise<{
  count: number;
  latestUpdatedAt: Date | null;
  latestSyncedAt: Date | null;
}> {
  switch (key) {
    case 'launches': {
      const [count, latest] = await Promise.all([
        prisma.launch.count(),
        prisma.launch.findFirst({
          select: { updatedAt: true, lastSyncedAt: true },
          orderBy: { updatedAt: 'desc' },
        }),
      ]);
      return { count, latestUpdatedAt: latest?.updatedAt ?? null, latestSyncedAt: latest?.lastSyncedAt ?? null };
    }
    case 'agencies': {
      const [count, latest] = await Promise.all([
        prisma.agency.count(),
        prisma.agency.findFirst({
          select: { updatedAt: true, lastSyncedAt: true },
          orderBy: { updatedAt: 'desc' },
        }),
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
    default:
      return { count: 0, latestUpdatedAt: null, latestSyncedAt: null };
  }
}

async function collectDomainSamples(): Promise<HealthDomainSample[]> {
  return Promise.all(
    DOMAINS.map(async ({ key, source, expectedRefreshHours }) => {
      try {
        const { count, latestUpdatedAt, latestSyncedAt } = await queryDomain(key);
        return { key, count, latestUpdatedAt, latestSyncedAt, source, expectedRefreshHours };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[data-health] Failed to query ${key}:`, message);
        return {
          key, count: 0, latestUpdatedAt: null, latestSyncedAt: null,
          source, expectedRefreshHours, error: message,
        };
      }
    })
  );
}

export async function GET() {
  try {
    const samples = await collectDomainSamples();
    const now = new Date();
    const snapshot = buildHealthSnapshot(samples, now);

    const hasAnyData = samples.some((s) => !s.error && s.count > 0);

    if (!hasAnyData && samples.every((s) => s.error)) {
      return NextResponse.json(
        { ...snapshot, status: 'unavailable' },
        { status: 503, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    return NextResponse.json(snapshot, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=900',
      },
    });
  } catch (error) {
    console.error('[data-health] Complete failure:', error);
    return NextResponse.json(
      {
        generatedAt: new Date().toISOString(),
        status: 'unavailable',
        summary: { totalRecords: 0, healthyDomains: 0, totalDomains: 6 },
        domains: [],
      },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
