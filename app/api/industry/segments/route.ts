import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';

export const revalidate = 60;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const level = searchParams.get('level');

  const where: Prisma.IndustrySegmentWhereInput = {};
  if (level) where.level = level as Prisma.IndustrySegmentWhereInput['level'];

  const segments = await prisma.industrySegment.findMany({
    where,
    include: {
      _count: { select: { companies: true } },
    },
    orderBy: [{ level: 'asc' }, { category: 'asc' }],
  });

  return NextResponse.json(
    { data: segments },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    }
  );
}
