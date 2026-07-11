import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { buildSpacecraftWhere, parsePositiveInt } from '@/lib/api/filter-params';

export const revalidate = 60;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parsePositiveInt(searchParams.get('page'), 1);
  const limit = parsePositiveInt(searchParams.get('limit'), 20);
  const where = buildSpacecraftWhere(searchParams);

  const [spacecraft, total] = await Promise.all([
    prisma.spacecraft.findMany({
      where,
      orderBy: { launchDate: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.spacecraft.count({ where }),
  ]);

  return NextResponse.json(
    {
      data: spacecraft,
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
