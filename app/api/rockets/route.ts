import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';

export const revalidate = 60;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const country = searchParams.get('country');
  const status = searchParams.get('status');
  const manufacturer = searchParams.get('manufacturer');

  const where: Prisma.RocketWhereInput = {};
  if (country) where.country = country;
  if (status) where.status = status as Prisma.RocketWhereInput['status'];
  if (manufacturer) where.manufacturer = manufacturer;

  const [rockets, total] = await Promise.all([
    prisma.rocket.findMany({
      where,
      orderBy: { firstFlight: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.rocket.count({ where }),
  ]);

  return NextResponse.json(
    {
      data: rockets,
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
