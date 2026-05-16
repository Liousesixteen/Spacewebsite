import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');
  const country = searchParams.get('country');
  const type = searchParams.get('type');
  const segmentId = searchParams.get('segmentId');

  const where: Prisma.CompanyWhereInput = {};
  if (country) where.country = country;
  if (type) where.type = type as Prisma.CompanyWhereInput['type'];
  if (segmentId) where.segments = { some: { segmentId } };

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      include: {
        segments: {
          include: {
            segment: { select: { id: true, name: true, level: true } },
          },
        },
      },
      orderBy: { name: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.company.count({ where }),
  ]);

  return NextResponse.json({
    data: companies,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
