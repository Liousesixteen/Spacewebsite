import { LaunchStatus } from '@prisma/client';
import { NextResponse } from 'next/server';
import { buildLaunchOverview } from '@/lib/api/launch-overview';
import { prisma } from '@/lib/db';

const DAY_MS = 24 * 60 * 60 * 1000;
const QUERY_TIMEOUT_MS = 10_000;

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function GET() {
  const now = new Date();
  const recentStart = new Date(now.getTime() - 14 * DAY_MS);
  const upcomingEnd = new Date(now.getTime() + 365 * DAY_MS);

  try {
    const launchQuery = prisma.launch.findMany({
      where: {
        OR: [
          { date: { gte: recentStart, lte: upcomingEnd } },
          { status: LaunchStatus.IN_FLIGHT },
        ],
      },
      include: {
        rocket: { select: { id: true, name: true, country: true } },
        launchSite: { select: { id: true, name: true } },
        agency: { select: { id: true, name: true, country: true } },
        launchPad: { select: { id: true, name: true } },
      },
      orderBy: { date: 'asc' },
      take: 300,
    });
    launchQuery.catch(() => undefined);
    const launches = await withTimeout(launchQuery, QUERY_TIMEOUT_MS);

    return NextResponse.json(buildLaunchOverview(launches, now), {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('[launches/overview] failed to fetch launches:', error);
  }

  return NextResponse.json(
    {
      ...buildLaunchOverview([], now),
      sourceStatus: 'unavailable',
      sourceMessage: 'Launch database is temporarily unavailable.',
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  );
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<T>((_, reject) => {
    timeout = setTimeout(() => {
      reject(new Error(`Launch overview query timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeout) clearTimeout(timeout);
  });
}
