import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://spacedata.app';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatRssDate(date: Date): string {
  return date.toUTCString();
}

/**
 * GET /api/launches/rss — RSS 2.0 feed of upcoming launches.
 */
export async function GET() {
  try {
    const launches = await prisma.launch.findMany({
      where: {
        status: { in: ['PLANNED', 'IN_FLIGHT'] },
        date: { gte: new Date() },
      },
      select: {
        id: true,
        name: true,
        date: true,
        status: true,
        missionDescription: true,
        missionType: true,
        orbitName: true,
        agency: { select: { name: true } },
        rocket: { select: { name: true } },
        launchSite: { select: { name: true } },
        lastSyncedAt: true,
      },
      orderBy: { date: 'asc' },
      take: 50,
    });

    const items = launches
      .map((launch) => {
        const description = [
          launch.missionDescription,
          launch.agency?.name ? `机构: ${launch.agency.name}` : null,
          launch.rocket?.name ? `火箭: ${launch.rocket.name}` : null,
          launch.launchSite?.name ? `发射场: ${launch.launchSite.name}` : null,
          launch.missionType ? `任务类型: ${launch.missionType}` : null,
          launch.orbitName ? `轨道: ${launch.orbitName}` : null,
        ]
          .filter(Boolean)
          .join(' | ');

        const link = `${SITE_URL}/launches/${launch.id}`;

        return `    <item>
      <title>${escapeXml(launch.name)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <description>${escapeXml(description)}</description>
      <pubDate>${formatRssDate(launch.lastSyncedAt ?? launch.date)}</pubDate>
      <category>${escapeXml(launch.missionType ?? 'Launch')}</category>
    </item>`;
      })
      .join('\n');

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>SpaceData — Upcoming Rocket Launches</title>
    <link>${escapeXml(SITE_URL)}</link>
    <description>Upcoming rocket launches from around the world, updated hourly from Launch Library 2.</description>
    <language>en</language>
    <lastBuildDate>${formatRssDate(new Date())}</lastBuildDate>
    <ttl>60</ttl>
    <atom:link href="${escapeXml(SITE_URL)}/api/launches/rss" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

    return new NextResponse(rss, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('[launches/rss] Failed:', error);
    // Return an empty but valid RSS on failure
    const emptyRss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>SpaceData — Upcoming Launches</title>
    <link>${escapeXml(SITE_URL)}</link>
    <description>Temporarily unavailable — please try again shortly.</description>
  </channel>
</rss>`;

    return new NextResponse(emptyRss, {
      status: 200, // RSS readers should not error on empty feeds
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=60',
      },
    });
  }
}
