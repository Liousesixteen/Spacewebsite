import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { buildAstronautWhere, parsePositiveInt } from '@/lib/api/filter-params';

export const revalidate = 60;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parsePositiveInt(searchParams.get('page'), 1);
  const limit = parsePositiveInt(searchParams.get('limit'), 20);
  const where = buildAstronautWhere(searchParams);

  const [astronauts, total] = await Promise.all([
    prisma.astronaut.findMany({
      where,
      orderBy: { name: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.astronaut.count({ where }),
  ]);

  return NextResponse.json(
    {
      data: astronauts,
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
