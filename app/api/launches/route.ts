import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { buildLaunchWhere, parsePositiveInt } from '@/lib/api/filter-params';

export const revalidate = 60;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parsePositiveInt(searchParams.get('page'), 1);
  const limit = parsePositiveInt(searchParams.get('limit'), 20);
  const where = buildLaunchWhere(searchParams);

  const [launches, total] = await Promise.all([
    prisma.launch.findMany({
      where,
      include: {
        rocket: { select: { id: true, name: true, country: true } },
        launchSite: { select: { id: true, name: true } },
        agency: { select: { id: true, name: true, country: true } },
        launchPad: { select: { id: true, name: true } },
        payloadRecords: {
          select: {
            id: true,
            name: true,
            type: true,
            orbit: true,
            owner: true,
            operator: true,
            noradId: true,
            internationalDesignator: true,
          },
          take: 6,
        },
      },
      orderBy: { date: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.launch.count({ where }),
  ]);

  return NextResponse.json(
    {
      data: launches,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    }
  );
}
