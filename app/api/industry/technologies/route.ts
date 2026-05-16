import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';

export const revalidate = 60;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');
  const category = searchParams.get('category');
  const maturity = searchParams.get('maturity');

  const where: Prisma.TechnologyWhereInput = {};
  if (category) where.category = category;
  if (maturity)
    where.maturityLevel = maturity as Prisma.TechnologyWhereInput['maturityLevel'];

  const [technologies, total] = await Promise.all([
    prisma.technology.findMany({
      where,
      orderBy: { name: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.technology.count({ where }),
  ]);

  return NextResponse.json(
    {
      data: technologies,
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
