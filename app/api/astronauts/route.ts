import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const nationality = searchParams.get('nationality');
  const agency = searchParams.get('agency');
  const status = searchParams.get('status');

  const where: Prisma.AstronautWhereInput = {};
  if (nationality) where.nationality = nationality;
  if (agency) where.agency = agency;
  if (status) where.status = status as Prisma.AstronautWhereInput['status'];

  const [astronauts, total] = await Promise.all([
    prisma.astronaut.findMany({
      where,
      orderBy: { name: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.astronaut.count({ where }),
  ]);

  return NextResponse.json({
    data: astronauts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
