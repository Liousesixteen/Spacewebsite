import { LaunchStatus } from '@prisma/client';
import { NextResponse } from 'next/server';
import { buildLaunchOverview } from '@/lib/api/launch-overview';
import { prisma } from '@/lib/db';
import { setFallback, getFallback, cacheKey } from '@/lib/api/fallback-cache';

const DAY_MS = 24 * 60 * 60 * 1000;
const QUERY_TIMEOUT_MS = 10_000;
const FALLBACK_TTL_MS = 30 * 60 * 1000; // 30 minutes

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

    const launches = await withTimeout(launchQuery, QUERY_TIMEOUT_MS);
    const overview = buildLaunchOverview(launches, now);

    // Cache successful response for fallback
    setFallback(cacheKey('launches/overview'), overview, FALLBACK_TTL_MS);

    return NextResponse.json(overview, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        'X-Data-Source': 'live',
      },
    });
  } catch (error) {
    console.error('[launches/overview] failed:', error);

    // Try fallback cache
    const fallback = getFallback<ReturnType<typeof buildLaunchOverview>>(
      cacheKey('launches/overview')
    );

    if (fallback) {
      return NextResponse.json(
        {
          ...fallback.data,
          sourceStatus: 'unavailable',
          sourceMessage: `Serving cached data (${Math.round(fallback.ageMs / 1000)}s old). Database is temporarily unavailable.`,
          generatedAt: new Date().toISOString(),
        },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=300',
            'X-Data-Source': 'fallback',
            'X-Fallback-Age': String(Math.round(fallback.ageMs / 1000)),
          },
        }
      );
    }

    // No fallback available
    return NextResponse.json(
      {
        ...buildLaunchOverview([], now),
        sourceStatus: 'unavailable',
        sourceMessage: 'Launch database is temporarily unavailable and no cached data is available.',
      },
      {
        status: 503,
        headers: { 'Cache-Control': 'no-store' },
      }
    );
  }
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
