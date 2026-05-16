import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';

export const revalidate = 60;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const type = searchParams.get('type');
  const status = searchParams.get('status');
  const operator = searchParams.get('operator');

  const where: Prisma.SpacecraftWhereInput = {};
  if (type) where.type = type as Prisma.SpacecraftWhereInput['type'];
  if (status) where.status = status as Prisma.SpacecraftWhereInput['status'];
  if (operator) where.operator = operator;

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
