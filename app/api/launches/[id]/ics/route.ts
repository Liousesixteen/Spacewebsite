import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateSingleEventIcs } from '@/lib/api/ics-generator';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const launch = await prisma.launch.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        date: true,
        windowStart: true,
        windowEnd: true,
        missionDescription: true,
        launchSite: { select: { name: true } },
        agency: { select: { name: true } },
        rocket: { select: { name: true } },
      },
    });

    if (!launch) {
      return NextResponse.json(
        { code: 'NOT_FOUND', message: 'Launch not found' },
        { status: 404 }
      );
    }

    const description = [
      launch.missionDescription,
      launch.agency?.name ? `机构: ${launch.agency.name}` : null,
      launch.rocket?.name ? `火箭: ${launch.rocket.name}` : null,
    ]
      .filter(Boolean)
      .join('\\n');

    const ics = generateSingleEventIcs({
      uid: `spacedata-launch-${launch.id}`,
      title: launch.name,
      description: description || null,
      location: launch.launchSite?.name ?? null,
      url: `https://spacedata.app/launches/${launch.id}`,
      startDate: launch.windowStart ?? launch.date,
      endDate: launch.windowEnd ?? null,
      categories: ['Rocket Launch'],
    });

    return new NextResponse(ics, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="launch-${launch.id}.ics"`,
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('[launches/ics] Failed:', error);
    return NextResponse.json(
      { code: 'UNAVAILABLE', message: 'Calendar generation unavailable' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
