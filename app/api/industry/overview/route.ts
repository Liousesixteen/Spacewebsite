import { NextRequest, NextResponse } from 'next/server';
import { buildIndustryCoverage } from '@/lib/api/industry-coverage';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function GET(request: NextRequest) {
  const country = request.nextUrl.searchParams.get('country') || undefined;

  try {
    const segments = await prisma.industrySegment.findMany({
      include: {
        companies: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                country: true,
                type: true,
              },
            },
          },
        },
      },
      orderBy: [{ level: 'asc' }, { category: 'asc' }],
    });

    return NextResponse.json(
      {
        generatedAt: new Date().toISOString(),
        sourceStatus: 'ok',
        ...buildIndustryCoverage(segments, { country }),
      },
      {
        headers: {
          'Cache-Control':
            'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error) {
    console.error('[industry/overview] failed to load coverage:', error);
    return NextResponse.json(
      {
        generatedAt: new Date().toISOString(),
        sourceStatus: 'unavailable',
        message: 'Industry coverage is temporarily unavailable.',
        ...buildIndustryCoverage([]),
      },
      {
        status: 503,
        headers: { 'Cache-Control': 'no-store' },
      }
    );
  }
}
