import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/launches/export?format=csv&country=china&status=PLANNED
 *
 * Exports filtered launch data as CSV for research/analysis.
 * Supports the same filter params as the launch list API.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get('country');
    const status = searchParams.get('status');
    const provider = searchParams.get('provider');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const limit = Math.min(Number(searchParams.get('limit')) || 500, 2000);

    const where: Record<string, unknown> = {};

    if (status) {
      const statuses = status.split(',').map((s) => s.trim().toUpperCase());
      where.status = { in: statuses };
    }

    if (from || to) {
      const dateFilter: Record<string, Date> = {};
      if (from) dateFilter.gte = new Date(from);
      if (to) dateFilter.lte = new Date(to);
      if (Object.keys(dateFilter).length > 0) where.date = dateFilter;
    }

    if (country) {
      where.OR = [
        { agency: { country: { contains: country, mode: 'insensitive' } } },
        { rocket: { country: { contains: country, mode: 'insensitive' } } },
        { launchSite: { country: { contains: country, mode: 'insensitive' } } },
      ];
    }

    if (provider) {
      where.agency = { name: { contains: provider, mode: 'insensitive' } };
    }

    const launches = await prisma.launch.findMany({
      where,
      select: {
        id: true,
        name: true,
        date: true,
        status: true,
        windowStart: true,
        windowEnd: true,
        missionType: true,
        orbitName: true,
        launchSite: { select: { name: true, country: true } },
        agency: { select: { name: true, country: true } },
        rocket: { select: { name: true } },
        lastSyncedAt: true,
        source: true,
      },
      orderBy: { date: 'desc' },
      take: limit,
    });

    // Build CSV
    const headers = [
      'ID',
      'Name',
      'Date (UTC)',
      'Status',
      'Window Start',
      'Window End',
      'Mission Type',
      'Orbit',
      'Provider',
      'Provider Country',
      'Rocket',
      'Launch Site',
      'Site Country',
      'Last Synced',
      'Source',
    ];

    const escapeCsv = (value: unknown): string => {
      if (value == null) return '';
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = launches.map((l) =>
      [
        l.id,
        l.name,
        l.date.toISOString(),
        l.status,
        l.windowStart?.toISOString() ?? '',
        l.windowEnd?.toISOString() ?? '',
        l.missionType ?? '',
        l.orbitName ?? '',
        l.agency?.name ?? '',
        l.agency?.country ?? '',
        l.rocket?.name ?? '',
        l.launchSite?.name ?? '',
        l.launchSite?.country ?? '',
        l.lastSyncedAt?.toISOString() ?? '',
        l.source ?? '',
      ].map(escapeCsv).join(',')
    );

    const csv = [headers.join(','), ...rows].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="space-launches-${new Date().toISOString().slice(0, 10)}.csv"`,
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('[launches/export] Failed:', error);
    return NextResponse.json(
      { code: 'UNAVAILABLE', message: 'Export is temporarily unavailable' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
