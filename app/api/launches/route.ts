import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';

export const revalidate = 60;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const status = searchParams.get('status');
  const country = searchParams.get('country');
  const year = searchParams.get('year');

  const where: Prisma.LaunchWhereInput = {};
  if (status) where.status = status as Prisma.LaunchWhereInput['status'];
  if (country) where.rocket = { country };
  if (year) {
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${parseInt(year) + 1}-01-01`);
    where.date = { gte: startDate, lt: endDate };
  }

  const [launches, total] = await Promise.all([
    prisma.launch.findMany({
      where,
      include: {
        rocket: { select: { id: true, name: true, country: true } },
        launchSite: { select: { id: true, name: true } },
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
